---
id: go-memory
title: Stack or heap? Escape analysis
summary: The compiler decides where each value lives, not new or &
why: "Heap allocations are what the garbage collector has to clean up. Knowing why a value escapes lets you cut allocations on a hot path without guessing."
requires: [go-slices-maps]
lesson: none
points:
  - title: Location is not semantics
    text: A variable lives as long as something refers to it. Whether that storage is on the stack or the heap is the compiler's choice.
  - title: Escape analysis
    text: If the compiler can't prove a value is unused after the function returns, it puts the value on the heap. -gcflags=-m shows each decision.
  - title: Goroutine stacks grow
    text: Each goroutine starts with a stack of a few kilobytes. When it runs out, the runtime copies it to a bigger one and fixes up the pointers.
  - title: Common causes of escape
    text: Returning a pointer to a local, storing it somewhere long-lived, putting it in an interface, or a size the compiler can't know.
quiz:
  - q: "func newPoint() *point { p := point{1, 2}; return &p }. Is this a bug?"
    options:
      - Yes, it returns a pointer to a stack variable that is about to be freed
      - No; the compiler sees p outlive the call and allocates it on the heap
      - Only if the caller keeps the pointer
    answer: 1
    explain: "Go has no dangling pointers to locals. Escape analysis reports moved to heap: p, and the garbage collector frees it once nothing refers to it."
  - q: "Which flag prints the compiler's escape and inlining decisions?"
    options:
      - "go build -race"
      - "go build -gcflags=-m"
      - "GODEBUG=gctrace=1"
    answer: 1
    explain: "-gcflags=-m prints lines such as moved to heap: p and can inline sum. Repeat it (-m -m) for the reasons."
  - q: Why can a Go program run hundreds of thousands of goroutines?
    options:
      - Goroutines share one stack
      - Each one starts with a small stack that the runtime grows only when needed
      - Each goroutine's stack is allocated from the operating system on demand by the kernel
    answer: 1
    explain: "A new goroutine needs a few kilobytes. When a call would overflow the stack, the runtime allocates a larger one, copies the frames across and updates pointers into it."
links:
  - title: "Go FAQ: how do I know whether a variable is on the heap or the stack?"
    url: https://go.dev/doc/faq#stack_or_heap
  - title: "A Guide to the Go Garbage Collector: eliminating heap allocations"
    url: https://go.dev/doc/gc-guide#Eliminating_heap_allocations
  - title: "Go FAQ: why goroutines instead of threads?"
    url: https://go.dev/doc/faq#goroutines
---
Go doesn't make you say where a value lives. `new(T)`, `&T{}` and a plain local variable are all just values; the language only promises that each one exists for as long as something refers to it. The compiler decides placement with **escape analysis**: if it can prove a value is not used after its function returns, the value goes on the goroutine's stack, which is free to clean up. Otherwise it goes on the heap, and the garbage collector has to find and free it later.

## Watching the decisions

```go
package main

import "fmt"

type point struct{ x, y int }

func sum(p point) int { return p.x + p.y } // p stays on the stack

func newPoint() *point {
	p := point{1, 2}
	return &p // outlives the call: moved to the heap
}

func main() {
	fmt.Println(sum(point{3, 4}), newPoint().x)
}
```

```sh
$ go build -gcflags=-m .
./main.go:7:6: can inline sum
./main.go:9:6: can inline newPoint
./main.go:10:2: moved to heap: p
./main.go:15:17: ~r0 escapes to heap
...
```

(trimmed output from Go 1.26). `moved to heap: p` is the escape. The `escapes to heap` lines for `main` come from `fmt.Println`: its parameters are `...any`, and a value stored in an interface that the callee may keep must live on the heap. Add a second `-m` for the reasoning behind each decision.

Returning `&p` is not a bug in Go, as it would be in C. There are no dangling pointers to locals; the cost is an allocation.

## What makes values escape

- Returning or storing a pointer to a local where it can outlive the call: a global, a field of a heap object, a channel, a closure that outlives the function.
- Converting a value to an interface when the compiler can't see that the callee won't keep it. `fmt` and logging calls are the usual source.
- Sizes unknown at compile time, such as `make([]byte, n)` for a variable `n`, and values too large for the stack.
- Calls the compiler can't see through, such as calls through function values and interface methods, unless inlining or devirtualisation reveals the target.

Inlining matters: once `newPoint` is inlined into its caller, a pointer that doesn't leave the caller may not need the heap at all. The exact rules change between releases, so read `-m` output instead of memorising them, and measure with `go test -bench . -benchmem`, which reports allocations per operation.

## Goroutine stacks grow

An operating-system thread typically reserves a fixed stack of a megabyte or more. A goroutine starts with a few kilobytes. Each function's prologue checks whether there is enough room; if not, the runtime allocates a stack twice the size, copies the frames over, and adjusts pointers that point into the stack. Stacks can also shrink during garbage collection. This is why stack-allocated values are only reachable from their own goroutine, and why Go can't let C code hold pointers into a goroutine's stack.

Because growth is a copy, very deep recursion is slower than it looks. Recursion is bounded by a maximum stack size (1 GB on 64-bit systems by default, adjustable with `debug.SetMaxStack`), and a runaway recursion ends with `runtime: goroutine stack exceeds 1000000000-byte limit` and `fatal error: stack overflow` rather than a segmentation fault.
