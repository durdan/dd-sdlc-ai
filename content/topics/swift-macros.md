---
id: swift-macros
title: "Macros"
summary: "Code that writes code, at compile time, in a sandbox"
why: "@Observable, #Preview, #expect and @Model are macros. Knowing how they expand makes their behaviour, their errors and their effect on build times understandable."
requires: [swift-property-wrappers]
lesson: none
points:
  - { title: Two kinds, text: "Freestanding macros (#name) produce an expression or declarations; attached macros (@Name) add to the declaration they are written on." }
  - { title: Implemented with SwiftSyntax, text: "A macro is a separate compiler plug-in that receives syntax trees and returns new source; the result is type-checked like hand-written code." }
  - { title: Additive and visible, text: "Macros can only add code, never delete or silently change yours, and Xcode can show every expansion." }
quiz:
  - q: When does a macro's implementation run?
    options:
      - "At runtime, when the code is first called"
      - "At compile time, in a separate plug-in process that the compiler sends the syntax to"
      - "When the app is installed"
    answer: 1
    explain: "Macros are expanded during compilation. The plug-in gets the syntax of the use site and returns new syntax, which the compiler then checks as normal Swift."
  - q: "What can an attached macro such as @Observable on a class do?"
    options:
      - "Delete properties it doesn't like"
      - "Add members, accessors and conformances to the class it is attached to"
      - "Change the code of other files"
    answer: 1
    explain: "Attached macros have roles (member, accessor, peer, extension, member attribute, body). Each role allows a specific kind of addition, only to the declaration they are attached to."
  - q: "Why do macro packages historically slow down clean builds?"
    options:
      - "Macros are interpreted"
      - "The plug-in depends on swift-syntax, a large package that had to be built from source before the macro could run"
      - "Each macro use starts a new compiler"
    answer: 1
    explain: "Building swift-syntax from source was the main cost. Newer toolchains can use prebuilt swift-syntax (and Swift 6.3 extends that to shared macro libraries), which removes most of it."
links:
  - { title: "Macros (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/macros/" }
  - { title: "SE-0382: Expression macros (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0382-expression-macros.md" }
  - { title: "SE-0389: Attached macros (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0389-attached-macros.md" }
  - { title: "swift-syntax (github.com/swiftlang)", url: "https://github.com/swiftlang/swift-syntax" }
---
**Macros** (Swift 5.9) generate code at compile time. A macro is declared in your library like a function, but implemented by a separate program, a compiler plug-in, that receives the syntax tree of the place where it was used and returns new Swift source. The compiler inserts that source and type-checks it as if you had written it yourself. Unlike C macros there is no text substitution: inputs and outputs are well-formed Swift, and macros can only add code.

## Freestanding and attached

- **Freestanding** macros start with `#`. An expression macro produces a value: `#Preview { ... }`, `#expect(a == b)` in Swift Testing. Declaration macros produce new declarations.
- **Attached** macros start with `@` and add to the declaration they are written on. Each declares one or more **roles**: `member` (add members), `accessor` (turn a stored property into a computed one), `peer` (add declarations next to it), `extension` (add conformances), `memberAttribute` (put attributes on members), and `body` (Swift 6.0, provide a function body).

`@Observable` is an attached macro with several roles. On a class:

```swift
import Observation

@Observable
final class Counter {
    var value = 0
    var label: String { "Count: \(value)" }   // computed: not tracked itself, depends on value
}

let counter = Counter()
withObservationTracking {
    print(counter.label)                      // reading value inside here registers interest
} onChange: {
    print("value will change")
}
counter.value += 1                            // prints "value will change"
```

It adds a private `ObservationRegistrar`, rewrites each stored property into a computed one whose getter reports the access and whose setter reports the change, and adds conformance to the `Observable` protocol. SwiftUI uses exactly this access tracking to know which views read which properties. In Xcode, *Expand Macro* on `@Observable` shows the generated code.

## How a macro is built

A macro lives in a Swift package with two parts:

1. A **declaration** in the library that users import: `@freestanding(expression) public macro stringify<T>(_ value: T) -> (T, String) = #externalMacro(module: "MyMacros", type: "StringifyMacro")`.
2. An **implementation** in a `.macro` target: a type conforming to a protocol such as `ExpressionMacro`, using **SwiftSyntax** to read the arguments and build the expansion.

The plug-in runs in a sandbox, without network or file access, and should be deterministic: the same input must give the same output. Errors are reported as compiler diagnostics at the use site, with fix-its if the macro provides them. Expansions can be unit-tested with `assertMacroExpansion` from SwiftSyntax.

## Costs and cautions

- **Build time.** The implementation depends on swift-syntax, a large package. Building it from source used to add noticeably to clean builds; recent toolchains can use prebuilt swift-syntax, and Swift 6.3 extends that to libraries shared by several macros.
- **Trust.** A macro package runs code in your build. Xcode asks you to trust a macro package before it runs.
- **Readability.** A macro is a small language extension. Prefer a function, generic, property wrapper or result builder when they do the job; reach for a macro when you need to generate declarations or check something at compile time that the type system can't.

Common ones you'll meet: `@Observable` (Observation), `@Model` (SwiftData), `#Preview` (Xcode previews), and `@Test` and `#expect` (Swift Testing).
