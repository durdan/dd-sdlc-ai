---
id: python
title: "Python: how it really runs"
promise: What CPython does with your code, from bytecode and reference counts to the GIL, generators and the event loop, so its surprises stop being surprising.
kind: skill
level: intermediate
tags: [languages, backend]
stages:
  - title: Objects and execution
    blurb: Bytecode, names, dunder methods
    topics: [py-bytecode, py-objects, py-data-model]
  - title: Functions and control flow
    blurb: Closures, generators, exceptions
    topics: [py-closures, py-iterators, py-exceptions]
  - title: Memory and modules
    blurb: Reference counts, imports, venvs
    topics: [py-memory, py-imports]
  - title: Concurrency
    blurb: The GIL, threads, asyncio
    topics: [py-gil, py-asyncio]
  - title: Types and speed
    blurb: Hints, profiling, C extensions
    topics: [py-typing, py-performance]
bridges:
  - id: timeout
    why: "asyncio.timeout around every await is the same rule as a timeout on every call between services: never wait forever."
  - id: backpressure
    why: "An asyncio.Queue with a maxsize is backpressure in miniature: producers wait when consumers fall behind."
  - id: bulkhead
    why: "Separate executors (thread pools, process pools) per kind of work keep one slow dependency from starving the rest."
next: [scaling-out]
---
Everything here is about CPython, the reference interpreter from python.org, on Python 3.12 and 3.13. Where 3.14 changed something (free-threading's status, lazy annotations, the garbage collector) the topic says so, and where a behaviour belongs to CPython rather than the language, the topic says that too.
