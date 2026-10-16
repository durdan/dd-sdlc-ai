---
id: ts-any-unknown-never
title: "`any`, `unknown` and `never`"
summary: "Switch checking off, demand a check, or rule out every value"
why: "One stray `any` silently disables checking for everything it touches. Knowing when to reach for `unknown` or `never` instead is most of what keeps a codebase honest."
requires: [ts-unions]
lesson: none
points:
  - title: any turns the checker off
    text: "Every operation on an `any` is allowed, and the result is `any` too, so it spreads to whatever it flows into without a single error."
  - title: unknown means check first
    text: "Any value can be assigned to `unknown`, but you can't do anything with it until you narrow it. It is the honest type for data you haven't inspected."
  - title: never means no value
    text: "`never` is the empty type: the result of a function that always throws, what is left of a union after every case is handled, and what you get when constraints contradict."
quiz:
  - q: "What does the checker say about this line, if `data` comes from `JSON.parse(text)`?"
    code: |
      const total: number = data.items.reduce((s, i) => s + i.price, 0)
    options: [An error because data might be undefined, Nothing at all, An error because reduce needs a type argument]
    answer: 1
    explain: "`JSON.parse` returns `any`, so every property access and call on it is accepted, and `total` is trusted to be a number. If the JSON has no `items`, this throws at runtime with no warning."
  - q: "`value` is `unknown`. Which line compiles?"
    options: ["`value.trim()`", "`if (typeof value === \"string\") value.trim()`", "`const n: number = value`"]
    answer: 1
    explain: "`unknown` allows nothing until it is narrowed. After the `typeof` check, `value` is a `string` inside the `if`. Assigning `unknown` to a `number` needs a check or a cast."
  - q: "A function's body is only `throw new Error(msg)`. Which return type lets the checker treat code after a call to it as unreachable?"
    options: ["`void`", "`undefined`", "`never`"]
    answer: 2
    explain: "Declared as returning `never`, a call to it is a dead end for narrowing, just like a `throw` statement. A function declaration without an annotation is inferred as `void`, which does not have that effect."
links:
  - { title: "More on functions: unknown and never (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/functions.html" }
  - { title: "useUnknownInCatchVariables (TSConfig reference)", url: "https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables" }
---
These three types sit at the edges of the type system. `unknown` is the top: every value fits in it. `never` is the bottom: no value fits in it. `any` is not on the scale at all; it is an instruction to stop checking. Using `unknown` where you are tempted to use `any` keeps the checker working, and recognising `never` explains several of the checker's more puzzling messages.

## `any`: no checking, and it spreads

```ts
declare const text: string

const data = JSON.parse(text) // any
const name = data.user.profile.name // any; nothing was checked
const upper: string = name.toUpperCase() // accepted

function shout(s: string) {
  return s.toUpperCase()
}
shout(data.count) // accepted, even if count is a number
```

`any` can be assigned to every type and every type can be assigned to it, and each operation on it produces another `any`. A single `any` from a library call or a quick fix can therefore travel through many functions, switching checks off wherever it goes, without an error anywhere. `noImplicitAny` (part of `strict`) stops the checker from silently choosing `any` when it can't infer a type, but explicit `any`, and `any` returned by APIs such as `JSON.parse` and `response.json()`, still get through.

## `unknown`: you must check first

```ts
function length(value: unknown): number {
  // value.length here would fail: 'value' is of type 'unknown'
  if (typeof value === "string" || Array.isArray(value)) return value.length
  return 0
}
```

`unknown` accepts every value, like `any`, but allows nothing until the value has been narrowed. That makes it the right type for anything from outside your program: parsed JSON, a message from another window, a value from storage. With `useUnknownInCatchVariables` (also in `strict`), the error in a `catch` block is `unknown`, because JavaScript lets code throw anything, not only `Error` objects:

```ts
try {
  JSON.parse("{")
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.log(message)
}
```

## `never`: no value at all

`never` turns up in three places:

- **Code that can't be reached.** After every member of a union has been handled, the remaining type is `never`. Exhaustiveness checks rely on this.
- **Functions that never return.** A function that always throws or loops forever can be declared `(): never`. Code after a call to it is treated as unreachable, so it narrows like a `throw`.
- **Contradictions.** `string & number` is `never`, because no value is both. An unexpected `never` in an error message usually means two constraints conflict.

```ts
function fail(message: string): never {
  throw new Error(message)
}

function port(raw: string | undefined): number {
  if (raw === undefined) fail("PORT is not set")
  return Number(raw) // raw is string here: fail() never returns
}
```

## A rule of thumb

If you don't know the type yet, use `unknown` and narrow it. If you know it but can't express it, write the type, or a cast at one well-commented spot. Keep `any` for migrating old code, and find the remaining uses with the `@typescript-eslint/no-explicit-any` lint rule or a search for `: any`.
