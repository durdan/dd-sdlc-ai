---
id: kotlin-java-interop
title: Living with Java
summary: "Platform types, @Jvm annotations, SAM conversion"
why: "Almost every Kotlin codebase calls Java libraries, and many are called from Java. The seams are where nulls, statics and checked exceptions leak through."
requires: [kotlin-null-safety, kotlin-classes]
lesson: none
points:
  - { title: Java to Kotlin is mostly free, text: "Java classes, getters (as properties) and functional interfaces (as lambdas) work directly; only nullability is uncertain." }
  - { title: Kotlin to Java needs hints, text: "@JvmStatic, @JvmOverloads, @JvmField and @JvmName shape what Java callers see." }
  - { title: No checked exceptions, text: "Kotlin doesn't force you to catch Java's checked exceptions; Java callers of Kotlin code need @Throws to catch them." }
quiz:
  - q: "A Kotlin function fun greet(name: String, polite: Boolean = true) is called from Java. Which call compiles without extra annotations?"
    options:
      - "greet(\"Ada\")"
      - "greet(\"Ada\", true)"
      - "Both"
    answer: 1
    explain: "Java has no default arguments, so it sees only the full signature. @JvmOverloads generates the shorter overloads for Java callers."
  - q: A Kotlin function throws IOException. How does a Java caller get to write catch (IOException e) around the call?
    options:
      - "It works automatically"
      - "Annotate the Kotlin function with @Throws(IOException::class)"
      - "Make the function inline"
    answer: 1
    explain: "Kotlin doesn't declare checked exceptions, and javac rejects a catch for a checked exception the try block can't throw. @Throws adds the throws clause to the bytecode."
  - q: "A Java method returns a List<String> without annotations. What is the safest way to use it in Kotlin?"
    options:
      - "Assign it to a val of type List<String> and trust it"
      - "Give the result an explicit nullable type (List<String>?) or check it at the boundary"
      - "Call !! on every element"
    answer: 1
    explain: "A platform type lets you pick either nullability. Choosing the nullable type at the border makes the compiler force a decision, instead of a crash deep inside your code."
links:
  - { title: "Calling Java from Kotlin (kotlinlang.org)", url: "https://kotlinlang.org/docs/java-interop.html" }
  - { title: "Calling Kotlin from Java (kotlinlang.org)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html" }
  - { title: "Kotlin Symbol Processing (kotlinlang.org)", url: "https://kotlinlang.org/docs/ksp-overview.html" }
---
Kotlin on the JVM was designed to sit next to Java in the same project: the same classes, the same collections, the same bytecode. Calling in either direction needs no wrappers. The differences are in what each language can express, and the compiler bridges most of them with conventions and a handful of annotations.

## Calling Java from Kotlin

- **Getters and setters become properties.** `person.getName()` is written `person.name`, and `setName(x)` is `person.name = x`. `isActive()` becomes `person.isActive`.
- **Functional interfaces take lambdas.** Any Java interface with a single abstract method (`Runnable`, `Comparator`, a listener) can be passed a Kotlin lambda; this is SAM conversion.
- **Collections are mapped**, not converted. A Java `List<String>` appears as `(Mutable)List<String!>!`: Kotlin doesn't know if you may change it or if it or its elements may be null.
- **Nullability comes from annotations.** Without them you get **platform types** (`String!`). With `@Nullable`/`@NonNull` from JSpecify, JetBrains, AndroidX and several others, Kotlin uses real `String?` and `String` types. JSpecify annotations are enforced as errors by default; most others give warnings unless you configure them as strict.
- **Checked exceptions are not checked.** Kotlin has no `throws` clause and never forces a `try`.

## Calling Kotlin from Java

Java callers see the bytecode shapes, so a few Kotlin features need hints:

```kotlin
// File: Money.kt
@file:JvmName("MoneyUtils")                  // Java sees MoneyUtils, not MoneyKt

import java.io.IOException

class Rates {
    companion object {
        @JvmStatic fun eur(): Rates = Rates()  // Rates.eur() in Java, not Rates.Companion.eur()
        @JvmField val DEFAULT_SCALE = 2         // a public static field, no getter
    }
}

@JvmOverloads                                 // generates format(Long) and format(Long, String)
fun format(cents: Long, currency: String = "EUR"): String = "%.2f %s".format(cents / 100.0, currency)

@Throws(IOException::class)                   // lets Java catch IOException around the call
fun loadRates(path: String): String = java.io.File(path).readText()

fun main() {
    println(format(1999))                     // 19.99 EUR
    println(Rates.DEFAULT_SCALE)              // 2
}
```

- **Properties** appear as `getX()`/`setX()`; boolean `isX` stays `isX()`.
- **`internal`** declarations are public in bytecode but get a mangled name so Java can't call them by accident.
- **Default arguments** don't exist in Java: use `@JvmOverloads`, or Java must pass every argument.
- **Kotlin lambdas** passed to Java are `kotlin.jvm.functions.Function1` and so on. For an API meant to be called from Java, declare a `fun interface` instead, so Java can use its own lambdas.

## The fun interface

```kotlin
fun interface PriceRule { fun apply(cents: Long): Long }

val tenPercentOff = PriceRule { it * 90 / 100 }   // SAM conversion for a Kotlin interface
```

A `fun interface` gets SAM conversion in Kotlin and is a normal functional interface for Java.

## Mixed projects

Java and Kotlin can live in the same module: the Kotlin compiler runs first (reading the Java sources only to resolve references to them), then javac compiles the Java against Kotlin's output. Converting a file at a time works well, starting with leaf classes and tests. Java annotation processors run through kapt, which generates Java stubs for them to read; processors written for KSP (Room and Moshi, for example) read Kotlin declarations directly, without the stub step.
