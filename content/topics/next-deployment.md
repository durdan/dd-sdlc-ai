---
id: next-deployment
title: "Deployment targets: Node server, static export, platforms"
summary: Where it runs decides which features you keep
why: "The same code behaves differently on one Node server, ten containers, serverless functions or a folder of HTML. Caches, Server Actions and image optimisation all depend on what the target provides."
requires: [next-rendering, next-proxy]
lesson: diagram
points:
  - title: Node.js server supports everything
    text: "`next build` then `next start` (or a Docker image built with `output: \"standalone\"`) runs every feature: streaming, caching, actions, Proxy, image optimisation."
  - title: Static export drops the server
    text: "`output: \"export\"` writes HTML, CSS and JS to `out/`. Anything that needs a request at runtime (cookies, Proxy, Server Actions, ISR, default image optimisation) is unavailable."
  - title: Many instances need shared state
    text: "Each instance has its own in-memory cache and, by default, its own Server Action encryption key per build. Share the cache through a handler, fix the key, and set a `deploymentId` against version skew."
  - title: Node.js, not Edge
    text: "The Edge runtime is deprecated for routes; remove `export const runtime = \"edge\"`. Proxy and Cache Components run on Node.js."
quiz:
  - q: "Which feature still works in a static export?"
    options: ["Server Actions", "Pages with `generateStaticParams` for every dynamic value", "Proxy redirects"]
    answer: 1
    explain: "A static export is the prerendered output with no server. Dynamic routes work only if every value is known at build time. Proxy, actions, cookies, ISR and default image optimisation need a server."
  - q: "You run four containers behind a load balancer. Users sometimes see \"Failed to find Server Action\". The likeliest cause?"
    options: ["The actions are too large", "The instances use different encryption keys or builds; set NEXT_SERVER_ACTIONS_ENCRYPTION_KEY and deploy one build to all", "Proxy is blocking POST"]
    answer: 1
    explain: "A form rendered by one instance and submitted to another must decrypt the same way. The self-hosting guide recommends one build artifact, a fixed key, and a `deploymentId` for rolling deploys."
  - q: "A route still has `export const runtime = 'edge'` after upgrading. What should you do?"
    options: ["Nothing: Edge is the recommended runtime", "Remove the export; Node.js is the default and Edge is deprecated", "Move the route into Proxy"]
    answer: 1
    explain: "The current docs mark the Edge runtime as deprecated and tell you to delete the export. Vercel also recommends migrating from Edge to Node.js."
links:
  - { title: "Deploying (Next.js)", url: "https://nextjs.org/docs/app/getting-started/deploying" }
  - { title: "Self-Hosting (Next.js)", url: "https://nextjs.org/docs/app/guides/self-hosting" }
  - { title: "Static Exports (Next.js)", url: "https://nextjs.org/docs/app/guides/static-exports" }
  - { title: "runtime segment config (Next.js)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/runtime" }
---
A Next.js app can be deployed in four ways: as a Node.js server you run yourself, as a Docker container (the same server, packaged), as a static export with no server at all, or through a platform adapter such as Vercel's or Bun's. The first two support every feature. A static export supports only what can be computed at build time. Adapters support what their platform provides. Most surprises after deployment come from running several copies of the server, or from a serverless platform that throws away memory between requests.

## A Node.js server

```json
{ "scripts": { "build": "next build", "start": "next start" } }
```

`next start` serves prerendered shells, streams dynamic holes, runs Server Actions, Route Handlers and Proxy, and optimises images. For containers, `output: "standalone"` copies only the files and `node_modules` the server needs into `.next/standalone`, which keeps images small. Put a reverse proxy such as nginx in front: it deals with slow clients and malformed requests better than the app server.

## A static export

```ts
// next.config.ts
export default { output: "export" }
```

`next build` then writes `out/` with one HTML file per route, which any static host or bucket can serve. Not available: dynamic routes without `generateStaticParams`, cookies and headers, rewrites, redirects, Proxy, Server Actions, ISR, draft mode, and image optimisation with the default loader (use a custom loader or `unoptimized`). It is a good start for a marketing site or an SPA, and you can switch to a server later.

## Many instances

When you scale out, each copy of the server starts with its own state:

- **Cache**: the default `use cache` store is in memory per instance, and the ISR page cache is on local disk. Configure `cacheHandlers` (for `use cache: remote`) or `cacheHandler` with Redis or similar so all instances share entries and tag invalidations.
- **Server Action keys**: closure encryption uses a key generated per build. Build once and deploy the same artifact everywhere, or set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.
- **Version skew**: during a rolling deploy, a browser may hold an old page and talk to a new server. Setting `deploymentId` lets Next.js detect the mismatch and do a full reload instead of a broken client navigation.

## Runtimes

Next.js has two server runtimes. Node.js is the default and supports everything. The Edge runtime, a subset of Web APIs that once promised faster cold starts, is deprecated in current Next.js: remove `export const runtime = "edge"` from routes. Proxy runs on Node.js, and Cache Components doesn't accept the `runtime` option at all. Vercel likewise recommends migrating from Edge to Node.js functions, and its docs note that from Next.js 16.3 routes and pages run on Node.js there regardless of the setting. On serverless platforms in general, remember that function instances are short-lived: a cache that works on your laptop may barely hit in production unless it is shared.

```trace diagram
id: deploy-shapes
title: One build, three ways to run it
subtitle: And what changes when there is more than one server
groups:
  - { id: fleet, label: Several instances }
elements:
  - { id: build, label: next build, sub: one artifact, kind: system, row: 0 }
  - { id: node, label: next start, sub: "Node.js server, every feature", row: 1 }
  - { id: docker, label: Docker container, sub: 'output: "standalone"', row: 1 }
  - { id: export, label: Static export, sub: 'output: "export" → out/', tone: neutral, row: 1 }
  - { id: host, label: Static host or bucket, sub: "no Proxy, actions, cookies or ISR", kind: external, row: 2 }
  - { id: nginx, label: Reverse proxy, sub: "nginx: slow clients, bad requests", kind: external, row: 2 }
  - { id: a, label: Instance A, group: fleet, row: 3 }
  - { id: b, label: Instance B, sub: during a rolling deploy, group: fleet, row: 3 }
  - { id: cache, label: Shared cache handler, sub: "Redis: entries and tag invalidations", kind: store, row: 4 }
  - { id: key, label: Same encryption key, sub: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY, kind: component, tone: neutral, row: 4 }
  - { id: skew, label: deploymentId, sub: "a mismatch means a full reload", kind: component, tone: neutral, row: 4 }
edges:
  - { id: start, from: build, to: node }
  - { id: pack, from: build, to: docker }
  - { id: write, from: build, to: export }
  - { id: upload, from: export, to: host }
  - { id: front-node, from: node, to: nginx }
  - { id: front-docker, from: docker, to: nginx }
  - { id: to-a, from: nginx, to: a }
  - { id: to-b, from: nginx, to: b }
  - { id: a-cache, from: a, to: cache }
  - { id: b-cache, from: b, to: cache }
  - { id: a-key, from: a, to: key, style: dotted }
  - { id: b-key, from: b, to: key, style: dotted }
  - { id: b-skew, from: b, to: skew, style: dotted }
steps:
  - caption: "next start runs the Node.js server, which supports every feature: prerendered shells, streamed holes, Server Actions, Route Handlers, Proxy and image optimisation."
    trace: [start]
  - caption: "A Docker container is the same server, packaged. output: \"standalone\" copies only the files and node_modules it needs into .next/standalone, which keeps the image small."
    trace: [pack]
  - caption: "A static export writes one HTML file per route for any static host. Proxy, Server Actions, cookies and headers, rewrites, redirects, ISR and default image optimisation are not available."
    trace: [write, upload]
  - caption: "Put a reverse proxy in front of the server: it deals with slow clients and malformed requests better than the app does. It must pass streamed responses through without buffering them."
    trace: [front-node, front-docker]
  - caption: "When you scale out, each copy starts with its own state. Most surprises after deployment come from exactly this."
    trace: [to-a, to-b]
  - caption: "The default \"use cache\" store is memory on each instance and the ISR page cache is local disk. A cacheHandlers or cacheHandler backed by Redis lets every instance share entries and tag invalidations."
    trace: [a-cache, b-cache]
  - caption: "Server Action closures are encrypted with a key generated per build. Build once and deploy that artifact everywhere, or set NEXT_SERVER_ACTIONS_ENCRYPTION_KEY."
    trace: [a-key, b-key]
  - caption: "During a rolling deploy, a browser holding an old page may reach a new server. With deploymentId set, Next.js detects the mismatch and does a full reload instead of a broken navigation."
    trace: [b-skew]
  - caption: "Node.js is the default runtime and supports everything; the Edge runtime is deprecated. On serverless platforms instances are short-lived, so a cache that works on your laptop may barely hit unless it is shared."
```
