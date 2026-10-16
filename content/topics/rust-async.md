---
id: rust-async
title: "Async Rust: futures, executors and Tokio"
summary: Lazy futures that an executor polls, so one thread can wait on many things
why: "Network services in Rust are almost all async. The model differs from JavaScript or Go: nothing runs until polled, the runtime is a library you choose, and dropping a future cancels it."
requires: [rust-concurrency]
lesson: none
points:
  - title: Futures are lazy
    text: Calling an async fn returns a future and runs none of its body. Work starts only when something awaits or polls it.
  - title: The executor is a library
    text: The standard library defines Future but ships no runtime. Tokio is the most common; it provides the scheduler, timers and async I/O.
  - title: .await yields, it doesn't block
    text: At each .await that isn't ready, the task gives its thread back to the executor and is woken when it can make progress.
  - title: Dropping a future cancels it
    text: A future that is dropped before it completes simply stops at its last .await. Timeouts and select! rely on this.
quiz:
  - q: "let fut = fetch(\"a\", 10); println!(\"created\"); fut.await; In what order do things happen?"
    options:
      - fetch runs first, then created is printed
      - created is printed, then fetch's body runs at .await
      - They run in parallel
    answer: 1
    explain: "Rust futures are inert until polled. The playground run printed created the future before lazy after 10 ms."
  - q: "What is the difference between tokio::join!(a, b) and tokio::spawn(a)?"
    options:
      - None
      - "join! runs both futures concurrently inside the current task; spawn creates a separate task the runtime may run on another thread"
      - join! runs them one after the other
    answer: 1
    explain: "join! polls both in turn within one task, so two 100 ms sleeps take about 100 ms in total. spawn hands a future to the scheduler; on the multi-threaded runtime it must be Send + 'static."
  - q: "Why is calling std::thread::sleep inside an async fn a problem?"
    options:
      - It doesn't compile
      - "It blocks the worker thread, so no other task on that thread can run until it returns"
      - It is fine; Tokio converts it automatically
    answer: 1
    explain: "Async scheduling is cooperative. Use tokio::time::sleep, and run blocking or CPU-heavy work with tokio::task::spawn_blocking."
links:
  - title: "The Rust Book: futures and the async syntax"
    url: https://doc.rust-lang.org/book/ch17-01-futures-and-syntax.html
  - title: "std::future::Future"
    url: https://doc.rust-lang.org/std/future/trait.Future.html
  - title: "Tokio tutorial: hello Tokio"
    url: https://tokio.rs/tokio/tutorial/hello-tokio
  - title: "Tokio tutorial: spawning"
    url: https://tokio.rs/tokio/tutorial/spawning
---
An `async fn` doesn't run when you call it. It returns a **future**: a value that represents the work and a state machine the compiler generated from the function body, with one state per `.await`. Something has to **poll** that future to drive it forward. That something is an **executor**, and Rust's standard library doesn't include one: you choose a runtime crate, most often Tokio, which supplies the executor, timers, and async networking and file APIs. Many tasks share a few threads because a task waiting at `.await` gives its thread back.

## Lazy, concurrent, cancellable

```rust
use std::time::Duration;
use tokio::time::{sleep, timeout};

async fn fetch(name: &str, ms: u64) -> String {
    sleep(Duration::from_millis(ms)).await; // yields to the executor while waiting
    format!("{name} after {ms} ms")
}

#[tokio::main]
async fn main() {
    let fut = fetch("lazy", 10); // nothing runs yet: a future is just a value
    println!("created the future");
    println!("{}", fut.await);  // now it runs

    let start = std::time::Instant::now();
    let (a, b) = tokio::join!(fetch("a", 100), fetch("b", 100)); // concurrently, one task
    println!("{a}, {b}, took about {} ms", start.elapsed().as_millis() / 100 * 100);

    match timeout(Duration::from_millis(20), fetch("slow", 500)).await {
        Ok(v) => println!("{v}"),
        Err(_) => println!("gave up after 20 ms; the inner future was dropped"),
    }

    let handle = tokio::spawn(fetch("spawned", 5)); // a separate task; must be 'static + Send
    println!("{}", handle.await.unwrap());
}
```

Run on the Rust Playground (Rust 1.99, Tokio 1.53) it printed `created the future`, `lazy after 10 ms`, `a after 100 ms, b after 100 ms, took about 100 ms`, the timeout message, and `spawned after 5 ms`.

## What poll does

`Future` has one method, `poll`, which returns `Poll::Ready(value)` or `Poll::Pending`. A future that returns `Pending` has arranged for a **waker** to be called when it can make progress, for example when a socket becomes readable or a timer fires. The executor then polls it again. Because the generated state machine may hold references into itself, futures are polled through `Pin<&mut Self>`, which promises they won't be moved. You rarely meet `Pin` unless you write futures or combinators by hand.

## Tasks and the runtime

- `#[tokio::main]` builds a runtime (multi-threaded by default, with one worker per CPU core) and blocks on your `async fn main`.
- `tokio::spawn` creates a **task**, the async equivalent of a green thread. Tasks are cheap; Tokio's tutorial puts one at a single allocation and 64 bytes. On the multi-threaded runtime a task may move between threads at each `.await`, so its future must be `Send` and `'static`. Holding an `Rc` or a `std::sync::MutexGuard` across an `.await` makes it not `Send`, which is a common compile error.
- `join!` runs several futures concurrently *inside* one task. `select!` waits for the first of several and drops the rest.

## Cancellation and blocking

Dropping a future cancels it: it stops at the last `.await` it reached and its locals are dropped. `timeout` and `select!` work this way. Write async code assuming any `.await` might be the last one, for example by not leaving shared state half-updated across an `.await`.

Scheduling is **cooperative**. A task that runs CPU-heavy code or calls a blocking function (`std::thread::sleep`, a synchronous file or database client) holds its worker thread and stalls every other task scheduled there. Use the async versions, or move the work to `tokio::task::spawn_blocking`.

Recent language changes made async easier to write: `async fn` in traits (Rust 1.75) and async closures (`async || { ... }`, Rust 1.85).
