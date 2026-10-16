---
id: go-errors
title: Errors are values
summary: Return them, wrap them with %w, inspect them with errors.Is and As
why: "Go has no exceptions for ordinary failures. Good error handling is ordinary code: add context on the way up, and let callers check what went wrong without parsing strings."
requires: [go-interfaces]
lesson: none
points:
  - title: Just an interface
    text: error is an interface with one method, Error() string. Functions return it as their last result and callers check it.
  - title: Wrap with %w
    text: fmt.Errorf with %w adds context and keeps the original error inside, reachable through Unwrap.
  - title: Is and As look through wrappers
    text: errors.Is compares against a sentinel value; errors.As finds an error of a given type. Both walk the whole chain.
  - title: panic is for bugs
    text: panic unwinds the stack and crashes the program unless recovered. Use it for impossible states, not for a missing file.
quiz:
  - q: "err is fmt.Errorf(\"load: %w\", fs.ErrNotExist). Which check is true?"
    options:
      - "err == fs.ErrNotExist"
      - "errors.Is(err, fs.ErrNotExist)"
      - Neither; wrapping loses the original error
    answer: 1
    explain: "The wrapped error is a new value, so == fails. errors.Is unwraps the chain and finds fs.ErrNotExist inside."
  - q: "What is the difference between %v and %w in fmt.Errorf?"
    options:
      - None, they print the same text
      - "Both print the same text, but only %w keeps the error so errors.Is and errors.As can find it"
      - "%w panics if the argument is nil"
    answer: 1
    explain: "%v flattens the error into a string. %w makes the result implement Unwrap, which is what makes the original error part of your API; choose deliberately."
  - q: Which situation calls for panic rather than returning an error?
    options:
      - A user uploads a file in the wrong format
      - A database connection drops
      - A switch reaches a case that the code's own invariants say is impossible
    answer: 2
    explain: "Expected failures are values the caller handles. panic signals a programming error. net/http recovers panics in handlers, but other goroutines crash the process."
links:
  - title: "Working with errors in Go 1.13 (Is, As and %w)"
    url: https://go.dev/blog/go1.13-errors
  - title: "errors package documentation"
    url: https://pkg.go.dev/errors
  - title: "Go 1.26 release notes (errors.AsType)"
    url: https://go.dev/doc/go1.26
---
In Go a failure is a value. `error` is an ordinary interface with one method, `Error() string`, and a function that can fail returns one as its last result. There is no hidden control flow: the caller sees `if err != nil` and decides what to do. The standard library adds a convention on top: wrap an error to add context, and inspect the chain with `errors.Is` and `errors.As` rather than by matching strings.

## Wrapping and inspecting

```go
package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
)

var ErrNoConfig = errors.New("no config")

func loadConfig(path string) error {
	_, err := os.ReadFile(path)
	if errors.Is(err, fs.ErrNotExist) {
		return fmt.Errorf("load %s: %w", path, ErrNoConfig)
	}
	if err != nil {
		return fmt.Errorf("load %s: %w", path, err)
	}
	return nil
}

func main() {
	err := loadConfig("/nope/app.toml")
	fmt.Println(err)
	fmt.Println(errors.Is(err, ErrNoConfig))

	_, err = os.Open("/nope/app.toml")
	err = fmt.Errorf("startup: %w", err)
	var pe *fs.PathError
	if errors.As(err, &pe) {
		fmt.Println("op:", pe.Op, "path:", pe.Path)
	}
	if pe, ok := errors.AsType[*fs.PathError](err); ok { // Go 1.26+
		fmt.Println("same with AsType:", pe.Err)
	}
}
```

This prints `load /nope/app.toml: no config`, `true`, `op: open path: /nope/app.toml`, and `same with AsType: no such file or directory`.

- **Sentinel errors** such as `ErrNoConfig` or `io.EOF` are package-level values. Check them with `errors.Is`, which follows `Unwrap` through every layer.
- **Error types** such as `*fs.PathError` carry fields. `errors.As` finds the first error in the chain that has that type and stores it in your variable. Go 1.26 added `errors.AsType`, a generic version that returns the value directly and is checked at compile time.
- **`%w`** makes the result unwrappable; `%v` only copies the text. Wrapping exposes the inner error as part of your API, so wrap when callers should be able to depend on it.
- **`errors.Join`** (Go 1.20) combines several errors into one; `Is` and `As` check each of them.

## Adding context

Each layer should say what *it* was doing: `fmt.Errorf("charge order %s: %w", id, err)`. Read from the top, the message becomes a trail such as `charge order 42: call payments: context deadline exceeded`. Don't log and return the same error: it gets reported twice. Handle it once, at the level that can do something about it.

## panic and recover

`panic` stops the normal flow, runs deferred calls as it unwinds the goroutine's stack, and crashes the program with a stack trace if nothing calls `recover`. `recover` only works inside a deferred function. Reserve panics for bugs (an index out of range, a nil map write, an impossible case) and for failures during start-up. `net/http` recovers a panic in a handler and logs it, but a panic in a goroutine you started yourself takes down the whole process. A library shouldn't let a panic escape its API.

Deferred calls also run on a normal return, which is why `defer f.Close()` right after a successful `Open` is the usual way to release resources.
