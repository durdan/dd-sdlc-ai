---
id: kotlin-sequences
title: "Collections vs sequences"
summary: Eager steps with lists or lazy steps per element
why: "A chain of map and filter on a List builds a new list at every step. A Sequence runs each element through the whole chain and can stop early, which matters for big or endless inputs."
requires: [kotlin-lambdas]
lesson: none
points:
  - { title: Collections are eager, text: "Each operation on a List runs over every element and returns a new list before the next one starts." }
  - { title: Sequences are lazy, text: "Intermediate operations on a Sequence only describe work; a terminal operation like toList or first pulls elements through one at a time." }
  - { title: Pick by shape, text: "Small collections and single steps: use lists. Long chains, huge inputs, early exits or infinite sources: use asSequence() or sequence { }." }
quiz:
  - q: "listOf(1, 2, 3, 4).map { it * 10 }.first { it > 15 }. How many times does the map lambda run?"
    options:
      - "2"
      - "4"
      - "1"
    answer: 1
    explain: "On a List, map is eager: it builds the whole mapped list (4 calls) before first looks at it. With asSequence() it would run twice and stop."
  - q: "What happens when you write val s = generateSequence(1) { it + 1 }.map { it * 2 } and never use s?"
    options:
      - "It loops forever"
      - "Nothing runs: no terminal operation has asked for elements"
      - "It computes the first 100 elements"
    answer: 1
    explain: "map on a sequence only wraps it. Work happens when a terminal operation (toList, first, take(5).toList(), forEach) pulls values."
  - q: When is a sequence slower than a list?
    options:
      - "Never"
      - "For small collections or one or two operations, where the per-element overhead of the lazy machinery outweighs saving a few small lists"
      - "When the lambdas are inline"
    answer: 1
    explain: "Collection operations are inline and loop tightly; sequence operations are not inline and go through iterator objects. The win comes with long chains, big data or early termination."
links:
  - { title: "Sequences (kotlinlang.org)", url: "https://kotlinlang.org/docs/sequences.html" }
  - { title: "Collections overview (kotlinlang.org)", url: "https://kotlinlang.org/docs/collections-overview.html" }
---
Kotlin has two ways to run a pipeline of `map`, `filter` and friends. On a **collection** (`List`, `Set`), every operation is **eager**: it processes all elements and returns a new collection, then the next operation starts. On a **`Sequence`**, operations are **lazy**: they are stacked up, and nothing happens until a terminal operation asks for results, at which point each element travels through the whole chain before the next one starts.

## Watching the order

```kotlin
fun main() {
    val words = listOf("kotlin", "is", "a", "language")

    println("List:")
    val l = words
        .filter { println("  filter $it"); it.length > 1 }
        .map { println("  map $it"); it.uppercase() }
        .first()
    println("  -> $l")

    println("Sequence:")
    val s = words.asSequence()
        .filter { println("  filter $it"); it.length > 1 }
        .map { println("  map $it"); it.uppercase() }
        .first()
    println("  -> $s")
}
```

The list version filters all four words, maps the three survivors, then takes the first: seven lambda calls and two temporary lists. The sequence version filters `kotlin`, maps it, and `first()` is satisfied: two calls and no temporary lists. The output shows "horizontal" (step by step) against "vertical" (element by element) evaluation.

## Making sequences

- `list.asSequence()` wraps an existing collection.
- `generateSequence(seed) { next(it) }` produces values until the function returns `null`, possibly forever.
- `sequence { yield(x); yieldAll(other) }` builds one with ordinary code. It uses a restricted suspend function under the hood: `yield` pauses the builder until the consumer asks for the next value, the same machinery as coroutines, but on one thread.

```kotlin
val fibonacci = sequence {
    var a = 0L; var b = 1L
    while (true) { yield(a); val t = a + b; a = b; b = t }
}

fun main() = println(fibonacci.take(10).toList())   // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## Terminal and intermediate

Intermediate operations return another `Sequence` (`map`, `filter`, `take`, `distinct`). Terminal ones produce something else and do the work (`toList`, `first`, `count`, `sum`, `forEach`). Some intermediate operations are **stateful**: `sorted()` and `distinct()` must see (or remember) many elements, so `sorted()` on a sequence reads everything first. A sequence can usually be iterated more than once (each pass starts over), but `generateSequence { ... }` without a seed and `iterator.asSequence()` can only be consumed once.

## Choosing

Collection operations are `inline`, so a single `filter` on a list compiles to a tight loop. Sequence operations are regular functions with lambda objects and an iterator per stage. Rules of thumb:

- **List:** small or medium data, one or two steps, or you need the intermediate results anyway.
- **Sequence:** long chains on large data, `first`/`take`/`any` that can stop early, data that is generated, or would not fit in memory as a list.

Measure if it matters. Java's `Stream` is a third option on the JVM, with parallel streams; a `Sequence` is single-threaded and works on every Kotlin target. For values that arrive over time, asynchronously, the coroutine equivalent of a sequence is a `Flow`.
