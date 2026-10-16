---
id: react-refs
title: Refs and the DOM
summary: A box React doesn't watch, and a handle on a real node
why: "Focus, scrolling, measuring and third-party widgets all need the actual DOM node. Refs are the way to reach it, and the way to keep a value across renders without causing one."
requires: [react-hooks-rules, react-render-commit]
lesson: none
points:
  - title: A ref is a mutable box
    text: "`useRef(initial)` returns the same `{ current }` object on every render. Changing `current` does not trigger a render, and React never looks at it."
  - title: DOM refs are filled in at commit
    text: "Pass a ref to a host element and React sets `ref.current` to the DOM node during the commit, and back to `null` when the node is removed."
  - title: Not during render
    text: "Read and write refs in event handlers and effects. During render the DOM may not exist yet, and a value that changes without a render makes the output unpredictable."
quiz:
  - q: "You store a click count in `useRef` and display `{countRef.current}`. Clicking increments it. What does the screen show?"
    options: [The latest count, "The count from the last time the component rendered for another reason", An error]
    answer: 1
    explain: "Changing a ref doesn't schedule a render. The number on screen only updates when something else re-renders the component. Values you display belong in state."
  - q: "When is `inputRef.current` the input element?"
    options: [During the first render, "After React has committed it to the DOM: in effects and event handlers", Only after calling forwardRef]
    answer: 1
    explain: "During the first render the node hasn't been created. React fills the ref in during the commit, before effects run."
  - q: "In React 19, how does a function component let its parent get a ref to its inner input?"
    options: [It must use forwardRef, "It accepts `ref` as an ordinary prop and passes it to the input", It can't]
    answer: 1
    explain: "Since React 19, `ref` is a regular prop for function components. `forwardRef` still works but is no longer needed."
links:
  - { title: "Referencing values with refs (react.dev)", url: "https://react.dev/learn/referencing-values-with-refs" }
  - { title: "Manipulating the DOM with refs (react.dev)", url: "https://react.dev/learn/manipulating-the-dom-with-refs" }
  - { title: "useRef (react.dev)", url: "https://react.dev/reference/react/useRef" }
  - { title: "React 19: ref as a prop (react.dev)", url: "https://react.dev/blog/2024/12/05/react-19" }
---
Most of the time React owns the DOM and you only describe it. Some things can't be described: putting focus in an input, scrolling a row into view, measuring an element, handing a node to a charting library. For those you need the real DOM node, and a ref is how you get it. More generally, a ref is a value that persists across renders like state, but that React ignores: changing it doesn't render anything.

## Two uses of one hook

```tsx
import { useRef } from "react"

export function Search() {
  const inputRef = useRef<HTMLInputElement>(null) // will hold a DOM node
  const searches = useRef(0) // holds a plain value

  function handleClick() {
    searches.current += 1 // no render needed: the count isn't shown
    inputRef.current?.focus()
  }

  return (
    <>
      <input ref={inputRef} placeholder="Search" />
      <button onClick={handleClick}>Focus</button>
    </>
  )
}
```

`useRef` returns the same object on every render of this component instance. React sets `inputRef.current` to the `<input>` node during the commit, and back to `null` if the input is removed. `searches` is just a box: perfect for a timer id, a previous value, or a count you only send to analytics.

The test for state versus ref: if changing it should change what is on screen, it is state. If not, a ref avoids the render.

## Don't read or write refs during render

```tsx
import { useRef } from "react"

export function Bad() {
  const renders = useRef(0)
  renders.current += 1 // a side effect during render; Strict Mode doubles it
  return <p>Rendered {renders.current} times</p> // shows whatever the box held at render time
}
```

Rendering must be pure, and refs are mutable data outside the snapshot. During the first render a DOM ref is still `null`, and a value written during render can be counted twice or come from a render that was thrown away. Use refs in event handlers and effects, which run after the commit. The one accepted exception is lazy initialisation: `if (ref.current === null) ref.current = createExpensiveThing()`.

## Refs to your own components

In React 19, `ref` is an ordinary prop for function components, so passing it through is just a prop:

```tsx
import { useRef, type Ref } from "react"

function TextField({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return (
    <label>
      {label} <input ref={ref} />
    </label>
  )
}

export function Form() {
  const nameRef = useRef<HTMLInputElement>(null)
  return (
    <form onSubmit={(e) => { e.preventDefault(); nameRef.current?.focus() }}>
      <TextField label="Name" ref={nameRef} />
    </form>
  )
}
```

Older code wraps components in `forwardRef` to do the same; it still works.

## Ref callbacks

Instead of a ref object, you can pass a function. React calls it with the node when it is attached. In React 19 the callback can return a cleanup function, which React calls when the node is detached, so setting up and tearing down per node (an observer, a third-party widget) fits in one place:

```tsx
export function Watched() {
  return (
    <div
      ref={(node) => {
        if (!node) return
        const observer = new ResizeObserver(() => console.log("resized"))
        observer.observe(node)
        return () => observer.disconnect()
      }}
    />
  )
}
```

Keep the DOM work small and leave the structure to React: removing or reordering nodes that React rendered confuses the next commit.
