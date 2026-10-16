---
id: rust-enums
title: Enums, Option and pattern matching
summary: Types that are one of several shapes, and a match that must cover them all
why: "Rust has no null and no unchecked variants. Enums and exhaustive matching turn whole classes of bugs, a forgotten case or a missing value, into compile errors."
requires: [rust-ownership]
lesson: none
points:
  - title: Variants can carry data
    text: Each variant of an enum can hold its own fields. A value is exactly one variant at a time, and the compiler knows which ones exist.
  - title: match is exhaustive
    text: A match must handle every variant. Add a variant later and every match that forgot it stops compiling.
  - title: Option instead of null
    text: "A value that may be absent has type Option<T>: Some(v) or None. You can't use the T without first handling None."
  - title: Lighter forms
    text: if let, let ... else and (since Rust 1.88, edition 2024) let chains handle one pattern without a full match.
quiz:
  - q: "You add a Triangle variant to enum Shape. What happens to a match on Shape that has no wildcard arm?"
    options:
      - Triangle values silently fall through
      - "It stops compiling with error E0004: non-exhaustive patterns"
      - It panics at run time when a Triangle arrives
    answer: 1
    explain: "Exhaustiveness checking points at every match that must now handle the new case. A _ arm would hide it, which is why many teams avoid wildcards on their own enums."
  - q: "How is Option<T> different from a nullable pointer?"
    options:
      - It is slower
      - "The type system forces you to handle None before you can use the T inside"
      - It can only hold numbers
    answer: 1
    explain: "There is no way to call a T method on an Option<T> by accident. For references and Box, Option even has the same size as the pointer: None is stored as the null value."
  - q: "What does let Some(port) = parse_port(s) else { return; }; do?"
    options:
      - Binds port if the pattern matches; otherwise runs the else block, which must not continue past it
      - It is a syntax error
      - It panics on None
    answer: 0
    explain: "let-else (Rust 1.65) keeps the happy path unindented. The else block has to diverge, by returning, breaking, continuing or panicking."
links:
  - title: "The Rust Book: enums and pattern matching"
    url: https://doc.rust-lang.org/book/ch06-00-enums.html
  - title: "The Rust Book: patterns and matching"
    url: https://doc.rust-lang.org/book/ch19-00-patterns.html
  - title: "Announcing Rust 1.88: let chains"
    url: https://blog.rust-lang.org/2025/06/26/Rust-1.88.0/
---
A Rust `enum` is a type whose value is exactly one of several **variants**, and each variant can carry its own data. Together with `match`, which must handle every variant, this is how Rust models "one of these things": a parsed command, a network message, a state in a state machine, or a value that might be missing. The standard library's two most important types, `Option` and `Result`, are ordinary enums.

## Data in variants, and exhaustive match

```rust
#[derive(Debug)]
enum Shape {
    Circle { r: f64 },
    Rect { w: f64, h: f64 },
    Point,
}

fn area(s: &Shape) -> f64 {
    match s { // must cover every variant, or it does not compile
        Shape::Circle { r } => std::f64::consts::PI * r * r,
        Shape::Rect { w, h } => w * h,
        Shape::Point => 0.0,
    }
}

fn parse_port(s: &str) -> Option<u16> {
    let n: u16 = s.parse().ok()?; // None if it is not a number
    if n == 0 { None } else { Some(n) }
}

fn main() {
    for s in [Shape::Circle { r: 1.0 }, Shape::Rect { w: 2.0, h: 3.0 }, Shape::Point] {
        println!("{s:?} -> {:.2}", area(&s));
    }
    let Some(port) = parse_port("8080") else {
        panic!("bad port");
    };
    if let Some(p) = parse_port("443") && p < 1024 { // let chains: Rust 1.88+, edition 2024
        println!("{port} and privileged {p}");
    }
    println!("{:?} {:?}", parse_port("0"), parse_port("http"));
}
```

Output: three lines of areas (`3.14`, `6.00`, `0.00`), then `8080 and privileged 443`, then `None None`.

In memory an enum is a tag plus enough space for its largest variant. The compiler often hides the tag in spare bits: `Option<&T>` and `Option<Box<T>>` are the same size as a plain pointer.

## Patterns

Patterns appear in `match`, `let`, `if let`, `while let`, `for` and function parameters. They can:

- **destructure** structs, tuples, enums and slices (`[first, .., last]`);
- **bind** parts to names, by value or with `ref`, and with `name @ pattern` to keep the whole;
- **match ranges and alternatives** (`1..=9`, `'a' | 'e'`);
- **add guards**: `Some(n) if n > 10 =>`. Since Rust 1.95 guards can also be `if let`.

The compiler checks that a `match` is exhaustive and warns about arms that can never be reached.

## Option instead of null

Rust has no null. An absent value is `None`, and to use the value inside a `Some` you must say what happens otherwise: `match`, `if let`, `unwrap_or(default)`, `map`, `and_then`, or `?` to return `None` early, as `parse_port` does. `unwrap()` and `expect("why")` are there for when absence really is a bug; they panic.

## One pattern at a time

- **`if let Some(x) = opt { ... }`** handles one variant and ignores the rest.
- **`let Some(x) = opt else { return ... };`** (Rust 1.65) binds or bails out, keeping the main path unindented.
- **Let chains** (Rust 1.88, 2024 edition only): `if let Some(p) = a && let Ok(v) = p.parse::<u32>() && v > 3 { ... }` combines patterns and conditions without nesting.

Prefer an enum over a set of boolean flags or a struct with optional fields that are only valid in some combinations: if a state can't be represented, it can't occur.
