---
id: ts-unions
title: Unions, discriminated unions and exhaustiveness
summary: One of several shapes, told apart by a tag
why: "Modelling states as a union with a tag field turns \"loading but also has an error\" bugs into compile errors, and makes the checker tell you every place to update when a new case is added."
requires: [ts-inference]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: A union is one of these
    text: "`A | B` accepts either. Until you narrow it, you can only use what all members have in common."
  - title: A tag tells them apart
    text: "Give each member a literal field, such as `kind` or `status`. Checking it narrows the whole object, and the tag is real data, so the check works at runtime."
  - title: Exhaustiveness with never
    text: "After every case has been handled, the value's type is `never`. Assigning it to a `never` variable fails to compile the day someone adds a case you don't handle."
quiz:
  - q: "`r` is `{ status: \"ok\"; data: string } | { status: \"error\"; message: string }`. Where can you read `r.data`?"
    options: [Anywhere, "Only after checking `r.status === \"ok\"`", "Only after checking `\"data\" in r` or `r.status === \"ok\"`"]
    answer: 2
    explain: "Both checks narrow `r` to the `ok` member. The tag check is the usual one, because it is what the union was designed around; before either check, `data` is not on every member, so it can't be read."
  - q: "A new member `{ status: \"retrying\" }` is added to the union. What makes the compiler point at every `switch` that doesn't handle it?"
    options: ["A `default: return null` branch", "`const unreachable: never = r` in the `default` branch", "Nothing; switches are not checked"]
    answer: 1
    explain: "In the `default` branch `r` is narrowed to whatever is left. With every case handled that is `never`; with the new case unhandled it is the new member, which is not assignable to `never`, so the line fails."
  - q: "Why is `{ loading: boolean; data?: User; error?: string }` a weaker model than a union?"
    options:
      - It uses more memory
      - "It allows combinations that make no sense, such as loading with an error and data at the same time"
      - Optional properties are not allowed in strict mode
    answer: 1
    explain: "Three independent fields allow eight combinations, most of them invalid. A union of `idle`, `loading`, `success` with data and `failure` with an error allows exactly the states that exist."
links:
  - { title: "Narrowing: discriminated unions and exhaustiveness (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html" }
  - { title: "Everyday types: union types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html" }
---
A union type `A | B` says a value is one of several things. The checker only lets you use what every member has in common until your code proves which one it is. When each member carries a literal tag (`kind: "circle"`, `status: "error"`), a single comparison narrows the whole object. That pattern, a discriminated union, is the most useful thing in TypeScript for modelling data that comes in different states.

## Make the impossible states unwritable

A request is often modelled with independent flags:

```ts
type User = { name: string }

type Loose = { loading: boolean; data?: User; error?: string }
```

Nothing stops `{ loading: true, error: "timeout", data: someUser }`, and every reader has to guess which field wins. A union lists the states that really exist:

```ts
type User = { name: string }

type Request =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "failure"; error: string }

function label(r: Request): string {
  switch (r.status) {
    case "idle":
      return "Not started"
    case "loading":
      return "Loading..."
    case "success":
      return `Hello, ${r.data.name}` // r is the success member here
    case "failure":
      return `Failed: ${r.error}`
  }
}
```

In each `case`, `r` is narrowed to the member with that `status`, so `r.data` exists only where it can. There is no way to build a `success` without `data`, or a `failure` with it.

## Why the tag works

Types are erased, so the checker can only narrow on things that survive to runtime. The tag is ordinary data in the object, and the `switch` is ordinary JavaScript. Here is the same function after compilation, running:

```js run
function label(r) {
  switch (r.status) {
    case "idle": return "Not started"
    case "loading": return "Loading..."
    case "success": return `Hello, ${r.data.name}`
    case "failure": return `Failed: ${r.error}`
  }
}
console.log(label({ status: "success", data: { name: "Ada" } }))
console.log(label({ status: "failure", error: "timeout" }))
console.log(label({ status: "retrying" }))
```

The last call prints `undefined`: at runtime nothing stops a value that the type does not allow, and the `switch` simply falls off the end. The compiler can protect you from that, but only inside the code it checks.

## Exhaustiveness checking

Add a `default` branch that assigns the value to `never`:

```ts
type Request =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "retrying"; attempt: number }

function label(r: Request): string {
  switch (r.status) {
    case "idle":
      return "Not started"
    case "loading":
      return "Loading..."
    default: {
      const unreachable: never = r // Error: Type '{ status: "retrying"; attempt: number; }' is not assignable to type 'never'
      return unreachable
    }
  }
}
```

With every member handled, the type left in `default` is `never` (no possible value), and the assignment compiles. When someone adds `retrying`, every `switch` that forgot it fails to compile at exactly that line. With `strict` on, the checker also complains when a function with a `string` return type can fall off the end of an incomplete `switch`, but the `never` line names the missing case and works in code that doesn't return.

Prefer literal tags (`"success"`) over booleans for anything with more than two states, and keep the tag name the same across the union so one `switch` covers it.

```trace diagram
id: switch-on-tag
title: A switch on the tag
subtitle: "type Request = idle | loading | success | failure"
elements:
  - { id: req, label: "r: Request", sub: "four members, tag: status", kind: system, row: 0 }
  - { id: retry, label: "{ status: \"retrying\" }", sub: a member added later, tone: stream, row: 0, role: service }
  - { id: sw, label: switch (r.status), kind: component, row: 1 }
  - { id: idle, label: "\"idle\"", sub: no other fields, row: 2 }
  - { id: loading, label: "\"loading\"", sub: no other fields, row: 2 }
  - { id: success, label: "\"success\"", sub: "r.data: User", row: 2, role: service }
  - { id: failure, label: "\"failure\"", sub: "r.error: string", row: 2 }
  - { id: def, label: default, sub: "const unreachable: never = r", tone: neutral, row: 2 }
  - { id: err, label: Compile error, sub: not assignable to never, kind: external, row: 3, role: security }
edges:
  - { id: tag, from: req, to: sw }
  - { id: to-idle, from: sw, to: idle }
  - { id: to-loading, from: sw, to: loading }
  - { id: to-success, from: sw, to: success }
  - { id: to-failure, from: sw, to: failure }
  - { id: to-default, from: sw, to: def }
  - { id: new-member, from: retry, to: sw, style: dashed, flow: main }
  - { id: not-never, from: def, to: err, style: dashed, flow: security }
steps:
  - caption: A Request is one of four shapes, each with a literal status tag. Before any check, only status, which every member has, can be read.
    focus: [req]
  - caption: switch (r.status) compares the tag. The tag is ordinary data and the switch is ordinary JavaScript, so the check really happens at runtime.
    trace: [tag]
  - caption: "In case \"success\", r is narrowed to the success member, so r.data exists. It exists nowhere else."
    trace: [to-success]
  - caption: "In case \"failure\", r is the failure member, with its error string. There is no way to build a failure that also has data."
    trace: [to-failure]
  - caption: Idle and loading carry no other fields. Each case returns its own label.
    trace: [to-idle, to-loading]
  - caption: "After every member has been handled, the type left in default is never: no possible value. So const unreachable: never = r compiles."
    trace: [to-default]
  - caption: "Then someone adds { status: \"retrying\" }. No case handles it, so in default r is now that new member instead of never."
    trace: [new-member, to-default]
  - caption: Assigning it to never fails to compile, at exactly that line, in every switch that forgot the new case.
    trace: [not-never]
  - caption: The compiler only protects the code it checks. A retrying value arriving from a server makes an unprotected switch fall off the end and return undefined, with no error.
    focus: [retry, sw]
```
