---
id: java-gc
title: "Garbage collection: generations, G1 and ZGC"
summary: Most objects die young, so collect the young often
why: "Pause times, heap size and CPU spent collecting are trade-offs you choose with one flag. Choosing well starts with knowing what each collector does."
requires: [java-memory]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Reachable means alive
    text: The collector starts from roots (thread stacks, static fields) and keeps everything it can reach. The rest is garbage, however it got there.
  - title: Generations
    text: Most objects die young, so new objects go into a young generation that is collected often and cheaply; survivors are promoted to the old generation.
  - title: G1 is the default
    text: G1 splits the heap into regions and aims for a pause-time goal (200 ms by default), collecting the regions with the most garbage first.
  - title: ZGC for low latency
    text: ZGC does nearly all its work while your threads run, with pauses typically under a millisecond whatever the heap size.
quiz:
  - q: Why does a young-generation collection usually take little time?
    options:
      - It skips objects that are referenced from the stack
      - Its cost depends on the live objects it copies, and most young objects are already dead
      - It runs only when the program is idle
    answer: 1
    explain: A copying young collection only touches survivors. When almost everything allocated since the last collection is already unreachable, there is very little to copy.
  - q: Which garbage collector does the Java Language Specification require?
    options:
      - G1
      - None; it requires automatic memory management but no particular algorithm
      - ZGC since Java 21
    answer: 1
    explain: "The specifications only say that the heap is reclaimed automatically. G1 is HotSpot's default; Serial, Parallel and ZGC are alternatives you select with -XX:+Use...GC."
  - q: In Java 21, which flags give you generational ZGC?
    options:
      - "-XX:+UseZGC"
      - "-XX:+UseZGC -XX:+ZGenerational"
      - "-XX:+UseG1GC -XX:+ZGenerational"
    answer: 1
    explain: "JEP 439 added generational ZGC in Java 21 behind -XX:+ZGenerational. It became the default ZGC mode in Java 23, and the only one in Java 24."
links:
  - title: HotSpot garbage collection tuning guide (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/gctuning/introduction-garbage-collection-tuning.html
  - title: The Garbage-First (G1) garbage collector (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html
  - title: The Z garbage collector (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/gctuning/z-garbage-collector2.html
  - title: "JEP 439: generational ZGC"
    url: https://openjdk.org/jeps/439
---
The Java specifications promise only that unreachable objects are reclaimed automatically; they do not say how. HotSpot ships several collectors and picks G1 by default on most machines. All of them start from the same idea: an object is alive if it can be reached from a root, such as a local variable in some thread's stack frame or a static field, and everything else can be reclaimed. They differ in when they stop your threads and for how long.

## Generations

Most objects die young: the iterator in a loop, the `StringBuilder` behind a log message, the DTO for one request. HotSpot's collectors exploit this by splitting the heap:

- New objects are allocated in the **young generation** (its eden space).
- A **young (minor) collection** copies the few survivors out and treats the rest of eden as empty again. Its cost depends on how much is alive, not how much was allocated, which makes it cheap.
- Objects that survive several young collections are **promoted** to the **old generation**, which is collected less often.

To collect the young generation alone, the collector must know about references from old objects to young ones. The JIT emits a small write barrier on every reference store to track them.

## G1, the default

G1 (Garbage-First) divides the heap into equal regions, a power of two in size (a few megabytes for typical heaps), sized to give about 2048 of them. At any time a region is free, eden, survivor or old. Young collections are pauses that evacuate the live objects in eden and survivor regions into new ones. When the heap fills past a threshold, G1 marks live objects concurrently, while your threads run, and then does **mixed** collections that also evacuate the old regions with the most garbage: hence the name.

G1 sizes its work to meet a pause-time goal, `-XX:MaxGCPauseMillis`, 200 ms by default. It is a goal, not a guarantee. Objects of half a region or more are **humongous** and go straight into old regions, so many large short-lived arrays can make G1 work harder.

## ZGC, for low latency

ZGC does marking, relocation and reference fixing concurrently, using load barriers: a small check on every reference read that fixes up a pointer if the object has moved. Its pauses are typically well under a millisecond and do not grow with the heap, from a few hundred megabytes to many terabytes. The price is some throughput and memory headroom: your threads keep allocating while it works, so give it a larger `-Xmx`.

In Java 21, `-XX:+UseZGC` selects the original single-generation ZGC; add `-XX:+ZGenerational` for the generational version from JEP 439, which handles high allocation rates better. Later releases made generational the default (Java 23) and then the only mode (Java 24).

## The others, and what to measure

- **Serial**: one thread, stop-the-world. Fine for small heaps and single-core containers, where HotSpot may pick it automatically.
- **Parallel**: stop-the-world with many threads; the best throughput when pauses don't matter, as in batch jobs.

Turn on logging before tuning anything:

```sh
# HotSpot unified logging: one line per collection, with pause time and heap before and after
java -Xlog:gc -Xmx2g -jar app.jar

# or switch collector
java -XX:+UseZGC -XX:+ZGenerational -Xlog:gc -Xmx8g -jar app.jar
```

Look at pause times, how often collections happen, and how full the old generation stays after each one. An old generation that keeps growing after every collection is a leak, not a tuning problem: something reachable, such as a static map used as a cache, is holding on to objects.

```trace diagram
id: g1-cycle
title: A G1 heap over time
subtitle: Allocate, collect the young, promote, then reclaim old regions
groups:
  - { id: young, label: Young generation }
  - { id: old, label: Old generation }
elements:
  - { id: app, label: Your threads, sub: allocate new objects, kind: person }
  - { id: roots, label: GC roots, sub: "thread stacks, static fields", kind: external }
  - { id: eden, label: Eden regions, sub: new objects, group: young, tone: stream }
  - { id: survivor, label: Survivor regions, sub: survived a young GC, group: young, tone: stream }
  - { id: oldr, label: Old regions, sub: promoted objects, group: old, tone: data }
  - { id: humongous, label: Humongous regions, sub: "objects ≥ half a region", group: old, tone: data }
  - { id: marking, label: Concurrent marking, sub: while your threads run }
  - { id: free, label: Free regions, sub: ready for reuse, kind: store, tone: neutral }
edges:
  - { id: alloc, from: app, to: eden, label: new (TLAB bump) }
  - { id: big, from: app, to: humongous, label: huge array, style: dashed }
  - { id: trace, from: roots, to: eden, label: what is reachable?, style: dotted }
  - { id: evacuate, from: eden, to: survivor, label: copy live objects }
  - { id: promote, from: survivor, to: oldr, label: old enough }
  - { id: emptied, from: eden, to: free, style: dashed }
  - { id: mark, from: marking, to: oldr, label: find live objects, style: dotted }
  - { id: mixed, from: oldr, to: free, label: "mixed GC: most garbage first", style: dashed }
steps:
  - caption: "G1 splits the heap into equal regions, about 2048 of them, a few megabytes each for a typical heap. At any moment a region is free, eden, survivor or old."
    focus: [eden, survivor, oldr, free]
  - caption: "Your threads allocate new objects into eden regions, usually by bumping a pointer in a thread-local buffer. Most of these objects are dead within moments."
    focus: [app, eden]
    trace: [alloc]
  - caption: "When eden fills, G1 stops your threads for a young collection. It starts from the roots and follows references to find which young objects are still reachable."
    focus: [roots, eden, survivor]
    trace: [trace]
  - caption: "Old objects can point at young ones too, and those count as roots. A write barrier on every reference store, plus G1's remembered sets, records them so G1 doesn't have to scan the whole old generation."
    focus: [oldr, eden]
  - caption: "The few live objects are copied out into survivor regions. The cost depends on what survives, not on what was allocated, so this pause is usually short."
    focus: [eden, survivor]
    trace: [evacuate]
  - caption: "Everything left in the evacuated eden regions is garbage, so the whole region is simply free again. Nothing is swept object by object."
    focus: [eden, free]
    trace: [emptied]
  - caption: "Each young collection copies young objects into survivor or old regions depending on their age. An object that has survived enough of them is promoted to the old generation."
    focus: [survivor, oldr]
    trace: [promote]
  - caption: "An object of half a region or more skips all this. It is humongous and is placed straight into contiguous old regions, so many big short-lived arrays make G1 work harder."
    focus: [app, humongous]
    trace: [big]
  - caption: "When old-generation occupancy passes a threshold, G1 marks live objects concurrently, while your threads keep running, to learn how much garbage each old region holds."
    focus: [marking, oldr, humongous]
    trace: [mark]
  - caption: "Then come mixed collections: young regions plus the old regions with the most garbage, garbage first. Their live objects are copied to other regions, and the emptied ones join the free list."
    focus: [oldr, free, eden]
    trace: [mixed]
  - caption: "G1 picks how many regions to take in each pause so that it meets the pause-time goal, 200 ms by default. It is a goal, not a guarantee."
    focus: [young, old]
note: "Turn on -Xlog:gc before tuning. An old generation that keeps growing after every collection is a leak, not a tuning problem."
```
