---
id: rust-unsafe
title: "unsafe and FFI: what the escape hatch allows"
summary: Five extra powers, the same borrow checker, and a promise you must keep
why: "Every safe abstraction at the bottom (Vec, Mutex, the bindings to C libraries) is built on unsafe code. Knowing exactly what unsafe permits, and what it doesn't, is how you read, review and write it responsibly."
requires: [rust-borrowing, rust-smart-pointers]
lesson: none
points:
  - title: Five superpowers
    text: Dereference a raw pointer, call an unsafe function, use a mutable static, implement an unsafe trait, read a union field. Nothing else.
  - title: The checks stay on
    text: Inside unsafe, types, borrows of references and bounds checks still apply. unsafe only lets you do the five things the compiler can't verify.
  - title: You promise no undefined behaviour
    text: "If unsafe code breaks a rule, such as a dangling pointer or two live &mut to one value, the whole program's behaviour is undefined, not just that block's."
  - title: Wrap it in a safe API
    text: Keep unsafe blocks small, write down why each is sound in a SAFETY comment, and expose a safe function whose signature makes misuse impossible.
quiz:
  - q: "Does wrapping code in unsafe { } turn off the borrow checker?"
    options:
      - Yes, inside the block
      - "No; references are still checked, and unsafe only unlocks five specific operations"
      - Only for mutable references
    answer: 1
    explain: "The Rust Book is explicit: unsafe doesn't disable other safety checks. That is why unsafe code usually works with raw pointers, which the borrow checker doesn't track."
  - q: "let p = &x as *const i32; Which line needs unsafe?"
    options:
      - Creating p
      - "Reading *p"
      - Both
    answer: 1
    explain: "Making a raw pointer is safe; it is just an address. Dereferencing it is unsafe because the compiler can't know it is valid, aligned and pointing at a live i32."
  - q: "In the 2024 edition, how is a block of C function declarations written?"
    options:
      - "extern \"C\" { fn abs(x: i32) -> i32; }"
      - "unsafe extern \"C\" { ... }, where each item can be marked safe or unsafe"
      - "#[ffi] mod c { ... }"
    answer: 1
    explain: "Rust 2024 requires unsafe on extern blocks, because the author is promising the signatures are correct. Items marked safe fn can then be called without an unsafe block."
links:
  - title: "The Rust Book: unsafe Rust"
    url: https://doc.rust-lang.org/book/ch20-01-unsafe-rust.html
  - title: "The Rust Reference: behaviour considered undefined"
    url: https://doc.rust-lang.org/reference/behavior-considered-undefined.html
  - title: "The Edition Guide: unsafe extern blocks"
    url: https://doc.rust-lang.org/edition-guide/rust-2024/unsafe-extern.html
---
The compiler's checks are conservative: they reject some programs that are actually fine because they can't prove them correct. `unsafe` is how you tell the compiler "I have checked this myself". It unlocks exactly five operations that safe Rust forbids, and nothing more. In exchange, you take on the job of making sure the program never has **undefined behaviour**. The standard library's `Vec`, `Mutex` and `Arc` are built this way: a small amount of carefully reviewed unsafe code under an API that is safe to use.

## The five operations

1. Dereference a raw pointer (`*const T` or `*mut T`).
2. Call an `unsafe fn`, including foreign functions.
3. Read or write a `static mut`.
4. Implement an `unsafe trait`, such as `Send` or `Sync` by hand.
5. Read a field of a `union`.

Everything else is still checked inside an `unsafe` block: types, the borrow rules for references, bounds checks on indexing. Writing `unsafe` doesn't make code faster by itself.

## A safe API over unsafe code

```rust
unsafe extern "C" { // edition 2024: extern blocks must be marked unsafe
    safe fn abs(x: i32) -> i32; // we promise this signature is right, so callers need no unsafe
    fn strlen(s: *const std::ffi::c_char) -> usize;
}

fn split_at_mut(v: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    assert!(mid <= v.len());
    let len = v.len();
    let p = v.as_mut_ptr();
    // SAFETY: the two halves don't overlap and both stay inside v.
    unsafe {
        (
            std::slice::from_raw_parts_mut(p, mid),
            std::slice::from_raw_parts_mut(p.add(mid), len - mid),
        )
    }
}

fn main() {
    let mut nums = [1, 2, 3, 4, 5];
    let (a, b) = split_at_mut(&mut nums, 2);
    a[0] = 10;
    b[0] = 30;
    println!("{nums:?}");

    let x = 7;
    let p = &x as *const i32; // making a raw pointer is safe
    let y = unsafe { *p };     // dereferencing one is not
    let n = unsafe { strlen(c"hello".as_ptr()) }; // c"..." literals: Rust 1.77+
    println!("{y} {} {n}", abs(-3));
}
```

It prints `[10, 2, 30, 4, 5]` and `7 3 5`. The borrow checker can't see that two mutable slices of one array don't overlap, so `split_at_mut` (a simplified copy of the standard library's method) proves it with an `assert!` and then builds the slices from raw pointers. Callers get an ordinary safe function.

## What counts as undefined behaviour

The Reference lists it. The main items: dereferencing a dangling, null or misaligned pointer; a data race; breaking the aliasing rules (for example a `&mut T` and another live reference to the same value); producing an invalid value, such as a `bool` that is not 0 or 1 or a `char` outside Unicode; and reading uninitialised memory. The compiler optimises on the assumption that these never happen, so their effects can show up far from the bug. Tools help: `cargo miri test` (on nightly) interprets your tests and reports many kinds of undefined behaviour.

## FFI

Calling C means declaring its functions in an `extern "C"` block. In the 2024 edition the block must be written `unsafe extern`, since you are vouching for the signatures, and each item can be marked `safe` or `unsafe`. Use the types in `std::ffi` (`c_char`, `CStr`, `CString`) and `#[repr(C)]` structs so layouts match. Exporting Rust functions to C uses `#[unsafe(no_mangle)]` in 2024 and `extern "C" fn`. A panic must not unwind across a plain `extern "C"` boundary; Rust aborts the process if one tries. Tools such as `bindgen` generate declarations from C headers.

Also new in 2024: `unsafe_op_in_unsafe_fn` warns by default, so even inside an `unsafe fn` each unsafe operation goes in its own `unsafe { }` block with its own justification.
