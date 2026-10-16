---
id: call-stack
title: The call stack
summary: One function at a time
why: It is how you read a stack trace, and why a long-running loop freezes the whole page.
lesson: none
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
