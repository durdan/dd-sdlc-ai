---
id: go-goroutines
title: Goroutines and the scheduler
summary: Many goroutines, a few threads, and a P to run on
why: "Goroutines are cheap enough to start one per request, but they are not free and not magic. The scheduler model explains GOMAXPROCS, blocking system calls, and why a tight loop no longer freezes a program."
requires: [go-build]
lesson: none
points:
  - title: G, M and P
    text: "A G is a goroutine, an M is an operating-system thread, and a P is the right to run Go code. GOMAXPROCS sets the number of Ps."
  - title: Run queues and stealing
    text: Each P has a local queue of runnable goroutines. An idle P steals work from the others, so load spreads without a central lock.
  - title: Blocking doesn't waste a P
    text: Network waits park the goroutine on the netpoller. A blocking system call hands the P to another thread so other goroutines keep running.
  - title: Preemption since Go 1.14
    text: The runtime can interrupt a goroutine even in a loop without function calls, so one busy goroutine can't starve the rest.
quiz:
  - q: "What does GOMAXPROCS limit?"
    options:
      - The total number of goroutines
      - How many threads can execute Go code at the same moment
      - The number of operating-system threads the process may create
    answer: 1
    explain: "It is the number of Ps. Threads blocked in system calls or cgo don't hold a P, so a program can have more threads than GOMAXPROCS."
  - q: "Since Go 1.25, what is the default GOMAXPROCS in a Linux container limited to 2 CPUs on a 64-core host?"
    options:
      - "64, the number of logical CPUs"
      - "2, from the cgroup CPU limit"
      - "1"
    answer: 1
    explain: "Go 1.25 made the default respect the cgroup CPU bandwidth limit and update it if the limit changes. Before 1.25 it was the host's CPU count, which caused throttling."
  - q: "With GOMAXPROCS(1), one goroutine spins in for {} with no function calls. Does main still get to run?"
    options:
      - No, it is stuck forever
      - Yes, because the runtime preempts the loop asynchronously
      - Only if the loop calls runtime.Gosched()
    answer: 1
    explain: "Before Go 1.14 such a loop could block the scheduler. Since 1.14 the runtime interrupts it with a signal (on most platforms) and schedules something else."
links:
  - title: "The scheduler's design notes (runtime/proc.go)"
    url: https://go.dev/src/runtime/proc.go
  - title: "Go 1.25 release notes: container-aware GOMAXPROCS"
    url: https://go.dev/doc/go1.25
  - title: "Go 1.14 release notes: asynchronous preemption"
    url: https://go.dev/doc/go1.14
  - title: "Effective Go: goroutines"
    url: https://go.dev/doc/effective_go#goroutines
---
A goroutine is a function running independently, started with `go f()`. It is not an operating-system thread: the runtime multiplexes many goroutines onto a few threads, and starting one costs a few kilobytes of stack and a little bookkeeping. The scheduler that does this is described at the top of `runtime/proc.go` with three letters: **G** for a goroutine, **M** for a machine (an OS thread), and **P** for a processor, the resource a thread must hold to run Go code.

## The G-M-P model

- There are exactly `GOMAXPROCS` Ps. Each P has a **local run queue** of goroutines ready to run, and there is also a global queue.
- An M picks up a P and runs goroutines from its queue. When a goroutine blocks, the M moves on to the next one.
- A P whose queue is empty **steals** half of another P's queue. Work spreads without one central lock.
- `go f()` puts the new G on the current P's queue, so a burst of goroutines starts close to its parent.

`GOMAXPROCS` used to default to the number of logical CPUs. Since Go 1.25, on Linux it also respects the container's cgroup CPU limit and is updated if that limit changes, which stops Go services in Kubernetes from creating far more running threads than their CPU quota allows. Setting `GOMAXPROCS` yourself turns this off.

## When a goroutine blocks

- **Channels, locks, sleeps.** The goroutine is parked on that object and costs nothing until it is woken.
- **Network I/O.** Sockets are non-blocking underneath. A goroutine that waits for data is parked on the **netpoller** (epoll, kqueue or IOCP), and the runtime makes it runnable when the socket is ready. Ten thousand idle connections are ten thousand parked goroutines, not ten thousand blocked threads.
- **Blocking system calls and cgo.** File reads on many systems, and C code, really do block the thread. The runtime detaches the P from that thread and gives it to another M, starting a new thread if needed. That is why a Go program can have more threads than `GOMAXPROCS`.

## Preemption

Goroutines used to switch only at function calls and blocking operations, so a tight loop with no calls could hold a P forever and even delay garbage collection. Since Go 1.14 goroutines are **asynchronously preemptible**: on most platforms the runtime sends the thread a signal and switches goroutines at a safe point.

```go
package main

import (
	"fmt"
	"runtime"
	"time"
)

func main() {
	runtime.GOMAXPROCS(1) // one P: only one goroutine runs Go code at a time
	go func() {
		for { // a tight loop with no function calls
		}
	}()
	time.Sleep(10 * time.Millisecond) // the spinning goroutine gets the P
	fmt.Println("main still gets to run") // because the runtime preempts the loop
}
```

On Go 1.26 this prints its line and exits. Scheduling is fair enough, but not in any guaranteed order: never use sleeps or the order goroutines were started as synchronisation.

## Cheap, but not free

Each goroutine holds its stack and everything it references until it returns. A goroutine blocked forever on a channel nobody will send to is a **leak**: memory and often a socket. Every `go` statement should have an answer to "how does this end?", usually a closed channel or a cancelled context. Go 1.27 made a `goroutineleak` profile generally available (in `runtime/pprof` and at `/debug/pprof/goroutineleak`); it uses the garbage collector to find goroutines blocked on something no running goroutine can reach.
