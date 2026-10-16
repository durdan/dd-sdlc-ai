---
id: kotlin-structured-concurrency
title: "Structured concurrency, cancellation, dispatchers"
summary: "Scopes own coroutines; cancellation flows down, failure flows up"
why: "Coroutines are cheap to start and easy to leak. Scopes, Jobs and the cancellation rules are what make sure every coroutine ends, and that a failure isn't silently lost."
requires: [kotlin-suspend]
lesson: none
points:
  - { title: Every coroutine has a parent, text: "launch and async create a child Job of the scope they are called in; the parent finishes only when all children have." }
  - { title: Failure cancels the family, text: "By default a failing child cancels its parent and siblings; supervisorScope and SupervisorJob stop that spreading." }
  - { title: Cancellation is cooperative, text: "Cancelling sets a flag and makes suspending calls throw CancellationException; plain code must check isActive or call ensureActive()." }
  - { title: Dispatchers pick threads, text: "Default for CPU work, IO for blocking calls, Main for UI; withContext switches and comes back." }
quiz:
  - q: "Inside coroutineScope { }, two async calls run in parallel and the first throws. What happens to the second?"
    options:
      - "It finishes and its result is discarded"
      - "It is cancelled, and coroutineScope rethrows the first exception"
      - "Both results are returned, one as null"
    answer: 1
    explain: "A failing child cancels its parent scope, which cancels all other children. coroutineScope waits for them to finish cancelling, then throws the original exception."
  - q: "Why is catch (e: Exception) { } around a suspending call inside a loop a problem for cancellation?"
    options:
      - "It isn't"
      - "It also catches CancellationException, so the coroutine swallows its own cancellation and keeps looping"
      - "Exceptions can't be caught in coroutines"
    answer: 1
    explain: "Cancellation is delivered as a CancellationException. Catch specific exception types, or rethrow CancellationException, so the coroutine can actually stop."
  - q: "Where should a suspend function that reads a file with java.io switch threads?"
    options:
      - "In every caller"
      - "Inside the function itself, with withContext(Dispatchers.IO), so it is safe to call from any dispatcher"
      - "It doesn't need to, suspend functions never block"
    answer: 1
    explain: "The convention is that suspend functions don't block their caller's thread. The function that does the blocking call is the one that moves to IO."
links:
  - { title: "Cancellation and timeouts (kotlinlang.org)", url: "https://kotlinlang.org/docs/cancellation-and-timeouts.html" }
  - { title: "Coroutine context and dispatchers (kotlinlang.org)", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }
  - { title: "Coroutine exceptions handling (kotlinlang.org)", url: "https://kotlinlang.org/docs/exception-handling.html" }
---
A coroutine started with `launch` or `async` doesn't float free: it is a child of the `CoroutineScope` it was started in. **Structured concurrency** is the rule that ties the two together. The parent can't complete until its children have, cancelling the parent cancels the children, and an exception in a child is reported to the parent instead of disappearing. The Android path shows this with `viewModelScope`; this topic is about the rules themselves.

## Scopes and Jobs

Every coroutine has a `Job` in its context. Starting a coroutine inside a scope makes its Job a child of the scope's Job, so you get a tree. `coroutineScope { }` creates a scope inside a suspend function and suspends until every child is done:

```kotlin
import kotlinx.coroutines.*

suspend fun price(id: Int): Int { delay(100L * id); return id * 10 }

suspend fun total(ids: List<Int>): Int = coroutineScope {
    ids.map { id -> async { price(id) } }     // all run concurrently
        .awaitAll()
        .sum()
}

fun main() = runBlocking {
    println(total(listOf(1, 2, 3)))            // 60, after about 300 ms, not 600
    val failing = runCatching {
        coroutineScope {
            launch { delay(1_000); println("never printed") }
            launch { delay(50); error("boom") }
        }
    }
    println(failing.exceptionOrNull()?.message)  // boom: the slow sibling was cancelled
}
```

By default a child that fails with an exception cancels its parent, which cancels all the other children; then the exception surfaces from `coroutineScope` (or reaches the scope's `CoroutineExceptionHandler`, for a top-level `launch`). Where siblings should be independent, use `supervisorScope { }` or a scope built with `SupervisorJob()`: a failing child then fails alone. `async` keeps its exception until `await()` is called, but in a normal scope the failure still cancels the parent immediately.

## Cancellation is cooperative

`job.cancel()` doesn't stop a thread. It marks the Job cancelled, and the next suspending call that checks (`delay`, `yield`, `withContext`, most kotlinx.coroutines functions) throws `CancellationException`. Code that never suspends has to check for itself:

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var n = 0L
        try {
            while (true) { ensureActive(); n++ }          // without ensureActive this never stops
        } finally {
            withContext(NonCancellable) { println("cleanup after $n iterations") }
        }
    }
    delay(50)
    job.cancelAndJoin()
    println("cancelled: ${job.isCancelled}")
}
```

- `CancellationException` is how cancellation travels, so don't swallow it with a broad `catch (e: Exception)`; rethrow it.
- `finally` blocks run on cancellation. Suspending inside them needs `withContext(NonCancellable)`, because the coroutine is already cancelled.
- `withTimeout(ms) { }` cancels its block when time runs out and throws `TimeoutCancellationException`; `withTimeoutOrNull` returns `null` instead.

## Dispatchers

The dispatcher in a coroutine's context decides which thread runs it between suspensions:

- `Dispatchers.Default`: a pool sized to the CPU cores, for computation.
- `Dispatchers.IO`: an elastic pool (64 threads by default, or more on large machines) for blocking calls. It shares threads with Default.
- `Dispatchers.Main`: the UI thread on Android, Swing or JavaFX; it needs the platform artifact.
- `dispatcher.limitedParallelism(n)`: a view of a pool that runs at most `n` coroutines at once, useful to protect a resource.

`withContext(Dispatchers.IO) { ... }` runs a block on another dispatcher and returns its result to the original one. Avoid `GlobalScope` and `runBlocking` in production code paths: the first escapes structured concurrency, the second blocks a thread to wait.
