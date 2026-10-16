---
id: react-effects
title: Effects and their dependencies
summary: Keeping a component in sync with something outside React
why: "Effects are the most misused part of React. Used for what they're for, they keep subscriptions and connections correct; used to move data around, they cause extra renders, loops and race conditions."
requires: [react-hooks-rules]
lesson: none
points:
  - title: For syncing with the outside
    text: "An effect connects a component to a system React doesn't control: a socket, a browser API, a third-party widget, a subscription. It runs after the commit."
  - title: Setup, cleanup, repeat
    text: "React runs the setup after the component appears, the cleanup before it re-runs with new dependencies or disappears. In development Strict Mode runs an extra setup and cleanup to prove they match."
  - title: Dependencies are not a choice
    text: "List every reactive value the effect reads. React compares each with `Object.is` and re-runs the effect when one changes. To run less often, make the code need fewer values."
  - title: Not for derived data or events
    text: "Compute values during render, and put logic caused by a click in the click handler. An effect for either one costs an extra render and is easy to get wrong."
quiz:
  - q: "A component stores `fullName` in state and updates it in an effect whenever `first` or `last` changes. What is the better approach?"
    options: [Add more dependencies, "Compute `const fullName = first + \" \" + last` during render", Use useLayoutEffect]
    answer: 1
    explain: "Derived values don't need state or effects. The effect version renders once with a stale `fullName`, then again with the right one."
  - q: "In development, your effect connects to a chat room, and you see connect, disconnect, connect on mount. Why?"
    options: [A bug in React, "Strict Mode runs setup, cleanup and setup again to check that your cleanup undoes the setup", The dependencies are wrong]
    answer: 1
    explain: "It only happens in development. If the extra cycle causes a visible problem, the cleanup is missing or incomplete, and the same bug would appear when dependencies change in production."
  - q: "An effect depends on `options`, an object created in the component body. What happens?"
    options:
      - It runs once
      - "It runs after every render, because each render creates a new object and `Object.is` sees a change"
      - React compares the object's fields
    answer: 1
    explain: "Dependencies are compared by identity. Create the object inside the effect, depend on its primitive fields, or memoise it."
links:
  - { title: "Synchronizing with effects (react.dev)", url: "https://react.dev/learn/synchronizing-with-effects" }
  - { title: "You might not need an effect (react.dev)", url: "https://react.dev/learn/you-might-not-need-an-effect" }
  - { title: "useEffect (react.dev)", url: "https://react.dev/reference/react/useEffect" }
  - { title: "Lifecycle of reactive effects (react.dev)", url: "https://react.dev/learn/lifecycle-of-reactive-effects" }
---
Rendering must be pure, but components sometimes have to do things: open a connection, subscribe to an event, control a video element, start an animation in a non-React library. An effect is code that runs after React has committed a render, to keep something outside React in sync with the component's current props and state. Each effect has a setup, an optional cleanup that undoes it, and a list of the values it depends on.

## The shape of an effect

```tsx
import { useEffect, useState } from "react"

type Connection = { connect(): void; disconnect(): void; on(event: string, fn: (msg: string) => void): void }
declare function createConnection(roomId: string): Connection

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const conn = createConnection(roomId)
    conn.on("message", (msg) => setMessages((prev) => [...prev, msg]))
    conn.connect()
    return () => conn.disconnect() // cleanup: undo exactly what setup did
  }, [roomId])

  return <ul>{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>
}
```

React runs the setup after the room first appears on screen. When `roomId` changes, it runs the cleanup with the old values (disconnect from the old room), then the setup with the new ones. When the component unmounts, it runs the cleanup one last time. In development, Strict Mode runs one extra setup-and-cleanup cycle right after mounting: if that breaks something, the cleanup is incomplete. Effects only run in the browser, never during server rendering.

## Dependencies

The dependency array is a description of the code, not a setting: every prop, state variable and value computed from them that the effect reads must be listed, and the lint rule checks it. After each render, React compares each dependency with its previous value using `Object.is` and re-runs the effect if any changed. With no array, the effect runs after every render; with `[]`, only on mount and unmount.

If an effect runs too often, change the code, not the list:

- An object or function created during render is new every time. Create it inside the effect, depend on its primitive fields, or memoise it.
- If the effect only needs state to compute the next state, use an updater (`setX((x) => ...)`) and drop the dependency.
- For a value the effect needs to read but shouldn't react to, such as the current theme used when logging, React 19.2 added `useEffectEvent`.

## What effects are not for

Many effects shouldn't exist:

- **Derived data.** A filtered list or a total is a calculation; do it during render (memoised if it is slow).
- **Events.** "When the user clicks Buy, send the order" belongs in the click handler. An effect that watches a `submitted` flag fires again on remount, and it loses the information about what caused it.
- **Resetting state when a prop changes.** Give the component a `key` instead.
- **Chains of effects** that set state which triggers other effects: each link is an extra render.

## Fetching in an effect

If you fetch in an effect, handle responses that arrive out of order:

```tsx
import { useEffect, useState } from "react"

type User = { id: string; name: string }

export function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let ignore = false
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data: User) => {
        if (!ignore) setUser(data)
      })
    return () => {
      ignore = true // a newer userId has taken over; drop this response
    }
  }, [userId])

  return <p>{user ? user.name : "Loading..."}</p>
}
```

Without the flag, a slow response for an old `userId` can overwrite a newer one. Frameworks and data libraries handle caching, deduplication and this race for you, which is why they are usually a better choice for data fetching than hand-written effects.
