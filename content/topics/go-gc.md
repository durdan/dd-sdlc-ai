---
id: go-gc
title: "The garbage collector: GOGC and GOMEMLIMIT"
summary: Concurrent mark-sweep, tuned with two knobs
why: "Go's collector has almost no settings, and that is deliberate. The two it has decide how much memory you trade for CPU, and the second one keeps containers from being killed for running out of memory."
requires: [go-memory]
lesson: none
points:
  - title: Concurrent, non-moving mark-sweep
    text: The collector marks reachable objects while your goroutines keep running, then sweeps the rest. Objects are never moved, and pauses are short.
  - title: GOGC sets the pace
    text: With the default GOGC=100, the next cycle starts when the heap has grown by about as much as was live after the last one. Doubling GOGC roughly halves GC CPU and doubles the extra memory.
  - title: GOMEMLIMIT is a soft ceiling
    text: Since Go 1.19 you can set a total memory limit. Near it the collector runs more often, but it caps its own CPU use instead of thrashing.
  - title: Green Tea by default
    text: Go 1.26 made the Green Tea collector the default. It scans small objects page by page; many programs spend around 10 percent less time in GC, and some up to 40 percent less.
quiz:
  - q: "After a collection, 100 MiB of the heap is live. With GOGC=100, roughly when does the next cycle start?"
    options:
      - When the total heap reaches about 200 MiB
      - After 100 ms
      - When the operating system reports memory pressure
    answer: 0
    explain: "The heap target is the live heap plus GOGC percent of it (plus the GC roots, since Go 1.18). With GOGC=100 that is about double the live heap."
  - q: "A service runs in a container with a 1 GiB memory limit. What is a sensible start?"
    options:
      - "GOGC=off on its own"
      - "GOMEMLIMIT a little under 1 GiB, such as 900MiB, keeping GOGC at its default"
      - "GOMEMLIMIT=1GiB and GOGC=10"
    answer: 1
    explain: "The limit lets the heap grow when there is room and makes the collector work harder near the ceiling. Leave 5 to 10 percent headroom for memory the Go runtime doesn't track."
  - q: "What happens if the live heap alone is bigger than GOMEMLIMIT?"
    options:
      - The program panics
      - The runtime exceeds the limit, because it is soft; GC CPU is capped at about half to avoid thrashing
      - The runtime frees live objects
    answer: 1
    explain: "The limit is a target, not a guarantee. The runtime caps the collector's CPU so the program keeps making progress, and memory use goes over the limit."
links:
  - title: A Guide to the Go Garbage Collector
    url: https://go.dev/doc/gc-guide
  - title: The Green Tea garbage collector (Go blog)
    url: https://go.dev/blog/greenteagc
  - title: "Go 1.26 release notes: the new garbage collector"
    url: https://go.dev/doc/go1.26
---
Go's garbage collector is a concurrent, non-moving, mark-sweep collector. It finds every object reachable from the roots (goroutine stacks, globals) while your goroutines keep running, with only short stop-the-world phases at the start and end of marking, and then makes the unmarked memory available again. Unlike the JVM it has no generations and only two settings, `GOGC` and `GOMEMLIMIT`. Together they pick a point on one trade-off: more memory, or more CPU spent collecting.

## What a cycle costs

The work of marking is proportional to the **live** heap (plus the stacks and globals it has to scan), not to how much garbage there is. So the cost of collecting depends on how often cycles run, and that is what `GOGC` controls:

```text
heap target = live heap + (live heap + GC roots) × GOGC / 100
```

With the default `GOGC=100` and 100 MiB live, the next cycle starts when the heap reaches about 200 MiB. `GOGC=200` lets it reach about 300 MiB and runs about half as many cycles; `GOGC=50` uses less memory and more CPU. `GOGC=off` disables collection unless a memory limit is set.

You can watch it:

```sh
$ GODEBUG=gctrace=1 ./app
gc 1 @0.004s 2%: 0.22+0.49+0.038 ms clock, ... 3->5->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 16 P
```

Read it as: the first cycle, 4 ms after start, 2% of CPU used by GC so far; wall time of the short pause, the concurrent mark and the second pause; the heap at the start of the cycle, at the end, and live afterwards; and the goal for the next one.

## GOMEMLIMIT

A proportional target has a weakness: a brief spike in live data doubles the heap target too, and in a container that can mean being killed for running out of memory. Go 1.19 added a memory limit (`GOMEMLIMIT=900MiB` or `debug.SetMemoryLimit`) covering all memory the runtime manages, not just the heap. As usage approaches it, the collector runs more often regardless of `GOGC`.

The limit is **soft**. If the live heap really needs more, the runtime would rather exceed the limit than spend all its time collecting: it caps GC CPU at roughly 50% over a time window. A common setup for a service with a container limit is the default `GOGC` plus `GOMEMLIMIT` about 5–10% below the container's limit. Some teams also use `GOGC=off` with a limit, so the program only collects as it gets close to the ceiling. That is efficient, but only safe if nothing else shares the memory.

```go
debug.SetGCPercent(100)        // same as GOGC=100, the default
debug.SetMemoryLimit(64 << 20) // same as GOMEMLIMIT=64MiB
```

## Green Tea (Go 1.26)

Go 1.25 shipped an experimental collector called Green Tea, and Go 1.26 made it the default. Instead of putting individual objects on its work list, it tracks and scans whole 8 KiB pages of small objects, which uses the CPU cache far better and scales better across cores. The Go team reports that many workloads spend around 10% less time in GC, and some up to 40%. Nothing changes in how you tune it: `GOGC` and `GOMEMLIMIT` work the same way. In Go 1.26, building with `GOEXPERIMENT=nogreenteagc` turned it off; the release notes said that opt-out was expected to go in Go 1.27.

## Reducing GC work

The settings only trade memory for CPU. To reduce the total work, allocate less: avoid escapes on hot paths, preallocate slices whose size you know, reuse buffers (a `sync.Pool` for short-lived objects), and keep long-lived data pointer-free where you can, since the collector doesn't need to scan memory that contains no pointers. Profile allocations with `go test -bench . -benchmem` or the heap profile in `net/http/pprof` before changing anything.
