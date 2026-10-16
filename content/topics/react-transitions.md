---
id: react-transitions
title: Transitions and Suspense
summary: Urgent updates first; waiting shown where you choose
why: "Without them, a slow re-render freezes typing, and every loading component shows its own spinner. Transitions keep input responsive; Suspense boundaries decide what the user sees while something loads."
requires: [react-state, react-render-commit]
lesson: diagram
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

```trace diagram
id: typing-transition
title: Two keystrokes, one slow list
subtitle: "setText is urgent; setQuery runs in startTransition"
kind: sequence
elements:
  - { id: user, label: Keyboard }
  - { id: react, label: React }
  - { id: list, label: SlowList }
  - { id: screen, label: Screen }
edges:
  - { id: key-a, from: user, to: react, label: "type \"a\"" }
  - { id: commit-a, from: react, to: screen, label: "input shows \"a\"" }
  - { id: render-a, from: react, to: list, label: "render query \"a\"" }
  - { id: yield, from: list, to: react, label: yields between components, style: dashed }
  - { id: key-ab, from: user, to: react, label: "type \"b\"" }
  - { id: drop, from: react, to: list, label: "drop the \"a\" render", style: dotted }
  - { id: commit-ab, from: react, to: screen, label: "input shows \"ab\"" }
  - { id: render-ab, from: react, to: list, label: "render query \"ab\"" }
  - { id: done, from: list, to: screen, label: "list for \"ab\", isPending false", style: dashed }
steps:
  - caption: "The user types \"a\". The handler calls setText, an urgent update, and setQuery inside startTransition."
    trace: [key-a]
  - caption: "React renders and commits the urgent update first, so the character appears at once. isPending is now true."
    trace: [commit-a]
  - caption: "Then it renders SlowList for \"a\" as a transition. It's still the main thread, but React yields to the browser regularly so input can be handled."
    trace: [render-a, yield]
  - caption: "The user types \"b\" mid-render. React handles this urgent update first and throws away the half-finished render for \"a\", which is already out of date."
    trace: [key-ab, drop, commit-ab]
  - caption: "It restarts the transition with \"ab\". When that render finishes, the list is committed and isPending goes back to false."
    trace: [render-ab, done]
  - caption: "A transition makes the work interruptible, not faster. The input's own state stays outside the transition, or typing itself would lag."
    focus: [user, screen]
```

```trace diagram
id: suspense-navigation
title: Navigating into content that suspends
subtitle: The same tab click, with and without a transition
elements:
  - { id: click, label: Click a tab, kind: person, row: 0 }
  - { id: plain, label: Plain update, sub: setTab(next), row: 1 }
  - { id: transition, label: In a transition, sub: "startTransition(() => setTab(next))", tone: stream, row: 1 }
  - { id: fallback, label: Fallback replaces the page, sub: nearest boundary's spinner, tone: external, row: 2 }
  - { id: keep, label: Old page stays, sub: isPending is true, tone: data, row: 2 }
  - { id: nested, label: New nested boundary, sub: shows its own skeleton, kind: component, row: 3 }
  - { id: ready, label: New tab shown, sub: once its code or data is ready, kind: system, row: 3 }
edges:
  - { id: go-plain, from: click, to: plain }
  - { id: go-transition, from: click, to: transition }
  - { id: hide, from: plain, to: fallback }
  - { id: wait, from: transition, to: keep }
  - { id: plain-ready, from: fallback, to: ready }
  - { id: keep-ready, from: keep, to: ready }
  - { id: inner, from: keep, to: nested, style: dashed }
steps:
  - caption: "The user clicks a tab whose content suspends: a lazy component whose code hasn't loaded, or a promise read with use. Fetching in an effect doesn't count."
  - caption: "As a plain update, React has to hide content that's already on screen. The nearest Suspense boundary swaps the page for its fallback."
    focus: [click, plain, fallback]
    trace: [go-plain, hide]
  - caption: "When the code or data arrives, React renders the real content in the fallback's place."
    focus: [fallback, ready]
    trace: [plain-ready]
  - caption: "Inside a transition, React keeps the current page on screen instead, with isPending true, so you can dim it or mark the tab."
    focus: [click, transition, keep]
    trace: [go-transition, wait]
  - caption: "A transition only waits to avoid hiding content already revealed. Boundaries that are new in the next screen still show their fallbacks."
    focus: [keep, nested]
    trace: [inner]
  - caption: "When the new tab is ready, it replaces the old page in one commit. Routers built for React use transitions for navigation for this reason."
    focus: [keep, ready]
    trace: [keep-ready]
```
