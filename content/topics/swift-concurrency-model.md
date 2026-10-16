---
id: swift-concurrency-model
title: "Concurrency in the language: isolation and Sendable"
summary: "How the compiler proves there are no data races"
why: "Swift 6 checks data-race safety at compile time. The errors make sense once you see the model: every piece of code has an isolation domain, and only Sendable values cross between them."
requires: [swift-closures, swift-ownership]
lesson: none
points:
  - { title: Every declaration has an isolation, text: "Code is isolated to an actor (such as the MainActor), or nonisolated; the compiler tracks which, statically." }
  - { title: Crossing needs await and Sendable, text: "Calling into another domain is an await, and the values passed must be Sendable or provably not used again by the sender." }
  - { title: Regions make it practical, text: "Swift 6 lets a non-Sendable value cross if the compiler can see nothing else still refers to it (region-based isolation, sending)." }
  - { title: "Swift 6.2 changed defaults", text: "With approachable concurrency, nonisolated async functions run on the caller's actor, and a module can default everything to the MainActor." }
quiz:
  - q: "In the Swift 6 language mode, a non-final class with a var property is passed from a @MainActor function to an actor method, and the main actor keeps using it afterwards. What happens?"
    options:
      - "It compiles and races at runtime"
      - "A compile error: a non-Sendable value is sent to another isolation domain while still in use"
      - "The class is copied automatically"
    answer: 1
    explain: "The class is not Sendable, and because the sender still uses it, region-based isolation can't prove the transfer is safe. Swift 6 makes this an error, not a warning."
  - q: "With the Swift 6.2 upcoming feature NonisolatedNonsendingByDefault enabled, where does a nonisolated async function called from the main actor run?"
    options:
      - "On the global concurrent executor"
      - "On the caller's actor, here the main actor, unless it is marked @concurrent"
      - "On a new thread"
    answer: 1
    explain: "SE-0461 makes nonisolated async functions run in the caller's isolation by default (nonisolated(nonsending)). @concurrent opts a function back into running off the actor."
  - q: Which type is Sendable without extra annotations?
    options:
      - "A public struct whose stored properties are all Sendable"
      - "An internal struct whose stored properties are all Sendable"
      - "Any final class"
    answer: 1
    explain: "Non-public structs and enums infer Sendable from their stored properties. Public types must declare it (it is a promise to clients), and a class must be final with only immutable Sendable properties."
links:
  - { title: "Concurrency (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/" }
  - { title: "SE-0414: Region based isolation (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0414-region-based-isolation.md" }
  - { title: "SE-0461: Run nonisolated async functions on the caller's actor (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0461-async-function-isolation.md" }
  - { title: "Migrating to Swift 6 (swift.org)", url: "https://www.swift.org/migration/documentation/migrationguide/" }
---
The iOS path's concurrency topic shows tasks and actors in an app. This one is about the model the compiler checks. Since Swift 5.5 the language has `async`/`await`, tasks and actors; the **Swift 6 language mode** (Swift 6.0, 2024) turns the data-race checks from warnings into errors. To make that work, the compiler gives every function, closure and stored property an **isolation domain**, and checks every value that moves between domains.

## Isolation domains

- **Actor-isolated**: code inside an `actor`, or marked with a global actor such as `@MainActor`. Only one piece of an actor's code runs at a time, so its state can't race.
- **Nonisolated**: code that belongs to no actor. It can't touch actor state directly.

Calling into another domain is a potential suspension and needs `await`. Values passed across must be **`Sendable`**: value types made of Sendable parts, actors, immutable final classes, or types that do their own locking and say so with `@unchecked Sendable`.

```swift
struct Order: Sendable { let id: Int; var total: Double }   // value type: safe to send

actor Ledger {
    private var orders: [Order] = []
    func record(_ order: Order) { orders.append(order) }     // isolated to this actor
    var count: Int { orders.count }
}

@MainActor
func checkout(ledger: Ledger) async {
    await ledger.record(Order(id: 1, total: 9.5))            // hop to the actor and back
    print("orders:", await ledger.count)
}

await checkout(ledger: Ledger())
```

## Regions and sending

Requiring `Sendable` everywhere would reject a lot of safe code, such as creating a non-Sendable object and handing it off. **Region-based isolation** (SE-0414, Swift 6.0) lets the compiler track groups of values that refer to each other: if a non-Sendable value's whole region is passed to another domain and never used again by the sender, the transfer is allowed. A `sending` parameter or result (SE-0430) states that contract in a signature; `Task { }` and continuations use it.

## Swift 6.2: approachable concurrency

Swift 6.2 added two new defaults, both opt-in per module (Xcode 26 shows them as the *Approachable Concurrency* and *Default Actor Isolation* build settings):

- **Nonisolated async functions run on the caller's actor** (SE-0461, upcoming feature `NonisolatedNonsendingByDefault`). Before, a nonisolated `async` function always hopped to the global concurrent pool, so calling one from the main actor meant sending its arguments across. Now it is `nonisolated(nonsending)` by default; write `@concurrent` on a function that should really run off the actor, such as heavy decoding.
- **Default actor isolation** (SE-0466): a module can be compiled with `-default-isolation MainActor` (`.defaultIsolation(MainActor.self)` in a package), so unannotated code is main-actor isolated. For UI apps, which are mostly single-threaded, this removes most annotations; background work is then marked explicitly.

These change behaviour, not just diagnostics: the same code can run on a different executor depending on the settings. Check a module's settings before reasoning about where a function runs.

## Other pieces

- **`isolated` parameters** (`func log(on actor: isolated Ledger)`) run a function in the domain of a given actor, and `#isolation` passes the caller's isolation along.
- **Global actors** other than `@MainActor` can be declared with `@globalActor`.
- **`nonisolated(unsafe)`** opts a variable out of checking; it is an escape hatch, like `@unchecked Sendable`.
- Swift 6.4 adds `withTaskCancellationShield` (SE-0504) for cleanup that must finish even when the task is cancelled.

The migration guide on swift.org explains how to move a module to the Swift 6 language mode one warning category at a time.
