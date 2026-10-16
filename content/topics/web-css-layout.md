---
id: web-css-layout
title: "CSS layout: flow, flexbox and grid"
summary: One dimension or two, content or container
why: "Most layout bugs come from fighting the wrong layout mode. Picking the right one first makes the CSS short and the page robust to content you didn't expect."
requires: [web-rendering-path]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Flow comes first
    text: "Without any layout CSS, block boxes stack top to bottom and inline content wraps in lines. A lot of a page needs nothing more."
  - title: Flexbox is one-dimensional
    text: "It lays items out along one axis, a row or a column, and shares the free space between them. Wrapped lines don't line up with each other."
  - title: Grid is two-dimensional
    text: "It defines rows and columns on the container, and items are placed into cells that line up in both directions."
  - title: Content out, or layout in
    text: "Let the items' sizes drive the layout: flexbox. Define the structure first and put items into it: grid."
quiz_hint: Ask whether the boxes need to line up in one direction or in two, and whether their size or the container's tracks should decide.
quiz:
  - q: "A row of tags of different lengths should wrap onto as many lines as needed, each line packed from the left. Which fits best?"
    options: ["display: grid with fixed columns", "display: flex with flex-wrap: wrap", "Floats"]
    answer: 1
    explain: "Each tag's own width should decide how many fit on a line, and lines don't need to align with each other: that is flexbox's model. A grid would force every tag into equal columns."
  - q: "A card gallery must keep its columns aligned across every row, with as many 200px-or-wider columns as fit. Which is the usual tool?"
    code: |
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }
    options: ["This grid: auto-fill makes as many tracks as fit, minmax shares the leftover space", "Flexbox, because it is the only one that can wrap", "A table"]
    answer: 0
    explain: "Grid defines the columns on the container, so every row lines up. auto-fill with minmax(200px, 1fr) gives as many columns as fit without media queries."
  - q: "In a flex row, a long word makes one item overflow instead of shrinking. Why?"
    options: ["flex-shrink is 0 by default", "A flex item's min-width defaults to auto, its content's minimum size, so it won't shrink below the longest word", "Flex items can never shrink"]
    answer: 1
    explain: "min-width: auto on flex items means 'no smaller than my content'. Set min-width: 0 (or overflow: hidden) on the item to let it shrink, and handle the text with overflow-wrap or text-overflow."
links:
  - { title: "CSS layout (MDN)", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout" }
  - { title: "Grid and other layout methods (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods" }
  - { title: "Flexbox (web.dev Learn CSS)", url: "https://web.dev/learn/css/flexbox" }
  - { title: "Grid (web.dev Learn CSS)", url: "https://web.dev/learn/css/grid" }
---
CSS gives you a few layout modes, and each one answers a different question. Normal flow stacks blocks and wraps text. Flexbox spreads items along one line and shares out the spare space. Grid draws rows and columns first and places items into them. Choosing between them is mostly a matter of how many directions things need to line up in.

## Normal flow

Every element is laid out in flow until you say otherwise. Block boxes (`div`, `p`, `section`, headings) take the full width and stack vertically, with vertical margins that can collapse into each other. Inline content (text, `a`, `span`, `img`) flows in lines and wraps. Headings, paragraphs and lists in a readable column need nothing more than a `max-width` and sensible margins. `position: absolute` and `fixed` take an element out of flow entirely, so nothing else makes room for it.

## Flexbox: along one axis

`display: flex` on a container makes its children flex items laid out along the main axis (a row by default, a column with `flex-direction: column`). The items' own sizes come first; `flex-grow`, `flex-shrink` and `flex-basis` then decide how leftover space is shared or how overflow is taken back. `justify-content` places items along the main axis and `align-items` across it. With `flex-wrap: wrap`, extra items move to a new line, but each line is laid out on its own, so the items don't form columns.

Good fits: a toolbar, a navigation bar, a button with an icon and a label, a list of tags, centring one thing inside another.

## Grid: rows and columns together

`display: grid` defines tracks on the container with `grid-template-columns` and `grid-template-rows`. The `fr` unit shares out free space, `minmax()` sets limits, and `repeat(auto-fill, ...)` creates as many tracks as fit. Items are placed into cells automatically or by line numbers and named areas, and `gap` spaces the tracks. Because the tracks belong to the container, items in different rows line up. `subgrid` lets a nested grid reuse its parent's tracks, so the parts of cards in a row can align too.

Good fits: a page frame (header, sidebar, main, footer), a card gallery, a form with aligned labels, anything that looks like a table but isn't tabular data.

## Choosing

- Does it need to line up in two directions? Grid.
- Should the content's size decide where things go? Flexbox.
- Is it text and stacked blocks? Leave it in flow.

They nest freely: a grid page whose header is a flex row, whose cards use flow inside. For components that move between narrow and wide slots, container queries (`@container`) let a component respond to its own width rather than the viewport's.

```trace diagram
id: grid-sizing
title: How a grid sizes its tracks
subtitle: "grid-template-columns: 200px 1fr 2fr; gap: 20px, in an 840px container"
groups:
  - { id: columns, label: Columns first }
elements:
  - { id: css, label: The grid container, sub: "840px wide, 5 children", kind: component }
  - { id: place, label: Place the items, sub: "auto-placement, row by row" }
  - { id: sizing, label: Size the columns, sub: the container's width is known, group: columns, kind: system }
  - { id: fixed, label: Fixed track, sub: 200px, group: columns }
  - { id: gaps, label: Gaps, sub: "2 × 20px = 40px", group: columns }
  - { id: fr, label: fr tracks, sub: "600px left: 1fr = 200, 2fr = 400", group: columns, tone: stream, role: service }
  - { id: rows, label: Then the rows, sub: "auto: the tallest item in each row" }
  - { id: items, label: Lay out each item, sub: "stretch fills the cell by default" }
  - { id: result, label: Aligned grid, sub: every row shares the same columns, kind: person }
edges:
  - { id: e-place, from: css, to: place }
  - { id: e-cols, from: place, to: sizing }
  - { id: e-fixed, from: sizing, to: fixed }
  - { id: e-gaps, from: sizing, to: gaps }
  - { id: e-fr, from: sizing, to: fr }
  - { id: e-rows, from: fixed, to: rows }
  - { id: e-rows2, from: gaps, to: rows }
  - { id: e-rows3, from: fr, to: rows }
  - { id: e-items, from: rows, to: items }
  - { id: e-result, from: items, to: result }
steps:
  - caption: "A grid container 840px wide defines three columns, 200px, 1fr and 2fr, with a 20px gap, and has five children."
    focus: [css]
  - caption: "The items are placed before anything is sized. Auto-placement fills the cells in order, row by row, so with three columns the fourth and fifth items start a second row the grid creates implicitly."
    focus: [css, place]
    trace: [e-place]
  - caption: Then the browser sizes the columns, because the container's width is already known. Fixed tracks simply take their size, here 200px.
    focus: [place, sizing, fixed]
    trace: [e-cols, e-fixed]
  - caption: "Gaps are treated as fixed tracks too: two gaps of 20px take another 40px."
    focus: [sizing, gaps]
    trace: [e-gaps]
  - caption: "The fr tracks share whatever is left. 840 minus 200 minus 40 leaves 600px, split 1 to 2: 200px and 400px."
    focus: [sizing, fr]
    trace: [e-fr]
  - caption: "A plain 1fr means minmax(auto, 1fr), so a track won't shrink below its content's minimum size. One long URL can widen it; minmax(0, 1fr) lets it shrink."
    focus: [fr]
  - caption: "With the column widths known, the rows are sized. Each auto row becomes as tall as the tallest item in it, at that item's column width."
    focus: [fixed, gaps, fr, rows]
    trace: [e-rows, e-rows2, e-rows3]
  - caption: "Finally each item is laid out inside its cell. The default stretch fills the cell; align-self and justify-self place it otherwise."
    focus: [rows, items, result]
    trace: [e-items, e-result]
  - caption: "Flexbox works the other way round. Each item's flex-basis comes first and the spare space is shared per line, which is why wrapped flex lines don't form columns."
```
