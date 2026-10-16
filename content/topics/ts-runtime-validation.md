---
id: ts-runtime-validation
title: Validating data at the boundaries
summary: "Types describe your code; they can't check the network"
why: "An API response typed with `as User` is a guess written down as a fact. When the API changes, the error shows up three functions later, far from its cause."
requires: [ts-any-unknown-never, ts-erasure]
lesson: none
points:
  - title: The boundary is where types stop
    text: "JSON from a server, form fields, URL parameters, environment variables, storage and messages from other windows all arrive at runtime, after the checker has finished."
  - title: A cast is not a check
    text: "`await res.json() as User` changes what the checker believes, not what the data is. If a field is missing or has the wrong type, nothing notices until it is used."
  - title: Parse once, at the edge
    text: "Treat incoming data as `unknown`, check it in one function that returns a typed value or an error, and let the rest of the code trust the type."
quiz:
  - q: "An API starts returning `price` as the string \"9.50\". Code typed with `as Product` adds a 2.00 shipping fee. What happens?"
    options: [A compile error, "A runtime TypeError", "It quietly produces \"9.502\""]
    answer: 2
    explain: "`as Product` checked nothing, so `price` is really a string and `+` concatenates. The bug surfaces wherever the total is shown, not where the data came in."
  - q: "Where should you validate the shape of an API response?"
    options:
      - In every component that uses it
      - "Once, where it enters the program, returning a typed value or an error"
      - Nowhere; the backend has types too
    answer: 1
    explain: "One check at the boundary means everything downstream can rely on the type. Checks scattered through the code are easy to forget, and types on the other side of a network are not types on this side."
  - q: "What does a schema library such as Zod add over a hand-written type guard?"
    options:
      - It makes validation unnecessary
      - "The schema is checked at runtime and the TypeScript type is derived from it, so the two can't drift apart"
      - It runs at compile time
    answer: 1
    explain: "With a hand-written guard, the type and the checks are two things that must be kept in sync. Deriving the type from the schema (`z.infer`) leaves one source of truth."
links:
  - { title: "Narrowing: type predicates (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html" }
  - { title: "JSON.parse() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" }
  - { title: "Zod documentation", url: "https://zod.dev/" }
---
TypeScript checks the code you wrote against the types you wrote. It cannot check data that arrives while the program runs: an HTTP response, a form submission, a query string, `process.env`, `localStorage`, a `postMessage` event. `JSON.parse` and `response.json()` return `any`, and a cast such as `as User` only tells the checker what to believe. If the data doesn't match, the program carries on with wrong values until something breaks, usually somewhere far from the cause.

## What a cast hides

This is what typed code like `const product = (await res.json()) as Product` does at runtime once the API changes `price` from a number to a string. The types are gone; only the JavaScript is left:

```js run
const body = '{"id":"p1","title":"Mug","price":"9.50"}' // the server now sends a string
const product = JSON.parse(body) // in TypeScript: as Product, with price: number
const total = product.price + 2.0
console.log(total)
console.log(typeof total)
```

It prints `9.502` and `string`. No error at the boundary, no error at the addition, and a wrong price on the page. The fix is to check the shape where the data enters.

## A hand-written check

```ts
type Product = { id: string; title: string; price: number }

function parseProduct(data: unknown): Product {
  if (typeof data !== "object" || data === null) throw new Error("expected an object")
  const { id, title, price } = data as Record<string, unknown>
  if (typeof id !== "string") throw new Error("id must be a string")
  if (typeof title !== "string") throw new Error("title must be a string")
  if (typeof price !== "number" || !Number.isFinite(price)) throw new Error("price must be a number")
  return { id, title, price }
}
```

The input is `unknown`, so the checker forces every field to be tested before it can be returned as a `Product`. The rest of the program receives a value that really is one. It runs the same in the browser:

```js run
function parseProduct(data) {
  if (typeof data !== "object" || data === null) throw new Error("expected an object")
  const { id, title, price } = data
  if (typeof id !== "string") throw new Error("id must be a string")
  if (typeof title !== "string") throw new Error("title must be a string")
  if (typeof price !== "number" || !Number.isFinite(price)) throw new Error("price must be a number")
  return { id, title, price }
}
try {
  parseProduct(JSON.parse('{"id":"p1","title":"Mug","price":"9.50"}'))
} catch (err) {
  console.log("rejected at the boundary:", err.message)
}
console.log(parseProduct({ id: "p2", title: "Cup", price: 4 }).price + 2)
```

Returning a new object with only the known fields also drops anything unexpected the server sent along.

## Schemas: one source of truth

A hand-written check and its type are two things to keep in step. Schema libraries (Zod, Valibot, ArkType and others) let you write the runtime check once and derive the static type from it:

```ts
import { z } from "zod"

const Product = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
})
type Product = z.infer<typeof Product> // { id: string; title: string; price: number }

async function loadProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`)
  return Product.parse(await res.json()) // throws with a description of every mismatch
}
```

`safeParse` returns a result object instead of throwing, which suits form input where errors are expected.

## Where to put the checks

- Every place data crosses into your program: API clients, route handlers, message listeners, config loading at startup (fail fast on a missing environment variable).
- Once, at the edge. Inside the program, trust the types; repeating checks everywhere makes code noisy and still misses the one place that matters.
- On the server too. A typed client does not protect an API: anyone can send it any bytes.
