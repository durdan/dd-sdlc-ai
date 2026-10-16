---
id: react-reconciliation
title: Reconciliation and keys
summary: How React matches the new tree to the old one
why: "Whether a component keeps its state, and whether a DOM node is reused or rebuilt, is decided by its type and position in the tree, and by its key. Wrong keys cause the strangest bugs in React."
requires: [react-render-commit]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Same type, same place, same component
    text: "If an element has the same type at the same position as last render, React keeps the component instance, its state and its DOM node, and only updates the props."
  - title: Different type, start over
    text: "A different type at a position (a `div` becoming a `section`, or `<A>` becoming `<B>`) unmounts the old subtree with all its state and mounts a fresh one."
  - title: Keys identify list items
    text: "In a list, the key, not the index, says which item is which. Stable keys from the data let React move items with their state; index keys attach state to positions."
quiz:
  - q: "A list of todos uses `key={index}`, and each row has an uncontrolled checkbox. You delete the first todo. What goes wrong?"
    options:
      - Nothing
      - "The checkbox states shift: the row that was second now shows the first row's checked state"
      - React throws a duplicate key error
    answer: 1
    explain: "With index keys, React matches rows by position. After the delete, key 0 is the old second todo, but the component and DOM node that had key 0 (and its checkbox state) are reused for it."
  - q: "How do you make a form forget its local state when the user switches to editing a different contact?"
    options: ["Call a reset function in an effect", "Render it with `key={contact.id}`, so a new id is a new component", "Use `memo`"]
    answer: 1
    explain: "A different key at the same position is a different component to React, so the old one unmounts with its state and a fresh one mounts."
  - q: "A component renders `{isAdmin ? <AdminPanel /> : <UserPanel />}` and the flag flips. What happens to `UserPanel`'s state?"
    options: ["It is passed to `AdminPanel`", "It is lost: a different type at that position unmounts the old component", It is kept for when the flag flips back]
    answer: 1
    explain: "Different component types never share state. Flipping back mounts a new `UserPanel`, starting from its initial state."
links:
  - { title: "Preserving and resetting state (react.dev)", url: "https://react.dev/learn/preserving-and-resetting-state" }
  - { title: "Rendering lists: keys (react.dev)", url: "https://react.dev/learn/rendering-lists" }
---
After a render, React has two trees: what is on screen and what your components just returned. Reconciliation is how it matches them up. Comparing two arbitrary trees perfectly is expensive, so React uses simple rules: elements are matched by their position among their siblings and by their type, and in lists by their `key`. A match keeps the component, its state and its DOM node; anything else is torn down and built again.

## Type and position

```tsx
import { useState } from "react"

function Field({ label }: { label: string }) {
  const [text, setText] = useState("")
  return (
    <label>
      {label} <input value={text} onChange={(e) => setText(e.target.value)} />
    </label>
  )
}

export function Form({ business }: { business: boolean }) {
  return business ? <Field label="Company" /> : <Field label="Name" />
}
```

Toggling `business` keeps whatever was typed: both branches put a `Field` at the same position, so React sees one component whose `label` prop changed. React tracks positions in the tree, not where the JSX was written in your file.

Change one branch to wrap the field in a `<div>`, or to render a different component, and the types at that position differ. React unmounts the old subtree (its state, its DOM nodes, its effects' cleanups run) and mounts a new one. This is also why you should never define a component inside another component's body: each render creates a new function, so the type is different every time and its state resets on every render.

## Keys in lists

A list is a set of siblings, and positions shift when items are added, removed or reordered. A key tells React which item is which:

```tsx
type Todo = { id: string; text: string }

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input type="checkbox" /> {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

With `key={todo.id}`, deleting the first todo removes exactly that `li`; the others keep their DOM nodes, including whether their checkbox is ticked. With `key={index}`, React sees keys 0, 1, 2 become 0, 1. It keeps the first two rows, gives them new text, and removes the last one. The ticked checkbox that belonged to the deleted todo now sits next to a different todo's text.

Rules for keys:

- Use a stable id from the data. The index is only safe if the list never reorders, filters or has items inserted.
- Keys need to be unique among siblings, not globally.
- Never generate them during render (`key={Math.random()}`): every render then looks like a new list, and every item is rebuilt and loses its state.

## Keys to reset on purpose

A key works outside lists too. `<ContactForm key={contact.id} contact={contact} />` makes a new contact a new component, so the form's drafts and errors reset without any effect or reset logic.

## What it costs

Reconciliation compares elements, not DOM nodes, so it is cheap. The expensive mistakes are the ones that make it give up: a changing type or key forces a remount, and a remount runs every component below it, recreates its DOM and loses its state.

```trace diagram
id: type-position
title: Type and position
subtitle: Form toggles business, and the field's typed text...
groups:
  - { id: before, label: Last render }
  - { id: after, label: This render }
elements:
  - { id: old, label: "<Field label=\"Name\">", sub: "state: text = \"Ada\"", group: before, row: 0 }
  - { id: same, label: "<Field label=\"Company\">", sub: "same type: text is still \"Ada\"", group: after, row: 1 }
  - { id: wrapped, label: "<div><Field /></div>", sub: "different type: text = \"\"", group: after, tone: external, row: 1, role: service }
edges:
  - { id: keep, from: old, to: same, label: "same type, same place: update props" }
  - { id: remount, from: old, to: wrapped, label: "div ≠ Field: unmount, mount", style: dashed, flow: main }
steps:
  - caption: "After a render React has two trees: what is on screen and what your components just returned. It matches them by position among siblings and by type."
    focus: [old]
  - caption: "Both branches of the ternary put a Field at the same position. React sees one component whose label prop changed, so it keeps the instance, its state and its input. The typed \"Ada\" stays."
    focus: [old, same]
    trace: [keep]
  - caption: "If one branch wraps the Field in a div, the type at that position differs. React unmounts the old subtree, with its state and DOM, and mounts a new one from scratch."
    focus: [old, wrapped]
    trace: [remount]
  - caption: "React only sees the tree you return, not where the JSX was written. A component defined inside another one is a new type on every render, so it resets every time."
```

```trace diagram
id: stable-keys
title: Keys from the data
subtitle: "key={todo.id}, then delete the first todo"
groups:
  - { id: before, label: Before }
  - { id: after, label: After }
elements:
  - { id: oa, label: "key a: Buy milk", sub: checkbox ticked, group: before, row: 0 }
  - { id: ob, label: "key b: Walk dog", group: before, row: 0 }
  - { id: oc, label: "key c: Pay rent", group: before, row: 0 }
  - { id: nb, label: "key b: Walk dog", sub: same li, group: after, row: 1 }
  - { id: nc, label: "key c: Pay rent", sub: same li, group: after, row: 1 }
  - { id: gone, label: Removed, sub: "li a and its ticked box", kind: component, tone: neutral, row: 1 }
edges:
  - { id: kb, from: ob, to: nb }
  - { id: kc, from: oc, to: nc }
  - { id: ka, from: oa, to: gone, style: dashed, flow: main }
steps:
  - caption: "Three todos, each li keyed by its id. The user has ticked the uncontrolled checkbox on Buy milk."
    focus: [before]
  - caption: Buy milk is deleted. React finds no key a among the new children, so it removes that li, and its ticked checkbox goes with it.
    focus: [oa, gone]
    trace: [ka]
  - caption: "Keys b and c are still there, so React matches them to their old components and keeps their DOM nodes. They only moved up."
    focus: [ob, oc, nb, nc]
    trace: [kb, kc]
  - caption: "No row's checkbox changed. A stable key from the data lets an item keep its state wherever it moves."
    focus: [after]
```

```trace diagram
id: index-keys
title: Index as the key
subtitle: "key={index}, then delete the first todo"
groups:
  - { id: before, label: Before }
  - { id: after, label: After }
elements:
  - { id: o0, label: "key 0: Buy milk", sub: checkbox ticked, group: before, row: 0 }
  - { id: o1, label: "key 1: Walk dog", group: before, row: 0 }
  - { id: o2, label: "key 2: Pay rent", group: before, row: 0 }
  - { id: n0, label: "key 0: Walk dog", sub: "still ticked!", group: after, tone: external, row: 1, role: service }
  - { id: n1, label: "key 1: Pay rent", sub: new text, group: after, row: 1 }
  - { id: gone, label: Removed, sub: "li 2, Pay rent's old row", kind: component, tone: neutral, row: 1 }
edges:
  - { id: k0, from: o0, to: n0, label: "reused for Walk dog", style: dashed, flow: main }
  - { id: k1, from: o1, to: n1, label: kept }
  - { id: k2, from: o2, to: gone, style: dashed, flow: main }
steps:
  - caption: "The same list keyed by index. The keys say nothing about which todo is which, only where it is."
    focus: [before]
  - caption: "After deleting Buy milk, the new children have keys 0 and 1. Key 2 is missing, so React removes the last li: the one that showed Pay rent."
    focus: [o2, gone]
    trace: [k2]
  - caption: Key 1 matches, so the Walk dog row's component and li are reused and given the text Pay rent.
    focus: [o1, n1]
    trace: [k1]
  - caption: "Key 0 matches too. The li that had Buy milk, and its ticked checkbox, is reused for Walk dog. Walk dog now looks done, though nobody ticked it."
    focus: [o0, n0]
    trace: [k0]
  - caption: "Index keys attach state to positions. They are only safe if the list never reorders, filters or has items inserted; otherwise use an id from the data."
    focus: [n0]
```
