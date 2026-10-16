---
id: swift-protocols
title: "Protocols and protocol extensions"
summary: "Requirements, default implementations, and the dispatch trap"
why: "Protocols are how Swift shares behaviour between structs, enums and classes. Extensions add free implementations, but only requirements are dispatched dynamically, which surprises almost everyone once."
requires: [swift-values]
lesson: none
points:
  - { title: A protocol is a contract, text: "It lists required methods, properties and initialisers; any struct, enum, class or actor can conform." }
  - { title: Extensions add behaviour, text: "A protocol extension can implement requirements (defaults) and add new methods for every conforming type." }
  - { title: Only requirements are dynamic, text: "A method declared only in the extension is chosen by the static type, so a conforming type's own version may be skipped." }
  - { title: Conformance can be added later, text: "extension Int: MyProtocol {} retroactively makes an existing type conform, even one you don't own." }
quiz:
  - q: "protocol Greeter {} with extension Greeter { func hi() -> String { \"generic\" } }, and struct En: Greeter { func hi() -> String { \"hello\" } }. What does let g: any Greeter = En(); g.hi() return?"
    options:
      - "\"hello\""
      - "\"generic\""
      - "It doesn't compile"
    answer: 1
    explain: "hi() is not a requirement of Greeter, so a call through the protocol type is resolved statically to the extension. Declare hi() inside the protocol to make it dynamically dispatched."
  - q: How does a protocol extension provide a default implementation?
    options:
      - "By declaring the method as default func"
      - "By implementing a requirement in an extension of the protocol; conforming types that don't implement it get that version"
      - "Protocols can't have default implementations"
    answer: 1
    explain: "Implementing a requirement in the extension makes it the fallback. A conforming type's own implementation wins, through the protocol's witness table."
  - q: "What does a where clause on a protocol extension, like extension Collection where Element: Numeric, do?"
    options:
      - "Makes every Collection Numeric"
      - "Adds the extension's members only to collections whose elements are Numeric"
      - "Checks the condition at runtime"
    answer: 1
    explain: "A constrained extension adds methods only for types that meet the constraint, so [1, 2].sum() can exist without strings getting a sum()."
links:
  - { title: "Protocols (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols/" }
  - { title: "Extensions (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/extensions/" }
---
A **protocol** describes what a type can do: a list of required methods, properties, initialisers and associated types. Structs, enums, classes and actors can all conform, which is why Swift code reaches for protocols where other languages use base classes. **Protocol extensions** then add implementations that every conforming type gets, so a protocol can carry shared behaviour without inheritance.

## Requirements and defaults

```swift
protocol Shape {
    var area: Double { get }                 // requirement
    func describe() -> String                // requirement, with a default below
}

extension Shape {
    func describe() -> String { "a shape of area \(area)" }   // default implementation
    func isLarger(than other: some Shape) -> Bool { area > other.area }  // extra method, not a requirement
}

struct Square: Shape {
    var side: Double
    var area: Double { side * side }
    func describe() -> String { "a square with side \(side)" }   // overrides the default
}

struct Circle: Shape {
    var radius: Double
    var area: Double { 3.14159 * radius * radius }               // uses the default describe()
}

let shapes: [any Shape] = [Square(side: 2), Circle(radius: 1)]
for s in shapes { print(s.describe()) }
print(Square(side: 2).isLarger(than: Circle(radius: 1)))        // true
```

Conformance can also be added in an extension, even to types you don't own: `extension Int: Shape { ... }`. Grouping each conformance in its own extension is common Swift style.

## The dispatch trap

Calls to a **requirement** go through the type's *witness table*, so the conforming type's own implementation always runs. A method that exists **only in the protocol extension** is not in that table: it is chosen by the static type at the call site.

```swift
protocol Greeter {}
extension Greeter { func hi() -> String { "generic hi" } }   // not a requirement

struct English: Greeter { func hi() -> String { "hello" } }

let direct = English()
let boxed: any Greeter = English()
print(direct.hi())   // hello
print(boxed.hi())    // generic hi: resolved statically through the protocol
```

The fix is to declare `func hi() -> String` inside `protocol Greeter`. The same thing happens in generic code (`func greet<T: Greeter>(_ g: T)` calls the extension version) and is the Swift twin of Kotlin's statically resolved extension functions.

## Constrained extensions

`where` clauses add members only for some conforming types:

```swift
extension Collection where Element: Numeric {
    func total() -> Element { reduce(0, +) }
}
print([1, 2, 3].total())        // 6
print([0.5, 0.25].total())      // 0.75
```

This is how the standard library gives `Array` a `sorted()` only when its elements are `Comparable`, and `==` only when they are `Equatable`.

## Synthesised conformances

For `Equatable`, `Hashable`, `Comparable` (enums) and `Codable`, the compiler writes the implementation when all stored properties (or associated values) conform. You only declare the conformance. Two protocols that matter beyond this: `Sendable` (safe to share across concurrency domains, covered later) and `Identifiable`, which SwiftUI uses to track items in lists.

Protocols with associated types and the `some` and `any` keywords are the next topic.
