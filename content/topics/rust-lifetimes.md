---
id: rust-lifetimes
title: Lifetimes
summary: Names for how long a borrow is valid, so signatures can relate them
why: "Lifetime annotations look intimidating but say something simple: which input a returned reference borrows from. Reading them lets you design APIs that borrow instead of clone."
requires: [rust-borrowing]
lesson: none
points:
  - title: Every reference has a lifetime
    text: It is the region of code in which the reference is valid. The compiler infers it inside function bodies.
  - title: Annotations relate, they don't extend
    text: "'a in a signature says the output borrows from these inputs. It never makes any value live longer."
  - title: Elision covers the common cases
    text: With one reference input, or a &self method, the output lifetime is filled in for you. You write them only when it is ambiguous.
  - title: Structs that borrow carry one
    text: "A struct holding a reference, such as Parser<'src>, can't outlive the data it points into."
quiz:
  - q: "fn longest(x: &str, y: &str) -> &str doesn't compile. Why?"
    options:
      - Strings can't be returned from functions
      - "The compiler can't tell whether the result borrows from x or from y, so it asks you to say"
      - "&str needs to be String"
    answer: 1
    explain: "error[E0106]: missing lifetime specifier. With two reference inputs, elision has no rule to pick one. fn longest<'a>(x: &'a str, y: &'a str) -> &'a str says the result is valid while both are."
  - q: "What does 'a mean in fn first<'a>(s: &'a str) -> &'a str?"
    options:
      - s will live for the whole program
      - The returned reference may be used only as long as the borrow of s is valid
      - The function allocates a new string with lifetime 'a
    answer: 1
    explain: "The annotation links the output to the input. Callers then get an error if they use the result after the string it came from is dropped."
  - q: "What does a &'static str guarantee?"
    options:
      - The string is on the heap
      - "The data is valid for the rest of the program, as string literals are"
      - The string can be changed
    answer: 1
    explain: "'static means the referenced data is never freed while the program runs. String literals are baked into the binary, so they have that lifetime."
links:
  - title: "The Rust Book: validating references with lifetimes"
    url: https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html
  - title: "The Rust Reference: lifetime elision"
    url: https://doc.rust-lang.org/reference/lifetime-elision.html
  - title: "Rust 1.89: the mismatched lifetime syntaxes lint"
    url: https://blog.rust-lang.org/2025/08/07/Rust-1.89.0/
---
A **lifetime** is the stretch of the program during which a reference is valid. Inside a function the compiler works lifetimes out on its own. At function boundaries it can't see the bodies of callers and callees, so signatures must say how the references going in and coming out are related. That is all a lifetime parameter such as `'a` does: it names a region so the signature can say "the result borrows from this input". It never changes how long any value actually lives.

## When you have to write them

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

struct Parser<'src> {
    input: &'src str, // a Parser cannot outlive the text it points into
}

impl<'src> Parser<'src> {
    fn first_word(&self) -> &'src str {
        self.input.split_whitespace().next().unwrap_or("")
    }
}

fn first_char(s: &str) -> &str { // elided: same as fn first_char<'a>(s: &'a str) -> &'a str
    &s[..1]
}

fn main() {
    let a = String::from("ownership");
    let w;
    {
        let b = String::from("borrow");
        println!("{}", longest(&a, &b)); // fine: used while both are alive
        let p = Parser { input: &a };
        w = p.first_word(); // tied to a, not to p
    }
    println!("{w} {}", first_char("rust"));
}
```

It prints `ownership`, then `ownership r`. Without the annotations, `longest` fails with:

```text
error[E0106]: missing lifetime specifier
  |
1 | fn longest(x: &str, y: &str) -> &str {
  |               ----     ----     ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
```

With `'a` on both inputs, the result is valid for the region where *both* are valid. The caller can't keep the result after either string is dropped.

`first_word` returns `&'src str`, not a borrow of `self`. That is why `w` stays valid after `p` is gone: it points into `a`, which is still alive. Choosing which lifetime an output carries is real API design.

## Elision rules

Most signatures need no annotations because of three elision rules:

1. Each elided lifetime in the inputs gets its own parameter.
2. If there is exactly one input lifetime, it is used for every elided output lifetime.
3. If one input is `&self` or `&mut self`, its lifetime is used for elided outputs.

If the rules don't settle an output's lifetime, you must write it. Since Rust 1.89 a lint, `mismatched_lifetime_syntaxes`, warns when a signature hides a lifetime in one place but shows it in another, such as `fn make(s: &str) -> Thing` where `Thing` secretly borrows from `s`; writing `-> Thing<'_>` makes the borrow visible.

## 'static

`'static` means the data lives until the program ends. String literals are `&'static str`. As a *bound*, `T: 'static` means the type holds no borrowed data that could expire. Owned types like `String` satisfy it. That is why `std::thread::spawn` and `tokio::spawn` require it: the new thread or task may outlive the caller's stack.

## When lifetimes fight you

If a struct needs several lifetime parameters, or you keep reaching for `'static` to make errors go away, the data probably wants to be owned: store a `String`, or share it with `Rc` or `Arc`. Borrowing structs work best for short-lived views such as parsers, iterators and guards.
