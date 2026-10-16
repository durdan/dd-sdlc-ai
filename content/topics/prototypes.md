---
id: prototypes
title: Prototypes and classes
summary: Objects that borrow from other objects
why: It is how inheritance, instanceof and built-in methods like array.map actually work.
requires: [this]
lesson: none
quiz:
  - q: Where does the speak method of `class Dog { speak() {} }` live?
    options: ["A copy on every instance", "Once, on Dog.prototype", "On the Dog function itself"]
    answer: 1
    explain: Methods are stored once on the prototype. Every instance finds them by following its prototype link, which is why Object.hasOwn(dog, "speak") is false.
  - q: What does `x instanceof Animal` check?
    options: [Which constructor created x, Whether Animal.prototype appears somewhere in x's prototype chain, Whether typeof x is "Animal"]
    answer: 1
    explain: instanceof walks x's prototype chain looking for Animal.prototype. Change the chain (for example with Object.setPrototypeOf) and the answer changes too.
links:
  - title: Inheritance and the prototype chain (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
  - title: Classes (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
---
Every object has a hidden link to a prototype object. When a property isn't found on the object, the engine follows that link, and the next one, until it finds it or reaches null. class syntax is a tidier way to set up these links: methods live once on the prototype and every instance shares them.

## Following the chain

Reading `d.speak` first looks at `d` itself, then at `Dog.prototype`, then at `Animal.prototype`, then at `Object.prototype`, and stops at `null`. Writing `d.speak = ...` never changes the prototype: it creates an own property on `d` that hides the shared one.

```js run
class Animal {
  constructor(name) {
    this.name = name
  }
  speak() {
    return `${this.name} makes a sound`
  }
}
class Dog extends Animal {
  speak() {
    return `${super.speak()}, then barks`
  }
}
const d = new Dog("Rex")
console.log(d.speak())
console.log(Object.getPrototypeOf(d) === Dog.prototype)
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype)
console.log(Object.hasOwn(d, "speak"), "speak" in d)
console.log(d instanceof Animal)
```

## Classes are prototypes with better manners

A class is still a function with a `prototype` object; `extends` links one prototype to another, and `super` looks up the chain from there. What classes add is safety and clarity: they must be called with `new`, their bodies are strict, and private fields (`#secret`) are truly private, which no prototype trick could do before.

The same mechanism serves built-ins: `[1, 2].map` is found on `Array.prototype`. You can create an object with any prototype directly with `Object.create(proto)`, and `Object.create(null)` gives an object with no prototype at all, handy for plain lookup tables.
