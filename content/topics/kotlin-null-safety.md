---
id: kotlin-null-safety
title: Null safety
summary: "String and String? are different types"
why: "Most NullPointerExceptions in Kotlin code come from the few places where the type system is told to look away: !!, platform types and lateinit."
requires: [kotlin-compilation]
lesson: none
points:
  - { title: Nullability is in the type, text: "String can never hold null; String? can, and the compiler won't let you call its members until you have dealt with the null." }
  - { title: "?. and ?: handle it", text: "Safe calls stop at the first null; the Elvis operator supplies a fallback, or returns or throws early." }
  - { title: "Smart casts do the rest", text: "After an if (x != null) check on a stable value, the compiler treats x as non-null without a cast." }
  - { title: "!! is an assertion", text: "It converts a nullable value to non-null by throwing if it is null. Each one is a place where you promised more than the types know." }
quiz:
  - q: "What does user?.address?.city ?: \"unknown\" evaluate to when user is non-null but address is null?"
    options:
      - "A NullPointerException"
      - "\"unknown\""
      - "null"
    answer: 1
    explain: "The chain stops at the first null and yields null; the Elvis operator then replaces that null with its right-hand side."
  - q: "Why does if (account.owner != null) account.owner.name fail to compile when owner is a var property of another class?"
    options:
      - "Smart casts never work on properties"
      - "The property could change between the check and the use (another thread or a custom getter), so the compiler can't smart cast it"
      - "You need to write owner!! first"
    answer: 1
    explain: "Smart casts need a value that can't change in between: a local val, or a val property without a custom getter in the same module. Copy it to a local val (or use ?.let) instead."
  - q: What is the type of a value returned by a Java method with no nullability annotations?
    options:
      - "Always String?"
      - "A platform type (String!) that you may treat as either String or String?"
      - "Always String"
    answer: 1
    explain: "Kotlin doesn't know, so it relaxes the checks. If you treat it as non-null and it is null, the failure comes at runtime, at the first point where Kotlin needs it to be non-null."
links:
  - { title: "Null safety (kotlinlang.org)", url: "https://kotlinlang.org/docs/null-safety.html" }
  - { title: "Type checks and casts (kotlinlang.org)", url: "https://kotlinlang.org/docs/typecasts.html" }
  - { title: "Null-safety and platform types (kotlinlang.org)", url: "https://kotlinlang.org/docs/java-interop.html#null-safety-and-platform-types" }
---
In Kotlin, `null` is part of the type. A `String` is always a string; a `String?` is a string or `null`, and the compiler refuses to call `.length` on it until you've shown what happens in the null case. The JVM underneath knows nothing about this: both are plain references, and the guarantee comes entirely from compile-time checks plus a few runtime checks at the borders.

## The operators

```kotlin
data class Address(val city: String?)
data class User(val name: String, val address: Address?)

fun cityOf(user: User?): String =
    user?.address?.city ?: "unknown"          // safe calls, then a fallback

fun requireCity(user: User): String {
    val city = user.address?.city ?: return "no city"   // Elvis can return or throw
    return city.uppercase()                   // city is String here
}

fun main() {
    println(cityOf(User("Ada", Address("London"))))   // London
    println(cityOf(User("Bob", null)))                  // unknown
    println(cityOf(null))                               // unknown
    println(requireCity(User("Cy", Address(null))))     // no city
}
```

- `a?.b` is `null` if `a` is null, otherwise `a.b`. A chain stops at the first null.
- `a ?: b` is `a` unless it is null, then `b`. Because `return` and `throw` are expressions, the right side can leave the function early, which keeps the rest of the code flat.
- `a!!` throws a `NullPointerException` if `a` is null. Use it only where a null really is a bug, and prefer `checkNotNull(a) { "why" }` or `requireNotNull`, which explain the failure.

## Smart casts

After a null check the compiler narrows the type for you:

```kotlin
fun describe(text: String?) {
    if (text == null) return
    println(text.length)      // smart cast: text is String from here on
}
```

That only works on values that can't change between the check and the use: local `val`s, local `var`s not captured by a lambda that modifies them, and `val` properties that are not open, have no custom getter and are declared in the same module. For a mutable property, copy it into a local first, or write `owner?.let { ... }`.

## Where null sneaks back in

- **Platform types.** A value from Java without nullability annotations has a type written `String!` in the IDE: Kotlin lets you treat it as either. If you choose non-null and it is null, it fails at the point of use. Annotated Java (JSpecify, JetBrains, AndroidX annotations) gives you proper Kotlin types instead.
- **`lateinit var`.** A promise that a non-null property will be set before it is read; reading it early throws `UninitializedPropertyAccessException`. Good for dependency injection and test setup, risky elsewhere. `::prop.isInitialized` checks it.
- **Initialisation order.** Calling an open method from a constructor can let a subclass see its own properties before they are set, so a non-null property can be null for a moment.
- **Generics.** A type parameter `T` can itself be nullable (`T` is `Any?` by default). Write `T : Any` to forbid it.

Collections have their own pair of question marks: `List<String?>` is a list that may contain nulls, `List<String>?` is a list that may be missing. `filterNotNull()` and `mapNotNull()` turn the first into a `List<String>`.
