---
id: kotlin-scope-functions
title: "Scope functions: let, run, apply, also, with"
summary: Five small helpers that differ in two ways
why: "Scope functions make some code shorter and other code unreadable. Two questions (is the object it or this, and what comes back) tell them apart and tell you when to stop."
requires: [kotlin-lambdas, kotlin-null-safety]
lesson: none
points:
  - { title: "it or this", text: "let and also pass the object as it; run, apply and with make it this, so its members can be called directly." }
  - { title: What comes back, text: "apply and also return the object itself; let, run and with return the lambda's result." }
  - { title: One job each, text: "apply to configure, also for side effects, let to transform or handle a nullable, run/with to compute from an object." }
  - { title: Don't nest them, text: "Two levels of it and this are hard to read; a local val is often clearer." }
quiz:
  - q: "What is the type of val x = StringBuilder().apply { append(\"hi\") }?"
    options:
      - "Unit"
      - "StringBuilder"
      - "String"
    answer: 1
    explain: "apply runs the block with the object as this and returns the object. With run (same block) you would get the block's result instead, here the StringBuilder returned by append."
  - q: "Which is the idiomatic way to run code only when a nullable value is not null, using it as a non-null value?"
    options:
      - "value.apply { ... }"
      - "value?.let { ... }"
      - "value.run { ... }"
    answer: 1
    explain: "The safe call skips the block when value is null; inside, it has the non-null type. apply and run without ?. would run the block with a nullable receiver."
  - q: "user?.let { save(it) } ?: showError(). When can showError() run even though user is not null?"
    options:
      - "Never"
      - "When save(it) returns null, because let returns the lambda's result and the Elvis sees that null"
      - "When user is a var"
    answer: 1
    explain: "?: applies to the whole left side. If the lambda's last expression is null, the else part runs too. An if (user != null) ... else ... says what you mean."
links:
  - { title: "Scope functions (kotlinlang.org)", url: "https://kotlinlang.org/docs/scope-functions.html" }
  - { title: "Coding conventions (kotlinlang.org)", url: "https://kotlinlang.org/docs/coding-conventions.html" }
---
The standard library has five functions whose only job is to run a block of code with an object in scope: `let`, `run`, `with`, `apply` and `also`. None of them does anything you couldn't write with a local variable. They are all small `inline` functions, so they cost nothing at runtime; what they cost is readability, if you pick the wrong one or stack them.

## Two questions

| Function | Object inside the block | Returns |
|---|---|---|
| `let` | `it` | the block's result |
| `also` | `it` | the object |
| `run` | `this` | the block's result |
| `apply` | `this` | the object |
| `with(obj)` | `this` | the block's result (not an extension) |

`this` is a lambda with a receiver (`T.() -> R`): you can call the object's members without a prefix. `it` is a plain parameter (`(T) -> R`), which you can rename (`let { user -> ... }`).

## One typical use each

```kotlin
data class Request(var url: String = "", var timeoutMs: Int = 0, val headers: MutableMap<String, String> = mutableMapOf())

fun main() {
    // apply: configure an object, get the object back
    val req = Request().apply {
        url = "https://example.com"
        timeoutMs = 5_000
        headers["Accept"] = "application/json"
    }

    // also: a side effect in the middle of a chain, without changing the value
    val ids = listOf(3, 1, 2).sorted().also { println("sorted: $it") }

    // let: work with a nullable value, or transform one value into another
    val header: String? = req.headers["Accept"]
    val length = header?.let { it.length } ?: 0

    // run / with: compute a result from an object's members
    val summary = with(req) { "$url (${timeoutMs}ms, ${headers.size} headers)" }

    println(ids)                    // [1, 2, 3]
    println(length)                 // 16
    println(summary)                // https://example.com (5000ms, 1 headers)
}
```

## When they hurt

- **Nesting.** Inside `a.apply { b.let { ... } }`, `this` is `a` and `it` is `b`; one more level and nobody can tell which `this` is meant. Name the parameter, or use a local `val`.
- **`?.let { } ?: ...` as if-else.** The Elvis also fires when the block itself returns `null`, which is easy to miss. For two real branches, write `if (x != null) ... else ...` (smart casts make it just as short).
- **Shadowing.** In `apply`, a property of the object hides a local variable or a property of the enclosing class with the same name. `name = name` inside `apply` assigns the object's property to itself.
- **Long blocks.** A 30-line `run { }` is a function without a name. Give it one.
- **`let` just to call one function.** `x.let { foo(it) }` is `foo(x)`, unless `x` is nullable.

`takeIf { }` and `takeUnless { }` are the close relatives: `input.takeIf { it.isNotBlank() }` returns the object or `null`, and pairs well with `?.let`.

The Kotlin documentation gives the same advice: choose by purpose, avoid nesting, take care when chaining, and if the block grows, prefer plain code. Like most style rules, the goal is that the next reader sees the intent without counting receivers.
