---
id: async-await
title: async / await
summary: Promises that read like normal code
why: Accidental sequential awaits are one of the most common reasons an API handler is slower than it needs to be.
requires: [promises]
lesson: none
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
