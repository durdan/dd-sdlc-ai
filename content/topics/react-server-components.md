---
id: react-server-components
title: Server Components and client components
summary: Components that run only on the server, and where the boundary goes
why: "Server Components change where code runs and what ships to the browser. Getting the boundary wrong either sends a whole library to every visitor or fails with errors about hooks and serialisation."
requires: [react-render-commit, react-transitions]
lesson: none
points:
  - title: Rendered ahead of the browser
    text: "A Server Component runs on the server, at build time or per request. It can be async and read files or databases directly. Its code is never sent to the browser."
  - title: No state, no effects, no handlers
    text: "Server Components render once and are done, so they can't use `useState`, `useEffect` or event handlers. Interactivity lives in client components."
  - title: "\"use client\" marks a boundary"
    text: "The directive at the top of a file makes that module, and everything it imports, client code. Server Components can render client components and pass them props."
  - title: Props must cross the network
    text: "Props from a Server Component to a client component are serialised: strings, numbers, plain objects, arrays, dates, promises, JSX, and Server Functions. Not ordinary functions or class instances."
quiz:
  - q: "Which directive marks a component as a Server Component?"
    options: ["\"use server\"", "None: in an app that supports them, components are Server Components unless they are imported from a \"use client\" module", "\"use rsc\""]
    answer: 1
    explain: "There is no directive for Server Components. `\"use client\"` marks the client boundary; `\"use server\"` marks Server Functions, which client code can call."
  - q: "A Server Component passes `onSelect={(id) => save(id)}` to a client component. What happens?"
    options: [It works, "It fails: an ordinary function can't be serialised to send to the browser", It runs on the server when clicked]
    answer: 1
    explain: "Only serialisable values cross the boundary. To call server code from the client, pass a Server Function (marked with \"use server\"), or define the handler in the client component."
  - q: "A Server Component imports a 300 KB Markdown library to render an article. How much of it does the browser download?"
    options: [All of it, "None: the library runs on the server and only the rendered result is sent", Half of it]
    answer: 1
    explain: "This is the main benefit. Code that only produces output stays on the server. Had the same component been a client component, the library would be in the bundle."
links:
  - { title: "Server Components (react.dev)", url: "https://react.dev/reference/rsc/server-components" }
  - { title: "'use client' (react.dev)", url: "https://react.dev/reference/rsc/use-client" }
  - { title: "Directives (react.dev)", url: "https://react.dev/reference/rsc/directives" }
---
Server Components are React components that run only on the server, ahead of the browser: at build time, or for each request. They can be `async` functions that read a database or the file system directly, and their own code never ships to the browser; only what they render does. Interactive parts are client components, the ordinary kind that can hold state and handle events. A React app with Server Components is a tree that mixes both, and a large part of the skill is deciding where the line between them goes. This is a React feature, but it needs a framework or bundler that implements it.

## What a Server Component can do

```tsx
import { readFile } from "node:fs/promises"
import { marked } from "marked"
import LikeButton from "./LikeButton"

export default async function Article({ slug }: { slug: string }) {
  const source = await readFile(`./articles/${slug}.md`, "utf8")
  const html = await marked(source)
  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <LikeButton slug={slug} />
    </article>
  )
}
```

The component awaits its data during render: no effect, no loading state in the browser, no API endpoint to write. The Markdown library runs on the server and adds nothing to the JavaScript bundle. (Server-rendered Markdown still needs the same care about untrusted input as anywhere else.)

What it can't do: hold state, run effects, or attach event handlers. It renders once per request or build and is finished; there is nothing in the browser to keep state for. Context, `useState`, `useEffect` and `onClick` belong in client components.

## The client boundary

```tsx
"use client"

import { useState } from "react"

export default function LikeButton({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false)
  return (
    <button onClick={() => setLiked(!liked)} data-slug={slug}>
      {liked ? "Liked" : "Like"}
    </button>
  )
}
```

`"use client"` at the top of a file marks a boundary in the module graph. That module and everything it imports are bundled for the browser. A Server Component can import and render it; the client component is server-rendered to HTML too, then hydrated in the browser so its handlers work. "Client component" means "also runs in the browser", not "runs only in the browser".

There is no directive for Server Components; in an app set up for them, components are server components unless they come from a client module. `"use server"` is something else: it marks Server Functions, async functions on the server that client code can call, for example as a form action.

## What crosses the boundary

When a Server Component renders a client component, the props are serialised and sent with the result. Allowed: primitives, plain objects and arrays of serialisable values, `Date`, `Map`, `Set`, typed arrays, promises, JSX elements, and Server Functions. Not allowed: ordinary functions (such as event handlers), class instances, and symbols that aren't registered globally.

Passing JSX lets a client component wrap server-rendered content: `<Tabs>{serverRenderedPanel}</Tabs>` keeps the panel's code on the server even though `Tabs` is interactive.

## Placing the line

- Keep the boundary low. Mark the small interactive leaves (a button, a search box, a menu) as client components, rather than a whole page.
- Fetch in Server Components, close to the data, and pass the results down as props.
- Keep secrets in server-only modules; anything imported by a client module ends up in the browser bundle.
- Wrap slow server parts in `<Suspense>` so the rest of the page can be streamed first.
