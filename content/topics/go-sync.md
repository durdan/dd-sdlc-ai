---
id: go-sync
title: The sync package and the race detector
summary: Mutexes, WaitGroups and atomics, and a tool that finds what you missed
why: "A data race in Go is undefined behaviour waiting to happen: wrong totals, torn values, crashed maps. The race detector finds them while tests run, if you ask it to."
requires: [go-goroutines]
lesson: none
points:
  - title: Mutex for shared state
    text: Lock, change the data, unlock. sync.RWMutex lets many readers in at once when writes are rare.
  - title: WaitGroup to wait for goroutines
    text: Count goroutines in and out, then Wait. Go 1.25 added wg.Go(f), which does the counting for you.
  - title: Atomics for single values
    text: sync/atomic types such as atomic.Int64 update one value without a lock and make the update visible to other goroutines.
  - title: go test -race
    text: Builds the program with instrumentation that reports two goroutines touching the same memory without synchronisation, with both stack traces.
quiz:
  - q: "Without -race, a program that does an unsynchronised counter++ from 1,000 goroutines printed 1000. Is it correct?"
    options:
      - Yes, the output is right
      - "No; it is still a data race, and the result just happened to be right on this run"
      - Yes, because ++ on an int is atomic in Go
    answer: 1
    explain: "++ is a read, an add and a write. Whether updates are lost depends on timing; with GOMAXPROCS=1 they often aren't. The race detector reports the race whatever the result."
  - q: "What does the race detector not find?"
    options:
      - Races in code paths that never ran during the test
      - Races on map entries
      - Races between a goroutine and main
    answer: 0
    explain: "It watches memory accesses as they happen, so it only reports races that occur in that run. Run your tests with -race, and run a race-enabled build under realistic load."
  - q: "Why must a struct containing a sync.Mutex not be copied after use?"
    options:
      - Copying is slow
      - "The copy has its own lock state, so the two copies no longer exclude each other"
      - It does not compile
    answer: 1
    explain: "A Mutex is a value. Copying a struct copies the lock too, possibly in the locked state. Pass such structs by pointer; go vet's copylocks check catches most mistakes."
links:
  - title: Data race detector
    url: https://go.dev/doc/articles/race_detector
  - title: The Go memory model
    url: https://go.dev/ref/mem
  - title: "sync package documentation"
    url: https://pkg.go.dev/sync
---
Channels are not the only tool. The `sync` and `sync/atomic` packages provide the lower-level pieces: mutexes, wait groups, `Once`, pools and atomic values. The Go memory model says when one goroutine is guaranteed to see another's writes, and these types are how you create those guarantees. When you miss one, you have a **data race**, and the race detector built into the toolchain is the way to find it.

## A race, found

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var mu sync.Mutex
	racy, safe := 0, 0
	for range 1000 {
		wg.Go(func() { // Go 1.25+: Add(1), go, Done() in one call
			racy++ // data race: unsynchronised read-modify-write
			mu.Lock()
			safe++
			mu.Unlock()
		})
	}
	wg.Wait()
	fmt.Println("safe:", safe, "racy:", racy)
}
```

One run on a 16-core machine printed `safe: 1000 racy: 958`. With `GOMAXPROCS=1` it printed 1000 every time in five runs, and even on 16 cores an occasional run came out right: that is how races survive testing. `go run -race .` reports the problem regardless (output shortened):

```text
WARNING: DATA RACE
Read at 0x00c0000120f0 by goroutine 11:
  main.main.func1()
      main.go:14 +0x38
Previous write at 0x00c0000120f0 by goroutine 7:
  main.main.func1()
      main.go:14 +0x48
...
Found 1 data race(s)
exit status 66
```

The detector instruments every memory access and tracks which accesses are ordered by synchronisation. It only sees races that actually happen in that run, so its value depends on coverage. It costs roughly 2–20× in time and 5–10× in memory, so it is for tests and staging, not production. Use `go test -race ./...` in CI.

## The tools

- **`sync.Mutex`** guards a critical section. Keep the section short and don't call out to unknown code while holding the lock. `defer mu.Unlock()` right after `Lock` keeps it correct when the function returns early or panics.
- **`sync.RWMutex`** allows many concurrent readers or one writer. It only helps when reads dominate and the critical section is not tiny.
- **`sync.WaitGroup`** waits for a group of goroutines. `wg.Go(f)` (Go 1.25) replaces the `Add(1)`/`go`/`defer Done()` pattern, and the new `go vet` check `waitgroup` reports `Add` called inside the goroutine, where it is too late.
- **`sync.Once`** runs initialisation exactly once; `sync.OnceValue` (Go 1.21) also returns its result.
- **`sync/atomic`** types (`atomic.Int64`, `atomic.Bool`, `atomic.Pointer[T]`) do a single read, write, add or compare-and-swap atomically, with the same visibility guarantee as a lock. Good for counters and flags; anything with two related fields needs a mutex.
- **`sync.Pool`** reuses temporary objects such as buffers to reduce garbage. Anything in a pool may be removed at any time without notice, so it is a cache, not storage.

All of these must not be copied after first use: copying a struct copies its lock state. Pass such structs by pointer; `go vet` reports most copies.

## The memory model, briefly

If a goroutine writes a variable and another reads it, the read is only guaranteed to see the write if something orders them: a channel send before the matching receive completes, an `Unlock` before the next `Lock`, a `wg.Done` before `Wait` returns, or an atomic operation. Without such an edge the program has a data race. Go's memory model guarantees much less for racy programs, and a race on a map, slice or interface can corrupt memory and crash the process.
