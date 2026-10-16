---
id: qa-integration-tests
title: Integration tests, test data and environments
summary: A real database in a throwaway container
why: "Many bugs live where your code meets something else: a SQL dialect, a unique constraint, a message format. Only a real dependency shows them."
requires: [qa-test-doubles]
lesson: none
points:
  - title: Real dependencies
    text: "Run the same database, broker or cache engine and version that production uses. A container makes that cheap and disposable."
  - title: Each test builds its own data
    text: "Don't lean on a shared seed that other tests also change. Create what the test needs, with unique values, right before it runs."
  - title: Reset by rebuilding
    text: "Start each test from a known state, by truncating tables, rolling back a transaction or restoring a snapshot, instead of trusting the previous test to clean up."
  - title: Environments that match
    text: "Throwaway environments per branch beat one shared staging that everyone breaks for each other."
quiz:
  - q: Why run repository tests against real Postgres instead of SQLite or an in-memory fake?
    options:
      - SQLite is too slow
      - "SQL dialects, types, constraints and locking differ, so the fake can pass queries that fail in production"
      - Postgres has better coverage reports
    answer: 1
    explain: "JSON operators, upserts, case sensitivity, time zones and constraint errors all behave differently between engines. Testing against a different engine tests a different program."
  - q: "Two tests run in parallel and both insert a user with email test@example.com into a column with a unique index. One fails at random. The best fix?"
    options:
      - Run the whole suite on one worker
      - Give each test its own unique data, for example from a factory that adds a sequence number or a random id
      - Add a retry
    answer: 1
    explain: "The tests collide on shared data. Unique values per test remove the collision and keep the suite parallel. Serialising hides the problem and slows everything down."
  - q: "Why rebuild a known state before each test rather than clean up after it?"
    options:
      - Cleaning up is not allowed in Jest
      - A test that crashes or times out skips its cleanup and leaves dirt for the next one, while a reset at the start always runs
      - Rebuilding uses less memory
    answer: 1
    explain: "Setup at the start of a test runs every time. Teardown is skipped exactly when something went wrong, which is when you most need it."
links:
  - { title: "Getting started with Testcontainers for Node.js", url: "https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/" }
  - { title: "PostgreSQL module (Testcontainers for Node.js)", url: "https://node.testcontainers.org/modules/postgresql/" }
  - { title: "Eradicating Non-Determinism in Tests: lack of isolation (Martin Fowler)", url: "https://martinfowler.com/articles/nonDeterminism.html" }
---
An integration test checks that your code works with the real thing it talks to: a database, a queue, a cache, the file system. You give up some speed and get confidence that the SQL, the serialisation and the configuration are right. Containers make this practical: each test run can start a real Postgres, use it and throw it away.

## A real database per test run

[Testcontainers](https://testcontainers.com/) starts Docker containers from your test code and removes them when the run ends. This Vitest file tests a repository against the same Postgres version production uses:

```ts
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { Client } from "pg"
import { afterAll, beforeAll, beforeEach, expect, test } from "vitest"
import { migrate } from "../db/migrate"
import { createOrder, findOrdersByCustomer } from "../db/orders"

let container: StartedPostgreSqlContainer
let db: Client

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start()
  db = new Client({ connectionString: container.getConnectionUri() })
  await db.connect()
  await migrate(db) // the real migrations, so they get tested too
}, 60_000)

afterAll(async () => {
  await db.end()
  await container.stop()
})

beforeEach(async () => {
  await db.query("TRUNCATE orders RESTART IDENTITY CASCADE")
})

test("finds only the customer's own orders", async () => {
  await createOrder(db, { customerId: "c1", totalCents: 500 })
  await createOrder(db, { customerId: "c2", totalCents: 900 })

  const orders = await findOrdersByCustomer(db, "c1")

  expect(orders.map((o) => o.totalCents)).toEqual([500])
})
```

Starting the container takes a few seconds, so start one per test file (or per worker), not per test, and reset the data between tests. Other ways to reset: run each test inside a transaction that is rolled back at the end, or use the Postgres module's `snapshot()` and `restoreSnapshot()`.

## Test data: build it, don't share it

A shared seed file ("user 1 is an admin, order 7 is refunded") turns into hidden coupling: one test changes order 7 and a test in another file starts failing. Instead, have each test create exactly what it needs through a **factory** with sensible defaults, overriding only what matters for that test:

```js run
let seq = 0
function buildUser(overrides = {}) {
  seq++
  return { id: `user-${seq}`, email: `user${seq}@test.example`, role: "member", country: "DK", ...overrides }
}

const admin = buildUser({ role: "admin" })
const member = buildUser()
console.log(JSON.stringify(admin))
console.log(member.email, member.role)
```

The override makes the point of the test visible (`role: "admin"`), and the sequence number keeps values unique, so tests can run in parallel against the same database without colliding on unique indexes. Use reserved domains such as `example.com` or `.test` for fake emails so nothing is ever sent to a real person.

## Environments

- **Locally and in CI**: containers, started by the tests themselves or by Docker Compose. Same images, same versions as production.
- **Per pull request**: a short-lived preview environment for end-to-end tests, created and destroyed by the pipeline.
- **Shared staging**: useful for a final check, but shared state there makes failures hard to reproduce. Don't make every merge depend on it.

Whatever the environment, keep configuration in one place and close to production's. Many "works on staging" incidents are really configuration differences that no test could see.
