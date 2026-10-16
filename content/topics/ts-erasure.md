---
id: ts-erasure
title: What the compiler checks, then erases
summary: Types are gone before the code runs
why: "Almost every TypeScript surprise (a crash in typed code, an `instanceof` that won't compile, a bundler that ignores your errors) comes from forgetting that the types never reach runtime."
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Two separate jobs
    text: "The compiler checks your types and, separately, writes out JavaScript. A type error does not stop the JavaScript from being written unless you ask it to."
  - title: Types are erased
    text: "Annotations, interfaces, type aliases, generics and `as` casts are deleted. The output behaves exactly as if you had never written them."
  - title: A few things are not just types
    text: "Enums, namespaces and constructor parameter properties produce real JavaScript. The `erasableSyntaxOnly` flag forbids them, so that removing the types is all a tool has to do."
quiz_hint: Ask what is left of each line once every type annotation has been deleted.
quiz:
  - q: "`User` is an interface. Why does `if (value instanceof User)` fail to compile?"
    options:
      - "Interfaces can only be checked with `typeof`"
      - "An interface exists only for the checker; there is no `User` value at runtime to test against"
      - "`instanceof` needs `strict` mode"
    answer: 1
    explain: "`instanceof` is a JavaScript operator that needs a constructor function at runtime. The interface is erased, so there is nothing to compare with. Check the shape instead (`\"name\" in value`), or use a class, which does exist at runtime."
  - q: "`tsc` reports a type error in one file, with the default settings. What happens to that file's JavaScript?"
    options: [It is still written, It is skipped and the build stops, It is written with the error as a comment]
    answer: 0
    explain: "Checking and emitting are independent. `noEmitOnError` is off by default, so the JavaScript is written anyway. CI should fail on the error itself, for example by running `tsc --noEmit`."
  - q: Which of these produces JavaScript code of its own?
    options: ["`type Id = string`", "`enum Role { Admin, Reader }`", "`const id = input as string`"]
    answer: 1
    explain: "An enum becomes an object that exists at runtime, so it cannot simply be deleted. The type alias and the `as` cast disappear without a trace."
links:
  - { title: "The Basics: erased types (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html" }
  - { title: "TypeScript 5.8: erasableSyntaxOnly", url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html" }
  - { title: "Modules: TypeScript (Node.js docs)", url: "https://nodejs.org/api/typescript.html" }
---
TypeScript is JavaScript plus type annotations. The compiler reads the annotations, reports anything that doesn't fit together, and then deletes them. What runs in the browser or in Node is plain JavaScript that behaves as if the types had never been written. At runtime nothing knows what a `User` is, and nothing checks that a value is one.

## Check, then emit

`tsc` does two independent jobs: it type-checks the program, and it writes JavaScript. By default it writes the JavaScript even when there are type errors (`noEmitOnError` is off), because the errors are about your intent, not about whether the code can run. Many tools only do the second job (see the build topic), which is why the type check has to run somewhere on its own, in your editor and in CI.

## What the output looks like

```ts
interface User {
  id: number
  name: string
}

function greet(user: User): string {
  return `Hello, ${user.name}`
}

const ada = { id: 1, name: "Ada" } as User
console.log(greet(ada))
```

Compiled with `tsc --target es2022`, this becomes:

```js
"use strict";
function greet(user) {
    return `Hello, ${user.name}`;
}
const ada = { id: 1, name: "Ada" };
console.log(greet(ada));
```

The interface is gone, `user: User` is just `user`, and the `as User` cast has vanished. A cast never converts or checks anything: it only tells the checker to believe you.

Two consequences follow:

- **You cannot ask about a type at runtime.** `instanceof User` does not compile when `User` is an interface, and `typeof x === "User"` is never true. To branch on data at runtime you need something that exists at runtime: a `typeof` result, a property you test with `in`, a class, or a tag field (see discriminated unions).
- **Types cannot change behaviour.** Two programs that differ only in their types compile to the same JavaScript. If the program crashes, the types were wrong about the data, not the other way round.

## The exceptions

A few TypeScript features are not just types, so deleting them would break the program:

- `enum` becomes an object (with reverse mappings for numeric members).
- `namespace` with values becomes a function wrapper.
- Constructor parameter properties (`constructor(private name: string)`) become assignments.

TypeScript 5.8 added `erasableSyntaxOnly`, which reports these as errors. It exists because tools now run TypeScript by blanking out the types and nothing else. Node.js does this since 22.18 and 23.6: `node app.ts` replaces the type syntax with spaces and runs the result, without type-checking it, and it refuses an `enum` with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. A union of string literals (`type Role = "admin" | "reader"`) or a plain `as const` object usually does the job of an enum without generating code.

## Downlevelling is a separate question

`target` decides which JavaScript syntax the output may use. With an old target, `tsc` rewrites newer syntax (optional chaining, class fields) into older equivalents. That rewriting is about JavaScript versions, not types, and many projects leave it to a bundler instead.

```trace diagram
id: check-and-erase
title: One file, two separate jobs
subtitle: Checking reports errors; emitting deletes the types
elements:
  - { id: src, label: app.ts, sub: "interface User, greet(user: User)", row: 0 }
  - { id: enum, label: enum Role, sub: "a value, not just a type", kind: component, tone: stream, row: 0 }
  - { id: checker, label: Type checker, sub: reads the whole program, kind: system, row: 1 }
  - { id: emitter, label: Emitter, sub: deletes the type syntax, row: 1 }
  - { id: strip, label: node app.ts, sub: "Node 22.18+: types become spaces", row: 1 }
  - { id: errors, label: Type errors, sub: editor and CI, kind: external, row: 2 }
  - { id: js, label: app.js, sub: no types left, kind: store, tone: data, row: 2 }
  - { id: run, label: Runtime, sub: Node or the browser, kind: system, row: 3 }
edges:
  - { id: check, from: src, to: checker }
  - { id: report, from: checker, to: errors }
  - { id: emit, from: src, to: emitter }
  - { id: out, from: emitter, to: js }
  - { id: exec, from: js, to: run }
  - { id: enum-out, from: enum, to: emitter, label: real object, style: dashed }
  - { id: strip-in, from: src, to: strip }
  - { id: strip-run, from: strip, to: run }
  - { id: enum-refused, from: enum, to: strip, label: refused, style: dotted }
steps:
  - caption: A TypeScript file goes down two separate paths. One checks the types, the other produces the JavaScript that actually runs.
  - caption: The type checker reads the whole program and compares every value with the type it was given. Its only output is a list of errors, shown in your editor and in CI.
    focus: [src, checker, errors]
    trace: [check, report]
  - caption: Separately, the emitter writes JavaScript. It deletes interfaces, annotations, generics and as casts, and leaves the rest of the code as it was.
    focus: [src, emitter, js]
    trace: [emit, out]
  - caption: "The two jobs don't wait for each other. noEmitOnError is off by default, so tsc writes app.js even when the checker reported errors."
    focus: [checker, emitter]
  - caption: Node or the browser runs app.js. Nothing in it knows what a User is, so nothing checks that a value is one.
    focus: [js, run]
    trace: [exec]
  - caption: "That is why instanceof User doesn't compile when User is an interface, and why a cast never converts anything: no User is left to test against."
    focus: [js]
  - caption: An enum is the exception. It is a value, so the emitter has to write a real object for it. Namespaces with values and constructor parameter properties are the same.
    focus: [enum, emitter]
    trace: [enum-out]
  - caption: Since 22.18, node app.ts runs TypeScript directly. It replaces the type syntax with spaces and runs the result, without checking a single type.
    focus: [src, strip, run]
    trace: [strip-in, strip-run]
  - caption: Blanking out types is all it does, so it refuses an enum. The erasableSyntaxOnly flag makes the checker report such code before it gets that far.
    focus: [enum, strip]
    trace: [enum-refused]
note: Downlevelling newer syntax for an old target is a third, separate job, about JavaScript versions rather than types.
```
