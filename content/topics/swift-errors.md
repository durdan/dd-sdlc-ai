---
id: swift-errors
title: "Errors: throws, try and typed throws"
summary: "Errors are values; Swift 6 can say which type"
why: "Swift's errors look like exceptions but are ordinary return paths that the compiler makes you mark. Swift 6 adds typed throws, which is useful in a few places and a trap in others."
requires: [swift-enums]
lesson: none
points:
  - { title: throws is part of the signature, text: "A throwing function must be called with try, inside do/catch or another throwing function; nothing is thrown invisibly." }
  - { title: Errors are values, text: "Any type conforming to Error can be thrown, usually an enum with associated values; throwing is a cheap return, not stack unwinding." }
  - { title: "try? and try!", text: "try? turns an error into nil; try! traps if an error is thrown." }
  - { title: "Typed throws (Swift 6)", text: "throws(ParseError) fixes the error type, so catch gets a ParseError instead of any Error." }
quiz:
  - q: "What is the type of try? parse(\"x\") when parse returns Int and throws?"
    options:
      - "Int"
      - "Int?"
      - "Result<Int, Error>"
    answer: 1
    explain: "try? converts a thrown error into nil, so the result is optional. The error itself is lost, so use it only when the reason doesn't matter."
  - q: "func load() throws(NetworkError). In do { try load() } catch { ... }, what is the type of error in the catch block?"
    options:
      - "any Error"
      - "NetworkError"
      - "Never"
    answer: 1
    explain: "With typed throws the compiler knows the only error type the do body can throw, so the implicit error constant has that type and an exhaustive switch over it needs no default."
  - q: Why does the Swift book recommend untyped throws for most code?
    options:
      - "Typed throws is slower"
      - "A public API that commits to one error type can't add new kinds of failure later without breaking callers, and errors from lower layers must be wrapped"
      - "Typed throws doesn't work with async"
    answer: 1
    explain: "Typed throws fits code that only rethrows its callers' errors, closed modules, and embedded code. For most APIs, any Error stays flexible."
links:
  - { title: "Error handling (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/" }
  - { title: "SE-0413: Typed throws (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0413-typed-throws.md" }
---
Swift's error handling uses the words of exceptions (`throw`, `try`, `catch`) but works more like a second return value. A function marked `throws` can return normally or hand back a value conforming to `Error`, and every call to it must be marked with `try`, so a reader can see each point where control may leave. Throwing doesn't unwind the stack in the C++ sense; it is a fast return path checked by the compiler.

## The basics

```swift
import Foundation

enum ParseError: Error {
    case empty
    case notANumber(String)
}

func parsePrice(_ text: String) throws(ParseError) -> Int {    // typed throws, Swift 6.0
    let trimmed = text.trimmingCharacters(in: .whitespaces)
    guard !trimmed.isEmpty else { throw .empty }
    guard let cents = Int(trimmed) else { throw .notANumber(trimmed) }
    return cents
}

for input in ["250", "  ", "abc"] {
    do {
        print(try parsePrice(input))
    } catch {                                   // error is ParseError, not any Error
        switch error {
        case .empty: print("empty input")
        case .notANumber(let t): print("not a number: \(t)")
        }
    }
}

let maybe = try? parsePrice("12")              // Int? : 12
print(maybe ?? 0)
```

- `do { } catch { }` handles errors; several `catch` clauses can match patterns (`catch ParseError.empty`). An unqualified `catch` binds `error`.
- `try?` turns a thrown error into `nil`. `try!` traps if anything is thrown, the error version of `!`.
- `defer { }` runs when the scope is left by any path, including a throw, which is where cleanup goes. Since Swift 6.4, a `defer` block can also `await` async calls.
- `rethrows` marks a function that throws only if a closure passed to it does, like `map`.

## Typed throws

Before Swift 6, a throwing function could throw any `Error`, so a `catch` always received `any Error` and needed a fallback. **Typed throws** (SE-0413, Swift 6.0) lets a function declare the exact type: `throws(ParseError)`. Callers that catch get a `ParseError` and can switch over it exhaustively. Two spellings fall out of the design: plain `throws` means `throws(any Error)`, and `throws(Never)` means the function doesn't throw at all, which lets generic code such as `map` pass a closure's error type through.

The Swift book's advice is to keep plain `throws` as the default. Typed throws fits:

- code that only passes on the errors of a closure it was given (generic algorithms),
- an internal module where the set of failures really is closed,
- Embedded Swift and other constrained code where boxing an `any Error` isn't wanted.

For a public API it is a commitment: adding a new failure kind later is a source-breaking change, and errors from lower layers have to be wrapped into your type.

## Result, and when not to throw

`Result<Success, Failure: Error>` stores an outcome as a value, for when you need to keep an error around or hand it across a callback boundary. `try result.get()` turns it back into a throw. With async/await, most callback-shaped `Result` code becomes a plain `async throws` function.

Not everything is an error. A missing dictionary key is an optional; a broken invariant is a `precondition` failure that stops the program. Throw when the caller can reasonably do something about the failure: retry, show a message, choose another path.
