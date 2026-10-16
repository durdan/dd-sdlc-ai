---
id: dotnet-jit
title: "The JIT: tiers, PGO, ReadyToRun and Native AOT"
summary: Compile fast first, compile well later, or compile everything ahead of time
why: "Explains why a .NET service is slower for its first seconds, why micro-benchmarks need BenchmarkDotNet, and what you give up when you publish with Native AOT."
requires: [dotnet-il]
lesson: none
points:
  - title: Tier 0 first
    text: "A method's first compilation is quick and unoptimised (or uses precompiled ReadyToRun code), so the app starts sooner."
  - title: Tier 1 when hot
    text: Methods called about 30 times are recompiled in the background with full optimisation, and calls switch to the new code.
  - title: Dynamic PGO
    text: "Since .NET 8, tier 0 code is instrumented and the tier 1 compile uses what it saw, for example which concrete type sits behind an interface call."
  - title: Two ahead-of-time options
    text: "ReadyToRun ships precompiled code but keeps the JIT. Native AOT removes the JIT entirely, at the price of no runtime code generation."
quiz:
  - q: A method has been called 5 times since start-up. What code is most likely running?
    options:
      - "Fully optimised tier 1 code"
      - "Tier 0 code: quick-JIT output or the precompiled ReadyToRun version"
      - "The IL, interpreted"
    answer: 1
    explain: "On servers and desktops CoreCLR does not interpret IL; everything is compiled. Methods start at tier 0 and are promoted once they have been called about 30 times, after a short start-up delay."
  - q: What does ReadyToRun change?
    options:
      - "It removes the JIT from the app"
      - "It ships precompiled machine code alongside the IL, so start-up needs less JIT work; hot methods are still recompiled at tier 1"
      - "It makes the app independent of the processor architecture"
    answer: 1
    explain: "ReadyToRun code counts as tier 0. The IL is still there, so the JIT can produce better code for hot methods, and anything not precompiled is still compiled at run time."
  - q: Which kind of code is a problem for Native AOT?
    options:
      - "Generic methods over value types"
      - "Code that emits IL at run time or reflects over types the compiler cannot see statically"
      - "async methods"
    answer: 1
    explain: "With no JIT at run time, System.Reflection.Emit and unconstrained reflection can't work or may find trimmed members. The compiler reports these as IL2xxx and IL3xxx warnings when you publish."
links:
  - { title: "Compilation config settings: tiered compilation, quick JIT, PGO (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation" }
  - { title: "ReadyToRun deployment overview (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/deploying/ready-to-run" }
  - { title: "Native AOT deployment (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/" }
  - { title: "What's new in the .NET 8 runtime: dynamic PGO on by default", url: "https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/runtime" }
---
The JIT (RyuJIT) turns a method's IL into machine code the first time the method is called. Doing that well takes time, and most methods are called only a few times, so since .NET Core 3.0 the runtime compiles in tiers: a cheap compilation first, and an expensive, optimised one only for the methods that turn out to matter.

## Tiers

- **Tier 0**: the quick JIT compiles with almost no optimisation, or, if the assembly contains ReadyToRun code, the runtime simply uses that. Either way the method can run almost at once.
- **Tier 1**: the runtime counts calls. Once start-up activity has settled (a 100 ms timer that resets while new tier 0 compilations are happening) and a method reaches 30 calls, it is queued for an optimised compilation on a background thread. When that finishes, the method's entry point is patched and new calls run the fast version.

Methods with loops are special: a method called once that loops a billion times would never reach 30 calls. Depending on version and platform, the runtime either optimises such methods straight away or, with on-stack replacement (OSR), starts them at tier 0 and switches to optimised code in the middle of the running loop.

## Dynamic PGO

Since .NET 8, dynamic profile-guided optimisation is on by default. Tier 0 code for hot methods is instrumented to record what actually happens: which branches are taken and which concrete class sits behind an interface or virtual call. The tier 1 compile uses that, for example by checking for the common type and calling (or inlining) its method directly, with a normal virtual call as the fallback. Microsoft's .NET 8 notes measure about 15% on average across their benchmark suite.

All of this is why a fresh process is slower for its first seconds, and why a loop timed with `Stopwatch` right after start-up mostly measures the JIT. Use BenchmarkDotNet, which warms up, runs many iterations and reports the distribution.

## Ahead of time

Two publish options move compilation to build time:

```xml
<PropertyGroup>
  <PublishReadyToRun>true</PublishReadyToRun>   <!-- precompiled code plus IL; JIT still present -->
  <!-- or -->
  <PublishAot>true</PublishAot>                 <!-- one native executable; no JIT at all -->
</PropertyGroup>
```

**ReadyToRun** stores machine code next to the IL. Start-up improves because less is compiled at run time, the app is larger, and hot methods are still recompiled at tier 1, so steady-state speed is unchanged. The framework's own libraries already ship this way.

**Native AOT** compiles the whole app, the parts of the framework it uses, and a slimmed runtime into one native executable. Start-up is fast and memory use is low, which suits command-line tools, serverless functions and small containers. The trade-offs: no `Reflection.Emit`, reflection only over what the compiler can see, trimming of unused code, no dynamic PGO, and one build per operating system and architecture. Libraries that are not AOT-ready produce trimming and AOT warnings when you publish. In .NET 10, file-based apps (`dotnet run app.cs`) enable `PublishAot` by default; running this path's EF Core example that way failed with "Model building is not supported when publishing with NativeAOT" until `#:property PublishAot=false` was added.
