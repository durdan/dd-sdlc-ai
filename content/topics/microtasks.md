---
id: microtasks
title: Tasks vs microtasks
summary: Two queues, different rules
why: A chain of microtasks that keeps adding more can starve rendering and input completely, while a timer would let the page breathe.
requires: [promises]
lesson: none
quiz:
  - q: Which of these runs as a microtask?
    options: [A setTimeout callback, A promise's then callback, A click handler]
    answer: 1
    explain: Promise reactions, code after an await, queueMicrotask and MutationObserver callbacks are microtasks. Timers and input events are tasks.
  - q: A microtask keeps queueing another microtask forever. What happens to a timer that is due?
    options:
      - It runs between two microtasks
      - It never runs, and the page stops responding
      - It runs after 4 ms anyway
    answer: 1
    explain: The loop only moves on when the microtask queue is empty. If it never empties, no task, paint or input handler gets a turn.
links:
  - title: Using microtasks (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
  - title: queueMicrotask (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask
---
Tasks (timers, user input, network and I/O callbacks, postMessage) run one per turn of the loop. Microtasks (promise callbacks, queueMicrotask, MutationObserver) all run before the loop moves on, including any new ones they add. requestAnimationFrame callbacks are separate again: they run just before the browser paints.

## Who goes first

```js run
setTimeout(() => console.log("task: timeout"), 0)
queueMicrotask(() => console.log("microtask: queueMicrotask"))
Promise.resolve().then(() => console.log("microtask: then"))
console.log("script")
```

The script itself is a task. When it ends, both microtasks run, in the order they were queued, and only then does the loop take the timer.

## Starving the loop

Because the microtask queue must be empty before anything else happens, microtasks that keep queueing more can hold everything up. Here a due timer waits for 100,000 microtasks:

```js run
let n = 0
setTimeout(() => console.log("timer finally ran after", n, "microtasks"), 0)
function again() {
  if (++n < 100000) queueMicrotask(again)
}
queueMicrotask(again)
```

## Choosing one

- Use a microtask (`queueMicrotask`, or just a promise) when something must happen right after the current code, before anything else can observe the state in between.
- Use a task (`setTimeout`, or `postMessage`) to break long work into pieces so input and painting can happen between them.
- Use `requestAnimationFrame` for visual updates you want in the next frame.
