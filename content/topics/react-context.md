---
id: react-context
title: Context and what it costs
summary: Passing a value down without props, and who re-renders when it changes
why: "Context removes prop drilling, but every component that reads it renders again whenever the value changes, and `memo` doesn't stop that. A new object as the value on each render means all of them, every time."
requires: [react-memo]
lesson: diagram
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

```trace diagram
id: who-renders
title: Who renders when the value changes
subtitle: "ThemeProvider wraps a Layout; two components read ThemeContext"
elements:
  - { id: app, label: App, sub: the provider's parent, kind: person, row: 0 }
  - { id: provider, label: ThemeProvider, sub: "<ThemeContext value={value}>", kind: system, row: 1 }
  - { id: value, label: value, sub: "compared with Object.is", kind: store, row: 1 }
  - { id: layout, label: Layout, sub: "children; doesn't read the context", row: 2 }
  - { id: sidebar, label: Sidebar, sub: "doesn't read it", tone: neutral, row: 3 }
  - { id: button, label: ThemeButton, sub: "useTheme()", tone: stream, row: 3 }
  - { id: header, label: "memo(Header)", sub: "reads ThemeContext", tone: stream, row: 3 }
edges:
  - { id: renders, from: app, to: provider }
  - { id: provides, from: provider, to: value }
  - { id: child, from: provider, to: layout }
  - { id: to-sidebar, from: layout, to: sidebar }
  - { id: to-button, from: layout, to: button }
  - { id: to-header, from: layout, to: header }
  - { id: notify-button, from: value, to: button, label: changed, style: dashed }
  - { id: notify-header, from: value, to: header, style: dashed }
steps:
  - caption: "ThemeProvider makes its value available to everything below it. ThemeButton and Header read it with useTheme, however deep they are."
    focus: [provider, value, button, header]
  - caption: "Clicking toggle changes theme. The provider renders with a new value, and React finds every component below that reads this context."
    focus: [provider, value, button, header]
    trace: [provides, notify-button, notify-header]
  - caption: "Header is wrapped in memo and its props didn't change, but it renders anyway. A context change goes straight to the readers; memo only compares props."
    focus: [value, header]
    trace: [notify-header]
  - caption: "Layout and Sidebar don't read the context, so they don't render because of it. They were created by App as children, not by the provider."
    focus: [layout, sidebar]
  - caption: "Now App renders for an unrelated reason. If the value were an object literal, it would be a new object, and every reader would render though theme is the same."
    focus: [app, provider, value, button, header]
    trace: [renders, provides, notify-button, notify-header]
  - caption: "With useMemo keyed on theme, the provider passes the same object as before. Object.is says nothing changed, so no reader renders."
    focus: [app, provider, value]
    trace: [renders, provides]
  - caption: "With no provider above it at all, useContext returns the default given to createContext. A custom hook that throws on null makes that mistake obvious."
    focus: [button]
```

```trace diagram
id: split-contexts
title: Split by rate of change
subtitle: A login changes once; the cursor 60 times a second
elements:
  - { id: login, label: Login, kind: person, row: 0 }
  - { id: mouse, label: Mouse moves, kind: person, row: 0 }
  - { id: user, label: UserContext, sub: changes on login, kind: system, row: 1 }
  - { id: cursor, label: CursorContext, sub: changes every frame, kind: system, row: 1 }
  - { id: avatar, label: Avatar, sub: reads user, tone: stream, row: 2 }
  - { id: menu, label: AccountMenu, sub: reads user, tone: stream, row: 2 }
  - { id: pointer, label: Pointer, sub: reads cursor, tone: stream, row: 2 }
edges:
  - { id: set-user, from: login, to: user }
  - { id: set-cursor, from: mouse, to: cursor }
  - { id: to-avatar, from: user, to: avatar, style: dashed }
  - { id: to-menu, from: user, to: menu, style: dashed }
  - { id: to-pointer, from: cursor, to: pointer, style: dashed }
steps:
  - caption: "Values that change at different rates live in separate contexts here: the user in one, the cursor position in another."
  - caption: "The mouse moves and CursorContext gets a new value every frame. Only Pointer reads it, so only Pointer renders."
    focus: [mouse, cursor, pointer]
    trace: [set-cursor, to-pointer]
  - caption: "A login changes UserContext once, and its two readers render once."
    focus: [login, user, avatar, menu]
    trace: [set-user, to-avatar, to-menu]
  - caption: "Had both values shared one provider, Avatar and AccountMenu would render 60 times a second. The same idea splits state from its dispatch function, so components that only dispatch never render for data."
    focus: [avatar, menu, pointer]
```
