---
id: dotnet-records
title: Records and pattern matching
summary: Data types with value equality, and switch on their shape
why: "Records and patterns let you model data and the decisions on it in a few lines, with the compiler checking you handled every case."
requires: [dotnet-types]
lesson: none
points:
  - title: Value equality
    text: "Two records with equal properties are equal (==, Equals, GetHashCode), even though they are different objects."
  - title: Immutable by default
    text: "Positional records have init-only properties. Use a with expression to make a modified copy."
  - title: Class or struct
    text: "record (or record class) is a reference type; record struct is a value type with the same conveniences."
  - title: Patterns test shape
    text: "Type, property, positional, relational, list and logical patterns combine in switch expressions, with a warning if a case is missed."
quiz:
  - q: What does this print?
    code: |
      var a = new Money(10m, "EUR");
      var b = new Money(10m, "EUR");
      Console.WriteLine($"{a == b} {ReferenceEquals(a, b)}");
      record Money(decimal Amount, string Currency);
    options: ["True True", "True False", "False False"]
    answer: 1
    explain: "Records generate value-based equality, so a == b compares Amount and Currency. They are still two separate objects on the heap."
  - q: "What does `a with { Amount = 25m }` do?"
    options:
      - "Changes a's Amount to 25"
      - "Creates a copy of a with Amount set to 25, leaving a unchanged"
      - "Compares a's Amount with 25"
    answer: 1
    explain: "with calls the record's copy constructor and then sets the listed init-only properties on the copy."
  - q: "Which value matches the pattern `[var first, .., var last]`?"
    options:
      - "An empty array"
      - "An array with exactly one element"
      - "An array with two or more elements"
    answer: 2
    explain: "first and last must be different positions, and .. matches zero or more elements in between, so the list needs at least two elements. [var only] matches exactly one."
links:
  - { title: "Records (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record" }
  - { title: "Pattern matching overview (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching" }
  - { title: "Patterns (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns" }
---
A record is a class (or, with `record struct`, a struct) for which the compiler writes the boilerplate of a data type: a constructor and properties from a positional declaration, value-based `Equals`, `==` and `GetHashCode`, a readable `ToString`, a copy constructor for `with`, and a `Deconstruct` method. Pattern matching is the other half: a way to ask what shape a value has and pull its parts out in the same expression.

## Records

```csharp
var a = new Money(10m, "EUR");
var b = new Money(10m, "EUR");
Console.WriteLine(a == b);                 // True: same values
Console.WriteLine(ReferenceEquals(a, b));  // False: two objects
var c = a with { Amount = 25m };
Console.WriteLine(c);                      // Money { Amount = 25, Currency = EUR }

record Money(decimal Amount, string Currency);
```

The positional properties are `init`-only, so a record is immutable unless you add settable properties yourself. That makes records good keys in dictionaries and good messages, DTOs and value objects. Two caveats: equality compares each property with its own `Equals`, so a record holding a `List<T>` compares the lists by reference; and a mutable property that changes after the record is used as a dictionary key breaks the lookup.

`record struct` gives the same features to a value type. A plain `record struct` has settable properties; `readonly record struct` is the immutable version.

## Switch expressions and patterns

```csharp
static string Describe(Shape s) => s switch
{
    Circle { Radius: <= 0 } => "invalid circle",
    Circle c => $"circle, area {Math.PI * c.Radius * c.Radius:F2}",
    Rect(var w, var h) when w == h => $"square {w}",
    Rect(var w, var h) => $"rect {w}x{h}",
    _ => "unknown",
};

static string Classify(int[] xs) => xs switch
{
    [] => "empty",
    [var only] => $"one: {only}",
    [var first, .., var last] => $"from {first} to {last}",
};

abstract record Shape;
record Circle(double Radius) : Shape;
record Rect(double W, double H) : Shape;
```

With `Circle(1)`, `Rect(2, 2)`, `Rect(2, 3)` and `[1, 2, 3]`, this printed `circle, area 3.14`, `square 2`, `rect 2x3` and `from 1 to 3` on .NET 10. The patterns used:

- **type pattern** `Circle c`: matches and binds a typed variable;
- **property pattern** `{ Radius: <= 0 }` with a **relational pattern** inside;
- **positional pattern** `Rect(var w, var h)`, which calls the generated `Deconstruct`;
- a **case guard** with `when`;
- **list patterns** (C# 11) with `..` for "any number of elements";
- **logical patterns** `and`, `or` and `not`, as in `is not null` or `>= 0 and < 10`.

Arms are tried in order, and the compiler reports an error if an arm can never be reached because an earlier one covers it, and a warning (CS8509) if some input matches no arm. That warning is the reason to prefer a switch expression over a chain of `if` statements: add a new kind of input and the compiler shows you every place that doesn't handle it yet. C# 14 can't declare that a hierarchy is closed, so a `_` arm is still needed for an abstract base like `Shape`.
