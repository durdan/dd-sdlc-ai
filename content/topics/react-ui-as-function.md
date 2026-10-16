---
id: react-ui-as-function
title: UI as a function of state
summary: Describe the screen for this state; React makes it so
why: "Every React rule (pure components, immutable state, effects kept out of render) follows from one idea: a component computes a description of the UI, and React, not your code, changes the page."
lesson: none
points:
  - title: Components return descriptions
    text: "A component is a function that takes props and returns elements: plain objects saying what should be on screen. JSX is syntax for building them."
  - title: React owns the DOM
    text: "You don't add, remove or edit DOM nodes. You change state, React calls your components again, and it updates the page to match what they returned."
  - title: Rendering must be pure
    text: "Same props, state and context in, same elements out, and no side effects on the way. React may call a component more often than you expect, and relies on this."
quiz:
  - q: "What does `<Greeting name=\"Ada\" />` evaluate to?"
    options: [A DOM element, "A plain object describing a `Greeting` element with its props", The HTML string the component renders]
    answer: 1
    explain: "JSX compiles to a function call that returns an element object (`type`, `props`, `key`). React decides later whether and when to call `Greeting` and turn its result into DOM."
  - q: "A component increments a module-level counter each time it runs and shows the count. In development with Strict Mode, what do you see?"
    options: [The correct count, "A count that goes up by two per render, because React renders twice in development to expose impure components", An error]
    answer: 1
    explain: "Strict Mode calls components an extra time in development. A pure component gives the same result both times; one that mutates outside data shows the bug immediately."
  - q: "Where should code that changes the DOM directly, such as focusing an input, go?"
    options: [In the component body, "In an event handler or an effect, after React has committed the DOM", In a key prop]
    answer: 1
    explain: "The component body only computes what to show. Side effects belong in event handlers (for things the user did) or effects (for syncing with something outside React)."
links:
  - { title: "Keeping components pure (react.dev)", url: "https://react.dev/learn/keeping-components-pure" }
  - { title: "Thinking in React (react.dev)", url: "https://react.dev/learn/thinking-in-react" }
  - { title: "<StrictMode> (react.dev)", url: "https://react.dev/reference/react/StrictMode" }
---
In React you don't write the steps that change the page ("find the list, append an item, update the counter"). You write components: functions that, given some data, return a description of what the screen should look like. When the data changes, React calls your components again, compares the new description with the previous one, and updates the DOM to match. Your job is the mapping from state to UI; React's job is getting there.

## JSX builds plain objects

```tsx
function Greeting({ name }: { name: string }) {
  return <p className="greet">Hello, {name}</p>
}

const element = <Greeting name="Ada" />
```

A JSX tag compiles to a function call (`jsx(Greeting, { name: "Ada" })` with the modern transform) that returns an element: a small object with a `type`, `props` and an optional `key`. Creating it does not call `Greeting` and does not touch the DOM. Here is the idea with a stand-in for `jsx` (a toy, not React's real function):

```js run
const jsx = (type, props) => ({ type, props })

function Greeting({ name }) {
  return jsx("p", { className: "greet", children: ["Hello, ", name] })
}

const element = jsx(Greeting, { name: "Ada" })
console.log(JSON.stringify(element.props))
console.log(JSON.stringify(Greeting(element.props)))
```

The element for `<Greeting />` just records the function and its props. Only when React renders it does it call `Greeting`, getting back another description, this time of a `p`. React keeps going until it reaches host elements like `p` and `div`, which it knows how to create in the DOM.

## State in, UI out

Because the output depends only on the inputs, the same component handles every state:

```tsx
type Props = { items: string[]; loading: boolean }

function List({ items, loading }: Props) {
  if (loading) return <p>Loading...</p>
  if (items.length === 0) return <p>Nothing yet</p>
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
```

There is no code for moving from "loading" to "three items". Each render describes the target, and React works out the DOM changes. That removes a whole class of bugs where the page ends up in a state no code path intended, because the steps were applied in an unexpected order.

## Purity is the contract

React can only treat a component as a description if calling it has no side effects and gives the same result for the same inputs. So during render:

- Don't change variables or objects that existed before the call (props, state, module-level data).
- Don't touch the DOM, start timers, send requests or log analytics.
- Do create new local variables and objects freely; that's not a side effect.

React relies on this. It may render a component and throw the result away, render parts of the tree in a different order, or pause and resume (see transitions). In development, `<StrictMode>` calls every component twice to make impure ones misbehave visibly. Side effects belong in event handlers, which run because the user did something, or in effects, which run after React has updated the page.
