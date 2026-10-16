---
id: qa-api-testing
title: "API testing: status codes, schemas, idempotency, auth"
summary: Check what clients actually rely on
why: "An API is a promise to every client at once. Tests at this layer are fast, independent of the UI, and catch the bugs that leak data or charge twice."
requires: [qa-integration-tests]
lesson: none
points:
  - title: Status and shape
    text: "Check the status code and the body's shape and values. A 200 with the wrong JSON is still a bug."
  - title: The unhappy paths
    text: "Invalid input, missing auth, someone else's resource, a duplicate, a conflict. Most API bugs live here."
  - title: Idempotency
    text: "Send the same request twice and check that it only happens once. PUT and DELETE should be idempotent by design; POST needs a key."
  - title: Authorisation per object
    text: "A valid token is not permission. Test that user A can't read or change user B's things."
quiz:
  - q: "Alice's valid token can GET /orders/123, which belongs to Bob, and gets 200. What kind of bug is that?"
    options:
      - An authentication bug; the token is invalid
      - "Broken object-level authorisation: the API checks who you are but not whether the object is yours"
      - A caching bug
    answer: 1
    explain: "This is first on the OWASP API Security Top 10 (2023). The token was fine; the missing check is \"does this order belong to this user\". The API should answer 403, or 404 to avoid revealing that the order exists."
  - q: "DELETE /items/7 returns 204 the first time and 404 the second. Is DELETE still idempotent?"
    options:
      - No, the responses differ
      - "Yes: idempotency is about the effect on the server, and after either call the item is gone"
      - Only if the second call returns 204 too
    answer: 1
    explain: "Idempotent means repeating the request leaves the server in the same state as doing it once. The response can be different."
  - q: "A test only asserts expect(res.status()).toBe(200). What can still be broken?"
    options:
      - Nothing; 200 means success
      - "The body: missing fields, wrong types, wrong values, or data that belongs to someone else"
      - Only the headers
    answer: 1
    explain: "Status codes are coarse. Validate the body against a schema and check the values the client depends on."
links:
  - { title: "API testing (Playwright)", url: "https://playwright.dev/docs/api-testing" }
  - { title: "HTTP response status codes (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status" }
  - { title: "Idempotent (MDN glossary)", url: "https://developer.mozilla.org/en-US/docs/Glossary/Idempotent" }
  - { title: "API1:2023 Broken Object Level Authorization (OWASP)", url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/" }
---
API tests call your service over HTTP the way a client would, and check the status code, the body's shape, and what happened on the server. They are faster and more stable than browser tests and test the same rules. The bugs that hurt most here are the unhappy paths: missing or wrong credentials, other users' data, and requests that run twice.

## What to check on every endpoint

- **Status codes that mean something**: `201` with a `Location` header for a create, `400` for malformed input, `401` when there are no valid credentials, `403` when the caller is known but not allowed, `404` for a missing resource, `409` for a conflict such as a duplicate.
- **The body's shape**: required fields are present and have the right types. Use a JSON Schema or the OpenAPI spec as the single source, so tests and documentation can't drift apart.
- **The effect**: after a `POST`, the record exists. After a failed request, nothing changed.
- **Authorisation per object**: try each endpoint as the owner, as another user, and with no token at all.

## Idempotency and retries

Networks drop responses, and clients retry. `GET`, `PUT` and `DELETE` are idempotent by definition: repeating them leaves the server in the same state, even if the response changes (a second `DELETE` may return `404`). `POST` is not, so APIs that take payments or create orders accept an **idempotency key**: a client-chosen id sent in a header, so the server can recognise a retry and replay the first result instead of acting again.

A tiny in-memory handler shows what a test should prove:

```js run
const orders = new Map()
const seenKeys = new Map()
let nextId = 1

function postOrder({ headers, body }) {
  if (!headers.authorization) return { status: 401 }
  if (typeof body.qty !== "number" || body.qty < 1) return { status: 400, body: { error: "qty must be 1 or more" } }
  const key = headers["idempotency-key"]
  if (key && seenKeys.has(key)) return seenKeys.get(key) // a retry: replay, don't repeat
  const order = { id: nextId++, sku: body.sku, qty: body.qty }
  orders.set(order.id, order)
  const response = { status: 201, body: order }
  if (key) seenKeys.set(key, response)
  return response
}
const hasShape = (obj, shape) => Object.entries(shape).every(([k, type]) => typeof obj?.[k] === type)

const auth = { authorization: "Bearer test-token" }
const first = postOrder({ headers: { ...auth, "idempotency-key": "k1" }, body: { sku: "MUG", qty: 2 } })
const retry = postOrder({ headers: { ...auth, "idempotency-key": "k1" }, body: { sku: "MUG", qty: 2 } })

console.log(first.status, retry.status, "same order:", first.body.id === retry.body.id, "orders stored:", orders.size)
console.log("shape ok:", hasShape(first.body, { id: "number", sku: "string", qty: "number" }))
console.log("no token:", postOrder({ headers: {}, body: { sku: "MUG", qty: 1 } }).status)
console.log("qty 0:", postOrder({ headers: auth, body: { sku: "MUG", qty: 0 } }).status)
```

A real implementation also stores keys durably, expires them, and rejects a reused key that arrives with a *different* body.

## The same checks with Playwright

Playwright's `request` fixture sends HTTP calls without opening a browser, using `baseURL` from the config:

```ts
import { expect, test } from "@playwright/test"

test("a retried create with the same key makes one order", async ({ request }) => {
  const headers = { Authorization: `Bearer ${process.env.ALICE_TOKEN}`, "Idempotency-Key": crypto.randomUUID() }
  const data = { sku: "MUG", qty: 2 }

  const first = await request.post("/api/orders", { headers, data })
  const retry = await request.post("/api/orders", { headers, data })

  expect(first.status()).toBe(201)
  expect((await retry.json()).id).toBe((await first.json()).id)
})

test("Alice cannot read Bob's order", async ({ request }) => {
  const res = await request.get(`/api/orders/${process.env.BOB_ORDER_ID}`, {
    headers: { Authorization: `Bearer ${process.env.ALICE_TOKEN}` },
  })
  expect([403, 404]).toContain(res.status())
})
```

Create the users and orders these tests need through the API or a factory at the start of the run, not by hand in a shared environment.
