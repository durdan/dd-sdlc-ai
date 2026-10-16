---
id: ts-type-operators
title: keyof, mapped and conditional types
summary: Computing types from other types, with restraint
why: "The built-in helpers like `Partial`, `Pick` and `ReturnType` are made of these pieces. Knowing them lets you read library types and derive yours from one source of truth, instead of copying them."
requires: [ts-generics]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: computed-types
title: Types computed from types
subtitle: Each arrow is work the checker does; none of it reaches the output
elements:
  - { id: sizes, label: const sizes, sub: "{ s: 8, m: 12, l: 16 } as const", kind: external, row: 0 }
  - { id: tsizes, label: typeof sizes, sub: "{ readonly s: 8; m: 12; l: 16 }", row: 1 }
  - { id: size, label: keyof typeof sizes, sub: "\"s\" | \"m\" | \"l\"", kind: store, tone: data, row: 2 }
  - { id: px, label: "(typeof sizes)[Size]", sub: "8 | 12 | 16", kind: store, tone: data, row: 2 }
  - { id: user, label: type User, sub: "name, email: string; age: number", kind: external, row: 0 }
  - { id: flags, label: Flags<User>, sub: "{ [K in keyof T]: boolean }", row: 1 }
  - { id: touched, label: "{ name, email, age: boolean }", kind: store, tone: data, row: 2 }
  - { id: elem, label: "ElementOf<string[]>", sub: "T extends (infer E)[] ? E : never", row: 1 }
  - { id: estr, label: string, sub: E captured, kind: store, tone: data, row: 2 }
  - { id: load, label: async loadUser(), sub: "returns { id, name }", kind: external, row: 0 }
  - { id: ret, label: ReturnType<typeof loadUser>, sub: "Promise<{ id; name }>", row: 1 }
  - { id: awaited, label: Awaited<...>, sub: "{ id: string; name: string }", kind: store, tone: data, row: 2 }
edges:
  - { id: read, from: sizes, to: tsizes }
  - { id: keys, from: tsizes, to: size }
  - { id: index, from: tsizes, to: px }
  - { id: map, from: user, to: flags }
  - { id: mapped, from: flags, to: touched }
  - { id: match, from: elem, to: estr }
  - { id: rt, from: load, to: ret }
  - { id: unwrap, from: ret, to: awaited }
steps:
  - caption: TypeScript can compute types from other types. All of it runs in the checker and disappears from the output; the point is one source of truth, with the rest derived from it.
  - caption: In a type position, typeof reads the type off a value. as const keeps the literal numbers and makes every key readonly.
    trace: [read]
  - caption: "keyof turns that object type's keys into a union of string literals, \"s\" | \"m\" | \"l\". Call it Size: add a size to the object and Size grows with it."
    trace: [keys]
  - caption: An indexed access type reads the type at a key. Indexing with the whole Size union gives the union of all the values, 8 | 12 | 16.
    trace: [index]
  - caption: A mapped type walks over a union of keys and builds one property for each. Flags<User> maps every key of User to boolean.
    trace: [map, mapped]
  - caption: Partial, Readonly, Pick and Record are mapped types built the same way. Readonly is only checked, nothing is frozen at runtime.
    focus: [flags, touched]
  - caption: "A conditional type asks whether T fits a pattern. string[] matches (infer E)[], so E is captured as string. For a non-array the answer would be never."
    trace: [match]
  - caption: ReturnType is a conditional type with infer, applied to a function's type. For an async function, that is a promise of the object it returns.
    trace: [rt]
  - caption: Awaited unwraps the promise. The function stays the source of truth, and the type follows it whenever the function changes.
    trace: [unwrap]
  - caption: Each layer makes errors longer and the editor slower. Use the built-in utilities first, and write your own only when they save real duplication.
```
