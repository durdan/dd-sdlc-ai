---
id: cs-fundamentals
title: "Computer science fundamentals for working engineers"
promise: "The parts of a CS degree that keep turning up in production: how a CPU and its caches really run your code, how numbers and text are stored, what the OS and the network do for you, why concurrency is hard, and the limits no clever code gets past."
kind: skill
level: beginner
tags: [cs]
stages:
  - title: Inside the machine
    blurb: The CPU and the memory hierarchy
    topics: [csf-cpu, csf-memory-hierarchy]
  - title: How data is stored
    blurb: Integers, floats, text
    topics: [csf-integers, csf-floating-point, csf-text-encoding]
  - title: Running programs
    blurb: Compilers, the OS, concurrency
    topics: [csf-compilers, csf-os, csf-concurrency]
  - title: Between machines
    blurb: TCP, UDP and a page load
    topics: [csf-networking, csf-url]
  - title: Limits and everyday tools
    blurb: Complexity, hashing, time
    topics: [csf-complexity, csf-hashing, csf-time]
bridges:
  - id: consistent-hashing
    why: "hash(key) % N spreads keys evenly over N servers until N changes. Consistent hashing keeps most keys where they were when a server joins or leaves."
  - id: distributed-locks
    why: "A mutex works inside one machine because both threads share memory and a clock. Across machines you have neither, so locks need leases and fencing tokens."
  - id: backpressure
    why: "TCP's flow control stops a fast sender from overrunning a slow receiver. The backpressure pattern does the same between services."
  - id: write-ahead-log
    why: "Databases checksum every log record so a torn or corrupted write is detected on recovery, the checksum idea from the hashing topic at work."
next: [dsa, linux]
---
Examples are plain JavaScript you can run on each page; they were checked with Node 22.19 on a Mac. Timing results depend on your machine and will differ from the ones quoted, so read them as ratios, not absolute numbers. The concurrency topic steps through a race condition line by line. Where the Linux path covers something in depth (processes, virtual memory, sockets), the topic points to it.
