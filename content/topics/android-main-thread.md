---
id: android-main-thread
title: The main thread, Looper and Handler
summary: One thread runs your UI from a message queue
why: "Every frame, touch and lifecycle callback runs on one thread. Block it for a few hundred milliseconds and frames drop; block it for five seconds and the system shows an ANR."
requires: [android-processes]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "A loop over a queue", text: "The main thread runs a Looper that takes one Message or Runnable at a time from its MessageQueue and runs it to completion." }
  - { title: "Everything shares it", text: "Drawing, input, lifecycle callbacks, Compose recomposition and your click handlers all wait their turn on the same queue." }
  - { title: "ANR is a timeout", text: "If input isn't handled within 5 seconds, or a receiver or service callback overruns, the system reports Application Not Responding." }
quiz:
  - q: Your click handler reads a 20 MB file synchronously. What does the user see?
    options:
      - Nothing; file reads run on a background thread automatically
      - The UI freezes until the read finishes, and an ANR dialog if it takes long enough
      - The app crashes with NetworkOnMainThreadException
    answer: 1
    explain: "Disk I/O on the main thread is allowed (StrictMode can flag it) but it blocks the queue: no frames, no input. Only network access on the main thread throws by default."
  - q: "What does Handler(Looper.getMainLooper()).post { ... } do when called from a background thread?"
    options:
      - Runs the block immediately on the background thread
      - Adds the block to the main thread's message queue, to run after what is already queued
      - Interrupts the main thread to run the block now
    answer: 1
    explain: "A Handler is bound to one Looper. post() enqueues the Runnable; the main Looper runs it when it reaches it, never in the middle of another message."
  - q: Why is the no-argument Handler() constructor deprecated?
    options:
      - It silently picks the Looper of the current thread, which may be the wrong one or none at all
      - Handlers are being removed from Android
      - It always uses a background thread
    answer: 0
    explain: "The implicit choice leads to lost tasks or crashes on threads without a Looper. Pass the Looper explicitly, for example Looper.getMainLooper()."
links:
  - { title: "Looper (Android API reference)", url: "https://developer.android.com/reference/android/os/Looper" }
  - { title: "Handler (Android API reference)", url: "https://developer.android.com/reference/android/os/Handler" }
  - { title: "ANRs (Android Developers)", url: "https://developer.android.com/topic/performance/issues/anr" }
---
When your process starts, Android creates one thread for you, the main thread (also called the UI thread), and runs a `Looper` on it. A Looper is a loop over a `MessageQueue`: take the next message, run it to the end, take the next. Input events, drawing, lifecycle callbacks and the code you post all arrive as messages on that one queue, so while one of them runs, nothing else on screen can happen.

## The loop in a few lines

Most threads have no Looper. You can give one a loop yourself, which is exactly what the framework does for the main thread:

```kotlin
val worker = thread {
    Looper.prepare()                                  // attach a MessageQueue to this thread
    handler = Handler(Looper.myLooper()!!)            // a way for other threads to post into it
    Looper.loop()                                     // run messages until quit() is called
}
```

In practice you use `HandlerThread` for this, or more often coroutines, but the model is the same one the main thread uses.

## Posting work

A `Handler` is a handle onto one Looper's queue. Any thread can use it to enqueue work for that Looper's thread:

```kotlin
val main = Handler(Looper.getMainLooper())

main.post { statusText.text = "Done" }                 // run as soon as the queue gets to it
main.postDelayed({ hideBanner() }, 3_000)              // run no earlier than 3 seconds from now
```

`postDelayed` is "no earlier than", not "exactly at": if the main thread is busy, the message waits. Also note that pending messages hold references to whatever their lambdas capture; remove them (`removeCallbacksAndMessages(null)`) when the screen goes away, or prefer a lifecycle-aware coroutine.

`View.post {}` and `Activity.runOnUiThread {}` are shortcuts for the same thing.

## The budget

At 60 Hz a frame has about 16 ms; at 120 Hz about 8 ms. Any message that runs longer than that delays the next frame, which users notice as jank. Long-running blocking work belongs on other threads: networking (which throws `NetworkOnMainThreadException` on the main thread), database queries, file I/O, JSON parsing of large payloads, bitmap decoding.

## ANRs

If the main thread stays blocked, the system steps in. The documented triggers include:

- an input event (touch, key) not handled within **5 seconds**;
- a `BroadcastReceiver` that hasn't finished in time (5 seconds while the app has an activity in the foreground, longer otherwise);
- a service whose `onCreate`/`onStartCommand`/`onBind` doesn't return within a few seconds;
- a service started with `startForegroundService()` that doesn't call `startForeground()` within 5 seconds.

The cause is often not slow code but a wait: a lock held by a background thread, a synchronous binder call, or `runBlocking` on the main thread. Play Console's Android vitals reports ANR rates, and the stack traces show what the main thread was waiting on.

## Catching it early

`StrictMode` can flag disk and network access on the main thread during development:

```kotlin
if (BuildConfig.DEBUG) {
    StrictMode.setThreadPolicy(
        StrictMode.ThreadPolicy.Builder().detectDiskReads().detectDiskWrites().detectNetwork().penaltyLog().build()
    )
}
```

```trace diagram
id: looper-turn
title: One message at a time on the main Looper
subtitle: Messages in, your code, a frame out
direction: DOWN
elements:
  - { id: input, label: Touch, sub: an input event, kind: person, row: 0 }
  - { id: post, label: "Handler.post()", sub: "a Runnable, from any thread", kind: person, row: 0 }
  - { id: queue, label: MessageQueue, sub: "ordered by time", kind: store, tone: data, row: 1 }
  - { id: looper, label: Main Looper, sub: takes the next message, kind: system, row: 2 }
  - { id: handler, label: Your code, sub: "click, callback, recomposition", row: 3 }
  - { id: worker, label: IO thread, sub: "Dispatchers.IO, an executor", tone: stream, row: 3 }
  - { id: frame, label: Next frame, sub: "16 ms at 60 Hz", kind: person, row: 4 }
  - { id: anr, label: ANR, sub: input not handled in 5 s, kind: external, row: 4 }
edges:
  - { id: enqueue, from: input, to: queue }
  - { id: posted, from: post, to: queue }
  - { id: next, from: queue, to: looper, label: "next()" }
  - { id: dispatch, from: looper, to: handler, label: runs it to the end }
  - { id: draw, from: handler, to: frame, label: returns }
  - { id: block, from: handler, to: anr, label: blocks for seconds, style: dashed }
  - { id: offload, from: handler, to: worker, label: hand off }
  - { id: result, from: worker, to: queue, label: post the result, style: dashed }
steps:
  - caption: "Android gives your process one main thread and runs a Looper on it. The Looper takes one message at a time from its MessageQueue and runs it to the end."
    focus: [queue, looper]
  - caption: "A touch arrives as a message. So does a Runnable that any thread posts with a Handler bound to the main Looper; it waits behind whatever is already queued."
    trace: [enqueue, posted]
  - caption: "The Looper takes the next message and runs it: your click listener, a lifecycle callback, a recomposition."
    trace: [next, dispatch]
  - caption: "Your code updates the UI and returns, and drawing the next frame is just another piece of work on this thread. At 60 Hz it has about 16 ms, at 120 Hz about 8."
    trace: [draw]
  - caption: "Now the click handler reads a large file synchronously. Until it returns, nothing else in the queue runs: no frames, no touches."
    trace: [block]
  - caption: "If an input event isn't handled within 5 seconds, the system reports Application Not Responding. In the foreground the user sees a dialog offering to close the app."
    focus: [anr, queue]
  - caption: "The fix is to hand the blocking work to another thread, for example with withContext(Dispatchers.IO). The main thread returns to its queue at once."
    trace: [offload]
  - caption: "When the work is done, the result comes back as one more message on the main queue, and the UI updates in the next turn."
    trace: [result, next, dispatch, draw]
note: "Network on the main thread throws NetworkOnMainThreadException; disk access doesn't, but StrictMode can flag it."
```
