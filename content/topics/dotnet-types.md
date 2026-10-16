---
id: dotnet-types
title: Value types, reference types and boxing
summary: Copied by value or shared by reference, and the hidden allocation in between
why: "Whether a type is a struct or a class decides what assignment copies, where the data lives, and whether a call quietly allocates on the heap."
requires: [dotnet-il]
lesson: none
points:
  - title: Classes are references
    text: A variable of a class type holds a reference to an object on the heap. Assigning it copies the reference, so both variables see the same object.
  - title: Structs are values
    text: "A struct's fields are stored inline: in the local, the array element or the containing object. Assigning it copies all the fields."
  - title: Boxing allocates
    text: Converting a value type to object or to an interface copies it into a new heap object. In hot code that is garbage you didn't ask for.
  - title: Small and immutable
    text: "Use a struct for small, immutable values (readonly struct, record struct). Large or mutable structs are easy to copy by accident."
quiz:
  - q: What does this print?
    code: |
      var a = new P { X = 1 };
      var b = a;
      b.X = 99;
      Console.WriteLine(a.X);
      struct P { public int X; }
    options: ["1", "99", "It doesn't compile"]
    answer: 0
    explain: "P is a struct, so `var b = a` copies its fields. Changing b leaves a alone. With `class P` it would print 99."
  - q: Which line boxes?
    code: |
      int n = 42;
      long l = n;          // line 2
      object o = n;        // line 3
      string s = n.ToString(); // line 4
    options: ["Line 2", "Line 3", "Line 4"]
    answer: 1
    explain: "Assigning an int to object wraps a copy in a heap object. Widening to long is a plain conversion, and ToString is called directly on the int (it allocates a string, but doesn't box)."
  - q: Why do List<int> and Dictionary<int, T> avoid boxing when the old ArrayList and Hashtable did not?
    options:
      - "They store ints as strings"
      - "Generics over value types are compiled for that type, so elements are stored as raw ints"
      - "The JIT removes all boxing"
    answer: 1
    explain: "ArrayList stores object, so every int added is boxed. List<int> has an int[] inside. The generics topic shows how the runtime specialises code for each value type."
links:
  - { title: "Value types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types" }
  - { title: "Boxing and unboxing (C# programming guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing" }
  - { title: "Choosing between class and struct (.NET design guidelines)", url: "https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct" }
---
Every type in C# is either a reference type (`class`, `interface`, `delegate`, `record`, arrays, `string`) or a value type (`struct`, `enum`, the numeric types, `bool`, `char`, `record struct`). The difference is what a variable holds: a reference type variable holds a pointer to an object on the managed heap, while a value type variable holds the value itself. That one fact decides what assignment does, where memory is allocated, and when the garbage collector gets involved.

## Copy or share

```csharp
var a = new PointS(1, 2);
var b = a;          // copies the whole struct
b.X = 99;
Console.WriteLine($"struct: a.X={a.X} b.X={b.X}");

var c = new PointC(1, 2);
var d = c;          // copies the reference
d.X = 99;
Console.WriteLine($"class:  c.X={c.X} d.X={d.X}");

struct PointS { public int X, Y; public PointS(int x, int y) { X = x; Y = y; } }
class PointC { public int X, Y; public PointC(int x, int y) { X = x; Y = y; } }
```

This prints `struct: a.X=1 b.X=99` and `class:  c.X=99 d.X=99`. The same copying happens when you pass a struct to a method, return it, or read it out of a `List<T>` indexer: you get a copy, which is why `list[0].X = 5` on a list of mutable structs is a compile error.

"Structs live on the stack" is only half true. A struct lives wherever its container is: a local in a stack frame (or a CPU register), an element inside an array on the heap, a field inside a class object. A class instance always lives on the heap, has an object header and a pointer to its method table (16 bytes of overhead on 64-bit), and is reclaimed by the GC.

## Boxing

Sometimes a value has to be treated as an `object`: stored in an `object` variable, passed as an interface it implements, or put into a non-generic collection. The runtime then **boxes** it: allocates a heap object, copies the value in, and hands back a reference. Unboxing copies it back out.

```csharp
long before = GC.GetAllocatedBytesForCurrentThread();
object boxed = 0;
for (int i = 0; i < 1000; i++) boxed = i;          // boxes on every assignment
Console.WriteLine(GC.GetAllocatedBytesForCurrentThread() - before);
```

On .NET 10 x64 this reported 24,024 bytes: 1,001 boxes of 24 bytes each (header, method table pointer, and the 4-byte int padded to 8). The same loop adding into an `int` allocated nothing. Common hidden sources of boxing are `string.Format` and logging calls with `object` parameters, calling an interface method on a struct through the interface type, and `Equals(object)` on structs that don't override it.

## Choosing

Prefer a class by default. Choose a struct for a small value that is logically one thing (a coordinate, a money amount, a key), is usually immutable, and is copied less often than it is created. Mark it `readonly struct` so the compiler stops you mutating it and avoids defensive copies. Pass large structs with `in` or `ref` if profiling shows copying matters.
