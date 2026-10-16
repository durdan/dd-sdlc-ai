---
id: swift-optionals
title: "Optionals and unwrapping"
summary: "Optional is an enum; ?, ?? and if let take it apart"
why: "Swift makes 'might be missing' part of the type, and every way of getting the value out says something about what you expect. Force-unwrapping is the only one that can crash."
requires: [swift-values]
lesson: none
points:
  - { title: An enum with two cases, text: "T? is Optional<T>: either .none (nil) or .some(value). A plain T can never be nil." }
  - { title: Unwrap by binding, text: "if let and guard let give you a non-optional name; guard keeps the happy path unindented." }
  - { title: Chain and default, text: "a?.b?.c stops at the first nil; ?? supplies a value when the left side is nil." }
  - { title: "! is a promise", text: "Force-unwrapping a nil traps the program; implicitly unwrapped T! does that implicitly." }
quiz:
  - q: "let n = Int(\"42x\"). What is the type and value of n?"
    options:
      - "Int, 0"
      - "Int?, nil"
      - "It throws an error"
    answer: 1
    explain: "The failable initialiser Int(_ text:) returns Int?, and nil when the text isn't a number. You must unwrap it before doing arithmetic."
  - q: What does guard let user else { return } do that if let user { } doesn't?
    options:
      - "Nothing; they are identical"
      - "It keeps the unwrapped user available for the rest of the enclosing scope, and forces the else branch to leave it"
      - "It works with non-optionals"
    answer: 1
    explain: "guard's else must exit (return, throw, break, continue). After it, user is non-optional for the rest of the function, which avoids nested ifs."
  - q: "What is the type of user?.address?.city when city is a String property?"
    options:
      - "String"
      - "String?"
      - "String??"
    answer: 1
    explain: "Optional chaining flattens: however many ?. links there are, the result is a single optional of the last property's type."
links:
  - { title: "The Basics: optionals (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/" }
  - { title: "Optional chaining (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/optionalchaining/" }
  - { title: "SE-0345: if let shorthand (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0345-if-let-shorthand.md" }
---
In Swift a `String` is always a string. A value that may be missing has the type `String?`, which is shorthand for `Optional<String>`, an ordinary generic enum with two cases: `.none`, written `nil`, and `.some(wrapped)`. Because it is a separate type, the compiler won't let you use a `String?` where a `String` is needed until you have said what happens when it is `nil`.

## Getting the value out

```swift
struct Address { var city: String? }
struct User { var name: String; var address: Address? }

func greeting(for user: User?) -> String {
    guard let user else { return "Hello, stranger" }        // Swift 5.7 shorthand for guard let user = user
    let city = user.address?.city ?? "somewhere"             // chain, then default
    return "Hello \(user.name) from \(city)"
}

print(greeting(for: nil))                                                // Hello, stranger
print(greeting(for: User(name: "Ada", address: Address(city: "London"))))  // Hello Ada from London
print(greeting(for: User(name: "Bo", address: nil)))                      // Hello Bo from somewhere

if let n = Int("42") { print(n + 1) }                                   // 43
```

- **`if let x` / `guard let x`** bind a non-optional name. Since Swift 5.7 you can leave out `= x` when the names match. `guard` must leave the scope in its `else`, and the bound name stays available afterwards, which keeps the main path flat.
- **Optional chaining** `a?.b?.c()` evaluates to `nil` as soon as one link is `nil`. The result is always a single optional, however long the chain.
- **Nil-coalescing** `a ?? b` gives the wrapped value or `b`. The right side is only evaluated when needed.
- **`map` and `flatMap`** transform the wrapped value: `Int(text).map { $0 * 2 }`.
- **`switch`** works too, with `case .some(let v)` or the `case let v?` pattern, because it is just an enum.

## Force-unwrapping

`value!` returns the wrapped value or **traps**: the program stops with "Unexpectedly found nil while unwrapping an Optional value". Treat each `!` as an assertion that `nil` is impossible here, and prefer a `guard` with a useful failure, or `precondition`, when it really is a programmer error.

**Implicitly unwrapped optionals** (`var label: UILabel!`) are optionals that unwrap themselves on use. They exist for values that can't be set in `init` but are always set before use, such as Interface Builder outlets. Anywhere else, a plain optional or a non-optional with a proper initialiser is safer.

## Optionals and Objective-C

APIs from Objective-C come in with nullability from their annotations (`nullable`, `nonnull`, or a whole header in `NS_ASSUME_NONNULL_BEGIN`). Unannotated pointers are imported as implicitly unwrapped optionals, Swift's way of saying "unknown". The idea is close to Kotlin's platform types: the uncertainty sits at the border, so handle it there.

## Design tips

Don't make something optional because it is convenient; make it optional because "missing" is a real state. An `Optional<Bool>` with three states is usually an enum waiting to be written. And `Optional` of a collection is rarely needed: an empty array usually says the same thing.
