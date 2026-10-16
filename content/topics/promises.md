---
id: promises
title: Promises
summary: A value that arrives later
why: Nearly every modern API (fetch, file system, databases) hands back a promise. A rejection nobody handles is reported as an error in browsers and, by default, crashes a Node process.
requires: [event-loop]
lesson: lanes   # the ```trace lanes``` blocks below are the lesson
quiz:
  - q: What is printed second?
    code: |
      const p = new Promise((resolve) => {
        console.log("executor")
        resolve(42)
      })
      p.then((v) => console.log("then", v))
      console.log("after")
    options: [executor, after, then 42]
    answer: 1
    explain: "The executor runs straight away, inside new Promise. A then callback always runs later as a microtask, even though the promise is already fulfilled. Order: executor, after, then 42."
  - q: Promise.all([a, b]) where a fulfils after 5 s and b rejects after 1 s. What happens?
    options:
      - It fulfils after 5 s with a's value
      - It rejects after 1 s with b's reason
      - It rejects after 5 s, once both have settled
    answer: 1
    explain: Promise.all rejects as soon as any input rejects. If you want every outcome, use Promise.allSettled.
links:
  - title: Using promises (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
  - title: Promise reference (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
---
A promise stands for a result that isn't ready yet. It starts pending and settles exactly once, as fulfilled with a value or rejected with a reason. Callbacks given to then, catch and finally always run later as microtasks, even if the promise had already settled.

```trace lanes
# Each expect is checked by running the code in Node (npm run paths:check).
id: resolve-then
title: Resolve, then, chain
subtitle: Why then always runs later
code: |
  const p = new Promise((resolve) => {
    console.log("executor");
    resolve(1);
  });
  p.then((n) => {
    console.log("then 1 got", n);
    return n + 1;
  }).then((n) => console.log("then 2 got", n));
  setTimeout(() => console.log("timeout"), 0);
  console.log("sync done");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: proms, title: Promises, hint: "State, and callbacks waiting on it", tone: violet }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: tasks, title: Task queue, hint: "Timers: one per turn", kind: queue, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 1
    caption: new Promise creates p, pending, and calls the executor straight away, on the same stack.
    state:
      stack: [main script, { id: exec, label: executor }]
      proms: [{ id: p, label: "p: pending" }]
  - line: 2
    caption: So "executor" is the very first line printed.
    log: executor
  - line: 3
    caption: resolve(1) fulfils p with 1. Nobody is listening yet, so nothing else happens. A promise settles once; later calls to resolve are ignored.
    state:
      stack: [main script]
      proms: [{ id: p, label: "p: fulfilled, 1" }]
  - line: 5
    caption: p.then(callback 1) on an already fulfilled promise doesn't call the callback now. It queues a job for it in the microtask queue, and returns a new promise, p2.
    state:
      proms: [{ id: p, label: "p: fulfilled, 1" }, { id: p2, label: "p2: pending" }]
      micro: [{ id: cb1, label: then callback 1 }]
  - line: 8
    caption: The second .then is called on p2, which is still pending, so callback 2 is only attached to p2. It isn't queued anywhere yet.
    state:
      proms: [{ id: p, label: "p: fulfilled, 1" }, { id: p2, label: "p2: pending (cb 2)" }, { id: p3, label: "p3: pending" }]
  - line: 9
    caption: setTimeout's 0 ms timer is due almost at once, and its callback waits in the task queue.
    state: { tasks: [{ id: tm, label: timeout callback }] }
  - line: 10
    caption: The script logs "sync done" and ends. Now the microtask queue is drained, before any task.
    log: sync done
    state: { stack: [] }
  - line: 6
    caption: Callback 1 runs with 1 and logs "then 1 got 1".
    state: { stack: [{ id: cb1, label: then callback 1 }], micro: [] }
    log: then 1 got 1
  - line: 7
    caption: It returns 2, which fulfils p2 with 2. That is the moment callback 2 is queued, as a new microtask.
    state:
      stack: []
      proms: [{ id: p, label: "p: fulfilled, 1" }, { id: p2, label: "p2: fulfilled, 2" }, { id: p3, label: "p3: pending" }]
      micro: [{ id: cb2, label: then callback 2 }]
  - line: 8
    caption: The queue isn't empty yet, so callback 2 runs in the same drain and logs "then 2 got 2". It returns nothing, so p3 is fulfilled with undefined.
    state:
      stack: [{ id: cb2, label: then callback 2 }]
      micro: []
      proms: [{ id: p, label: "p: fulfilled, 1" }, { id: p2, label: "p2: fulfilled, 2" }, { id: p3, label: "p3: fulfilled" }]
    log: then 2 got 2
  - line: 9
    caption: Only when the microtask queue is empty does the loop take the next task, the timer.
    state: { stack: [{ id: tm, label: timeout callback }], tasks: [] }
    log: timeout
  - caption: 'Done: executor, sync done, then 1 got 1, then 2 got 2, timeout. Each then waits for the promise before it, and the whole chain finishes before the timer.'
    state: { stack: [] }
expect: [executor, sync done, then 1 got 1, then 2 got 2, timeout]
```

```trace lanes
id: reject-catch
title: A rejection skips to catch
subtitle: Errors flow down the chain
code: |
  Promise.resolve(1)
    .then((n) => n + 1)
    .then((n) => {
      throw new Error("bad " + n);
    })
    .then(() => console.log("skipped"))
    .catch((e) => console.log("caught:", e.message))
    .finally(() => console.log("finally"));
  console.log("sync done");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: chain, title: The chain, hint: "One promise per call, in order", tone: violet }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 1
    caption: 'The script builds the whole chain at once. Each call returns a new promise; only the first is settled. Because it is already fulfilled, the n + 1 callback is queued right away.'
    state:
      stack: [main script]
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: pending" }, { id: c, label: "throw: pending" }, { id: d, label: "then log: pending" }, { id: e, label: "catch: pending" }, { id: f, label: "finally: pending" }]
      micro: [{ id: j1, label: n + 1 callback }]
  - line: 9
    caption: The script logs "sync done" and ends. Microtasks start.
    state: { stack: [] }
    log: sync done
  - line: 2
    caption: 1 + 1 is 2, so the second promise is fulfilled with 2, and that queues the next callback.
    state:
      stack: [{ id: j1, label: n + 1 callback }]
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: fulfilled" }, { id: c, label: "throw: pending" }, { id: d, label: "then log: pending" }, { id: e, label: "catch: pending" }, { id: f, label: "finally: pending" }]
      micro: [{ id: j2, label: throw callback }]
  - line: 4
    caption: This callback throws. A throw inside then doesn't crash anything; it rejects that then's promise with the error.
    state:
      stack: [{ id: j2, label: throw callback }]
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: fulfilled" }, { id: c, label: "throw: rejected", tone: rose }, { id: d, label: "then log: pending" }, { id: e, label: "catch: pending" }, { id: f, label: "finally: pending" }]
      micro: [{ id: j3, label: pass rejection on }]
  - line: 6
    caption: The next then only has a success callback, so it is skipped. Its promise is simply rejected with the same error, which still takes one microtask.
    state:
      stack: [{ id: j3, label: pass rejection on }]
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: fulfilled" }, { id: c, label: "throw: rejected", tone: rose }, { id: d, label: "then log: rejected", tone: rose }, { id: e, label: "catch: pending" }, { id: f, label: "finally: pending" }]
      micro: [{ id: j4, label: catch callback }]
  - line: 7
    caption: catch is a then with only a failure callback, so this one runs. It logs the message and returns normally, which fulfils its promise. The chain has recovered.
    state:
      stack: [{ id: j4, label: catch callback }]
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: fulfilled" }, { id: c, label: "throw: rejected", tone: rose }, { id: d, label: "then log: rejected", tone: rose }, { id: e, label: "catch: fulfilled" }, { id: f, label: "finally: pending" }]
      micro: [{ id: j5, label: finally callback }]
    log: "caught: bad 2"
  - line: 8
    caption: finally runs whichever way things went, gets no argument, and passes the previous result through.
    state:
      stack: [{ id: j5, label: finally callback }]
      micro: []
      chain: [{ id: a, label: "start: fulfilled" }, { id: b, label: "then +1: fulfilled" }, { id: c, label: "throw: rejected", tone: rose }, { id: d, label: "then log: rejected", tone: rose }, { id: e, label: "catch: fulfilled" }, { id: f, label: "finally: fulfilled" }]
    log: finally
  - caption: 'Done: sync done, caught: bad 2, finally. "skipped" never printed. Without the catch, the last promise would be rejected with nobody handling it: Node would end the process.'
    state: { stack: [] }
expect: [sync done, "caught: bad 2", finally]
```


## Always later

The function you pass to `new Promise` (the executor) runs immediately. Whatever you pass to `then` never does: it waits for the promise to settle and then for the current script to finish. That guarantee is what makes promise code predictable.

```js run
const p = new Promise((resolve) => {
  console.log("executor runs now")
  resolve(42)
})
p.then((v) => console.log("then got", v))
console.log("after then()")
```

## Chains and errors

Every `then` returns a new promise, resolved with whatever its callback returns (or rejected with whatever it throws). An error skips the remaining `then` steps until it reaches a `catch`, much like `try`/`catch` in synchronous code. `finally` runs either way and passes the result through.

```js run
Promise.resolve(1)
  .then((n) => n + 1)
  .then((n) => {
    throw new Error(`bad ${n}`)
  })
  .then(() => console.log("skipped"))
  .catch((e) => console.log("caught:", e.message))
  .finally(() => console.log("finally runs either way"))
```

## Waiting for several

- `Promise.all`: every input fulfilled, or the first rejection.
- `Promise.allSettled`: waits for all of them and reports each outcome.
- `Promise.race`: the first one to settle, either way.
- `Promise.any`: the first one to fulfil; rejects only if all of them reject.
- `Promise.withResolvers()` (ES2024) hands you a promise together with its `resolve` and `reject`, for when the code that settles it lives somewhere else.

An unhandled rejection is not silent: browsers log it and fire an `unhandledrejection` event, and Node (since version 15) ends the process by default. Always return or await the promises you create, and put a `catch` at the end of every chain.
