---
id: ts-inference
title: Inference, widening and narrowing
summary: How a value's type is worked out, and refined
why: "Most types in good TypeScript are never written down. Knowing how the checker infers and narrows them tells you where an annotation helps and where it only gets in the way."
requires: [ts-structural]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Inference
    text: "The checker works out types from initial values, return statements and the context a function is passed into, so most local variables need no annotation."
  - title: Widening
    text: "A `let` or an object property holding \"draft\" is widened to `string`, because it could change later. `const` and `as const` keep the literal."
  - title: Narrowing
    text: "Inside an `if`, after a `typeof`, `in`, `instanceof`, equality or truthiness check, the checker knows the value's type more precisely. This is control-flow analysis."
quiz:
  - q: What is the inferred type of `status`?
    code: |
      const draft = { status: "draft" }
      const status = draft.status
    options: ["`\"draft\"`", "`string`", "`any`"]
    answer: 1
    explain: "Object properties are mutable, so the literal is widened to `string`. Write `{ status: \"draft\" } as const` (or annotate the object) to keep `\"draft\"`."
  - q: "`v` is `string | number`. What is its type on the last line?"
    code: |
      function f(v: string | number) {
        if (typeof v === "string") return v.length
        return v
      }
    options: ["`string | number`", "`number`", "`never`"]
    answer: 1
    explain: "The `string` case returned early, so the checker removes it from the union for the rest of the function."
  - q: "What does `config satisfies Config` do that `const config: Config = ...` doesn't?"
    options:
      - It checks the value at runtime
      - It checks the value against `Config` but keeps the more precise inferred type
      - It turns off excess property checks
    answer: 1
    explain: "An annotation replaces the inferred type with `Config`. `satisfies` (since TypeScript 4.9) checks compatibility and leaves the inferred type in place, so literal values and exact keys are not lost."
links:
  - { title: "Narrowing (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html" }
  - { title: "Type inference (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/type-inference.html" }
  - { title: "TypeScript 4.9: the satisfies operator", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html" }
---
TypeScript works out most types itself. It infers a variable's type from the value it starts with, a function's return type from its `return` statements, and a callback's parameter types from where the callback is passed. Then, as your code tests values with `if` and `switch`, it narrows those types further. Annotations are for the places inference can't see: function parameters, public APIs, and values whose type you want to pin down on purpose.

## Inference and widening

```ts
let a = "draft" // string
const b = "draft" // "draft"
const c = { status: "draft" } // { status: string }
const d = { status: "draft" } as const // { readonly status: "draft" }
const e = [1, "x"] // (string | number)[]
```

The rule behind these: the checker infers the type the value could later hold. A `let` can be reassigned and an object property can be overwritten, so the literal `"draft"` is widened to `string`. A `const` binding can't change, so it keeps the literal type. `as const` says that nothing in the expression will change: properties become `readonly` and keep their literal types, and arrays become readonly tuples.

Contextual typing works in the other direction. In `[1, 2, 3].map((n) => n * 2)`, nobody wrote that `n` is a `number`: the checker knows what `map` passes to its callback.

## Narrowing

A union type says a value may be one of several things. Each check you write tells the checker which one it has, from that point on:

```ts
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number }

function describe(input: string | number | Shape | null) {
  if (input === null) return "nothing" // equality
  if (typeof input === "string") return input.toUpperCase() // typeof
  if (typeof input === "number") return input.toFixed(2)
  if ("r" in input) return `circle ${input.r}` // in
  return `square ${input.side}` // only one possibility left
}
```

None of this is magic: each check is ordinary JavaScript that runs, and the checker follows the control flow (returns, `else` branches, assignments) to know which checks have passed at each line. Narrowing can only work with what exists at runtime, which is why it uses `typeof`, `in` and property values rather than type names.

When a check is too complex to follow, write a type predicate:

```ts
type Item = { id: string; price: number }

function isItem(x: unknown): x is Item {
  return typeof x === "object" && x !== null && "id" in x && "price" in x
}
```

The checker trusts the `x is Item` claim without verifying the body, so a careless predicate is just a cast in disguise. Since TypeScript 5.5 it can infer simple predicates by itself, for example in `values.filter((v) => v !== undefined)`.

## `satisfies`: check without widening

```ts
type Config = Record<string, string | number>

const annotated: Config = { port: 8080, host: "localhost" }
const checked = { port: 8080, host: "localhost" } satisfies Config

checked.port.toFixed(0) // fine: still known to be a number
annotated.port // type is string | number, and the key may not exist at all
```

An annotation replaces the inferred type; `satisfies` only checks against it. Use it for configuration objects and lookup tables, where you want both the check and the precise keys and values.

```trace diagram
id: infer-narrow
title: Where a type comes from
subtitle: Inferred, widened, contextual, then narrowed
groups:
  - { id: infer, label: Inference }
  - { id: narrow, label: "Narrowing: function f(input: string | number | null)" }
elements:
  - { id: lit, label: "\"draft\"", sub: a string literal, group: infer, row: 0 }
  - { id: wide, label: let or object property, sub: "type: string", group: infer, row: 1 }
  - { id: fixed, label: const or as const, sub: "type: \"draft\"", group: infer, row: 1 }
  - { id: arr, label: "[1, 2, 3]", sub: "number[]", group: infer, row: 0 }
  - { id: ctx, label: "map((n) => n * 2)", sub: "n: number, from map", group: infer, row: 1 }
  - { id: union, label: "string | number | null", kind: system, group: narrow, row: 2 }
  - { id: nul, label: "null", sub: inside the if, group: narrow, row: 3 }
  - { id: str, label: string, sub: toUpperCase() allowed, group: narrow, row: 3 }
  - { id: num, label: number, sub: all that is left, group: narrow, row: 3 }
edges:
  - { id: widen, from: lit, to: wide, label: widened }
  - { id: keep, from: lit, to: fixed, label: kept }
  - { id: context, from: arr, to: ctx, label: contextual }
  - { id: is-null, from: union, to: nul, label: "=== null" }
  - { id: is-string, from: union, to: str, label: typeof }
  - { id: rest, from: union, to: num, label: both returned }
steps:
  - caption: Most types are never written down. The checker infers them from values and context, then refines them as your code tests values.
  - caption: "A let can be reassigned and an object property overwritten, so the literal \"draft\" is widened to string: the type the value could later hold."
    trace: [widen]
  - caption: "A const binding can't change, so it keeps the literal type \"draft\". as const says the same of a whole object: its properties become readonly literals."
    trace: [keep]
  - caption: Contextual typing works the other way round. Nobody wrote that n is a number; the checker knows what map passes to its callback, from the array's type.
    trace: [context]
  - caption: A union says a value may be one of several things. Until a check proves which one, only what all the members share is allowed.
    focus: [union]
  - caption: input === null is ordinary JavaScript. Inside that if, the checker knows input is null, and after its early return null is gone from the union.
    trace: [is-null]
  - caption: "A typeof input === \"string\" check narrows the same way, so toUpperCase() compiles inside it."
    trace: [is-string]
  - caption: After both checks have returned, only number is left, so toFixed() compiles with no check at all. The checker followed the control flow to get there.
    trace: [rest]
  - caption: "Narrowing can only use what exists at runtime: typeof, in, instanceof, equality and truthiness. A type name can't be tested, because it has been erased."
    focus: [nul, str, num]
note: "satisfies is the third tool: it checks a value against a type but keeps the precise inferred type."
```
