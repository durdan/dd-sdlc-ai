---
id: react-render-commit
title: Rendering vs committing
summary: Calling components, then touching the DOM
why: "\"Re-render\" does not mean \"redraw\". Knowing that rendering only calls functions, and that the DOM changes later and only where needed, tells you what is actually expensive."
requires: [react-ui-as-function]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Trigger
    text: "A render starts for two reasons: the first mount (`root.render`), or a state update in some component. Props never change on their own; a parent re-rendering passes new ones."
  - title: Render
    text: "React calls the component that changed, then the components it returns, recursively. The result is a new tree of elements. Nothing on screen changes yet."
  - title: Commit
    text: "React compares the new tree with the previous one and applies the minimum DOM changes, all at once. Refs are attached, then effects run, and the browser paints."
quiz:
  - q: "A parent re-renders because its state changed. What happens to a child that receives exactly the same props?"
    options: [It is skipped automatically, "It is rendered again by default, because React renders the whole subtree below the update", It is unmounted and mounted again]
    answer: 1
    explain: "By default a re-render goes down the whole subtree. If nothing in the child's output changed, the commit makes no DOM changes for it. `memo` (or the React Compiler) is how you skip the render itself."
  - q: "A component re-renders but returns the same JSX as before. What does React do to the DOM?"
    options: [Replaces the nodes with identical ones, Nothing, "Re-applies every attribute"]
    answer: 1
    explain: "The commit only touches DOM nodes that differ from the previous render. An input keeps its focus and typed text across such re-renders."
  - q: "Why must rendering be free of side effects, if the DOM only changes in the commit?"
    options:
      - It doesn't need to be
      - "React may render without committing: it can discard, repeat or interrupt a render, so side effects there could run with no matching screen change, or several times"
      - Side effects make the commit slower
    answer: 1
    explain: "Strict Mode renders twice in development, transitions can be interrupted and restarted, and Suspense can abandon a render. Only the commit is guaranteed to correspond to what the user sees."
links:
  - { title: "Render and commit (react.dev)", url: "https://react.dev/learn/render-and-commit" }
  - { title: "Synchronizing with effects (react.dev)", url: "https://react.dev/learn/synchronizing-with-effects" }
---
Updating the screen in React happens in three steps. Something triggers a render; React renders, which means calling your components to find out what the UI should now be; and React commits, which means changing the DOM where the new result differs from the old one. Only after the commit does the browser paint the change. Rendering is just running JavaScript; committing is the only part that touches the page.

## Trigger

There are two triggers: the initial `root.render(<App />)`, and a state update (a `set` function from `useState` or `useReducer`, or a context value change). Props are not a trigger of their own: a child gets new props because its parent rendered again.

## Render

React calls the component whose state changed. Whatever it returns contains more components, so React calls those, and so on down to host elements like `div`. By default every component below the update renders again, whether or not its props changed.

```tsx
import { useState } from "react"

function Clock({ label }: { label: string }) {
  return <p>{label}</p> // rendered again on every click, though label never changes
}

export function Counter() {
  const [n, setN] = useState(0)
  return (
    <>
      <button onClick={() => setN(n + 1)}>Clicked {n} times</button>
      <Clock label="static" />
    </>
  )
}
```

This sounds wasteful, but rendering a component is usually a cheap function call. React renders first so that it can compare; work is only expensive when a component does a lot in its body, or when a huge subtree renders on every keystroke. Then you can skip renders with memoisation.

## Commit

With the new tree in hand, React works out what changed (see reconciliation) and applies the changes to the DOM in one go: in the example, only the button's text node. The `<p>static</p>` element is left alone. This is why focus, scroll position, text selection and half-typed input survive re-renders: the DOM nodes are the same nodes.

After the DOM is updated, React attaches refs and runs layout effects, then the browser can paint. Regular effects (`useEffect`) usually run after the paint, although for updates caused by a click or keypress React may run them before the paint, so their results are visible together.

## Why the split matters

- **Rendering can be thrown away.** React may render a tree and not commit it: Strict Mode renders twice in development, a transition can be interrupted by an urgent update and restarted, and a tree that suspends may never be shown. Anything you do during render must be safe to repeat or discard.
- **The DOM is consistent.** All changes from one render are committed together, so the user never sees half an update.
- **"Re-render" is not "repaint".** A component can render a hundred times without the DOM changing, and that's often fine. Measure with the React DevTools Profiler before optimising.

```trace diagram
id: one-update
title: One click, start to paint
subtitle: The Counter example, after setN(n + 1)
groups:
  - { id: render, label: Render (just JavaScript) }
  - { id: commit, label: Commit (touches the DOM) }
elements:
  - { id: trigger, label: Trigger, sub: "setN(n + 1) in onClick", kind: person, row: 0 }
  - { id: counter, label: "Counter()", sub: its state changed, group: render, row: 1 }
  - { id: clock, label: "Clock()", sub: "same props, called anyway", group: render, row: 2 }
  - { id: diff, label: Compare trees, sub: works out the minimal changes, group: render, row: 3 }
  - { id: thrown, label: Thrown away, sub: "Strict Mode, interrupted, suspended", kind: component, tone: neutral, row: 3 }
  - { id: mutate, label: DOM changes, sub: only the button's text, group: commit, row: 4 }
  - { id: layout, label: Refs and layout effects, sub: "useLayoutEffect, before paint", group: commit, row: 5 }
  - { id: paint, label: Browser paints, kind: external, row: 6, role: client }
  - { id: effects, label: Effects, sub: "useEffect, usually after paint", kind: component, tone: stream, row: 7, role: service }
edges:
  - { id: queue, from: trigger, to: counter, label: queues a render }
  - { id: child, from: counter, to: clock }
  - { id: tree, from: clock, to: diff }
  - { id: discard, from: counter, to: thrown, label: may never commit, style: dotted, flow: main }
  - { id: apply, from: diff, to: mutate, label: all at once }
  - { id: attach, from: mutate, to: layout }
  - { id: show, from: layout, to: paint }
  - { id: after, from: paint, to: effects }
steps:
  - caption: "A click calls setN. That doesn't change anything yet: it queues a render of Counter, the component that owns the state."
    focus: [trigger, counter]
    trace: [queue]
  - caption: "Rendering means calling functions. React calls Counter, which returns a button and a Clock element."
    focus: [counter]
  - caption: "React then calls Clock too, although its label never changes. By default everything below the update renders again; memo is how you skip it."
    focus: [counter, clock]
    trace: [child]
  - caption: React compares the new element tree with the previous one and works out the minimal DOM changes. Still nothing on screen has changed.
    focus: [clock, diff]
    trace: [tree]
  - caption: "A render can be thrown away: Strict Mode renders twice in development, a transition can be interrupted, a tree can suspend. That is why rendering must have no side effects."
    focus: [counter, thrown]
    trace: [discard]
  - caption: "The commit applies every change from this render in one go. Here that is a single text node in the button; the p from Clock is left alone, so focus and typed text survive."
    focus: [diff, mutate]
    trace: [apply]
  - caption: "With the DOM updated, React attaches refs and runs layout effects. They run before the browser paints, so they can measure the new layout."
    focus: [mutate, layout]
    trace: [attach]
  - caption: The browser paints the new frame. This is the first moment the user sees the change.
    focus: [layout, paint]
    trace: [show]
  - caption: "Regular effects usually run after the paint. For an update caused by a click or a keypress, React may run them before the paint instead."
    focus: [paint, effects]
    trace: [after]
  - caption: "So a re-render is cheap function calls plus a comparison, and only the commit touches the page. Many renders with no DOM changes are often fine."
```
