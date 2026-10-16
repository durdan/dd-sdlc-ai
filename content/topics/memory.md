---
id: memory
title: Memory and garbage collection
summary: What stays alive, and why
why: "A leak is just something still reachable: a forgotten event listener, a cache that only grows, or a closure holding a large object."
requires: [closures]
lesson: none
quiz:
  - q: When can an object be garbage collected?
    options:
      - As soon as you set one variable that held it to null
      - When nothing reachable from the roots refers to it any more
      - After it has been unused for a fixed time
    answer: 1
    explain: Collection is about reachability. Setting one variable to null only helps if that was the last path from the roots (globals, the stack, live closures) to the object.
  - q: Why can't you list the entries of a WeakMap?
    options:
      - It is an oversight in the language
      - Entries may vanish whenever the collector runs, so a list would expose when that happens
      - It can only hold numbers
    answer: 1
    explain: A WeakMap doesn't keep its keys alive. Its contents depend on the garbage collector's timing, so the language deliberately offers no size or iteration.
links:
  - title: Memory management (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management
  - title: "Trash talk: the Orinoco garbage collector (v8.dev)"
    url: https://v8.dev/blog/trash-talk
  - title: WeakMap (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
---
Objects are allocated on the heap and freed automatically once nothing can reach them from the roots (globals, the current stack, live closures). V8 splits the heap by age: short-lived objects are cleaned up cheaply and often, survivors are moved to an old generation that is collected less often, largely in the background.

## Reachable means alive

The collector doesn't count how often something is used; it asks whether it can still be reached. Common ways memory stays reachable by accident:

- an event listener on a long-lived element (or `window`) that closes over a big object, never removed;
- a `Map` used as a cache with no limit or expiry;
- a `setInterval` that is never cleared, together with everything its callback uses;
- detached DOM nodes still referenced from JavaScript.

## Weak references

`WeakMap` and `WeakSet` hold their keys weakly: an entry doesn't keep its key alive. They are the right tool for attaching extra data to objects you don't own.

```js run
const cache = new Map()
const weak = new WeakMap()
let user = { name: "Ada" }
cache.set(user, "profile")
weak.set(user, "profile")
user = null
// The Map still holds the object as a key, so it can never be collected.
console.log("Map size:", cache.size)
// The WeakMap doesn't keep it alive and has no size: the entry can disappear once the object is unreachable.
console.log("WeakMap has a size?", "size" in weak)
```

`WeakRef` and `FinalizationRegistry` exist too, but when (or whether) the collector runs is up to the engine, so don't build program logic on them.

## Finding a leak

Take two heap snapshots in DevTools (Memory panel) a few actions apart and compare what grew. In Node, start with `node --inspect` and use the same tools; `process.memoryUsage()` gives a quick number, and `--max-old-space-size` changes how large the old generation may grow.
