---
id: java-concurrent
title: "java.util.concurrent: executors and CompletableFuture"
summary: Hand tasks to pools, compose the results
why: "Unbounded queues, pools shared by unrelated work and futures nobody times out are behind many Java outages. The API has an answer for each."
requires: [java-jmm]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Submit tasks, not threads
    text: An ExecutorService owns a set of threads and a queue; you hand it Runnables or Callables and get Futures back.
  - title: Bound the queue
    text: Executors.newFixedThreadPool queues without limit. Under overload that becomes a memory problem, so size the queue and pick a rejection policy.
  - title: Compose, don't block
    text: CompletableFuture chains steps with thenApply, thenCompose and thenCombine, and handles failure with exceptionally or handle.
  - title: Choose the executor
    text: Async methods without an executor run on the shared ForkJoinPool.commonPool(). Give blocking work its own executor.
quiz:
  - q: What is the risk with Executors.newFixedThreadPool(8) in a busy service?
    options:
      - It creates a new thread for every task
      - Its work queue is unbounded, so under overload tasks pile up in memory and wait ever longer
      - It can only run 8 tasks in total
    answer: 1
    explain: "The Javadoc says it operates off a shared unbounded queue. Build a ThreadPoolExecutor with a bounded queue and a rejection policy (for example CallerRunsPolicy) when the input can outpace the pool."
  - q: Which executor runs CompletableFuture.supplyAsync(task) when you don't pass one?
    options:
      - A new thread for each call, always
      - "ForkJoinPool.commonPool(), unless its parallelism is below two"
      - The calling thread
    answer: 1
    explain: "The common pool is shared by the whole JVM, including parallel streams. Blocking I/O there can starve everything else, so pass your own executor for blocking tasks."
  - q: "You have a CompletableFuture<User> and a method loadOrders(User) that returns a CompletableFuture<List<Order>>. Which call gives a CompletableFuture<List<Order>>?"
    options:
      - thenApply(this::loadOrders)
      - thenCompose(this::loadOrders)
      - thenAccept(this::loadOrders)
    answer: 1
    explain: "thenCompose flattens a step that itself returns a future, like flatMap. thenApply would give a CompletableFuture<CompletableFuture<List<Order>>>."
links:
  - title: "java.util.concurrent package summary (Java SE 21)"
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html
  - title: ExecutorService (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html
  - title: Executors (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html
  - title: CompletableFuture (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html
---
Creating a thread for every piece of work is expensive and unbounded, so since Java 5 the standard answer has been `java.util.concurrent`. You submit tasks to an `ExecutorService`, which runs them on a pool of threads it manages, and you get a `Future` for the result. `CompletableFuture`, added in Java 8, goes further: instead of blocking on a result, you describe what should happen when it arrives. Everything in the package also documents its happens-before guarantees, so a result handed over through it is safely visible.

## Executors

An executor is a set of worker threads plus a queue. The `Executors` factory methods cover common shapes, but read what they do:

- `newFixedThreadPool(n)`: `n` threads and an **unbounded** queue. Under overload, tasks pile up in memory and latency grows without limit.
- `newCachedThreadPool()`: reuses idle threads but creates new ones without limit. A burst can mean thousands of threads.
- `newVirtualThreadPerTaskExecutor()`: a virtual thread per task (Java 21, next topic).

For services, build the pool you mean:

```java
ExecutorService pool = new ThreadPoolExecutor(
    8, 8,                                        // core and maximum threads
    0, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(500),               // bounded queue
    new ThreadPoolExecutor.CallerRunsPolicy());  // when full, the submitter runs the task
```

When the queue is full the policy decides: throw `RejectedExecutionException` (the default), run the task on the caller's thread (which slows the producer down), or discard. Since Java 19 an `ExecutorService` is `AutoCloseable`: `close()` stops accepting tasks and waits for the submitted ones, so try-with-resources scopes a pool neatly.

## CompletableFuture

```java
import java.util.concurrent.*;

public class Prices {
    static int price(String shop) {
        sleep(100);                       // stands in for a slow remote call
        return shop.length() * 10;
    }

    public static void main(String[] args) {
        try (ExecutorService pool = Executors.newFixedThreadPool(4)) {
            CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> price("north"), pool);
            CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> price("south-east"), pool);

            int best = a.thenCombine(b, Math::min)       // both run at once; combine when both finish
                        .orTimeout(2, TimeUnit.SECONDS)  // fail if it takes too long
                        .exceptionally(e -> -1)          // fallback on any failure
                        .join();
            System.out.println("best price: " + best);   // best price: 50
        }
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { throw new RuntimeException(e); }
    }
}
```

The main combinators:

- `thenApply(f)`: transform the value (like `map`).
- `thenCompose(f)`: chain a step that returns another future (like `flatMap`).
- `thenCombine(other, f)`: wait for two independent futures; `allOf` and `anyOf` for many.
- `exceptionally`, `handle`, `whenComplete`: deal with failure. An exception in any step skips the following value steps and arrives wrapped in a `CompletionException`.
- `orTimeout` and `completeOnTimeout` (Java 9): put a deadline on the whole chain.

Methods ending in `Async` without an executor argument run on `ForkJoinPool.commonPool()`, which the whole JVM shares, parallel streams included. It is sized for CPU work, roughly one thread per core, so blocking calls there starve everything else. Pass your own executor for anything that waits on I/O.

## Other tools in the box

`ConcurrentHashMap` for shared maps, `BlockingQueue` for producer and consumer hand-offs, `CountDownLatch` and `Semaphore` for coordination, `ReentrantLock` when you need timeouts or try-lock that `synchronized` lacks. Prefer them to hand-written `wait` and `notify`.

```trace diagram
id: two-prices
title: Two tasks, one pool, one answer
subtitle: supplyAsync twice, thenCombine, join
groups:
  - { id: pool, label: "ThreadPoolExecutor (2 workers, bounded queue)" }
  - { id: futures, label: CompletableFutures }
elements:
  - { id: main, label: main thread, sub: "supplyAsync(..., pool) twice", kind: person }
  - { id: queue, label: Work queue, sub: "ArrayBlockingQueue(500)", group: pool, tone: stream }
  - { id: w1, label: Worker 1, sub: "price(\"north\")", group: pool }
  - { id: w2, label: Worker 2, sub: "price(\"south-east\")", group: pool }
  - { id: policy, label: Rejection policy, sub: when the queue is full, group: pool, kind: external }
  - { id: fa, label: Future a, group: futures, tone: data }
  - { id: fb, label: Future b, group: futures, tone: data }
  - { id: combined, label: thenCombine(min), sub: "orTimeout(2 s), exceptionally(-1)", group: futures, tone: data }
  - { id: result, label: "join(): 50", sub: back on the main thread, kind: person }
edges:
  - { id: submit, from: main, to: queue, label: submit }
  - { id: take1, from: queue, to: w1 }
  - { id: take2, from: queue, to: w2 }
  - { id: full, from: queue, to: policy, label: queue full, style: dashed }
  - { id: done1, from: w1, to: fa, label: complete(50) }
  - { id: done2, from: w2, to: fb, label: complete(100) }
  - { id: depa, from: fa, to: combined }
  - { id: depb, from: fb, to: combined }
  - { id: join, from: combined, to: result, label: join() }
steps:
  - caption: "An executor is a few worker threads plus a queue. You hand it tasks instead of creating threads, and it decides which thread runs what."
    focus: [pool]
  - caption: "main calls supplyAsync twice with the pool. Each call hands the task to the executor and returns a CompletableFuture at once, not yet complete. main is not blocked."
    focus: [main, queue, fa, fb]
    trace: [submit]
  - caption: "While fewer than the core number of threads are running, the pool starts a new worker for each task. Once they all exist, new tasks wait in the queue for a worker to take them."
    focus: [queue, w1, w2]
    trace: [take1, take2]
  - caption: "Meanwhile main has already described what should happen next: take the smaller of the two prices, fail after 2 seconds, and fall back to -1 on any error. Nothing runs yet."
    focus: [main, combined]
  - caption: "Worker 1 finishes and completes future a with 50. The combined stage needs both results, so it keeps waiting."
    focus: [w1, fa, combined]
    trace: [done1]
  - caption: "Worker 2 completes future b with 100. Now Math.min runs, usually on the thread that completed the last input, here Worker 2."
    focus: [w2, fb, combined]
    trace: [done2, depa, depb]
  - caption: "If either task had thrown, or 2 seconds had passed, the value steps would be skipped and exceptionally would turn the failure into -1."
    focus: [combined]
  - caption: "join returns 50 on the main thread. Closing the pool at the end of try-with-resources stops new submissions and waits for the tasks already given."
    focus: [combined, result]
    trace: [join]
  - caption: "Under overload a bounded queue fills up. Then the rejection policy decides: the default throws RejectedExecutionException, and CallerRunsPolicy runs the task on the submitting thread, which slows the producer down."
    focus: [queue, policy, main]
    trace: [full]
note: "Executors.newFixedThreadPool uses an unbounded queue, so it never rejects; under overload tasks pile up in memory instead."
```
