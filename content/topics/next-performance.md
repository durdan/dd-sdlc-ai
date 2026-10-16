---
id: next-performance
title: Common Next.js performance pitfalls
summary: Waterfalls, fat boundaries, request data too high, caches that never hit
why: "Most slow Next.js apps are not slow because of React. They wait for data one call after another, ship components that didn't need to be client-side, or turn a whole route dynamic because a layout read a cookie."
requires: [next-cache-components, next-assets-build]
lesson: none
points:
  - title: Start work in parallel
    text: "Sequential `await`s in Server Components form a waterfall. Start independent requests together, or pass promises down and let Suspense boundaries wait separately."
  - title: Keep request data low
    text: "A layout that awaits `cookies()` or `params` at the top drags everything below it out of the static shell. Read request data in the smallest component that needs it."
  - title: Watch what crosses the boundary
    text: "Props to client components are serialised into the RSC Payload. Pass the three fields the UI shows, not the whole database row."
  - title: Check the cache really hits
    text: "In-memory caches on serverless instances, `revalidatePath(\"/\", \"layout\")` after every change, and very short `cacheLife` profiles all look like caching but rarely serve from cache."
quiz:
  - q: "A page awaits `getUser()`, then `getOrders()`, then `getRecommendations()`, each taking about 200 ms and independent of the others. Roughly how long until it can render?"
    options: ["About 200 ms", "About 600 ms: each call waits for the previous one", "It depends only on the CDN"]
    answer: 1
    explain: "Three sequential awaits add up. Starting all three first and awaiting them together, or rendering each in its own Suspense boundary, brings it close to the slowest single call."
  - q: "Which change usually moves more of a page into the static shell?"
    options: ["Marking the page `\"use client\"`", "Moving the `cookies()` read from the layout into a small component inside `<Suspense>`", "Adding `loading.tsx` without changing anything else"]
    answer: 1
    explain: "Everything above the request-data read and outside its boundary can be prerendered. A loading file adds a fallback for the segment but doesn't move the read lower."
  - q: "A Server Component passes a full `user` row (40 columns, including a password hash) to a client avatar. What are the two problems?"
    options: ["None: props are only used on the server", "A bigger RSC Payload on every page and private fields sent to the browser", "Only a TypeScript warning"]
    answer: 1
    explain: "Everything passed to a client component is serialised to the browser. Map to a small DTO in the data layer; React's taint APIs can block specific objects as a second line of defence."
links:
  - { title: "Fetching Data (Next.js)", url: "https://nextjs.org/docs/app/getting-started/fetching-data" }
  - { title: "Package Bundling (Next.js)", url: "https://nextjs.org/docs/app/guides/package-bundling" }
  - { title: "Streaming (Next.js)", url: "https://nextjs.org/docs/app/guides/streaming" }
---
Next.js gives you prerendering, streaming and several caches, but each one can be defeated by an innocent-looking line. The usual suspects are data waterfalls in Server Components, request data read too high in the tree, client boundaries placed on whole pages, oversized props, and caches that are configured but never hit. Each has a visible symptom (a ƒ in the build table, a large RSC Payload, a slow Time to First Byte) and a small structural fix.

## Waterfalls

```js run
// Three independent server calls, each about 200 ms, awaited one after another or together.
const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms))
const getUser = () => wait(200, "user")
const getOrders = () => wait(200, "orders")
const getRecommendations = () => wait(200, "recs")

async function sequential() {
  const user = await getUser()
  const orders = await getOrders()
  const recs = await getRecommendations()
  return [user, orders, recs]
}

async function parallel() {
  return Promise.all([getUser(), getOrders(), getRecommendations()])
}

async function time(label, fn) {
  const start = Date.now()
  await fn()
  console.log(`${label}: ~${Math.round((Date.now() - start) / 100) * 100} ms`)
}

time("sequential", sequential).then(() => time("parallel", parallel))
```

In a Server Component the fix is the same: start independent work before awaiting it. Better still, give each slow part its own component and Suspense boundary, so the page streams each part as it arrives instead of waiting for the slowest. When several components need the same data, wrap the loader in React's `cache` (one call per request) or `use cache` (shared across requests) rather than threading props through the tree.

## Request data too high

```tsx
// Slow: the whole layout waits for the request, nothing below it is in the shell.
export default async function Layout({ children }: LayoutProps<"/shop">) {
  const theme = (await cookies()).get("theme")?.value
  return <div data-theme={theme}><Nav />{children}</div>
}
```

Move the cookie read into a small component wrapped in `<Suspense>`, or into a client component that reads it in the browser, and `Nav` and the pages return to the static shell. The same goes for `params`: pass the promise down and await it where it is used.

## Too much on the client

A `"use client"` page imports its whole subtree into the bundle. Put the directive on interactive leaves, pass server content as `children`, and check for large libraries imported from client modules (date libraries, Markdown, charting). Props are serialised into the RSC Payload; sending big objects inflates every navigation and can leak fields.

## Caches that don't cache

- Runtime `use cache` entries live in instance memory. On serverless they often miss; use `use cache: remote` for hot, expensive data.
- `revalidatePath("/", "layout")` after every mutation invalidates the whole site. Tag data narrowly and invalidate the tag.
- A `seconds` profile or `revalidate: 0` is excluded from the shell and becomes a hole; make sure that is what you want.

## Elsewhere

Keep Proxy fast and narrowly matched, because it runs before every matched request. Don't use Server Actions to read data; they run one at a time. Give the LCP image `preload` and correct `sizes`, and let `next/font` handle web fonts.
