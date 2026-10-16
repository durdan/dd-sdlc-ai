---
id: next-route-handlers
title: "Route Handlers: HTTP endpoints in the app folder"
summary: A `route.ts` per URL, one function per HTTP method
why: "Webhooks, feeds, files, and APIs for mobile apps or other services don't want a React page. Route Handlers are where Next.js stops being a UI framework and becomes a small backend, with the caching rules of one."
requires: [next-rendering]
lesson: diagram
points:
  - title: Web Request in, Response out
    text: "Export `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` or `OPTIONS` from `route.ts`. Each receives a standard `Request` and returns a `Response`; other methods get 405."
  - title: A route or a page, not both
    text: "A segment can have `page.tsx` or `route.ts`, never both. Put APIs under a folder such as `app/api/` to keep them apart."
  - title: GET follows the page model
    text: "With Cache Components, a GET handler that doesn't touch the request or uncached data is prerendered at build time. Reading headers, the URL or a database makes it run per request unless you `use cache` the data."
  - title: Public, like everything on the server
    text: "Any client can call a Route Handler. Authenticate, validate and rate-limit as you would any API."
quiz:
  - q: "Your React client components need to save a form. Should you write a `POST` Route Handler or a Server Action?"
    options: ["A Route Handler: actions are only for forms without JavaScript", "Usually a Server Action: it is typed end to end and returns updated UI; use a Route Handler when something other than your own UI calls it", "Neither: client components can write to the database directly"]
    answer: 1
    explain: "Server Actions are designed for your app's own mutations. Route Handlers are the right tool for webhooks, third-party callers, mobile apps, and non-HTML responses."
  - q: "`export async function GET() { return Response.json({ version: \"1.4\" }) }`. How is it served after `next build`?"
    options: ["Run on every request", "Prerendered at build time and served as a static response", "Only in development"]
    answer: 1
    explain: "It reads neither the request nor uncached data, so it can be prerendered, just like a static page. The probe build in this path listed such a handler as ○ (Static)."
  - q: "A GET handler reads `request.headers.get('user-agent')`. What happens to prerendering?"
    options: ["It still prerenders with an empty header", "Prerendering stops at the request access and the handler runs per request", "The build fails"]
    answer: 1
    explain: "Request properties, `cookies()`, `headers()`, network and database calls end prerendering. The probe build listed this handler as ƒ (Dynamic)."
links:
  - { title: "Route Handlers (Next.js)", url: "https://nextjs.org/docs/app/getting-started/route-handlers" }
  - { title: "route.js (Next.js)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/route" }
  - { title: "Backend for Frontend (Next.js)", url: "https://nextjs.org/docs/app/guides/backend-for-frontend" }
---
A Route Handler is a `route.ts` (or `.js`) file in the `app/` tree that answers HTTP requests for its URL directly, with no React rendering. You export one async function per HTTP method; each receives a Web `Request` (or `NextRequest`, which adds parsed cookies and URL helpers) and returns a Web `Response`. They are the App Router's version of API routes, and the natural place for webhooks, OAuth callbacks, RSS and sitemap files, downloads, and JSON APIs used by clients other than your own pages.

## The shape of a handler

```ts
// app/api/orders/[id]/route.ts
import { getSession } from "@/lib/auth"

export async function GET(request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const session = await getSession(request)
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await ctx.params
  const order = await db.order.findFirst({ where: { id, userId: session.userId } })
  if (!order) return new Response("Not found", { status: 404 })

  return Response.json({ id: order.id, status: order.status, total: order.total })
}

export async function DELETE(request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  // same checks, then the mutation
  return new Response(null, { status: 204 })
}
```

`params` is a promise, as in pages. A folder can contain a page or a route handler, not both, which is why APIs usually live under `app/api/`. Route Handlers don't take part in layouts or client navigation; they are plain endpoints.

## Caching

Only `GET` handlers can be prerendered or cached; other methods always run per request. With Cache Components, `GET` follows the same rules as a page:

- No request access and no uncached I/O: prerendered at build time and served as a static file.
- Reads the request (`request.url`, headers, cookies, body), calls `cookies()`, `headers()` or `connection()`, makes an uncached fetch, queries a database, or calls `Math.random()`: prerendering stops there, and the handler runs per request.
- Uncached data you are happy to share can be wrapped in a `use cache` function, and its result becomes part of the static response.

In apps on the previous model, handlers are not cached by default and a `GET` opts in with `export const dynamic = "force-static"`.

## Handler or Server Action?

Both run on the server and both are public. For mutations triggered by your own React UI, Server Actions are usually simpler: they are called like functions, type-checked, and return a refreshed UI in the same response. Reach for a Route Handler when the caller is not your UI (a payment provider's webhook, a mobile app, a partner), when you need a specific URL, method, status code or content type, or when other services rely on an HTTP contract that must stay stable. Route Handlers can call `revalidateTag` and `revalidatePath`, which makes them the usual receiver for "content changed" webhooks.

```trace diagram
id: handler-paths
title: A request to route.ts
subtitle: Which handlers can be prerendered, and which always run per request
elements:
  - { id: caller, label: Callers that aren't your UI, sub: "mobile app, webhook, partner", kind: person, row: 0 }
  - { id: route, label: app/api/…/route.ts, sub: one export per HTTP method, kind: system, row: 1 }
  - { id: get, label: GET, sub: "can be prerendered", row: 2 }
  - { id: other, label: "POST, PUT, DELETE", sub: never cached, row: 2, role: service }
  - { id: helper, label: '"use cache" helper', sub: "shared data, cacheLife", kind: component, tone: stream, row: 2 }
  - { id: static, label: Prerendered at build, sub: "no request access, no uncached I/O", kind: store, tone: data, row: 3 }
  - { id: dynamic, label: Runs per request, sub: "reads the request, cookies(), a DB", row: 3, role: service }
  - { id: reval, label: "revalidateTag, revalidatePath", sub: "the \"content changed\" webhook", kind: component, tone: neutral, row: 3, role: service }
  - { id: response, label: Response, sub: "status, headers, JSON or any body", kind: person, row: 4 }
edges:
  - { id: request, from: caller, to: route }
  - { id: to-get, from: route, to: get }
  - { id: to-other, from: route, to: other }
  - { id: always, from: other, to: dynamic }
  - { id: build, from: get, to: static }
  - { id: runtime, from: get, to: dynamic, style: dashed, flow: main }
  - { id: cached, from: helper, to: static, style: dashed, flow: main }
  - { id: invalidate, from: other, to: reval, style: dotted, flow: main }
  - { id: from-static, from: static, to: response }
  - { id: from-dynamic, from: dynamic, to: response }
steps:
  - caption: "A Route Handler answers HTTP for its URL directly, with no React rendering. It suits callers that are not your own pages: webhooks, OAuth callbacks, mobile apps, partners."
    trace: [request]
  - caption: "You export one async function per method. Each gets a Web Request, with params as a promise, and returns a Web Response. A folder can hold a page or a route, not both."
    trace: [to-get, to-other]
  - caption: "Only GET can be prerendered or cached. Every other method runs for each request."
    trace: [always]
  - caption: "With Cache Components, a GET that reads nothing from the request and does no uncached I/O is prerendered at build time and served as a static file."
    trace: [build]
  - caption: "Reading request.url, headers, cookies or the body, calling cookies() or connection(), querying a database or calling Math.random() stops prerendering there, and the handler runs per request."
    trace: [runtime]
  - caption: "Uncached data you are happy to share can move into a \"use cache\" helper. Its result becomes part of the static response and refreshes by its cacheLife."
    trace: [cached]
  - caption: "A handler is a public endpoint. Check the session and ownership inside it, return a precise status code, and send only the fields the caller needs."
    trace: [from-static, from-dynamic]
  - caption: "Route Handlers can call revalidateTag and revalidatePath, which makes them the usual receiver for \"content changed\" webhooks."
    trace: [invalidate]
  - caption: "For mutations from your own React UI, a Server Action is usually simpler. Reach for a handler when you need a fixed URL, method, status code or content type that others rely on."
```
