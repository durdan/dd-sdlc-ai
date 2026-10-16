---
id: react-state
title: State as a snapshot, updates in a batch
summary: Setting state asks for a new render; it doesn't change the variable
why: "\"I called setCount but count is still the old value\" is the most common React question. State is a snapshot per render, and updates are queued and processed together."
requires: [react-render-commit]
lesson: lanes   # the trace lanes block at the end is the lesson
points:
  - title: Each render has its own state
    text: "`count` is a constant for one render. Calling `setCount` doesn't change it; it schedules a new render in which `useState` returns the new value."
  - title: Updates are batched
    text: "React waits until your event handler finishes, then processes every update it queued and renders once. In React 18 and later this also applies to updates from timers, promises and native events."
  - title: Use an updater for the next value
    text: "`setCount(c => c + 1)` computes from the latest queued value, not from this render's snapshot, so several in a row all count."
  - title: Replace, don't mutate
    text: "React compares old and new state with `Object.is`. Mutating an object and setting the same object looks like no change, so make a new object or array."
quiz:
  - q: "`count` is 0. A click handler runs `setCount(count + 1)` three times. What is `count` after the next render?"
    options: ["3", "1", "0"]
    answer: 1
    explain: "All three calls read the same snapshot, so all three ask for 0 + 1. Write `setCount(c => c + 1)` to build on the previous update."
  - q: "Right after `setName(\"Lin\")` inside a handler, what does `console.log(name)` print?"
    options: ["\"Lin\"", "The old name", "undefined"]
    answer: 1
    explain: "`name` is this render's constant. The new value arrives in the next render. If you need it now, keep it in a local variable: `const next = \"Lin\"; setName(next)`."
  - q: "Why does `items.push(newItem); setItems(items)` not update the list?"
    options:
      - push is asynchronous
      - "It's the same array object, so `Object.is` says nothing changed and React can skip the render"
      - setItems needs a callback
    answer: 1
    explain: "React detects changes by identity, not by looking inside. `setItems([...items, newItem])` creates a new array, which is a change."
links:
  - { title: "State as a snapshot (react.dev)", url: "https://react.dev/learn/state-as-a-snapshot" }
  - { title: "Queueing a series of state updates (react.dev)", url: "https://react.dev/learn/queueing-a-series-of-state-updates" }
  - { title: "useState (react.dev)", url: "https://react.dev/reference/react/useState" }
  - { title: "Updating objects in state (react.dev)", url: "https://react.dev/learn/updating-objects-in-state" }
---
State is the data React keeps for a component between renders. Calling a `set` function doesn't change the variable you're looking at: it asks React to render the component again, and in that render `useState` returns the new value. Each render sees a fixed snapshot of state, its event handlers close over that snapshot, and updates made during one event are queued and applied together before the next render.

## A snapshot per render

```tsx
import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
    console.log(count) // still 0: this render's value
  }

  return <button onClick={handleClick}>{count}</button>
}
```

One click shows 1, not 3. `count` is a `const` in this call of `Counter`; every line of `handleClick` sees 0, so each call queues "set it to 1". This isn't asynchrony: the variable simply belongs to a render that has already happened.

## The queue

React keeps the updates in a queue and works through them when it next renders the component. A value replaces the state; a function is called with the result so far. Here is that rule as plain JavaScript (a model of the queue, not React's code):

```js run
function processQueue(base, queue) {
  let state = base
  for (const update of queue) state = typeof update === "function" ? update(state) : update
  return state
}
const count = 0 // this render's snapshot
console.log(processQueue(count, [count + 1, count + 1, count + 1]))
console.log(processQueue(count, [(c) => c + 1, (c) => c + 1, (c) => c + 1]))
console.log(processQueue(count, [count + 5, (c) => c + 1]))
```

That prints 1, 3 and 6. Use the updater form whenever the next value depends on the previous one and more than one update may be queued.

## Batching

React waits until all the code in an event handler has run before it processes the queue, then renders once. Three `set` calls on two different state variables produce one render, not three, and the user never sees a half-updated screen. Since React 18 the same automatic batching applies to updates from `setTimeout`, promise callbacks and native event listeners. React doesn't batch across separate events: two clicks are two renders, so a second click sees the first one's result. How the batch is scheduled against the browser's event loop is covered in the event loop topic.

## Replace instead of mutating

React decides whether state changed with `Object.is(old, new)`. If you mutate an object or array and pass the same object back, nothing changed by that test and React may skip the render. Treat state as read-only and create new values:

```tsx
import { useState } from "react"

type Item = { id: string; done: boolean }

export function useItems(initial: Item[]) {
  const [items, setItems] = useState(initial)
  const add = (item: Item) => setItems((prev) => [...prev, item])
  const toggle = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
  return { items, add, toggle }
}
```

Only the changed item is a new object; the others keep their identity. That matters later, because memoised children and effect dependencies compare by identity too.

## What belongs in state

Keep the minimum. If a value can be computed from props or other state (a filtered list, a full name, a total), compute it during render instead of storing it: a second copy has to be kept in sync, and an effect that syncs it costs an extra render.

```trace lanes
# A toy model, checked by running it in Node (npm run paths:check).
id: one-click-queue
title: One click, three updates
subtitle: A toy update queue, not React's real code
code: |
  // Toy update queue, not React's real code
  let stored = 0; // what React keeps between renders
  const queue = [];
  const setCount = (update) => queue.push(update);

  function nextRenderReadsState() {
    for (const update of queue.splice(0)) {
      stored = typeof update === "function" ? update(stored) : update;
    }
    return stored;
  }

  const count = stored; // render 1 reads its snapshot
  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount((c) => c + 1);
    console.log("handler sees", count);
  }
  handleClick(); // one click, three updates
  console.log("render 2 sees", nextRenderReadsState());
lanes:
  - { id: snap, title: "Render 1 (on screen)", hint: This render's constants and closures, tone: teal }
  - { id: stack, title: Call stack, kind: stack }
  - { id: queue, title: Update queue, hint: Waiting for the next render, kind: queue, tone: amber }
  - { id: next, title: Render 2, hint: What useState will return, tone: violet }
  - { id: out, title: Console, kind: console }
steps:
  - line: 2
    caption: "React keeps the stored value, 0, for this component between renders. In this model it's a plain variable; in React it lives on the component instance."
  - line: 13
    caption: "Render 1 reads its snapshot. count is a const set to 0 for the whole of this render, and handleClick, created in the same render, closes over it."
    state:
      snap: ["count = 0", "handleClick → count 0"]
  - line: 15
    caption: "The user clicks. handleClick runs and calls setCount(count + 1), which is setCount(0 + 1). The update joins the queue; count does not change."
    state:
      stack: [handleClick]
      queue: [{ id: u1, label: "replace with 1" }]
  - line: 16
    caption: "The second call reads the same snapshot, so it also queues \"replace with 1\". Nothing has rendered in between."
    state:
      queue: [{ id: u1, label: "replace with 1" }, { id: u2, label: "replace with 1" }]
  - line: 17
    caption: "The third call passes a function. An updater doesn't use the snapshot; React will call it with whatever the queue has produced so far."
    state:
      queue: [{ id: u1, label: "replace with 1" }, { id: u2, label: "replace with 1" }, { id: u3, label: "c => c + 1" }]
  - line: 18
    caption: Logging count still prints 0. Setting state never changes the variable you are looking at; it belongs to render 1.
    log: handler sees 0
  - line: 20
    caption: "The handler finishes. Only now does React process the queue, and it renders once for all three updates: that is batching. The user never sees a half-done state."
    state:
      stack: []
      next: [{ id: calc, label: "start from 0" }]
  - line: 8
    caption: "The two values replace the state: 1, then 1 again. The updater gets 1 and returns 2."
    state:
      queue: []
      next: [{ id: calc, label: "0 → 1 → 1 → 2" }]
  - line: 21
    caption: "In render 2, useState returns 2, and new handlers close over the new count. With three plain count + 1 calls the answer would have been 1."
    state:
      snap: []
      next: [{ id: calc, label: "count = 2" }, "handleClick → count 2"]
    log: render 2 sees 2
note: "Since React 18, updates from timers, promises and native events are batched the same way. Separate clicks are separate renders."
expect: ["handler sees 0", "render 2 sees 2"]
```
