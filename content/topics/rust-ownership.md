---
id: rust-ownership
title: Ownership and moves
summary: Every value has one owner, and it is freed when the owner goes away
why: "Ownership is how Rust frees memory without a garbage collector and without manual free calls. Every other rule in the language builds on it, so the compiler errors make sense only once this does."
lesson: none
points:
  - title: One owner
    text: Each value is owned by one variable at a time. When the owner goes out of scope the value is dropped, and its heap memory is freed.
  - title: Assignment moves
    text: Assigning or passing a String moves ownership; the old variable can't be used any more. Nothing is copied except the small header.
  - title: Copy types are duplicated
    text: Integers, floats, bool, char and tuples of them implement Copy, so assignment copies the bits and both stay usable.
  - title: Clone is explicit
    text: To get a second independent heap value, call .clone(). The cost is visible in the code.
quiz:
  - q: What happens here?
    code: |
      let a = String::from("hi");
      let b = a;
      println!("{a} {b}");
    options:
      - It prints hi hi
      - "It doesn't compile: a was moved into b"
      - It compiles but crashes with a double free
    answer: 1
    explain: "error[E0382]: borrow of moved value. After the move only b owns the buffer, which guarantees exactly one drop. Use a.clone() if you need two strings."
  - q: "let x = 5; let y = x; Can x still be used?"
    options:
      - "Yes; i32 is Copy, so y gets its own copy of the bits"
      - No, x was moved
      - Only through a reference
    answer: 0
    explain: "Types that are cheap to duplicate and own no resources implement Copy, so assignment copies instead of moving. String, Vec and Box are not Copy."
  - q: "When is a String's heap buffer freed?"
    options:
      - When the garbage collector next runs
      - When its owner goes out of scope, at a point the compiler knows
      - When the program exits
    answer: 1
    explain: "The compiler inserts a call to drop where the owner's scope ends (unless it was moved away). The timing is deterministic, which is what makes RAII-style clean-up of files and locks work."
links:
  - title: "The Rust Book: what is ownership?"
    url: https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html
  - title: "std::marker::Copy"
    url: https://doc.rust-lang.org/std/marker/trait.Copy.html
  - title: "The Rust Reference: destructors"
    url: https://doc.rust-lang.org/reference/destructors.html
---
Rust manages memory with three rules the compiler checks: each value has an **owner**; there is only one owner at a time; and when the owner goes out of scope, the value is **dropped**. Dropping runs the type's clean-up code, which for a `String` or `Vec` frees its heap buffer. There is no garbage collector looking for unused memory and no `free` for you to forget or call twice, because the compiler knows statically where each value's life ends.

## Moves

```rust
fn shout(s: String) -> String {
    s.to_uppercase() // takes ownership of s; s is dropped at the end
}

fn main() {
    let a = String::from("hi");
    let b = a; // move: b owns the heap buffer now, a is unusable
    // println!("{a}"); // error[E0382]: borrow of moved value: `a`
    let c = b.clone(); // deep copy: a second heap buffer
    let loud = shout(b); // b moves into the function
    println!("{c} {loud}");

    let x = 5;
    let y = x; // i32 is Copy: both stay usable
    println!("{x} {y}");
}
```

It prints `hi HI` and `5 5`. A `String` is a small struct on the stack (pointer, length, capacity) pointing at bytes on the heap. `let b = a` copies that struct and makes `a` invalid, so only one variable will ever free the buffer. Uncomment the `println!` and the compiler says:

```text
error[E0382]: borrow of moved value: `a`
  |
2 |     let a = String::from("hi");
  |         - move occurs because `a` has type `String`, which does not implement the `Copy` trait
3 |     let b = a;
  |             - value moved here
```

Passing a value to a function moves it too, as `shout(b)` does, and returning a value moves it out to the caller. Moving is cheap: it never copies the heap data.

## Copy and Clone

Types whose bits are the whole value, such as integers, floats, `bool`, `char`, shared references, and tuples or arrays of them, implement `Copy`. For them, assignment copies and the original stays usable. A type can be `Copy` only if it has no `Drop` code and nothing it owns needs freeing, which is why `String` isn't.

`Clone` is the explicit, possibly expensive duplicate. `#[derive(Clone)]` writes it for your own types. If you see `.clone()` sprinkled to silence errors, it usually means a borrow would have done.

## Drop is deterministic

Values are dropped at the end of the scope that owns them, in reverse order of declaration. Anything can hook into that by implementing `Drop`: files close, locks unlock and connections return to their pool exactly when their owner goes away, even when a function returns early with `?`. This is the same idea as C++'s RAII, enforced by the compiler.

Ownership doesn't mean everything is on the heap. A struct of numbers lives wherever its owner does, often on the stack, and moving it is a plain copy of its bytes. The difference from other languages is that the compiler tracks who is responsible for it.

Passing ownership everywhere would be clumsy, so the next topic, borrowing, lets code use a value without taking it.
