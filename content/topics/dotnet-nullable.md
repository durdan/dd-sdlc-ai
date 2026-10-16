---
id: dotnet-nullable
title: Nullable reference types
summary: The compiler tracks which references may be null
why: "NullReferenceException is the most common .NET crash. Nullable annotations move most of them from production to compiler warnings."
requires: [dotnet-types]
lesson: none
points:
  - title: Annotations, not new types
    text: "With nullable enabled, string means 'should never be null' and string? means 'may be null'. At run time both are the same string type."
  - title: Flow analysis
    text: The compiler follows each variable through ifs, returns and assignments, and warns when you dereference one that might be null.
  - title: Warnings only
    text: "Nothing is checked at run time. Data from JSON, reflection or old libraries can still be null, so validate at the edges."
  - title: On by default
    text: "New projects since .NET 6 have <Nullable>enable</Nullable>. Treat the warnings as errors in new code."
quiz:
  - q: "With nullable enabled, what does `string? name` change at run time compared with `string name`?"
    options:
      - "Nothing: it is an annotation the compiler uses for warnings"
      - "It wraps the string in Nullable<string>"
      - "It adds a null check on every access"
    answer: 0
    explain: "For reference types, ? is metadata only. For value types it is different: int? really is Nullable<int>, a struct with a HasValue flag."
  - q: What does the null-forgiving operator `name!` do?
    options:
      - "Throws if name is null"
      - "Tells the compiler to stop warning; it generates no check"
      - "Converts null to an empty string"
    answer: 1
    explain: "! only silences the analysis. If the value is null you still get a NullReferenceException where it is used. Prefer a real check or ArgumentNullException.ThrowIfNull."
  - q: "This compiles with warning CS8602. What happens when it runs?"
    code: |
      string? FindName(int id) => id == 1 ? "Ada" : null;
      string? name = FindName(2);
      Console.WriteLine(name.Length);
    options:
      - "It prints 0"
      - "It throws NullReferenceException"
      - "The compiler refuses to produce an executable"
    answer: 1
    explain: "Nullable warnings don't change code generation. In this topic's run, the build printed CS8602 and the program then crashed with NullReferenceException at line 3."
links:
  - { title: "Nullable reference types (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/nullable-references" }
  - { title: "Attributes for null-state static analysis (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis" }
  - { title: "Nullable value types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types" }
---
Before C# 8 every reference type variable could hold null, and nothing in the type said whether it was expected to. Nullable reference types add that information as annotations: in a nullable-enabled context, `string` means "never null" and `string?` means "might be null", and the compiler warns you when the two are mixed carelessly. The runtime is unchanged; this is entirely a compile-time analysis.

## What the compiler checks

```csharp
string? FindName(int id) => id == 1 ? "Ada" : null;
string? name = FindName(2);
Console.WriteLine(name.Length);
```

Building this with .NET 10 printed `warning CS8602: Dereference of a possibly null reference`, and running it threw `NullReferenceException` on line 3. The fix is to handle the null case where it can occur:

```csharp
if (name is null) { Console.WriteLine("unknown"); return; }
Console.WriteLine(name.Length);          // no warning: the compiler knows name is not null here
Console.WriteLine(name?.Length ?? 0);    // or: null-conditional plus a default
```

The compiler tracks a null state ("not null" or "maybe null") for every variable through branches, pattern matches and assignments. Common warnings are CS8600 (converting a possible null to a non-nullable type), CS8602 (dereferencing a maybe-null value), CS8618 (a non-nullable property not set by the constructor) and CS8625 (passing null where it isn't allowed).

## Telling the compiler what you know

Some APIs have contracts flow analysis can't see. Attributes in `System.Diagnostics.CodeAnalysis` describe them:

```csharp
bool TryGet(string key, [NotNullWhen(true)] out Customer? customer);
[return: NotNullIfNotNull(nameof(input))] string? Trim(string? input);
[MemberNotNull(nameof(_conn))] void EnsureOpen();
```

After `if (TryGet(key, out var c))`, `c` is treated as not null inside the `if`. The `required` modifier (C# 11) is the clean answer to CS8618 for properties that callers must set in an object initializer.

The null-forgiving operator `!` (as in `name!.Length`) suppresses a warning and generates nothing. Use it only when you know more than the compiler, and leave a comment saying why.

## Where nulls still get in

Annotations are a promise, not a guarantee. Values can still be null at run time when they come from:

- deserialisation: `System.Text.Json` can leave a non-nullable property null if the JSON omits it, unless the property is `required` or you validate;
- libraries compiled without annotations, whose types are "oblivious" and produce no warnings either way;
- `default` of a struct containing reference fields, and uninitialised array elements.

So check arguments at public boundaries (`ArgumentNullException.ThrowIfNull(arg)`), and let the annotations protect everything inside.

## Turning it on

New projects contain `<Nullable>enable</Nullable>`. For an existing codebase, enable it file by file with `#nullable enable`, annotate from the leaves (models, utilities) upwards, and then add `<WarningsAsErrors>nullable</WarningsAsErrors>` so new code can't regress.
