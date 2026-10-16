---
id: react-hooks-rules
title: Hooks, call order and closures
summary: Why hooks can't go in an if, and why handlers see old values
why: "The rules of hooks look arbitrary until you see how React stores hook state: by the order of the calls. And stale values in callbacks are ordinary JavaScript closures, one set per render."
requires: [closures, react-state]
lesson: lanes   # the trace lanes block at the end is the lesson
points:
  - title: State is stored by call order
    text: "React keeps a list of hook slots for each component instance and hands them out in the order the hooks are called. There are no names, only positions."
  - title: So call them the same way every time
    text: "Only call hooks at the top level of a component or custom hook, never in conditions, loops or after an early return, so the order can't change between renders."
  - title: Every render makes new closures
    text: "Handlers and effects created during a render close over that render's props and state. A callback kept from an earlier render keeps seeing the earlier values."
quiz:
  - q: "A component calls `useState` inside `if (showDetails)`. When `showDetails` flips to false, what goes wrong?"
    options:
      - Nothing; React matches hooks by variable name
      - "Every hook after it gets the slot of the one before, so values land in the wrong variables (React reports an error about the changed order)"
      - The skipped state is reset to its initial value
    answer: 1
    explain: "React has no way to know which call is which except their order. Skip one, and each later hook reads its neighbour's slot."
  - q: "An effect with `[]` dependencies starts `setInterval(() => console.log(count), 1000)`. You click to increase `count`. What is logged?"
    options: [The latest count, "The count from the first render, forever", An error]
    answer: 1
    explain: "The interval callback was created in the first render and closes over that render's `count`. The effect never re-runs, so it never sees a newer one. List `count` as a dependency, or use an updater function or a ref."
  - q: "Where may you call a hook?"
    options:
      - Anywhere in a component file
      - "At the top level of a function component or a custom hook (a function named `use...`)"
      - Inside event handlers, so it runs only when needed
    answer: 1
    explain: "Hooks need the component currently rendering to find their slot. Event handlers run later, outside rendering, so there is no slot to give them."
links:
  - { title: "Rules of Hooks (react.dev)", url: "https://react.dev/reference/rules/rules-of-hooks" }
  - { title: "State: a component's memory (react.dev)", url: "https://react.dev/learn/state-a-components-memory" }
  - { title: "Closures (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures" }
---
A function component is called again on every render, so its local variables are created from scratch each time. Hooks are how it remembers anything: `useState`, `useRef`, `useEffect` and the rest ask React for data it stored for this component instance. React stores that data in a list and matches calls to entries by order, which is where the rules of hooks come from. And because every render is a separate function call, every render also creates its own set of closures.

## Slots in call order

Here is a toy version of `useState` (not React's code, but the same idea), with a component that breaks the rule:

```js run
let slots = []
let cursor = 0
function useState(initial) {
  const i = cursor++
  if (!(i in slots)) slots[i] = initial
  return [slots[i], (value) => { slots[i] = value }]
}
function render(component, props) {
  cursor = 0 // every render hands out slots from the start
  return component(props)
}

function Profile({ showAge }) {
  const [name] = useState("Ada")
  if (showAge) {
    const [age] = useState(36) // a hook inside a condition: against the rules
  }
  const [theme] = useState("dark")
  return { name, theme }
}

console.log(JSON.stringify(render(Profile, { showAge: true })))
console.log(JSON.stringify(render(Profile, { showAge: false })))
```

The first render fills three slots: `"Ada"`, `36`, `"dark"`. In the second, the condition skips a call, so `theme` gets slot 1 and reads `36`. React works the same way: hooks have no names, only positions. That is why hooks must run at the top level, unconditionally, in the same order every render. React's lint rule (`eslint-plugin-react-hooks`) catches violations, and in development React warns when the order changes.

The same reasoning explains the other rule: hooks may only be called while React is rendering a component (or from a custom hook it calls), because only then does React know whose slots to use.

## One set of closures per render

```js run
let current = 0 // what useState would return for this render
const handlers = []

function Counter() {
  const count = current
  handlers.push(() => count) // like an onClick created during this render
  return count
}

Counter()
current = 1
Counter()
current = 2
Counter()
console.log(handlers.map((handler) => handler()))
```

Each call made its own `count` and its own arrow function that closed over it, so the three handlers return `[0, 1, 2]`. In React that is usually what you want: a click handler from the render on screen sees the state on screen.

It becomes a bug when a callback from an old render outlives it:

```tsx
import { useEffect, useState } from "react"

export function Ticker() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1) // always 0 + 1: this closure is from the first render
    }, 1000)
    return () => clearInterval(id)
  }, []) // the effect never re-runs, so the closure is never replaced

  return <p>{count}</p>
}
```

The counter goes to 1 and stays there. Fixes, from simplest: use an updater (`setCount((c) => c + 1)`), which doesn't need `count` at all; or list `count` in the dependencies so the effect is recreated with each new value; or read the latest value from a ref.

## Custom hooks

A function whose name starts with `use` and that calls other hooks is a custom hook. It is not a new mechanism: its hook calls simply take their slots in the calling component's list, in order. Two components using the same custom hook get independent state.

```trace lanes
# A toy model, checked by running it in Node (npm run paths:check).
id: hook-slots
title: Hook slots in call order
subtitle: A toy useState, not React's real code
code: |
  // Toy useState, not React's real code
  let slots = [];
  let cursor = 0;
  function useState(initial) {
    const i = cursor++;
    if (!(i in slots)) slots[i] = initial;
    return [slots[i], (value) => { slots[i] = value; }];
  }
  function render(component, props) {
    cursor = 0; // each render starts at slot 0
    return component(props);
  }

  function Profile({ showAge }) {
    const [name] = useState("Ada");
    if (showAge) {
      const [age] = useState(36); // a hook inside a condition: against the rules
    }
    const [theme] = useState("dark");
    return { name, theme };
  }

  console.log(JSON.stringify(render(Profile, { showAge: true })));
  console.log(JSON.stringify(render(Profile, { showAge: false })));
lanes:
  - { id: stack, title: Call stack, kind: stack }
  - { id: slots, title: "Profile's slots", hint: "Stored by position, no names", tone: violet }
  - { id: vars, title: This render's variables, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - line: 2
    caption: "React keeps a list of slots per component instance and a cursor that says which slot the next hook call gets. Both start empty."
  - line: 10
    caption: "The first render resets the cursor to 0 and calls Profile with showAge: true."
    state:
      stack: [render, "Profile({ showAge: true })"]
  - line: 15
    caption: "The first useState call takes slot 0. It is empty, so it stores \"Ada\" there, and name gets \"Ada\"."
    state:
      slots: [{ id: s0, label: "0: \"Ada\"" }]
      vars: [{ id: v-name, label: "name = \"Ada\"" }]
  - line: 17
    caption: "showAge is true, so the hook inside the if runs and takes slot 1, which stores 36."
    state:
      slots: [{ id: s0, label: "0: \"Ada\"" }, { id: s1, label: "1: 36" }]
      vars: [{ id: v-name, label: "name = \"Ada\"" }, { id: v-age, label: "age = 36" }]
  - line: 19
    caption: "The third call takes slot 2 and stores \"dark\". Three calls, three slots, all where we expect."
    state:
      slots: [{ id: s0, label: "0: \"Ada\"" }, { id: s1, label: "1: 36" }, { id: s2, label: "2: \"dark\"" }]
      vars: [{ id: v-name, label: "name = \"Ada\"" }, { id: v-age, label: "age = 36" }, { id: v-theme, label: "theme = \"dark\"" }]
  - line: 23
    caption: The first render returns name and theme correctly.
    state:
      stack: []
    log: '{"name":"Ada","theme":"dark"}'
  - line: 24
    caption: "The second render calls Profile with showAge: false. Its local variables are gone; only the slots survive between renders."
    state:
      stack: [render, "Profile({ showAge: false })"]
      vars: []
  - line: 15
    caption: "The first call gets slot 0 again. It is already filled, so the initial value is ignored and name is \"Ada\"."
    state:
      vars: [{ id: v-name, label: "name = \"Ada\"" }]
  - line: 19
    caption: "The if is skipped, so the theme call is now the second call. It gets slot 1, which holds 36. Nothing tells it this slot belonged to age."
    state:
      slots: [{ id: s0, label: "0: \"Ada\"" }, { id: s1, label: "1: 36", tone: rose }, { id: s2, label: "2: \"dark\"", tone: muted }]
      vars: [{ id: v-name, label: "name = \"Ada\"" }, { id: v-theme, label: "theme = 36", tone: rose }]
  - line: 24
    caption: "theme comes out as 36. Real React matches hooks by order the same way, so hooks must run at the top level, in the same order every render. In development React warns when the order changes."
    state:
      stack: []
    log: '{"name":"Ada","theme":36}'
expect: ['{"name":"Ada","theme":"dark"}', '{"name":"Ada","theme":36}']
```
