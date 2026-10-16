---
id: qa-test-doubles
title: "Test doubles: stubs, spies, mocks and fakes"
summary: Stand-ins for the slow, the random and the remote
why: "Doubles make a unit test fast and repeatable. Used too freely, they make tests pass against a world that doesn't exist."
requires: [qa-unit-tests]
lesson: none
points:
  - title: Five kinds
    text: "A dummy fills a parameter. A stub returns canned answers. A spy also records its calls. A mock is set up with the calls it expects. A fake is a working but simplified implementation."
  - title: State or behaviour
    text: "Either check the resulting state (what was saved, what was returned) or check the calls made to collaborators. Prefer state; it couples less to the implementation."
  - title: Double the boundary
    text: "Replace clocks, randomness, networks and third-party services. Keep your own logic real."
  - title: Doubles can lie
    text: "A stub of another service only knows what you told it. Something else, like a contract or integration test, has to check that the real service still behaves that way."
quiz:
  - q: "An in-memory repository with working save and find methods, used in place of the database in tests, is a:"
    options: [Stub, Mock, Fake, Dummy]
    answer: 2
    explain: "It really works, with a shortcut (memory instead of disk) that makes it unfit for production. That is a fake. A stub would only return fixed answers."
  - q: "Your tests stub the payment provider's HTTP response. The provider renames a field. What happens?"
    options:
      - The tests fail, so you find out straight away
      - The tests keep passing while production breaks
      - The stub updates itself
    answer: 1
    explain: "The stub still returns the old shape you wrote by hand. That is why doubles for remote services need contract tests or periodic integration runs against the real thing."
  - q: "Which kind of double is given its expected calls before the act step, and fails the test itself when they don't happen?"
    options: [Mock, Fake, Stub]
    answer: 0
    explain: "That is a mock, which verifies behaviour. Stubs and fakes support state verification: the test checks results afterwards."
links:
  - { title: "Mocks Aren't Stubs (Martin Fowler)", url: "https://martinfowler.com/articles/mocksArentStubs.html" }
  - { title: "TestDouble (Martin Fowler)", url: "https://martinfowler.com/bliki/TestDouble.html" }
---
A test double stands in for a real dependency so a test can run fast and give the same result every time. The names come from Gerard Meszaros: a **dummy** only fills a parameter, a **stub** returns canned answers, a **spy** also records how it was called, a **mock** is set up in advance with the calls it should get, and a **fake** is a working but simplified implementation, such as an in-memory database.

## Three doubles in one test

The sign-up service below takes its dependencies as parameters. The test passes in a fake user store, a stub clock and a spy mailer, then checks the outcome. No database, no real time, no email.

```js run
function makeSignup({ users, mailer, clock }) {
  return async function signup(email) {
    if (await users.findByEmail(email)) return { ok: false, reason: "taken" }
    const user = { email, createdAt: clock.now() }
    await users.save(user)
    await mailer.send(email, "Welcome!")
    return { ok: true, user }
  }
}

// Fake: a working store that keeps rows in memory
function fakeUsers() {
  const rows = new Map()
  return {
    findByEmail: async (email) => rows.get(email) ?? null,
    save: async (user) => { rows.set(user.email, user) },
  }
}
// Stub: a canned answer
const fixedClock = { now: () => "2026-01-01T00:00:00Z" }
// Spy: does nothing useful, but remembers every call
function spyMailer() {
  const sent = []
  return { sent, send: async (to, subject) => { sent.push({ to, subject }) } }
}

async function main() {
  const users = fakeUsers()
  const mailer = spyMailer()
  const signup = makeSignup({ users, mailer, clock: fixedClock })

  const first = await signup("ada@example.com")
  const second = await signup("ada@example.com")

  console.log("first:", first.ok, first.user.createdAt)
  console.log("second:", second.ok, second.reason)
  console.log("emails sent:", mailer.sent.length)
}
main()
```

The fake is what makes the second call meaningful: because it really stores the first user, the "taken" path is tested without a hand-written stub for each case.

## With a framework

Vitest and Jest come with spies, mocks and fake timers built in. The same ideas, less code:

```ts
import { expect, test, vi } from "vitest"
import { fakeUsers, makeSignup } from "./signup" // the functions from the example above

test("sends one welcome email", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
  const send = vi.fn().mockResolvedValue(undefined)

  await makeSignup({ users: fakeUsers(), mailer: { send }, clock: { now: () => new Date().toISOString() } })("ada@example.com")

  expect(send).toHaveBeenCalledTimes(1)
  expect(send).toHaveBeenCalledWith("ada@example.com", "Welcome!")
  vi.useRealTimers()
})
```

## When doubles hurt

- **Over-mocking**: if a test replaces every collaborator, it tests only that the code calls things in a certain order. Refactor, and it fails. Introduce a real bug in a collaborator, and it still passes.
- **Mocking what you don't own**: hand-written stubs of a third-party SDK capture what you *think* it does. Wrap the SDK in a small adapter of your own, double the adapter in unit tests, and test the adapter itself against the real thing (or a container) in an integration test.
- **Stale stubs of other services**: every stubbed HTTP response is a claim about another team's API. Contract tests are how you keep those claims true.

A useful rule: double things that are slow, non-deterministic or outside your control. Keep plain logic and value objects real.
