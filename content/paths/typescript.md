---
id: typescript
title: "TypeScript: what the types really do"
promise: "What the checker actually knows, and what it can't: erased types, structural matching, inference and narrowing, unions and generics, strictness, the build, and the runtime data no type can check."
kind: skill
level: intermediate
tags: [web, languages]
stages:
  - title: The compiler
    blurb: Checks, then erases
    topics: [ts-erasure, ts-structural, ts-inference]
  - title: Modelling data
    blurb: Unions, the edge types, generics
    topics: [ts-unions, ts-any-unknown-never, ts-generics]
  - title: Types from types
    blurb: keyof, mapped, conditional
    topics: [ts-type-operators]
  - title: In a real project
    blurb: Strictness, declarations, the build, boundaries
    topics: [ts-strict, ts-declarations, ts-build, ts-runtime-validation]
bridges:
  - id: contract-testing
    why: "Types stop at the network. A shared TypeScript type between two services is a hope; a contract test is how the provider proves it still sends that shape."
  - id: anti-corruption-layer
    why: "Validate and translate outside data at one edge, so the rest of the code works with your own types: the same idea as parsing JSON at the boundary, for a whole system."
next: [react, node]
---
Everything here is about TypeScript 5.x with `strict` on. The examples have been type-checked with TypeScript 5.9; the `js run` examples are what the code does after its types are erased. The declarations and build topics build on the JavaScript path's topic on modules.
