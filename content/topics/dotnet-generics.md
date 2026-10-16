---
id: dotnet-generics
title: "Generics: reified, not erased"
summary: The runtime knows what T is, and compiles for it
why: "Reified generics are why List<int> doesn't box, why typeof(T) and new T() work, and how .NET differs from Java's type erasure."
requires: [dotnet-types]
lesson: none
points:
  - title: Types exist at run time
    text: "List<int> and List<string> are different types to the runtime, with their own type objects and static fields."
  - title: Shared or specialised code
    text: "The JIT compiles one shared copy of a generic method for all reference types, and a separate, specialised copy for each value type."
  - title: T is usable
    text: "You can write typeof(T), default(T), o is List<T> and, with a new() constraint, new T()."
  - title: Constraints add capabilities
    text: "where T : struct, class, notnull, new(), a base class, or an interface (including static abstract members, such as INumber<T>)."
quiz:
  - q: What does this print in C#?
    code: |
      Console.WriteLine(typeof(List<int>) == typeof(List<string>));
    options: ["True", "False", "It doesn't compile"]
    answer: 1
    explain: "The type arguments are part of the runtime type. The same comparison in Java (names.getClass() == counts.getClass()) is true, because Java erases them."
  - q: "Why does List<int> store its numbers without boxing?"
    options:
      - "The JIT generates code specialised for int, and the list's backing array is a real int[]"
      - "ints are reference types inside collections"
      - "Boxing happens, but the GC hides it"
    answer: 0
    explain: "For each value type argument, the runtime creates a separate instantiation with code compiled for that exact type and layout."
  - q: "Which of these is allowed in a generic method `static T Make<T>() where T : new()`?"
    options:
      - "return new T();"
      - "return T.Parse(\"1\"); with no further constraint"
      - "return (T)null; for any T"
    answer: 0
    explain: "The new() constraint promises a public parameterless constructor. Calling a static member like Parse needs a static abstract interface constraint (for example where T : IParsable<T>)."
links:
  - { title: "Generics in .NET (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/" }
  - { title: "Generics in the runtime (C# programming guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/generics-in-the-run-time" }
  - { title: "Constraints on type parameters (C# programming guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters" }
  - { title: "Generic math (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/generics/math" }
---
Generics in .NET are part of IL and the runtime type system, not just the compiler. When a program uses `List<int>`, the runtime creates a real type for that instantiation, with its own method table and its own copy of static fields. This is called reification, and it is the main difference from Java, where the compiler checks generic types and then erases them to `Object`.

## The runtime sees T

```csharp
Console.WriteLine(typeof(List<int>) == typeof(List<string>));
Console.WriteLine(typeof(List<int>));
Console.WriteLine(Make<Widget>().Name);
Console.WriteLine(IsList<int>(new List<int>()));
Console.WriteLine(IsList<int>(new List<long>()));

static T Make<T>() where T : new() => new T();
static bool IsList<T>(object o) => o is List<T>;
class Widget { public string Name => "widget"; }
```

On .NET 10 this printed `False`, ``System.Collections.Generic.List`1[System.Int32]``, `widget`, `True`, `False`. Each line is something Java's erasure rules out: distinct runtime types, `new T()`, and a type test against a parameterised type.

## How the JIT compiles generic code

Reifying every instantiation separately would multiply code size, so the runtime splits the cases:

- **Reference type arguments share code.** Every reference is a pointer of the same size, so `List<string>`, `List<Customer>` and `List<object>` run the same machine code. That shared code finds the actual type, when it needs it, through a hidden generic context.
- **Value type arguments get their own code.** `List<int>`, `List<double>` and `List<MyStruct>` each get code compiled for that size and layout. Elements are stored unboxed in a real `int[]` or `MyStruct[]`, and calls such as `EqualityComparer<T>.Default.Equals` can be inlined.

This is why the generic collections replaced `ArrayList` and `Hashtable`: they keep value types unboxed and type checks happen at compile time.

## Constraints

A type parameter with no constraint can be used only as `object`. Constraints unlock more:

```csharp
static T Sum<T>(IEnumerable<T> items) where T : INumber<T>
{
    T total = T.Zero;
    foreach (var x in items) total += x;     // operator + from the interface
    return total;
}
```

`INumber<T>` uses static abstract interface members (C# 11), so one method works for `int`, `decimal` or `double`, and because each value type gets its own compiled copy, the addition is a single machine instruction. Other useful constraints are `struct`, `class`, `notnull`, `unmanaged`, `new()`, a base class and `allows ref struct` (C# 13, for spans).

## Variance

Generic interfaces and delegates can be covariant (`out T`) or contravariant (`in T`): an `IEnumerable<string>` can be used as an `IEnumerable<object>`, and an `Action<object>` as an `Action<string>`. Variance applies only to interfaces and delegates, only for reference types, so `List<string>` is never a `List<object>` and `IEnumerable<int>` is not an `IEnumerable<object>`.
