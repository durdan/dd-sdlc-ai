# Learning paths content

Paths and topics for `/learn/paths` are Markdown files with YAML front matter. They are read on the server by `lib/paths/load.ts`, checked, and laid out with elkjs (`lib/paths/layout.ts`); nothing is placed by hand. The ten system design paths come from `public/learn/catalog.json` automatically (their stages follow the `uses` links between steps).

Check everything with:

```sh
npm run paths:check
```

It runs the same validation as the pages and fails on unknown topic or library ids, missing fields, unknown fields, prerequisite cycles, prerequisites placed later in a path, quiz answers out of range, duplicate ids, unknown lesson types, broken lanes traces and `next` links to unknown paths. Pages throw the same errors, so `next dev` shows them too. It then runs the code of every lanes trace that has `expect` (see below) and fails if the output differs.

## Add a topic: `content/topics/<id>.md`

```yaml
---
id: node-streams              # lowercase-with-dashes, same as the file name, not a library id
title: Streams and backpressure  # `backticks` render as code
summary: Data in chunks, at the reader's pace   # one line, shown on the map node
why: One line on why it matters.                 # optional
requires: [node-loop]         # optional: topic ids this builds on (drawn as arrows)
lesson: none                  # none | lanes | walkthrough:<library id>
points:                       # optional, up to 4: numbered key ideas in the page intro
  - { title: One thing at a time, text: One sentence. }
quiz_hint: Shown after a wrong answer.   # optional
quiz:                         # optional; all right = topic done
  - q: The question
    code: |                   # optional code shown with the question
      console.log(1)
    options: [first, second, third]
    answer: 1                 # index into options, from 0
    explain: Shown after the right answer.
links:                        # optional
  - { title: "Stream (Node.js API)", url: "https://nodejs.org/api/stream.html" }
---
The first paragraph is the lead: it opens the side panel and the topic page.

## Then the explanation

A fenced block marked `js run` gets a Try it editor that runs in a sandboxed iframe in the
browser (classic script, so no `import`; Node-only code should use a plain `js` block).
```

Lesson types (`components/paths/lessons.tsx`):

- `none`: the explanation, its Try it blocks and the quiz.
- `lanes`: the topic's ```` ```trace lanes ```` blocks are the lesson (below). Markdown before the first block is the explanation shown before the lesson; Markdown after it is shown after the quiz.
- `walkthrough:<id>`: a card linking to the library walkthrough `/learn/p/<id>` or `/learn/c/<id>`.

## Add a path: `content/paths/<id>.md`

```yaml
---
id: node
title: "Node.js: how the server side runs"   # text after ": " is highlighted
promise: One sentence on what you will understand.
kind: skill                    # skill | role | system-design
level: intermediate            # optional: beginner | intermediate | advanced
tags: [backend, languages]     # optional: categories on /learn/paths (see below)
stages:                        # columns on the map, left to right
  - title: Node's loop
    blurb: Phases, queues, the pool
    topics: [node-loop, node-nexttick]
bridges:                       # optional: library topic ids, or { id, why }
  - backpressure
  - { id: bulkhead, why: "Why this library topic follows on." }
next: [scaling-out]            # optional: path ids (drawn on the map of paths)
---
Optional Markdown shown under the map.
```

`tags` puts the path in the categories of the sidebar on `/learn/paths` (a path can be in several). Allowed: `web` (Web), `languages` (Languages & runtimes), `frameworks` (Frameworks), `mobile` (Mobile), `backend` (Backend), `testing` (Testing & QA), `ai` (AI), `system-design` (System design). Any other value fails the check. Without `tags`, system design paths get `[system-design]`, and a few known path ids get defaults from `defaultTags()` in `lib/paths/types.ts` (for example `ios` → `[mobile]`); any other path without tags is listed only under "All paths" and the check warns. The group a path is listed in (Role, Skill or System design paths) comes from `kind`, not from tags.

A topic can be on several paths; its progress is shared between them. The path is then live at `/learn/paths/<id>`, and each topic at `/learn/paths/<id>/<topic>`.

## Writing a lanes visualiser

A lanes lesson needs no code: set `lesson: lanes` and write one ```` ```trace lanes ```` block per snippet (several blocks become snippet tabs). Inside is YAML:

````md
```trace lanes
id: promise-first            # unique within the topic
title: Promise vs setTimeout # tab title
subtitle: Which runs first?  # optional
run: any                     # any (Node and browser, gets Try it) | node (Node only) | browser (not run by the checker)
module: cjs                  # cjs | esm: how the checker runs it in Node
code: |
  setTimeout(() => console.log("timeout"), 0);
  Promise.resolve().then(() => console.log("promise"));
lanes:                       # 3 to 6 work best; shown in this order
  - { id: stack, title: Call stack, kind: stack }                # stack: grows upwards, top is running
  - { id: tasks, title: Task queue, kind: queue, tone: amber }    # queue: a row, front first
  - { id: micro, title: Microtask queue, kind: queue }
  - { id: out, title: Console, kind: console }                    # at most one; plain strings
steps:
  - caption: Nothing has run yet.
  - line: 1                  # optional: the highlighted code line
    caption: The timer callback waits in the task queue.
    state: { stack: [main script], tasks: [timer callback] }
  - line: 2
    caption: The promise callback is queued as a microtask.
    state: { micro: [{ id: p, label: then callback }] }
  - caption: The script ends; microtasks run first.
    state: { stack: [{ id: p, label: then callback }], micro: [] }
    log: promise              # appends to the console lane (a string or a list)
  - caption: Then the timer.
    state: { stack: [timer callback], tasks: [] }
    log: timeout
note: Optional line shown under the controls.
expect: [promise, timeout]   # what the code prints
```
````

- **Carry forward**: a step lists only the lanes that changed (`state`); every other lane keeps its items from the step before. An empty list (`tasks: []`) empties a lane. All lanes start empty.
- **Items** are strings or `{ id, label, tone? }`. The id is what moves: an item with the same id in a later step glides from its old lane to its new one, even if its label changes. A plain string's id is its text, so give repeated or relabelled items an explicit id. An id can only be in one place per step.
- **Kinds**: `stack` and `plain` lanes pair up side by side; `queue` and `console` lanes take the full width. **Tones**: `plain`, `muted`, `amber`, `teal`, `blue`, `rose`, `violet` (per lane, or per item).
- **Checked** by `npm run paths:check`: the YAML parses, lane ids are unique and known, line numbers are inside the code, captions are not empty, item ids are not in two places at once, the last step's console equals `expect`, and, unless `run: browser`, the code is run with Node (2 s limit, stdout compared line by line with `expect`). Code using `window`, `document`, `requestAnimationFrame` or `localStorage` must be marked `run: browser`.
- YAML tip: quote text that contains `: ` or starts with a quote, and quote flow-list items that contain commas.

