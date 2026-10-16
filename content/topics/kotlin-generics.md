---
id: kotlin-generics
title: "Generics and variance: in and out"
summary: "Why List<String> is a List<Any> but MutableList isn't"
why: "Variance decides which assignments the compiler allows. Declaring it once on a type (in or out) replaces Java's wildcards at every use."
requires: [kotlin-lambdas, java-generics]
lesson: none
points:
  - { title: "out means produces", text: "A type that only returns T can be covariant: List<String> is usable as List<Any>." }
  - { title: "in means consumes", text: "A type that only takes T can be contravariant: a Comparator<Any> can sort Strings." }
  - { title: Declared once, text: "Kotlin puts variance on the declaration (interface Source<out T>), so callers don't repeat ? extends everywhere." }
  - { title: Still erased, text: "On the JVM the type argument is gone at runtime, unless an inline function makes it reified." }
quiz:
  - q: "Why does val xs: MutableList<Any> = mutableListOf<String>() fail to compile?"
    options:
      - "Strings are not Any"
      - "MutableList is invariant: through a MutableList<Any> you could add an Int to a list of Strings"
      - "mutableListOf can't be assigned"
    answer: 1
    explain: "MutableList both takes and returns T, so it must be invariant. List only returns T and is declared List<out E>, which is why the read-only version is allowed."
  - q: "interface Sink<in T> { fun put(item: T) }. Which assignment compiles?"
    options:
      - "val s: Sink<String> = anySink   // anySink: Sink<Any>"
      - "val s: Sink<Any> = stringSink   // stringSink: Sink<String>"
      - "Neither"
    answer: 0
    explain: "Something that accepts any value can certainly accept a String, so Sink<Any> is a subtype of Sink<String>. The reverse would let you put an Int into a String sink."
  - q: What does a star projection like List<*> let you do?
    options:
      - "Add any element"
      - "Read elements as Any? when you don't know or care about the type argument"
      - "Turn off type checking"
    answer: 1
    explain: "List<*> means a list of some type you don't know. Reading is safe (as Any?), and for mutable types writing is forbidden, since you can't know what fits."
links:
  - { title: "Generics: in, out, where (kotlinlang.org)", url: "https://kotlinlang.org/docs/generics.html" }
  - { title: "Inline functions: reified type parameters (kotlinlang.org)", url: "https://kotlinlang.org/docs/inline-functions.html#reified-type-parameters" }
---
Kotlin generics work like Java's underneath, with type arguments erased at runtime. The difference is how you say which assignments between generic types are safe. Java writes it at every use site (`List<? extends Number>`); Kotlin lets the author of a type declare it once, with `out` for types that only produce values and `in` for types that only consume them.

## Why variance exists

If `MutableList<String>` were a `MutableList<Any>`, this would compile and then break:

```kotlin
val strings = mutableListOf("a")
// val anys: MutableList<Any> = strings   // not allowed, and here is why:
// anys.add(42)                           // a 42 inside a list of Strings
// val s: String = strings[1]             // ClassCastException
```

So `MutableList<T>` is **invariant**: only exactly `MutableList<String>` fits. But the read-only `List<out E>` never accepts an `E`, only returns them, so treating a `List<String>` as a `List<Any>` can't go wrong. Kotlin's standard library declares it `out`, and the assignment compiles.

## Declaring it

```kotlin
interface Source<out T> { fun next(): T }               // T only in "out" positions
interface Sink<in T> { fun put(item: T) }                // T only in "in" positions

class Logger : Sink<Any> {
    override fun put(item: Any) = println("log: $item")
}

fun <T> copy(from: Source<T>, to: Sink<T>, n: Int) = repeat(n) { to.put(from.next()) }

fun main() {
    var i = 0
    val numbers = object : Source<Int> { override fun next() = ++i }
    val anySource: Source<Any> = numbers                // fine: out
    val stringSink: Sink<String> = Logger()             // fine: in
    stringSink.put("hello")                             // log: hello
    copy(numbers, Logger(), 2)                          // log: 1, log: 2
    println(anySource.next())                           // 3
}
```

The compiler checks the declaration: an `out T` can't appear as a parameter type, an `in T` can't be returned. A handy reading is **producer `out`, consumer `in`** (Java's PECS, written on the type instead of the call).

`copy` works with a `Sink<Any>` where the signature asks for `Sink<Int>`, because `in` makes `Sink<Any>` a subtype of `Sink<Int>`.

## Use-site variance and star projections

When a type is invariant but one function only reads from it, you can project at the use site: `fun sum(xs: Array<out Number>)` accepts an `Array<Int>`, and inside it `xs[0] = 1.5` is rejected. `Array<in Int>` is the opposite. A **star projection** `List<*>` means "some type I don't know": reading gives `Any?`, writing to a `MutableList<*>` isn't allowed.

## Bounds and erasure

- **Upper bounds:** `fun <T : Comparable<T>> max(a: T, b: T)`. Several bounds use `where T : CharSequence, T : Comparable<T>`.
- **Nullability:** a plain `T` may be nullable (its bound is `Any?`); `T : Any` makes it non-null. `T & Any` (definitely non-null) helps when overriding Java methods.
- **Erasure:** `xs is List<String>` can't be checked at runtime; only `xs is List<*>` can. The Java path's generics topic covers why. An `inline fun <reified T>` gets around it by being copied into each caller.

Variance appears in function types too: `(Any) -> Int` is usable where `(String) -> Number` is expected, because parameters are `in` and results are `out`.
