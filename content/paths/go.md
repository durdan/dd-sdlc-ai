---
id: go
title: "Go: how it really runs"
promise: "What sits under a Go program: one static binary with its runtime, goroutines on a scheduler, channels and locks, how values are laid out and collected, and how net/http turns all of that into a server."
kind: skill
level: intermediate
tags: [languages, backend]
stages:
  - title: From source to binary
    blurb: The toolchain, modules, the runtime
    topics: [go-build, go-modules]
  - title: Values and types
    blurb: Slices, maps, interfaces, errors, generics
    topics: [go-slices-maps, go-interfaces, go-errors, go-generics]
  - title: Memory
    blurb: Stack or heap, and the collector
    topics: [go-memory, go-gc]
  - title: Many things at once
    blurb: Goroutines to an HTTP server
    topics: [go-goroutines, go-channels, go-sync, go-context, go-http]
bridges:
  - id: timeout
    why: "context.WithTimeout on every outbound call is the timeout pattern written into the standard library. Pass the deadline on, don't invent a new one per hop."
  - id: backpressure
    why: "A buffered channel is a bounded queue: when it is full, the sender waits. That is backpressure inside one process; the pattern applies the same idea between services."
  - id: bulkhead
    why: "A fixed pool of worker goroutines, or a semaphore channel per dependency, keeps one slow backend from using up every goroutine and connection you have."
next: [resilience-101, scaling-out]
---
Everything here is about the gc toolchain (the `go` command from go.dev) and Go 1.23 or later. The examples were run with Go 1.26; where a behaviour arrived in a specific release (range over integers in 1.22, `WaitGroup.Go` in 1.25, `errors.AsType` and the Green Tea collector by default in 1.26, generic methods in 1.27), the topic says so.
