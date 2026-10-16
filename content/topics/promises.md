---
id: promises
title: Promises
summary: A value that arrives later
why: Nearly every modern API (fetch, file system, databases) hands back a promise. A rejection nobody handles is reported as an error in browsers and, by default, crashes a Node process.
requires: [event-loop]
lesson: none
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
