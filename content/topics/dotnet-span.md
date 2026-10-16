---
id: dotnet-span
title: "Span<T> and Memory<T>: slicing without allocating"
summary: A safe window onto memory you already have
why: "Parsing, formatting and I/O code in modern .NET is fast mostly because it works on spans instead of allocating substrings and arrays."
requires: [dotnet-types, dotnet-gc]
lesson: none
points:
  - title: A pointer and a length
    text: "Span<T> refers to a contiguous run of Ts in an array, a string, the stack or native memory. Slicing it creates a new view, not a copy."
  - title: Stack-only by design
    text: "Span<T> is a ref struct: it can't be boxed, stored in a field of a class, or kept across an await, so it can never outlive the memory it points to."
  - title: Memory<T> for the heap
    text: "When you need to store a slice or pass it to async code, use Memory<T> and call .Span when you are ready to work on it."
  - title: APIs take spans
    text: "int.Parse, Encoding, Stream.Read, Utf8JsonReader and many more have span overloads, so whole pipelines can run without temporary allocations."
quiz:
  - q: What does `"hello world".AsSpan(6, 5)` allocate?
    options:
      - "A new five-character string"
      - "Nothing on the heap: it is a view of the existing string's characters"
      - "A char array copy"
    answer: 1
    explain: "AsSpan returns a ReadOnlySpan<char> pointing into the original string. Only calling ToString() on it would allocate a new string."
  - q: "Why does this fail with error CS4007, while moving `header[0]` into a local before the await compiles and prints 7?"
    code: |
      static async Task<int> FirstByteAsync(Stream s)
      {
          Span<byte> header = stackalloc byte[4];
          s.ReadExactly(header);
          await Task.Delay(10);
          return header[0];
      }
    options:
      - "stackalloc is not allowed in async methods"
      - "The span is used after the await, but locals that live across an await move into a heap-allocated state machine, where a span can't go"
      - "ReadExactly doesn't accept a Span"
    answer: 1
    explain: "Since C# 13 an async method may use a span between awaits, but not across one. After an await the method can resume on another thread with a different stack. Copy what you need out first, or use Memory<byte> for async I/O."
  - q: When should a method parameter be Memory<T> rather than Span<T>?
    options:
      - "When the method is async or must keep the buffer after it returns"
      - "When the data is larger than 85,000 bytes"
      - "Always: Memory<T> is faster"
    answer: 0
    explain: "Span<T> is the cheaper, safer default for synchronous code. Memory<T> can live on the heap, so it suits async methods and stored references."
links:
  - { title: "Memory- and span-related types (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/" }
  - { title: "Memory<T> and Span<T> usage guidelines (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/memory-t-usage-guidelines" }
  - { title: "ref struct types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/ref-struct" }
---
`Span<T>` is a small struct holding a reference to the start of some memory and a length. That memory can be a slice of an array, the characters of a string (as `ReadOnlySpan<char>`), a buffer allocated on the stack with `stackalloc`, or native memory. Slicing a span produces another span over the same memory, so code can carve up input, parse it and pass pieces around without copying anything to the heap.

## Splitting without substrings

```csharp
string line = "12,7,30,5,46";
SumSplit(line); SumSpan(line);      // run both once so JIT work is not counted
long t0 = GC.GetAllocatedBytesForCurrentThread();
int s1 = SumSplit(line);
long t1 = GC.GetAllocatedBytesForCurrentThread();
int s2 = SumSpan(line);
long t2 = GC.GetAllocatedBytesForCurrentThread();
Console.WriteLine($"Split: sum {s1}, {t1 - t0} bytes allocated");
Console.WriteLine($"Span:  sum {s2}, {t2 - t1} bytes allocated");

static int SumSplit(string s)
{
    int total = 0;
    foreach (var part in s.Split(',')) total += int.Parse(part);   // an array plus five strings
    return total;
}
static int SumSpan(ReadOnlySpan<char> s)
{
    int total = 0;
    foreach (var range in s.Split(','))       // span Split, .NET 9 and later
        total += int.Parse(s[range]);         // parses a slice in place
    return total;
}
```

On .NET 10 this printed `Split: sum 100, 208 bytes allocated` and `Span:  sum 100, 0 bytes allocated`. Two hundred bytes is nothing once, but a service parsing millions of lines a second turns that into constant gen 0 collections.

## Why spans have rules

A span can point into the stack, so the compiler must guarantee it never outlives the frame it points into. `Span<T>` is therefore a `ref struct`, and ref structs:

- can't be boxed, converted to `object` or used as a type argument (C# 13 added `allows ref struct` for generics that opt in);
- can't be fields of a class or a normal struct;
- can't be captured by lambdas or used across an `await` or `yield return`, because locals that live across those move into a heap object. Since C# 13 an async method may use a span between awaits; using one after an `await` fails with error CS4007.

The compiler enforces all of this, so spans are as safe as arrays while being as cheap as pointers.

## Memory<T> when you need the heap

`Memory<T>` describes the same kind of slice but is an ordinary struct, so it can be stored in a field and passed through async methods. It cannot point at stack memory. The usual pattern is to hold `Memory<T>` and take `.Span` at the point where you do synchronous work:

```csharp
byte[] rented = ArrayPool<byte>.Shared.Rent(4096);
try
{
    Memory<byte> buffer = rented;
    int read = await stream.ReadAsync(buffer);
    Process(buffer.Span[..read]);
}
finally { ArrayPool<byte>.Shared.Return(rented); }
```

Combined with `ArrayPool`, this keeps both the large-object heap and gen 0 quiet. Treat spans as an optimisation for hot paths you have measured. Plain strings and arrays remain the clearest choice elsewhere.
