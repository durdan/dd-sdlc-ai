---
id: call-stack
title: The call stack
summary: One function at a time
why: It is how you read a stack trace, and why a long-running loop freezes the whole page.
lesson: lanes   # the ```trace lanes``` blocks below are the lesson
quiz:
  - q: Infinite recursion in V8 (Chrome, Node) ends with which error?
    options: [TypeError, RangeError, SyntaxError]
    answer: 1
    explain: 'Every call adds a frame, the stack has a fixed size, and running out is reported as RangeError: "Maximum call stack size exceeded".'
  - q: In a stack trace, which line is the place where the error was created?
    options: [The top one, The bottom one, It depends on the browser]
    answer: 0
    explain: Traces list the newest frame first. Each line below it is the function that called the one above, down to the code that started it all.
  - q: A timer is due while a loop is still running. When does its callback run?
    options: ["Straight away, interrupting the loop", "After the loop and the rest of the script have finished", "Never"]
    answer: 1
    explain: Nothing interrupts the function on top of the stack. The callback waits in a queue until the stack is empty.
links:
  - title: Call stack (MDN glossary)
    url: https://developer.mozilla.org/en-US/docs/Glossary/Call_stack
  - title: Error.prototype.stack (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack
---
Your code runs on a single thread, one function at a time. Calling a function puts a frame holding its arguments and local variables on top of the stack; returning takes it off. Recurse too deeply and the engine gives up with a RangeError ("Maximum call stack size exceeded").

```trace lanes
# Each expect is checked by running the code in Node (npm run paths:check).
id: frames
title: Frames in, frames out
subtitle: A function calling a function
code: |
  function square(n) {
    return n * n;
  }
  function sumOfSquares(a, b) {
    const total = square(a) + square(b);
    return total;
  }
  console.log(sumOfSquares(2, 3));
  console.log("done");
lanes:
  - { id: stack, title: Call stack, hint: The top frame is running, kind: stack }
  - { id: vars, title: Each frame's variables, hint: "Blue: sumOfSquares. Amber: square.", tone: violet }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. Declaring the two functions doesn't call them, so the stack is empty.
  - line: 8
    caption: The script itself is the bottom frame. To log the result, line 8 first has to call sumOfSquares(2, 3), which pushes a new frame on top.
    state:
      stack: [main script, { id: f-sos, label: "sumOfSquares(2, 3)" }]
      vars: [{ id: va, label: "a = 2", tone: blue }, { id: vb, label: "b = 3", tone: blue }]
  - line: 5
    caption: Line 5 calls square(2). Another frame goes on top, with its own n. sumOfSquares is paused halfway through the line, waiting for the answer.
    state:
      stack: [main script, { id: f-sos, label: "sumOfSquares(2, 3)" }, { id: f-sq1, label: "square(2)" }]
      vars: [{ id: va, label: "a = 2", tone: blue }, { id: vb, label: "b = 3", tone: blue }, { id: vn1, label: "n = 2", tone: amber }]
  - line: 2
    caption: square returns 4. Its frame is popped and its n is gone. sumOfSquares is on top again and carries on where it stopped.
    state:
      stack: [main script, { id: f-sos, label: "sumOfSquares(2, 3)" }]
      vars: [{ id: va, label: "a = 2", tone: blue }, { id: vb, label: "b = 3", tone: blue }]
  - line: 5
    caption: The second call, square(3), gets a brand-new frame. It is not the old one reused; each call has its own.
    state:
      stack: [main script, { id: f-sos, label: "sumOfSquares(2, 3)" }, { id: f-sq2, label: "square(3)" }]
      vars: [{ id: va, label: "a = 2", tone: blue }, { id: vb, label: "b = 3", tone: blue }, { id: vn2, label: "n = 3", tone: amber }]
  - line: 5
    caption: It returns 9 and is popped. Now 4 + 9 is stored in total.
    state:
      stack: [main script, { id: f-sos, label: "sumOfSquares(2, 3)" }]
      vars: [{ id: va, label: "a = 2", tone: blue }, { id: vb, label: "b = 3", tone: blue }, { id: vt, label: "total = 13", tone: blue }]
  - line: 6
    caption: sumOfSquares returns 13 and its frame comes off. Its a, b and total disappear with it.
    state: { stack: [main script], vars: [] }
  - line: 8
    caption: Only now does console.log itself run, with 13 as its argument.
    state: { stack: [main script, { id: f-log1, label: "console.log(13)" }] }
    log: 13
  - line: 9
    caption: Line 9 logs "done".
    state: { stack: [main script, { id: f-log2, label: 'console.log("done")' }] }
    log: done
  - caption: 'The script ends and the stack is empty. If square had thrown an error, its stack trace would read square, sumOfSquares, then the script: the frames on the stack at that moment, newest first.'
    state: { stack: [] }
expect: ["13", done]
```

```trace lanes
id: overflow
title: Too deep
subtitle: Recursion with no way to stop
run: node
code: |
  function down(n) {
    return down(n + 1);
  }
  try {
    down(0);
  } catch (e) {
    console.log(e instanceof RangeError);
    console.log(e.message);
  }
lanes:
  - { id: stack, title: Call stack, hint: The top frame is running, kind: stack }
  - { id: vars, title: Each frame's variables, hint: "Arguments and locals, gone on return", tone: violet }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet.
  - line: 5
    caption: Inside the try block, the script calls down(0). A frame for it goes on the stack.
    state:
      stack: [main script, { id: d0, label: "down(0)" }]
      vars: [{ id: n0, label: "down: n = 0" }]
  - line: 2
    caption: down(0) can't return until down(1) has returned, so it calls down(1) and waits. Another frame.
    state:
      stack: [main script, { id: d0, label: "down(0)" }, { id: d1, label: "down(1)" }]
      vars: [{ id: n0, label: "down: n = 0" }, { id: n1, label: "down: n = 1" }]
  - line: 2
    caption: And down(1) calls down(2). No frame ever returns, so the stack only grows.
    state:
      stack: [main script, { id: d0, label: "down(0)" }, { id: d1, label: "down(1)" }, { id: d2, label: "down(2)" }]
      vars: [{ id: n0, label: "down: n = 0" }, { id: n1, label: "down: n = 1" }, { id: n2, label: "down: n = 2" }]
  - line: 2
    caption: The stack has a fixed size. After roughly ten thousand frames in Node (the exact number depends on the engine and the frame size) there is no room for the next one.
    state:
      stack: [main script, { id: d0, label: "down(0)" }, { id: d1, label: "down(1)" }, { id: d2, label: "down(2)" }, { id: dmany, label: "… thousands more" }, { id: dlast, label: "down(10 000 or so)", tone: rose }]
      vars: [{ id: n0, label: "down: n = 0" }, { id: n1, label: "down: n = 1" }, { id: n2, label: "down: n = 2" }, { id: nmany, label: "… one n per frame" }]
  - line: 2
    caption: Instead of crashing, the engine throws a RangeError from the call that didn't fit. Nothing catches it inside down, so every down frame is popped, one after another.
    state: { stack: [main script, { id: err, label: RangeError thrown, tone: rose }], vars: [] }
  - line: 6
    caption: The error lands in the catch block of the script, which is the only frame left.
    state: { stack: [main script, { id: err, label: "catch: RangeError", tone: rose }] }
  - line: 7
    caption: It really is a RangeError.
    state: { stack: [main script, { id: err, label: "catch: RangeError", tone: rose }, { id: log1, label: console.log(true) }] }
    log: "true"
  - line: 8
    caption: V8's message is "Maximum call stack size exceeded". Firefox reports the same problem as "too much recursion", which is why this snippet is checked in Node only.
    state: { stack: [main script, { id: err, label: "catch: RangeError", tone: rose }, { id: log2, label: "console.log(…)" }] }
    log: Maximum call stack size exceeded
  - caption: The script finishes normally. For really deep data, replace recursion with a loop and an array you push and pop yourself.
    state: { stack: [] }
note: Browsers differ in how deep they let you go and in the error's message, so the trace shows the Node (V8) version.
expect: ["true", Maximum call stack size exceeded]
```


## Reading a stack trace

When an error is created it records the frames that are on the stack at that moment, newest first. The top line is where it happened; every line under it is the caller of the line above. Run this and read the output from the top down: `c`, called by `b`, called by `a`, called by the script itself.

```js run
function a() { b() }
function b() { c() }
function c() { console.log(new Error("where am I?").stack) }
a()
```

## Run to completion

While a function is on the stack, nothing else runs: not a click handler, not a timer that is already due. A loop that keeps the thread busy for half a second delays everything else by half a second, which is why one slow function makes a page feel frozen.

```js run
const start = Date.now()
setTimeout(() => console.log("timer fired after", Date.now() - start, "ms"), 0)
while (Date.now() - start < 500) {} // busy for half a second
console.log("loop done")
```

## Too deep

The stack has a fixed size. A function that calls itself without a way to stop fills it up, and the engine throws instead of crashing.

```js run
function down(n) { return down(n + 1) }
try {
  down(0)
} catch (e) {
  console.log(e instanceof RangeError, e.message)
}
```

If you need to process something very deep (a long linked list, a huge tree), use a loop with your own array as the stack instead of recursion.
