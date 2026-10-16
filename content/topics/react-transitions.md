---
id: react-transitions
title: Transitions and Suspense
summary: Urgent updates first; waiting shown where you choose
why: "Without them, a slow re-render freezes typing, and every loading component shows its own spinner. Transitions keep input responsive; Suspense boundaries decide what the user sees while something loads."
requires: [react-state, react-render-commit]
lesson: none
points:
  - title: Two kinds of update
    text: "Typing and clicking need an immediate response. Showing the results of that input can wait a little. A transition marks an update as the kind that can wait."
  - title: Transition renders can be interrupted
    text: "React renders a transition in the background. If an urgent update arrives, it handles that first and restarts the transition, so the input never stalls."
  - title: Suspense shows a fallback
    text: "When a component inside a `<Suspense>` boundary isn't ready (lazy code, data read with `use`), React shows the boundary's fallback until it is."
  - title: Transitions keep what's on screen
    text: "If an update is a transition, React keeps showing the current content instead of replacing it with a fallback, and `isPending` tells you it is working."
quiz:
  - q: "Filtering a big list on every keystroke makes typing lag. What does wrapping the list update in `startTransition` change?"
    options:
      - The filtering runs on another thread
      - "The input updates immediately; the list render can be interrupted by the next keystroke and restarted with the newer text"
      - The filtering is cached
    answer: 1
    explain: "Rendering still happens on the main thread, but in a transition React yields between components and abandons stale work when an urgent update arrives."
  - q: "Which of these makes a `<Suspense>` boundary show its fallback?"
    options: ["A `fetch` inside `useEffect`", "A component created with `lazy` whose code hasn't loaded yet", "A `setTimeout` in an event handler"]
    answer: 1
    explain: "Suspense only reacts to Suspense-enabled sources: lazy components, promises read with `use`, and framework data loading built on them. It doesn't detect fetching in effects or event handlers."
  - q: "A user navigates to a new tab whose content suspends. Without a transition, the current page is replaced by a spinner. With the navigation in a transition?"
    options: [The same, "React keeps showing the current page, with `isPending` true, until the new content is ready", The navigation is cancelled]
    answer: 1
    explain: "Transitions avoid hiding content that is already revealed. Suspense boundaries that are new in the update can still show their own fallbacks."
links:
  - { title: "useTransition (react.dev)", url: "https://react.dev/reference/react/useTransition" }
  - { title: "<Suspense> (react.dev)", url: "https://react.dev/reference/react/Suspense" }
  - { title: "useDeferredValue (react.dev)", url: "https://react.dev/reference/react/useDeferredValue" }
  - { title: "use (react.dev)", url: "https://react.dev/reference/react/use" }
---
Not every update is equally urgent. The character you typed must appear at once; the list of results for it can arrive a moment later. A transition marks an update as non-urgent, so React can render it in the background, interrupt it for more urgent input and keep the current screen visible meanwhile. Suspense is the other half: a boundary that says what to show while part of the tree isn't ready to render yet.

## Transitions

```tsx
import { useState, useTransition } from "react"

declare function SlowList(props: { query: string }): React.ReactNode

export function Search() {
  const [text, setText] = useState("")
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value) // urgent: the input must update now
          startTransition(() => setQuery(e.target.value)) // can wait
        }}
      />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <SlowList query={query} />
      </div>
    </>
  )
}
```

Without the transition, each keystroke renders `SlowList` synchronously before the browser can show the character, so typing stutters. With it, React commits the urgent `setText` first. It then renders the list as a transition, regularly yielding to the browser so that input can be handled. If another keystroke arrives, React drops the half-finished render and starts again with the newer query. Rendering still happens on the main thread; a transition makes the work interruptible, not faster. A controlled input's own state must not be set in a transition, or typing would lag.

`useDeferredValue(query)` does the same from the reading side: it gives you a copy of a value that lags behind during urgent updates, which suits values you receive as props.

In React 19, the function passed to `startTransition` may be async. React calls the function passed to `startTransition` an action, and `isPending` stays true until it finishes, which makes it a simple way to show progress for a form submission or a save. State updates after an `await` currently need their own `startTransition` wrapper to count as part of the transition.

## Suspense

```tsx
import { lazy, Suspense } from "react"

const Chart = lazy(() => import("./Chart"))

export function Dashboard() {
  return (
    <Suspense fallback={<p>Loading chart...</p>}>
      <Chart />
    </Suspense>
  )
}
```

While `Chart`'s code is loading, `Chart` suspends: React stops rendering that part of the tree and shows the nearest boundary's `fallback`. When the code arrives, it renders the real content in its place. What can suspend: components from `lazy`, promises read with `use(promise)` (the promise must be cached, not created during render), and data loading in Suspense-enabled frameworks. Fetching in an effect or an event handler does not activate Suspense.

Boundaries are a design decision. One boundary around a page gives one loading state; several give independent ones that appear as each is ready. During streaming server rendering, each boundary is also a point where the server can send the shell first and the rest later.

## Transitions and Suspense together

When an update that is not a transition causes already-visible content to suspend, React has to hide it behind the fallback: the page you were reading turns into a spinner. When the update is a transition, React keeps the old content on screen, with `isPending` true, until the new content is ready. Routers built for React use transitions for navigation for this reason. New boundaries that appear in the update still show their fallbacks, so the next screen can show its own skeletons without hiding the current one.
