---
id: react
title: "React: how it really renders"
promise: "What happens between calling setState and seeing pixels: rendering and committing, how React matches trees, why hooks have rules, what effects and memoisation are for, and how transitions, Suspense and Server Components change where and when your components run."
kind: skill
level: intermediate
tags: [web, frameworks]
stages:
  - title: The model
    blurb: Describe the UI; React updates the DOM
    topics: [react-ui-as-function, react-render-commit, react-reconciliation]
  - title: State and hooks
    blurb: Snapshots, call order, effects, refs
    topics: [react-state, react-hooks-rules, react-effects, react-refs]
  - title: Rendering less
    blurb: Memoisation and context
    topics: [react-memo, react-context]
  - title: Time and place
    blurb: Transitions, the event loop, the server
    topics: [react-transitions, react-event-loop, react-server-components]
bridges:
  - id: server-driven-ui
    why: "Server Components send a description of the UI from the server for the client to render. Server-driven UI applies the same idea across app releases and platforms."
  - id: bff
    why: "Server Components and Server Functions put a thin, screen-shaped backend next to the UI. A backend for frontend is that idea as a service of its own."
  - id: graceful-degradation
    why: "A Suspense or error boundary decides what the user sees while one part is slow or broken. Graceful degradation is the same decision for a whole system."
next: [frontend]
---
Everything here is about React 19. The topics on closures and the event loop come from the JavaScript path and share their progress with it. Framework features (routing, data loading, where Server Components run) are described only as far as React itself defines them.
