---
id: kotlin-classes
title: "Classes, data classes and objects"
summary: "val vs var, generated methods, singletons, companions"
why: "Kotlin writes equals, hashCode, copy and singletons for you. Knowing exactly what it generates tells you when two objects are equal and what a copy really copies."
requires: [kotlin-null-safety]
lesson: none
points:
  - { title: "val is read-only, not immutable", text: "A val can't be reassigned, but the object it points at may still change; immutability comes from immutable types all the way down." }
  - { title: Data classes are about the constructor, text: "equals, hashCode, toString, copy and componentN use only the properties declared in the primary constructor." }
  - { title: object is a singleton, text: "An object declaration is a class with exactly one instance, created lazily and thread-safely on first use." }
  - { title: Companions are objects too, text: "A companion object is a real object attached to a class, not a bag of statics; @JvmStatic makes real static methods for Java." }
quiz:
  - q: "data class Order(val id: Int) { var note = \"\" }. Are Order(1).apply { note = \"a\" } and Order(1).apply { note = \"b\" } equal?"
    options:
      - "No, the notes differ"
      - "Yes, because note is not in the primary constructor"
      - "It doesn't compile"
    answer: 1
    explain: "Generated equals and hashCode look only at primary-constructor properties. Properties declared in the body are ignored by equals, toString and copy."
  - q: "val tags = mutableListOf(\"a\"). Which line compiles?"
    options:
      - "tags = mutableListOf(\"b\")"
      - "tags.add(\"b\")"
      - "Neither, because tags is a val"
    answer: 1
    explain: "val stops reassignment of the reference, not changes to the object. To make the list itself read-only, expose it as List<String>."
  - q: "What does copy() on a data class whose property is a MutableList do with that list?"
    options:
      - "It deep-copies the list"
      - "It shares the same list between the original and the copy"
      - "It sets the list to empty"
    answer: 1
    explain: "copy is shallow: it calls the constructor with the same references. Mutating the list through one object shows up in the other. Prefer read-only types inside data classes."
links:
  - { title: "Data classes (kotlinlang.org)", url: "https://kotlinlang.org/docs/data-classes.html" }
  - { title: "Object declarations and expressions (kotlinlang.org)", url: "https://kotlinlang.org/docs/object-declarations.html" }
  - { title: "Properties (kotlinlang.org)", url: "https://kotlinlang.org/docs/properties.html" }
---
Kotlin classes compile to ordinary JVM classes, but the compiler writes a lot of the code for you: getters and setters for properties, equality and copying for data classes, a lazily created instance for `object`. The rules for what is generated are short, and worth knowing exactly.

## val, var and immutability

`val` declares a read-only reference; `var` a mutable one. Neither says anything about the object referred to. A `val` holding a `MutableList` can still be appended to. Kotlin's collection interfaces split the two roles: `List` has no `add`, `MutableList` does. Exposing `List` is how a class keeps a mutable list to itself:

```kotlin
class Cart {
    private val _items = mutableListOf<String>()
    val items: List<String> get() = _items     // callers see a read-only view
    fun add(item: String) { _items += item }
}
```

A read-only view isn't a copy: if you need a snapshot, return `_items.toList()`.

## Data classes

```kotlin
data class Money(val cents: Long, val currency: String) {
    var note: String = ""                      // not part of equals/hashCode/toString/copy
}

fun main() {
    val a = Money(500, "EUR").apply { note = "lunch" }
    val b = Money(500, "EUR")
    println(a == b)                            // true: only constructor properties count
    println(a)                                 // Money(cents=500, currency=EUR)
    val (cents, currency) = a                  // component1(), component2()
    println("$cents $currency")                // 500 EUR
    println(a.copy(cents = 750))               // Money(cents=750, currency=EUR)
}
```

`data` generates `equals`, `hashCode`, `toString`, `copy` and `component1..N` from the **primary constructor** properties only. `copy` is shallow. Data classes can't be `open`, `abstract` or `sealed`, which keeps `equals` symmetric.

`==` calls `equals`; `===` compares references. For a class without `data` (or your own `equals`), `==` is reference equality.

## object and companion object

An `object` declaration defines a class and its single instance at once. On the JVM the instance is created in the class's static initialiser, so it is lazy (on first access) and thread-safe without any locking code of yours:

```kotlin
object Clock {
    var offsetMillis = 0L
    fun now() = System.currentTimeMillis() + offsetMillis
}

class User private constructor(val name: String) {
    companion object {
        fun named(name: String): User = User(name.trim())   // a factory
    }
}

fun main() {
    println(User.named("  Ada ").name)          // Ada
    println(Clock.now() > 0)                     // true
}
```

A `companion object` is one such object nested in a class, reachable through the class name. It is a real object: it can implement interfaces and hold state, and from Java you reach it as `User.Companion.named(...)` unless you mark the function `@JvmStatic`. An `object` expression (`object : Runnable { ... }`) creates an anonymous one-off instance instead, like Java's anonymous classes.

Two other kinds are worth knowing: a `value class` wraps a single value with no allocation at runtime in most places (`@JvmInline value class UserId(val raw: String)`), and an `enum class` has a fixed set of instances. Sealed classes, the closed hierarchies used with `when`, have their own topic.
