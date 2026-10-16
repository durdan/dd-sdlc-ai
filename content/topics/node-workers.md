---
id: node-workers
title: Worker threads
summary: Real parallelism for CPU-heavy work
why: A two-second calculation on the main thread is two seconds in which your server answers nobody.
requires: [node-thread-pool]
lesson: none
quiz:
  - q: Which job gains most from a worker thread?
    options:
      - Waiting for 50 HTTP requests
      - Resizing a large image in pure JavaScript
      - Reading one config file at start-up
    answer: 1
    explain: Workers help with work that keeps a CPU busy. Waiting for I/O is already asynchronous in Node, and a worker would only add start-up cost.
  - q: What happens to an object you send to a worker with postMessage?
    options:
      - The worker gets a reference to the same object
      - It is copied with the structured clone algorithm (ArrayBuffers can be transferred instead)
      - Only strings can be sent
    answer: 1
    explain: Workers share no ordinary objects. Data is copied, or moved without copying when you list an ArrayBuffer as transferable; SharedArrayBuffer is the one way to share memory.
links:
  - title: Worker threads (Node.js API)
    url: https://nodejs.org/api/worker_threads.html
  - title: Web Workers API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
---
worker_threads runs JavaScript in parallel: each Worker has its own V8 isolate, its own event loop and its own globals. Workers don't share ordinary objects with the main thread; they talk by postMessage, which copies data with the structured clone algorithm, can transfer ArrayBuffers without copying, and can share memory through SharedArrayBuffer and Atomics.

## Moving work off the main thread

```js
// fib.mjs (run with: node fib.mjs)
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads"

const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2))

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url), { workerData: 40 })
  worker.once("message", (result) => console.log("fib(40) =", result))
  setInterval(() => console.log("main thread is still free"), 250).unref()
} else {
  parentPort.postMessage(fib(workerData))
}
```

The same file runs twice: once as the main thread, which starts a worker and keeps ticking, and once inside the worker, which does the slow part and posts the answer back.

## When to use one

- **Yes**: CPU-heavy JavaScript such as parsing a huge document, image or video processing, or simulations.
- **No**: I/O-bound work. Network and file I/O are already asynchronous, and crypto and zlib already use the libuv pool.
- **Reuse them**: starting a worker costs time and memory (a whole new isolate), so keep a small pool and send it jobs, one per CPU core at most (`os.availableParallelism()`).

Separate processes (`child_process`, or `cluster` for servers) are the alternative when you want isolation as well as parallelism: a crash in one doesn't take down the others. In browsers, Web Workers follow the same model.
