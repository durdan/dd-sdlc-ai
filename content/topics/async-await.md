---
id: async-await
title: async / await
summary: Promises that read like normal code
why: Accidental sequential awaits are one of the most common reasons an API handler is slower than it needs to be.
requires: [promises]
lesson: lanes   # the ```trace lanes``` blocks below are the lesson
quiz:
  - q: An async function's body runs `return 5`. What does calling it give you?
    options: ["5", "A promise fulfilled with 5", "undefined until you await it"]
    answer: 1
    explain: An async function always returns a promise. return 5 fulfils it with 5; a throw inside rejects it.
  - q: Two independent requests take about 200 ms each. How long does `await a(); await b()` take?
    options: [About 200 ms, About 400 ms, It depends on the event loop]
    answer: 1
    explain: The second request is not even started until the first has finished. Start both first and await Promise.all([a(), b()]) to finish in about 200 ms.
links:
  - title: async function (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  - title: await (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
---
An async function always returns a promise. Code before the first await runs straight away; at an await the function pauses, and the rest of it resumes as a microtask once the awaited value has settled. Awaiting things one after another runs them in sequence; start them together and use Promise.all to run them in parallel.

```trace lanes
# Each expect is checked by running the code in Node (npm run paths:check).
id: await-split
title: await splits the function
subtitle: Pausing, resuming, and a try/catch
code: |
  async function load(ok) {
    console.log("load starts");
    await null;
    if (!ok) throw new Error("server said no");
    return "data";
  }
  async function main() {
    try {
      console.log("got", await load(true));
      console.log("got", await load(false));
    } catch (e) {
      console.log("caught:", e.message);
    }
  }
  main();
  console.log("sync done");
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: paused, title: Paused functions, hint: "Stopped at an await, on that line", tone: violet }
  - { id: micro, title: Microtask queue, hint: Drained fully after each task, kind: queue, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 15
    caption: Calling an async function runs its body straight away, like any function, until the first await.
    state: { stack: [main script, { id: m, label: main() }] }
  - line: 2
    caption: main calls load(true), which logs "load starts" synchronously.
    state: { stack: [main script, { id: m, label: main() }, { id: l1, label: load(true) }] }
    log: load starts
  - line: 3
    caption: At await, load is taken off the stack and paused, with its variables saved. The rest of it will resume as a microtask. Calling load(true) has returned a pending promise.
    state:
      stack: [main script, { id: m, label: main() }]
      paused: [{ id: l1, label: "load(true) at 3" }]
      micro: [{ id: r1, label: resume load(true) }]
  - line: 9
    caption: main awaits that promise, so main is paused too and its own pending promise goes back to the script.
    state:
      stack: [main script]
      paused: [{ id: m, label: "main() at 9" }, { id: l1, label: "load(true) at 3" }]
  - line: 16
    caption: The script keeps going and logs "sync done" before either function has finished.
    log: sync done
  - line: 4
    caption: The script ends and microtasks run. load(true) resumes after its await; ok is true, so it returns "data", which fulfils its promise and queues main's resumption.
    state:
      stack: [{ id: l1, label: load(true) }]
      paused: [{ id: m, label: "main() at 9" }]
      micro: [{ id: r2, label: resume main }]
  - line: 9
    caption: main resumes with "data" as the value of await, and logs it.
    state: { stack: [{ id: m, label: main() }], paused: [], micro: [] }
    log: got data
  - line: 10
    caption: Line 10 calls load(false). It logs, pauses at its await, and main pauses again waiting for it.
    state:
      stack: []
      paused: [{ id: m, label: "main() at 10" }, { id: l2, label: "load(false) at 3" }]
      micro: [{ id: r3, label: resume load(false) }]
    log: load starts
  - line: 4
    caption: load(false) resumes and throws. In an async function a throw rejects the returned promise, so main's resumption is queued as a rejection.
    state:
      stack: [{ id: l2, label: load(false), tone: rose }]
      paused: [{ id: m, label: "main() at 10" }]
      micro: [{ id: r4, label: resume main with an error, tone: rose }]
  - line: 12
    caption: Inside main, the await on a rejected promise throws the error right where it stands, so the ordinary catch block catches it.
    state: { stack: [{ id: m, label: main() }], paused: [], micro: [] }
    log: "caught: server said no"
  - caption: 'Done: load starts, sync done, got data, load starts, caught: server said no. Each await is a point where the function steps off the stack and lets everything else run.'
    state: { stack: [] }
expect: [load starts, sync done, got data, load starts, "caught: server said no"]
```

```trace lanes
id: sequential-parallel
title: One by one, or together
subtitle: When does the second request start?
code: |
  function wait(ms, name) {
    console.log("start", name);
    return new Promise((done) => setTimeout(() => done(name), ms));
  }
  async function oneByOne() {
    const a = await wait(100, "a");
    const b = await wait(100, "b");
    console.log("one by one:", a, b);
  }
  async function together() {
    const [c, d] = await Promise.all([wait(100, "c"), wait(100, "d")]);
    console.log("together:", c, d);
  }
  oneByOne();
  together();
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: paused, title: Paused functions, hint: "Stopped at an await, on that line", tone: violet }
  - { id: timers, title: Timers, hint: Each stands for a 100 ms request, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. wait() stands in for a request that takes 100 ms. Both functions are started at the same moment.
  - line: 6
    caption: oneByOne calls wait for "a". The request starts and a 100 ms timer is set.
    state:
      stack: [main script, { id: s1, label: oneByOne() }]
      timers: [{ id: ta, label: "a: done at 100 ms" }]
    log: start a
  - line: 6
    caption: Then it awaits, and pauses. "b" has not even been asked for yet; that line comes after the await.
    state:
      stack: [main script]
      paused: [{ id: s1, label: "oneByOne() at 6" }]
  - line: 11
    caption: together() calls wait for "c" and for "d" before it awaits anything, so both requests start now.
    state:
      stack: [main script, { id: s2, label: together() }]
      timers: [{ id: ta, label: "a: done at 100 ms" }, { id: tc, label: "c: done at 100 ms" }, { id: td, label: "d: done at 100 ms" }]
    log: [start c, start d]
  - line: 11
    caption: Promise.all wraps both into one promise, and together pauses on it. The script ends.
    state:
      stack: []
      paused: [{ id: s1, label: "oneByOne() at 6" }, { id: s2, label: "together() at 11" }]
  - line: 7
    caption: At 100 ms, a is done. oneByOne resumes, and only now asks for "b", which needs another 100 ms.
    state:
      stack: [{ id: s1, label: oneByOne() }]
      paused: [{ id: s2, label: "together() at 11" }]
      timers: [{ id: tc, label: "c: done at 100 ms" }, { id: td, label: "d: done at 100 ms" }, { id: tb, label: "b: done at 200 ms" }]
    log: start b
  - line: 12
    caption: Also at 100 ms, c and d are done, so Promise.all fulfils with both values and together finishes.
    state:
      stack: [{ id: s2, label: together() }]
      paused: [{ id: s1, label: "oneByOne() at 7" }]
      timers: [{ id: tb, label: "b: done at 200 ms" }]
    log: "together: c d"
  - line: 8
    caption: At 200 ms, b is done at last and oneByOne finishes. Two requests, twice the time.
    state:
      stack: [{ id: s1, label: oneByOne() }]
      paused: []
      timers: []
    log: "one by one: a b"
  - caption: 'Awaiting one call after another runs them in sequence. If they don''t depend on each other, start them all first and await Promise.all. If one rejects, Promise.all rejects straight away.'
    state: { stack: [] }
expect: [start a, start c, start d, start b, "together: c d", "one by one: a b"]
```


## Sequential or parallel

```js run
const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms))

async function oneByOne() {
  const t = performance.now()
  const a = await wait(300, "a")
  const b = await wait(300, "b")
  console.log("one by one:", a, b, Math.round(performance.now() - t), "ms")
}

async function together() {
  const t = performance.now()
  const [a, b] = await Promise.all([wait(300, "a"), wait(300, "b")])
  console.log("together:  ", a, b, Math.round(performance.now() - t), "ms")
}

oneByOne().then(together)
```

Awaiting in a loop has the same effect: `for (const id of ids) await load(id)` loads one at a time. That is right when each step needs the previous one, or when you must go easy on a server; otherwise map to promises first and await them together.

## Errors

A rejected promise makes `await` throw, so ordinary `try`/`catch` works. One trap: inside `try`, write `return await work()` rather than `return work()`; without the `await`, the function returns before the promise settles and your `catch` never sees the failure.

```js run
async function load() {
  throw new Error("server said no")
}
async function main() {
  try {
    return await load()
  } catch (e) {
    console.log("handled:", e.message)
    return "fallback"
  }
}
main().then((v) => console.log("result:", v))
```

In ES modules (and in Node's `.mjs` files) you can also use `await` at the top level, outside any function.
