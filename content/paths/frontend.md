---
id: frontend
title: "Frontend engineer: from JavaScript to a fast, accessible page"
promise: "What a frontend engineer needs underneath the framework: how JavaScript runs, how the browser turns your code into pixels and events, what makes a page accessible, fast and safe, and how to test the journeys that matter."
kind: role
tags: [web]
level: intermediate
stages:
  - title: The language
    blurb: How JavaScript runs and waits
    topics: [call-stack, closures, event-loop, promises, async-await, modules]
  - title: The browser
    blurb: Pixels, events, layout, access
    topics: [web-rendering-path, web-dom-events, web-css-layout, web-accessibility]
  - title: The network and the user
    blurb: Caching, security, rendering, speed
    topics: [web-http-caching, web-security, web-rendering-strategies, web-performance]
  - title: Shipping with confidence
    blurb: What to test, and in a real browser
    topics: [qa-strategy, qa-unit-tests, qa-e2e-playwright]
bridges:
  - id: cdn-caching
    why: "Hashed assets, cached HTML and streamed pages all end up at a CDN. This is how the edge stores, revalidates and purges them."
  - id: bff
    why: "A backend shaped for one frontend: fewer round trips, payloads that match the screen, and a place to keep secrets out of the browser."
  - id: feature-flags
    why: "Ship the code dark, turn it on for a few users, watch the Web Vitals and errors, then roll out or back without a deploy."
next: [fast-reads, apis-edge]
---
The first stage is shared with the JavaScript path, the last with QA automation; progress on shared topics counts on every map they appear on. The web topics are framework-neutral: what you learn about rendering, events and caching applies whether you use React, Vue, Svelte or none.
