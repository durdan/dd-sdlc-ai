---
id: kotlin-flow
title: "Flow: cold streams, operators and context"
summary: "Asynchronous sequences that run when collected"
why: "Flow is how Kotlin code returns many values over time. Knowing that it is cold, sequential and context-preserving explains where to put flowOn, buffer and catch."
requires: [kotlin-structured-concurrency, kotlin-sequences]
lesson: none
points:
  - { title: Cold by default, text: "A flow { } block runs from the start for each collector, and only while it is being collected." }
  - { title: Emit waits for collect, text: "Producer and collector run in the same coroutine by default, so emit suspends until the collector has handled the value: built-in backpressure." }
  - { title: Context is preserved, text: "A flow runs in the collector's context; flowOn changes the context of the operators above it, never below." }
  - { title: Hot flows are different, text: "StateFlow and SharedFlow exist independently of collectors and share one stream between many." }
quiz:
  - q: "val f = flow { println(\"start\"); emit(1) }. Nothing collects f yet. What has been printed?"
    options:
      - "start"
      - "Nothing"
      - "start, twice"
    answer: 1
    explain: "flow { } only describes the work. The block runs each time a terminal operator such as collect, first or toList is called."
  - q: "In flow.map { parse(it) }.flowOn(Dispatchers.Default).collect { show(it) }, where does show run?"
    options:
      - "On Dispatchers.Default"
      - "In the collector's own context, wherever collect was called"
      - "On a new thread per value"
    answer: 1
    explain: "flowOn affects only the operators upstream of it (the flow builder and map). Downstream operators and the collector keep the collector's context."
  - q: Why does calling emit from inside withContext(Dispatchers.IO) { } in a flow { } builder fail?
    options:
      - "IO can't emit values"
      - "It breaks context preservation: a flow must emit from the coroutine that collects it, so use flowOn or channelFlow instead"
      - "emit is not a suspend function"
    answer: 1
    explain: "The collector expects values in its own context. Flow checks this and throws an IllegalStateException; flowOn moves upstream work safely, through a channel."
links:
  - { title: "Asynchronous Flow (kotlinlang.org)", url: "https://kotlinlang.org/docs/flow.html" }
  - { title: "Channels (kotlinlang.org)", url: "https://kotlinlang.org/docs/channels.html" }
  - { title: "Flow API reference (kotlinlang.org)", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-flow/" }
---
A `suspend` function returns one value. A `Flow<T>` returns many, over time: the asynchronous version of a `Sequence`. Like a sequence it is **cold**: building one does nothing, and each terminal operation (`collect`, `first`, `toList`) runs the producer again from the start. Unlike a sequence, the producer can suspend between values, to wait for a network page or a database change.

## Cold and sequential

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun ticks(): Flow<Int> = flow {
    println("producer starts")
    for (i in 1..3) {
        delay(100)
        emit(i)                       // suspends until the collector is done with i
    }
}

fun main() = runBlocking {
    val doubled = ticks().map { it * 2 }      // nothing printed yet
    doubled.collect { println("got $it") }    // producer starts, got 2, got 4, got 6
    println(doubled.first())                  // producer starts again, prints 2
}
```

By default, producer and collector run in **one coroutine**, taking turns: `emit` calls straight into the collector and returns when the collector's block has finished. A slow collector therefore slows the producer down, which is backpressure for free. Operators such as `map`, `filter`, `take` and `onEach` are cheap wrappers around the next stage; `take(n)` cancels the producer once it has enough.

## Context preservation and flowOn

A flow runs in the context of the code that collects it. You may not switch context and emit from there (`withContext(IO) { emit(x) }` throws). To move the producing side to another dispatcher, use `flowOn`:

```kotlin
val rows: Flow<Row> = flow { readRowsBlocking().forEach { emit(it) } }
    .map(::parse)
    .flowOn(Dispatchers.IO)           // flow { } and map run on IO
// .collect { render(it) }            // still runs in the collector's context
```

`flowOn` changes only what is **above** it. Under the hood it starts the upstream in a separate coroutine and passes values through a channel, so the two sides now run concurrently.

## Buffering and dropping

When producer and consumer run at different speeds you can decide what happens:

- `buffer(n)`: let the producer run up to `n` values ahead.
- `conflate()`: keep only the latest value if the collector is busy (good for UI state).
- `collectLatest { }`: cancel the handling of a value when a newer one arrives.
- `debounce`, `sample`: time-based thinning for search boxes and sensors.

## Errors and completion

Exceptions in the producer or operators travel downstream to the collector. `catch { }` handles exceptions from **upstream** only, and can emit a fallback; `onCompletion { }` runs at the end, with or without an error. Wrap the `collect` call in a normal `try` for errors in the collector itself. Cancellation of the collecting coroutine cancels the whole chain.

## Hot flows

`StateFlow` (always has a current value, conflated, replays it to new collectors) and `SharedFlow` (broadcast to any number of collectors, configurable replay and buffer) are **hot**: they exist and hold values whether or not anyone is collecting. `stateIn` and `shareIn` turn a cold flow into a hot one inside a scope. For values from callbacks, `callbackFlow { }` with `awaitClose { }` bridges listener APIs; for several producers feeding one consumer, `channelFlow` or a `Channel` is the tool.
