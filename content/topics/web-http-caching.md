---
id: web-http-caching
title: HTTP caching for the web
summary: Cache-Control, ETags, hashed assets, CDNs
why: "The fastest request is the one that is never made. Wrong headers either make repeat visits slow or keep users stuck on an old version of your site."
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Fresh or stale
    text: "max-age says how many seconds a stored response stays fresh. While fresh, a cache answers without asking the server at all."
  - title: Revalidate cheaply
    text: "Once stale, the cache asks again with If-None-Match (the ETag it has). If nothing changed, the server replies 304 Not Modified with no body."
  - title: Hash the file names
    text: "Put a content hash in each asset's URL and cache it for a year with immutable. A new version gets a new URL, so nothing needs invalidating."
  - title: no-cache isn't no-store
    text: "no-cache means store it but check with the server before every use. no-store means don't keep it at all."
quiz_hint: For each response, ask who may store it (browser, CDN, both), for how long, and what happens when that time is up.
quiz:
  - q: "Which headers suit app.3f9a1c.js, a file whose name changes whenever its content does?"
    options: ["Cache-Control: no-cache", "Cache-Control: public, max-age=31536000, immutable", "Cache-Control: no-store"]
    answer: 1
    explain: "The URL is the version. It can be cached for a year, and immutable tells the browser not to revalidate it even on reload. A new build links to a new file name."
  - q: "And for index.html, which links to those hashed files?"
    options: ["max-age=31536000, so it never loads again", "no-cache (with an ETag), so every visit checks for a new version but downloads it only when it changed", "No headers at all"]
    answer: 1
    explain: "The HTML is the entry point that names the current assets, so it must never be served stale for long. With no-cache and an ETag, an unchanged page costs one small 304."
  - q: "An API response has Cache-Control: max-age=60, s-maxage=600. What does s-maxage change?"
    options: ["Shared caches such as a CDN keep it fresh for 600 seconds; the browser still uses 60", "The browser keeps it for 600 seconds", "Nothing; s-maxage is ignored when max-age is present"]
    answer: 0
    explain: "s-maxage applies only to shared caches and overrides max-age there. Private caches (the browser) ignore it. That lets a CDN absorb traffic while browsers check back more often."
links:
  - { title: "HTTP caching (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching" }
  - { title: "Cache-Control (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control" }
  - { title: "Prevent unnecessary network requests with the HTTP Cache (web.dev)", url: "https://web.dev/articles/http-cache" }
  - { title: "RFC 9111: HTTP Caching", url: "https://www.rfc-editor.org/rfc/rfc9111" }
---
Every response can carry instructions for the caches between your server and the user: the browser's own cache, and shared caches such as a CDN or a company proxy. `Cache-Control` says who may store a response and for how long it stays fresh; validators such as `ETag` let a cache check cheaply whether a stale copy is still right. Getting these two right is most of web caching.

## Freshness

A stored response is **fresh** until its age passes `max-age` seconds. A fresh response is used straight from the cache, with no network request at all. Once it is **stale**, the cache must revalidate before using it. Useful directives:

- `max-age=N`: fresh for N seconds. `s-maxage=N` does the same for shared caches only, overriding `max-age` there.
- `public` / `private`: `private` means only the user's browser may store it (personalised pages); shared caches must not.
- `no-cache`: may be stored, but must be revalidated before every use.
- `no-store`: must not be stored anywhere.
- `immutable`: the response won't change while it is fresh, so don't revalidate even when the user reloads.
- `stale-while-revalidate=N`: after it goes stale, it may still be served for N seconds while a fresh copy is fetched in the background.

Without `Cache-Control` or `Expires`, caches may guess a freshness lifetime from `Last-Modified` (heuristic caching). Set the headers yourself rather than relying on that.

## Revalidation

When the server sends an `ETag` (a version tag for the body) or `Last-Modified`, a cache holding a stale copy sends a conditional request with `If-None-Match` or `If-Modified-Since`. If the content hasn't changed, the server answers `304 Not Modified` with headers only, and the cache updates its stored copy with them, which makes it fresh again. You still pay a round trip, but not the download.

```js run
// What a cache does with a stored response when the same URL is asked for again.
function parse(cacheControl) {
  const out = {}
  for (const part of cacheControl.split(",")) {
    const [key, value] = part.trim().toLowerCase().split("=")
    if (key) out[key] = value === undefined ? true : Number(value)
  }
  return out
}

function decide(cacheControl, ageSeconds, shared) {
  const cc = parse(cacheControl)
  if (cc["no-store"]) return "not stored: go to the server"
  if (shared && cc["private"]) return "shared cache may not store it: go to the server"
  if (cc["no-cache"]) return "stored, but revalidate first (If-None-Match)"
  const lifetime = shared && cc["s-maxage"] !== undefined ? cc["s-maxage"] : cc["max-age"] ?? 0
  return ageSeconds < lifetime ? "fresh: use it, no request" : "stale: revalidate (If-None-Match)"
}

const cases = [
  ["public, max-age=31536000, immutable", 86400, false], // app.3f9a1c.js
  ["no-cache", 5, false],                               // index.html
  ["max-age=60, s-maxage=600", 300, true],              // an API response at a CDN
  ["max-age=60, s-maxage=600", 300, false],             // the same, in the browser
  ["private, max-age=600", 10, true],                   // a user's account page at a CDN
  ["no-store", 0, false],                               // a bank statement
]
for (const [cc, age, shared] of cases) {
  console.log(`${shared ? "CDN    " : "browser"} | ${cc} | age ${age}s -> ${decide(cc, age, shared)}`)
}

// Revalidation: the cache sends the ETag it has; a match means 304 Not Modified, no body.
const current = '"v7"'
const ifNoneMatch = '"v7"'
console.log(ifNoneMatch === current ? "304 Not Modified: reuse the stored body" : "200 OK with a new body")
```

This is a simplification of RFC 9111 (it ignores `Expires`, `Vary` and heuristics), but it is the decision every cache makes.

## A pattern that works

- **Hashed static assets** (`app.3f9a1c.js`, `logo.81b2.svg`): `public, max-age=31536000, immutable`. Your build tool writes the hash; a deploy changes the URL.
- **HTML**: `no-cache` with an `ETag`, or a short `max-age` at the CDN, so a new deploy is picked up on the next visit.
- **Personalised responses**: `private`, and `no-store` for anything sensitive.
- **Responses that differ by request header** (language, encoding): send `Vary` so a cache doesn't hand one user's variant to another.

A CDN is a shared cache close to the user. It follows the same headers, can be purged when you must, and usually adds its own controls on top. Purging is the escape hatch; hashed URLs are the plan.

```trace diagram
id: two-visits
title: Two visits, three caches' worth of answers
subtitle: "index.html is no-cache with an ETag; app.3f9a1c.js is cached for a year"
kind: sequence
elements:
  - { id: browser, label: Browser cache }
  - { id: cdn, label: CDN }
  - { id: origin, label: Origin }
edges:
  - { id: get-html, from: browser, to: cdn, label: GET / }
  - { id: miss, from: cdn, to: origin, label: "GET / (CDN miss)" }
  - { id: html-200, from: origin, to: cdn, label: "200, no-cache, ETag \"v7\"", style: dashed }
  - { id: html-down, from: cdn, to: browser, label: "200 + HTML: both store it", style: dashed }
  - { id: get-js, from: browser, to: cdn, label: GET /app.3f9a1c.js }
  - { id: js-hit, from: cdn, to: browser, label: "200 from the CDN: max-age=1 year, immutable", style: dashed }
  - { id: js-fresh, from: browser, to: browser, label: "next visit: app.3f9a1c.js is fresh, no request" }
  - { id: reval, from: browser, to: cdn, label: "GET /, If-None-Match: \"v7\"" }
  - { id: reval-origin, from: cdn, to: origin, label: "If-None-Match: \"v7\"" }
  - { id: not-modified, from: origin, to: cdn, label: "304 Not Modified, no body", style: dashed }
  - { id: not-modified-down, from: cdn, to: browser, label: "304, body reused", style: dashed }
steps:
  - caption: "The browser has its own private cache. The CDN is a shared cache in front of the origin server. Both obey the same Cache-Control headers."
    focus: [browser, cdn, origin]
  - caption: On the first visit nothing is cached, so the request for the page goes through the CDN to the origin.
    trace: [get-html, miss]
  - caption: "The origin answers with no-cache and an ETag. Both caches store the page, but no-cache means they must check with the server before every reuse."
    trace: [html-200, html-down]
  - caption: "The page links to app.3f9a1c.js. Another visitor already pulled it into the CDN, so the CDN answers without asking the origin, with max-age of a year and immutable."
    trace: [get-js, js-hit]
  - caption: "On the next visit the script is still fresh, so the browser uses its stored copy without any request. immutable means even a reload won't revalidate it."
    trace: [js-fresh]
  - caption: "The page is no-cache, so the browser revalidates. It sends the ETag it holds in If-None-Match."
    trace: [reval]
  - caption: The CDN's copy is no-cache too, so it asks the origin the same question before answering.
    trace: [reval-origin]
  - caption: "Nothing changed, so the origin sends 304 Not Modified, headers only. Both caches refresh their stored copy and reuse the body: one round trip, no download."
    trace: [not-modified, not-modified-down]
  - caption: "After a deploy, the origin's page gets a new ETag and links to a new file name. The next revalidation returns the new page, and the old script simply stops being asked for."
    focus: [origin, browser]
```
