---
id: javascript
title: "JavaScript: how it really runs"
promise: What the engine actually does with your code, from the call stack to the event loop, one picture at a time.
kind: skill
level: intermediate
stages:
  - title: Foundations
    blurb: How one piece of code runs
    topics: [call-stack, closures, this, prototypes]
  - title: Async
    blurb: Waiting without blocking
    topics: [event-loop, promises, async-await, microtasks]
  - title: Under the hood
    blurb: Engines, memory and Node
    topics: [memory, v8, modules, node-loop]
bridges:
  - id: backpressure
    why: "Queues that fill faster than they drain: the event loop's problem, at system scale."
  - id: timeout
    why: A promise that never settles is a request that never ends. Put a limit on waiting.
  - id: pub-sub
    why: Event listeners and emitters, scaled out to many services.
next: [node]
---
