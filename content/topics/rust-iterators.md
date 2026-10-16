---
id: rust-iterators
title: Iterators, closures and zero-cost abstractions
summary: Lazy chains of adapters that compile down to plain loops
why: "Idiomatic Rust processes collections with iterator chains instead of index loops. They are safer (no off-by-one, no bounds bugs) and, in release builds, typically as fast as the loop you'd write by hand."
requires: [rust-traits]
lesson: none
points:
  - title: One trait, one method
    text: "Iterator needs only fn next(&mut self) -> Option<Self::Item>. Dozens of adapters such as map, filter and zip come free."
  - title: Adapters are lazy
    text: Calling map or filter just builds a value describing the work. Nothing runs until a consumer such as collect, sum or a for loop pulls items.
  - title: iter, iter_mut, into_iter
    text: Borrow the items, borrow them mutably, or take ownership of them. The choice decides what you can do inside the chain and afterwards.
  - title: Zero-cost
    text: Each adapter is a concrete generic type, so the optimiser can inline the whole chain into one loop with no heap allocation and no virtual calls.
quiz:
  - q: "What does let v = vec![1, 2, 3]; v.iter().map(|x| println!(\"{x}\")); print?"
    options:
      - 1, 2 and 3 on separate lines
      - "Nothing; the map is never consumed (and the compiler warns about it)"
      - It doesn't compile
    answer: 1
    explain: "Adapters are lazy: no item is pulled, so the closure never runs. Rust 1.99 warns that the map's values are discarded. Use for_each or a for loop when you want side effects."
  - q: "After for s in names { ... } where names is a Vec<String>, can you use names again?"
    options:
      - Yes
      - "No; a for loop over a Vec calls into_iter(), which moves the Vec into the loop"
      - Only its length
    answer: 1
    explain: "Loop over &names (or names.iter()) to borrow instead. Then each s is a &String and names stays usable."
  - q: "Are iterator chains slower than an equivalent index loop?"
    options:
      - Yes, each adapter adds a virtual call
      - "Usually not in optimised builds; the chain is monomorphised and inlined, and can even skip bounds checks"
      - They are always faster
    answer: 1
    explain: "This is what zero-cost abstraction means: you couldn't hand-write it faster. In debug builds without optimisation they can be much slower, so benchmark with --release."
links:
  - title: "The Rust Book: processing a series of items with iterators"
    url: https://doc.rust-lang.org/book/ch13-02-iterators.html
  - title: "The Rust Book: performance of loops vs iterators"
    url: https://doc.rust-lang.org/book/ch13-04-performance.html
  - title: "std::iter module documentation"
    url: https://doc.rust-lang.org/std/iter/index.html
---
An iterator in Rust is any type that implements the `Iterator` trait, which has one required method, `next`, returning `Some(item)` until it returns `None`. Everything else, such as `map`, `filter`, `enumerate`, `zip`, `take_while`, `fold`, `sum` and `collect`, is a provided method built on `next`. **Adapters** such as `map` wrap one iterator in another and do nothing until a **consumer** such as `collect` or a `for` loop asks for items. Because each adapter is its own generic type, the compiler can see the whole chain and turn it into a tight loop.

## Laziness, closures and consumers

```rust
fn main() {
    let words = ["apple", "kiwi", "banana", "fig"];

    let lazy = words.iter().map(|w| {
        println!("looking at {w}");
        w.len()
    }); // nothing printed yet: adapters do no work on their own
    println!("built the iterator");
    let long: Vec<usize> = lazy.filter(|&n| n > 3).collect(); // now it runs
    println!("{long:?}");

    let total: usize = words.iter().map(|w| w.len()).sum();
    let mut sum_loop = 0;
    for w in &words {
        sum_loop += w.len();
    }
    assert_eq!(total, sum_loop); // same result; in release builds, typically the same machine code too

    let mut counter = 0;
    let mut bump = || counter += 1; // FnMut closure: borrows counter mutably
    bump();
    bump();
    println!("{counter} {:?}", (1..=4).rev().step_by(2).collect::<Vec<_>>());
}
```

It prints `built the iterator` *before* any `looking at` lines, then the four `looking at` lines, `[5, 4, 6]`, and `2 [4, 2]`. Items flow through the chain one at a time: `collect` pulls one, which makes `filter` pull from `map`, which pulls from the array.

## Three ways to iterate a collection

- `v.iter()` yields `&T`: the collection is only borrowed. `for x in &v` is the same.
- `v.iter_mut()` yields `&mut T`, to change items in place. `for x in &mut v` is the same.
- `v.into_iter()` yields `T` and consumes the collection. `for x in v` is the same, so `v` is gone afterwards.

`collect` can build any type that implements `FromIterator`: a `Vec`, `HashMap`, `String`, and even `Result<Vec<T>, E>`, which stops at the first error.

## Closures

A closure (`|args| body`) captures what it uses from its surroundings in the least demanding way that works: by shared reference, by mutable reference, or by value. That decides which of three traits it implements: `Fn` (only reads), `FnMut` (mutates captured state, like `bump`), or `FnOnce` (moves something out, so it can be called only once). `move |...|` forces captures by value, which threads and async tasks need. Adapters take closures as generic parameters, so they are inlined too.

## Why it costs nothing

`words.iter().map(f).filter(g)` has a concrete type, `Filter<Map<Iter<&str>, F>, G>`, known at compile time. With optimisations on, the compiler inlines every `next` call and closure into one loop. Iterating a slice can also remove bounds checks that indexing `v[i]` would need. This is the meaning of a **zero-cost abstraction**: what you don't use you don't pay for, and what you do use you couldn't write better by hand. It only holds with optimisations, so measure with `cargo build --release`.
