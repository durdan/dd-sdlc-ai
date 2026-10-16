---
id: node-streams
title: Streams and backpressure
summary: Data in chunks, at the reader's pace
why: Without backpressure a fast producer fills memory until the process runs out; with it, a gigabyte file passes through a few kilobytes of buffer.
requires: [node-loop]
lesson: none
quiz:
  - q: stream.write(chunk) returned false. What should the producer do?
    options:
      - Write the same chunk again straight away
      - Stop writing and wait for the 'drain' event
      - Nothing; the chunk was lost
    answer: 1
    explain: false means the buffer has reached its highWaterMark. The chunk was still accepted, but the producer should pause until 'drain' says there is room again.
  - q: Why prefer stream.pipeline() over a.pipe(b).pipe(c)?
    options:
      - pipe() ignores backpressure
      - pipeline() passes errors on and destroys every stream when one fails; pipe() leaves the others open
      - pipeline() copies data faster
    answer: 1
    explain: pipe() does handle backpressure, but if one stream errors the others are not cleaned up, which leaks file handles and sockets. pipeline() takes care of that and tells you when everything has finished.
links:
  - title: Backpressuring in streams (nodejs.org)
    url: https://nodejs.org/en/learn/modules/backpressuring-in-streams
  - title: Stream (Node.js API)
    url: https://nodejs.org/api/stream.html
  - title: Streams API (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
---
A stream moves data in chunks instead of all at once. Readable streams produce chunks, Writable streams consume them, Duplex streams do both and Transform streams change chunks on the way through. Each stream buffers up to its highWaterMark; when a writable's buffer is full, write() returns false, and a well-behaved producer waits for the 'drain' event before writing more. That signal is backpressure.

## Let pipeline do the work

```js
// gzip.mjs (run with: node gzip.mjs big.log)
import { createReadStream, createWriteStream } from "node:fs"
import { pipeline } from "node:stream/promises"
import { createGzip } from "node:zlib"

const file = process.argv[2]
await pipeline(createReadStream(file), createGzip(), createWriteStream(`${file}.gz`))
console.log("done")
```

`pipeline` reads only as fast as gzip and the disk can take, passes any error on, and closes every stream if one fails. Reading with `for await (const chunk of readable)` also respects backpressure: the next chunk is pulled only when your loop asks for it.

## Writing by hand

If you call `write()` yourself, check what it returns.

```js
import { once } from "node:events"

async function writeLines(stream, lines) {
  for (const line of lines) {
    if (!stream.write(`${line}\n`)) await once(stream, "drain")
  }
  stream.end()
}
```

Ignoring `false` still works, but every extra chunk piles up in memory. The limit is `highWaterMark`: a byte count for byte streams (64 KiB by default in Node 22; `stream.getDefaultHighWaterMark()` tells you) or an object count in object mode.

## The same idea in the browser

Web Streams (`ReadableStream`, also global in Node) work on a pull model: the source is asked for more only while the queue has room. Here the reader is slow, so the source stops after filling the queue to its high water mark of 2.

```js run
let made = 0
const source = new ReadableStream(
  {
    pull(controller) {
      made++
      controller.enqueue(`chunk ${made}`)
      if (made === 5) controller.close()
    },
  },
  { highWaterMark: 2 },
)

async function slowReader() {
  const reader = source.getReader()
  await new Promise((r) => setTimeout(r, 100))
  console.log("before reading, the source had made", made, "chunks")
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    console.log("read", value, "| made so far:", made)
    await new Promise((r) => setTimeout(r, 50))
  }
}
slowReader()
```
