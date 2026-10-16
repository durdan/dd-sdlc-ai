---
id: this
title: How `this` is decided
summary: Decided by the call, not the definition
why: It explains the "this is undefined" error when you pass a method around as a callback.
lesson: none
quiz:
  - q: In a module, `const f = obj.method; f()` throws "Cannot read properties of undefined". Why?
    options: [Modules do not support methods, A plain call gives this = undefined in strict code, obj was garbage collected]
    answer: 1
    explain: Modules are always strict. Called on its own, without obj. in front, the function gets this = undefined, and reading a property of undefined throws.
  - q: An arrow function written inside a method uses which this?
    options: [The global object, The this of the method around it, Always undefined]
    answer: 1
    explain: Arrow functions have no this of their own. They see the this of the code they were written in, which is why they work well as callbacks inside methods.
links:
  - title: this (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
---
For ordinary functions, this is set by how the function is called: obj.method() gives obj, new gives the freshly created object, call/apply/bind set it explicitly, and a plain call gives undefined in strict code (classes and modules are always strict). Arrow functions have no this of their own; they use the one from the code around them.

## Four ways to call a function

1. **With new**: `new User()` creates an object and passes it as `this`.
2. **Explicitly**: `fn.call(x)`, `fn.apply(x)` and `fn.bind(x)` choose `this` yourself. A bound function keeps it for good.
3. **As a method**: `obj.fn()` passes `obj`. It is the dot at the moment of the call that counts, not where the function was defined.
4. **Plainly**: `fn()` passes `undefined` in strict code. In old sloppy-mode scripts it falls back to the global object, which hides the bug.

```js run
"use strict"
const user = {
  name: "Ada",
  hello() {
    return `hi, ${this.name}`
  },
}
console.log(user.hello()) // called on user
const loose = user.hello
try {
  loose() // a plain call: this is undefined
} catch (e) {
  console.log("plain call:", e.message)
}
console.log(loose.call({ name: "Grace" })) // chosen explicitly
console.log(user.hello.bind(user)()) // bound for good
```

## Arrow functions

An arrow function does not get a `this` from its call. It uses the `this` of the code it sits in. That makes it the right choice for callbacks inside methods, and the wrong choice for a method itself: an arrow written as an object property sees the `this` of the surrounding code, not the object.

```js run
class Clock {
  constructor() {
    this.ticks = 0
  }
  start() {
    ;[1, 2, 3].forEach(() => this.ticks++) // the arrow sees the Clock
    return this.ticks
  }
}
console.log(new Clock().start()) // 3
```
