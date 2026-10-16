---
id: qa-flaky-tests
title: Why tests are flaky, and how to fix them
summary: Timing, shared state, order, network, clocks
why: "A test that fails at random teaches people to ignore red builds. Once that habit exists, the next real failure gets ignored too."
requires: [qa-integration-tests, qa-e2e-playwright]
lesson: none
points:
  - title: Flaky means non-deterministic
    text: "Same code, same test, different result. Something the test depends on isn't under its control."
  - title: Five usual causes
    text: "Guessing at timing, state shared between tests, dependence on order, real networks and services, and the real clock."
  - title: Make it fail on purpose
    text: "Repeat the test many times, shuffle the order, run it in parallel. A flake you can reproduce is half fixed."
  - title: Fix the cause, not the symptom
    text: "Wait for a condition instead of sleeping, build fresh state, double the remote service, inject the clock."
quiz:
  - q: "A test passes when run on its own and fails when the whole suite runs. What is the most likely cause?"
    options:
      - The test runner is broken
      - "Shared state: an earlier test leaves data, a global or a mock behind that this test depends on"
      - The machine is too slow
    answer: 1
    explain: "Passing alone but failing in a group is the classic sign of order dependence. Find what the earlier test changes and give each test its own fresh state."
  - q: "What should replace await sleep(2000) before an assertion?"
    options:
      - "await sleep(5000), to be safe"
      - "Waiting for the condition itself (a retrying assertion or a poll) with an overall timeout"
      - Removing the assertion
    answer: 1
    explain: "A fixed sleep is a guess: too short on a slow CI machine, a waste of time everywhere else. Waiting for the condition returns as soon as it is true and fails clearly if it never becomes true."
  - q: "A test of \"orders placed today\" fails only between 23:00 and 00:00 on CI. Why?"
    options:
      - CI is under heavy load at night
      - "It reads the real clock, and the CI server's time zone differs from the code's notion of \"today\""
      - The database goes to sleep at night
    answer: 1
    explain: "Anything that reads the current time can fail at day, month or daylight-saving boundaries. Pass a clock in, or use fake timers, and pin the time in the test."
links:
  - { title: "Eradicating Non-Determinism in Tests (Martin Fowler)", url: "https://martinfowler.com/articles/nonDeterminism.html" }
  - { title: "Assertions: auto-retrying assertions (Playwright)", url: "https://playwright.dev/docs/test-assertions" }
---
A flaky test passes and fails on the same code. The cause is nearly always something the test doesn't control: timing, data left by another test, the order tests run in, a real network call, or the clock. Retrying the test only hides the problem. The fix is to find the thing that isn't under control and bring it under control.

## Shared state and order

Two tests that share a module-level cart. Each is correct on its own; whether they pass depends on which runs first.

```js run
const cart = [] // shared by both tests: the bug
const tests = {
  "adds an item": () => { cart.push("mug"); return cart.length === 1 },
  "starts empty": () => cart.length === 0,
}
function runInOrder(names) {
  cart.length = 0
  return names.map((name) => `${name}: ${tests[name]() ? "pass" : "FAIL"}`).join(", ")
}
console.log(runInOrder(["starts empty", "adds an item"]))
console.log(runInOrder(["adds an item", "starts empty"]))
```

Under a test runner, the order changes when someone adds a file, when tests run in parallel, or when a runner shuffles. The fix is to create the cart inside each test (or in a `beforeEach`). The same goes for database rows, singletons, environment variables, and mocks that were never restored.

## Guessing at time

A fixed sleep bets on how long something takes. Waiting for the condition doesn't need to guess:

```js run
function startJob() {
  const job = { done: false }
  setTimeout(() => { job.done = true }, 30) // the "server" takes 30 ms today; on CI it might take 300
  return job
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function waitFor(check, { timeout = 1000, interval = 5 } = {}) {
  const start = Date.now()
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error("timed out waiting for condition")
    await sleep(interval)
  }
}

async function main() {
  const a = startJob()
  await sleep(10)
  console.log("after a fixed 10 ms sleep, done =", a.done)

  const b = startJob()
  await waitFor(() => b.done)
  console.log("after waitFor, done =", b.done)
}
main()
```

Playwright's web-first assertions (`await expect(locator).toHaveText(...)`) and `expect.poll()` do this for you. In unit tests, fake timers remove real waiting altogether.

## The usual suspects

| Cause | Symptom | Fix |
| --- | --- | --- |
| Timing | Fails on slow machines or under load | Wait for conditions, never fixed sleeps |
| Shared state | Passes alone, fails in the suite | Fresh data per test, reset before not after |
| Order | Fails when files are added or shuffled | Same fix; run shuffled to prove it |
| Network and services | Fails when a sandbox API is slow or down | Double it, and keep it honest with contract tests |
| Clock and time zone | Fails at midnight, month end, DST | Inject the clock, pin the time zone |
| Resource leaks | Fails after N tests, "too many connections" | Close what you open; small pools fail fast |
| Concurrency in the product | Fails one run in fifty | Often a real race condition: fix the code |

## Reproduce it first

Run the suspect many times and in different orders before changing anything: `npx playwright test --repeat-each=20 path/to/spec.ts`, Jest's `--randomize`, or Vitest's `sequence.shuffle` option. A failure you can reproduce in a minute can be fixed in an afternoon. Look hard at the last row of the table: sometimes the test is right and the product has the race.
