---
id: dotnet
title: "C# and .NET: how the runtime runs your code"
promise: "What happens after you press build: IL, the JIT and its tiers, value and reference types, the garbage collector, Span, the async state machine, and how the generic host, ASP.NET Core and EF Core put it to work in a service."
kind: skill
level: intermediate
tags: [languages, backend]
stages:
  - title: From source to machine code
    blurb: IL, assemblies, the JIT
    topics: [dotnet-il, dotnet-jit]
  - title: Types and memory
    blurb: Structs, the GC, Span, generics
    topics: [dotnet-types, dotnet-gc, dotnet-span, dotnet-generics]
  - title: The modern language
    blurb: Nullability, records, LINQ
    topics: [dotnet-nullable, dotnet-records, dotnet-linq]
  - title: Asynchronous code
    blurb: Tasks, state machines, contexts
    topics: [dotnet-async, dotnet-async-context]
  - title: Building a service
    blurb: The host, the pipeline, the database
    topics: [dotnet-di, dotnet-aspnetcore, dotnet-efcore]
bridges:
  - id: timeout
    why: "Every async API in .NET takes a CancellationToken. Passing one with a deadline down through HttpClient and EF Core calls is the timeout pattern, applied inside one process."
  - id: retry
    why: "HttpClient calls are where transient failures show up. Retries with backoff and jitter belong in the HTTP pipeline, and only for requests that are safe to repeat."
  - id: backpressure
    why: "A bounded System.Threading.Channels channel makes a fast producer wait for a slow consumer, which is backpressure between two parts of the same service."
  - id: cursor-pagination
    why: "Skip and Take in EF Core become OFFSET and LIMIT, which get slower the deeper you page. Keyset pagination with a Where on the last seen key does not."
next: [resilience-101, scaling-out]
---
Everything here is about .NET 10, the current long-term-support release (November 2025), and C# 14. Nearly all of it also holds for .NET 8 and 9; where a behaviour changed recently, the topic says which version. The examples were run as file-based apps (`dotnet run file.cs`) with SDK 10.0.402 and runtime 10.0.13 in the `mcr.microsoft.com/dotnet/sdk:10.0` container on Linux x64. Byte counts and thread ids can differ on your machine.
