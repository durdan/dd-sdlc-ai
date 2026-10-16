---
id: react-context
title: Context and what it costs
summary: Passing a value down without props, and who re-renders when it changes
why: "Context removes prop drilling, but every component that reads it renders again whenever the value changes, and `memo` doesn't stop that. A new object as the value on each render means all of them, every time."
requires: [react-memo]
lesson: none
points:
  - title: A value for a whole subtree
    text: "A provider makes a value available to every component below it. `useContext` (or `use`) reads the nearest provider's value, however deep."
  - title: Readers re-render on change
    text: "When the provider's value changes by `Object.is`, React re-renders every component that reads that context, even ones inside a `memo`."
  - title: Keep the value stable
    text: "An object literal as the value is new on every render of the provider. Memoise it, or split rarely and frequently changing values into separate contexts."
quiz:
  - q: "A provider renders `<UserContext value={{ user, logout }}>` and its parent re-renders for an unrelated reason. What happens to the components that read UserContext?"
    options: [Nothing, "They all re-render, because the value is a new object and fails the `Object.is` check", Only the first one re-renders]
    answer: 1
    explain: "The object literal is created anew on every render. Wrap it in `useMemo` with `[user, logout]` (and `logout` in `useCallback`), or let the React Compiler do it."
  - q: "A component wrapped in `memo` reads a context whose value changed. Does it re-render?"
    options: ["No, memo prevents it", "Yes: memo only compares props; context changes go straight to the readers", "Only if its props also changed"]
    answer: 1
    explain: "Context updates bypass `memo`. Components between the provider and the reader can still be skipped, but the reader itself renders."
  - q: "What does `useContext` return when there is no matching provider above the component?"
    options: [It throws, "The default value passed to `createContext`", "undefined, always"]
    answer: 1
    explain: "The default is used when no provider is found. Many codebases pass `null` and throw from a custom hook, so a missing provider is a clear error instead of a silent default."
links:
  - { title: "Passing data deeply with context (react.dev)", url: "https://react.dev/learn/passing-data-deeply-with-context" }
  - { title: "useContext (react.dev)", url: "https://react.dev/reference/react/useContext" }
  - { title: "createContext (react.dev)", url: "https://react.dev/reference/react/createContext" }
---
Context lets a component make a value available to everything below it without passing it through each level as a prop. It suits values many distant components need: the current user, the theme, the locale, a router. The cost is that context is a broadcast: when the value changes, every component that reads it renders again, regardless of `memo`. Used for the right data with a stable value, that's cheap; used as a store for fast-changing state, it can re-render most of the app on each keystroke.

## Providing and reading

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

type Theme = "light" | "dark"
type ThemeValue = { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const value = useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }),
    [theme],
  )
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (value === null) throw new Error("useTheme must be used inside <ThemeProvider>")
  return value
}

export function ThemeButton() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>Theme: {theme}</button>
}
```

Since React 19 the context itself is the provider (`<ThemeContext value={...}>`); older code writes `<ThemeContext.Provider value={...}>`, which still works. `useContext` finds the nearest provider above the calling component; with none, it returns the default given to `createContext`. React 19's `use(ThemeContext)` reads context too, and unlike a hook it may be called inside a condition.

## Who re-renders

When `ThemeProvider` renders with a value that is not `Object.is`-equal to the previous one, React finds every component below it that reads `ThemeContext` and renders it, even if it is wrapped in `memo` and its props are unchanged. Components in between that don't read the context are not rendered because of it.

Two consequences:

- **The value's identity matters.** Without the `useMemo` above, `value` would be a new object every time `ThemeProvider` renders, and every reader would render with it, even when `theme` hasn't changed. The React Compiler memoises this for you.
- **`children` are not re-rendered.** Because `children` were created by `ThemeProvider`'s parent, a `theme` change re-renders the provider and the context readers, not the whole tree it wraps.

## Splitting and choosing

- Put values that change at different rates in different contexts. A `user` that changes on login and a `cursorPosition` that changes 60 times a second should not share a provider, or every user-reader renders at 60 frames per second.
- Separate the state from the functions that change it (`TasksContext` and `TasksDispatchContext`). Components that only dispatch then never render because of the data.
- Context is a way to pass values, not a state manager. For large, frequently updated shared state where each component needs only a slice, a store with selectors (for example through `useSyncExternalStore`) re-renders only the components whose slice changed.
- Before reaching for context, try passing props or composing with `children`. A few levels of props are explicit and easy to follow.
