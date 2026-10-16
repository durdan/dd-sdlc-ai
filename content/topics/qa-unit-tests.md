---
id: qa-unit-tests
title: Good unit tests
summary: One behaviour, arrange, act, assert
why: "Unit tests are the fastest feedback you have. When each one checks a single behaviour, a red test tells you what broke without anyone having to debug it."
requires: [qa-strategy]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: aaa
title: Arrange, act, assert
subtitle: One behaviour, with stand-ins at the edges
direction: DOWN
groups:
  - { id: test, label: "The test: confirms the order by email" }
  - { id: edges, label: "Test doubles: where the real world would be" }
elements:
  - { id: arrange, label: Arrange, sub: "inputs, a fixed time, seeded data", group: test, row: 0 }
  - { id: act, label: Act, sub: call the unit once, group: test, row: 0 }
  - { id: assert, label: Assert, sub: check what came out, group: test, row: 0 }
  - { id: unit, label: placeOrder(), sub: the unit under test, kind: system, tone: core, row: 1 }
  - { id: clock, label: Fixed clock, sub: "stub: always 09:00", group: edges, tone: neutral, row: 2 }
  - { id: orders, label: In-memory orders, sub: fake repository, group: edges, tone: data, row: 2 }
  - { id: mailer, label: Mailer spy, sub: records what was sent, group: edges, tone: stream, row: 2, role: service }
  - { id: result, label: Returned order, sub: "status, total, time", tone: neutral, row: 2 }
edges:
  - { id: call, from: act, to: unit }
  - { id: now, from: unit, to: clock }
  - { id: save, from: unit, to: orders, flow: data }
  - { id: send, from: unit, to: mailer }
  - { id: ret, from: unit, to: result }
  - { id: check, from: assert, to: result, style: dotted, flow: main }
steps:
  - caption: One test, three short blocks. In the middle is the unit under test, and at its edges, where the real clock, database and email server would be, are stand-ins the test controls.
  - caption: Arrange sets everything up. The cart, a clock that always says 09:00, and an in-memory repository seeded with what the test needs.
    focus: [arrange, clock, orders]
  - caption: Why stand-ins? A real clock, database or mail server is slow, or changes between runs. With these, the same code gives the same result every time, in milliseconds.
    focus: [edges]
  - caption: Act is a single call to the unit, through its public interface.
    focus: [act, unit]
    trace: [call]
  - caption: The unit reads the time and saves the order through its dependencies. It doesn't know they are stand-ins; it only sees the same interface as the real ones.
    focus: [unit, clock, orders]
    trace: [now, save]
  - caption: It sends the confirmation through the mailer, and the spy just records the message. It returns the placed order.
    focus: [unit, mailer, result]
    trace: [send, ret]
  - caption: Assert checks the result a caller sees, the status and the total, not which private helpers ran. That way the test still passes after a refactor that changes nothing a caller can see.
    focus: [assert, result]
    trace: [check]
  - caption: Check the spy only when the email is part of the promise. Here it is, because this test's name says the order is confirmed by email.
    focus: [assert, mailer]
  - caption: When this test goes red, its name tells you which behaviour broke. Another behaviour, like rejecting an empty cart, gets a test of its own.
    focus: [test]
note: The unit here is illustrative. Pass the clock, ids and other outside things in as parameters or small dependencies so a test can replace them.
```
