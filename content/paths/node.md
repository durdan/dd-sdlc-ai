---
id: node
title: "Node.js: how the server side runs"
promise: "What happens between your JavaScript and the operating system: the loop's phases, its private queues, the thread pool, streams, and threads of your own."
kind: skill
level: intermediate
tags: [backend, languages]
stages:
  - title: From JavaScript
    blurb: Rules shared with browsers
    topics: [event-loop, microtasks, modules]
  - title: Node's loop
    blurb: Phases, queues, the pool
    topics: [node-loop, node-nexttick, node-thread-pool]
  - title: Doing more at once
    blurb: Streams and more cores
    topics: [node-streams, node-workers]
bridges:
  - id: backpressure
    why: "Streams' highWaterMark and 'drain', between services: bound every buffer, let the slow side set the pace."
  - id: bulkhead
    why: The thread pool is one shared resource. Bulkheads give each kind of work its own.
  - id: competing-consumers
    why: Workers taking jobs from one queue, across machines instead of threads.
next: [scaling-out, event-driven]
---
Topics shared with the JavaScript path keep the same progress on both maps.
