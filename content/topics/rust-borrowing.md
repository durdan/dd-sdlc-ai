---
id: rust-borrowing
title: Borrowing and the borrow checker
summary: Many readers or one writer, never both at once
why: "References let code use a value without owning it. The one rule the borrow checker enforces, shared or mutable but not both, rules out dangling pointers, iterator invalidation and data races at compile time."
requires: [rust-ownership]
lesson: none
points:
  - title: "&T is a shared borrow"
    text: Any number of shared references can exist at once. Through them the value can be read but not changed.
  - title: "&mut T is an exclusive borrow"
    text: While a mutable reference exists, no other reference to the value can be used. That is what makes changing it safe.
  - title: A borrow lasts until its last use
    text: Since non-lexical lifetimes, a reference is live only up to the last place it is used, not to the end of its block.
  - title: References never dangle
    text: A reference can't outlive the value it points to. The compiler rejects code that would leave one pointing at freed memory.
quiz:
  - q: Why doesn't this compile?
    code: |
      let mut words = vec![String::from("hello")];
      let first = &words[0];
      words.push(String::from("world"));
      println!("{first}");
    options:
      - push needs ownership of words
      - "first is a shared borrow still in use, and push needs a mutable borrow; push may reallocate and leave first dangling"
      - Vectors of String can't be indexed
    answer: 1
    explain: "error[E0502]. If push had to grow the vector, it would move the elements and first would point at freed memory. Move the println before the push and it compiles."
  - q: "Which combination of references to one value may be in use at the same moment?"
    options:
      - Two &mut
      - One &mut and one &
      - Any number of &, or exactly one &mut
    answer: 2
    explain: "Shared XOR mutable. Readers can't observe a half-finished write, and a writer knows nobody else is looking."
  - q: "How do you let a function change a caller's String without taking ownership of it?"
    options:
      - "fn add(s: String)"
      - "fn add(s: &mut String), called as add(&mut name)"
      - "fn add(s: &String)"
    answer: 1
    explain: "A mutable borrow gives temporary write access. The caller keeps ownership and can use name again after the call."
links:
  - title: "The Rust Book: references and borrowing"
    url: https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html
  - title: "The Rust Book: the slice type"
    url: https://doc.rust-lang.org/book/ch04-03-slices.html
  - title: "Non-lexical lifetimes fully stable (Rust blog)"
    url: https://blog.rust-lang.org/2022/08/05/nll-by-default/
---
A **reference** borrows a value without taking ownership: `&v` is a shared reference and `&mut v` a mutable one. The owner keeps the value, and the reference must stop being used before the owner drops it or moves it. The borrow checker is the part of the compiler that enforces this, with one central rule: at any moment a value may have either any number of shared references or exactly one mutable reference, never both.

## Shared or mutable

```rust
fn total_len(words: &[String]) -> usize {
    words.iter().map(|w| w.len()).sum() // shared borrow: read only
}

fn add_bang(s: &mut String) {
    s.push('!'); // mutable borrow: may change it
}

fn main() {
    let mut words = vec![String::from("hello"), String::from("world")];
    let first = &words[0];   // shared borrow starts
    println!("{first}");     // ...and ends here, after its last use
    add_bang(&mut words[1]); // so a mutable borrow is fine now
    println!("{} {}", total_len(&words), words[1]);
}
```

It prints `hello` and `11 world!`. `&[String]` is a **slice**: a borrowed view of part or all of a vector or array, made of a pointer and a length. Taking `&[T]` or `&str` instead of `&Vec<T>` or `&String` lets callers pass any contiguous data.

## What the rule prevents

Move the `println!("{first}")` after a `words.push(...)` and the compiler stops you:

```text
error[E0502]: cannot borrow `words` as mutable because it is also borrowed as immutable
  |
3 |     let first = &words[0];
  |                  ----- immutable borrow occurs here
4 |     words.push(String::from("world"));
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ mutable borrow occurs here
5 |     println!("{first}");
  |                ----- immutable borrow later used here
```

This is a real bug in other languages: `push` may reallocate the buffer, and `first` would then point at freed memory. In C++ it is undefined behaviour; in Java the equivalent iterator throws `ConcurrentModificationException` at run time. Rust rejects it before the program runs. The same rule, applied across threads, is what rules out data races.

## Borrows end at their last use

The checker works on the control-flow graph, not on braces: a borrow is live from where it is created to where it is last used. This is **non-lexical lifetimes** (NLL), introduced with Rust 2018; since Rust 1.63 it is the only borrow checker, in every edition. It is why the first example compiles: `first` is no longer used when `add_bang` borrows mutably.

## Practical patterns

- **Shorten borrows.** Copy out what you need (`let n = v.len();`) before mutating.
- **Borrow disjoint parts.** The checker understands separate struct fields, so `&mut s.a` and `&mut s.b` can coexist. For slices, `split_at_mut` gives two non-overlapping mutable halves.
- **Use indices or keys** instead of long-lived references into a collection you keep changing.
- **Pass references by default.** A function that only reads should take `&T`; take `T` only when it needs to keep the value.

References are checked statically and cost nothing at run time: a `&T` is just a pointer. When the static rules are too strict, for example a value with several owners, the smart pointers `Rc`, `RefCell` and friends move some of the checking to run time.
