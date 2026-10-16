---
id: go-generics
title: Generics and constraints
summary: Type parameters, constrained by interfaces that describe type sets
why: "Since Go 1.18 you can write one Map, Max or cache for many types without falling back to any and type assertions. Knowing what constraints mean keeps generic code simple."
requires: [go-interfaces]
lesson: none
points:
  - title: Type parameters in brackets
    text: "func Max[T cmp.Ordered](a, b T) T declares T, constrained to types that support < and >. Callers usually leave T out and let Go infer it."
  - title: Constraints are interfaces
    text: A constraint lists methods, types, or both. ~int means every type whose underlying type is int, including your own named types.
  - title: Generic methods arrived in Go 1.27
    text: Before 1.27 only functions and types could have type parameters. Now a method can declare its own, but interface methods still can't.
  - title: Reach for them for containers and algorithms
    text: If an ordinary interface does the job, it is usually clearer. Generics shine when the caller should get its own type back.
quiz:
  - q: "type Celsius float64. Does Sum[Celsius] compile when the constraint is interface{ int | float64 }?"
    options:
      - Yes, Celsius is a float64
      - "No; without ~ the type set holds only int and float64 themselves"
      - Only with an explicit conversion inside Sum
    answer: 1
    explain: "A named type is a different type. Writing ~float64 widens the set to every type whose underlying type is float64, which includes Celsius."
  - q: "Which constraint lets a generic function use == on its values?"
    options:
      - any
      - comparable
      - cmp.Ordered only
    answer: 1
    explain: "comparable allows == and !=, which is what map keys need. any allows neither. cmp.Ordered also allows < and >."
  - q: "In Go 1.27, which of these is still not allowed?"
    options:
      - "A method func (b *Bag) Count[T any]() int"
      - "An interface method with its own type parameters, such as Get[T any]() T"
      - "A generic type type Set[T comparable] map[T]struct{}"
    answer: 1
    explain: "Go 1.27 added type parameters on concrete methods. Interface methods can't declare type parameters, and generic methods can't be used to implement interface methods."
links:
  - title: "Tutorial: getting started with generics"
    url: https://go.dev/doc/tutorial/generics
  - title: "An introduction to generics (Go blog)"
    url: https://go.dev/blog/intro-generics
  - title: "Go 1.27 release notes: generic methods"
    url: https://go.dev/doc/go1.27
  - title: "Go FAQ: how are generics implemented?"
    url: https://go.dev/doc/faq#generics_implementation
---
Go 1.18 added type parameters: functions and types can take types as parameters, written in square brackets. Each type parameter has a constraint, which is an interface. A constraint can list methods, as interfaces always could, and it can also list types, which describe the set of types allowed. Go 1.27 extended this to methods, which can now declare type parameters of their own.

## Functions and constraints

```go
package main

import (
	"cmp"
	"fmt"
)

type Number interface {
	~int | ~int64 | ~float64
}

func Sum[T Number](xs []T) T {
	var total T
	for _, x := range xs {
		total += x
	}
	return total
}

func MaxOf[T cmp.Ordered](xs ...T) T {
	m := xs[0]
	for _, x := range xs[1:] {
		m = max(m, x)
	}
	return m
}

type Celsius float64 // underlying type float64, so it satisfies ~float64

func main() {
	fmt.Println(Sum([]int{1, 2, 3}))
	fmt.Println(Sum([]Celsius{20.5, 21}))
	fmt.Println(MaxOf("pear", "apple", "zucchini"))
}
```

It prints `6`, `41.5` and `zucchini`. Notice:

- **Inference.** `Sum([]int{...})` doesn't say `Sum[int]`; the compiler works it out from the arguments.
- **`~T`** means "any type whose underlying type is T". Without the tilde, `Celsius` would be rejected.
- **The operations allowed** on a `T` are those that every type in the constraint's set supports. That is why `total += x` compiles: all three types support `+`.
- **Built-in constraints.** `any` allows any type. `comparable` allows `==`, which map keys need. `cmp.Ordered` (Go 1.21) allows `<`. The built-in `min` and `max` also arrived in 1.21.

## Generic types

```go
type Set[T comparable] map[T]struct{}

func (s Set[T]) Add(v T)           { s[v] = struct{}{} }
func (s Set[T]) Has(v T) bool      { _, ok := s[v]; return ok }
```

A generic type must be instantiated before use (`Set[string]{}`). The standard library now has many generic helpers: `slices.Sort`, `slices.Index`, `maps.Keys` and the iterator types in `iter` (Go 1.23).

## Generic methods (Go 1.27)

Until Go 1.26 a method could only use its receiver's type parameters, so helpers that needed a new one had to be package-level functions. Go 1.27 lets a method declare its own:

```go
func (b *Bag) Count[T any]() int {
	n := 0
	for _, it := range b.items {
		if _, ok := it.(T); ok {
			n++
		}
	}
	return n
}
```

Called as `b.Count[int]()`. Interface methods still can't have type parameters, and a generic method can't be used to satisfy an interface method. `math/rand/v2` now has a `(*Rand).N` method alongside the generic `rand.N` function.

## How it compiles

The language leaves the strategy to the compiler. The gc compiler doesn't usually make one copy per type argument: it compiles one copy per *shape*, where the shape depends on properties such as the type's size and where it holds pointers, so many type arguments share one compiled body. That shared body works much like a function with an interface parameter, so generic code is not automatically as fast as code written for one type. Measure before rewriting a hot path.

## When to use them

Use generics for containers, and for algorithms over slices, maps and channels, where the caller should get its own element type back. When the code calls a few methods on a value, an ordinary interface parameter is usually simpler to read and just as fast.
