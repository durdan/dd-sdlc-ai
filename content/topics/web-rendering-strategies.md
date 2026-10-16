---
id: web-rendering-strategies
title: "Rendering strategies: CSR, SSR, static and streaming"
summary: Where and when the HTML is made
why: "Choosing where HTML is produced decides your first paint, your server bill, how fresh pages are and how much JavaScript every visitor downloads."
requires: [web-rendering-path, web-http-caching]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Client-side rendering
    text: "The server sends an almost empty page and a bundle; the browser builds the HTML. Simple to host, slow to first content on weak phones."
  - title: Server-side rendering
    text: "The server builds the HTML for each request, so content arrives in the first response. The page still needs JavaScript to become interactive."
  - title: Static generation
    text: "The HTML is built once, ahead of time, and served from a CDN. The fastest and cheapest, as long as the content can be the same for everyone."
  - title: Streaming and hydration
    text: "Streaming sends the HTML in pieces as each part is ready. Hydration attaches event handlers to server-rendered HTML; the less of it, the sooner the page responds."
quiz_hint: Ask when the HTML for this page can be produced (at build time, per request, or in the browser) and whether it differs per user.
quiz:
  - q: "A documentation site changes a few times a day and looks the same for every visitor. Which strategy fits best?"
    options: ["Client-side rendering", "Static generation, rebuilt or revalidated when content changes, served from a CDN", "Server-side rendering on every request"]
    answer: 1
    explain: "Identical content for everyone can be built once and cached at the edge. Rendering it per request costs server time for the same output every time."
  - q: "A server-rendered product page shows its content quickly, but taps do nothing for two seconds. What is the likely cause?"
    options: ["The CDN is slow", "The page is waiting for its JavaScript to download, run and hydrate before handlers are attached", "Server rendering always disables clicks"]
    answer: 1
    explain: "SSR moves content earlier, not interactivity. Until hydration runs, the buttons are just HTML. Shipping less JavaScript, or hydrating only the interactive parts, closes the gap."
  - q: "What does streaming the server response buy you?"
    options: ["Smaller HTML", "The browser can start on the head and the first content while the slower parts, such as a recommendations panel, are still being rendered", "No need for a server"]
    answer: 1
    explain: "Without streaming, the slowest data source sets the time to first byte for the whole page. With it, the shell and fast sections arrive first and the rest fills in as it is ready."
links:
  - { title: "Rendering on the web (web.dev)", url: "https://web.dev/articles/rendering-on-the-web" }
  - { title: "Server-side rendering (MDN glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/SSR" }
  - { title: "Critical rendering path (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path" }
---
Every page's HTML gets made somewhere: in the browser from JavaScript, on a server for each request, or once at build time. Most frameworks now let you choose per route, and mix them within a page. The choice is a trade between how soon content appears, how fresh and personal it can be, how much it costs to serve, and how much JavaScript the visitor must run before the page responds.

## The options

**Client-side rendering (CSR).** The server returns a shell and a script bundle; the script fetches data and builds the DOM. Hosting is trivial and navigation inside the app can be quick, but nothing useful appears until the bundle has downloaded and run, which hurts LCP on slow phones and networks. Good for tools behind a login where search engines don't matter.

**Server-side rendering (SSR).** The server runs the same components for each request and sends real HTML. Content appears in the first response and can be personalised, but every request costs server time, and the time to first byte includes your slowest data fetch unless you stream.

**Static generation (SSG, prerendering).** Pages are rendered at build time and served as files, ideally from a CDN. It is the fastest and cheapest to serve, but the content is the same for every visitor and only as fresh as the last build. Many frameworks add regeneration: rebuild a page in the background after a time limit or when content changes, which brings static pages close to SSR's freshness.

**Streaming.** The server sends the document in chunks: the head and page shell first, then each section as its data arrives. The browser starts parsing, fetching CSS and painting from the first chunk. A slow recommendations panel no longer delays the whole page.

## Hydration

Server-rendered or static HTML is visible but not yet interactive. Hydration runs the components again in the browser so they can attach event handlers and take over. Until it finishes, clicks may do nothing, and the work itself is a long task that can hurt INP. Ways to do less of it:

- **Partial or island hydration**: only the interactive parts (a cart button, a search box) ship and run JavaScript; the rest stays plain HTML.
- **Server components**: some frameworks render parts only on the server and send no JavaScript for them at all.
- **Progressive enhancement**: make forms and links work as plain HTML, so the page is usable before any script runs.

## Choosing

- Same for everyone, changes rarely: static, served from a CDN, with regeneration on change.
- Personal or changes every request, and first paint matters: SSR, streamed.
- An app behind a login with heavy interaction: CSR is acceptable, but keep the shell fast.
- Most real sites mix them: a static marketing page, a server-rendered product page, a client-rendered dashboard.

Whatever you choose, cache what you can (static output and shared SSR responses at a CDN), and measure the result with field data rather than assuming one strategy is fast.

```trace diagram
id: four-ways
title: One product page, four ways
subtitle: Who builds the HTML, and when it reaches the browser
groups:
  - { id: build, label: Build time }
  - { id: server, label: Per request }
  - { id: browser, label: In the browser }
elements:
  - { id: data, label: Data and APIs, sub: "products, prices, the user", kind: store, tone: data }
  - { id: ssg, label: Static build, sub: renders every page once, group: build }
  - { id: cdn, label: CDN, sub: serves files from the edge, kind: external, role: edge }
  - { id: ssr, label: Server render, sub: whole page per request, group: server }
  - { id: stream, label: Streaming render, sub: "shell first, sections as ready", group: server, tone: stream, role: service }
  - { id: csr, label: JS bundle runs, sub: "fetches data, builds the DOM", group: browser }
  - { id: visible, label: Content visible, sub: real HTML from the start, group: browser, role: client }
  - { id: hydrate, label: Hydration, sub: attaches the handlers, group: browser, tone: stream, role: service }
  - { id: ready, label: Interactive page, kind: person }
edges:
  - { id: shell, from: cdn, to: csr, label: empty shell + bundle }
  - { id: csr-data, from: data, to: csr, style: dotted, flow: data }
  - { id: csr-ready, from: csr, to: ready }
  - { id: ssr-data, from: data, to: ssr, flow: data }
  - { id: ssr-html, from: ssr, to: visible }
  - { id: hydrate-in, from: visible, to: hydrate }
  - { id: hydrated, from: hydrate, to: ready }
  - { id: build-data, from: data, to: ssg, flow: data }
  - { id: files, from: ssg, to: cdn }
  - { id: static-html, from: cdn, to: visible }
  - { id: stream-data, from: data, to: stream, flow: data }
  - { id: chunks, from: stream, to: visible, style: dashed, flow: async }
steps:
  - caption: The same product page can be made in four ways. The question is always who turns the data into HTML, and when that HTML reaches the browser.
  - caption: "With client-side rendering, a host sends an almost empty shell and a script bundle. Nothing useful shows until the bundle has downloaded, fetched the data and built the DOM, which is slow on weak phones."
    focus: [cdn, csr, data]
    trace: [shell, csr-data]
  - caption: Once it has rendered, the page is interactive straight away, because the same code built it and attached the handlers.
    focus: [csr, ready]
    trace: [csr-ready]
  - caption: "With server-side rendering, the server fetches the data and renders the whole page for each request. Content arrives in the first response and can be personal, but the first byte waits for the slowest fetch."
    focus: [data, ssr, visible]
    trace: [ssr-data, ssr-html]
  - caption: "Visible is not interactive. Hydration runs the components again in the browser to attach event handlers; until it finishes, taps may do nothing, and the work itself can hurt INP."
    focus: [visible, hydrate, ready]
    trace: [hydrate-in, hydrated]
  - caption: "With static generation, every page is rendered once at build time and served as a file from a CDN. It is the fastest and cheapest, but the same for everyone and only as fresh as the last build."
    focus: [data, ssg, cdn, visible]
    trace: [build-data, files, static-html]
  - caption: Static pages still need hydration to become interactive, just like server-rendered ones.
    focus: [visible, hydrate]
  - caption: "With streaming, the server sends the head and the page shell first, then each section as its data arrives. The browser starts on the CSS and the first paint while a slow panel is still rendering."
    focus: [data, stream, visible]
    trace: [stream-data, chunks]
  - caption: "Hydrate less to close the gap: islands hydrate only the interactive parts, and server components send no JavaScript for the rest. Most sites mix these strategies per route."
    focus: [hydrate]
```
