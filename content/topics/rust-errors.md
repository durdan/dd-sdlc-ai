---
id: rust-errors
title: "Errors: Result and the ? operator"
summary: Failures are values in the return type; ? passes them up
why: "A function's signature tells you whether it can fail and how. The ? operator keeps the happy path readable, and From conversions let each layer speak its own error type."
requires: [rust-enums]
lesson: none
points:
  - title: Result is an enum
    text: "Result<T, E> is Ok(T) or Err(E). The compiler warns if you ignore one, because Result is marked must_use."
  - title: "? returns early on Err"
    text: "expr? gives the Ok value, or returns the Err from the current function, converting it with From::from on the way."
  - title: panic is for bugs
    text: panic! unwinds the thread (or aborts, if configured). unwrap and expect panic too; keep them for cases that really can't happen.
  - title: Libraries define types, applications box them
    text: A library usually returns its own error enum. An application often uses Box<dyn Error> or a crate such as anyhow to collect anything.
quiz:
  - q: "In a function returning Result<u32, ConfigError>, what does text.parse::<u32>()? need in order to compile?"
    options:
      - Nothing; ? works with any error type
      - "impl From<ParseIntError> for ConfigError, so ? can convert the error"
      - "The function must return Result<u32, ParseIntError>"
    answer: 1
    explain: "? calls From::from on the error before returning it. Without a conversion from ParseIntError to ConfigError the types don't line up and it doesn't compile."
  - q: "Can ? be used in main?"
    options:
      - No, never
      - "Yes, if main returns a Result such as Result<(), Box<dyn Error>>"
      - Only in tests
    answer: 1
    explain: "main may return Result<(), E> where E: Debug. If it returns Err, the error is printed and the process exits with a failure status."
  - q: "When is unwrap() a reasonable choice?"
    options:
      - Whenever you are sure enough
      - "When failure would mean a bug in your own program, ideally as expect(\"reason\")"
      - For reading user input
    answer: 1
    explain: "unwrap turns an error into a panic. For input, files and networks, failure is expected and should be a Result the caller handles."
links:
  - title: "The Rust Book: recoverable errors with Result"
    url: https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html
  - title: "std::result module documentation"
    url: https://doc.rust-lang.org/std/result/index.html
  - title: "The Rust Reference: the try propagation (?) expression"
    url: https://doc.rust-lang.org/reference/expressions/operator-expr.html#the-try-propagation-expression
---
Rust separates two kinds of failure. **Recoverable** failures, such as a missing file, bad input or a refused connection, are values of type `Result<T, E>`, an enum that is either `Ok(T)` or `Err(E)`. The possibility of failure is in the signature, and the compiler warns if you ignore a `Result`. **Unrecoverable** failures, bugs, are `panic!`s. The `?` operator makes the first kind nearly as convenient as exceptions while keeping every exit point visible.

## Your own error type, and ?

```rust
use std::fmt;
use std::num::ParseIntError;

#[derive(Debug)]
enum ConfigError {
    Missing(&'static str),
    BadNumber(ParseIntError),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::Missing(k) => write!(f, "missing key {k}"),
            ConfigError::BadNumber(e) => write!(f, "bad number: {e}"),
        }
    }
}

impl std::error::Error for ConfigError {}

impl From<ParseIntError> for ConfigError { // lets ? convert the error for us
    fn from(e: ParseIntError) -> Self {
        ConfigError::BadNumber(e)
    }
}

fn workers(raw: Option<&str>) -> Result<u32, ConfigError> {
    let text = raw.ok_or(ConfigError::Missing("workers"))?;
    let n: u32 = text.trim().parse()?; // ParseIntError -> ConfigError via From
    Ok(n)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("{:?}", workers(Some(" 8 ")));
    println!("{}", workers(None).unwrap_err());
    println!("{}", workers(Some("eight")).unwrap_err());
    let n = workers(Some("4"))?; // in main too, because main returns Result
    println!("running {n} workers");
    Ok(())
}
```

Output: `Ok(8)`, `missing key workers`, `bad number: invalid digit found in string`, `running 4 workers`.

`expr?` means: if `expr` is `Ok(v)`, the value is `v`; if it is `Err(e)`, return `Err(From::from(e))` from the enclosing function right now. The `From` impl is what lets one function call code with different error types and still return its own. `?` also works on `Option` in a function returning `Option`. `ok_or` converts an `Option` into a `Result`.

`main` can return `Result<(), E>` for any `E: Debug`. Returning `Err` prints the error and exits with a non-zero status. `Box<dyn std::error::Error>` accepts any error type, through a blanket `From` impl.

## Choosing error types

- **Libraries** usually return an enum like `ConfigError`, so callers can `match` on the cases. The `thiserror` crate derives the `Display`, `Error` and `From` boilerplate above.
- **Applications** often care more about a good message than about matching. `Box<dyn Error>` or the `anyhow` crate collect any error and let you add context (`.context("reading config")`).
- Implement `Error::source()` (or let `thiserror` do it) so a chain of causes can be printed, much like Go's wrapped errors.

## Panics

`panic!`, `unwrap()`, `expect()`, array indexing out of bounds and integer overflow in debug builds all panic. By default a panic unwinds the current thread's stack, running `Drop` for every value as it goes, and ends the thread; in the main thread that ends the program. Setting `panic = "abort"` in a Cargo profile skips unwinding and makes binaries smaller. `std::panic::catch_unwind` exists for FFI boundaries and thread pools, not for ordinary error handling.

A useful habit: convert errors at boundaries. Inside a module, use a precise error type; at the edge of the program (an HTTP handler, `main`), turn it into a status code or a message for a human, and log the full chain of `source()` causes once.

Use `expect("why this can't fail")` rather than bare `unwrap()` when you do assert something: the message is the documentation.
