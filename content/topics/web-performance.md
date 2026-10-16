---
id: web-performance
title: "Core Web Vitals: LCP, INP and CLS"
summary: Loading, responding, staying still
why: "These three numbers are how Google, and most teams, judge whether a page feels fast. Each one has a short list of causes you can actually fix."
requires: [web-rendering-path, web-http-caching]
lesson: none
points:
  - title: LCP, loading
    text: "When the largest image or text block in the viewport has rendered. Good is 2.5 seconds or less; poor is over 4."
  - title: INP, responding
    text: "The slowest typical delay from a click, tap or key press to the next frame, over the whole visit. Good is 200 ms or less; poor is over 500."
  - title: CLS, staying still
    text: "The worst burst of unexpected layout shifts. Good is 0.1 or less; poor is over 0.25."
  - title: Judged at the 75th percentile
    text: "A page passes when at least 75% of real visits, on mobile and on desktop separately, are good on all three."
quiz_hint: Match the symptom to the step it belongs to, loading, the main thread, or layout, then ask what makes that step slow.
quiz:
  - q: "The LCP element is a hero image set as a CSS background, and LCP is 4.5 s. What is the most direct fix?"
    options: ["Minify the JavaScript bundle", "Make it an <img> in the HTML (with fetchpriority=\"high\"), so the browser finds and requests it early", "Add loading=\"lazy\" to it"]
    answer: 1
    explain: "A CSS background is only discovered after the stylesheet is downloaded and applied, which delays the request. An <img> in the HTML is found by the preload scanner straight away. Lazy-loading the LCP image makes it later, not sooner."
  - q: "Clicking 'Add to cart' runs a 400 ms handler before the button shows any change. Which metric suffers, and what helps?"
    options: ["CLS; reserve space for the button", "INP; show the change first and split or defer the rest of the work so the next frame can paint", "LCP; preload the button"]
    answer: 1
    explain: "INP measures from the input to the next paint. Update the UI right away, then do the rest of the work in a later task (with setTimeout or scheduler.yield() where it is supported) so the browser can render in between."
  - q: "Ads load into a slot with no height and push the article down. What fixes the CLS?"
    options: ["Reserve the slot's space up front, with a min-height or aspect-ratio", "Load the ad sooner", "Use a transform to move the article"]
    answer: 0
    explain: "A shift happens when an element changes position between frames for a reason the user didn't cause. Reserving space means nothing moves when the ad arrives. The same goes for images: give them width and height attributes."
links:
  - { title: "Web Vitals (web.dev)", url: "https://web.dev/articles/vitals" }
  - { title: "Largest Contentful Paint (web.dev)", url: "https://web.dev/articles/lcp" }
  - { title: "Interaction to Next Paint (web.dev)", url: "https://web.dev/articles/inp" }
  - { title: "Cumulative Layout Shift (web.dev)", url: "https://web.dev/articles/cls" }
---
Core Web Vitals are three measurements of what a real visitor experiences: how soon the main content appears (Largest Contentful Paint), how quickly the page reacts when they interact (Interaction to Next Paint), and how much the layout jumps around (Cumulative Layout Shift). They are measured on real visits and judged at the 75th percentile, so a fast laptop on office Wi-Fi tells you little about them.

## LCP: get the main thing on screen

LCP is the render time of the largest image, video poster or text block visible in the viewport. It splits into four parts, and each has its own fixes:

- **Time to first byte**: a slow server or a long redirect chain. Cache HTML at a CDN where possible, and avoid redirects.
- **Resource load delay**: the time before the browser even requests the LCP image. Put it in the HTML as an `<img>` rather than a CSS background or a script, add `fetchpriority="high"`, and never `loading="lazy"` on it.
- **Resource load duration**: the download. Serve a compressed, correctly sized image (`srcset`, AVIF or WebP) from a nearby cache.
- **Element render delay**: the file has arrived, but render-blocking CSS, a script or a client-side render is holding up the paint.

## INP: answer the user quickly

INP looks at the interactions of the whole visit (clicks, taps, key presses; not scrolling or hovering) and reports roughly the worst one. Each interaction is input delay (the main thread was busy), processing time (your handlers) and presentation delay (style, layout and paint of the next frame). INP replaced First Input Delay, which only measured the first interaction's input delay. To keep it low: break long tasks into smaller ones, show visual feedback before doing the heavy work, keep the DOM small so each update renders quickly, and watch third-party scripts, which share your main thread.

## CLS: don't move things under the user

Each unexpected shift scores the share of the viewport affected times the distance moved. Shifts are grouped into session windows (gaps under 1 second, at most 5 seconds long), and CLS is the worst window. Shifts within 500 ms of a tap, click or key press are excluded, because the user expected something to change.

```js run
// Layout shifts as a page might report them: when (ms), how big, and
// whether the user had just tapped or typed (hadRecentInput).
const shifts = [
  { time: 300, value: 0.05, hadRecentInput: false },  // a web font swaps in
  { time: 900, value: 0.04, hadRecentInput: false },  // an image without size loads
  { time: 2600, value: 0.2, hadRecentInput: true },   // the user opened a menu: excluded
  { time: 7000, value: 0.03, hadRecentInput: false }, // a late banner, much later
  { time: 7400, value: 0.08, hadRecentInput: false },
]

function cls(entries) {
  let worst = 0
  let current = 0
  let start = 0
  let last = -Infinity
  for (const e of entries) {
    if (e.hadRecentInput) continue
    // A gap of 1 s or more, or a window longer than 5 s, starts a new window.
    if (e.time - last >= 1000 || e.time - start > 5000) {
      current = 0
      start = e.time
    }
    current += e.value
    last = e.time
    worst = Math.max(worst, current)
  }
  return worst
}

// One shift's score: the share of the viewport affected times how far it moved.
const impactFraction = 0.75
const distanceFraction = 0.25
console.log("one shift:", impactFraction * distanceFraction)
console.log("CLS:", cls(shifts).toFixed(2))
```

The usual causes are images and embeds without dimensions, content injected above what is already shown, and web fonts that swap in with different metrics. Give media `width` and `height` (or `aspect-ratio`), reserve space for late content, and animate with `transform` rather than properties that move other boxes.

Measure in the field (the Chrome UX Report, or the `web-vitals` library sending data to your analytics) and debug in the lab (Lighthouse, the DevTools Performance panel). INP is the hardest to reproduce in the lab: a page-load test only measures it if you script the interactions yourself, so start from field data to learn which interactions are slow.
