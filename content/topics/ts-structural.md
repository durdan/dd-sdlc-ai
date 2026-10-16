---
id: ts-structural
title: Structural typing
summary: Shapes match, names don't
why: "It is why a plain object can stand in for a class, why two unrelated types can be mixed up by accident, and why extra properties are sometimes an error and sometimes not."
requires: [ts-erasure]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Compatibility is about shape
    text: "A value fits a type if it has at least the required members, with compatible types. Where the type was declared, and what it is called, does not matter."
  - title: Fresh object literals are stricter
    text: "An object literal written directly where a type is expected may not have unknown properties: that is almost always a typo. The same object passed through a variable is fine."
  - title: Brands make names matter
    text: "When two types share a shape but must not be mixed, such as user ids and order ids, add a phantom brand property that no plain value has."
quiz:
  - q: "`type Point = { x: number; y: number }`. Does `const p3 = { x: 1, y: 2, z: 3 }; const p: Point = p3` compile?"
    options: ["No, `z` is not part of `Point`", "Yes, `p3` has every member `Point` needs", "Only if `Point` is an interface"]
    answer: 1
    explain: "Extra members are allowed when assigning an existing value: it has the shape `Point` asks for. Interfaces and type aliases behave the same here."
  - q: "And `const p: Point = { x: 1, y: 2, z: 3 }`?"
    options: [It compiles, "Error: object literal may only specify known properties", "It compiles but `z` is removed at runtime"]
    answer: 1
    explain: "A fresh object literal gets an excess property check, because an unknown property written right there is probably a mistake (a typo, or the wrong type). Nothing is removed at runtime in any case."
  - q: "`type UserId = string` and `type OrderId = string`. Can you pass an `OrderId` where a `UserId` is expected?"
    options: ["No, the names differ", "Yes, both are just `string`", "Only with `strict` off"]
    answer: 1
    explain: "A type alias is a new name, not a new type. To keep them apart, brand them: `type UserId = string & { readonly __brand: \"UserId\" }`."
links:
  - { title: "Type compatibility (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/type-compatibility.html" }
  - { title: "Object types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html" }
---
TypeScript decides whether a value fits a type by looking at its shape: the members it has and their types. It does not care what the value's type was called or where it was declared. This matches how JavaScript code actually uses objects (if it has a `name`, you can read the `name`), but it also means that types which happen to share a shape are interchangeable, whether you meant them to be or not.

## Shape, not name

```ts
interface Named {
  name: string
}

class Person {
  name: string
  age: number
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

const fromClass: Named = new Person("Ada", 36) // fine: it has a name
const fromLiteral: Person = { name: "Lin", age: 30 } // fine: same shape as Person
```

`Person` never mentions `Named`, and the object literal was never created with `new Person`, yet both assignments compile. There is no `implements` needed, because types are erased and the checker can only compare structure. One consequence: `fromLiteral instanceof Person` is `false` at runtime, even though the checker accepted it as a `Person`. Classes become nominal only when they have `private` or `#private` members, which a plain object cannot copy.

## The excess property check

```ts
type Point = { x: number; y: number }

const p3 = { x: 1, y: 2, z: 3 }
const ok: Point = p3 // fine: extra members are allowed

const typo: Point = { x: 1, y: 2, zz: 3 } // Error: Object literal may only specify known properties
```

Structurally both are the same assignment. The difference is freshness: an object literal written directly where a `Point` is expected cannot be used for anything else, so an unknown property in it is almost certainly a mistake. Once the object is in a variable, it may be used elsewhere with its extra members, so the check does not apply. This is a targeted lint, not a guarantee that values have no extra properties.

## When the shape is not enough

Ids are the classic case. A user id and an order id are both strings, and a function that takes `(userId: string, orderId: string)` will happily accept them in the wrong order. A brand adds a property that exists only in the type:

```ts
type UserId = string & { readonly __brand: "UserId" }
type OrderId = string & { readonly __brand: "OrderId" }

const asUserId = (raw: string) => raw as UserId

function loadOrder(user: UserId, order: OrderId) {
  return `${user}/${order}`
}

const u = asUserId("u_1")
const o = "o_9" as OrderId
loadOrder(o, u) // Error: OrderId is not assignable to UserId
```

At runtime they are still plain strings. The brand only exists for the checker, so create branded values in one place (the function that parses or validates them) and let the types carry the guarantee from there.

## Functions are compared structurally too

A function that takes fewer parameters can be passed where one taking more is expected, which is why `[1, 2].forEach((n) => ...)` works even though `forEach` passes three arguments. Under `strictFunctionTypes`, parameter types are checked so that a callback cannot demand a narrower argument than it will be given.

```trace diagram
id: shape-check
title: Is it a Point?
subtitle: "type Point = { x: number; y: number }"
elements:
  - { id: vec, label: "new Vec(1, 2)", sub: "class Vec { x; y; length() }", row: 0 }
  - { id: p3, label: variable p3, sub: "{ x: 1, y: 2, z: 3 }", row: 0 }
  - { id: half, label: "{ x: 1 }", sub: y is missing, row: 0 }
  - { id: fresh, label: fresh literal, sub: "{ x: 1, y: 2, zz: 3 }", row: 0 }
  - { id: orderid, label: an OrderId, sub: "string & { __brand: \"OrderId\" }", row: 0 }
  - { id: point, label: Point, sub: "needs x and y, both numbers", kind: system, row: 1 }
  - { id: excess, label: Excess property check, sub: fresh object literals only, kind: component, tone: stream, row: 1 }
  - { id: userid, label: "loadOrder(user: UserId)", sub: "wants the UserId brand", row: 1 }
  - { id: ok, label: Assignable, kind: store, tone: data, row: 2 }
  - { id: bad, label: Compile error, kind: external, row: 2 }
edges:
  - { id: vec-in, from: vec, to: point }
  - { id: p3-in, from: p3, to: point }
  - { id: half-in, from: half, to: point }
  - { id: fits, from: point, to: ok }
  - { id: fails, from: point, to: bad }
  - { id: fresh-in, from: fresh, to: excess }
  - { id: excess-fail, from: excess, to: bad }
  - { id: order-in, from: orderid, to: userid }
  - { id: brand-fail, from: userid, to: bad }
steps:
  - caption: "Assigning a value to Point asks one question: does it have every member Point needs, with compatible types? What it is called, and where it was declared, don't come into it."
    focus: [point]
  - caption: An instance of an unrelated class Vec has a numeric x and y, so it is a Point. No implements clause is needed, and the extra length method doesn't matter.
    trace: [vec-in, fits]
  - caption: A variable holding x, y and z is accepted too. Extra members are fine on a value that already exists, because other code may use them.
    trace: [p3-in, fits]
  - caption: "{ x: 1 } has no y, so it is rejected. A missing member is the one thing shape matching won't forgive."
    trace: [half-in, fails]
  - caption: A fresh object literal, written right where a Point is expected, gets one more check. Nothing else can ever read zz, so it is almost certainly a typo, and it is reported.
    trace: [fresh-in, excess-fail]
  - caption: This is a targeted lint, not a guarantee. Put the same literal in a variable first and zz passes, because the check only looks at freshness.
    focus: [excess, p3]
  - caption: "Accepted as a type is not the same as being an instance. An object literal typed as Vec passes the checker, but instanceof Vec is false at runtime: the types are erased."
    focus: [vec, point]
  - caption: Shape matching lets look-alikes mix. A user id and an order id are both strings, so a phantom brand gives each a property no plain string has, and an OrderId no longer fits a UserId.
    trace: [order-in, brand-fail]
  - caption: Classes with private or #private members are the other exception. A plain object can't copy those members, so only real instances fit.
    focus: [vec]
```
