---
id: ts-erasure
title: What the compiler checks, then erases
summary: Types are gone before the code runs
why: "Almost every TypeScript surprise (a crash in typed code, an `instanceof` that won't compile, a bundler that ignores your errors) comes from forgetting that the types never reach runtime."
lesson: none
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
