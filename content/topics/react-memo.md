---
id: react-memo
title: "Memoisation: memo, useMemo, useCallback"
summary: Skipping work whose inputs haven't changed
why: "Memoisation sprinkled everywhere makes code harder to read and often saves nothing; missing in the one hot spot, it leaves a list re-rendering on every keystroke. The React Compiler now does much of it for you."
requires: [react-render-commit, react-hooks-rules]
lesson: diagram
points:
  - title: memo skips a component
    text: "A component wrapped in `memo` is not rendered again when its parent renders, if every prop is `Object.is`-equal to last time."
  - title: useMemo and useCallback keep values stable
    text: "`useMemo` caches a computed value and `useCallback` a function, until a dependency changes. They help when the value is expensive, or when its identity is a prop of a memoised child or a dependency of an effect."
  - title: Identity is the whole game
    text: "A new object, array or arrow function created during render is a new value every time, which defeats `memo` and re-runs effects. That's what the hooks are for."
  - title: The compiler does it automatically
    text: "React Compiler (1.0 since October 2025) memoises components and values at build time. In a project that uses it, most hand-written memoisation is unnecessary."
quiz:
  - q: "`Row` is wrapped in `memo`. The parent renders `<Row item={item} onSelect={() => select(item.id)} />`. Does `memo` skip Row's re-renders?"
    options: [Yes, "No: the arrow function is a new value on every render, so a prop always changed", Only in production]
    answer: 1
    explain: "`memo` compares props one by one with `Object.is`. A fresh function is never equal to the previous one. Wrap it in `useCallback` (or let the compiler) to keep its identity."
  - q: "When does `useMemo(() => items.filter(fn), [items, fn])` actually save time?"
    options:
      - Always
      - "When filtering is expensive, or when the result is passed to something that compares by identity, and the inputs often stay the same between renders"
      - Only on the first render
    answer: 1
    explain: "Memoising has its own cost: storing the value and comparing dependencies. For a cheap calculation over a small list it can be slower than just recomputing."
  - q: "If your app breaks when you remove a `useMemo`, what does that tell you?"
    options: [That the useMemo is important, "That the code depends on memoisation for correctness, which React doesn't guarantee; fix the underlying problem", Nothing]
    answer: 1
    explain: "React may throw away cached values. `useMemo` and `memo` are performance hints; correctness has to come from the code itself."
links:
  - { title: "memo (react.dev)", url: "https://react.dev/reference/react/memo" }
  - { title: "useMemo (react.dev)", url: "https://react.dev/reference/react/useMemo" }
  - { title: "useCallback (react.dev)", url: "https://react.dev/reference/react/useCallback" }
  - { title: "React Compiler (react.dev)", url: "https://react.dev/learn/react-compiler" }
---
By default, when a component renders, everything below it renders too, and every expression in every component body runs again. Usually that's fine. When it isn't, memoisation lets React skip work whose inputs haven't changed: `memo` skips rendering a component, `useMemo` skips recomputing a value, and `useCallback` keeps a function the same between renders. All three compare inputs with `Object.is`, so they only work if the inputs keep their identity.

## memo: skip a child

```tsx
import { memo, useCallback, useState } from "react"

type Item = { id: string; label: string }

const Row = memo(function Row({ item, onSelect }: { item: Item; onSelect: (id: string) => void }) {
  return <li onClick={() => onSelect(item.id)}>{item.label}</li>
})

export function List({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = useCallback((id: string) => setSelected(id), [])

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>Selected: {selected}</p>
      <ul>
        {items.map((item) => (
          <Row key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </ul>
    </>
  )
}
```

Typing in the input re-renders `List`. Each `Row` gets the same `item` object and the same `handleSelect` function as before, so `memo` skips it. Without `useCallback`, `handleSelect` would be a new function on every keystroke and every row would render again, `memo` or not. Note that `memo` only looks at props: a memoised component still renders when its own state changes or a context it reads changes.

## useMemo: skip a calculation

```tsx
import { useMemo } from "react"

type Product = { name: string; price: number }

export function Results({ products, query }: { products: Product[]; query: string }) {
  const matches = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  )
  return <p>{matches.length} matches</p>
}
```

Worth it if `products` has tens of thousands of entries and the component renders often for unrelated reasons. For a hundred items, the filter takes microseconds and the memoisation adds code for nothing. Measure before you decide: wrap the calculation in `console.time`, or use the Profiler in React DevTools.

## When memoisation helps

- A component that is slow to render, re-rendering often with the same props.
- A value or function passed to a memoised child, where a new identity would defeat its `memo`.
- A value used as an effect dependency, where a new identity would re-run the effect.
- A calculation that is measurably expensive.

Before reaching for it, check the structural fixes. Move state down into the component that uses it, so fewer components render on each change. Pass components as `children`: if a parent's state changes, elements it received as `children` were created by its own parent and don't render again.

## The React Compiler

React Compiler, stable since version 1.0 in October 2025, is a build-time plugin that analyses components and inserts the equivalent of `memo`, `useMemo` and `useCallback` where they are safe. It relies on your code following the rules of React (pure render, hooks at the top level, no mutation of props and state); code that breaks them is skipped. In a project that uses it, write plain code and keep manual memoisation for the rare case the compiler can't handle. Either way, memoisation is an optimisation: React may discard cached values, so the program must behave correctly without them.

```trace diagram
id: memo-props
title: Does memo skip the row?
subtitle: "Typing re-renders List; each Row is wrapped in memo"
elements:
  - { id: typing, label: Typing, sub: "setQuery on each key", kind: person, row: 0 }
  - { id: list, label: List renders, sub: its whole body runs again, kind: system, row: 1 }
  - { id: item, label: item, sub: same object from items, kind: component, tone: neutral, row: 2 }
  - { id: inline, label: "() => select(id)", sub: a new function every render, kind: component, tone: neutral, row: 2 }
  - { id: callback, label: useCallback, sub: same function until deps change, kind: component, row: 2 }
  - { id: usememo, label: useMemo, sub: same object or array until deps change, kind: component, row: 2 }
  - { id: compare, label: memo compares props, sub: "each one with Object.is", row: 3 }
  - { id: rerender, label: Row renders, sub: memo saved nothing, tone: external, row: 4, role: service }
  - { id: skip, label: Row skipped, sub: reuses its last output, tone: data, row: 4, role: service }
  - { id: own, label: Own state or context, sub: memo doesn't look at these, kind: external, row: 3, role: data }
edges:
  - { id: type, from: typing, to: list }
  - { id: pass-item, from: list, to: item }
  - { id: make-inline, from: list, to: inline }
  - { id: make-cb, from: list, to: callback }
  - { id: make-memo, from: list, to: usememo }
  - { id: item-in, from: item, to: compare }
  - { id: inline-in, from: inline, to: compare }
  - { id: cb-in, from: callback, to: compare }
  - { id: memo-in, from: usememo, to: compare }
  - { id: changed, from: compare, to: rerender, label: one prop differs }
  - { id: equal, from: compare, to: skip, label: all equal }
  - { id: bypass, from: own, to: rerender, style: dashed, flow: main }
steps:
  - caption: "Each keystroke sets query, so List renders again. By default every component below it renders too, and every expression in List's body runs again."
    focus: [typing, list]
    trace: [type]
  - caption: "Row is wrapped in memo. Before rendering it, React compares each new prop with the last one using Object.is."
    focus: [compare]
  - caption: "The item prop comes from the items array, which didn't change. It is the same object as last time, so it is equal."
    focus: [list, item, compare]
    trace: [pass-item, item-in]
  - caption: "An inline arrow as onSelect is created fresh on every render. A new function is never equal to the old one, so Row renders anyway."
    focus: [list, inline, compare, rerender]
    trace: [make-inline, inline-in, changed]
  - caption: "useCallback returns the same function until its dependencies change. Now every prop is equal, and React skips Row and reuses its last output."
    focus: [list, callback, compare, skip]
    trace: [make-cb, cb-in, equal]
  - caption: "Objects and arrays built during render have the same problem. useMemo keeps their identity, and skips the calculation, until a dependency changes."
    focus: [list, usememo, compare, skip]
    trace: [make-memo, memo-in, equal]
  - caption: "memo only looks at props. If Row's own state changes, or a context it reads, it renders whatever its props are."
    focus: [own, rerender]
    trace: [bypass]
  - caption: "The React Compiler inserts the equivalent of these hooks at build time. Either way memoisation is a hint: React may drop cached values, so the code must work without it."
```
