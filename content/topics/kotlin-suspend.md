---
id: kotlin-suspend
title: "suspend: functions that are state machines"
summary: "What the compiler does with a suspend function"
why: "Coroutines are not threads and not magic. A suspend function is compiled into a resumable object, which explains what can and can't happen at a suspension point."
requires: [kotlin-lambdas]
lesson: none
points:
  - { title: A hidden extra parameter, text: "The compiler adds a Continuation parameter to every suspend function: the callback that resumes the caller." }
  - { title: Labels and saved locals, text: "The body is split at each suspension point into a state machine; locals that live across a pause are stored in the continuation object." }
  - { title: Suspending returns a marker, text: "A function that pauses returns COROUTINE_SUSPENDED, so its thread goes back to whatever it was doing." }
  - { title: suspend doesn't mean background, text: "Code between suspension points runs on whatever thread the coroutine is on; blocking calls still block it." }
quiz:
  - q: "A suspend function computes a SHA-256 hash of a 1 GB file in a loop with no suspension points, called from a coroutine on the main dispatcher. What happens?"
    options:
      - "It runs in the background because the function is suspend"
      - "It blocks the main thread for the whole computation"
      - "The coroutine library splits the loop automatically"
    answer: 1
    explain: "suspend only allows pausing at suspension points. Without any, it is an ordinary function call on the current thread. Move the work with withContext(Dispatchers.Default)."
  - q: Why can a suspend function only be called from another suspend function or a coroutine builder?
    options:
      - "It is a style rule"
      - "It needs a Continuation to resume into, and only suspend code (or a builder like launch) has one to pass"
      - "Suspend functions must run on a special thread"
    answer: 1
    explain: "The compiler passes the caller's continuation as a hidden argument. Ordinary code has none, so builders such as launch, async and runBlocking create the first one."
  - q: "What is stored in the continuation object between two suspension points?"
    options:
      - "The whole thread stack"
      - "The current state label and the local variables still needed after the pause"
      - "Nothing; the function restarts from the top"
    answer: 1
    explain: "Kotlin coroutines are stackless: only the state number and the live locals of each suspended function are kept, in a small heap object per call."
links:
  - { title: "Coroutines basics (kotlinlang.org)", url: "https://kotlinlang.org/docs/coroutines-basics.html" }
  - { title: "Composing suspending functions (kotlinlang.org)", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }
  - { title: "KEEP: Kotlin coroutines design (github.com/Kotlin)", url: "https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md" }
---
The `suspend` keyword is part of the language; almost everything else about coroutines (`launch`, dispatchers, `Flow`) lives in the kotlinx.coroutines library. What the language provides is a compiler transformation: every `suspend` function is turned into code that can stop in the middle, hand its thread back, and later continue from the same point with its local variables intact.

## The hidden Continuation

```kotlin
suspend fun loadProfile(id: String): Profile {
    val user = api.user(id)          // suspension point 1
    val avatar = api.avatar(user)    // suspension point 2
    return Profile(user, avatar)
}
```

compiles to something shaped roughly like this (simplified):

```kotlin
fun loadProfile(id: String, cont: Continuation<Profile>): Any? {
    val sm = cont as? LoadProfileSM ?: LoadProfileSM(cont)   // one state object per call
    when (sm.label) {
        0 -> { sm.label = 1
               val r = api.user(id, sm); if (r === COROUTINE_SUSPENDED) return r
               sm.user = r as User }
        1 -> { sm.user = sm.result as User }
    }
    // ...the same again for label 2 and avatar...
    return Profile(sm.user, sm.avatar)
}
```

- An extra **`Continuation`** parameter is added: an object with a `resumeWith(result)` method, which is how the callee gets back to its caller. This is continuation-passing style.
- The body becomes a **state machine**. Each suspension point gets a label; locals that are needed after it are saved as fields of the state object.
- If a callee really pauses (say, waiting for the network), it returns the special value **`COROUTINE_SUSPENDED`**, and every caller up the chain returns it too. The thread is free.
- When the result arrives, someone calls `resumeWith`, which calls `loadProfile` again with the same state object; the `when` jumps to the saved label.

If a callee has the result ready (a cache hit), it just returns it and nothing is suspended, which is why suspend calls are cheap when they don't wait.

## Building your own suspension point

At the bottom of every chain, something turns a callback into a suspension. You can do it yourself:

```kotlin
import kotlinx.coroutines.*
import kotlin.coroutines.resume

fun fetchLater(callback: (String) -> Unit) {
    Thread { Thread.sleep(100); callback("data") }.start()
}

suspend fun fetch(): String = suspendCancellableCoroutine { cont ->
    fetchLater { value -> cont.resume(value) }
}

fun main() = runBlocking {
    println("before on ${Thread.currentThread().name}")
    println(fetch())
    println("after on ${Thread.currentThread().name}")
}
```

`suspendCancellableCoroutine` gives you the continuation; the coroutine stays paused until `resume` is called, from any thread. The dispatcher then decides where the rest runs, which is why `after` prints on the `runBlocking` thread again.

## What this means in practice

- **Stackless.** Only the state of suspended functions is kept, a small object per call, not a thread stack. That is why a hundred thousand waiting coroutines fit in memory.
- **suspend is not background.** Code between suspension points runs on the current thread. A CPU loop or a blocking `Thread.sleep` in a suspend function blocks whatever thread the coroutine is on.
- **Function colour.** Suspend functions can be called only from suspend code or a coroutine builder (`launch`, `async`, `runBlocking`), because ordinary code has no continuation to pass.
- **Inline lambdas can suspend.** A lambda passed to an inline function like `forEach` is part of the enclosing suspend function, so you can call suspend functions inside it.

Where a coroutine runs, how it is cancelled and who waits for it are not the compiler's job: that's structured concurrency, next.
