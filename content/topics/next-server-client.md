---
id: next-server-client
title: Server and client components in Next.js
summary: Server by default; what actually reaches the browser
why: "In the App Router every file is a Server Component until you say otherwise. Where you put `\"use client\"` decides how much JavaScript each visitor downloads and which code can see your secrets."
requires: [next-app-router, react-server-components]
lesson: none
points:
  - title: Server by default
    text: "Pages and layouts are Server Components. They can be `async`, read databases and secrets, and their code never ships to the browser."
  - title: Two things are sent
    text: "For a page load the browser gets HTML plus the RSC Payload, a serialised description of the server-rendered tree with references to client component code. Navigations fetch only the RSC Payload."
  - title: The directive marks an entry point
    text: "`\"use client\"` makes a module and everything it imports part of the client bundle. Put it on small interactive leaves, not on a page."
  - title: Keep secrets on the server
    text: "Only `NEXT_PUBLIC_` environment variables are inlined into client code, and `import 'server-only'` turns an accidental client import into a build error."
quiz:
  - q: "A page component is marked `\"use client\"` because one button needs `onClick`. What is the cost?"
    options: ["None: client components are server-rendered too", "The page and everything it imports join the client bundle and must hydrate", "The page can no longer be prerendered at all"]
    answer: 1
    explain: "Client components are still rendered to HTML on the server, but their code ships and hydrates. Moving the directive down to a small `LikeButton` keeps the rest of the page as Server Components with no client JavaScript."
  - q: "What does a client-side navigation between two App Router pages fetch from the server?"
    options: ["A full HTML document", "The RSC Payload for the segments that changed", "Nothing: client components render the new page alone"]
    answer: 1
    explain: "HTML is only needed for the first load. After that, the router asks for the RSC Payload of the changed segments and React reconciles it into the existing tree, keeping shared layouts."
  - q: "A client component reads `process.env.STRIPE_SECRET_KEY`. What does it get in the browser?"
    options: ["The secret, which is now public", "An empty value: only `NEXT_PUBLIC_` variables are inlined into client code", "A build error in every case"]
    answer: 1
    explain: "Non-public variables are not inlined, so the value is missing in the browser rather than leaked. The real risk is a shared module that reads secrets being imported by client code; mark such modules with `import 'server-only'`."
links:
  - { title: "Server and Client Components (Next.js)", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components" }
  - { title: "'use client' (react.dev)", url: "https://react.dev/reference/rsc/use-client" }
  - { title: "Data Security (Next.js)", url: "https://nextjs.org/docs/app/guides/data-security" }
---
React defines Server Components; Next.js decides where and when they run. In the App Router, every page, layout and component is a Server Component unless its module, or a module that imports it, starts with `"use client"`. Server Components run during the build or for a request, and the browser receives their output: HTML for the first load, and a serialised tree called the RSC Payload that React uses to build and update the page. Client components are rendered to HTML on the server too, then hydrated in the browser so their state and event handlers work.

## What the browser receives

For a first visit to a route, Next.js sends:

1. **HTML**, so something is visible before any JavaScript runs.
2. **The RSC Payload**: the rendered Server Component tree, the props passed to client components, and placeholders that point to the client component code.
3. **JavaScript** for the client components on the page, which React uses to hydrate them.

When the user then follows a `<Link>`, the router fetches only the RSC Payload for the segments that changed (often already prefetched), and React merges it into the page without a full reload. Server Component code itself, and the libraries it imports, never appear in any of these.

## Placing the boundary

```tsx
// app/products/[id]/page.tsx (a Server Component)
import { getProduct } from "@/lib/data"
import AddToCart from "./add-to-cart"

export default async function Page({ params }: PageProps<"/products/[id]">) {
  const { id } = await params
  const product = await getProduct(id)
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCart productId={product.id} />
    </article>
  )
}
```

```tsx
// app/products/[id]/add-to-cart.tsx
"use client"
import { useState } from "react"

export default function AddToCart({ productId }: { productId: string }) {
  const [count, setCount] = useState(1)
  return <button onClick={() => setCount(count + 1)}>Add {count} ({productId})</button>
}
```

Only `AddToCart` and its imports join the client bundle. The props crossing the boundary must be serialisable (strings, plain objects, dates, promises, JSX, Server Functions), not ordinary functions or class instances.

Two patterns keep the boundary low. Pass server-rendered content as `children` into an interactive wrapper (`<Tabs>{panel}</Tabs>`), so the panel stays a Server Component. And wrap context providers in a small client component that takes `children`, then render that provider from the root layout; Server Components can't use context themselves.

## Keeping server things on the server

Environment variables are read at runtime on the server, but in client code only variables prefixed `NEXT_PUBLIC_` are inlined at build time; any other name is simply missing in the browser. The more realistic leak is a shared helper that reads a secret or a database being imported by a client component. Put `import "server-only"` at the top of such modules and that mistake becomes a build error. The Data Security guide recommends a single data access layer that checks authorisation and returns only the fields the UI needs, so a whole database row never lands in props.
