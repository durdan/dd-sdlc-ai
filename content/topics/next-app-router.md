---
id: next-app-router
title: "The App Router: folders, layouts and pages"
summary: A folder per URL segment; layouts that wrap and stay put
why: "Every other Next.js feature (streaming, caching, prefetching) is organised by route segment. If you can read the folder tree as a tree of nested components, the rest of the framework stops being magic."
requires: [react-ui-as-function, web-rendering-strategies]
lesson: diagram
points:
  - title: Folders are segments
    text: "Each folder under `app/` is one segment of the URL. A folder only becomes a route when it contains a `page` file; `[slug]` makes a dynamic segment and `(group)` organises files without changing the URL."
  - title: Layouts nest and persist
    text: "A `layout` wraps every page below it. On navigation between sibling pages the shared layouts are kept, with their state, and only the part that changed is rendered."
  - title: Special files are boundaries
    text: "`loading` wraps the segment in a Suspense boundary, `error` in an error boundary, `not-found` handles missing content. Their position in the tree decides how much of the page they replace."
quiz:
  - q: "Which files make `/dashboard/settings` a route?"
    options: ["`app/dashboard/settings/layout.tsx` on its own", "`app/dashboard/settings/page.tsx` (layouts above it are optional except the root)", "`pages/dashboard/settings.tsx` inside `app/`"]
    answer: 1
    explain: "A segment is publicly reachable only when it has a `page` file. Layouts wrap pages but do not create routes. The root layout in `app/` is required and must render `<html>` and `<body>`."
  - q: "A user moves from `/dashboard/a` to `/dashboard/b`. Both share `app/dashboard/layout.tsx`, which holds a client sidebar with an open menu. What happens to the menu?"
    options: ["It closes: the whole tree is rendered again", "It stays open: the shared layout is kept and only the page segment changes", "The browser does a full page load"]
    answer: 1
    explain: "Navigation inside the same layout is a client-side transition. Next.js keeps the shared layout mounted, so client state in it survives. Only crossing to a different root layout causes a full page load."
  - q: "Why can a layout not read `searchParams`?"
    options: ["Because layouts are not rerendered on navigation, so the value would go stale", "Because search parameters are only available in Route Handlers", "Because layouts are always client components"]
    answer: 0
    explain: "A layout that stays mounted across navigations can't depend on values that change between them. Read query parameters in the page (its `searchParams` prop) or in a client component with `useSearchParams`."
links:
  - { title: "Layouts and Pages (Next.js)", url: "https://nextjs.org/docs/app/getting-started/layouts-and-pages" }
  - { title: "Project structure (Next.js)", url: "https://nextjs.org/docs/app/getting-started/project-structure" }
  - { title: "layout.js (Next.js)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/layout" }
  - { title: "loading.js (Next.js)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/loading" }
---
The App Router turns the folder tree under `app/` into a tree of React components. Each folder is a URL segment; inside it, a few specially named files say what that segment renders: `page` for the content, `layout` for the frame around it, `loading` and `error` for the in-between states. When a request comes in, Next.js picks the folders that match the URL and nests their files, outermost layout first. Seeing that nesting is the key to almost everything else: rendering, streaming and caching all happen per segment.

## From folders to a component tree

```text
app/
  layout.tsx            <html><body>…  (the root layout, required)
  page.tsx              /
  dashboard/
    layout.tsx          sidebar around every dashboard page
    loading.tsx         shown while a dashboard page is loading
    page.tsx            /dashboard
    [teamId]/
      page.tsx          /dashboard/acme, /dashboard/globex, …
  (marketing)/
    pricing/page.tsx    /pricing  (the group adds nothing to the URL)
```

For `/dashboard/acme`, the rendered tree is roughly:

```tsx
<RootLayout>
  <DashboardLayout>
    <Suspense fallback={<DashboardLoading />}>
      <TeamPage params={Promise.resolve({ teamId: "acme" })} />
    </Suspense>
  </DashboardLayout>
</RootLayout>
```

`loading.tsx` is shorthand for that Suspense boundary, and `error.tsx` adds an error boundary in the same way. Because they sit at a particular level, a slow or failing page replaces only its own segment; the sidebar in the dashboard layout stays on screen.

Dynamic segments arrive as `params`, which in Next.js 16 is a promise you `await` (synchronous access was removed). `generateStaticParams` can list known values so those pages are prerendered at build time.

## Layouts stay, pages change

A layout receives `children` (the segment below it) and wraps it. When the user navigates between two pages under the same layout, Next.js does a client-side transition: it fetches only the segments that differ and keeps the shared layouts mounted, with their client state and scroll positions. This is why a layout cannot read `searchParams` or the current pathname directly; it doesn't rerender when they change. Read those in the page, or in a client component with `useSearchParams` and `usePathname`.

Links rendered with `<Link>` are prefetched when they enter the viewport, so the data for the next segment is often in the browser before the click. How much is prefetched depends on what the route can prerender, which is the subject of the rendering topics later in this path.

## Colocation

Only `page` and `route` files are publicly reachable, so components, tests and helpers can live next to the route that uses them. Folders starting with `_` are private and never become routes. Route groups `(name)` let different sections have different root layouts; navigating between two root layouts is a full page load, since there is no shared frame to keep.

```trace diagram
id: segments
title: One URL, one tree of segments
subtitle: "What /dashboard/acme renders, and what a click to /dashboard/globex replaces"
groups:
  - { id: kept, label: Kept mounted on navigation }
elements:
  - { id: url, label: GET /dashboard/acme, sub: "matched folder by folder", kind: person, row: 0 }
  - { id: root, label: Root layout, sub: "app/layout.tsx, <html><body>", group: kept, row: 1 }
  - { id: dash, label: Dashboard layout, sub: "dashboard/layout.tsx, the sidebar", group: kept, row: 2 }
  - { id: error, label: error.tsx, sub: error boundary for the segment, kind: component, tone: neutral, row: 3 }
  - { id: loading, label: loading.tsx, sub: "a Suspense fallback", kind: component, tone: stream, row: 4, role: service }
  - { id: link, label: "<Link> to /dashboard/globex", sub: prefetched in the viewport, kind: component, tone: neutral, row: 4 }
  - { id: page, label: "[teamId]/page.tsx", sub: "params is a promise: { teamId: acme }", row: 5 }
  - { id: next, label: The globex page, sub: only the segment that changed, tone: stream, row: 5, role: service }
edges:
  - { id: match, from: url, to: root }
  - { id: wrap-dash, from: root, to: dash }
  - { id: wrap-error, from: dash, to: error }
  - { id: wrap-loading, from: error, to: loading }
  - { id: wrap-page, from: loading, to: page }
  - { id: click, from: link, to: next }
  - { id: swap, from: loading, to: next, label: on navigation, style: dashed, flow: main }
steps:
  - caption: "Next.js matches the URL against the folders under app/, one segment at a time: dashboard, then a dynamic [teamId] that takes the value acme."
    focus: [url, root]
    trace: [match]
  - caption: "The matched files nest, outermost first. The root layout holds <html> and <body>; the dashboard layout wraps every page below it in its sidebar."
    trace: [wrap-dash]
  - caption: "error.tsx and loading.tsx become an error boundary and a Suspense boundary at this level. While the page loads, its fallback shows and the sidebar stays on screen; if it throws, only this segment shows the error."
    trace: [wrap-error, wrap-loading]
  - caption: "Inside sits the page. In Next.js 16, params is a promise that the page awaits. generateStaticParams can list known teams so their pages are prerendered at build time."
    trace: [wrap-page]
  - caption: "A <Link> to another team is prefetched when it scrolls into view, so the data for the next segment is often in the browser before the click."
    focus: [link]
  - caption: "Clicking it is a client-side transition. Only the page segment that differs is fetched and swapped in; the shared layouts stay mounted, with their state and scroll position."
    trace: [click, swap]
    focus: [kept]
  - caption: "That is why a layout cannot read searchParams or the pathname directly: it does not rerender when they change. Read them in the page, or in a client component with useSearchParams and usePathname."
    focus: [dash]
  - caption: "Rendering, streaming and caching all happen per segment, so reading the folder tree as this nesting explains most of what follows. Navigating between two different root layouts is a full page load."
```
