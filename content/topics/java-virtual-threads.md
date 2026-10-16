---
id: java-virtual-threads
title: Virtual threads (Java 21)
summary: A million blocking threads, on a handful of OS threads
why: "Thread-per-request code, simple to write and debug, now scales to as many concurrent requests as reactive code, without callbacks."
requires: [java-concurrent]
lesson: none
points:
  - title: Threads the JDK schedules
    text: A virtual thread is a java.lang.Thread that runs on a small pool of OS carrier threads and is not tied to any one of them.
  - title: Blocking is cheap
    text: When a virtual thread blocks on I/O, a sleep or a lock, the JDK unmounts it and its carrier runs another one.
  - title: One per task, never pooled
    text: They cost about as much as an object, so create one for every task and limit access to scarce resources with a semaphore.
  - title: Watch for pinning
    text: In Java 21, blocking inside a synchronized block or a native call keeps the carrier busy. Java 24 removed the synchronized case.
quiz:
  - q: What do virtual threads mostly improve?
    options:
      - The speed of CPU-heavy calculations
      - Throughput for many concurrent tasks that spend most of their time waiting
      - Start-up time
    answer: 1
    explain: "A virtual thread runs code no faster than a platform thread. The gain is scale: tens of thousands of blocked tasks no longer need tens of thousands of OS threads."
  - q: You want at most 20 concurrent calls to a fragile API from virtual threads. What should you use?
    options:
      - A fixed pool of 20 virtual threads
      - A Semaphore with 20 permits around the call
      - "Thread.setPriority to slow them down"
    answer: 1
    explain: "JEP 444 says not to pool virtual threads. Create one per task and guard the scarce resource with a construct designed for limiting concurrency, such as a Semaphore."
  - q: "On Java 21, a virtual thread does blocking I/O inside a synchronized block. What happens?"
    options:
      - It throws an exception
      - "It is pinned: its carrier thread stays blocked too, which can hurt scalability"
      - The JVM silently replaces synchronized with a ReentrantLock
    answer: 1
    explain: "The program stays correct, but the carrier can't run other virtual threads meanwhile. On 21, prefer ReentrantLock around blocking calls in hot paths; JEP 491 removed this limitation in Java 24."
links:
  - title: "JEP 444: virtual threads"
    url: https://openjdk.org/jeps/444
  - title: Virtual threads (JDK 21 core libraries guide)
    url: https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html
  - title: Virtual threads (dev.java)
    url: https://dev.java/learn/api/virtual-threads/
  - title: "JEP 491: synchronize virtual threads without pinning"
    url: https://openjdk.org/jeps/491
---
A platform thread, the only kind before Java 21, is a thin wrapper around an operating system thread: each one reserves a large stack and costs a kernel context switch to schedule, so a server can afford a few thousand. A virtual thread (JEP 444, final in Java 21) is also a `java.lang.Thread`, but the JDK schedules it, not the OS. It runs on a small pool of platform "carrier" threads, and when it blocks, the JDK parks it and lets its carrier run another one. You can have millions.

## Writing blocking code that scales

```java
import java.time.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class Many {
    public static void main(String[] args) {
        Instant start = Instant.now();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, 10_000).forEach(i ->
                executor.submit(() -> {
                    Thread.sleep(Duration.ofSeconds(1));   // parks the virtual thread, frees the carrier
                    return i;
                }));
        }   // close() waits for every task
        System.out.println("10,000 tasks in " + Duration.between(start, Instant.now()).toMillis() + " ms");
    }
}
```

Ten thousand tasks that each sleep for a second finish in about one second. With a pool of 200 platform threads they would take 50 seconds; with 10,000 platform threads you would spend gigabytes of stack reservations. You can also start one directly with `Thread.ofVirtual().start(runnable)` or `Thread.startVirtualThread(runnable)`.

## How it works

The scheduler is a work-stealing `ForkJoinPool` with, by default, as many carriers as there are processors. A virtual thread runs by being mounted on a carrier. When it calls a blocking operation that the JDK has adapted, such as socket and file I/O, `Thread.sleep`, `BlockingQueue.take` or `ReentrantLock.lock`, the JDK saves its stack frames to the heap (as stack chunk objects the GC manages) and unmounts it. When the operation can continue, the thread is mounted again, possibly on a different carrier. Your code sees an ordinary blocking call, with an ordinary stack trace in the debugger.

That is why the gain is throughput, not speed. A CPU-bound task on a virtual thread takes as long as on a platform thread. The win comes when most tasks spend most of their time waiting.

## Rules of thumb

- **Don't pool them.** A pool exists to share something expensive, and virtual threads aren't. Use one per task.
- **Limit resources, not threads.** A database with 50 connections still allows 50. Guard scarce resources with a `Semaphore` or the connection pool itself.
- **Go easy on ThreadLocal.** It works, but a million threads each caching a big object is a million big objects. Java 21 previews scoped values (JEP 446) as an alternative.
- **Avoid pinning in hot paths.** In Java 21 a virtual thread that blocks inside `synchronized`, or in a native method, is pinned: its carrier blocks with it. That is correct but can starve the scheduler. Run with `-Djdk.tracePinnedThreads=full` or watch the JFR `jdk.VirtualThreadPinned` event, and swap `synchronized` for a `ReentrantLock` where blocking happens inside. JEP 491 removed the `synchronized` case in Java 24.

Virtual threads are always daemon threads and ignore priorities. Java 21 also previews structured concurrency (JEP 453), which treats a group of virtual threads started for one request as a single unit of work.
