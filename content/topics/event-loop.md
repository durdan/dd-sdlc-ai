---
id: event-loop
title: The event loop
summary: Who runs next, and why
why: It decides the order your logs appear in, and why one slow function makes the whole page stop responding.
requires: [call-stack]
lesson: lanes                  # the ```trace lanes``` blocks below are the lesson
points:
  - title: One thing at a time
    text: There is one call stack. Whatever is on it runs to the end; nothing else can cut in.
  - title: Waiting happens elsewhere
    text: Timers, network replies and clicks are tracked outside your code. When one is ready, its callback joins the task queue.
  - title: Microtasks jump the line
    text: After every task, the loop runs every queued microtask (promise callbacks, code after an await, queueMicrotask), including ones added on the way.
  - title: Then the next task
    text: A browser may now update the screen. Then the loop takes the oldest ready task and starts again.
quiz_hint: Think about which lane each callback waits in, and when that lane gets its turn.
# Each answer was checked by running the code in Node 22 and in Chrome.
quiz:
  - q: What is printed first?
    code: |
      setTimeout(() => console.log("a"), 0);
      Promise.resolve().then(() => console.log("b"));
      console.log("c");
    options: [a, b, c]
    answer: 2
    explain: "Synchronous code always finishes first. Then the microtask (b) runs, and only after that the timer task (a). Full order: c, b, a."
  - q: In what order are the letters printed?
    code: |
      async function f() {
        console.log("x");
        await undefined;
        console.log("y");
      }
      f();
      console.log("z");
    options: ["x, y, z", "z, x, y", "x, z, y"]
    answer: 2
    explain: f() runs synchronously up to the await, so x prints first. The rest of f is queued as a microtask, which runs after the script has logged z.
  - q: A microtask queues another microtask. What prints last?
    code: |
      setTimeout(() => console.log("timer"), 0);
      Promise.resolve().then(() => {
        console.log("p1");
        Promise.resolve().then(() => console.log("p2"));
      });
      console.log("sync");
    options: [p2, timer, p1]
    answer: 1
    explain: "The microtask queue is drained completely, including microtasks added while draining, so p2 runs before the loop gets to the timer. Order: sync, p1, p2, timer."
links:
  - title: JavaScript execution model (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model
  - title: The Node.js event loop (nodejs.org)
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
---
The engine runs one task to completion, then empties the microtask queue, then (in a browser) may update the screen, and only then picks the next task. Timers, clicks and network replies don't interrupt your code; they wait in a queue for the stack to be empty.

```trace lanes
# Snippet 1 of 3. Each expect is checked by running the code in Node (npm run paths:check).
id: timeout-zero
title: setTimeout 0
subtitle: Does a zero delay run now?
code: |
  console.log("start");
  setTimeout(() => {
    console.log("timeout");
  }, 0);
  console.log("end");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: apis, title: Web APIs / timers, hint: Waiting outside JavaScript, tone: muted }
  - { id: tasks, title: Task queue, hint: "Macrotasks: one per turn", kind: queue, tone: amber }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: out, title: Console output, kind: console }
steps:
  - caption: Nothing has run yet. The stack is empty and both queues are empty.
  - line: 1
    caption: The whole script is the first task, so it goes on the call stack. Line 1 logs "start" right away.
    state: { stack: [main script, 'console.log("start")'] }
    log: start
  - line: 2
    caption: setTimeout hands the callback to the timer system and returns at once. The script carries on.
    state: { stack: [main script, 'setTimeout(cb, 0)'], apis: [{ id: t1, label: timer 0 ms → callback }] }
  - line: 2
    caption: 'The 0 ms timer is due almost immediately, so its callback moves to the task queue. It still has to wait: the stack is busy.'
    state: { stack: [main script], apis: [], tasks: [{ id: t1, label: timer callback }] }
  - line: 5
    caption: Line 5 logs "end". The timer callback is still waiting in the queue.
    state: { stack: [main script, 'console.log("end")'] }
    log: end
  - caption: The script finishes and leaves the stack. The microtask queue is empty, so the loop takes the next task.
    state: { stack: [] }
  - line: 2
    caption: The timer callback is taken from the task queue and pushed onto the empty stack.
    state: { stack: [{ id: t1, label: timer callback }], tasks: [] }
  - line: 3
    caption: It logs "timeout".
    state: { stack: [{ id: t1, label: timer callback }, 'console.log("timeout")'] }
    log: timeout
  - caption: 'Done: start, end, timeout. A 0 ms delay means "as soon as the current task is over", never "right now".'
    state: { stack: [] }
expect: [start, end, timeout]
```

```trace lanes
id: promise-vs-timeout
title: Promise vs setTimeout
subtitle: Which callback wins?
code: |
  console.log("script start");
  setTimeout(() => console.log("timeout"), 0);
  Promise.resolve()
    .then(() => console.log("then 1"))
    .then(() => console.log("then 2"));
  console.log("script end");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: apis, title: Web APIs / timers, hint: Waiting outside JavaScript, tone: muted }
  - { id: tasks, title: Task queue, hint: "Macrotasks: one per turn", kind: queue, tone: amber }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: out, title: Console output, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 1
    caption: The script starts as a task and logs "script start".
    state: { stack: [main script, 'console.log("script start")'] }
    log: script start
  - line: 2
    caption: setTimeout registers a 0 ms timer and returns straight away.
    state: { stack: [main script, 'setTimeout(cb, 0)'], apis: [{ id: t2, label: timer 0 ms → callback }] }
  - line: 2
    caption: The timer is due, so its callback joins the task queue and waits there.
    state: { stack: [main script], apis: [], tasks: [{ id: t2, label: timer callback }] }
  - line: 4
    caption: Promise.resolve() is already fulfilled, so the first .then queues its callback as a microtask immediately.
    state: { micro: [then 1 callback] }
  - line: 5
    caption: The second .then waits on the promise returned by the first .then, which is still pending. Nothing is queued for it yet.
  - line: 6
    caption: Line 6 logs "script end". The script is about to finish.
    state: { stack: [main script, 'console.log("script end")'] }
    log: script end
  - caption: The script leaves the stack. Before taking another task, the loop must empty the microtask queue.
    state: { stack: [] }
  - line: 4
    caption: The first microtask runs and logs "then 1".
    state: { stack: [then 1 callback], micro: [] }
    log: then 1
  - line: 5
    caption: Its callback has returned, which fulfils the second promise, so "then 2" is queued as a new microtask.
    state: { stack: [], micro: [then 2 callback] }
  - line: 5
    caption: "The queue isn't empty yet, so draining continues: \"then 2\" runs before the timer gets a turn."
    state: { stack: [then 2 callback], micro: [] }
    log: then 2
  - line: 2
    caption: Microtasks are done. The loop finally takes the timer callback from the task queue. It logs "timeout".
    state: { stack: [{ id: t2, label: timer callback }], tasks: [] }
    log: timeout
  - caption: 'Done: script start, script end, then 1, then 2, timeout. Every microtask runs before the next task.'
    state: { stack: [] }
expect: [script start, script end, then 1, then 2, timeout]
```

```trace lanes
id: async-await
title: async / await
subtitle: What happens at the await?
code: |
  async function load() {
    console.log("load: before await");
    await null;
    console.log("load: after await");
  }

  console.log("A");
  setTimeout(() => console.log("timer"), 0);
  load();
  Promise.resolve().then(() => console.log("then"));
  console.log("B");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: apis, title: Web APIs / timers, hint: Waiting outside JavaScript, tone: muted }
  - { id: tasks, title: Task queue, hint: "Macrotasks: one per turn", kind: queue, tone: amber }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: out, title: Console output, kind: console }
steps:
  - caption: Nothing has run yet. Declaring load() on line 1 doesn't run it.
  - line: 7
    caption: The script runs as a task and logs "A".
    state: { stack: [main script, 'console.log("A")'] }
    log: A
  - line: 8
    caption: setTimeout registers a 0 ms timer.
    state: { stack: [main script, 'setTimeout(cb, 0)'], apis: [{ id: t3, label: timer 0 ms → callback }] }
  - line: 8
    caption: The timer is due, so its callback waits in the task queue.
    state: { stack: [main script], apis: [], tasks: [{ id: t3, label: timer callback }] }
  - line: 9
    caption: load() is called. An async function runs normally, line by line, until its first await.
    state: { stack: [main script, { id: load, label: load() }] }
  - line: 2
    caption: 'Still inside load(): it logs "load: before await".'
    state: { stack: [main script, { id: load, label: load() }, 'console.log("load: before await")'] }
    log: 'load: before await'
  - line: 3
    caption: await null pauses load(). Its frame leaves the stack and the rest of the function is queued as a microtask. load() hands back a pending promise.
    state: { stack: [main script], micro: [{ id: load, label: resume load() after await }] }
  - line: 10
    caption: Promise.resolve().then queues its callback as a microtask, behind load's continuation.
    state: { micro: [{ id: load, label: resume load() after await }, then callback] }
  - line: 11
    caption: 'Back in the script: "B" is logged before anything that was queued.'
    state: { stack: [main script, 'console.log("B")'] }
    log: B
  - caption: The script finishes. Now the microtask queue is drained, oldest first.
    state: { stack: [] }
  - line: 4
    caption: 'load() resumes right after the await and logs "load: after await".'
    state: { stack: [{ id: load, label: resume load() after await }], micro: [then callback] }
    log: 'load: after await'
  - line: 10
    caption: 'Next microtask: the then callback logs "then".'
    state: { stack: [then callback], micro: [] }
    log: then
  - line: 8
    caption: Microtasks are done, so the timer callback finally runs and logs "timer".
    state: { stack: [{ id: t3, label: timer callback }], tasks: [] }
    log: timer
  - caption: 'Done: A, load: before await, B, load: after await, then, timer. Code after an await always runs later, as a microtask.'
    state: { stack: [] }
note: 'await null works on any value: a non-promise is wrapped in an already-fulfilled promise, so the rest of the function is queued after one microtask hop.'
expect: [A, 'load: before await', B, 'load: after await', then, timer]
```

## Browser or Node: what changes?

- All three snippets print in the same order in Chrome and in Node 22, whether Node runs them as CommonJS or as an ES module. The task-then-microtasks rule is the same in both.
- Node has no screen to paint. Its loop goes through phases instead (timers, I/O polling, setImmediate callbacks, close callbacks), covered in *Node's event loop*.
- Node adds `process.nextTick`, whose queue runs before promise microtasks. Browsers have no equivalent.
- A 0 ms timer is never instant. Node treats it as 1 ms; browsers clamp deeply nested timers to at least 4 ms and slow timers down in background tabs.
