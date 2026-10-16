---
id: ts-generics
title: Generics and constraints
summary: Types as parameters, linking input to output
why: "Without generics, a helper that works for any type has to return `any` or `unknown` and lose what the caller knew. With them, the type flows through."
requires: [ts-inference]
lesson: none
points:
  - title: A type parameter links things
    text: "`first<T>(xs: T[]): T | undefined` says the result has the same type as the array's items. The caller rarely writes `T`: it is inferred from the arguments."
  - title: Constraints say what T must have
    text: "`T extends { id: string }` lets the function read `.id` while still returning the caller's full type, not just `{ id: string }`."
  - title: Use them only when they relate two things
    text: "If a type parameter appears only once, it relates nothing and a plain type does the same job. Fewer type parameters give clearer errors."
quiz:
  - q: What is the type of `x`?
    code: |
      function first<T>(xs: T[]): T | undefined {
        return xs[0]
      }
      const x = first(["a", "b"])
    options: ["`unknown`", "`string | undefined`", "`any`"]
    answer: 1
    explain: "`T` is inferred as `string` from the argument, and the return type follows. The `undefined` is there because the array might be empty."
  - q: "Why write `function byId<T extends { id: string }>(items: T[], id: string): T | undefined` instead of taking `{ id: string }[]`?"
    options:
      - It runs faster
      - "The caller gets back their own item type, with all its fields, not just `{ id: string }`"
      - "Constraints are required for arrays"
    answer: 1
    explain: "With the plain type, the result is only known to have an `id`. The constraint lets the function rely on `id` while `T` remembers everything else about the caller's type."
  - q: "What is wrong with `function log<T>(value: T): void`?"
    options: [Nothing, "`T` appears only once, so it relates nothing; `value: unknown` says the same thing more simply", It needs a constraint]
    answer: 1
    explain: "A type parameter earns its place by connecting two positions: a parameter and the return type, or two parameters. Used once, it only adds noise."
links:
  - { title: "Generics (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html" }
  - { title: "More on functions: generic functions (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/functions.html" }
---
A generic function has a type parameter, written `<T>`, that stands for whatever type the caller uses. Its job is to connect types: the item type of an array to the type of the result, the type of a key to the type of the value it looks up. Callers almost never write the type argument themselves; it is inferred from what they pass. And because types are erased, generics cost nothing at runtime: `first<T>` compiles to the same function as `first`.

## Linking input and output

```ts
function first<T>(xs: T[]): T | undefined {
  return xs[0]
}

const a = first([1, 2, 3]) // number | undefined
const b = first(["x"]) // string | undefined
const c = first<boolean>([]) // written out when there is nothing to infer from
```

Compare `function first(xs: unknown[]): unknown`. It is just as correct, but every caller has to check or cast the result again, because the function threw away what the caller knew.

## Constraints

Inside a generic function, `T` could be anything, so you can't use any of its members. A constraint narrows what callers may pass and, in exchange, tells the body what it can rely on:

```ts
function byId<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id)
}

type Product = { id: string; title: string; price: number }
declare const products: Product[]

const p = byId(products, "p1") // Product | undefined, with title and price
byId([1, 2, 3], "1") // Error: number does not have an id
```

The common partner of constraints is `keyof`, which ties a key to the object it belongs to:

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Ada", age: 36 }
const age = pluck(user, "age") // number
pluck(user, "email") // Error: "email" is not a key of the user
```

`T[K]` is an indexed access type: the type of property `K` of `T`. Here two type parameters genuinely relate: `K` depends on `T`, and the result depends on both.

## Generic types

Types take parameters too, which is how `Array<T>`, `Promise<T>` and `Map<K, V>` work:

```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

function parsePort(raw: string): Result<number, string> {
  const n = Number(raw)
  return Number.isInteger(n) ? { ok: true, value: n } : { ok: false, error: `not a port: ${raw}` }
}
```

`E = Error` is a default, used when the caller leaves the second argument out.

## Restraint

The handbook gives three rules worth keeping: use the type parameter itself rather than constraining it more than needed, use as few type parameters as possible, and if a type parameter appears in only one place, you probably don't need it. `function log<T>(value: T): void` relates nothing: `value: unknown` says the same. Generics are for connecting types; when nothing needs connecting, a plain type gives simpler signatures and clearer error messages.
