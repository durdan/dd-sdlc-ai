---
id: swift-enums
title: "Enums with associated values"
summary: "Sum types and exhaustive pattern matching"
why: "An enum with associated values says 'exactly one of these, with this data', and switch makes the compiler check that every case is handled. It is the main tool for modelling state in Swift."
requires: [swift-optionals]
lesson: none
points:
  - { title: Each case carries its own data, text: "case loaded([Item]) and case failed(Error) hold different payloads; only the current case's data exists." }
  - { title: switch must be exhaustive, text: "Every case has to be handled (or default used), so adding a case points you at every switch to update." }
  - { title: Patterns go further, text: "if case, guard case, for case and where clauses match and bind associated values anywhere, not only in switch." }
quiz:
  - q: "enum LoadState { case idle, loading, loaded([String]), failed(String) }. Which line gets the items out?"
    options:
      - "let items = state.loaded"
      - "Pattern matching: if case .loaded(let items) = state { ... }"
      - "let items = state as [String]"
    answer: 1
    explain: "Associated values are reached by pattern matching. if case binds them when the case matches; there is no property for them unless you write one."
  - q: "You add case cancelled to an enum in your own module. What happens to a switch over it that has no default?"
    options:
      - "It compiles; cancelled is ignored"
      - "It stops compiling with 'switch must be exhaustive'"
      - "It crashes when cancelled arrives"
    answer: 1
    explain: "The compiler knows all cases of your enum and checks every switch. A default branch would hide the new case, so leave it out for your own enums."
  - q: What is @unknown default for?
    options:
      - "Matching nil"
      - "Switches over enums from other modules that may gain cases later, such as Apple SDK enums: you handle today's cases and get a warning when a new one appears"
      - "Making a switch non-exhaustive"
    answer: 1
    explain: "Non-frozen enums from resilient libraries can grow. @unknown default handles future cases at runtime while the compiler still warns about known cases you missed."
links:
  - { title: "Enumerations (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/enumerations/" }
  - { title: "Patterns (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/patterns/" }
  - { title: "SE-0380: if and switch expressions (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0380-if-switch-expressions.md" }
---
A Swift `enum` can be a plain list of names, but its real strength is **associated values**: each case can carry its own data, of its own types. That makes an enum a *sum type*: a value is exactly one of the cases, and only that case's data exists. Combined with `switch`, which must handle every case, it lets the compiler check that a state machine is complete.

## State as an enum

```swift
enum LoadState {
    case idle
    case loading(progress: Double)
    case loaded([String])
    case failed(message: String, retryable: Bool)
}

func describe(_ state: LoadState) -> String {
    switch state {                                        // no default: the compiler checks every case
    case .idle: "Not started"
    case .loading(let p): "Loading \(Int(p * 100))%"
    case .loaded(let items) where items.isEmpty: "Nothing here"
    case .loaded(let items): "\(items.count) items"
    case .failed(let message, retryable: true): "\(message), tap to retry"
    case .failed(let message, _): message
    }
}

for s: LoadState in [.idle, .loading(progress: 0.4), .loaded([]), .loaded(["a", "b"]),
                     .failed(message: "Offline", retryable: true)] {
    print(describe(s))
}
```

- The `switch` is an expression (Swift 5.9): each branch is a single value and the result is returned directly.
- `where` adds a condition; a guarded case doesn't count as covering everything, so the unguarded `.loaded` is still needed.
- Patterns can match literal values inside a case (`retryable: true`) and ignore parts with `_`.

Compare this to a struct with `isLoading: Bool`, `items: [String]?` and `error: String?`: that allows impossible combinations (loading *and* failed) that the enum can't represent.

## Matching outside switch

```swift
let state = LoadState.loaded(["x"])
if case .loaded(let items) = state { print(items.first ?? "") }      // x

let results: [LoadState] = [.failed(message: "A", retryable: false), .idle]
for case .failed(let message, _) in results { print(message) }       // A
```

`if case`, `guard case` and `for case` take any pattern. `Optional` is itself an enum, which is why `if case let x? = value` works.

## More enum features

- **Raw values**: `enum Weekday: Int { case mon = 1, tue }` gets `rawValue` and a failable `init?(rawValue:)`; `String` raw values default to the case name. Raw values and associated values can't be mixed.
- **`CaseIterable`**: the compiler writes `allCases` for enums without associated values.
- **Methods, computed properties and protocol conformances** live on enums as on structs. `Equatable` and `Hashable` are synthesised when all associated values conform.
- **`indirect`** cases store their payload on the heap, which allows recursive types like `indirect case node(Tree, Tree)`.

## Enums from other modules

Your own enums are **frozen** as far as the compiler is concerned: it knows every case. Enums from libraries built for library evolution (Apple's SDKs) may gain cases in a future OS. Switching over them asks for `@unknown default:`, which handles new cases at runtime and still warns at compile time when a known case is missing.
