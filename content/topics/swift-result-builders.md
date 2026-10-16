---
id: swift-result-builders
title: "Result builders: how SwiftUI's DSL works"
summary: "A list of statements turned into nested function calls"
why: "A SwiftUI body looks like markup but is Swift code rewritten by a result builder. Knowing the rewrite explains why only some statements are allowed and why one branch can't return a different view type."
requires: [swift-closures, swift-generics]
lesson: none
points:
  - { title: A compile-time rewrite, text: "Inside a builder closure, each expression statement becomes an argument to static buildXxx methods on the builder type." }
  - { title: Control flow maps to methods, text: "if becomes buildOptional or buildEither, for-in becomes buildArray; anything without a method isn't allowed." }
  - { title: Types are kept, text: "ViewBuilder keeps the exact type of each branch (a TupleView, a _ConditionalContent), which is why body is some View." }
quiz:
  - q: What does the compiler do with the statements inside a @ViewBuilder closure?
    options:
      - "Runs them and collects the views at runtime with reflection"
      - "Rewrites them at compile time into calls to ViewBuilder's static build methods, combining the values into one result"
      - "Treats them as a string template"
    answer: 1
    explain: "A result builder is a source transformation. Each statement's value is captured in a local and passed to buildBlock, buildEither and friends."
  - q: "Why does an if/else inside a ViewBuilder produce a different type than the same if/else returning views from a normal function?"
    options:
      - "It doesn't"
      - "The builder wraps the branches with buildEither, producing one type that can hold either branch (_ConditionalContent), so both branches may have different view types"
      - "Views inside if are erased to AnyView"
    answer: 1
    explain: "A normal function returning some View must return one type on all paths. The builder turns the two branches into a single conditional type, so it type-checks."
  - q: "Which statement is not allowed in a builder that only implements buildBlock?"
    options:
      - "A let declaration"
      - "An if without else"
      - "A single expression"
    answer: 1
    explain: "An if without else needs buildOptional; if/else needs buildEither; for-in needs buildArray. Declarations like let are always allowed and don't become components."
links:
  - { title: "Advanced operators: result builders (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators/" }
  - { title: "Attributes: resultBuilder (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/attributes/" }
  - { title: "SE-0289: Result builders (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0289-result-builders.md" }
---
A **result builder** (Swift 5.4, SE-0289) is a type marked `@resultBuilder` with static methods that tell the compiler how to combine values. When a closure or function body is annotated with that builder, the compiler rewrites it: every expression statement becomes a value, and those values are passed to the builder's `buildBlock`, `buildOptional`, `buildEither` and `buildArray` methods. SwiftUI's `@ViewBuilder` is one; the `Regex { }` DSL in RegexBuilder is another.

## A small builder

```swift
@resultBuilder
enum HTMLBuilder {
    static func buildBlock(_ parts: String...) -> String { parts.joined() }
    static func buildOptional(_ part: String?) -> String { part ?? "" }          // if without else
    static func buildEither(first part: String) -> String { part }               // if branch
    static func buildEither(second part: String) -> String { part }              // else branch
    static func buildArray(_ parts: [String]) -> String { parts.joined() }       // for-in
}

func ul(@HTMLBuilder _ content: () -> String) -> String { "<ul>\(content())</ul>" }
func li(_ text: String) -> String { "<li>\(text)</li>" }

let loggedIn = true
let items = ["Home", "Docs"]

let html = ul {
    for item in items { li(item) }
    if loggedIn { li("Profile") } else { li("Sign in") }
    li("Help")
}
print(html)   // <ul><li>Home</li><li>Docs</li><li>Profile</li><li>Help</li></ul>
```

## The rewrite

The compiler turns the closure body into roughly:

```swift
let v0 = HTMLBuilder.buildArray(items.map { item in HTMLBuilder.buildBlock(li(item)) })
let v1: String
if loggedIn { v1 = HTMLBuilder.buildEither(first: HTMLBuilder.buildBlock(li("Profile"))) }
else        { v1 = HTMLBuilder.buildEither(second: HTMLBuilder.buildBlock(li("Sign in"))) }
let v2 = li("Help")
return HTMLBuilder.buildBlock(v0, v1, v2)
```

Statements the builder has no method for are rejected: without `buildOptional`, an `if` with no `else` is a compile error. `let` declarations are allowed and don't become components. `buildExpression` can convert each statement's value first, `buildFinalResult` the end result, and `buildPartialBlock` (Swift 5.7) lets a builder fold components two at a time instead of needing an overload per count.

## What ViewBuilder does with types

`ViewBuilder` keeps the **type** of everything it combines. Three views in a block become a `TupleView<(Text, Image, Button<Text>)>`. An `if`/`else` becomes `_ConditionalContent<A, B>` through `buildEither`, which is why the two branches may contain different view types even though a normal function returning `some View` couldn't do that. An `if` without `else` becomes an `Optional<A>`, and `ForEach` handles loops (it is a view, not `buildArray`).

That full static type is how SwiftUI knows the structure of a view hierarchy: which parts can change and which stay the same, and so which views keep their identity and state. It is also why `body` is declared `some View`: the real type is enormous and changes with every edit. Wrapping branches in `AnyView` erases that information, so it is best kept for the rare places that need it.

## Writing your own

Builders work for any type: SQL fragments, attributed strings, routing tables, test fixtures. Keep the component type simple, add only the control-flow methods you want to support, and remember that compile times grow with deeply nested builder expressions, because the compiler type-checks the whole rewritten body at once.
