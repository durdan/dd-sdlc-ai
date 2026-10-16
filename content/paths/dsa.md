---
id: dsa
title: "Data structures and algorithms: the ones you actually use"
promise: The structures behind every Map, list, index and queue you rely on, what they really cost on real hardware, and how to tell which one a problem needs.
kind: skill
level: intermediate
tags: [cs]
stages:
  - title: Cost and memory
    blurb: Big-O, arrays, amortised growth
    topics: [dsa-big-o, dsa-arrays]
  - title: Sequences
    blurb: Lists, stacks, queues, recursion
    topics: [dsa-linked-lists, dsa-stacks-queues, dsa-recursion]
  - title: Finding things
    blurb: Hashing, halving, trees
    topics: [dsa-hash-tables, dsa-binary-search, dsa-trees]
  - title: Putting things in order
    blurb: Heaps and real-world sorts
    topics: [dsa-heaps, dsa-sorting]
  - title: Searching and reusing work
    blurb: Graphs and dynamic programming
    topics: [dsa-graphs, dsa-dynamic-programming]
  - title: Structures in production
    blurb: Tries and Bloom filters
    topics: [dsa-tries-bloom]
bridges:
  - id: bloom-filter
    why: "The Bloom filter topic, at system scale: skipping disk reads and remote lookups for keys that can't be there."
  - id: consistent-hashing
    why: "hash(key) % N works for one table, but changing N moves almost every key. Consistent hashing is how distributed caches and databases avoid that."
  - id: geospatial-index
    why: "Sorted trees answer range queries on one key. A geospatial index files points by map cell, so \"what is near me?\" is a few lookups instead of a scan."
  - id: cache-aside
    why: "Memoisation for a whole service: look in the cache, compute (or query) on a miss, and store the answer."
next: [inside-db, fast-reads]
---
Examples are plain JavaScript you can run on each page, and three topics step through their algorithm line by line: matching brackets with a stack, pushing into a heap, and the queue behind breadth-first search. Where a language's standard library makes a specific choice (Python's dict, Java's HashMap, V8's sort), the topic names it and links the documentation.
