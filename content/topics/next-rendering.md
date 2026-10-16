---
id: next-rendering
title: "Static, dynamic and partial prerendering"
summary: A static shell from the build, holes that stream per request
why: "Whether a route is served instantly from a CDN or waits for your server on every hit comes down to which components touch request data, and where your Suspense boundaries are. The build output tells you which one you got."
requires: [next-server-client, react-transitions, web-rendering-strategies]
lesson: none
points:
  - title: Prerender what you can
    text: "At build time Next.js renders each route's tree. Everything that finishes without request data becomes the static shell: HTML plus the RSC Payload."
  - title: Request data makes a hole
    text: "`cookies()`, `headers()`, `searchParams`, unknown `params`, uncached fetches and `connection()` can't run at build time. Inside a `<Suspense>` boundary they become a hole that streams in per request."
  - title: Partial Prerendering is the default
    text: "With Cache Components on, a route is a static shell with dynamic holes. The build marks it ◐; fully static routes are ○, fully request-time ones ƒ."
  - title: No boundary is a build error
    text: "Request data read outside any Suspense boundary would block the whole page, so the build fails and names the route, unless you opt that route out."
quiz:
  - q: "A page renders a header and, inside `<Suspense>`, a component that awaits `cookies()`. What does the build produce?"
    options: ["A fully dynamic route rendered on every request", "A static shell with the header and the fallback, and the cookie part streamed per request", "A fully static page with the cookie read at build time"]
    answer: 1
    explain: "Reading cookies no longer makes the whole route dynamic. The Suspense boundary marks where the request-time part goes; everything outside it is prerendered into the shell. The build lists such a route as Partial Prerender."
  - q: "The same component awaits `cookies()` but has no Suspense boundary anywhere above it. What happens with Cache Components on?"
    options: ["The route quietly becomes dynamic", "The build fails with an error naming the route, suggesting Suspense or `use cache`", "The cookie value is empty at runtime"]
    answer: 1
    explain: "Next.js validates that every route can produce a shell. The fixes it offers are: wrap the access in Suspense, cache the data with `use cache` (not possible for cookies), or explicitly allow a blocking route."
  - q: "Is wrapping a purely synchronous component in `<Suspense>` enough to make it render per request?"
    options: ["Yes: Suspense opts its children into dynamic rendering", "No: Suspense only gives a fallback; synchronous work still finishes during prerendering", "Only inside a layout"]
    answer: 1
    explain: "Suspense is a place for a fallback, not a switch. Only request data, uncached I/O or `connection()` defer rendering to request time."
links:
  - { title: "Caching and prerendering (Next.js)", url: "https://nextjs.org/docs/app/getting-started/caching" }
  - { title: "Streaming (Next.js)", url: "https://nextjs.org/docs/app/guides/streaming" }
  - { title: "<Suspense> (react.dev)", url: "https://react.dev/reference/react/Suspense" }
  - { title: "cacheComponents (Next.js)", url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents" }
---
In Next.js 16 with Cache Components (the default for new apps), each route is rendered at build time as far as it can go. Whatever completes without information from the request (static markup, module imports, pure computation, and data you have marked as cached) goes into the **static shell**: HTML for a direct visit and an RSC Payload for client navigations, both servable from a CDN. Components that need the request, such as cookies, headers, search parameters or fresh data, cannot finish then. Each one must sit inside a `<Suspense>` boundary: its fallback is baked into the shell and its real content is **streamed** into the same response when a request arrives. This is Partial Prerendering. It used to be an experiment; with Cache Components it is simply how rendering works.

## What the build tells you

A throwaway app built with `next build` on Next.js 16.4.2 printed:

```text
Route (app)             Revalidate  Expire
├ ○ /plain
├ ○ /api/static
├ ƒ /api/time
├   /blog/[slug]
│ ├ ◐ /blog/[slug]
│ ├ ○ /blog/a
│ └ ○ /blog/b
├ ○ /cached                     1h      1d
├ ƒ /cookie-nosuspense
├ ◐ /cookie-suspense
└ ◐ /random

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand
```

- `/plain` renders only markup: fully static.
- `/cookie-suspense` reads `cookies()` inside a Suspense boundary: a shell plus one streamed hole.
- `/random` calls `connection()` before `crypto.randomUUID()`, which says "this must be per request"; also a hole.
- `/cached` awaits a function marked `use cache` with `cacheLife("hours")`: its result is in the shell, with a 1 hour revalidate and 1 day expiry.
- `/blog/a` and `/blog/b` came from `generateStaticParams`; any other slug gets the reusable shell (`/blog/[slug]`) with its param-specific parts behind fallbacks.
- `/cookie-nosuspense` read cookies with no boundary. The first build **failed** with "Next.js encountered uncached or runtime data during prerendering" and listed three fixes. It only built once the route explicitly opted out of the check, and then it is ƒ: nothing is prerendered and every visit waits for the server.

## Thinking in shells and holes

```tsx
export default function Page() {
  return (
    <>
      <Header />                                   {/* in the shell */}
      <ProductList />                              {/* "use cache": in the shell */}
      <Suspense fallback={<CartSkeleton />}>       {/* fallback in the shell */}
        <Cart />                                   {/* reads cookies(): streamed */}
      </Suspense>
    </>
  )
}
```

The deeper request data sits in the tree, the more of the page is static. A layout that awaits `params` at the top makes everything below it wait; passing the `params` promise down and awaiting it in a small child keeps the layout in the shell.

Suspense doesn't make anything dynamic by itself; it only gives a place to show a fallback. Values that differ per run, such as `Math.random()`, `Date.now()` and `crypto.randomUUID()`, must be either cached (everyone sees the same value until revalidation) or placed after `await connection()` inside a boundary.

Apps without Cache Components use the previous model: a route is static unless it touches request data anywhere, in which case the whole route becomes dynamic, and options like `export const dynamic = "force-dynamic"` override that per segment. Those segment options are removed when Cache Components is on.
