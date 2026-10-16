---
id: closures
title: Scope and closures
summary: Functions remember where they were born
why: Every callback, event handler and private counter you write relies on it, and so does the classic loop-with-var bug.
requires: [call-stack]
lesson: none
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
