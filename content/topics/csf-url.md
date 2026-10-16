---
id: csf-url
title: What happens when you type a URL
summary: Parse, resolve, connect, encrypt, request, render, in about a hundred milliseconds
why: "Every step is a place where a page load can be slow or fail. Knowing the order tells you whether to look at DNS, TLS, the server or the browser."
requires: [csf-networking, csf-text-encoding]
lesson: none
points:
  - title: Name to address
    text: "DNS turns the host name into an IP address, through caches in the browser, the OS and a resolver, and only rarely all the way from the root servers."
  - title: Connect and secure
    text: "A TCP handshake (or QUIC for HTTP/3), then a TLS handshake that checks the server's certificate and agrees keys."
  - title: Request and response
    text: "The browser sends an HTTP request with a method, path and headers; the server answers with a status, headers and a body."
  - title: Render
    text: "The browser parses HTML, fetches CSS, scripts and images (more requests), builds the page and paints it."
quiz:
  - q: "The first visit to a site is slower than the second, even with the browser's HTTP cache empty. Which step is most likely to be skipped the second time?"
    options:
      - "Rendering the HTML"
      - "The DNS lookup, because the answer is cached for its TTL"
      - "Sending the request"
    answer: 1
    explain: "Resolvers and the OS cache DNS answers for the record's time to live. Browsers may also reuse an existing connection, skipping TCP and TLS too."
  - q: What does the TLS certificate check prove?
    options:
      - "That the website is safe to use"
      - "That the server holds the private key for a certificate a trusted authority issued for that host name"
      - "That the connection is fast"
    answer: 1
    explain: "It authenticates the name, not the honesty of the site. The key exchange then makes the traffic confidential and tamper-evident."
  - q: In `https://example.com/search?q=caf%C3%A9`, what is `%C3%A9`?
    options:
      - "A tracking code"
      - "The UTF-8 bytes of é, percent-encoded so the URL contains only safe ASCII"
      - "A port number"
    answer: 1
    explain: "URLs carry non-ASCII text as UTF-8 bytes written as %XX. Host names use a different scheme, Punycode, for international domain names."
links:
  - { title: "RFC 9110: HTTP Semantics", url: "https://datatracker.ietf.org/doc/html/rfc9110" }
  - { title: "RFC 8446: TLS 1.3", url: "https://datatracker.ietf.org/doc/html/rfc8446" }
  - { title: "RFC 1034: Domain names, concepts and facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034" }
  - { title: "How browsers work: populating the page (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work" }
---
Typing `https://example.com/search?q=café` and pressing Enter sets off a chain of steps across several protocols and machines. Each depends on the one before, so the total time is roughly the sum of their round trips. When a page is slow, the browser's network panel shows the same breakdown: DNS, connect, TLS, waiting for the first byte, download.

## 1. Parse the URL

The browser splits the URL into a **scheme** (`https`), a **host** (`example.com`), an optional **port** (443 by default for https), a **path** (`/search`) and a **query** (`q=café`). Characters outside the safe ASCII set are percent-encoded as UTF-8 bytes, so the query becomes `q=caf%C3%A9`. If what you typed isn't a URL at all, the browser sends it to a search engine instead. It also checks the HSTS list: a site that has said "always use HTTPS" is never contacted over plain HTTP.

## 2. Resolve the name (DNS)

IP needs an address, not a name. The browser asks its own cache, then the operating system's, then a **recursive resolver** (your ISP's, your company's, or a public one). If the resolver doesn't have the answer cached, it walks the hierarchy: a root server points to the `.com` servers, which point to `example.com`'s authoritative servers, which return the A (IPv4) or AAAA (IPv6) record. Each answer carries a TTL saying how long it may be cached. This usually takes a few milliseconds when cached and tens to hundreds when not; it normally runs over UDP, falling back to TCP for large answers, and increasingly over encrypted DNS (DoH, DoT).

## 3. Connect

With an address, the browser opens a TCP connection to port 443 (one round trip for the handshake, as the previous topic describes), or, if the server advertised HTTP/3, a QUIC connection over UDP that combines the transport and TLS handshakes.

## 4. Secure the connection (TLS)

In TLS 1.3 the client sends its supported ciphers and a key share; the server replies with its key share and its **certificate**, signed by a certificate authority the browser trusts. The browser checks that the certificate is valid, unexpired and issued for `example.com`, and both sides derive the session keys. That is one more round trip (zero on some resumed connections). From now on everything, including the path and the headers, is encrypted; only the host name is generally visible to the network.

## 5. Request and response (HTTP)

The browser sends something like:

```
GET /search?q=caf%C3%A9 HTTP/1.1
Host: example.com
Accept: text/html
Cookie: session=…
```

(HTTP/2 and HTTP/3 send the same information as binary frames.) The request may pass through a CDN, a load balancer and a reverse proxy before an application server builds the response: a status (`200 OK`, `301`, `404`, `500`), headers such as `Content-Type: text/html; charset=utf-8` and `Cache-Control`, and the body. The gap between sending the request and receiving the first byte (TTFB) is mostly server time.

## 6. Render

The browser parses the HTML into the DOM as it arrives. Stylesheets, scripts, images and fonts it references are new requests, often reusing the same connection. CSS is parsed into the CSSOM; scripts may run and change the DOM; layout computes where every box goes; paint and compositing draw pixels. A page is "loaded" in stages, and what users notice is when the main content appears and when they can interact.

Each step has its own cache: DNS answers, open connections, TLS session tickets, HTTP responses. A fast second visit is mostly the result of skipping steps, not making them quicker.
