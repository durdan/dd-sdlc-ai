---
id: swift
title: "Swift: the language under iOS"
promise: "How Swift's value types, optionals, enums and protocols fit together, what some and any really mean, how closures and ownership relate to ARC, how the compiler checks concurrency, and the language features (property wrappers, result builders, macros) that SwiftUI is built from."
kind: skill
level: intermediate
tags: [languages, mobile]
stages:
  - title: Values and types
    blurb: Structs, optionals, enums, errors
    topics: [swift-values, swift-optionals, swift-enums, swift-errors]
  - title: Abstraction and memory
    blurb: Protocols, generics, closures, ownership
    topics: [swift-protocols, swift-generics, swift-closures, swift-ownership]
  - title: The language under SwiftUI and beyond
    blurb: Isolation, wrappers, builders, macros
    topics: [swift-concurrency-model, swift-property-wrappers, swift-result-builders, swift-macros, swift-beyond-apple]
next: [ios]
---
Everything here is about Swift 6 (the current release is Swift 6.4) and the Swift 6 language mode. The examples were compiled and run with Swift 6.2.4 from Xcode on macOS. Where a feature is recent (typed throws in 6.0, approachable concurrency in 6.2, the Android SDK in 6.3, async `defer` in 6.4), the topic says so. App-level topics, such as the main thread, ARC leaks in view models and how SwiftUI redraws, live in the iOS path; this path is about the language.
