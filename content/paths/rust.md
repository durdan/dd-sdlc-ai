---
id: rust
title: "Rust: ownership and what it buys you"
promise: "How Rust's ownership and borrowing rules give memory safety without a garbage collector, how traits, enums and iterators stay zero-cost, and how the same rules make threads and async code safe."
kind: skill
level: intermediate
tags: [languages]
stages:
  - title: Ownership
    blurb: Moves, borrows, lifetimes, the heap
    topics: [rust-cargo, rust-ownership, rust-borrowing, rust-lifetimes, rust-smart-pointers]
  - title: Types that do the work
    blurb: Enums, errors, traits, iterators
    topics: [rust-enums, rust-errors, rust-traits, rust-iterators]
  - title: Beyond one thread
    blurb: Send and Sync, async, unsafe
    topics: [rust-concurrency, rust-async, rust-unsafe]
bridges:
  - id: backpressure
    why: "A bounded tokio::sync::mpsc channel makes the sender wait when the receiver falls behind. The same rule between services: bound every queue."
  - id: timeout
    why: "tokio::time::timeout drops the inner future when time runs out, which cancels it. Put a deadline on every call that crosses the network."
  - id: bulkhead
    why: "A tokio Semaphore per dependency caps how many requests can wait on it at once, so one slow backend can't take every task."
next: [resilience-101]
---
Everything here is about stable Rust and the 2024 edition (Rust 1.85 and later). The examples were compiled and run on the official Rust Playground with Rust 1.99.1 and, for the async topic, Tokio 1.53. Where a feature is newer than the 2024 edition (let chains in 1.88, for example) the topic says so.
