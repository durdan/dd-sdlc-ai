---
id: rust-smart-pointers
title: "Stack, heap, and Box, Rc, Arc"
summary: Owning pointers for the cases plain ownership can't express
why: "Recursive types, shared ownership and graphs don't fit one-owner-per-value. Box, Rc, Arc and RefCell cover those cases, each with a cost you can see in the type."
requires: [rust-ownership]
lesson: none
points:
  - title: Values live where their owner lives
    text: Locals sit on the stack. Only a type that allocates, such as Box, Vec or String, puts data on the heap.
  - title: Box is one owner, on the heap
    text: Box<T> moves a value to the heap and frees it when the box is dropped. It gives recursive types and trait objects a known size.
  - title: Rc and Arc share ownership
    text: They count owners and free the value when the last one goes. Rc's count is plain, so it stays on one thread; Arc's is atomic.
  - title: RefCell moves borrow checks to run time
    text: It allows mutation through a shared reference, and panics if two mutable borrows overlap.
quiz:
  - q: "Why does enum List { Cons(i32, List), Nil } fail to compile, and how do you fix it?"
    options:
      - Enums can't contain themselves at all
      - "Its size would be infinite; store Box<List> instead, which is one pointer wide"
      - Use a String instead of i32
    answer: 1
    explain: "Rust must know every type's size. A List inside a List has no finite size, but a Box<List> is a pointer of known size."
  - q: "What does Rc::clone(&a) do?"
    options:
      - Deep-copies the value
      - Increments the reference count and returns another pointer to the same value
      - Moves the value
    answer: 1
    explain: "Cloning an Rc or Arc is cheap: it only bumps the count. The value is freed when the count drops to zero."
  - q: "You need several threads to read the same configuration. Which type?"
    options:
      - "Rc<Config>"
      - "Arc<Config>"
      - "Box<Config>"
    answer: 1
    explain: "Arc updates its count with atomic operations, so it is Send and Sync when Config is. Rc isn't Send, and the compiler refuses to move it to another thread."
links:
  - title: "The Rust Book: smart pointers"
    url: https://doc.rust-lang.org/book/ch15-00-smart-pointers.html
  - title: "The Rust Book: Rc, the reference-counted smart pointer"
    url: https://doc.rust-lang.org/book/ch15-04-rc.html
  - title: "The Rust Book: RefCell and interior mutability"
    url: https://doc.rust-lang.org/book/ch15-05-interior-mutability.html
  - title: "std::sync::Arc"
    url: https://doc.rust-lang.org/std/sync/struct.Arc.html
---
In Rust a value lives wherever its owner puts it. A local `i32`, a struct of numbers or a fixed-size array sits in the function's stack frame. Data goes on the heap only when a type explicitly allocates: `Box`, `Vec`, `String`, `HashMap` and the reference-counted pointers. These **smart pointers** are ordinary structs that own heap memory and free it in their `Drop`. Each one exists for a case plain ownership and borrowing can't express.

## The common ones

```rust
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;

#[derive(Debug)]
enum List {
    Cons(i32, Box<List>), // Box gives the recursive type a known size
    Nil,
}

fn sum(list: &List) -> i32 {
    match list {
        List::Cons(v, rest) => v + sum(rest),
        List::Nil => 0,
    }
}

fn main() {
    let list = List::Cons(1, Box::new(List::Cons(2, Box::new(List::Nil))));
    println!("{list:?} sum={}", sum(&list));

    let shared = Rc::new(RefCell::new(vec![1]));
    let other = Rc::clone(&shared); // a second owner, not a copy of the Vec
    other.borrow_mut().push(2);     // borrow rules checked at run time
    println!("{:?} owners={}", shared.borrow(), Rc::strong_count(&shared));

    let config = Arc::new(String::from("prod"));
    let handles: Vec<_> = (0..2)
        .map(|i| {
            let config = Arc::clone(&config); // atomic count: safe across threads
            thread::spawn(move || format!("worker {i} on {config}"))
        })
        .collect();
    for h in handles {
        println!("{}", h.join().unwrap());
    }
}
```

It prints `Cons(1, Cons(2, Nil)) sum=3`, `[1, 2] owners=2`, then `worker 0 on prod` and `worker 1 on prod`.

- **`Box<T>`**: one owner, value on the heap. Use it for recursive types, for large values you want to move cheaply, and for trait objects (`Box<dyn Trait>`).
- **`Rc<T>`**: several owners on one thread. `Rc::clone` increments a counter; the value is dropped when the last `Rc` goes. An `Rc` only gives shared (`&T`) access.
- **`Arc<T>`**: the same, with an atomic counter, so it can cross threads. The atomic operations cost a little more, which is why `Rc` exists.
- **`RefCell<T>`**: interior mutability. `borrow()` and `borrow_mut()` apply the shared-or-mutable rule at run time and panic on a violation. `Rc<RefCell<T>>` is the usual single-threaded "shared and mutable" combination; across threads it is `Arc<Mutex<T>>` or `Arc<RwLock<T>>`.
- **`Cell<T>`** swaps whole `Copy` values in and out with no borrow tracking at all.

## Costs and traps

Every one of these makes a cost visible in the type: a heap allocation, a counter update, a run-time borrow check. That is the trade Rust makes: you pay only where you ask for flexibility.

Reference counting can't free **cycles**. Two `Rc`s pointing at each other keep each other's count above zero forever. For parent links, trees and observer lists, make the back-pointer a `Weak<T>` (from `Rc::downgrade`), which doesn't keep the value alive; `upgrade()` returns `None` once it is gone.

A `RefCell` panic (on Rust 1.99 the message is `RefCell already borrowed`) is the run-time version of a borrow-checker error. If you hit them often, restructure so that ownership is clear rather than wrapping more in `RefCell`.

Heap or stack is mostly invisible in safe code: moving a `Box` moves only the pointer, and dereferencing works through `Deref`, so `*b`, `b.method()` and `&*b` all reach the value inside.
