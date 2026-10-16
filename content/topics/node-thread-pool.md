---
id: node-thread-pool
title: The libuv thread pool
summary: Where the blocking work hides
why: Four busy threads can make unrelated file reads, DNS lookups and password hashes wait for each other.
requires: [node-loop]
lesson: none
quiz:
  - q: Which of these uses the libuv thread pool?
    options: [Reading from a TCP socket, fs.readFile, setTimeout]
    answer: 1
    explain: Sockets are watched by the operating system (epoll, kqueue, IOCP) without extra threads. Most file system calls have no portable non-blocking form, so libuv runs them on the pool.
  - q: How many threads does the pool have by default?
    options: ["1", "4", "One per CPU core"]
    answer: 1
    explain: Four, whatever the machine. UV_THREADPOOL_SIZE changes it (up to 1024) if it is set before the pool is first used; setting it in the environment when Node starts is the reliable way.
  - q: Slow dns.lookup calls have filled the pool. What else slows down?
    options:
      - Nothing; DNS has its own threads
      - File system, zlib and crypto callbacks that also need the pool
      - Sending HTTP responses on open sockets
    answer: 1
    explain: dns.lookup uses the operating system's resolver on a pool thread, so it competes with every other pool user. dns.resolve*() talks to DNS servers over the network and does not use the pool.
links:
  - title: Don't block the event loop (or the worker pool) (nodejs.org)
    url: https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
  - title: Thread pool work scheduling (libuv docs)
    url: https://docs.libuv.org/en/v1.x/threadpool.html
  - title: UV_THREADPOOL_SIZE (Node.js CLI docs)
    url: https://nodejs.org/api/cli.html
---
JavaScript in Node runs on one thread, but Node itself is not single-threaded. Network sockets are watched by the operating system (epoll, kqueue, IOCP) with no extra threads. Work that has no non-blocking OS interface, such as most file system calls, dns.lookup, some crypto (pbkdf2, scrypt, randomBytes with a callback) and zlib's asynchronous methods, is handed to libuv's thread pool, which has 4 threads by default.

## Seeing the queue

Six expensive hashes, four threads: the first four finish together, the last two have to wait for a free thread.

```js
// pool.mjs (run with: node pool.mjs, then UV_THREADPOOL_SIZE=6 node pool.mjs)
import { pbkdf2 } from "node:crypto"

const start = performance.now()
for (let i = 1; i <= 6; i++) {
  pbkdf2("secret", "salt", 500_000, 64, "sha512", () => {
    console.log(`hash ${i} done after ${Math.round(performance.now() - start)} ms`)
  })
}
```

With the default pool you will see two groups of finish times; with six threads (on a machine with at least six cores) they finish together.

## Things to know

- The pool is shared by everything in the process. A burst of slow `dns.lookup` calls (which every `http.get("https://name...")` does unless you pass an IP) can delay unrelated file reads.
- The `...Sync` functions (`readFileSync`, `pbkdf2Sync`) don't use the pool at all: they block the main thread, which is fine at start-up and harmful inside a request handler.
- A bigger pool helps when work waits on disk or the OS; for CPU-heavy JavaScript of your own, the pool can't help, but worker threads can.
