---
id: kotlin-compilation
title: How Kotlin compiles
summary: One language, four back ends, the K2 front end
why: "Most Kotlin surprises (top-level functions in a FileKt class, a default constructor that isn't there, nulls checked at runtime) make sense once you know what the compiler actually emits."
lesson: none
points:
  - { title: "One front end, several back ends", text: "The compiler parses and type-checks once, then emits JVM bytecode, native code through LLVM, JavaScript or WebAssembly." }
  - { title: "On the JVM it is just classes", text: "Kotlin/JVM produces ordinary .class files plus a small standard library; the JVM can't tell them apart from Java's." }
  - { title: "K2 since 2.0", text: "Kotlin 2.0 made the rewritten K2 front end the default: faster builds and smarter smart casts, with the same language." }
quiz:
  - q: "A file named Prices.kt contains only a top-level function fun round(x: Double): Double. What does a Java caller write?"
    options:
      - "round(x), because top-level functions become global functions"
      - "PricesKt.round(x)"
      - "Prices.Companion.round(x)"
    answer: 1
    explain: "The JVM has no free functions, so Kotlin puts top-level declarations into a class named after the file with a Kt suffix. @file:JvmName(\"Prices\") changes that name."
  - q: What did Kotlin 2.0 change about the compiler?
    options:
      - "It replaced the JVM back end with LLVM"
      - "It made the new K2 front end (parsing, resolution, type checking) the default for all targets"
      - "It removed Kotlin/JS"
    answer: 1
    explain: "K2 is a rewrite of the front end. The language stayed the same, apart from fixes, but analysis is faster and smart casts work in more places."
  - q: "Your Kotlin function takes a non-null String parameter and is public. A Java caller passes null. What happens?"
    options:
      - "Nothing until the parameter is used"
      - "The call fails at once: the compiler adds a null check at the start of public functions"
      - "Java can't call it at all"
    answer: 1
    explain: "Kotlin can't stop Java from passing null, so public functions get an intrinsic check on entry that throws a NullPointerException naming the parameter."
links:
  - { title: "Kotlin Multiplatform overview (kotlinlang.org)", url: "https://kotlinlang.org/docs/multiplatform.html" }
  - { title: "K2 compiler migration guide (kotlinlang.org)", url: "https://kotlinlang.org/docs/k2-compiler-migration-guide.html" }
  - { title: "Calling Kotlin from Java (kotlinlang.org)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html" }
  - { title: "Stability of Kotlin components (kotlinlang.org)", url: "https://kotlinlang.org/docs/components-stability.html" }
---
Kotlin is one language with several compilers behind it. A shared **front end** reads your source, resolves names and checks types; a **back end** then turns the result into something a platform can run: bytecode for the JVM and Android, native machine code through LLVM for iOS and desktop, JavaScript for browsers and Node, or WebAssembly. Kotlin/JVM, Kotlin/Native and Kotlin/JS are stable; Kotlin/Wasm has been Beta since 2.2.20.

## On the JVM: ordinary classes

`kotlinc` (or Gradle's Kotlin plugin) emits `.class` files that the JVM loads like any others, plus a dependency on the small `kotlin-stdlib` jar. A few things have to be mapped onto what the JVM has:

```kotlin
// File: Prices.kt
package shop

const val VAT = 0.25                          // a static final field on PricesKt

fun withVat(net: Double): Double = net * (1 + VAT)   // static method PricesKt.withVat

class Basket(val items: List<Double>) {       // final class, private field + getter getItems()
    fun total() = items.sumOf(::withVat)
}

fun main() {
    println(Basket(listOf(10.0, 20.0)).total())   // 37.5
}
```

- **Top-level functions and properties** live in a class named after the file: `PricesKt`.
- **Classes are final** and their methods are not overridable unless you write `open`.
- **Properties** become a private field plus getter and setter methods.
- **Null checks**: for every non-null parameter of a public function, the compiler adds a check on entry, because a Java caller could pass `null`. That's why the NullPointerException names the parameter.

You can see all of this with `javap -c` on the compiled classes, or in the IDE with *Show Kotlin Bytecode*, which also decompiles it back to Java.

## Other targets

**Kotlin/Native** compiles to a standalone binary with its own runtime and garbage collector, and can export a framework that Swift and Objective-C can call. **Kotlin Multiplatform** builds on that: common code is compiled for each target, and `expect`/`actual` declarations fill in the platform-specific parts. The language is the same everywhere, but the libraries differ: `java.*` exists only on the JVM.

## K2: the new front end

Kotlin 2.0 (May 2024) made **K2** the default compiler front end on every target. It is a rewrite of the analysis that came before, built around one internal representation for all platforms. You mostly notice it as faster compilation and as smart casts that work where they used to fail, for example after a check on a local variable that is later captured, or after `||` checks on two types. A few edge cases that the old compiler accepted are now errors; the migration guide lists them.

## What the compiler adds

Many Kotlin features are pure compiler work with no runtime cost: `data class` methods, default arguments (an extra synthetic overload with a bit mask), `inline` functions copied into the caller, string templates turned into ordinary string concatenation. When something looks magic, the bytecode viewer usually shows a plain-Java shape behind it.
