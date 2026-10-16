---
id: qa-unit-tests
title: Good unit tests
summary: One behaviour, arrange, act, assert
why: "Unit tests are the fastest feedback you have. When each one checks a single behaviour, a red test tells you what broke without anyone having to debug it."
requires: [qa-strategy]
lesson: none
points:
  - title: One behaviour per test
    text: "Each test checks one thing the code promises, and its name says what that is: \"applies a percentage discount\", not \"test2\"."
  - title: Arrange, act, assert
    text: "Set up the inputs, do the one action, then check the result. Three short blocks, in that order."
  - title: Test the behaviour, not the wiring
    text: "Go through the public interface and check what comes out, so you can refactor the inside without rewriting the tests."
  - title: Fast and deterministic
    text: "No real clock, randomness, network or disk. The same code gives the same result every time, in milliseconds."
quiz:
  - q: "One test checks the total, the tax, the currency and the item count. The total is wrong. What do you lose?"
    options:
      - Nothing; one test is as good as four
      - The other three checks never run, and the test name can't tell you which promise broke
      - The test runs more slowly
    answer: 1
    explain: "Most assertion libraries stop at the first failure. Split it into one test per behaviour and you see every failure at once, each with a name that explains it."
  - q: Which test survives a refactor that changes nothing a caller can see?
    options:
      - One that asserts a private helper was called with certain arguments
      - One that asserts the value the public function returns
      - One that compares a snapshot of the internal data structure
    answer: 1
    explain: "Checking the output only depends on the contract. The other two depend on how the code is built inside, so they fail when the structure changes even though nothing is broken."
  - q: What is wrong with this test?
    code: |
      test("orders placed today are not overdue", () => {
        const order = { placedAt: new Date() }
        expect(isOverdue(order, new Date())).toBe(false)
      })
    options:
      - Nothing
      - It reads the real clock twice, so it can fail when the two calls fall either side of midnight or a cut-off
      - Dates cannot be compared in tests
    answer: 1
    explain: "Two calls to new Date() return different times. Pick one fixed instant and pass it in, so every run sees the same time."
links:
  - { title: "UnitTest (Martin Fowler)", url: "https://martinfowler.com/bliki/UnitTest.html" }
  - { title: "The Practical Test Pyramid: unit tests", url: "https://martinfowler.com/articles/practical-test-pyramid.html" }
  - { title: "Test runner (Node.js API)", url: "https://nodejs.org/api/test.html" }
---
A good unit test checks one behaviour of a small piece of code, quickly and the same way every time. Write it as arrange (set up the inputs), act (call the code once) and assert (check the result). Give it a name that says what the code should do, so that when it fails, the name alone tells you what broke.

## Arrange, act, assert

You don't need a framework to see the pattern. Here is a ten-line test runner and four tests for a cart total, with prices in cents to avoid floating-point surprises. The last test fails because it found a real bug. Fix `cartTotal` and run it again.

```js run
const results = []
function test(name, fn) {
  try { fn(); results.push(`ok   ${name}`) }
  catch (e) { results.push(`FAIL ${name}: ${e.message}`) }
}
function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`)
}

// The code under test
function cartTotal(items, discountPercent = 0) {
  const sum = items.reduce((s, item) => s + item.price * item.qty, 0)
  return Math.round((sum * (100 - discountPercent)) / 100)
}

test("adds up price times quantity", () => {
  const items = [{ price: 250, qty: 2 }, { price: 100, qty: 1 }]   // arrange
  const total = cartTotal(items)                                    // act
  assertEqual(total, 600)                                           // assert
})
test("applies a percentage discount", () => {
  assertEqual(cartTotal([{ price: 1000, qty: 1 }], 15), 850)
})
test("an empty cart costs nothing", () => {
  assertEqual(cartTotal([]), 0)
})
test("a discount over 100% never makes the total negative", () => {
  assertEqual(cartTotal([{ price: 1000, qty: 1 }], 110), 0)
})
console.log(results.join("\n"))
```

Real runners such as `node:test`, Vitest and Jest work the same way. They add parallel runs, watch mode, readable diffs and coverage on top.

## Behaviour, not implementation

A test that checks *how* the code works (which private helper it called, in what order, with what internal state) breaks whenever someone restructures the code, even when nothing a caller can see has changed. People soon learn that a red test there means "update the test", and then a real failure gets the same treatment. Test through the public interface and check what comes out: a return value, a saved record, a message sent.

## Keep them deterministic

Anything that changes between runs belongs outside the unit: the clock, random numbers, generated ids, environment variables, the network. Pass them in as parameters or small dependencies so the test can fix them. Then a failure always means the code changed, never that the time of day did. The next topic covers the stand-ins you pass in.

## Small habits that pay off

- Write the test for a bug before fixing it, and watch it fail first. A test that has never failed might not be able to.
- Keep the arrange step short. If setup takes twenty lines, the code under test probably does too much.
- Test edge cases on purpose: empty, one, many, the boundary itself, and just past it.
- Avoid logic in tests (loops, ifs). A test should be simple enough that it obviously can't be wrong.
