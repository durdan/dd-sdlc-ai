---
id: next-proxy
title: "Proxy (formerly Middleware)"
summary: Code that runs before every matched request
why: "One file can redirect, rewrite or reject requests before any route renders. It is powerful and cheap to misuse: run it on too many paths and it slows everything, trust it for authorisation and one refactor leaves routes open."
requires: [next-route-handlers]
lesson: diagram
points:
  - title: Renamed in Next.js 16
    text: "`middleware.ts` is deprecated; the file is now `proxy.ts` with an exported `proxy` function. The behaviour is the same, and Proxy runs on the Node.js runtime."
  - title: Runs before routing
    text: "Proxy sees the request first and can redirect, rewrite to another path, set request or response headers, or answer directly."
  - title: Match narrowly
    text: "Without a `matcher` it runs on every request, including `_next/static` files, image optimisation and `public/` assets."
  - title: A filter, not a lock
    text: "Use it for optimistic checks like \"no session cookie, go to /login\". Real authorisation still belongs in each page, Route Handler and Server Action."
quiz:
  - q: "You upgrade to Next.js 16. What should `middleware.ts` become?"
    options: ["It keeps working unchanged forever", "`proxy.ts`, with the function renamed to `proxy`; middleware is deprecated", "A Route Handler at `app/middleware/route.ts`"]
    answer: 1
    explain: "The file convention and the `middleware` export are deprecated in favour of `proxy`. A codemod does the rename. Proxy always uses the Node.js runtime, so code written for the Edge runtime should be checked."
  - q: "Proxy redirects users without a session cookie to `/login` and has no matcher. After deploying, the login page has no styles. Why?"
    options: ["Proxy disables CSS", "It also runs for `_next/static` and other asset requests, which get redirected too", "The cookie is too large"]
    answer: 1
    explain: "With no matcher, Proxy runs on every request. Exclude static assets, image optimisation and public files with a negative matcher, or list only the paths that need the check."
  - q: "Is a session check in Proxy enough to protect a Server Action?"
    options: ["Yes: Proxy runs before everything", "No: a matcher change or moving the action to another route can silently remove coverage; check inside the action", "Yes, if the matcher is `/:path*`"]
    answer: 1
    explain: "The docs warn about exactly this. Proxy is good for fast, optimistic redirects; the authoritative check lives next to the data."
links:
  - { title: "Proxy (Next.js)", url: "https://nextjs.org/docs/app/getting-started/proxy" }
  - { title: "proxy.js API reference (Next.js)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/proxy" }
  - { title: "Upgrading to version 16 (Next.js)", url: "https://nextjs.org/docs/app/guides/upgrading/version-16" }
---
Proxy is a single `proxy.ts` file at the project root (next to `app/`, or inside `src/`) whose exported function runs before a request reaches any route. It gets a `NextRequest` and can let it through, redirect it, rewrite it to a different path while keeping the URL, add or change headers, or return a response itself. Until Next.js 15 this was called Middleware; Next.js 16 renamed it to Proxy to make clear that it sits at the network boundary in front of your app. The old file name and the `middleware` export are deprecated, and Proxy runs on the Node.js runtime, which you cannot change.

## A typical proxy

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("session")
  if (!hasSession && request.nextUrl.pathname.startsWith("/dashboard")) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }

  const response = NextResponse.next()
  response.headers.set("x-frame-options", "DENY")
  return response
}

export const config = {
  // everything except API routes, Next.js assets and common static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
```

The matcher is read at build time, so it must be a constant. Only one `proxy.ts` is allowed; split logic into modules and import them.

## What it is good for

- Redirects and rewrites that depend on the request: locale detection, A/B buckets, legacy URLs. (Fixed redirects are simpler in `next.config.ts`.)
- Headers for many routes at once, such as security headers or a request ID.
- Optimistic auth checks: is there a session cookie at all? Send obvious anonymous traffic to the login page before rendering anything.

## What it is not for

Proxy runs on every matched request, so anything slow in it slows every page. It isn't the place for database queries or full session validation, and `fetch` cache options have no effect inside it. More importantly, it is not an authorisation layer. A page can be reached through a rewrite, a Server Action is a `POST` to whatever route renders it, and a later change to the matcher pattern can exclude paths you meant to protect without any error. The Data Security guidance is to check authentication and authorisation where data is read or changed: in a data access layer used by Server Components, Route Handlers and Server Actions.

If you were using Middleware with `runtime = "edge"`, note that Proxy does not support the Edge runtime. The upgrade guide says to keep the old `middleware` file for now if you depend on Edge, but the Edge runtime itself is deprecated for routes in current Next.js, so plan to move that code to Node.js.

```trace diagram
id: before-routes
title: What runs before a route
subtitle: "proxy.ts at the project root, on the Node.js runtime"
elements:
  - { id: request, label: GET /dashboard, sub: no session cookie, kind: person, row: 0 }
  - { id: config, label: next.config, sub: "headers, then redirects", kind: component, tone: neutral, row: 1 }
  - { id: proxy, label: proxy.ts, sub: "Node.js only, one per app", kind: system, row: 2 }
  - { id: redirect, label: Redirect, sub: "/login?next=/dashboard", tone: stream, row: 3 }
  - { id: rewrite, label: Rewrite, sub: "another path, same URL", row: 3 }
  - { id: pass, label: NextResponse.next(), sub: "+ x-frame-options: DENY", row: 3 }
  - { id: own, label: Its own response, sub: "e.g. a 401", tone: neutral, row: 3 }
  - { id: routes, label: Routes, sub: "pages, route handlers, Server Actions", kind: system, row: 4 }
  - { id: dal, label: Data access layer, sub: "the real auth checks", kind: store, row: 5 }
edges:
  - { id: first, from: request, to: config }
  - { id: into, from: config, to: proxy }
  - { id: skip, from: config, to: routes, label: not matched, style: dashed }
  - { id: to-redirect, from: proxy, to: redirect }
  - { id: to-rewrite, from: proxy, to: rewrite }
  - { id: to-pass, from: proxy, to: pass }
  - { id: to-own, from: proxy, to: own }
  - { id: rewritten, from: rewrite, to: routes }
  - { id: passed, from: pass, to: routes }
  - { id: check, from: routes, to: dal, style: dotted }
steps:
  - caption: "Headers and redirects from next.config run first. Fixed redirects belong there; they are simpler than code."
    trace: [first]
  - caption: "Then, for every request its matcher selects, the exported proxy function runs, before any route. Until Next.js 15 this was Middleware; Proxy runs on Node.js, and that cannot be changed."
    trace: [into]
  - caption: "The matcher is read at build time, so it must be a constant. Paths it excludes skip Proxy entirely, including Server Actions posted to those paths."
    trace: [skip]
  - caption: "A typical use is an optimistic check: no session cookie on a /dashboard path means a redirect to the login page before anything renders."
    trace: [to-redirect]
  - caption: "A rewrite serves a different path while the URL stays the same, which suits locales, A/B buckets and legacy URLs."
    trace: [to-rewrite, rewritten]
  - caption: "Or it lets the request through and adds headers for many routes at once, such as security headers or a request ID."
    trace: [to-pass, passed]
  - caption: "It can also answer the request itself, without reaching a route."
    trace: [to-own]
  - caption: "Proxy is not an authorisation layer: a rewrite or a matcher change can route around it without any error. Check auth where data is read or changed, in a data access layer."
    trace: [check]
  - caption: "It runs on every matched request, so keep it fast: no database queries or full session validation. Proxy doesn't support the Edge runtime, and Edge is deprecated for routes, so plan on Node.js."
    focus: [proxy]
```
