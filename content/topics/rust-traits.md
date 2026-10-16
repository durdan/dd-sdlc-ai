---
id: rust-traits
title: "Traits and generics: static vs dynamic dispatch"
summary: Shared behaviour, compiled per type or called through a vtable
why: "Traits are Rust's interfaces, and the language lets you choose per call site whether to pay for flexibility. Knowing the difference between T: Trait and dyn Trait explains binary size, speed and some confusing compile errors."
requires: [rust-borrowing]
lesson: none
points:
  - title: Traits describe behaviour
    text: A trait lists methods, optionally with default bodies. Types implement it explicitly with impl Trait for Type.
  - title: Generics are monomorphised
    text: "A function with T: Trait is compiled separately for each concrete T. Calls are direct and can be inlined."
  - title: dyn Trait is dynamic dispatch
    text: A trait object is a pointer to the data plus a pointer to a vtable. One copy of the code handles every type, at the cost of an indirect call.
  - title: Coherence keeps impls unique
    text: You may implement a trait for a type only if the trait or the type is defined in your crate, so two crates can't conflict.
quiz:
  - q: "fn print_static<T: Shape>(s: &T) is called with a Square and with a Circle. How many copies of it are in the binary?"
    options:
      - One, shared through a vtable
      - Two, one per concrete type
      - None; generics are erased
    answer: 1
    explain: "Monomorphisation generates specialised code for each type used. That is fast but can grow the binary when a generic function is used with many types."
  - q: "Why is &dyn Shape twice the size of &Square on a 64-bit target?"
    options:
      - It is a fat pointer, holding the data pointer and a vtable pointer
      - It also stores a copy of the Square
      - It holds a reference count
    answer: 0
    explain: "The playground printed 8 vs 16. The vtable holds the concrete type's method pointers, size and drop function."
  - q: "Can you write impl std::fmt::Display for Vec<i32> in your own crate?"
    options:
      - Yes
      - No; neither the trait nor the type is local, which the orphan rule forbids
      - Only with unsafe
    answer: 1
    explain: "Coherence requires the trait or the type to be local. Wrap it in your own type (struct Numbers(Vec<i32>)) and implement Display for that."
links:
  - title: "The Rust Book: traits"
    url: https://doc.rust-lang.org/book/ch10-02-traits.html
  - title: "The Rust Book: trait objects"
    url: https://doc.rust-lang.org/book/ch18-02-trait-objects.html
  - title: "The Rust Reference: trait object types"
    url: https://doc.rust-lang.org/reference/types/trait-object.html
  - title: "Announcing Rust 1.86: trait upcasting"
    url: https://blog.rust-lang.org/2025/04/03/Rust-1.86.0/
---
A **trait** names a set of methods that types can implement, like an interface. Unlike Go, implementation is explicit (`impl Shape for Square`), and unlike Java, you choose at each use whether the call is resolved at compile time or at run time. Bound a generic parameter with the trait (`T: Shape`) and the compiler generates code for each concrete type: **static dispatch**. Use a trait object (`dyn Shape`) and one copy of the code calls methods through a table of function pointers: **dynamic dispatch**.

## Both kinds of dispatch

```rust
trait Shape {
    fn area(&self) -> f64;
    fn describe(&self) -> String { // default method
        format!("area {:.1}", self.area())
    }
}

struct Square(f64);
struct Circle(f64);

impl Shape for Square {
    fn area(&self) -> f64 { self.0 * self.0 }
}
impl Shape for Circle {
    fn area(&self) -> f64 { 3.14159 * self.0 * self.0 }
    fn describe(&self) -> String { format!("circle, {:.1}", self.area()) }
}

// Static dispatch: one copy of this function per concrete T (monomorphisation).
fn print_static<T: Shape>(s: &T) { println!("{}", s.describe()); }

// Dynamic dispatch: one copy; calls go through a vtable.
fn total(shapes: &[Box<dyn Shape>]) -> f64 { shapes.iter().map(|s| s.area()).sum() }

fn main() {
    print_static(&Square(2.0));
    print_static(&Circle(1.0));
    let mixed: Vec<Box<dyn Shape>> = vec![Box::new(Square(2.0)), Box::new(Circle(1.0))];
    println!("{:.2}", total(&mixed));
    println!("{} vs {}", size_of::<&Square>(), size_of::<&dyn Shape>()); // thin vs fat pointer
}
```

Output: `area 4.0`, `circle, 3.1`, `7.14`, `8 vs 16`.

## Static dispatch

`fn print_static<T: Shape>(s: &T)`, `fn f(s: &impl Shape)` and `where T: Shape` all mean the same: the compiler **monomorphises**, producing one specialised copy per type it is called with. Calls are direct and can be inlined, so abstractions cost nothing at run time. The price is compile time and code size, and every element of a `Vec<T>` must be the same `T`.

Returning `impl Trait` (`fn evens() -> impl Iterator<Item = u32>`) hides the concrete type from the caller while still dispatching statically. In the 2024 edition such a return type captures all lifetimes in scope by default; `+ use<...>` (Rust 1.82, and in traits since 1.87) lists exactly what it captures.

## Dynamic dispatch

A `&dyn Shape` or `Box<dyn Shape>` is a **fat pointer**: a pointer to the value and a pointer to the vtable for its concrete type, which is why it is 16 bytes on a 64-bit target. That lets one `Vec` hold different types, and plugins or handlers be chosen at run time. The cost is an indirect call that usually can't be inlined.

Not every trait can be made into an object. A trait is **dyn compatible** (formerly "object safe") only if, among other rules, its methods don't return `Self` and don't have generic type parameters. Since Rust 1.86 a `&dyn Sub` can be **upcast** to `&dyn Super` when `Sub: Super`.

## Generics, bounds and coherence

Generic structs and functions state what they need with bounds: `fn largest<T: PartialOrd + Copy>(xs: &[T]) -> T`. Common traits such as `Debug`, `Clone`, `PartialEq` and `Hash` can be derived. Operators are traits too (`Add`, `Index`), and so are conversions (`From`, `Into`), iteration (`Iterator`) and clean-up (`Drop`).

**Coherence** (the orphan rule) says you can implement a trait for a type only if the trait or the type is defined in your crate. Two crates can never supply conflicting impls, at the cost of the occasional wrapper type (the "newtype" pattern).

Default to generics in libraries for speed; switch to `dyn` when you need a mixed collection, want to cut compile times, or hide types behind a stable boundary.
