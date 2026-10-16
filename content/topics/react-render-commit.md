---
id: react-render-commit
title: Rendering vs committing
summary: Calling components, then touching the DOM
why: "\"Re-render\" does not mean \"redraw\". Knowing that rendering only calls functions, and that the DOM changes later and only where needed, tells you what is actually expensive."
requires: [react-ui-as-function]
lesson: none
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
