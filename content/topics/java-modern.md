---
id: java-modern
title: Records, sealed types and pattern matching
summary: Data as data, and a switch the compiler can check
why: "Java 21 can model 'one of these shapes of data' directly, and the compiler then tells you every place that forgot a case."
requires: [java-generics]
lesson: none
points:
  - title: Records carry data
    text: A record declares its components once and gets a constructor, accessors, equals, hashCode and toString, all derived from them.
  - title: Sealed types close the set
    text: A sealed interface or class lists exactly which types may implement or extend it.
  - title: Patterns take values apart
    text: "instanceof and switch can test a type and bind its parts in one step, including nested record patterns and when guards."
  - title: Exhaustive switches
    text: A switch over a sealed type that covers every case needs no default, and stops compiling when someone adds a new case.
quiz:
  - q: Which of these does a record not get automatically?
    options:
      - An equals that compares every component
      - Setters for its components
      - A toString listing the components
    answer: 1
    explain: "Record fields are private and final. A record gets a canonical constructor, accessors, equals, hashCode and toString, but no setters: to change a value you create a new record."
  - q: "Shape is sealed with permits Circle, Rect. A switch over a Shape covers both with no default. Someone adds Triangle to the permits list. What happens?"
    options:
      - The switch silently returns null for triangles
      - The switch no longer compiles until a Triangle case (or a default) is added
      - It throws at start-up
    answer: 1
    explain: "The compiler checks exhaustiveness against the permitted subtypes. If code compiled against the old hierarchy meets a Triangle at run time anyway, the synthetic default throws MatchException."
  - q: What does case Rect(double w, double h) when w == h do?
    options:
      - Creates a new Rect
      - Matches a Rect whose two components are equal, binding them to w and h
      - Compares the Rect with another Rect using equals
    answer: 1
    explain: "A record pattern checks the type and calls the accessors to bind the components; the when guard adds a condition. If the guard is false, matching continues with the next case."
links:
  - title: "JEP 395: records"
    url: https://openjdk.org/jeps/395
  - title: "JEP 409: sealed classes"
    url: https://openjdk.org/jeps/409
  - title: "JEP 441: pattern matching for switch"
    url: https://openjdk.org/jeps/441
  - title: "JEP 440: record patterns"
    url: https://openjdk.org/jeps/440
---
Several features that arrived between Java 16 and 21 fit together: records (final in Java 16) for plain data, sealed classes and interfaces (Java 17) for a fixed set of alternatives, and pattern matching in `instanceof`, `switch` and record patterns (Java 21) for taking values apart. Combined, they let you write the kind of "it is one of these" data model that used to need a visitor pattern, and the compiler checks it for you.

## Records

```java
record Money(long cents, String currency) {
    Money {                                   // compact constructor: validates, then assigns
        if (cents < 0) throw new IllegalArgumentException("negative");
        currency = currency.toUpperCase();
    }

    Money plus(Money other) {
        return new Money(cents + other.cents, currency);
    }
}
```

From the header, the compiler generates a `private final` field for each component, a canonical constructor, accessors named after the components (`cents()`, not `getCents()`), and `equals`, `hashCode` and `toString` based on every component. A record is implicitly `final` and can't extend another class, but it can implement interfaces and have static fields and extra methods. It is only shallowly immutable: a record holding a `List` holds a reference to a list that can still change, so copy it with `List.copyOf` in the compact constructor if that matters.

## Sealed types

```java
sealed interface Shape permits Circle, Rect, Square {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}
record Square(double side) implements Shape {}
```

`permits` lists every allowed subtype. Each must be `final` (records already are), `sealed` itself, or `non-sealed` to reopen its branch. The permitted types must be in the same module, or the same package if you don't use modules. The JVM enforces the list too: the class file records it, so another library can't add a fourth shape.

## Patterns in switch

```java
static double area(Shape s) {
    return switch (s) {                       // no default: the compiler knows every case
        case Circle c -> Math.PI * c.r() * c.r();
        case Rect(double w, double h) -> w * h;
        case Square(double side) when side == 0 -> 0;
        case Square(double side) -> side * side;
    };
}
```

- A **type pattern** (`Circle c`) tests the type and binds a variable.
- A **record pattern** (`Rect(double w, double h)`) also calls the accessors and binds the parts. Record patterns nest: `case Line(Point(var x1, var y1), Point p2)`.
- A **guard** (`when side == 0`) adds a condition. Cases are tried top to bottom, and the compiler rejects a case that an earlier one makes unreachable.
- `case null` is allowed. Without it, switching on `null` throws `NullPointerException` as before.

Because `Shape` is sealed, the compiler knows these cases are **exhaustive**, so no `default` is needed. That is the real benefit: add `Triangle` to `permits` and every switch that doesn't handle it stops compiling. If code compiled against the old hierarchy meets a new subtype at run time anyway, the compiler's hidden default throws `MatchException`.

The same patterns work in `instanceof`: `if (obj instanceof Rect(var w, var h) && w == h)`.

## Preview features to know about

Java 21 also previewed unnamed patterns and variables (`_` for a component you don't need), which became final in Java 22. Preview features need `--enable-preview` and can change, so keep them out of production code on 21.
