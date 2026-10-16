---
id: web-rendering-path
title: From HTML to pixels
summary: Parse, style, layout, paint, composite
why: "Every slow first load and every janky animation is one of these steps taking too long, or running more often than it needs to."
requires: [event-loop]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: bytes-to-pixels
title: From bytes to a frame
subtitle: The first render, then what each later change reruns
groups:
  - { id: parse, label: Parsing }
  - { id: main, label: "Rendering step (main thread)" }
elements:
  - { id: html, label: HTML bytes, sub: arrive in chunks, kind: external, row: 0 }
  - { id: css, label: CSS bytes, sub: "<link rel=stylesheet>", kind: external, row: 0 }
  - { id: dom, label: DOM, sub: built as bytes arrive, group: parse, row: 1 }
  - { id: cssom, label: CSSOM, sub: render-blocking, group: parse, tone: stream, row: 1 }
  - { id: style, label: Style → render tree, sub: visible boxes + computed styles, group: main, row: 2 }
  - { id: layout, label: Layout, sub: sizes and positions, group: main, row: 3 }
  - { id: paint, label: Paint, sub: pixels into layers, group: main, row: 4 }
  - { id: composite, label: Composite, sub: can run off the main thread, kind: system, row: 5 }
  - { id: frame, label: Frame on screen, kind: person, row: 6 }
  - { id: geometry, label: "width, margin, new nodes", kind: component, tone: neutral, row: 2 }
  - { id: colour, label: "color, background", kind: component, tone: neutral, row: 3 }
  - { id: transform, label: "transform, opacity", kind: component, tone: neutral, row: 4 }
edges:
  - { id: parse-html, from: html, to: dom }
  - { id: parse-css, from: css, to: cssom }
  - { id: dom-in, from: dom, to: style }
  - { id: cssom-in, from: cssom, to: style }
  - { id: to-layout, from: style, to: layout }
  - { id: to-paint, from: layout, to: paint }
  - { id: to-composite, from: paint, to: composite }
  - { id: show, from: composite, to: frame }
  - { id: re-layout, from: geometry, to: layout, style: dashed }
  - { id: re-paint, from: colour, to: paint, style: dashed }
  - { id: re-composite, from: transform, to: composite, style: dashed }
steps:
  - caption: The HTML parser builds the DOM as the bytes arrive, one node per tag, without waiting for the whole file.
    focus: [html, dom]
    trace: [parse-html]
  - caption: "A stylesheet becomes the CSSOM. Parsing carries on, but nothing is painted until the CSS has arrived: any later rule could restyle anything."
    focus: [css, cssom]
    trace: [parse-css]
  - caption: "A classic script without defer or async stops the parser until it has run, and it also waits for the stylesheets before it. That is why scripts get defer."
    focus: [dom, cssom]
  - caption: "DOM and CSSOM combine into the render tree: only the boxes that will be shown, each with its computed styles. Nodes with display: none are left out."
    focus: [dom, cssom, style]
    trace: [dom-in, cssom-in]
  - caption: Layout walks the render tree and works out every box's size and position for the current viewport.
    focus: [style, layout]
    trace: [to-layout]
  - caption: Paint fills in the pixels, text, colours, borders and shadows, into one or more layers.
    focus: [layout, paint]
    trace: [to-paint]
  - caption: Compositing stacks the painted layers into the frame you see. This step can run on its own thread.
    focus: [paint, composite, frame]
    trace: [to-composite, show]
  - caption: "After that, each change reruns only from the stage it touches. Changing geometry, such as a width or a new node, reruns layout, paint and composite."
    focus: [geometry, layout, paint, composite]
    trace: [re-layout, to-paint, to-composite]
  - caption: Changing a colour or a background doesn't move anything, so layout is skipped and only paint and composite run again.
    focus: [colour, paint, composite]
    trace: [re-paint, to-composite]
  - caption: "A transform or an opacity change on its own layer skips layout and paint and only composites, which is why those animations stay smooth while JavaScript is busy."
    focus: [transform, composite, frame]
    trace: [re-composite, show]
  - caption: "Reading offsetWidth or getBoundingClientRect() right after a change forces layout to run at once. Alternate reads and writes in a loop and it runs every time."
    focus: [layout]
```
