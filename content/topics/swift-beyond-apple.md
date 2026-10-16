---
id: swift-beyond-apple
title: "Swift outside Apple platforms"
summary: "Linux servers, Android, WebAssembly and microcontrollers"
why: "Swift is open source and runs well beyond iPhones. Knowing what works where (and which libraries are Apple-only) matters the moment you share code with a server or another platform."
requires: [swift-concurrency-model]
lesson: none
points:
  - { title: The language is everywhere, text: "The compiler, standard library, Foundation, Swift Testing and SwiftPM run on macOS, Linux and Windows; UIKit and SwiftUI don't." }
  - { title: Servers are a real use, text: "SwiftNIO, Vapor and Hummingbird power production services, with Swift concurrency and small memory use." }
  - { title: "SDKs for other targets", text: "Cross-compilation SDKs exist for static Linux binaries, Android (official in Swift 6.3) and WebAssembly." }
  - { title: Embedded Swift, text: "A compilation mode for microcontrollers that drops the parts of the runtime needing a heap or reflection." }
quiz:
  - q: "You want to share model and validation code between an iOS app and a Swift server on Linux. Which import is a problem in the shared package?"
    options:
      - "import Foundation"
      - "import SwiftUI"
      - "import Testing"
    answer: 1
    explain: "SwiftUI and UIKit exist only on Apple platforms. Foundation (the open-source swift-foundation) and Swift Testing are available on Linux too."
  - q: What does the Static Linux SDK produce?
    options:
      - "A Docker image"
      - "A fully statically linked Linux executable that runs without a Swift runtime installed on the host"
      - "A macOS app"
    answer: 1
    explain: "The SDK links against musl and the Swift runtime statically, so the binary runs on any Linux distribution of the right architecture, which simplifies deployment."
  - q: "What is Embedded Swift?"
    options:
      - "A separate language"
      - "A compilation mode and subset of Swift for constrained devices, producing small binaries without parts of the runtime such as full reflection"
      - "Swift running inside a web browser"
    answer: 1
    explain: "Most code works the same, but features that need runtime metadata are limited. Each release widens the subset; Swift 6.4 adds existential types and richer error handling."
links:
  - { title: "Swift on Server (swift.org)", url: "https://www.swift.org/documentation/server/" }
  - { title: "Getting started with the Static Linux SDK (swift.org)", url: "https://www.swift.org/documentation/articles/static-linux-getting-started.html" }
  - { title: "Getting started with the Swift SDK for Android (swift.org)", url: "https://www.swift.org/documentation/articles/swift-sdk-for-android-getting-started.html" }
  - { title: "Swift 6.4 released (swift.org blog)", url: "https://www.swift.org/blog/swift-6.4-released/" }
---
Swift has been open source since 2015, and the toolchain from swift.org runs on macOS, Linux and Windows. What comes with it everywhere is the language, the standard library, **Foundation** (rewritten in Swift as swift-foundation, the same code on all platforms since Swift 6.0), Swift concurrency, Swift Testing and the Swift Package Manager. What doesn't come with it is Apple's app frameworks: **SwiftUI, UIKit, Core Data and the rest are Apple-only**. Code that sticks to the standard library and Foundation can be shared; code that imports UI frameworks can't.

## Servers

Server-side Swift is the most mature use outside Apple. **SwiftNIO** is the event-driven networking core (like Netty for the JVM); **Vapor** and **Hummingbird** are web frameworks on top of it; the Swift Server Workgroup maintains packages for logging, metrics, tracing, Postgres, Redis and AWS Lambda. Swift's concurrency model (actors, structured tasks, `Sendable`) is a good fit for request handling. A typical service builds in a Linux container or with the **Static Linux SDK** (Swift 6.0), which produces a single statically linked executable that runs on any distribution of the same architecture.

```swift
// swift-tools-version: 6.0
// Package.swift for a cross-platform library: no Apple-only frameworks
import PackageDescription

let package = Package(
    name: "Pricing",
    platforms: [.iOS(.v17), .macOS(.v14)],       // minimums for Apple platforms; Linux needs no entry
    products: [.library(name: "Pricing", targets: ["Pricing"])],
    targets: [
        .target(name: "Pricing"),
        .testTarget(name: "PricingTests", dependencies: ["Pricing"]),
    ]
)
```

The same `Pricing` package can be a dependency of an iOS app and of a Vapor service, and `swift test` runs its tests on a Linux CI machine.

## Other targets

- **Android.** Swift 6.3 shipped the first official **Swift SDK for Android**, from the Android Workgroup. You cross-compile Swift packages for Android, and the **swift-java** project generates bindings so Kotlin or Java code can call Swift through JNI. The usual use is sharing business logic, not writing the UI in Swift.
- **WebAssembly.** Swift compiles to Wasm; JavaScriptKit bridges to the browser's JavaScript, and Swift 6.4 makes the Wasm SDK available directly from swift.org.
- **Windows.** Toolchains and a VS Code extension are maintained on swift.org.
- **Embedded Swift.** A compilation mode for microcontrollers (ARM and RISC-V boards, for example) that produces small binaries by dropping runtime features such as full reflection, and by specialising all generics. It is still evolving: each release widens the supported subset, and Swift 6.4 adds existential types and richer error handling.

## Interoperability

Swift can import C and Objective-C directly, and **C++ interoperability** (Swift 5.9 and later) lets Swift call C++ types and C++ call Swift, without bridging layers. Swift 6.3 added the `@c` attribute to expose Swift functions to C, and Swift 6.4 bridges `Span` with C++20's `std::span`. That's how Swift is used inside existing C and C++ codebases, piece by piece.

## Tooling outside Xcode

**swiftly** installs and switches toolchains on Linux and macOS; **SourceKit-LSP** gives any editor completion and navigation; the VS Code extension adds debugging with LLDB, and since Swift 6.4 it is also published on the Open VSX Registry for other VS Code-based editors. On Linux, `swift build`, `swift test` and `swift run` are the whole workflow.
