---
id: kotlin
title: "Kotlin: the language under Android and the JVM"
promise: "What the Kotlin compiler turns your code into, how null safety, data classes, extensions, inline functions and sealed types work underneath, and how coroutines become state machines that structured concurrency keeps in check."
kind: skill
level: intermediate
tags: [languages, mobile]
stages:
  - title: What the compiler makes
    blurb: Targets, nulls, classes, Java
    topics: [kotlin-compilation, kotlin-null-safety, kotlin-classes, kotlin-java-interop]
  - title: Functions and types
    blurb: Extensions, lambdas, sealed, generics
    topics: [kotlin-extensions, kotlin-lambdas, kotlin-sealed, kotlin-generics, kotlin-sequences, kotlin-scope-functions]
  - title: Coroutines from the inside
    blurb: State machines, scopes, Flow
    topics: [kotlin-suspend, kotlin-structured-concurrency, kotlin-flow]
bridges:
  - id: backpressure
    why: "A Flow's emit suspends until the collector is ready, so a slow consumer slows the producer instead of filling memory. Between services you have to build the same thing on purpose."
  - id: timeout
    why: "withTimeout cancels the work inside it when time runs out. Every call that crosses the network needs the same kind of deadline."
next: [android, spring-boot]
---
Everything here is about Kotlin 2.x, where the K2 compiler is the default. The examples were compiled and run with Kotlin 2.4.21 (and kotlinx.coroutines for the coroutine topics) on the official Kotlin Playground. Where a feature is newer than 2.0 (guard conditions in `when` in 2.2, data-flow exhaustiveness in 2.3, stable context parameters in 2.4), the topic says so. Android-specific coroutine use (viewModelScope, lifecycles) lives in the Android path; this path is about the language.
