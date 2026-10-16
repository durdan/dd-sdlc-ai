---
id: node-nexttick
title: process.nextTick vs promises
summary: Node's queue that cuts ahead of promises
why: Libraries use it to call you back asynchronously but as soon as possible; used carelessly it can starve all I/O.
requires: [node-loop, microtasks]
lesson: lanes                  # the ```trace lanes``` blocks below are the lesson
points:
  - title: nextTicks first
    text: When a callback (or the main script) returns, Node runs every queued process.nextTick callback, including ones added on the way.
  - title: Then every microtask
    text: Next V8 drains the promise queue completely. A nextTick queued from a promise callback waits until that drain is over.
  - title: Repeat until both are empty
    text: Node goes back and forth between the two queues until neither has anything left. Only then does the loop move on.
  - title: Then the phases
    text: Timers, polling for I/O, then the check phase where setImmediate callbacks run, and round again.
quiz_hint: Ask which queue each callback joins, and whether V8 or Node is draining at that moment.
quiz:
  - q: "In a CommonJS file, which line prints first?"
    code: |
      Promise.resolve().then(() => console.log("promise"))
      process.nextTick(() => console.log("nextTick"))
    options: [promise, nextTick, "Either; it varies"]
    answer: 1
    explain: When the script finishes, Node empties the nextTick queue before the promise queue.
  - q: Run the same two lines as an .mjs file and the order flips. Why?
    options:
      - ES modules disable process.nextTick
      - The module's code itself runs from a promise job, so the promise queue is already being drained when it ends
      - .mjs files run on a different thread
    answer: 1
    explain: Node evaluates an ES module as part of a promise chain. When the top-level code ends, V8 keeps draining microtasks, so the then callback runs before Node gets back to its nextTick queue.
  - q: What does the Node documentation recommend for most code that needs to run "right after this"?
    options: [process.nextTick, queueMicrotask, setImmediate]
    answer: 1
    explain: queueMicrotask is standard, works in browsers too, and doesn't have nextTick's special ordering, which is easy to get wrong.
links:
  - title: Understanding process.nextTick() (nodejs.org)
    url: https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick
  - title: The Node.js event loop (nodejs.org)
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
  - title: process.nextTick and queueMicrotask (Node.js API)
    url: https://nodejs.org/api/process.html
---
process.nextTick(fn) queues fn to run as soon as the current JavaScript operation finishes, before Node goes back to the event loop. Node keeps this queue apart from the promise microtask queue and, after each callback, empties the nextTick queue first and the promise queue second.

```trace lanes
# Node only (process.nextTick, setImmediate): npm run paths:check runs each snippet with node
# as a .cjs or .mjs file and compares what it prints with expect.
id: cjs-order
title: nextTick vs promises
subtitle: In a CommonJS file
run: node
module: cjs
code: |
  Promise.resolve().then(() => {
    console.log("promise 1");
    process.nextTick(() => console.log("tick from promise"));
  });
  process.nextTick(() => {
    console.log("tick 1");
    Promise.resolve().then(() => console.log("promise from tick"));
  });
  Promise.resolve().then(() => console.log("promise 2"));
  setTimeout(() => console.log("timeout"), 0);
  console.log("sync");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: timers, title: Timers, hint: setTimeout callbacks waiting to be due, tone: amber }
  - { id: ticks, title: nextTick queue, hint: "Node's own queue: drained first", kind: queue, tone: violet }
  - { id: micro, title: Microtask queue, hint: "V8's queue: promise callbacks", kind: queue, tone: teal }
  - { id: check, title: Check (setImmediate), hint: "Runs once per loop turn, after polling for I/O", kind: queue, tone: blue }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. Node runs a CommonJS file as one ordinary function call.
  - line: 1
    caption: The script starts. Promise.resolve() is already fulfilled, so its then callback goes straight into the microtask queue.
    state: { stack: [main script], micro: [promise 1 callback] }
  - line: 5
    caption: process.nextTick puts its callback in Node's own nextTick queue, which is separate from V8's microtask queue.
    state: { ticks: [tick 1 callback] }
  - line: 9
    caption: A second promise callback joins the microtask queue behind the first.
    state: { micro: [promise 1 callback, promise 2 callback] }
  - line: 10
    caption: setTimeout arms a timer. Node turns a 0 ms delay into 1 ms; the callback waits for the timers phase of the loop.
    state: { timers: [timeout callback] }
  - line: 11
    caption: Line 11 logs "sync". Nothing queued has run yet.
    state: { stack: [main script, 'console.log("sync")'] }
    log: sync
  - caption: The script returns. Before the loop starts, Node empties the nextTick queue, then the microtask queue.
    state: { stack: [] }
  - line: 6
    caption: The nextTick callback runs first and logs "tick 1".
    state: { stack: [tick 1 callback], ticks: [] }
    log: tick 1
  - line: 7
    caption: It queues a promise callback. That joins the back of the microtask queue, behind the two already waiting.
    state: { micro: [promise 1 callback, promise 2 callback, promise from tick callback] }
  - caption: The nextTick queue is empty, so Node asks V8 to run microtasks. V8 drains its whole queue before handing control back.
    state: { stack: [] }
  - line: 2
    caption: The first promise callback logs "promise 1".
    state: { stack: [promise 1 callback], micro: [promise 2 callback, promise from tick callback] }
    log: promise 1
  - line: 3
    caption: It calls process.nextTick. The new tick has to wait, because Node only looks at its queue again once V8 has finished draining.
    state: { ticks: [tick from promise callback] }
  - line: 9
    caption: V8 carries on. "promise 2" is logged.
    state: { stack: [promise 2 callback], micro: [promise from tick callback] }
    log: promise 2
  - line: 7
    caption: Then the promise queued by the tick logs "promise from tick".
    state: { stack: [promise from tick callback], micro: [] }
    log: promise from tick
  - line: 3
    caption: The microtask queue is empty. Node checks its nextTick queue again, finds one waiting and runs it.
    state: { stack: [tick from promise callback], ticks: [] }
    log: tick from promise
  - line: 10
    caption: Both queues are empty at last, so the event loop starts. In the timers phase the 1 ms timer is due, and it logs "timeout".
    state: { stack: [timeout callback], timers: [] }
    log: timeout
  - caption: 'Done. The rule: after each callback, Node empties the nextTick queue, then V8 empties the microtask queue, and they take turns until both are empty.'
    state: { stack: [] }
expect: [sync, tick 1, promise 1, promise 2, promise from tick, tick from promise, timeout]
```

```trace lanes
id: esm-order
title: The same code as an ES module
subtitle: Why .mjs changes the order
run: node
module: esm
code: |
  Promise.resolve().then(() => {
    console.log("promise 1");
    process.nextTick(() => console.log("tick from promise"));
  });
  process.nextTick(() => {
    console.log("tick 1");
    Promise.resolve().then(() => console.log("promise from tick"));
  });
  Promise.resolve().then(() => console.log("promise 2"));
  setTimeout(() => console.log("timeout"), 0);
  console.log("sync");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: timers, title: Timers, hint: setTimeout callbacks waiting to be due, tone: amber }
  - { id: ticks, title: nextTick queue, hint: "Node's own queue: drained first", kind: queue, tone: violet }
  - { id: micro, title: Microtask queue, hint: "V8's queue: promise callbacks", kind: queue, tone: teal }
  - { id: check, title: Check (setImmediate), hint: "Runs once per loop turn, after polling for I/O", kind: queue, tone: blue }
  - { id: out, title: Console, kind: console }
steps:
  - caption: 'Nothing has run yet. This time the file is an ES module (.mjs, or .js in a package with "type": "module").'
  - line: 1
    caption: The module's top-level code starts. The already-fulfilled promise queues its then callback as a microtask.
    state: { stack: [main module], micro: [promise 1 callback] }
  - line: 5
    caption: process.nextTick puts its callback in Node's nextTick queue.
    state: { ticks: [tick 1 callback] }
  - line: 9
    caption: A second promise callback joins the microtask queue.
    state: { micro: [promise 1 callback, promise 2 callback] }
  - line: 10
    caption: setTimeout arms a 1 ms timer.
    state: { timers: [timeout callback] }
  - line: 11
    caption: Line 11 logs "sync".
    state: { stack: [main module, 'console.log("sync")'] }
    log: sync
  - caption: The top-level code ends. Node's ES module loader is asynchronous, so that code ran from inside a promise job, and V8 is still draining microtasks. It keeps going.
    state: { stack: [] }
  - line: 2
    caption: So the promise callbacks go first. "promise 1" is logged.
    state: { stack: [promise 1 callback], micro: [promise 2 callback] }
    log: promise 1
  - line: 3
    caption: Its nextTick joins the nextTick queue, behind tick 1.
    state: { ticks: [tick 1 callback, tick from promise callback] }
  - line: 9
    caption: '"promise 2" is logged. The microtask queue is now empty.'
    state: { stack: [promise 2 callback], micro: [] }
    log: promise 2
  - caption: V8 hands control back to Node, which now drains the nextTick queue, oldest first.
    state: { stack: [] }
  - line: 6
    caption: '"tick 1" is logged.'
    state: { stack: [tick 1 callback], ticks: [tick from promise callback] }
    log: tick 1
  - line: 7
    caption: It queues a promise callback, which has to wait. Node finishes the whole nextTick queue before microtasks run again.
    state: { micro: [promise from tick callback] }
  - line: 3
    caption: '"tick from promise" is logged. The nextTick queue is empty.'
    state: { stack: [tick from promise callback], ticks: [] }
    log: tick from promise
  - line: 7
    caption: Now the microtask queue gets its turn, and "promise from tick" is logged.
    state: { stack: [promise from tick callback], micro: [] }
    log: promise from tick
  - line: 10
    caption: Both queues are empty, the loop starts, and the timer logs "timeout".
    state: { stack: [timeout callback], timers: [] }
    log: timeout
  - caption: 'Done: sync, promise 1, promise 2, tick 1, tick from promise, promise from tick, timeout. The rule is the same; only the starting point differs, because the module ended in the middle of a microtask drain.'
    state: { stack: [] }
note: 'Don''t write code that depends on this order: moving a file between CommonJS and ESM changes it. Use queueMicrotask when you just need "right after this".'
expect: [sync, promise 1, promise 2, tick 1, tick from promise, promise from tick, timeout]
```

```trace lanes
id: immediate-vs-timeout
title: setImmediate vs setTimeout
subtitle: Inside a timer callback
run: node
module: cjs
code: |
  setTimeout(() => {
    console.log("timer 1");
    setTimeout(() => console.log("timer 2"), 0);
    setImmediate(() => console.log("immediate"));
    process.nextTick(() => console.log("nextTick"));
    Promise.resolve().then(() => console.log("promise"));
  }, 0);
  console.log("sync");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: timers, title: Timers, hint: setTimeout callbacks waiting to be due, tone: amber }
  - { id: ticks, title: nextTick queue, hint: "Node's own queue: drained first", kind: queue, tone: violet }
  - { id: micro, title: Microtask queue, hint: "V8's queue: promise callbacks", kind: queue, tone: teal }
  - { id: check, title: Check (setImmediate), hint: "Runs once per loop turn, after polling for I/O", kind: queue, tone: blue }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 1
    caption: The script arms timer 1 (a 0 ms delay, so 1 ms).
    state: { stack: [main script], timers: [timer 1 callback] }
  - line: 8
    caption: Line 8 logs "sync".
    state: { stack: [main script, 'console.log("sync")'] }
    log: sync
  - caption: The script returns. The nextTick and microtask queues are empty, so the event loop starts with the timers phase.
    state: { stack: [] }
  - line: 2
    caption: Timer 1 is due. Its callback runs and logs "timer 1".
    state: { stack: [timer 1 callback], timers: [] }
    log: timer 1
  - line: 3
    caption: It arms timer 2. That one is due 1 ms from now, so it can't run in this pass of the timers phase.
    state: { timers: [timer 2 callback] }
  - line: 4
    caption: setImmediate queues its callback for the check phase, later in this same turn of the loop.
    state: { check: [immediate callback] }
  - line: 5
    caption: A nextTick callback joins the nextTick queue.
    state: { ticks: [nextTick callback] }
  - line: 6
    caption: A promise callback joins the microtask queue.
    state: { micro: [promise callback] }
  - caption: Timer 1's callback returns. Since Node 11, both small queues are emptied after every single callback, before the next timer or phase.
    state: { stack: [] }
  - line: 5
    caption: nextTick first. It logs "nextTick".
    state: { stack: [nextTick callback], ticks: [] }
    log: nextTick
  - line: 6
    caption: Then the microtask. It logs "promise".
    state: { stack: [promise callback], micro: [] }
    log: promise
  - line: 4
    caption: No other timer is due. The poll phase sees an immediate waiting, so it doesn't block for I/O, and the check phase runs it.
    state: { stack: [immediate callback], check: [] }
    log: immediate
  - line: 3
    caption: The next turn starts with the timers phase again. Timer 2 is due now and logs "timer 2".
    state: { stack: [timer 2 callback], timers: [] }
    log: timer 2
  - caption: 'Done: sync, timer 1, nextTick, promise, immediate, timer 2. From inside a timer or I/O callback, setImmediate always runs before a new 0 ms timer.'
    state: { stack: [] }
note: In the main script itself, the order of setTimeout(…, 0) and setImmediate is not fixed; it depends on how quickly the process started. Inside a timer or I/O callback it is.
expect: [sync, timer 1, nextTick, promise, immediate, timer 2]
```

## CommonJS or ES module

The first two snippets are the same code. A CommonJS file (`.cjs`, or `.js` without `"type": "module"`) returns to Node when it ends, and Node drains nextTicks before promises. An ES module's top-level code runs from inside a promise job, so the promise queue is already being drained when it ends, and the nextTick queue only gets its turn after that. Code that depends on the exact order of these two queues is fragile.

## What it is for

The classic use is letting a caller finish setting up before you call back. An object that emits an event from its constructor would emit before anyone could attach a listener; deferring with `process.nextTick` fixes that while still running before any I/O.

```js
import { EventEmitter } from "node:events"

class Job extends EventEmitter {
  constructor() {
    super()
    process.nextTick(() => this.emit("ready")) // listeners attached below still hear it
  }
}
new Job().on("ready", () => console.log("ready"))
```

## The danger

The nextTick queue is drained completely, including callbacks added while draining. A function that keeps rescheduling itself with `process.nextTick` stops the loop from ever reaching the poll phase, so no I/O completes and no timer fires. The same is true for a microtask that keeps queueing microtasks. For new code, prefer `queueMicrotask`, and use `setImmediate` when you want to yield to I/O between pieces of work.
