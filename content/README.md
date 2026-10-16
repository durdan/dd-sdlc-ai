# Learning paths content

Paths and topics for `/learn/paths` are Markdown files with YAML front matter. They are read on the server by `lib/paths/load.ts`, checked, and laid out with elkjs (`lib/paths/layout.ts`); nothing is placed by hand. The ten system design paths come from `public/learn/catalog.json` automatically (their stages follow the `uses` links between steps).

Check everything with:

```sh
npm run paths:check
```

It runs the same validation as the pages and fails on unknown topic or library ids, missing fields, unknown fields, prerequisite cycles, prerequisites placed later in a path, quiz answers out of range, duplicate ids, unknown lesson types, broken lanes traces, broken flow diagrams and `next` links to unknown paths. Pages throw the same errors, so `next dev` shows them too. It then runs the code of every lanes trace that has `expect` (see below) and fails if the output differs.

## Add a topic: `content/topics/<id>.md`

```yaml
---
id: node-streams              # lowercase-with-dashes, same as the file name, not a library id
title: Streams and backpressure  # `backticks` render as code
summary: Data in chunks, at the reader's pace   # one line, shown on the map node
why: One line on why it matters.                 # optional
requires: [node-loop]         # optional: topic ids this builds on (drawn as arrows)
lesson: none                  # none | lanes | diagram | walkthrough:<library id>
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
- `diagram`: the topic's ```` ```trace diagram ```` blocks are the lesson (below), split from the body the same way as `lanes`. To keep the explanation first, put the block at the end of the body.
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

`tags` puts the path in the categories of the sidebar on `/learn/paths` (a path can be in several). Allowed: `web` (Web), `languages` (Languages & runtimes), `frameworks` (Frameworks), `mobile` (Mobile), `backend` (Backend), `devops` (DevOps & cloud), `data` (Data & databases), `testing` (Testing & QA), `security` (Security), `ai` (AI), `cs` (Computer science), `system-design` (System design). Any other value fails the check. Without `tags`, system design paths get `[system-design]`, and a few known path ids get defaults from `defaultTags()` in `lib/paths/types.ts` (for example `ios` → `[mobile]`); any other path without tags is listed only under "All paths" and the check warns. The group a path is listed in (Role, Skill or System design paths) comes from `kind`, not from tags.

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

## Writing a flow diagram

A diagram lesson draws boxes and arrows with the library's walkthrough engine (design-player), so it looks and moves like `/learn/p/...`: everything outside a step's focus fades back, the step's arrows draw in one by one with a travelling dot, and the camera follows the path when the diagram is too big to read whole (always on phones). There is no recorded audio; a step is held for about as long as it takes to read its caption (or, with the reader's Voice switch on, until the device has read it aloud). Set `lesson: diagram` and write one ```` ```trace diagram ```` block per diagram (several become tabs):

````md
```trace diagram
id: cache-read               # unique within the topic
title: A cached read         # tab and stage title
subtitle: Hit or miss?       # optional
kind: c4                     # c4 (boxes, laid out by ELK; the default) | sequence (participants and messages)
direction: DOWN              # c4 only: DOWN (default) | RIGHT; RIGHT diagrams get a top-to-bottom layout on phones
groups:                      # c4 only, optional: dashed boundaries
  - { id: app, label: Your service }
elements:                    # boxes (sequence: participants, id and label only)
  - { id: client, label: Client, kind: person }
  - { id: api, label: API, sub: "Spring Boot, 3 pods", group: app }   # sub: second line, also shown when the box is tapped
  - { id: cache, label: Redis, sub: TTL 60 s, tone: stream }
  - { id: db, label: PostgreSQL, kind: store }
edges:                       # arrows (sequence: messages, top to bottom); id is optional (e1, e2, ... in order)
  - { id: get, from: client, to: api, label: GET /items/7 }
  - { id: lookup, from: api, to: cache, label: GET item:7 }
  - { id: miss, from: api, to: db, label: on a miss, style: dashed }
steps:                       # at least two; each is one spoken-style sentence or two
  - caption: A client asks the API for item 7.
    focus: [client, api]     # optional: element (or group) ids to light; nothing listed shows the whole diagram
    trace: [get]             # optional: edge ids that draw in, in order
  - caption: The API tries Redis first. A hit answers in about a millisecond.
    focus: [api, cache]
    trace: [lookup]
  - caption: On a miss it reads PostgreSQL, then stores the row in Redis for next time.
    trace: [miss]
    note: Optional smaller line under the caption.
note: Optional line shown beside the controls.
```
````

- **Element kinds** (c4): `container` (default), `component`, `system` (bold outline), `person` (rounded), `external`, `store`. **Tones**: `core`, `stream`, `data`, `external`, `neutral`; the default follows the kind. **Edge styles**: `solid` (default), `dashed`, `dotted`.
- **Colours mean something**, and a legend under the diagram lists what this one uses.
  - **`role`** (any element, sequence participants too) sets a box's colour and corner icon: `client`, `service`, `data`, `cache`, `queue`, `security`, `edge` (CDN, load balancer, gateway, proxy, DNS, NAT), `external`, `error` (a failure or bad outcome: a crash, OOMKilled, a compile error, a timeout). Left out, it is worked out from `kind` (person → client, external → external, store → data, or cache/queue when its words say so), then from the box's own words (Redis → cache, Kafka/SQS → queue, IAM/JWT/ACL → security, ...), then from `tone`; otherwise `service`. Write it only where the guess is wrong.
  - **`flow`** (any edge) sets an arrow's colour: `main` (request or call, teal), `reply` (a return, grey), `async` (background or event, violet), `security` (a check, rose), `data` (a read or write, violet), `blocked` (dropped, rejected or refused, dark red dots). Left out, `solid` reads as `main`, `dashed` as `reply` and `dotted` as `async`. A dashed arrow that is not a reply (an optional path, a later call) needs a `flow`. A written `style` still sets the dash.
  - `npx tsx scripts/diagram-roles.ts [topic-id ...]` prints every box's role and every arrow's flow, written or guessed.
- **Other kinds of diagram** (same `steps`, same player):
  - **`kind: state`**, a lifecycle. Elements are states with `status: active | waiting | success | failure | decision` (default active) and `final: true` for states that end it; `initial: <id>` draws a start dot pointing at the first state. Edges are transitions, labelled with what causes them.
  - **`kind: delta`**, before and after a change. Mark elements and edges `change: added | removed | changed`; name the pictures with `before:` and `after:`. Each step can say `view: before | after | delta` (default delta, the changes); the reader can also switch pictures. One layout covers both, so nothing moves between them.
  - **`kind: waterfall`**, operations on a time axis: no `elements`/`edges`, but `rows: [{ id, label, start, end, lane, parent }]` (numbers in `unit:`, default ms), optional `lanes: [{ id, label, role }]` for colours. A row appears at the first step that focuses it (rows no step focuses are there from the start); a step with no focus shows every row. Timings are labelled illustrative.
  - **Sequence `phases`**: `phases: [{ label, from: <message id>, to: <message id> }]` shades and labels a run of messages. Activation bars (who is busy) are drawn automatically from calls and replies.
- **Captions** are what the reader reads while the step plays: plain, spoken-style sentences that say what happens and why. Lit boxes are the step's `focus` plus both ends of every traced edge.
- **Paused**, tapping a box shows its label, its `sub` and every step that lights it.
- **Layout** is computed once on the server (ELK, through design-player's `layoutDiagram`); nothing is placed by hand. Every edge label becomes its own ELK layer, so a long chain of labelled arrows gets long: prefer hubs (one box calling three) to chains, and leave labels off arrows the captions already explain. A return arrow back to an earlier box makes a cycle, which ELK may break in the wrong place; draw the response as its own box (`Response`) instead of an arrow back to the client.
- **Sequence diagrams** suit "who calls whom, in what order" with 3 to 5 participants. The participant names stay pinned at the top while the view moves, and on phones the columns are packed to the screen width; with 5 participants on a small phone the names get small, so keep labels short.
- **`row`** (c4 only, optional on any element): the row from the top, 0, 1, 2, ... Use it when arrows that point "backwards" would otherwise pull a box above the things that feed it; rows are laid out in order and groups wrap their members.
- **Overview steps**: a step with no `focus` and no `trace` shows the whole diagram.
- **Checked** by `npm run paths:check`: the YAML parses, ids are unique (elements, groups, edges, diagrams), edges join existing elements, `group`, `focus` and `trace` refer to existing ids, captions are not empty, there are at least two steps and the layout succeeds. It warns about elements no step lights.
- YAML tip, as for lanes: quote text that contains `: ` or a comma inside `{ ... }` (`sub: "encoding, Filter beans"`).
