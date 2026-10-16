---
id: modules
title: Modules (ESM vs CommonJS)
summary: import vs require
why: Mixing the two is behind most "cannot use import statement outside a module" and default-export puzzles.
lesson: none
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
