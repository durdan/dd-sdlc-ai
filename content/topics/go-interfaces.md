---
id: go-interfaces
title: Interfaces and the nil interface trap
summary: Satisfied implicitly; a pair of type and value at run time
why: "Interfaces are how Go code is decoupled and tested. One detail of how they are stored, a type next to a value, causes the most famous Go bug: a nil error that isn't nil."
requires: [go-build]
lesson: none
points:
  - title: Implicit satisfaction
    text: A type implements an interface by having its methods. There is no implements keyword, so the consumer can define the small interface it needs.
  - title: Two words at run time
    text: An interface value holds a dynamic type and a value. It equals nil only when both are unset.
  - title: Nil pointer inside, non-nil outside
    text: Returning a typed nil pointer as an error gives a non-nil error. Return a literal nil instead.
  - title: Method sets decide
    text: Methods with pointer receivers belong to *T, not T, so only a *T satisfies an interface that needs them.
quiz:
  - q: What does main print?
    code: |
      type MyErr struct{}
      func (*MyErr) Error() string { return "bad" }

      func check() error {
          var p *MyErr
          return p
      }

      func main() { fmt.Println(check() == nil) }
    options:
      - "true"
      - "false"
      - It doesn't compile
    answer: 1
    explain: "The returned interface holds (type *MyErr, value nil). The type is set, so it is not equal to nil. Return nil directly on the success path."
  - q: "Type T has func (t *T) Close() error. Which value satisfies io.Closer?"
    options:
      - "T{}"
      - "&T{}"
      - Both
    answer: 1
    explain: "A method with a pointer receiver is in the method set of *T only. A T stored in an interface isn't addressable, so Go can't call the pointer method on it."
  - q: "Where should a small interface such as type Store interface { Get(id string) (Item, error) } usually be declared?"
    options:
      - In the package that implements it, next to the concrete type
      - In the package that uses it, listing only the methods it calls
      - In a shared interfaces package
    answer: 1
    explain: "Because satisfaction is implicit, the consumer can declare exactly what it needs and any type with those methods fits, including a fake in a test."
links:
  - title: "Go FAQ: why is my nil error value not equal to nil?"
    url: https://go.dev/doc/faq#nil_error
  - title: "The Go spec: interface types and method sets"
    url: https://go.dev/ref/spec#Interface_types
  - title: "Effective Go: interfaces and other types"
    url: https://go.dev/doc/effective_go#interfaces_and_types
---
A Go interface lists methods, and any type that has those methods satisfies it, with no declaration on the type's side. At run time an interface value is a pair: the concrete type stored in it and the value itself (in practice a pointer to it or the value inline). Method calls go through a table found from the type. Almost everything about interfaces follows from that pair, including why a nil pointer stored in an interface is not a nil interface.

## Implicit satisfaction

```go
type Store interface {
	Get(id string) (Item, error)
}
```

`*PostgresStore`, `*MemoryStore` and a hand-written test fake all satisfy `Store` as long as they have that method. The package that *uses* the interface can declare it with only the methods it calls, and the implementing packages never import it. The standard library works this way: `io.Reader` has one method, and files, network connections, buffers and gzip streams all satisfy it.

Keep interfaces small. "Accept interfaces, return concrete types" is the usual advice: return `*PostgresStore` from the constructor and let callers decide which interface they want.

## The nil interface trap

```go
package main

import (
	"errors"
	"fmt"
)

type NotFound struct{ Key string }

func (e *NotFound) Error() string { return e.Key + " not found" }

func find(key string) error {
	var err *NotFound // nil pointer
	if key == "missing" {
		err = &NotFound{Key: key}
	}
	return err // always a non-nil interface: type *NotFound, value maybe nil
}

func findFixed(key string) error {
	if key == "missing" {
		return &NotFound{Key: key}
	}
	return nil
}

func main() {
	fmt.Println(find("here") == nil)      // false
	fmt.Println(findFixed("here") == nil) // true
	var nf *NotFound
	fmt.Println(errors.As(find("missing"), &nf), nf.Key)
}
```

`find("here")` returns the pair (`*NotFound`, nil). Its type is set, so `== nil` is false and every caller thinks something failed. The fix is to never route a success through a typed pointer variable: return the literal `nil`. The same trap catches any interface, not only `error`.

## Method sets

A method with a value receiver, `func (t T) M()`, can be called on a `T` or a `*T`. A method with a pointer receiver, `func (t *T) M()`, belongs only to `*T`'s method set. So if any method an interface needs has a pointer receiver, you must store a pointer in the interface. A compile-time check is a common idiom:

```go
var _ Store = (*MemoryStore)(nil) // fails to compile if *MemoryStore lacks a method
```

## Type assertions and switches

`v, ok := x.(Concrete)` gets the concrete value back; without `ok` it panics on a mismatch. A type switch (`switch v := x.(type)`) tests several types. Use them sparingly: code that keeps asking "what are you really?" usually wants another method on the interface. For errors, use `errors.As`, which also looks inside wrapped errors.

`any` is an alias for `interface{}`, the interface with no methods, which every type satisfies. Storing a value in it can make the value escape to the heap, so hot paths often avoid it; generics are now the usual way to write code that works for many types without losing static types.
