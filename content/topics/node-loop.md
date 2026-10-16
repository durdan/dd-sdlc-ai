---
id: node-loop
title: Node's event loop
summary: Same idea, different phases
why: It explains surprises such as setTimeout(fn, 0) and setImmediate(fn) running in either order from the main script.
requires: [event-loop, microtasks]
lesson: none
quiz:
  - q: Inside an fs.readFile callback you call setTimeout(f, 0) and then setImmediate(g). Which runs first?
    options: [f, g, "Either; it varies"]
    answer: 1
    explain: An I/O callback runs in the poll phase, and the check phase (setImmediate) comes right after it. The timer has to wait for the next pass through the timers phase.
  - q: From the main script, the same pair runs in which order?
    options:
      - The timeout first, always
      - The immediate first, always
      - Either; it can change from run to run
    answer: 2
    explain: Whether the 1 ms timer is already due when the loop first reaches the timers phase depends on how long process start-up took, so the order isn't guaranteed.
  - q: When does a Node process exit on its own?
    options:
      - When the main script reaches its last line
      - When no timers, sockets or other active handles are left
      - When the nextTick queue is empty
    answer: 1
    explain: The loop keeps going while anything could still produce a callback. Calling .unref() on a timer or server tells Node not to stay alive just for that.
links:
  - title: The Node.js event loop (nodejs.org)
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
  - title: Timers (Node.js API)
    url: https://nodejs.org/api/timers.html
---
Node's loop, provided by libuv, cycles through phases: timers, pending callbacks, poll (where I/O completes), check (setImmediate) and close callbacks. After every single callback Node first drains process.nextTick callbacks, then promise microtasks. Browsers have no nextTick or setImmediate, but share the task-then-microtasks rule.

## One pass of the loop

1. **Timers**: callbacks of `setTimeout` and `setInterval` whose time has come.
2. **Pending callbacks**: a few system-level callbacks deferred from the previous pass.
3. **Poll**: waits for I/O and runs its callbacks (incoming data, finished file reads). If nothing else is scheduled, Node waits here.
4. **Check**: `setImmediate` callbacks.
5. **Close callbacks**: for example a socket's `close` event.

Between any two callbacks, in any phase, Node empties the `process.nextTick` queue and then the promise microtask queue. (Before Node 11 this happened only between phases.)

## Timeout or immediate?

```js
// order.mjs (run with: node order.mjs)
import { readFile } from "node:fs"

readFile(import.meta.filename, () => {
  setTimeout(() => console.log("timeout"), 0)
  setImmediate(() => console.log("immediate"))
})
// Always prints: immediate, timeout
```

Inside an I/O callback the loop is in the poll phase, and check comes next, so the immediate wins every time. From the main script the order depends on timing, as the quiz below explains. A `setTimeout` delay of 0 is treated as 1 ms.

## When the loop stops

Node keeps looping while there is something that could still call you back: a pending timer, an open server or socket, a running child process. When nothing is left, the process exits. `timer.unref()` and `server.unref()` let Node exit even if those are still around.
