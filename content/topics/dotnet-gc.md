---
id: dotnet-gc
title: "The garbage collector: generations, LOH, server GC"
summary: Most objects die young, so collect the young ones often
why: "GC pauses and memory growth are the most common .NET performance complaints, and nearly every fix starts from knowing which generation the garbage is in."
requires: [dotnet-types]
lesson: none
points:
  - title: Three generations
    text: "New objects go in gen 0. Survivors of a collection are promoted to gen 1, then gen 2. Young generations are collected far more often than old ones."
  - title: Large objects are different
    text: "Objects of 85,000 bytes or more go on the large object heap, which is collected only with gen 2 and is swept rather than compacted by default."
  - title: Workstation or server
    text: "Console apps default to workstation GC (one heap); ASP.NET Core apps default to server GC (a heap and a GC thread per core), adjusted by DATAS since .NET 9."
  - title: Allocation is the lever
    text: Fewer and shorter-lived allocations mean fewer and cheaper collections. Measure before tuning settings.
quiz:
  - q: An object survives two garbage collections. Which generation is it in?
    options: ["Gen 0", "Gen 1", "Gen 2"]
    answer: 2
    explain: "Each collection that an object survives promotes it one generation, up to gen 2. In this topic's example, a new object reported gen 0, then 1 after one GC.Collect(), then 2 after a second."
  - q: "Why might a service that allocates many temporary 100 KB buffers see frequent gen 2 collections?"
    options:
      - "100 KB buffers are allocated in gen 1"
      - "They go on the large object heap, whose allocation budget triggers gen 2 collections, the most expensive kind"
      - "Byte arrays are never collected"
    answer: 1
    explain: "Anything of 85,000 bytes or more is a large object, collected only with gen 2. Pool and reuse big buffers, for example with ArrayPool<byte>.Shared."
  - q: "Which statement about server GC is true?"
    options:
      - "It is on by default for every .NET app"
      - "It uses a heap and a dedicated GC thread per logical CPU, trading memory for throughput"
      - "It never pauses application threads"
    answer: 1
    explain: "Server GC collects in parallel on several threads. It is the default for ASP.NET Core apps; console apps get workstation GC unless you set ServerGarbageCollection. Both kinds still pause threads, though background GC shortens gen 2 pauses."
links:
  - { title: "Fundamentals of garbage collection (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals" }
  - { title: "The large object heap (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap" }
  - { title: "Workstation and server garbage collection (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/workstation-server-gc" }
  - { title: "Garbage collector config settings, including DATAS (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/runtime-config/garbage-collector" }
---
The .NET garbage collector is generational and, for the small object heap, compacting. Allocation is cheap: the runtime bumps a pointer in a per-thread allocation context. The cost comes later, when a collection has to find which objects are still reachable from roots (locals, statics, CPU registers, GC handles) and move the survivors together. The design bets that most objects die young, so it collects young objects often and old ones rarely.

## Generations

```csharp
using System.Runtime;
var small = new object();
Console.WriteLine($"new small object: gen {GC.GetGeneration(small)}");
GC.Collect();
Console.WriteLine($"after one GC: gen {GC.GetGeneration(small)}");
GC.Collect();
Console.WriteLine($"after two GCs: gen {GC.GetGeneration(small)}");
var big = new byte[85_000];
var almost = new byte[84_000];
Console.WriteLine($"byte[85000]: gen {GC.GetGeneration(big)}, byte[84000]: gen {GC.GetGeneration(almost)}");
Console.WriteLine($"server GC: {GCSettings.IsServerGC}");
```

On .NET 10 this printed gen 0, gen 1, gen 2, then `byte[85000]: gen 2, byte[84000]: gen 0` and `server GC: False`.

- **Gen 0** holds new objects. When its budget is used up, a gen 0 collection runs: usually a short pause, because few objects are alive.
- **Gen 1** holds objects that survived one collection; it is a buffer between short-lived and long-lived data.
- **Gen 2** holds long-lived objects: caches, singletons, anything that has survived. A gen 2 collection examines the whole heap, so it is the expensive one. Background GC lets most of a gen 2 collection run while your threads keep working.

Collecting a generation also collects every younger one. The classic leak in a managed language is not unreachable memory but memory that stays reachable: a static dictionary that only grows, an event handler that is never unsubscribed, a cache with no expiry.

## The large object heap

An allocation of 85,000 bytes or more goes to the large object heap (LOH), which is logically part of gen 2. Copying large objects is expensive, so the LOH is swept into a free list rather than compacted (you can request compaction through `GCSettings.LargeObjectHeapCompactionMode`). Every large allocation also has to be zeroed. Allocating many short-lived large arrays therefore triggers gen 2 collections and fragments memory. Rent buffers from `ArrayPool<T>.Shared` instead.

## Workstation, server and DATAS

**Workstation GC** uses one heap and collects on the thread that triggered it. It is the default for console and desktop apps. **Server GC** creates a heap and a dedicated GC thread per logical CPU and collects them in parallel, giving higher throughput at the cost of more memory. Projects using the Web SDK set `ServerGarbageCollection` to true, so ASP.NET Core apps get it by default; a web file-based app printed `server GC True` in the same container.

Server GC used to grow large heaps on big machines even when the app was small. Since .NET 9, **DATAS** (dynamic adaptation to application sizes) is on by default with server GC: it starts with one heap and adds heaps as the workload needs them, so the heap size tracks the live data. For containers, the GC treats the container's memory limit as the machine's memory and by default caps the heap at 75% of it.

Before changing any setting, look at the numbers: `dotnet-counters monitor` shows allocation rate, collection counts per generation and time in GC for a running process.
