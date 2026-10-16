---
id: kotlin-lambdas
title: "Lambdas, inline and reified"
summary: "Functions as values, and when the compiler copies them in"
why: "Lambdas cost an object and an indirect call; inline functions remove that cost and allow return from the caller. Knowing which you have explains odd returns and why reified works only sometimes."
requires: [kotlin-extensions]
lesson: none
points:
  - { title: Functions are values, text: "A lambda is an object implementing a function type like (Int) -> String; it can capture local variables, even vars." }
  - { title: inline copies the body, text: "An inline function and the lambdas passed to it are pasted into the call site, so no lambda object is allocated." }
  - { title: Non-local return, text: "Inside a lambda passed to an inline function, a bare return leaves the enclosing function; return@label leaves only the lambda." }
  - { title: reified keeps the type, text: "Because the body is copied, an inline function can mark a type parameter reified and use T::class or is T at runtime." }
quiz:
  - q: "fun firstEven(xs: List<Int>): Int? { xs.forEach { if (it % 2 == 0) return it }; return null }. What does the return inside forEach do?"
    options:
      - "Skips to the next element"
      - "Returns from firstEven, because forEach is inline"
      - "It doesn't compile"
    answer: 1
    explain: "forEach is an inline function, so its lambda is pasted into firstEven and a bare return is a return from firstEven. Use return@forEach to continue with the next element."
  - q: Why can't a normal (non-inline) generic function check value is T?
    options:
      - "Because is only works on classes"
      - "Because generic type arguments are erased on the JVM, so T isn't known at runtime"
      - "Because T might be nullable"
    answer: 1
    explain: "After erasure the function body has no idea what T was. An inline function with reified T is copied into each call site, where the concrete type is known."
  - q: When does marking a function inline make things worse?
    options:
      - "When it takes a lambda parameter"
      - "When it is large and has no function-type parameters, so it only grows the bytecode at every call site"
      - "Never; inline is always faster"
    answer: 1
    explain: "The benefit of inline is removing lambda objects and enabling reified types. A big function without lambdas is just duplicated everywhere; the compiler even warns about it."
links:
  - { title: "Higher-order functions and lambdas (kotlinlang.org)", url: "https://kotlinlang.org/docs/lambdas.html" }
  - { title: "Inline functions (kotlinlang.org)", url: "https://kotlinlang.org/docs/inline-functions.html" }
  - { title: "Returns and jumps (kotlinlang.org)", url: "https://kotlinlang.org/docs/returns.html" }
---
Kotlin treats functions as values. A **higher-order function** takes or returns a function, and a **lambda** like `{ x: Int -> x * 2 }` is how you write one in place. Function types are written `(Int) -> String`, and a type with a receiver, `StringBuilder.() -> Unit`, lets the lambda body call the receiver's methods directly. That is how `buildString { append("hi") }` and most Kotlin DSLs work.

## What a lambda is

A non-inline lambda compiles to an object implementing a function interface (`Function1<Int, String>`, and so on; on newer JVM targets through `invokedynamic`). If it captures local variables, the object holds them; capturing a `var` wraps it in a small mutable box so both sides see changes. Every call through the function type is an interface call, and every capturing lambda that is created is an allocation.

```kotlin
fun counter(): () -> Int {
    var n = 0
    return { ++n }                       // captures n in a box; lives on after counter() returns
}

fun main() {
    val next = counter()
    next(); next()
    println(next())                      // 3
}
```

## inline: no lambda at all

Marking a higher-order function `inline` tells the compiler to copy its body, and the bodies of lambdas passed to it, into every call site. No function object is created. The standard library's `map`, `filter`, `forEach`, `let` and `use` are all inline, so a `list.filter { it > 0 }` costs a loop, not a lambda allocation.

Inlining changes what `return` means:

```kotlin
fun firstNegative(xs: List<Int>): Int? {
    xs.forEach {
        if (it < 0) return it            // non-local: leaves firstNegative
    }
    return null
}

fun printPositives(xs: List<Int>) {
    xs.forEach {
        if (it < 0) return@forEach       // local: like continue
        println(it)
    }
}

fun main() {
    println(firstNegative(listOf(3, -1, -5)))   // -1
    printPositives(listOf(1, -2, 3))             // 1, then 3
}
```

Two modifiers adjust this per parameter: `noinline` keeps a lambda as a real object (so you can store it), and `crossinline` forbids non-local returns in a lambda that the inline function calls from another context, such as a `Runnable` it creates.

## reified: generics that survive

On the JVM, type arguments are erased: inside `fun <T> f()` there is no `T` at runtime. An inline function is copied to each caller, where the type is concrete, so it can declare `reified T`:

```kotlin
inline fun <reified T> List<Any>.only(): List<T> = filter { it is T }.map { it as T }

inline fun <reified T : Any> nameOf(): String = T::class.simpleName ?: "?"

fun main() {
    val mixed: List<Any> = listOf(1, "a", 2, "b")
    println(mixed.only<String>())        // [a, b]
    println(nameOf<StringBuilder>())     // StringBuilder
}
```

`filterIsInstance<T>()`, Gson-style `fromJson<T>()` helpers and Koin's `get<T>()` all use this. Reified functions can't be called from Java, because Java has no way to inline them.

Use `inline` for small functions that take lambdas or need reified types. On anything else it only makes the bytecode bigger, and the compiler warns that the expected performance gain is insignificant.
