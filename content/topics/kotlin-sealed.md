---
id: kotlin-sealed
title: "Sealed types and exhaustive when"
summary: A closed set of cases the compiler can check
why: "Modelling states as a sealed hierarchy turns 'did we handle every case?' from a code review question into a compile error."
requires: [kotlin-classes]
lesson: none
points:
  - { title: Closed hierarchy, text: "All direct subclasses of a sealed class or interface must be in the same module and package, so the compiler knows the full list." }
  - { title: "when without else", text: "A when expression over a sealed type that covers every subtype needs no else; adding a subtype breaks every when that misses it." }
  - { title: Smart casts in each branch, text: "Inside is Success -> the value is a Success, so its properties are available without a cast." }
quiz:
  - q: "You add a new subclass Refunded to sealed interface PaymentState. What happens to a when expression over PaymentState that has no else branch?"
    options:
      - "It silently falls through for Refunded"
      - "It stops compiling until Refunded is handled"
      - "It throws at runtime when Refunded arrives"
    answer: 1
    explain: "That is the point of sealed types: exhaustiveness is checked at compile time, so the compiler lists every when that needs a new branch."
  - q: Why is adding else -> to a when over a sealed type often a bad idea?
    options:
      - "else is slower"
      - "It makes the when exhaustive forever, so a new subtype is silently sent to else instead of causing a compile error"
      - "else is not allowed with sealed types"
    answer: 1
    explain: "An else branch catches future cases too. You lose the compiler's help exactly when the hierarchy changes."
  - q: What is the difference between a sealed class and an enum class?
    options:
      - "There is none"
      - "Enum entries are single instances; subclasses of a sealed class can have many instances with their own properties"
      - "Only enums work with when"
    answer: 1
    explain: "An enum is a fixed set of values. A sealed hierarchy is a fixed set of types: Success(data) and Failure(error) can each carry different data."
links:
  - { title: "Sealed classes and interfaces (kotlinlang.org)", url: "https://kotlinlang.org/docs/sealed-classes.html" }
  - { title: "Conditions and loops: when (kotlinlang.org)", url: "https://kotlinlang.org/docs/control-flow.html" }
---
A `sealed` class or interface is a type whose direct subtypes are all known when the module is compiled: they must be declared in the same module and package. Because the list is closed, the compiler can check that a `when` handles every case, and you can model "a payment is one of these four states, each with its own data" without a catch-all.

## A closed set of states

```kotlin
sealed interface Payment {
    data object Pending : Payment
    data class Paid(val receiptId: String) : Payment
    data class Failed(val reason: String, val retryable: Boolean) : Payment
}

fun label(p: Payment): String = when (p) {
    Payment.Pending -> "waiting"
    is Payment.Paid -> "paid, receipt ${p.receiptId}"          // smart cast to Paid
    is Payment.Failed if p.retryable -> "failed, try again"    // guard condition (Kotlin 2.2)
    is Payment.Failed -> "failed: ${p.reason}"
}

fun main() {
    listOf(Payment.Pending, Payment.Paid("r-1"), Payment.Failed("card declined", true),
           Payment.Failed("fraud", false)).forEach { println(label(it)) }
}
```

- No `else` branch: the `when` is exhaustive because every subtype is covered.
- In `is Payment.Paid ->`, `p` is smart cast, so `p.receiptId` works.
- `data object` (Kotlin 1.9) gives a singleton case a readable `toString()` (`Pending`) and a proper `equals`.
- **Guard conditions** (`is Failed if p.retryable ->`), stable since Kotlin 2.2, add a condition to a branch without nesting another `if`. A guarded branch doesn't count towards exhaustiveness, so the plain `is Failed` branch is still needed.

## What exhaustiveness buys you

Add `data class Refunded(val amount: Long) : Payment` and every `when` *expression* over `Payment` without `else` stops compiling. That's the safety net: the compiler finds the places to update. An `else` branch switches it off for good, so leave it out for your own sealed types.

Since Kotlin 1.7, `when` *statements* over sealed types, enums and `Boolean` must be exhaustive too. Kotlin 2.3 made the checks data-flow aware (stable in 2.3): if an earlier `if (p is Payment.Pending) return` has ruled a case out, a later `when` doesn't need to list it.

## Sealed class or sealed interface

- A **sealed class** can hold state and a constructor shared by all subclasses; a subclass can extend only one class.
- A **sealed interface** (Kotlin 1.5) lets a type belong to several closed hierarchies, and lets enums and objects implement it.

Subclasses themselves don't have to be final: a subclass can be `open`, and then the hierarchy below it is no longer closed. The compiler only knows the direct subtypes.

## Typical uses

- **UI state:** `Loading`, `Content(items)`, `Error(message)`, rendered by one `when` in the UI layer.
- **Results:** a domain-specific `Result` with typed failure cases, instead of throwing.
- **Commands and events:** messages between layers or over a channel, each with its own fields.

On the JVM a sealed class is an abstract class whose constructors can't be called from outside the hierarchy; the closed list of subtypes is recorded in Kotlin's metadata, which is how the compiler checks `when` across modules.
