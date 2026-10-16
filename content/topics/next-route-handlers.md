---
id: next-route-handlers
title: "Route Handlers: HTTP endpoints in the app folder"
summary: A `route.ts` per URL, one function per HTTP method
why: "Webhooks, feeds, files, and APIs for mobile apps or other services don't want a React page. Route Handlers are where Next.js stops being a UI framework and becomes a small backend, with the caching rules of one."
requires: [next-rendering]
lesson: none
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
