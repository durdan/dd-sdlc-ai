---
id: kotlin-extensions
title: Extension functions
summary: "New methods on old types, chosen at compile time"
why: "Extensions are everywhere in Kotlin and its libraries. They look like methods but are static functions, which explains both their power and their one big trap."
requires: [kotlin-classes]
lesson: none
points:
  - { title: A static function in disguise, text: "fun String.slug() compiles to a static method that takes the String as its first parameter." }
  - { title: Resolved statically, text: "Which extension runs depends on the declared type at the call site, not the runtime type of the object." }
  - { title: Members win, text: "If a class has a member with the same signature, the member is always called and the extension is ignored." }
quiz:
  - q: "fun Any.kind() = \"any\" and fun String.kind() = \"string\". What does val x: Any = \"hi\"; println(x.kind()) print?"
    options:
      - "string"
      - "any"
      - "It doesn't compile"
    answer: 1
    explain: "Extensions are chosen from the static (declared) type. x is declared Any, so Any.kind() is called, even though the object is a String."
  - q: Can an extension function read a private property of the class it extends?
    options:
      - "Yes, it behaves like a member"
      - "No: it is an outside function and sees only what any other code in that file could see"
      - "Only if it is declared inline"
    answer: 1
    explain: "An extension is compiled to a static function elsewhere. It has no special access, so private and protected members are out of reach."
  - q: "A class has fun print() and you declare fun Doc.print() as an extension with the same signature. What does doc.print() call?"
    options:
      - "The member"
      - "The extension"
      - "It is a compile error"
    answer: 0
    explain: "Members always win. The compiler warns that the extension is shadowed. Overloading with a different signature is fine."
links:
  - { title: "Extensions (kotlinlang.org)", url: "https://kotlinlang.org/docs/extensions.html" }
  - { title: "Context parameters (kotlinlang.org)", url: "https://kotlinlang.org/docs/context-parameters.html" }
---
An extension function lets you call `title.slugify()` on a `String` you don't own. It reads like a method, and the IDE completes it like one, but the compiler turns it into a plain static function with the receiver as its first argument. There is no change to the `String` class and no dynamic dispatch, and that second part is the one to remember.

## What gets compiled

```kotlin
fun String.slugify(): String =
    lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')

val String.wordCount: Int                     // extension property: a getter, no field
    get() = split(Regex("\\s+")).count { it.isNotEmpty() }

fun main() {
    println("Hello, Kotlin World!".slugify())  // hello-kotlin-world
    println("one two  three".wordCount)        // 3
}
```

On the JVM, `slugify` becomes `public static String slugify(String $this)` in the file's `...Kt` class. Inside the body, `this` is the receiver and can be left out. Extensions can be declared on nullable types too (`fun String?.orDash() = this ?: "-"`), which is how `isNullOrEmpty()` works on a null reference.

Extension *properties* are only computed getters (and setters): there is nowhere to store a field, because the class wasn't changed.

## Static dispatch

```kotlin
open class Shape
class Circle : Shape()

fun Shape.name() = "shape"
fun Circle.name() = "circle"

fun describe(s: Shape) = s.name()           // decided here, at compile time

fun main() {
    println(describe(Circle()))              // shape
    println(Circle().name())                 // circle
}
```

`describe` is compiled against `Shape`, so it calls `Shape.name()` whatever object is passed in. A member function declared `open` and overridden in `Circle` would print `circle`. If you want polymorphism, use members (or `when` over a sealed type); if you want to add helpers to a type you don't own, use extensions.

Two related rules:

- **Members win.** An extension with the same name and parameters as a member is never called.
- **Extensions are imported.** An extension declared in another package has to be imported by name, which keeps them from leaking everywhere. Two libraries with the same extension name are resolved by which one you import.

## Where extensions shine

Kotlin's standard library is mostly extensions: `map`, `filter` and `joinToString` are extensions on `Iterable`, so they work on any Java collection too. Android KTX and many server libraries do the same for platform APIs. A good extension is small, has no surprising side effects, and is about the receiver: `Instant.toLocalDate(zone)` yes, `String.sendEmail()` probably not.

Extensions with a receiver are also the building block for lambdas with receivers (`buildString { append("x") }`), which the next topics use. Kotlin 2.4 made **context parameters** stable: `context(logger: Logger) fun save()` asks for a value that must be available in the caller's context, a more explicit replacement for the old experimental context receivers.
