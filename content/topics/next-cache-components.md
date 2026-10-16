---
id: next-cache-components
title: "`use cache` and `cacheLife`"
summary: Cache a function or a component; the inputs are the key
why: "Since Next.js 15 nothing is cached unless you ask, and in 16 the way you ask is one directive. Knowing what goes into the key and how long an entry lives is the difference between a fast page and one that shows another user's data or never updates."
requires: [next-rendering, web-http-caching]
lesson: diagram
points:
  - title: Opt in, per function
    text: "`\"use cache\"` at the top of an async function, component or file caches its return value. Without it, `fetch` and database calls run every time."
  - title: The key is built for you
    text: "The build ID, the function's identity, its serialisable arguments and any variables it closes over form the key. Different inputs give different entries."
  - title: Three times in a lifetime
    text: "`cacheLife` sets `stale` (how long the browser reuses it), `revalidate` (after which the server refreshes it in the background) and `expire` (after which the next request waits for fresh data)."
  - title: Where entries live
    text: "By default in server memory, which serverless instances may not keep. `use cache: remote` uses a shared cache handler; `use cache: private` is for per-user results and is never stored on the server across requests."
quiz:
  - q: "Inside a function marked `\"use cache\"` you call `cookies()` to find the user. What happens?"
    options: ["It works and caches per user", "It is an error: cached scopes can't read request APIs; read the cookie outside and pass the value in as an argument", "The cookie is read once at build time"]
    answer: 1
    explain: "A shared cache entry must not depend on hidden request state. Pass the value as an argument so it becomes part of the key, or use `use cache: private` when that is not practical."
  - q: "A function has `cacheLife({ revalidate: 3600, expire: 86400 })`. A request arrives 2 hours after the entry was made. What does it get?"
    options: ["It waits while the server fetches fresh data", "The cached result at once, while the server regenerates the entry in the background", "An error because the entry is too old"]
    answer: 1
    explain: "Past `revalidate` but before `expire` is stale-while-revalidate: serve what you have and refresh behind it. Only past `expire` does the next request block on fresh data."
  - q: "Your app runs on serverless functions and a `use cache` database query still hits the database on most requests. Why?"
    options: ["\"use cache\" only works for fetch", "The default cache is in the memory of each instance, which serverless platforms don't keep between requests", "cacheLife defaults to zero"]
    answer: 1
    explain: "Build-time results in the static shell are unaffected, but runtime entries live in an in-memory LRU per instance. `use cache: remote` lets the platform store entries in a shared cache, at the cost of a network lookup."
links:
  - { title: "use cache (Next.js)", url: "https://nextjs.org/docs/app/api-reference/directives/use-cache" }
  - { title: "cacheLife (Next.js)", url: "https://nextjs.org/docs/app/api-reference/functions/cacheLife" }
  - { title: "use cache: remote (Next.js)", url: "https://nextjs.org/docs/app/api-reference/directives/use-cache-remote" }
  - { title: "Caching and Revalidating, previous model (Next.js)", url: "https://nextjs.org/docs/app/guides/caching-without-cache-components" }
---
With Cache Components enabled, caching in Next.js is explicit and lives in your code. Put `"use cache"` at the top of an async function (data-level) or a component or page (UI-level), and Next.js stores its return value under a key made from its inputs. A cached result can be included in the static shell at build time, reused across requests at runtime, and kept in the browser's router cache for navigations. Everything you don't mark is fetched fresh for each request, which is the safe default.

## Two levels

```tsx
import { cacheLife, cacheTag } from "next/cache"

// Data-level: any component can call it; one entry per id
export async function getProduct(id: string) {
  "use cache"
  cacheLife("hours")
  cacheTag(`product-${id}`)
  return db.product.findUnique({ where: { id } })
}

// UI-level: the rendered output is cached
export async function Footer() {
  "use cache"
  cacheLife("max")
  const links = await cms.footerLinks()
  return <nav>{links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
}
```

The key includes the build ID (so a deploy starts afresh), the function's identity, its arguments and any variables it captures from the enclosing scope. Arguments must be serialisable; children and Server Actions can be passed through as long as the cached function doesn't look inside them. Cached scopes cannot call `cookies()`, `headers()` or read `searchParams`, even in a helper deeper in the call stack; read them outside and pass the value in, which also makes it part of the key.

## How long an entry lives

`cacheLife` takes a profile (`seconds`, `minutes`, `hours`, `days`, `weeks`, `max`; `default` if you call nothing) or an object with three times:

- **stale**: how long the client router may reuse the result without asking the server.
- **revalidate**: after this, the next request gets the cached value and triggers a background refresh.
- **expire**: after this, the next request waits for a fresh value.

```js run
// What the server does with one cached entry, by its age (a simplification of cacheLife).
function serve(ageSeconds, { revalidate, expire }) {
  if (ageSeconds < revalidate) return "fresh: return the cached value"
  if (expire === undefined || ageSeconds < expire)
    return "stale: return the cached value now, regenerate in the background"
  return "expired: run the function and wait for the new value"
}

const hours = { revalidate: 3600, expire: 86400 }   // the "hours" profile on the server
for (const age of [60, 2 * 3600, 30 * 3600]) {
  console.log(`age ${String(age).padStart(6)}s -> ${serve(age, hours)}`)
}
```

Very short lifetimes (the `seconds` profile, `revalidate: 0`, or `expire` under five minutes) are left out of the static shell and become streamed holes, since prerendering them would be pointless.

## Where entries are stored

The default handler keeps runtime entries in an in-memory LRU on each server instance. On a long-running Node server they are reused; on serverless platforms an instance may serve one request and vanish, so the function often runs again. `"use cache: remote"` asks the platform's configured cache handler (for example Redis or a KV store) to keep entries for all instances. `"use cache: private"` is the opposite: it may read cookies and headers, results are reused only within one request and in that user's browser, never in a shared server cache.

Apps that have not enabled Cache Components use the previous model, where `fetch(url, { cache: "force-cache" })`, `unstable_cache` and route segment options such as `revalidate` do this job. Since Next.js 15, plain `fetch` is not cached by default in either model.

```trace diagram
id: cache-entry
title: The life of one cached entry
subtitle: 'getProduct("42") with "use cache" and cacheLife("hours")'
elements:
  - { id: call, label: getProduct("42"), sub: called from any component, kind: person, row: 0, role: service }
  - { id: key, label: Cache key, sub: "build ID, function, arguments, captured variables", kind: component, row: 1 }
  - { id: handler, label: Cache handler, sub: "default: in-memory LRU per instance", kind: store, row: 2 }
  - { id: remote, label: '"use cache: remote"', sub: "a shared handler: Redis, KV", kind: external, row: 2, role: cache }
  - { id: fresh, label: Fresh, sub: "age under revalidate (1 h)", tone: data, row: 3, role: cache }
  - { id: stale, label: Stale, sub: "past 1 h: old value now", tone: stream, row: 3, role: cache }
  - { id: expired, label: Expired or missing, sub: "past expire (1 day), or first call", tone: neutral, row: 3, role: cache }
  - { id: router, label: Browser router cache, sub: "reused for the stale time", kind: external, row: 3, role: cache }
  - { id: run, label: Run the function, sub: "query the database, store the result", row: 4, role: service }
edges:
  - { id: make-key, from: call, to: key }
  - { id: lookup, from: key, to: handler }
  - { id: to-fresh, from: handler, to: fresh }
  - { id: to-stale, from: handler, to: stale }
  - { id: to-expired, from: handler, to: expired }
  - { id: background, from: stale, to: run, label: in the background, style: dashed, flow: async }
  - { id: wait, from: expired, to: run }
  - { id: to-router, from: handler, to: router, style: dotted }
  - { id: share, from: remote, to: handler, style: dashed, flow: data }
steps:
  - caption: "A call to a \"use cache\" function first builds a key: the build ID, so a deploy starts afresh, the function's identity, its arguments and any variables it captures."
    trace: [make-key]
  - caption: "Cached scopes cannot call cookies() or headers(), even in a helper deeper down. Read them outside and pass the value in, which also makes it part of the key."
    focus: [key]
  - caption: "The first call finds nothing, so the function runs, queries the database and stores its return value under that key. At build time, that result can go into the static shell."
    trace: [lookup, to-expired, wait]
  - caption: "Until the entry is older than revalidate, one hour for the hours profile, every call with the same arguments returns the stored value without running the function."
    trace: [lookup, to-fresh]
  - caption: "After revalidate, the next call still gets the cached value at once and triggers a background refresh. Nobody waits."
    trace: [lookup, to-stale, background]
  - caption: "After expire, one day here, the next call waits for a fresh value. A profile without expire never reaches this by time."
    trace: [lookup, to-expired, wait]
  - caption: "The third time, stale, is for the browser: how long the client router may reuse the result without asking the server at all."
    trace: [to-router]
  - caption: "The default handler is memory on each instance. On serverless an instance may vanish after one request, so \"use cache: remote\" keeps entries in a store all instances share."
    trace: [share]
  - caption: "Very short lifetimes, such as the seconds profile or an expire under five minutes, are left out of the static shell and become streamed holes instead."
```
