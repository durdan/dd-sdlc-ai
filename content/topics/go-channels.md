---
id: go-channels
title: "Channels and select"
summary: Typed pipes between goroutines that also synchronise them
why: "Channels let goroutines hand work and results to each other with no shared variables. Knowing exactly when a send or receive blocks, and what close means, is the difference between a clean pipeline and a deadlock."
requires: [go-goroutines]
lesson: none
points:
  - title: Share memory by communicating
    text: Instead of several goroutines guarding one variable with a lock, pass the value over a channel so only one goroutine owns it at a time.
  - title: Unbuffered means rendezvous
    text: A send on an unbuffered channel waits until a receiver takes the value. A buffered channel lets sends go ahead until the buffer is full.
  - title: Close is a broadcast from the sender
    text: After close, receivers get the remaining buffered values and then the zero value with ok false. Sending on a closed channel panics.
  - title: select waits on several at once
    text: It runs whichever case is ready, picks at random if several are, and with a default case never blocks.
quiz:
  - q: "What happens when you send on a closed channel?"
    options:
      - The value is silently dropped
      - The send blocks forever
      - A run-time panic
    answer: 2
    explain: "Closing says no more values will come, so a later send is a bug and panics. That is why the sending side, the one that knows when it's done, should close."
  - q: "ch is buffered, holds one value, and is then closed. What do two receives return?"
    options:
      - "The value with ok true, then the zero value with ok false"
      - "The zero value with ok false both times"
      - The first receive panics
    answer: 0
    explain: "Values sent before close are still delivered. Only once the buffer is drained do receives return the zero value and ok == false without blocking."
  - q: "In a select, why might you set a channel variable to nil?"
    options:
      - To close it
      - "A nil channel is never ready, so that case is switched off while the others keep working"
      - To free its buffer
    answer: 1
    explain: "Sends and receives on a nil channel block forever, so in a select the case simply never fires. It is the usual way to stop reading from an input that has been closed."
links:
  - title: "Share memory by communicating (Go blog codewalk)"
    url: https://go.dev/blog/codelab-share
  - title: "The Go spec: channel types, close and select statements"
    url: https://go.dev/ref/spec#Select_statements
  - title: "Go concurrency patterns: pipelines and cancellation"
    url: https://go.dev/blog/pipelines
---
A channel is a typed conduit that one goroutine sends values into and another receives them from. It does two jobs at once: it moves data, and it synchronises, because a send or receive can wait for the other side. That gives Go its slogan for concurrent code: don't communicate by sharing memory; share memory by communicating. A value that has been sent belongs to the receiver now, so no lock is needed around it.

## Blocking rules

- **Unbuffered** (`make(chan T)`): a send waits until a receiver takes the value, and a receive waits for a sender. The hand-off is a meeting point.
- **Buffered** (`make(chan T, n)`): sends succeed while the buffer has room, and receives succeed while it holds values. When it is full, the sender waits: a buffered channel is a bounded queue, with backpressure built in.
- **nil channel**: sends and receives block forever.
- **closed channel**: receives never block (they return the zero value once drained); sends and a second `close` panic.

```go
package main

import (
	"fmt"
	"time"
)

func produce(n int) <-chan int {
	out := make(chan int) // unbuffered: each send waits for a receiver
	go func() {
		defer close(out) // the sender closes, so range below can end
		for i := range n {
			out <- i * i
		}
	}()
	return out
}

func main() {
	for v := range produce(4) {
		fmt.Print(v, " ")
	}
	fmt.Println()

	jobs := make(chan string, 2) // buffered: two sends succeed with no receiver
	jobs <- "a"
	jobs <- "b"
	fmt.Println(len(jobs), cap(jobs))

	slow := make(chan string)
	go func() {
		time.Sleep(50 * time.Millisecond)
		slow <- "done"
	}()
	select {
	case msg := <-slow:
		fmt.Println(msg)
	case <-time.After(10 * time.Millisecond):
		fmt.Println("timed out")
	}

	close(jobs)
	v, ok := <-jobs
	fmt.Println(v, ok) // buffered values are still delivered after close
	<-jobs
	v, ok = <-jobs
	fmt.Printf("%q %v\n", v, ok) // drained and closed: zero value, false
}
```

This prints `0 1 4 9`, `2 2`, `timed out`, `a true` and `"" false`. The return type `<-chan int` is receive-only, so callers can't send on it or close it. Note one small leak: after the timeout, the goroutine sending on `slow` blocks forever, because nobody receives. Making `slow` buffered with room for one value lets it finish.

## Who closes

Close only to tell receivers "no more values", and only from the sending side: a `for v := range ch` loop ends when the channel is closed and drained. You don't have to close a channel to free it; an unreachable channel is collected like anything else. With several senders, close after all of them are done, typically from a goroutine that waits on a `sync.WaitGroup`.

## select

`select` waits until one of its cases can proceed. If several can, it picks one uniformly at random, so no case can starve the others. A `default` case makes it non-blocking. Common uses:

- **Timeouts**: a case on `time.After(d)` or, better, on `ctx.Done()`.
- **Cancellation**: every loop that sends should also select on a "stop" channel or a context, or it may block forever once the receiver gives up.
- **Turning off a case**: set a channel variable to `nil` and its case never fires.

## Channel or mutex?

Channels suit handing over ownership, pipelines, fan-out to workers and signalling. A mutex is simpler for protecting a small piece of shared state such as a counter or a cache map. Use whichever makes the code shorter and clearer.
