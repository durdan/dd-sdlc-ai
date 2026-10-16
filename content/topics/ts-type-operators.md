---
id: ts-type-operators
title: keyof, mapped and conditional types
summary: Computing types from other types, with restraint
why: "The built-in helpers like `Partial`, `Pick` and `ReturnType` are made of these pieces. Knowing them lets you read library types and derive yours from one source of truth, instead of copying them."
requires: [ts-generics]
lesson: none
points:
  - title: Read types off values and types
    text: "`typeof value` gives a value's type, `keyof T` the union of its keys, and `T[K]` the type at a key. Together they let one definition drive the others."
  - title: Mapped types transform every key
    text: "`{ [K in keyof T]: ... }` builds a new object type key by key. `Partial`, `Readonly`, `Pick` and `Record` are all mapped types."
  - title: Conditional types choose
    text: "`T extends U ? X : Y` picks a type by testing another, and `infer` pulls a piece out of it. `ReturnType` and `Awaited` work this way."
  - title: Use the built-ins first
    text: "Type-level code is hard to read and its errors are worse. Reach for the standard utility types, and write your own only when they save real duplication."
quiz:
  - q: "`const sizes = { s: 8, m: 12, l: 16 }`. What is `keyof typeof sizes`?"
    options: ["`string`", "`\"s\" | \"m\" | \"l\"`", "`number`"]
    answer: 1
    explain: "`typeof sizes` gets the object's type from the value, and `keyof` turns its keys into a union of string literals."
  - q: "What does `Partial<User>` produce?"
    options: [A runtime copy of User, "`User` with every property made optional", "`User` without its optional properties"]
    answer: 1
    explain: "`Partial` is a mapped type, `{ [K in keyof T]?: T[K] }`: the same keys, each marked optional. Like every type, it is gone at runtime."
  - q: What is `ElementOf<string[]>` with this definition?
    code: |
      type ElementOf<T> = T extends (infer E)[] ? E : never
    options: ["`string`", "`string[]`", "`never`"]
    answer: 0
    explain: "`string[]` matches the pattern `(infer E)[]`, so `E` is captured as `string`. For a non-array, the condition fails and the result is `never`."
links:
  - { title: "Creating types from types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html" }
  - { title: "Mapped types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html" }
  - { title: "Conditional types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html" }
  - { title: "Utility types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/utility-types.html" }
---
TypeScript has a small language for computing types from other types. `keyof`, `typeof` and indexed access read types off existing values and types; mapped types transform every key of an object type; conditional types choose between types and can extract parts of them. It all runs in the checker and disappears from the output. Used lightly, it removes duplication: one definition, with the rest derived from it. Used heavily, it produces types nobody on the team can read.

## Reading types off what exists

```ts
const sizes = { s: 8, m: 12, l: 16 } as const

type Size = keyof typeof sizes // "s" | "m" | "l"
type Px = (typeof sizes)[Size] // 8 | 12 | 16

function px(size: Size): number {
  return sizes[size]
}
px("m")
px("xl") // Error: Argument of type '"xl"' is not assignable to parameter of type '"s" | "m" | "l"'
```

The object is the single source of truth. Add a size and `Size` grows with it, with no separate list to keep in sync.

## Mapped types

A mapped type walks over a union of keys and builds a property for each:

```ts
type Flags<T> = { [K in keyof T]: boolean }

type User = { name: string; email: string; age: number }
type Touched = Flags<User> // { name: boolean; email: boolean; age: boolean }
```

Modifiers can be added or removed (`?`, `readonly`, `-?`), and keys can be renamed with `as`. Most of what you need is already built in:

| Utility | Gives you |
| --- | --- |
| `Partial<T>` / `Required<T>` | Every property optional / required |
| `Readonly<T>` | Every property `readonly` (checked only, not frozen at runtime) |
| `Pick<T, K>` / `Omit<T, K>` | Only the keys `K` / every key except `K` |
| `Record<K, V>` | An object with keys `K` and values `V` |
| `ReturnType<F>` / `Parameters<F>` | A function type's result / parameter tuple |
| `Awaited<T>` | What a promise resolves to |

## Conditional types and `infer`

```ts
type ElementOf<T> = T extends (infer E)[] ? E : never

type A = ElementOf<string[]> // string
type B = ElementOf<number> // never

async function loadUser() {
  return { id: "u1", name: "Ada" }
}
type LoadedUser = Awaited<ReturnType<typeof loadUser>> // { id: string; name: string }
```

`T extends U ? X : Y` asks whether `T` fits `U`. `infer E` names a part of the match so the result can use it. When `T` is a union, the condition is applied to each member separately (it distributes), which is how `Exclude<"a" | "b", "a">` gives `"b"`.

`Awaited<ReturnType<typeof loadUser>>` is the kind of derived type worth writing: the function stays the source of truth, and the type follows it.

## Restraint

Each layer of type-level code makes errors longer and the editor slower, and it can only be tested by the compiler. Before writing one, ask whether a plain type alias would do. Prefer the built-in utilities, give derived types names, and keep clever types in one shared file rather than spread through application code.
