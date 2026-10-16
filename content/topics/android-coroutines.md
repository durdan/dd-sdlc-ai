---
id: android-coroutines
title: Coroutines and Flow on Android
summary: Suspend instead of block, scoped to a lifecycle
why: "Coroutines let you write sequential code that leaves the main thread free while it waits. Scopes make sure that work stops when the screen or ViewModel it belongs to goes away."
requires: [android-main-thread]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "Suspending frees the thread", text: "A coroutine waiting on the network gives its thread back; withContext moves blocking work to another dispatcher and returns." }
  - { title: "Structured concurrency", text: "Every coroutine lives in a scope. Cancel the scope (a cleared ViewModel, a destroyed screen) and all its children are cancelled." }
  - { title: "Collect only while visible", text: "Use repeatOnLifecycle or collectAsStateWithLifecycle so flows stop collecting when the UI is in the background." }
quiz:
  - q: "A suspend function calls a blocking JDBC-style API directly. Is it main-safe?"
    options:
      - Yes, every suspend function runs in the background
      - No. suspend only allows suspension; the blocking call still runs on the caller's thread unless wrapped in withContext(Dispatchers.IO)
      - Yes, as long as it is called from viewModelScope
    answer: 1
    explain: "The suspend keyword doesn't move work anywhere. A main-safe function moves its own blocking work with withContext, so callers on Dispatchers.Main don't have to know."
  - q: What happens to coroutines launched in viewModelScope when the user rotates the screen?
    options:
      - They are cancelled and restarted
      - They keep running, because the ViewModel survives the configuration change
      - They move to GlobalScope
    answer: 1
    explain: "viewModelScope is cancelled only when the ViewModel is cleared (the screen is finished for good). A rotation recreates the activity but keeps the ViewModel and its scope."
  - q: "Why is lifecycleScope.launch { flow.collect { ... } } in onCreate a problem?"
    options:
      - It collects only once
      - It keeps collecting while the app is in the background, wasting work and possibly updating views that are not shown
      - lifecycleScope can't collect flows
    answer: 1
    explain: "lifecycleScope lives until onDestroy. Wrapping the collect in repeatOnLifecycle(Lifecycle.State.STARTED) stops it in onStop and restarts it in onStart."
links:
  - { title: "Kotlin coroutines on Android (Android Developers)", url: "https://developer.android.com/kotlin/coroutines" }
  - { title: "Best practices for coroutines in Android (Android Developers)", url: "https://developer.android.com/kotlin/coroutines/coroutines-best-practices" }
  - { title: "StateFlow and SharedFlow (Android Developers)", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }
  - { title: "Coroutine context and dispatchers (kotlinlang.org)", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }
---
A coroutine is a computation that can pause at a `suspend` point without holding a thread. On Android that matters because the thread you start on is usually the main thread: while a coroutine waits for a response, the main Looper keeps drawing frames and handling touches. The code still reads top to bottom.

## Dispatchers decide the thread

```kotlin
class ArticleRepository(
    private val api: ArticleApi,
    private val io: CoroutineDispatcher = Dispatchers.IO,   // inject it so tests can replace it
) {
    suspend fun load(id: String): Article = withContext(io) {
        val raw = api.fetch(id)            // blocking call: fine here, we're on IO
        parse(raw)
    }
}
```

- `Dispatchers.Main`: the main thread. `viewModelScope` and `lifecycleScope` use it (strictly, `Dispatchers.Main.immediate`).
- `Dispatchers.IO`: a large pool for blocking I/O.
- `Dispatchers.Default`: one thread per core, for CPU work like sorting or parsing.

The convention is that **suspend functions are main-safe**: the function that blocks is the one that switches. Libraries like Retrofit and Room already do this for their suspend APIs.

## Structured concurrency

Coroutines are launched in a `CoroutineScope`, and child coroutines belong to their parent. Cancel the scope and everything in it is cancelled; if a child fails, by default the failure cancels its siblings and the parent too. On Android the scopes come with the objects that own the work:

```kotlin
class ArticleViewModel(private val repo: ArticleRepository) : ViewModel() {
    private val _state = MutableStateFlow<ArticleState>(ArticleState.Loading)
    val state: StateFlow<ArticleState> = _state

    fun open(id: String) {
        viewModelScope.launch {                       // cancelled in onCleared()
            _state.value = try {
                ArticleState.Loaded(repo.load(id))
            } catch (e: IOException) {
                ArticleState.Failed
            }
        }
    }
}
```

Avoid `GlobalScope`: nothing cancels it, and it can't be controlled in tests. Work that must outlive the screen goes to WorkManager or an application-level scope you create and inject. Cancellation is cooperative: suspending calls check for it, but a tight CPU loop should call `ensureActive()` now and then, and catching `CancellationException` without rethrowing breaks it.

## Flow: values over time

A `Flow` is a cold stream: nothing runs until someone collects it. `StateFlow` always has a current value and is the usual way a ViewModel exposes UI state; `SharedFlow` broadcasts events to any number of collectors.

```kotlin
val articles: StateFlow<List<Article>> = dao.observeAll()     // a cold Flow from Room
    .map { rows -> rows.map(::toArticle) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
```

`WhileSubscribed(5_000)` keeps the upstream alive for five seconds after the last collector leaves, long enough to survive a rotation without restarting the query.

## Collecting safely

Collect in the UI only while it is visible:

```kotlin
// Compose (lifecycle-runtime-compose)
val list by viewModel.articles.collectAsStateWithLifecycle()

// Views
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.articles.collect { adapter.submitList(it) }
    }
}
```

Both stop collecting below STARTED and resume above it, so a backgrounded app isn't doing UI work for nobody.

```trace diagram
id: launch-withcontext
title: A coroutine loads an article
subtitle: Launch on Main, block on IO, resume on Main
kind: sequence
elements:
  - { id: ui, label: UI }
  - { id: main, label: Main thread }
  - { id: io, label: Dispatchers.IO }
  - { id: api, label: Server }
edges:
  - { id: open, from: ui, to: main, label: "open(id): launch { }" }
  - { id: ctx, from: main, to: io, label: "repo.load: withContext(IO)" }
  - { id: suspend, from: main, to: main, label: "suspended: Looper keeps going" }
  - { id: call, from: io, to: api, label: blocking fetch }
  - { id: resp, from: api, to: io, label: response, style: dashed }
  - { id: resume, from: io, to: main, label: "result: resume on Main", style: dashed }
  - { id: state, from: main, to: ui, label: "_state.value = Loaded" }
  - { id: leave, from: ui, to: main, label: "screen finished: onCleared" }
  - { id: cancel, from: main, to: io, label: "scope cancelled: children too", style: dashed }
steps:
  - caption: "A tap calls open(id) on the ViewModel, which launches a coroutine in viewModelScope. With no dispatcher given, it runs on the main thread."
    trace: [open]
  - caption: "The repository's suspend function wraps its blocking work in withContext(Dispatchers.IO). That moves the work to an I/O thread, which is what makes the function main-safe."
    trace: [ctx]
  - caption: "Meanwhile the coroutine on Main is suspended until the block finishes. It doesn't block the thread, so the main Looper keeps drawing frames and handling touches."
    trace: [suspend]
  - caption: "On the IO thread the blocking call is fine. It waits for the server's response there."
    trace: [call, resp]
  - caption: "When the withContext block returns, the coroutine resumes on the main thread with the result."
    trace: [resume]
  - caption: "Back on Main, it sets the StateFlow's value, and the UI collecting it redraws."
    trace: [state]
  - caption: "A rotation would not stop any of this: the ViewModel and its scope survive configuration changes. But when the screen is finished for good, the ViewModel is cleared."
    trace: [leave]
  - caption: "Clearing it cancels viewModelScope, and cancellation flows down to every coroutine in it, including the work inside withContext. Suspending calls notice and stop."
    trace: [cancel]
note: "Cancellation is cooperative: a tight CPU loop must call ensureActive(), and catching CancellationException must rethrow it."
```
