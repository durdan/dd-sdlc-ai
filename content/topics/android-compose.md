---
id: android-compose
title: How Jetpack Compose recomposes
summary: Read state, and only the readers run again
why: "Compose redraws by calling your functions again. Knowing what triggers that, what it can skip and where side effects belong is the difference between a smooth screen and one that recomposes every frame."
requires: [android-main-thread]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "UI is a function of state", text: "Composables describe the UI for the current state. When a State they read changes, Compose calls them again: recomposition." }
  - { title: "remember keeps values across calls", text: "remember survives recomposition, rememberSaveable also survives recreation and process death. Neither is a place for app data." }
  - { title: "Stable inputs let Compose skip", text: "If a composable's parameters are unchanged, Compose can skip it. Stability decides how unchanged is checked." }
  - { title: "Effects for the outside world", text: "Network calls, analytics and listeners go in LaunchedEffect, DisposableEffect and friends, never directly in the body." }
quiz:
  - q: "What is wrong with this composable?"
    code: |
      @Composable
      fun Counter() {
          var count = mutableStateOf(0)
          Button(onClick = { count.value++ }) { Text("${count.value}") }
      }
    options:
      - Nothing
      - The state is created again on every recomposition, so the count resets to 0
      - Button can't read state
    answer: 1
    explain: "Without remember, each call creates a fresh mutableStateOf(0). Clicking triggers recomposition, which runs the body again and throws the old value away. Use var count by remember { mutableStateOf(0) }."
  - q: "With strong skipping (the default from Kotlin 2.0.20), how does Compose compare an unstable parameter to decide whether to skip?"
    options:
      - It never skips composables with unstable parameters
      - By instance equality (===), so passing the same object lets it skip
      - By calling equals() on every field
    answer: 1
    explain: "Stable parameters are compared with equals(); unstable ones with ===. Before strong skipping, any unstable parameter meant the composable always recomposed with its parent."
  - q: Where should a composable start loading data when it first appears?
    options:
      - Directly in the composable body
      - In a LaunchedEffect keyed on what the load depends on (or, better, in the ViewModel)
      - In a remember block
    answer: 1
    explain: "The body can run many times, in any order, and may be abandoned. LaunchedEffect starts a coroutine when it enters the composition, cancels it when it leaves and restarts it when its keys change."
links:
  - { title: "Thinking in Compose (Android Developers)", url: "https://developer.android.com/develop/ui/compose/mental-model" }
  - { title: "State and Jetpack Compose (Android Developers)", url: "https://developer.android.com/develop/ui/compose/state" }
  - { title: "Stability in Compose (Android Developers)", url: "https://developer.android.com/develop/ui/compose/performance/stability" }
  - { title: "Side-effects in Compose (Android Developers)", url: "https://developer.android.com/develop/ui/compose/side-effects" }
---
In Compose you don't change widgets; you write functions that describe what the screen should look like for the current state. The first call builds a tree (the composition). When a `State` object that a composable read changes, Compose schedules a **recomposition**: it calls again only the composables that read it, plus any of their children that it can't skip, and updates the tree with the difference.

## State and remember

```kotlin
@Composable
fun SearchBox(onSearch: (String) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }   // survives rotation and process death
    TextField(value = query, onValueChange = { query = it })
    Button(onClick = { onSearch(query) }) { Text("Search") }
}
```

- `mutableStateOf` makes a value observable: reading it during composition subscribes the reader.
- `remember` stores a value in the composition so the next call gets the same one. It is forgotten when the composable leaves the composition, and on activity recreation.
- `rememberSaveable` also writes the value to saved state (a `Bundle`), so it comes back after recreation and process death. Keep it small: ids and text, not lists of objects.

The usual shape is **state hoisting**: composables take the value and an event callback, and the state lives higher up, often in a ViewModel. That makes them easy to reuse, preview and test.

## The rules recomposition plays by

The Compose docs list what to expect: recomposition skips as much as it can, it is optimistic and may be cancelled, a composable may run as often as every frame of an animation, and composables may run in any order (and potentially in parallel). So the body should be fast, free of side effects, and give the same result for the same inputs.

## Stability and skipping

To skip a composable whose parent recomposed, Compose compares the new parameters with the old ones. A type is **stable** if Compose can trust that comparison: primitives, `String`, function types, and classes whose public properties are `val`s of stable types. With **strong skipping mode**, the default since Kotlin 2.0.20 (the Compose compiler ships with Kotlin since 2.0):

- stable parameters are compared with `equals()`;
- unstable ones with `===`, so passing the same instance still skips;
- lambdas are remembered automatically.

`List<T>` is an interface and counts as unstable. Passing a new list each time (`items.filter { ... }` in the parent) therefore defeats skipping; compute it once in the ViewModel, or `remember(items) { ... }` it. `@Immutable` and `@Stable` annotations, or the compiler's stability configuration file, tell Compose to trust types it can't infer. Before reaching for them, check the compiler reports or Layout Inspector's recomposition counts.

## Reading state late

A value read in composition recomposes the reader; a value read only in layout or drawing skips composition entirely:

```kotlin
// Recomposes every frame of the scroll:
Box(Modifier.offset(y = scrollState.value.dp))
// Only re-runs layout:
Box(Modifier.offset { IntOffset(0, scrollState.value) })
```

`derivedStateOf` helps when a value changes often but the result rarely does (for example "show the back-to-top button once the list has scrolled").

## Side effects

```kotlin
@Composable
fun ProductScreen(id: String, vm: ProductViewModel) {
    LaunchedEffect(id) { vm.load(id) }               // runs on enter, restarts when id changes
    DisposableEffect(Unit) {
        val listener = registerShakeListener()
        onDispose { listener.unregister() }          // runs on leave
    }
}
```

`SideEffect` runs after every successful recomposition, `rememberCoroutineScope` gives a scope for event handlers (`onClick = { scope.launch { ... } }`), and `rememberUpdatedState` lets a long-running effect see the latest value of a parameter without restarting.

```trace diagram
id: recompose-frame
title: One state change, one frame
subtitle: count++ from a click to pixels
direction: DOWN
groups:
  - { id: composition, label: Composition }
  - { id: layout, label: Layout }
  - { id: drawing, label: Drawing }
elements:
  - { id: click, label: Click, sub: onClick runs count++, kind: person }
  - { id: count, label: count, sub: "mutableStateOf, remembered", kind: store }
  - { id: counter, label: "Counter()", sub: the restart scope that read count, group: composition }
  - { id: label, label: "Label(text)", sub: "new String: runs", group: composition }
  - { id: header, label: "Header(title)", sub: "same title: skipped", group: composition }
  - { id: list, label: "ItemList(items)", sub: "new List each call: runs", group: composition }
  - { id: measure, label: Measure and place, sub: changed nodes only, group: layout }
  - { id: scroll, label: scrollState, sub: "read in Modifier.offset { }", kind: store }
  - { id: draw, label: Draw, sub: into a Canvas, group: drawing }
edges:
  - { id: write, from: click, to: count, label: write, flow: data }
  - { id: invalidate, from: count, to: counter, label: invalidates readers }
  - { id: runs, from: counter, to: label }
  - { id: skip, from: counter, to: header, style: dashed, flow: main }
  - { id: runs2, from: counter, to: list }
  - { id: place1, from: label, to: measure }
  - { id: place2, from: list, to: measure }
  - { id: late, from: scroll, to: measure, label: read late, style: dotted, flow: data }
  - { id: paint, from: measure, to: draw }
steps:
  - caption: Compose turns state into pixels in three phases each frame. Composition decides what to show, layout decides where, and drawing paints it.
  - caption: A click runs count++. The State object records the write, but nothing redraws yet; the work waits for the next frame.
    focus: [click, count]
    trace: [write]
  - caption: Reading count during composition subscribed Counter's restart scope to it. On the next frame the recomposer runs again only the scopes that read the changed state, not the whole screen.
    focus: [count, counter]
    trace: [invalidate]
  - caption: Counter calls its children again with fresh arguments. Label gets a different String, so Label runs.
    focus: [counter, label]
    trace: [runs]
  - caption: Header gets the same title as last time. String is stable and equals() says nothing changed, so Compose skips Header entirely.
    focus: [counter, header]
    trace: [skip]
  - caption: "ItemList gets items.filter { ... }, a brand-new List on every call. List is unstable, so with strong skipping (the default from Kotlin 2.0.20) it is compared with ===, and a new instance never matches. Remember the result or compute it in the ViewModel."
    focus: [counter, list]
    trace: [runs2]
  - caption: The nodes that changed are measured and placed again. Layout reruns only where a size or position may have changed.
    focus: [label, list, measure]
    trace: [place1, place2]
  - caption: "A state read inside a layout lambda, like Modifier.offset { }, skips composition altogether. Scrolling then reruns only layout and drawing, not your composables."
    focus: [scroll, measure]
    trace: [late]
  - caption: Finally the drawing phase paints into a Canvas. A state read only in drawing code, such as drawBehind, reruns drawing alone, the cheapest phase of the three.
    focus: [measure, draw]
    trace: [paint]
note: Layout Inspector shows how often each composable recomposed and how often it was skipped.
```
