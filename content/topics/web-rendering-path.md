---
id: web-rendering-path
title: From HTML to pixels
summary: Parse, style, layout, paint, composite
why: "Every slow first load and every janky animation is one of these steps taking too long, or running more often than it needs to."
requires: [event-loop]
lesson: none
points:
  - title: Two trees, then one
    text: "HTML becomes the DOM, CSS becomes the CSSOM, and together they give the render tree: only the boxes that will actually be shown, with their computed styles."
  - title: CSS blocks rendering
    text: "The browser won't paint until it has the CSS for the page, because a later rule could change anything. A classic script also stops the parser until it has run."
  - title: Layout, paint, composite
    text: "Layout works out sizes and positions, paint fills in the pixels, and compositing stacks the painted layers into the frame you see."
  - title: Cheapest change wins
    text: "Changing geometry reruns layout, paint and composite. Changing colour skips layout. Changing transform or opacity can often skip both and only composite."
quiz_hint: Think about which step a change forces the browser to redo, and everything that comes after it.
quiz:
  - q: "Which change usually costs the least per frame in an animation?"
    options: ["Animating width", "Animating top and left", "Animating transform: translateX()"]
    answer: 2
    explain: "width, top and left change geometry, so every frame reruns layout and paint. A transform moves an already painted layer, so the browser can often do it in the compositor alone, even while the main thread is busy."
  - q: "A page has a <link rel=stylesheet> in the head that takes 2 seconds to download. What does the user see meanwhile?"
    options: ["The unstyled HTML, then a jump when the CSS arrives", "Nothing from that page: rendering waits for the CSS", "The page, styled with the browser's defaults forever"]
    answer: 1
    explain: "Stylesheets in the head are render-blocking. Painting unstyled content and then restyling it would flash, so the browser waits. That is why critical CSS should be small and arrive early."
  - q: What does this loop do to the browser?
    code: |
      for (const box of boxes) {
        box.style.width = box.offsetWidth + 10 + "px"
      }
    options: ["Nothing special: style changes are batched until the next frame", "Forces a fresh layout on every iteration, because each read follows a write", "Throws, because offsetWidth is read-only"]
    answer: 1
    explain: "Reading offsetWidth needs up-to-date geometry, but the previous iteration just changed a width. The browser must lay out synchronously each time (layout thrashing). Read all the widths first, then write them all."
links:
  - { title: "Critical rendering path (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path" }
  - { title: "How browsers work (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work" }
  - { title: "Rendering performance (web.dev)", url: "https://web.dev/articles/rendering-performance" }
  - { title: "Event loop processing model (HTML Standard)", url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model" }
---
A browser turns bytes into a picture in a fixed order: parse the HTML into the DOM and the CSS into the CSSOM, combine them into a render tree, work out where every box goes (layout), fill in the pixels (paint), and stack the painted layers into a frame (composite). Knowing the order tells you what blocks the first paint and what each later change costs.

## The first render

The HTML parser builds the DOM incrementally, as bytes arrive. When it meets a stylesheet, it keeps parsing, but the browser won't render until that CSS has been fetched and parsed: the cascade means any later rule could restyle anything, so painting early would only flash wrong content. When the parser meets a classic `<script>` without `async` or `defer`, it stops, because the script might call `document.write` or read the DOM built so far. The script also waits for any stylesheet before it, since it might read computed styles.

That gives the usual rules for a fast first paint:

- Keep the CSS needed for the first screen small, and load it early.
- Mark scripts `defer` (run in order after parsing) or `async` (run as soon as they arrive, in any order), or use `type="module"`, which defers by default.
- Let the preload scanner help: it looks ahead in the raw HTML for images, scripts and stylesheets and starts fetching them early. Resources that only JavaScript discovers miss out on that.

## Every frame after that

Between tasks, the event loop may run a rendering step: `requestAnimationFrame` callbacks, then style recalculation, layout, paint and composite. Each step only reruns if something it depends on changed:

| You change | Reruns |
| --- | --- |
| `width`, `margin`, `font-size`, adding nodes | style, layout, paint, composite |
| `color`, `background`, `box-shadow` | style, paint, composite |
| `transform`, `opacity` (on its own layer) | style, composite |

Compositing can happen on a separate thread, which is why a CSS `transform` animation can stay smooth while JavaScript is busy, and a `left` animation can't.

## Forced layout

Style changes are normally batched until the next frame. Reading geometry (`offsetWidth`, `getBoundingClientRect()`, `scrollTop`) right after a change forces the browser to do layout immediately so it can answer. Done once, that is fine; done in a loop that alternates reads and writes, it is layout thrashing. Batch the reads, then the writes, or move the writes into `requestAnimationFrame`.
