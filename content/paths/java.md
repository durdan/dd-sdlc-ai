---
id: java
title: "Java: how the JVM runs your code"
promise: "What happens after javac: bytecode, class loading, the JIT, the heap and its collectors, and how threads (platform and virtual) see each other's writes."
kind: skill
level: intermediate
stages:
  - title: From source to running code
    blurb: Bytecode, loading, the JIT
    topics: [java-bytecode, java-classloading, java-jit, java-exceptions]
  - title: Objects and types
    blurb: Heap, collectors, generics, collections
    topics: [java-memory, java-gc, java-generics, java-collections, java-modern]
  - title: Many things at once
    blurb: Memory model to virtual threads
    topics: [java-jmm, java-concurrent, java-virtual-threads]
bridges:
  - id: bulkhead
    why: "One shared thread pool for every kind of work is a single point of exhaustion. Give each dependency its own executor."
  - id: backpressure
    why: "A ThreadPoolExecutor's queue is a buffer. Bound it and choose a rejection policy, or a slow dependency fills your heap."
  - id: timeout
    why: "CompletableFuture.orTimeout and a deadline on every blocking call: the same idea, between services."
next: [spring-boot]
---
Everything here is about Java 21, the current long-term-support release. Where a behaviour belongs to HotSpot (the JVM in OpenJDK and Oracle's JDK) rather than to the Java Language Specification or the JVM Specification, the topic says so.
