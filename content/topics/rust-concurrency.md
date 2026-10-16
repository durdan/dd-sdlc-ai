---
id: rust-concurrency
title: "Fearless concurrency: Send and Sync"
summary: The type system decides what may cross or be shared between threads
why: "In most languages a data race is a bug you find in production. In safe Rust it is a compile error, because two marker traits say which types are safe to move to or share with another thread."
requires: [rust-smart-pointers, rust-traits]
lesson: none
points:
  - title: Send means it can move to another thread
    text: Almost every type is Send. Rc isn't, because two threads could update its plain counter at the same time.
  - title: Sync means it can be shared by reference
    text: "T is Sync when &T is Send. Cell and RefCell aren't Sync; Mutex<T> is, which is how shared mutation becomes safe."
  - title: The compiler checks every spawn
    text: "thread::spawn requires its closure to be Send + 'static. Break the rules and the program doesn't compile."
  - title: Scoped threads can borrow
    text: std::thread::scope (Rust 1.63) joins every thread before it returns, so those threads may borrow local data.
quiz:
  - q: "You move an Rc<i32> into thread::spawn. What happens?"
    options:
      - It works but may crash later
      - "Compile error E0277: Rc<i32> cannot be sent between threads safely"
      - The Rc is converted to an Arc automatically
    answer: 1
    explain: "Rc doesn't implement Send, and spawn requires F: Send. Use Arc, whose counter is atomic."
  - q: "Why does Arc<Mutex<u64>> let eight threads increment one counter, when Arc<u64> doesn't?"
    options:
      - Arc<u64> only gives shared references, and you can't mutate through &u64; Mutex hands out exclusive access one thread at a time
      - Mutex makes the integer atomic
      - Arc<u64> is not Send
    answer: 0
    explain: "Arc gives shared ownership, which means shared (&) access only. Mutex<T> is Sync and provides interior mutability: lock() returns a guard giving &mut T, released when the guard is dropped."
  - q: "Does safe Rust prevent deadlocks?"
    options:
      - Yes, the borrow checker rules them out
      - "No; it prevents data races, but two threads can still wait on each other's locks"
      - Only with scoped threads
    answer: 1
    explain: "Fearless concurrency is about memory safety. Deadlocks, livelocks and logic races (checking then acting without holding a lock) are still possible."
links:
  - title: "The Rust Book: extensible concurrency with Send and Sync"
    url: https://doc.rust-lang.org/book/ch16-04-extensible-concurrency-sync-and-send.html
  - title: "The Rustonomicon: Send and Sync"
    url: https://doc.rust-lang.org/nomicon/send-and-sync.html
  - title: "std::thread::scope"
    url: https://doc.rust-lang.org/std/thread/fn.scope.html
---
Rust's threads are ordinary operating-system threads. What is unusual is that the ownership and borrowing rules apply across them, so the compiler can prove a program free of **data races**: two threads touching the same memory at once with at least one writing and no synchronisation. Two marker traits carry the information. A type is **`Send`** if a value of it can be moved to another thread, and **`Sync`** if it can be shared between threads by reference (formally, `T: Sync` exactly when `&T: Send`). The compiler implements both automatically for types whose fields all have them.

## Threads, shared state and channels

```rust
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

fn main() {
    let hits = Arc::new(Mutex::new(0));
    let mut handles = vec![];
    for _ in 0..8 {
        let hits = Arc::clone(&hits);
        handles.push(thread::spawn(move || {
            for _ in 0..1000 {
                *hits.lock().unwrap() += 1; // the guard unlocks when dropped
            }
        }));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("hits = {}", *hits.lock().unwrap());

    let data = vec![1, 2, 3, 4];
    let (left, right) = data.split_at(2);
    let (a, b) = thread::scope(|s| { // scoped threads may borrow local data
        let ha = s.spawn(|| left.iter().sum::<i32>());
        let hb = s.spawn(|| right.iter().sum::<i32>());
        (ha.join().unwrap(), hb.join().unwrap())
    });
    println!("{a} + {b}");

    let (tx, rx) = mpsc::channel();
    thread::spawn(move || tx.send(String::from("moved through a channel")).unwrap());
    println!("{}", rx.recv().unwrap());
}
```

It prints `hits = 8000` every time, then `3 + 7`, then `moved through a channel`.

- **`Arc<Mutex<T>>`** is shared, mutable state. `Arc` gives every thread an owner; `Mutex` makes access exclusive. The data is *inside* the mutex, so it is impossible to touch it without locking. `lock()` returns a guard, and dropping the guard unlocks. `unwrap()` deals with **poisoning**: if a thread panicked while holding the lock, later `lock()` calls return an error.
- **Scoped threads** are joined before `thread::scope` returns, so they can borrow `left` and `right` from the stack without `Arc` or `'static`.
- **Channels** move ownership: after `send`, the sending thread can't use the value any more. `mpsc` means many producers, one consumer.

## What the compiler stops

Move an `Rc` into `thread::spawn` and the program doesn't compile (output shortened):

```text
error[E0277]: `Rc<i32>` cannot be sent between threads safely
  = help: within `{closure@src/main.rs:5:27: 5:34}`, the trait `Send` is not implemented for `Rc<i32>`
note: required by a bound in `spawn`
  |     F: Send + 'static,
```

The same mechanism rejects sharing a `RefCell` between threads (not `Sync`), mutating a captured variable from two threads without a lock, and moving a `MutexGuard` to another thread (guards aren't `Send`, because the underlying system locks must be released by the thread that acquired them).

## What it doesn't stop

Data-race freedom isn't freedom from all concurrency bugs. Deadlocks, lock-ordering mistakes, starvation and higher-level races (read, decide, then write under two separate locks) are still possible. Keep critical sections short, take locks in a consistent order, and prefer message passing or owning data per thread when the design allows.

Your own types get `Send` and `Sync` automatically when all their fields have them. Implementing them by hand is `unsafe impl Send for MyType {}`: a promise the compiler can't check, needed only for types built on raw pointers.

For heavier data parallelism, crates such as `rayon` turn `iter()` into `par_iter()` and rely on the same `Send`/`Sync` bounds to stay safe. `std::sync::atomic` provides lock-free counters and flags, with explicit memory orderings.
