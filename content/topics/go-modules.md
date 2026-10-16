---
id: go-modules
title: Modules and the toolchain
summary: go.mod names your module and pins what it needs
why: "Builds that are reproducible on every machine come from two small files, go.mod and go.sum. Knowing how versions are chosen saves you from surprise upgrades and broken CI."
requires: [go-build]
lesson: none
points:
  - title: A module is a versioned tree of packages
    text: go.mod at the root names the module path, the minimum Go version, and the minimum version of every dependency.
  - title: Minimal version selection
    text: For each dependency Go picks the highest of the minimum versions anyone requires, never the newest one available. Builds don't change when a new release appears.
  - title: go.sum is a lock on content
    text: It records a cryptographic hash of every module version used. The go command checks downloads against it and against the public checksum database.
  - title: The go line can switch toolchains
    text: Since Go 1.21 the go line is a minimum requirement, and by default an older go command downloads and runs a newer toolchain when a module asks for one.
quiz:
  - q: "Your module requires lib v1.2.0. Another dependency requires lib v1.4.0. v1.9.0 is the latest release. Which version is built?"
    options:
      - v1.9.0, the latest
      - v1.4.0, the highest minimum that anything requires
      - v1.2.0, the version your own go.mod names
    answer: 1
    explain: "Minimal version selection takes the maximum of the required minimums. You only get v1.9.0 if someone asks for it, for example with go get lib@latest."
  - q: "What does the go 1.24.0 line in a go.mod mean with a modern go command?"
    options:
      - The module may only be built with exactly Go 1.24.0
      - "Go 1.24.0 is the minimum; language features and some defaults follow that version"
      - It is a comment for humans and has no effect
    answer: 1
    explain: "Since Go 1.21 the go line is a requirement. Newer toolchains build the module, and use it to decide language semantics such as the per-iteration loop variables of Go 1.22."
  - q: "How do you publish an incompatible v2 of example.com/lib?"
    options:
      - Tag v2.0.0; nothing else changes
      - Change the module path to example.com/lib/v2, so both major versions can be imported side by side
      - Create a new repository
    answer: 1
    explain: "Semantic import versioning: from v2 on the major version is part of the module path. Importers write example.com/lib/v2, and v1 and v2 are different modules to the go command."
links:
  - title: Go Modules Reference
    url: https://go.dev/ref/mod
  - title: Go Toolchains (the go and toolchain lines, GOTOOLCHAIN)
    url: https://go.dev/doc/toolchain
  - title: Managing dependencies
    url: https://go.dev/doc/modules/managing-dependencies
---
A Go module is a tree of packages with a `go.mod` file at its root. That file gives the module its import path and lists the minimum version of each module it depends on; `go.sum` next to it records a hash of each one. With just these two files, the `go` command can download exactly the same code on every machine and refuse anything that has been tampered with.

## go.mod

```text
module example.com/shop

go 1.24.0

require (
	github.com/google/uuid v1.6.0
	golang.org/x/sync v0.10.0
)

tool golang.org/x/tools/cmd/stringer
```

- `module` is the path other code imports. For public code it is usually where the repository lives.
- `go` is the minimum Go version. It also selects language semantics: a module that says `go 1.22` or later gets a new loop variable per iteration, for example.
- `require` lists minimum versions. Since Go 1.17 indirect dependencies are listed too (marked `// indirect`), so the go command can load a smaller module graph.
- `tool` (Go 1.24+) records a command-line tool you run with `go tool stringer`. It replaces the old `tools.go` file with blank imports.

`go mod tidy` adds what your imports need and drops what they don't. `go get pkg@v1.7.0` changes one requirement.

## How versions are chosen

Go uses **minimal version selection**. It walks the requirement graph and, for each module, takes the highest version that anything in the graph *requires*. It never picks a newer release on its own. A new upstream release cannot change your build until somebody edits a `go.mod`, which is why Go has no separate lock file: `go.mod` already decides the versions, and `go.sum` locks their contents.

Major versions follow **semantic import versioning**: from v2 on, the major version is part of the path (`example.com/lib/v2`). A program can import v1 and v2 at once, because they are different modules.

## Where code comes from

By default modules are downloaded through `https://proxy.golang.org`, falling back to the source repository (`GOPROXY=https://proxy.golang.org,direct`). Each new hash is checked against `sum.golang.org`, a public, append-only log, so a dependency can't be quietly replaced. For private code, set `GOPRIVATE=corp.example.com/*`: matching modules are fetched directly and not looked up in the public log.

## The toolchain is a dependency too

Since Go 1.21, if `go.mod` says `go 1.27.0` and your installed `go` is older, the default `GOTOOLCHAIN=auto` makes it download that toolchain (itself a module) and run it. An optional `toolchain` line names a preferred newer version for work inside the module. Set `GOTOOLCHAIN=local` to forbid switching; the build then fails instead. Some repackaged Go distributions change this default, and `go env GOTOOLCHAIN` shows the value in effect.

## Workspaces

To work on two modules together without editing `replace` lines, `go work init ./shop ./lib` creates a `go.work` file that makes the go command use your local copies. Usually it is not committed.
