---
id: nextjs
title: "Next.js: how it renders and caches"
promise: "What Next.js does with your React tree: how the App Router maps folders to nested layouts, where the server and client boundary falls, how a route becomes a prerendered shell with streamed holes, what `use cache` and `cacheLife` store and for how long, how Server Actions and revalidation fit together, and what the build and the deployment target change."
kind: skill
level: intermediate
tags: [web, frameworks]
stages:
  - title: The router
    blurb: Folders, layouts, the boundary
    topics: [next-app-router, next-server-client]
  - title: Rendering and caching
    blurb: Shells, holes, lifetimes, invalidation
    topics: [next-rendering, next-cache-components, next-revalidation]
  - title: The server side
    blurb: Actions, handlers, Proxy
    topics: [next-server-actions, next-route-handlers, next-proxy]
  - title: Shipping it
    blurb: Assets, targets, pitfalls
    topics: [next-assets-build, next-deployment, next-performance]
bridges:
  - id: cdn-caching
    why: "A prerendered static shell is meant to be served from a CDN. This is how the edge stores, revalidates and purges what Next.js produces."
  - id: bff
    why: "Route Handlers, Server Components and Server Actions together make Next.js a backend for one frontend. The library topic is that idea as a service of its own."
  - id: cache-aside
    why: "`use cache` on a data function is the same move as cache-aside: look up by key, otherwise compute and store. The difference is that the framework builds the key for you."
  - id: graceful-degradation
    why: "A Suspense fallback and an error boundary decide what the user sees while part of a page is slow or broken. Graceful degradation is that decision for a whole system."
next: [frontend, fast-reads]
---
Everything here is about Next.js 16 (16.4 at the time of writing) with the App Router and Cache Components, which `create-next-app` now turns on by default. Where the older caching model (route segment options, `fetch` cache options, `unstable_cache`) still applies to apps that have not opted in, the topic says so. The React topics on Server Components and Suspense are prerequisites and share their progress with the React path.
