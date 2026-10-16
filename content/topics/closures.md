---
id: closures
title: Scope and closures
summary: Functions remember where they were born
why: Every callback, event handler and private counter you write relies on it, and so does the classic loop-with-var bug.
requires: [call-stack]
lesson: lanes   # the ```trace lanes``` blocks below are the lesson
quiz:
  - q: What does this print?
    code: |
      const fns = []
      for (var i = 0; i < 3; i++) fns.push(() => i)
      console.log(fns.map((f) => f()))
    options: ["[0, 1, 2]", "[3, 3, 3]", "[undefined, undefined, undefined]"]
    answer: 1
    explain: var gives the whole function one shared i. By the time the arrows run, the loop has finished and i is 3. With let, each iteration gets its own i and you get [0, 1, 2].
  - q: What keeps a closed-over variable alive after its function has returned?
    options: [Nothing; it is freed when the function returns, Any function that can still be called and uses it, The garbage collector copies it into a global]
    answer: 1
    explain: As long as an inner function that refers to the variable is reachable, the variable stays alive. When the last such function becomes unreachable, the variable can be collected.
links:
  - title: Closures (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
---
Which variables a function can see is decided by where it is written, not where it is called. let and const live in their block, var in the whole function. A function that uses outer variables keeps them alive for as long as the function itself can still be called: that pairing is a closure.

```trace lanes
# Each expect is checked by running the code in Node (npm run paths:check).
id: counter
title: A counter factory
subtitle: The variable outlives its function
code: |
  function makeCounter() {
    let count = 0;
    return () => {
      count += 1;
      return count;
    };
  }
  const next = makeCounter();
  console.log(next());
  console.log(next());
  const other = makeCounter();
  console.log(other());
lanes:
  - { id: stack, title: Call stack, hint: What is running right now, kind: stack }
  - { id: heap, title: Scopes kept alive, hint: "Environment records and the functions that hold them", tone: violet }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. The script's own scope holds makeCounter, plus next and other, which can't be read until their lines run. This lane will show the scopes that outlive their call.
  - line: 8
    caption: makeCounter() is called. Every call creates a fresh environment record for its variables; this one holds count = 0.
    state:
      stack: [main script, { id: mc1, label: makeCounter() }]
      heap: [{ id: env1, label: "scope 1: count = 0" }]
  - line: 3
    caption: It creates an arrow function. The arrow keeps a reference to the scope it was written in, scope 1. That link is the closure.
    state:
      heap: [{ id: env1, label: "scope 1: count = 0" }, { id: fn1, label: "arrow 1 → scope 1" }]
  - line: 8
    caption: makeCounter returns and its frame is popped. Scope 1 is not thrown away, because arrow 1, now stored in next, still points at it.
    state:
      stack: [main script]
      heap: [{ id: env1, label: "scope 1: count = 0" }, { id: fn1, label: "arrow 1 → scope 1" }]
  - line: 4
    caption: next() runs arrow 1. It has no count of its own, so it looks one scope out and finds count in scope 1, and adds 1.
    state:
      stack: [main script, { id: call1, label: "next() = arrow 1" }]
      heap: [{ id: env1, label: "scope 1: count = 1" }, { id: fn1, label: "arrow 1 → scope 1" }]
  - line: 9
    caption: It returns 1, which is logged.
    state: { stack: [main script] }
    log: 1
  - line: 10
    caption: The second call finds the same scope 1, where count is still 1, and makes it 2. The value survived between calls.
    state:
      stack: [main script, { id: call2, label: "next() = arrow 1" }]
      heap: [{ id: env1, label: "scope 1: count = 2" }, { id: fn1, label: "arrow 1 → scope 1" }]
    log: 2
  - line: 11
    caption: A second makeCounter() call makes a second, separate scope with its own count = 0, and a new arrow that points at it.
    state:
      stack: [main script]
      heap: [{ id: env1, label: "scope 1: count = 2" }, { id: fn1, label: "arrow 1 → scope 1" }, { id: env2, label: "scope 2: count = 0" }, { id: fn2, label: "arrow 2 → scope 2" }]
  - line: 12
    caption: other() changes count in scope 2 only and logs 1. The first counter is still at 2.
    state:
      stack: [main script, { id: call3, label: "other() = arrow 2" }]
      heap: [{ id: env1, label: "scope 1: count = 2" }, { id: fn1, label: "arrow 1 → scope 1" }, { id: env2, label: "scope 2: count = 1" }, { id: fn2, label: "arrow 2 → scope 2" }]
    log: 1
  - caption: Nothing outside the arrows can reach either count. A scope stays alive as long as a function that uses it can still be called; once next and other are unreachable, the garbage collector can free both.
    state: { stack: [] }
expect: ["1", "2", "1"]
```

```trace lanes
id: var-vs-let
title: The loop-with-var bug
subtitle: One shared i, or one j per turn?
code: |
  const withVar = [];
  for (var i = 0; i < 3; i++) withVar.push(() => i);
  const withLet = [];
  for (let j = 0; j < 3; j++) withLet.push(() => j);
  console.log(withVar.map((f) => f()).join(" "));
  console.log(withLet.map((f) => f()).join(" "));
lanes:
  - { id: scopes, title: Variables, hint: "Each box is one binding", tone: violet }
  - { id: fns, title: Closures, hint: Which binding each arrow reads, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - caption: 'Nothing has run yet. var is scoped to the whole script (or function), not to the loop: there will be exactly one i.'
  - line: 2
    caption: The first turn of the var loop pushes an arrow. It doesn't copy i's value; it keeps a reference to the variable i itself.
    state:
      scopes: [{ id: i, label: "i = 0 (the only i)" }]
      fns: [{ id: v1, label: "arrow 1 → i" }]
  - line: 2
    caption: Turns two and three push two more arrows, and all three point at the same i.
    state:
      scopes: [{ id: i, label: "i = 2 (the only i)" }]
      fns: [{ id: v1, label: "arrow 1 → i" }, { id: v2, label: "arrow 2 → i" }, { id: v3, label: "arrow 3 → i" }]
  - line: 2
    caption: The final i++ makes i 3, the test 3 < 3 fails and the loop ends. Every arrow now sees 3.
    state:
      scopes: [{ id: i, label: "i = 3 (the only i)" }]
  - line: 4
    caption: let in a for head is special. Each turn gets a fresh binding of j, copied from the previous turn and then incremented, so the first arrow closes over j #1, which holds 0.
    state:
      scopes: [{ id: i, label: "i = 3 (the only i)" }, { id: j1, label: "j #1 (turn 1) = 0" }]
      fns: [{ id: v1, label: "arrow 1 → i" }, { id: v2, label: "arrow 2 → i" }, { id: v3, label: "arrow 3 → i" }, { id: l1, label: "arrow 4 → j #1" }]
  - line: 4
    caption: Turns two and three each have their own j, holding 1 and 2, and their arrows point at those. Nothing ever changes them again.
    state:
      scopes: [{ id: i, label: "i = 3 (the only i)" }, { id: j1, label: "j #1 (turn 1) = 0" }, { id: j2, label: "j #2 (turn 2) = 1" }, { id: j3, label: "j #3 (turn 3) = 2" }]
      fns: [{ id: v1, label: "arrow 1 → i" }, { id: v2, label: "arrow 2 → i" }, { id: v3, label: "arrow 3 → i" }, { id: l1, label: "arrow 4 → j #1" }, { id: l2, label: "arrow 5 → j #2" }, { id: l3, label: "arrow 6 → j #3" }]
  - line: 5
    caption: Calling the var arrows reads the one shared i three times.
    log: 3 3 3
  - line: 6
    caption: Calling the let arrows reads three different bindings.
    log: 0 1 2
  - caption: 'The fix for old var code was an extra function per turn (an IIFE) to make a new scope. With let you get that for free.'
expect: [3 3 3, 0 1 2]
```


## Lexical scope

Scopes nest like the braces in your file. A function can read the variables of every scope around it, and nobody outside can read the ones inside it. `let` and `const` exist from the start of their block, but reading them before the line that declares them throws a ReferenceError (the "temporal dead zone"); `var` is hoisted to the top of the function and reads as `undefined`.

## The loop-with-var bug

```js run
const withVar = []
for (var i = 0; i < 3; i++) withVar.push(() => i)
const withLet = []
for (let j = 0; j < 3; j++) withLet.push(() => j)
console.log(withVar.map((f) => f()), withLet.map((f) => f()))
```

There is one `i` for the whole script, and all three arrows read it after the loop has set it to 3. A `let` in a `for` head is special: every iteration gets a fresh binding, so each arrow keeps its own `j`.

## Private state

A closure is the simplest way to keep data private. Nothing outside `counter` can reach `count` except through the two functions it hands back.

```js run
function counter() {
  let count = 0
  return { up: () => ++count, read: () => count }
}
const c = counter()
c.up()
c.up()
console.log(c.read()) // 2
console.log(c.count) // undefined: there is no property, only a variable the functions closed over
```

The same thing explains many memory leaks: a long-lived callback that closes over a large object keeps that object alive too.
