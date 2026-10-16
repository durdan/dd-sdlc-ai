---
id: go-build
title: One binary, runtime included
summary: go build links your code and the runtime into one file
why: "Knowing what is in the binary explains why Go containers can be tiny, why cross-compiling is one environment variable, and where goroutines and the collector come from."
lesson: none
points:
  - title: Compiled ahead of time
    text: The gc compiler turns each package into machine code and the linker joins them into one executable. There is no VM and no bytecode at run time.
  - title: The runtime is linked in
    text: Every binary carries the Go runtime, which provides the scheduler, the garbage collector, stack management and maps. It is a library, not a separate process.
  - title: Static by default
    text: Go code is linked statically. With cgo turned off on Linux the result needs no shared libraries at all, so it runs in an empty container.
  - title: Cross-compiling is built in
    text: Set GOOS and GOARCH and the same toolchain builds for another operating system or CPU.
quiz:
  - q: "What is in the executable that go build produces?"
    options:
      - Bytecode that a Go virtual machine interprets
      - Machine code for your packages, the standard library you use, and the Go runtime
      - Only your code; the runtime is a shared library installed with Go
    answer: 1
    explain: "The gc linker links statically by default, so the runtime (scheduler, garbage collector, stack management) is part of every binary. That is why a hello world is a couple of megabytes."
  - q: "You want a Linux binary with no dependency on the system C library. What do you set?"
    options:
      - "GOOS=linux and CGO_ENABLED=0"
      - "GOFLAGS=-static"
      - Nothing; every Go binary is fully static on every platform
    answer: 0
    explain: "With cgo enabled, packages such as net and os/user may call into libc, which links it dynamically. CGO_ENABLED=0 uses the pure-Go versions. macOS binaries always link the system's libSystem."
  - q: "How many goroutines does runtime.NumGoroutine() report at the start of main in a program that has started none?"
    options:
      - "0"
      - "1, the goroutine running main"
      - One per CPU
    answer: 1
    explain: "main itself runs on a goroutine. The runtime's own background workers, such as the ones for the collector, are not counted."
links:
  - title: "Go FAQ: does Go have a runtime? and why is my binary large?"
    url: https://go.dev/doc/faq
  - title: "cmd/go: build, run, install and the environment"
    url: https://pkg.go.dev/cmd/go
  - title: "Installing Go from source: valid GOOS and GOARCH values"
    url: https://go.dev/doc/install/source
---
`go build` compiles your packages ahead of time into machine code and links them, together with every standard-library package they import and the Go runtime, into a single executable. Nothing else has to be installed on the machine that runs it. Most of what makes Go feel different at run time, from cheap goroutines to the garbage collector, lives in that runtime, which is just a library linked into every program.

## What a build does

The `go` command finds the packages your `main` package imports, compiles each one (caching the results, so rebuilds are fast) and hands the object files to the linker. Imports are checked by the compiler: an unused import is an error, which keeps the dependency graph honest.

```go
package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println(runtime.Version(), runtime.GOOS+"/"+runtime.GOARCH)
	fmt.Println("CPUs:", runtime.NumCPU(), "GOMAXPROCS:", runtime.GOMAXPROCS(0))
	fmt.Println("goroutines already running:", runtime.NumGoroutine())
}
```

On an Apple-silicon Mac with Go 1.26 this printed `go1.26.1 darwin/arm64`, the CPU count twice, and one goroutine: the one running `main`.

## The runtime is part of your program

Go's runtime plays roughly the part libc plays for C, but it does much more. It schedules goroutines onto operating-system threads, grows and shrinks their stacks, runs the concurrent garbage collector, implements maps and channels, and prints the stack traces you see on a panic. It starts before `main` and its background work runs on threads it manages. That is why a trivial program is a couple of megabytes: the FAQ points out that the binary also carries the type information needed for reflection and panics.

## Static, mostly

The gc linker links Go code statically. Two things can pull in the system C library dynamically:

- **cgo.** If cgo is enabled, some standard packages (DNS lookups in `net`, user lookups in `os/user`) may use the C versions. Building with `CGO_ENABLED=0` uses the pure-Go ones.
- **The platform.** macOS requires programs to go through `libSystem`, so Mac binaries always link it.

```sh
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app ./cmd/app
file app            # ELF 64-bit LSB executable, x86-64, statically linked
go version -m app   # the Go version and module versions it was built from
```

A static Linux binary can be copied into a `scratch` or distroless container image with nothing else in it, apart from CA certificates if it makes TLS calls and time-zone data if it needs it (or import `time/tzdata` to embed it).

## Cross-compiling

Because the compiler and linker are written in Go and the standard library has no C dependency when cgo is off, building for another target is just `GOOS` and `GOARCH`. `go tool dist list` prints every supported pair. Build tags and file suffixes such as `_linux.go` or `_arm64.go` select platform-specific files.

## go run, go install, go vet

- `go run .` builds into a temporary directory and runs the result: handy, but it is still a full compile.
- `go install` puts the binary in `$GOBIN` (by default `$HOME/go/bin`).
- `go vet` runs static checks that catch real bugs, such as `Printf` format mismatches, copied locks and `Add` called inside a `WaitGroup` goroutine. `go test` runs a subset of them automatically.
