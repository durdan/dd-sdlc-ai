---
id: react-event-loop
title: React and the event loop
summary: When a state update actually reaches the screen
why: "Reading the DOM right after `setState`, measuring before a paint, or a render so long that clicks queue up: all of these depend on where React does its work in the browser's event loop."
requires: [event-loop, react-state, react-transitions]
lesson: lanes
points:
  - title: Setting state only queues
    text: "`setState` records the update and asks React to render. The DOM still shows the old value on the next line, and in any microtask you queued before it."
  - title: Clicks and keys are flushed before paint
    text: "For a discrete event such as a click, React renders and commits the batch in a microtask right after your handler, so the user never sees a frame without the update."
  - title: Other updates get a task
    text: "Updates from timers or network callbacks are batched too, then rendered in a task React schedules. `flushSync` forces a synchronous commit when you need the DOM now."
  - title: Rendering holds the main thread
    text: "A render is JavaScript on the main thread. A long urgent render blocks input until it ends; a transition yields between pieces so input can run."
quiz:
  - q: "In a click handler, you call `setOpen(true)` and on the next line read `panelRef.current` to measure the panel. It is still `null`. Why?"
    options:
      - Refs are always null in handlers
      - "React hasn't rendered or committed yet; that happens after the handler returns"
      - The panel is rendered on another thread
    answer: 1
    explain: "The update is only queued. Measure in an effect or a layout effect after the commit, or wrap the update in `flushSync` if you need the DOM synchronously."
  - q: "Inside a `setTimeout` callback, you call `setCount(5)` and queue a microtask that reads the counter's text from the DOM. What does it read, in React 19?"
    options: ["5", "The old value: React renders timer-triggered updates in a later task, after your microtasks", "An empty string"]
    answer: 1
    explain: "Non-discrete updates are batched and rendered in a task that React schedules. Your microtask runs before that task, so the DOM hasn't changed yet."
  - q: "A click handler starts a render that takes 300 ms. The user clicks a second button during it. What happens?"
    options:
      - The second click interrupts the render
      - "The second click waits: its event can't be handled until the render's JavaScript finishes"
      - The click is lost
    answer: 1
    explain: "An urgent render runs to completion on the main thread, like any other JavaScript. Only transition renders yield to let input through, or the work has to be made smaller."
links:
  - { title: "Queueing a series of state updates (react.dev)", url: "https://react.dev/learn/queueing-a-series-of-state-updates" }
  - { title: "flushSync (react.dev)", url: "https://react.dev/reference/react-dom/flushSync" }
  - { title: "React v18.0: automatic batching (react.dev)", url: "https://react.dev/blog/2022/03/29/react-v18" }
  - { title: "useEffect: caveats on timing (react.dev)", url: "https://react.dev/reference/react/useEffect" }
---
React runs on the same single thread and event loop as the rest of your page. A state update doesn't change the DOM where you call it: React queues it, and then renders and commits later, at a point it chooses based on what caused the update. For clicks and key presses that point is a microtask right after your handler, before the browser paints. For timers, network responses and transitions it is a task scheduled for shortly afterwards. Knowing which tells you when the DOM is up to date, and why a long render makes the page stop responding.

## Queue now, render soon

This toy store (not React's code) shows the general technique: collect updates while the current code runs, and render once in a microtask.

```js run
let state = 0
let scheduled = false
const queue = []

function setState(update) {
  queue.push(update)
  if (!scheduled) {
    scheduled = true
    queueMicrotask(render) // render once, after the current code finishes
  }
}
function render() {
  scheduled = false
  for (const update of queue.splice(0)) state = update(state)
  console.log("render with", state)
}

setState((s) => s + 1)
setState((s) => s + 1)
setState((s) => s + 1)
console.log("handler finished, state is still", state)
setTimeout(() => console.log("next task sees", state), 0)
```

The three updates produce one render, after the synchronous code and before the next task. React's batching for a click works the same way from the outside.

## What React 19 does, by cause

These timings were observed in Chrome with React 19. They are implementation details that React may change, but they explain the behaviour you see:

- **A click, key press or other discrete event.** The updates from the handler are rendered and committed in a microtask scheduled when the first update was queued. Microtasks you queued before that still see the old DOM; anything after, including the next frame, sees the new one. Effects caused by the update may also run before the paint, which the `useEffect` docs mention.
- **A timer, a network response, a message.** The updates are batched in the same way (automatic batching, since React 18), but rendered in a task React schedules. Your remaining code and its microtasks see the old DOM, and passive effects usually run after the paint.
- **After an `await` in a handler.** Updates made after the `await` are a new batch and a separate render, because the handler's synchronous part has already been processed.
- **A transition.** Rendered in tasks, yielding to the browser regularly, and abandoned if a more urgent update arrives.

When you need the DOM to reflect an update right now (to scroll to a newly added item, or before handing control to a browser API), `flushSync` from `react-dom` renders and commits synchronously:

```tsx
import { flushSync } from "react-dom"

declare const listRef: { current: HTMLUListElement | null }
declare function setItems(update: (prev: string[]) => string[]): void

export function addAndScroll(item: string) {
  flushSync(() => setItems((prev) => [...prev, item]))
  listRef.current?.lastElementChild?.scrollIntoView() // the new item is in the DOM
}
```

Use it sparingly: it gives up batching and can hurt performance.

## Rendering blocks the thread

Rendering is ordinary JavaScript. While React renders an urgent update, nothing else on the main thread can run: no input handlers, no timers, no painting.

```js run
const start = performance.now()
setTimeout(() => console.log("timer ran after", Math.round(performance.now() - start), "ms"), 0)
while (performance.now() - start < 200) {} // a 200 ms render: nothing else can run meanwhile
console.log("render finished")
```

The timer was due at once, but it runs only after the 200 ms of synchronous work (the exact number printed varies, but is never below 200). A click during a slow render waits in the same way, which shows up as poor responsiveness (INP). The fixes are the ones from earlier topics: render less (memoisation, moving state down), split the work, or mark the slow part as a transition so React can pause between components and let input through.

```trace lanes
# A toy scheduler, not React's code; the checker runs it and compares with expect.
id: click-vs-timer
title: A click, then a timer
subtitle: "A toy scheduler with React 19's timing, not React's code"
run: any
code: |
  // A toy scheduler, not React's code: click updates
  // render in a microtask, timer updates in a task.
  let state = 0, dom = 0, scheduled = false;
  function render() {
    scheduled = false;
    dom = state; // the "commit"
    console.log("commit", dom);
  }
  function setState(value, discrete) {
    state = value;
    if (scheduled) return; // batched
    scheduled = true;
    if (discrete) queueMicrotask(render);
    else setTimeout(render, 0);
  }
  function onClick() { // pretend the user clicked
    setState(1, true);
    setState(2, true);
    console.log("handler: dom is", dom);
  }
  onClick();
  setTimeout(function onTimer() {
    setState(3, false);
    queueMicrotask(() => console.log("microtask: dom is", dom));
  }, 0);
lanes:
  - { id: stack, title: Call stack, kind: stack }
  - { id: dom, title: DOM shows, hint: What a reader of the DOM would see, tone: violet }
  - { id: micro, title: Microtask queue, kind: queue, tone: teal }
  - { id: tasks, title: Task queue, kind: queue, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. The toy DOM shows 0.
    state: { dom: [{ id: d, label: "0" }] }
  - line: 21
    caption: The script calls onClick, standing in for a click handler.
    state: { stack: [main script, "onClick()"] }
  - line: 17
    caption: The first setState records 1 and schedules one render as a microtask. Nothing is rendered yet.
    state: { micro: [{ id: r1, label: render }] }
  - line: 18
    caption: The second setState only records 2. A render is already scheduled, so both updates are batched into it.
  - line: 19
    caption: The handler reads the DOM on the next line and still sees 0.
    log: "handler: dom is 0"
  - line: 22
    caption: onClick returns and the script schedules a timer, which waits in the task queue.
    state: { stack: [main script], tasks: [{ id: t, label: onTimer }] }
  - line: 6
    caption: The script ends. Microtasks run before any task, so the render commits 2 now. In a browser that is before the next paint.
    state: { stack: [{ id: r1, label: render }], micro: [], dom: [{ id: d, label: "2" }] }
    log: commit 2
  - line: 23
    caption: "Next task: the timer. Its update isn't from a click, so the render is scheduled as a task, behind everything already queued."
    state: { stack: [{ id: t, label: onTimer }], tasks: [{ id: r2, label: render }] }
  - line: 24
    caption: The timer queues a microtask that reads the DOM. It ends, and that microtask runs first, so it still sees 2.
    state: { stack: [], micro: [] }
    log: "microtask: dom is 2"
  - line: 6
    caption: Only then does the render task commit 3. Code that needs the DOM sooner can use flushSync, in the next tab.
    state: { stack: [{ id: r2, label: render }], tasks: [], dom: [{ id: d, label: "3" }] }
    log: commit 3
expect: ["handler: dom is 0", "commit 2", "microtask: dom is 2", "commit 3"]
```

```trace lanes
id: flush-sync
title: flushSync
subtitle: "The same toy, plus a toy flushSync: not React's code"
run: any
code: |
  // The same toy (not React's code) + a toy flushSync.
  let state = 0, dom = 0, scheduled = false;
  let syncing = false;
  function render() {
    scheduled = false;
    dom = state;
    console.log("commit", dom);
  }
  function setState(value) { // a timer update
    state = value;
    if (scheduled) return;
    scheduled = true;
    if (!syncing) setTimeout(render, 0); // later task
  }
  function flushSync(fn) {
    syncing = true;
    fn();
    syncing = false;
    render(); // commit now
  }
  setTimeout(function onTimer() {
    flushSync(() => setState(1));
    console.log("after flushSync: dom is", dom);
    setState(2);
    console.log("after setState: dom is", dom);
  }, 0);
lanes:
  - { id: stack, title: Call stack, kind: stack }
  - { id: dom, title: DOM shows, hint: What a reader of the DOM would see, tone: violet }
  - { id: tasks, title: Task queue, kind: queue, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - line: 21
    caption: The script schedules a timer. The toy DOM shows 0.
    state: { dom: [{ id: d, label: "0" }], tasks: [{ id: t, label: onTimer }] }
  - line: 22
    caption: Inside the timer, flushSync runs the update and then renders and commits at once, before it returns.
    state: { stack: [{ id: t, label: onTimer }, "flushSync()"], tasks: [], dom: [{ id: d, label: "1" }] }
    log: commit 1
  - line: 23
    caption: So the very next line already sees the new DOM. This is the moment to scroll to a new item or measure it.
    state: { stack: [{ id: t, label: onTimer }] }
    log: "after flushSync: dom is 1"
  - line: 24
    caption: An ordinary setState after it goes back to the usual path. The render is scheduled as a task.
    state: { tasks: [{ id: r, label: render }] }
  - line: 25
    caption: The next line sees the old DOM again.
    log: "after setState: dom is 1"
  - line: 7
    caption: The render task commits 2 later. flushSync gives up batching, so keep it for the few places that need the DOM right away.
    state: { stack: [{ id: r, label: render }], tasks: [], dom: [{ id: d, label: "2" }] }
    log: commit 2
expect: [commit 1, "after flushSync: dom is 1", "after setState: dom is 1", commit 2]
```
