---
id: dotnet-il
title: "From C# to IL: assemblies and the CLR"
summary: The compiler emits a portable instruction set; the runtime does the rest
why: "Knowing that C# compiles to IL, not to machine code, explains why every .NET language can share libraries, why reflection works, and why start-up and steady state behave differently."
lesson: none
points:
  - title: Roslyn emits IL
    text: The C# compiler turns source into Common Intermediate Language (IL) plus metadata describing every type and member, packed into an assembly (.dll).
  - title: A stack machine
    text: IL pushes values onto an evaluation stack and pops them off. It is independent of the processor and is checked for type safety when it is loaded.
  - title: The CLR runs it
    text: "The Common Language Runtime loads assemblies, lays out types, compiles IL to machine code with the JIT, and manages memory, threads and exceptions."
  - title: Metadata is the contract
    text: Because every assembly describes itself, reflection, serializers, dependency injection and other languages (F#, VB) can all use your types.
quiz:
  - q: What does `dotnet build` put in a typical .dll for a C# project?
    options:
      - "Machine code for the CPU it was built on"
      - "IL plus metadata describing types and members"
      - "The C# source in compressed form"
    answer: 1
    explain: "Unless you ask for ReadyToRun or Native AOT, the assembly contains IL and metadata. The JIT turns IL into machine code at run time, on whatever processor the program ends up on."
  - q: Why can an F# project reference a library written in C#?
    options:
      - "Both compile to IL with the same metadata format, defined by the Common Language Infrastructure standard"
      - "F# includes a C# compiler"
      - "The library is shipped as source"
    answer: 0
    explain: "ECMA-335 defines IL, metadata and the type system. Any language that emits it produces assemblies the others can load."
  - q: "In IL, how does `a + b` on two int parameters look?"
    options:
      - "One instruction with three register operands"
      - "Push a, push b, then an add instruction that pops both and pushes the sum"
      - "A call to a method named op_Addition"
    answer: 1
    explain: "IL is a stack machine: ldarg.0 and ldarg.1 push the arguments, add pops two and pushes one. Registers only appear once the JIT has compiled it. op_Addition is only called for user-defined operators."
links:
  - { title: "Managed execution process (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process" }
  - { title: "Common Language Runtime overview (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/clr" }
  - { title: "ECMA-335: Common Language Infrastructure", url: "https://ecma-international.org/publications-and-standards/standards/ecma-335/" }
  - { title: "C# language specification (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/readme" }
---
When you build a C# project, the compiler (Roslyn) does not produce instructions for your processor. It produces Common Intermediate Language, a compact stack-based instruction set, together with metadata that describes every type, method, field and attribute. The two together form an assembly, the `.dll` you reference and ship. Turning IL into machine code is the job of the Common Language Runtime (CLR), at the moment the code is first needed.

## What IL looks like

Take a tiny method:

```csharp
static int Add(int a, int b) => a + b;
```

In a Release build its IL is four instructions: `ldarg.0` pushes `a` onto the evaluation stack, `ldarg.1` pushes `b`, `add` pops both and pushes their sum, and `ret` returns the value on top of the stack. There are no registers and no assumptions about word size or calling convention. You can see the IL for any method with a disassembler such as ILSpy, or with the IL viewer in Rider or Visual Studio extensions.

The format is a standard, ECMA-335 (the Common Language Infrastructure). It defines IL, the metadata tables, and the common type system that every .NET language agrees on. That is why F#, VB and C# libraries interoperate without bindings.

## What the CLR does with it

When a process starts, the host (the `dotnet` executable or your app's native launcher) loads the runtime, which then:

1. **Loads assemblies** on demand, reading their metadata to find types and their dependencies.
2. **Lays out types**: computes field offsets, builds method tables (the per-type structure used for virtual calls and type checks), and runs static constructors when a type is first used.
3. **Verifies and compiles**: the first call to a method goes through a stub that asks the JIT to compile its IL; later calls go straight to the machine code.
4. **Manages the process**: allocates objects and collects them, runs the thread pool, unwinds the stack for exceptions, and enforces type safety at casts.

Because compilation happens at run time, the same assembly runs on x64 and Arm64, on Linux, Windows and macOS. The cost is that the first calls to every method pay for compilation, which the next topic is about.

## Metadata makes the ecosystem work

Every assembly carries a full description of itself, so code can inspect types it has never seen at compile time:

```csharp
foreach (var m in typeof(string).GetMethods().Take(3))
    Console.WriteLine(m.Name);
```

Reflection, `System.Text.Json`, ASP.NET Core model binding, dependency injection containers and test frameworks all rely on this. It is also what Native AOT has to work around: when there is no JIT at run time, code that generates new types or methods on the fly cannot work, and code that reflects over types the compiler couldn't see may find them trimmed away.

## Versions to know

.NET (formerly .NET Core) is the cross-platform runtime; .NET Framework 4.8 is the older, Windows-only one, still maintained but not getting new features. New releases ship every November; even-numbered ones are long-term support (three years), odd-numbered ones are standard-term (two years). .NET 10 shipped in November 2025 with C# 14.
