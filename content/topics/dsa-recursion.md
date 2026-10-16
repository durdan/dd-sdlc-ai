---
id: dsa-recursion
title: Recursion vs iteration
summary: A function calling itself is a loop with a stack you didn't write
why: Trees, graphs, parsers and divide-and-conquer algorithms are clearest as recursion, and knowing how to turn it into a loop saves you when the input is deep.
requires: [dsa-stacks-queues]
lesson: none
points:
  - title: Base case and smaller case
    text: A recursive function handles a trivial input directly and reduces every other input to smaller versions of itself.
  - title: Each call is a stack frame
    text: Pending calls wait on the call stack, so recursion depth costs memory, and the call stack is small.
  - title: Deep input overflows
    text: Too many nested calls throw RangeError in JavaScript and RecursionError in Python (default limit 1000).
  - title: Any recursion can be a loop
    text: Replace the call stack with an explicit stack (or queue) on the heap, and depth stops being a problem.
quiz_hint: Ask what is waiting on the call stack at the deepest point, and how deep that can get for the worst input.
quiz:
  - q: What happens if a recursive function's base case can never be reached?
    options: [It returns undefined, "It recurses until the call stack runs out and throws (RangeError in JavaScript, RecursionError in Python)", The engine detects the loop and stops it]
    answer: 1
    explain: Every call adds a frame. Without a base case they never come off, and the runtime throws when the stack is full.
  - q: Does Node optimise tail calls so that `return f(n - 1)` uses no extra stack?
    options: ["Yes, always", "No: ES2015 specified proper tail calls, but V8 has them switched off, so deep tail recursion still overflows", Only in strict mode]
    answer: 1
    explain: The V8 team implemented proper tail calls but turned them off over developer-experience concerns (lost stack frames in traces). Don't rely on tail calls in JavaScript or Python.
  - q: You convert a recursive depth-first traversal to a loop. What replaces the call stack?
    options: [A queue, An array used as a stack (push and pop), A hash map]
    answer: 1
    explain: Popping the most recently pushed item gives the same last-in, first-out order the call stack had. A queue would turn it into breadth-first order.
links:
  - { title: "Recursion (MDN glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Recursion" }
  - { title: "sys.setrecursionlimit (Python docs)", url: "https://docs.python.org/3/library/sys.html#sys.setrecursionlimit" }
  - { title: "ES2015, ES2016, and beyond: proper tail calls (V8 blog)", url: "https://v8.dev/blog/modern-javascript" }
  - { title: "Recursion (computer science) (Wikipedia)", url: "https://en.wikipedia.org/wiki/Recursion_(computer_science)" }
---
A recursive function solves a problem by calling itself on smaller pieces of it, until the pieces are small enough to answer directly. Behind the scenes every pending call sits on the call stack, waiting for the inner call to return. So recursion is iteration with a stack that the runtime manages for you, and you can always swap that hidden stack for one you manage yourself.

## The two parts

Every correct recursive function has a **base case** that it answers without recursing and a **recursive case** that moves strictly towards it. Summing a nested list is a natural fit, because the data is itself recursive: a list contains numbers or more lists.

```js run
const tree = [1, [2, [3, [4]], 5], [[6]]];

function sumRecursive(x) {
  if (typeof x === "number") return x;          // base case
  let total = 0;
  for (const item of x) total += sumRecursive(item);   // smaller subproblem
  return total;
}

function sumIterative(root) {
  const stack = [root];                          // the work we haven't done yet
  let total = 0;
  while (stack.length > 0) {
    const x = stack.pop();
    if (typeof x === "number") total += x;
    else stack.push(...x);
  }
  return total;
}

console.log(sumRecursive(tree), sumIterative(tree));   // 21 21
```

The iterative version does the same work in a different order: instead of the runtime remembering "I'm halfway through this list", the explicit stack holds the items not yet visited. Trees, file-system walks, JSON processing, parsers and divide-and-conquer sorts like merge sort and quicksort are all naturally written this way.

## The cost: stack depth

Each call needs a stack frame for its arguments, locals and return address, and the call stack is small, under a megabyte in Node 22 (V8's `--stack-size` defaults to 864 KB there), far less than the heap. Python sets a recursion limit instead: `sys.getrecursionlimit()` returns 1000 by default, and exceeding it raises `RecursionError`. Recursion depth follows the *shape* of the input, so code that works on every test can overflow on one deeply nested document:

```js run
function depth(n) { return n === 0 ? 0 : 1 + depth(n - 1); }
try {
  depth(1_000_000);
} catch (e) {
  console.log(e.constructor.name + ": " + e.message);   // RangeError: Maximum call stack size exceeded
}

let deep = [];
for (let i = 0; i < 1_000_000; i++) deep = [deep, 1];   // a million levels of nesting
function sumIterative(root) {
  const stack = [root];
  let total = 0;
  while (stack.length > 0) {
    const x = stack.pop();
    if (typeof x === "number") total += x;
    else stack.push(...x);
  }
  return total;
}
console.log(sumIterative(deep));   // 1000000: the explicit stack lives on the heap
```

Some languages guarantee **tail call elimination**: if the recursive call is the very last thing a function does, the runtime reuses the current frame. ES2015 actually specified proper tail calls for strict-mode JavaScript, but V8 (Chrome and Node) has them switched off, and CPython deliberately doesn't do it either, so in both languages deep recursion overflows no matter how you write it.

## Choosing

Write the recursive version first when the problem is recursive: it is usually shorter and easier to get right. Switch to an explicit stack when depth depends on untrusted or unbounded input, such as user-supplied JSON, long linked structures, or graph searches over millions of nodes. Using a queue instead of a stack in the same loop changes depth-first order into breadth-first order, which is the subject of the graphs topic.

Recursion can also repeat work. A naive recursive Fibonacci recomputes the same values exponentially many times; caching the results, memoisation, fixes that and leads straight into dynamic programming.
