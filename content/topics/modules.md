---
id: modules
title: Modules (ESM vs CommonJS)
summary: import vs require
why: Mixing the two is behind most "cannot use import statement outside a module" and default-export puzzles.
lesson: diagram   # the flow diagram block at the end is the lesson
quiz:
  - q: In Node 22, which file is always treated as an ES module, whatever package.json says?
    options: [index.js, index.mjs, index.cjs]
    answer: 1
    explain: .mjs is always ESM and .cjs is always CommonJS. A plain .js file follows the nearest package.json "type" field (CommonJS if there is none, though Node 22 also detects ESM syntax).
  - q: What does a CommonJS file get back from require("./other.js")?
    options:
      - A promise for the module
      - That file's module.exports object
      - A live binding to each export
    answer: 1
    explain: require runs the file synchronously the first time and returns its module.exports object; later calls return the same cached object.
links:
  - title: JavaScript modules (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
  - title: ECMAScript modules in Node.js (nodejs.org)
    url: https://nodejs.org/api/esm.html
  - title: CommonJS modules in Node.js (nodejs.org)
    url: https://nodejs.org/api/modules.html
---
ES modules use import and export, which are read before any code runs, so imports are hoisted, bindings stay live, and top-level await is allowed. CommonJS uses require(), which loads and runs a file synchronously and hands back its module.exports object. Node supports both, chosen by .mjs/.cjs or the "type" field in package.json, and from Node 22.12 require() can also load an ES module that has no top-level await.

## Side by side

| | ES modules | CommonJS |
| --- | --- | --- |
| Syntax | `import` / `export` | `require()` / `module.exports` |
| When it is resolved | Before any code runs (static) | When the `require` line runs |
| Loading | Can be asynchronous; allows top-level `await` | Synchronous |
| Exports | Live bindings: importers see later changes | A plain object, copied out at require time if you destructure |
| Strict mode | Always | Only with `"use strict"` |
| File location | `import.meta.url`, `import.meta.dirname` | `__filename`, `__dirname` |

## Mixing them in Node

- An ES module can `import` a CommonJS file. Its `module.exports` becomes the default export, and Node tries to detect named exports too.
- A CommonJS file can load an ES module with `await import()`, and since Node 22.12 also with plain `require()`, as long as that module (and its imports) use no top-level `await`.
- In ES modules, relative imports need the full file name: `import "./util.js"`, not `"./util"`.

```js
// math.mjs
export let calls = 0
export function add(a, b) {
  calls++
  return a + b
}

// main.mjs (run with: node main.mjs)
import { add, calls } from "./math.mjs"
add(1, 2)
console.log(calls) // 1: the binding is live, not a copy
```

```trace diagram
id: esm-load
title: How an import graph loads
subtitle: Parse, link, evaluate, and require() for contrast
direction: DOWN
groups:
  - { id: esm, label: ES modules }
  - { id: cjs, label: CommonJS }
elements:
  - { id: loader, label: Node's ESM loader, sub: "resolve, load, parse, link, evaluate", kind: system, row: 0 }
  - { id: main, label: main.mjs, sub: "import { add, calls } from \"./math.mjs\"", group: esm, row: 1 }
  - { id: math, label: math.mjs, sub: "export let calls; export function add", group: esm, row: 2 }
  - { id: fmt, label: format.mjs, sub: imported by math.mjs, group: esm, row: 3 }
  - { id: map, label: Module map, sub: one record per URL, kind: store, tone: data, row: 0 }
  - { id: calls, label: "binding: calls", sub: "one slot, owned by math.mjs", tone: stream, row: 3 }
  - { id: app, label: app.cjs, sub: "const { add } = require(\"./lib.cjs\")", group: cjs, row: 0 }
  - { id: lib, label: lib.cjs, sub: "module.exports = { add }", group: cjs, row: 1 }
  - { id: cache, label: require.cache, sub: one module.exports per file, kind: store, tone: data, row: 2 }
edges:
  - { id: parse, from: loader, to: main, label: parse }
  - { id: dep1, from: main, to: math, label: import }
  - { id: dep2, from: math, to: fmt, label: import }
  - { id: record, from: loader, to: map, style: dashed }
  - { id: write, from: math, to: calls, label: calls++ }
  - { id: read, from: main, to: calls, label: reads, style: dotted }
  - { id: req, from: app, to: lib, label: "require(): runs it now" }
  - { id: cached, from: lib, to: cache, style: dashed }
steps:
  - caption: Two ways to load the same kind of code. An ES module graph, which Node prepares completely before running a line, and CommonJS, which loads each file at the moment require() is called.
  - caption: Node's loader reads main.mjs and parses it. import and export are syntax, not function calls, so it can find every import without running any code.
    focus: [loader, main]
    trace: [parse]
  - caption: It follows each import specifier, loads and parses math.mjs, then format.mjs. Each module gets one record in the module map, keyed by its URL, so a module imported from ten places is still loaded once.
    focus: [main, math, fmt, map]
    trace: [dep1, dep2, record]
  - caption: Linking connects every imported name to the exporting module's own variable. If main.mjs asks for a name math.mjs doesn't export, this is where it fails, with a SyntaxError, before any code has run.
    focus: [main, math, calls]
  - caption: Only now does code run, deepest module first. format.mjs evaluates, then math.mjs, then main.mjs. Each module body runs exactly once.
    focus: [fmt, math, main]
  - caption: 'An import is a live binding, not a copy. When add() runs calls++ inside math.mjs, main.mjs reading calls sees the new value. Importers can''t assign to it: only the exporting module can.'
    focus: [math, main, calls]
    trace: [write, read]
  - caption: Because the graph is prepared up front, a module may use top-level await. Modules that depend on it simply wait before they evaluate.
    focus: [math, main]
  - caption: CommonJS works line by line. When app.cjs reaches require, Node resolves lib.cjs, reads it and runs it synchronously, right in the middle of that line.
    focus: [app, lib]
    trace: [req]
  - caption: 'require returns lib.cjs''s module.exports object and caches it, so later requires get the same object. Destructuring copies add out of it at that moment: if lib.cjs reassigned a property later, app.cjs wouldn''t see it.'
    focus: [lib, cache, app]
    trace: [cached]
  - caption: An ES module can import a CommonJS file, whose module.exports becomes the default export. Since Node 22.12, a CommonJS file can also require() an ES module, as long as that module graph has no top-level await.
note: This diagram shows the order of the work, not Node's internal API. "Module map" and "require.cache" are where each system remembers what it has already loaded.
```
