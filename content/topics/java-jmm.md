---
id: java-jmm
title: Threads and the Java Memory Model
summary: When one thread is guaranteed to see another's writes
why: "Without a happens-before edge, a write in one thread may never be seen by another. The bug won't show in tests and then hangs in production."
requires: [java-memory]
lesson: none
points:
  - title: No guarantee by default
    text: Compilers and CPUs reorder and cache. Without synchronisation, another thread may see a write late, out of order, or never.
  - title: Happens-before is the contract
    text: If one action happens-before another, its effects are visible to it. Unlocking, volatile writes, Thread.start and join create those edges.
  - title: volatile is visibility, not atomicity
    text: A volatile field is always read fresh and orders the writes around it, but count++ on it can still lose updates.
  - title: synchronized does both
    text: A monitor gives mutual exclusion and makes everything written before the unlock visible to the next thread that locks it.
quiz:
  - q: "Without volatile on running, what may happen when main sets running = false?"
    code: |
      static boolean running = true;
      // worker thread:
      while (running) { spins++; }
      // main thread, later:
      running = false;
    options:
      - The worker always stops within a millisecond
      - The worker may never stop, because nothing makes the write visible to it
      - It doesn't compile
    answer: 1
    explain: "There is no happens-before edge between the write and the reads, so the JIT may read the field once and loop forever. On HotSpot 21 this example really does hang. Making the field volatile fixes it."
  - q: Two threads each run count++ 1,000 times on a volatile int count. What can the final value be?
    options:
      - Always 2000
      - "Anything up to 2000, because ++ is a read, an add and a write that can interleave"
      - Always 1000
    answer: 1
    explain: "volatile makes each read and write visible but doesn't make the read-modify-write atomic. Use AtomicInteger.incrementAndGet, a LongAdder, or a lock."
  - q: Which of these does not create a happens-before edge between two threads?
    options:
      - Thread A unlocks a monitor that thread B then locks
      - Thread A writes an ordinary field, then thread B reads it a second later
      - Thread A calls start() on thread B
    answer: 1
    explain: "Time is not a happens-before rule. Without a lock, a volatile, start/join or a java.util.concurrent hand-off, the read is a data race and may see an old value."
links:
  - title: "JLS chapter 17: threads and locks (the memory model)"
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html
  - title: "java.util.concurrent: memory consistency properties"
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html
  - title: "Concurrency (The Java Tutorials)"
    url: https://docs.oracle.com/javase/tutorial/essential/concurrency/
---
When several threads share the heap, the question is not only who runs when, but what each thread can see. The Java Memory Model, chapter 17 of the JLS, answers it. It lets compilers and CPUs reorder and cache memory operations freely, and in return gives you a precise rule, happens-before, that says when a write in one thread must be visible to a read in another. If your program has no data races under that rule, it behaves as if everything ran in some simple interleaved order.

## Why visibility isn't automatic

```java
public class StopFlag {
    private static volatile boolean running = true;   // try removing volatile

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long spins = 0;
            while (running) spins++;
            System.out.println("worker saw the change");
        });
        worker.start();
        Thread.sleep(100);
        running = false;    // volatile write: visible to the worker's next read
        worker.join();
    }
}
```

With `volatile` this stops at once. Without it, on HotSpot 21 it typically runs forever: once the loop is compiled, the JIT sees no reason to read `running` again and hoists the read out of the loop. That transformation is legal, because nothing told it another thread was involved. Other JVMs or CPUs may fail differently, or not at all, which is what makes these bugs so hard to find in testing.

## Happens-before

The JLS defines a partial order. The edges you use every day:

- **Program order**: within one thread, each action happens-before the next one.
- **Monitors**: unlocking a monitor happens-before every later lock of the same monitor.
- **volatile**: a write to a volatile field happens-before every later read of it.
- **Threads**: `t.start()` happens-before anything `t` does; everything `t` does happens-before another thread returns from `t.join()`.
- **Transitivity**: if A happens-before B and B happens-before C, then A happens-before C.

Transitivity is what makes it useful. Fill in an object with ordinary writes, then publish it through a volatile field or under a lock, and a thread that reads that field sees the whole object. The classes in `java.util.concurrent` document their own edges: putting an item into a `BlockingQueue` happens-before taking it out, and completing a `Future` happens-before `get()` returns.

A data race is two accesses to the same variable from different threads, at least one a write, with no happens-before order between them. A program with races gets very weak guarantees; for example, a plain `long` or `double` write may even be split into two 32-bit halves.

## volatile, synchronized, atomics

- **volatile** gives visibility and ordering for one field. It doesn't make compound actions atomic: `count++` is a read, an add and a write.
- **synchronized** gives mutual exclusion and visibility. Monitors are reentrant, so a thread can lock what it already holds.
- **Atomics** (`AtomicInteger`, `AtomicReference`, `LongAdder`) give lock-free atomic updates with volatile-like visibility:

```java
private final AtomicLong hits = new AtomicLong();
void record() { hits.incrementAndGet(); }        // atomic and visible

private final Object lock = new Object();
private final Map<String, Integer> totals = new HashMap<>();
void add(String key, int n) {
    synchronized (lock) { totals.merge(key, n, Integer::sum); }   // several steps, one at a time
}
```

## final fields

Fields marked `final` get a special guarantee: once the constructor finishes, any thread that obtains a reference to the object sees their values set by the constructor, even if the reference was shared through a race. Immutable objects built on `final` fields (records, for example) are safe to share. The guarantee only holds if the constructor doesn't leak `this` before it finishes.
