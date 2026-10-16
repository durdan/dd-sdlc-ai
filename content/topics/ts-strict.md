---
id: ts-strict
title: Strictness flags, and why `strict` matters
summary: How much the checker is allowed to check
why: "Without `strict`, `null` and `undefined` fit into every type and untyped parameters silently become `any`. That is the majority of the bugs TypeScript is meant to catch."
requires: [ts-any-unknown-never]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: strict is a family
    text: "`\"strict\": true` turns on a set of checks, including `strictNullChecks` and `noImplicitAny`. New releases can add members to the family."
  - title: strictNullChecks matters most
    text: "With it, `null` and `undefined` are their own types. A value that may be missing says so in its type, and you must handle it before use."
  - title: Some useful checks are outside strict
    text: "`noUncheckedIndexedAccess` makes `arr[i]` and `record[key]` include `undefined`; `exactOptionalPropertyTypes` separates a missing property from one set to `undefined`."
  - title: Adopt it gradually
    text: "In an existing codebase, enable the flags one at a time and fix each kind of error, rather than switching on `strict` and facing thousands at once."
quiz:
  - q: "With `strictNullChecks` off, what is the type of `u` in `const u = users.find((x) => x.id === id)`?"
    options: ["`User | undefined`", "`User`, even though `find` may return `undefined`", "`any`"]
    answer: 1
    explain: "Without the flag, `undefined` is allowed in every type, so the checker drops it and `u.name` compiles. With it, the type is `User | undefined` and you must check first."
  - q: "Which of these is NOT turned on by `\"strict\": true` in TypeScript 5.x?"
    options: ["`noImplicitAny`", "`useUnknownInCatchVariables`", "`noUncheckedIndexedAccess`"]
    answer: 2
    explain: "`noUncheckedIndexedAccess` has to be enabled separately. It is often worth it, because it makes every index lookup admit that the element may not be there."
  - q: "Why can upgrading TypeScript produce new errors in a project that uses `strict`?"
    options: [Strict mode is redefined randomly, New checks can be added to the strict family, The upgrade turns off skipLibCheck]
    answer: 1
    explain: "For example, `useUnknownInCatchVariables` joined the family in 4.4 and `strictBuiltinIteratorReturn` in 5.6. Projects with `strict` get them automatically on upgrade, which is usually what you want."
links:
  - { title: "strict (TSConfig reference)", url: "https://www.typescriptlang.org/tsconfig/#strict" }
  - { title: "noUncheckedIndexedAccess (TSConfig reference)", url: "https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess" }
  - { title: "The Basics: strictness (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html" }
---
How much TypeScript protects you depends on its configuration. With the defaults of a bare `tsc`, `null` and `undefined` can be assigned to any type and a parameter without a type silently becomes `any`, so a lot of broken code type-checks. `"strict": true` in `tsconfig.json` (which `tsc --init` writes for you) switches on a family of checks that close those holes. Treat it as the starting point for any new project, not as an advanced setting.

## What is in the family

In TypeScript 5.x, `strict` enables:

| Flag | What it catches |
| --- | --- |
| `strictNullChecks` | Using a value that may be `null` or `undefined` without checking |
| `noImplicitAny` | Parameters and variables the checker would have to give `any` |
| `strictFunctionTypes` | Callbacks that expect a narrower argument than they will be given |
| `strictBindCallApply` | Wrong arguments to `fn.call`, `fn.apply` and `fn.bind` |
| `strictPropertyInitialization` | Class fields that the constructor never sets |
| `noImplicitThis` | `this` with an unknown type inside functions |
| `useUnknownInCatchVariables` | Treating a caught value as an `Error` without checking |
| `strictBuiltinIteratorReturn` | Treating `next().value` of a finished built-in iterator as a real value (it is `undefined`, not `any`) |
| `alwaysStrict` | Emits `"use strict"` and parses every file in strict mode |

Each can still be turned off individually (`"strictPropertyInitialization": false`), which is useful while migrating.

## The one that matters most

```ts
type User = { id: string; name: string }
declare const users: User[]

const u = users.find((x) => x.id === "u1")
console.log(u.name) // Error: 'u' is possibly 'undefined'

if (u) console.log(u.name) // fine: narrowed to User
console.log(u?.name ?? "unknown") // fine: handles the missing case
```

Without `strictNullChecks`, the type of `u` is plain `User`, and the first `console.log` compiles and then throws `TypeError: Cannot read properties of undefined` the first time no user matches. Missing values are the most common runtime error in JavaScript, and this flag is what lets the checker see them.

## `noImplicitAny`

```ts
function total(items) { // Error: Parameter 'items' implicitly has an 'any' type
  let sum = 0
  for (const item of items) sum += item.price
  return sum
}
```

Without the flag, `items` is silently `any` and nothing in the function is checked. With it, you have to say what `items` is, or write `any` explicitly, where reviewers can see it.

## Beyond `strict`

```ts
const scores: Record<string, number> = { ada: 3 }
const s = scores["lin"] // number, under strict alone
```

The lookup returns `undefined` at runtime, but its type says `number`. `noUncheckedIndexedAccess` makes it `number | undefined`, at the cost of extra checks on array access in loops. `exactOptionalPropertyTypes` stops `{ name?: string }` from accepting an explicit `name: undefined`. Neither is in `strict`; both are worth trying on new code.

## Turning it on in an existing project

Switching on `strict` in a large JavaScript-flavoured codebase can produce thousands of errors. Enable the flags one at a time, starting with `noImplicitAny` and then `strictNullChecks`, and fix each kind of error before the next. Tools that track and suppress existing errors per file let new code meet the strict rules while old code catches up.

```trace diagram
id: strict-catches
title: One file, five bugs
subtitle: Which flag reports which line
groups:
  - { id: family, label: "\"strict\": true" }
elements:
  - { id: snip, label: orders.ts, sub: "find, total, catch, Cart, scores", kind: system, row: 0 }
  - { id: crash, label: TypeError at runtime, sub: what ships with strict off, kind: external, row: 1 }
  - { id: nullc, label: strictNullChecks, sub: "u is possibly undefined", group: family, row: 1, role: security }
  - { id: implicit, label: noImplicitAny, sub: "items is implicitly any", group: family, row: 1, role: security }
  - { id: catchv, label: useUnknownInCatchVariables, sub: "err is unknown", group: family, row: 2, role: security }
  - { id: propinit, label: strictPropertyInitialization, sub: "items is never set", group: family, row: 2, role: security }
  - { id: unchecked, label: noUncheckedIndexedAccess, sub: "scores[\"lin\"] may be undefined", tone: stream, row: 1, role: security }
edges:
  - { id: off, from: snip, to: crash, label: strict off, style: dashed, flow: main }
  - { id: e-null, from: snip, to: nullc }
  - { id: e-any, from: snip, to: implicit }
  - { id: e-catch, from: snip, to: catchv }
  - { id: e-init, from: snip, to: propinit }
  - { id: e-index, from: snip, to: unchecked, style: dotted, flow: main }
steps:
  - caption: One file with five bugs. With the bare defaults it all type-checks; each flag catches one of them before the code runs.
  - caption: Without the flags, null and undefined fit into every type and untyped parameters silently become any. This file compiles, then throws the first time no user matches.
    trace: [off]
  - caption: "strictNullChecks: find() may return undefined, so u is User | undefined and u.name is an error until you check u. This is the flag that matters most."
    trace: [e-null]
  - caption: "noImplicitAny: total(items) gives items no type, so the checker would have to guess any. With the flag you write the type, or an any that reviewers can see."
    trace: [e-any]
  - caption: "useUnknownInCatchVariables: JavaScript can throw anything, so err is unknown. Reading err.message needs an instanceof Error check first."
    trace: [e-catch]
  - caption: "strictPropertyInitialization: Cart declares items but its constructor never sets it, so every new Cart would start with undefined there."
    trace: [e-init]
  - caption: "\"strict\": true turns on this whole family and more. New releases can add members, as useUnknownInCatchVariables did in 4.4 and strictBuiltinIteratorReturn in 5.6."
    focus: [family]
  - caption: "noUncheckedIndexedAccess is not in the family. Under strict alone scores[\"lin\"] is a number; with it, number | undefined, which is what the lookup really returns."
    trace: [e-index]
  - caption: In an existing codebase, turn the flags on one at a time, noImplicitAny first and then strictNullChecks, and fix each kind of error before the next.
note: "Each flag can still be turned off on its own, for example \"strictPropertyInitialization\": false while migrating."
```
