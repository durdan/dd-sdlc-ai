---
id: ts-build
title: Modules, tsconfig and the build
summary: "Who strips the types, and who checks them"
why: "In most projects the tool that turns TypeScript into JavaScript never checks a single type. If nothing else runs the checker, type errors ship."
requires: [ts-erasure, modules]
lesson: none
points:
  - title: Two jobs, often two tools
    text: "Bundlers and runners (Vite, esbuild, swc, Babel, Node's own type stripping) remove types file by file and never check them. `tsc --noEmit` does the checking."
  - title: isolatedModules keeps them compatible
    text: "A tool that sees one file at a time can't compile code whose output depends on other files. `isolatedModules` or `verbatimModuleSyntax` reports that code."
  - title: Describe the real host
    text: "`module` and `moduleResolution` tell the checker how imports will be resolved: `nodenext` for code Node runs directly, `bundler` for code a bundler resolves."
quiz:
  - q: "A Vite project shows a type error in the editor, but `npm run build` succeeds. Why?"
    options:
      - Vite fixes type errors
      - "Vite transpiles with esbuild, which strips types without checking them; nothing in the build ran the checker"
      - The editor uses a different TypeScript syntax
    answer: 1
    explain: "Transpile-only tools are fast because they skip type checking. Add `tsc --noEmit` (or `vue-tsc`, etc.) to the build or to CI so errors fail it."
  - q: "What does `verbatimModuleSyntax` ask of you?"
    options:
      - "Use `require` everywhere"
      - "Mark type-only imports with `import type`, so a tool can drop them without knowing what they refer to"
      - "Write file extensions in every import"
    answer: 1
    explain: "With it, imports and exports without the `type` modifier are kept in the output exactly as written. A per-file transpiler then never has to guess whether an imported name was only a type."
  - q: "In a project with `\"module\": \"nodenext\"` and `\"type\": \"module\"`, how do you import `./util.ts` from another TypeScript file?"
    options: ["`import { f } from \"./util\"`", "`import { f } from \"./util.js\"`", "Either works"]
    answer: 1
    explain: "Node's ES module loader needs the full file name, and the import must name the file that will exist at runtime: the emitted `util.js`. TypeScript maps it back to `util.ts` for checking."
links:
  - { title: "Choosing compiler options for modules (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html" }
  - { title: "Modules: theory (TypeScript handbook)", url: "https://www.typescriptlang.org/docs/handbook/modules/theory.html" }
  - { title: "isolatedModules (TSConfig reference)", url: "https://www.typescriptlang.org/tsconfig/#isolatedModules" }
  - { title: "Modules: TypeScript (Node.js docs)", url: "https://nodejs.org/api/typescript.html" }
---
Turning a TypeScript project into running JavaScript involves two jobs that used to be done by one program and now usually aren't. Removing the types is easy and can be done one file at a time, very fast. Checking the types needs the whole program at once and is slow. Most build tools do only the first job. Unless your editor and your CI also run the checker, type errors only exist as red squiggles.

## Who does what

| Tool | Strips types | Checks types |
| --- | --- | --- |
| `tsc` | Yes (unless `noEmit`) | Yes |
| esbuild, swc, Babel | Yes, per file | No |
| Vite, and most framework dev servers | Yes, through esbuild or swc | No |
| `node file.ts` (22.18+, 23.6+) | Yes, replaces types with spaces | No |
| Your editor | No | Yes, through the TypeScript language service |

A common setup lets the bundler produce the JavaScript and runs `tsc --noEmit` as a separate step in CI (and often in a pre-push hook). The bundler stays fast, and the build still fails on type errors.

## Writing code a per-file tool can compile

A tool that sees one file at a time can't know whether an imported name is a type or a value, or what value a `const enum` from another file has. Two settings report code it would get wrong:

- `isolatedModules` errors on constructs that need information from other files, such as re-exporting a type without `export type`.
- `verbatimModuleSyntax` (TypeScript 5.0) goes further: imports and exports are kept exactly as written unless marked `type`, so you write what you mean.

```ts
import type { User } from "./types.js" // removed entirely from the output
import { formatName } from "./format.js" // kept: it's a value
```

`erasableSyntaxOnly` (5.8) adds the last piece for type-stripping tools: no `enum`, no `namespace` with values, no parameter properties, so removing types is all that is left to do.

## `module`, `moduleResolution` and imports

These options don't change your code much; they tell the checker how the real host will find files, so that it accepts the imports that will work and rejects the ones that won't.

- **`"module": "nodenext"`**, for code that Node runs directly. It follows Node's rules: a `.js` file is ESM or CommonJS according to `package.json` `"type"`, and relative ES module imports need a file extension. You write the extension of the file that will exist at runtime (`./util.js`), and TypeScript maps it back to `util.ts`.
- **`"moduleResolution": "bundler"`** (with `"module": "esnext"`), for code that a bundler resolves. Extensionless imports and `index` files are fine, because the bundler allows them.

Other settings that commonly matter:

- `target` sets which JavaScript syntax the output may use; `lib` sets which built-in APIs the checker assumes exist (`DOM` for browsers). They are separate: a modern `target` does not add a polyfill for an API the browser lacks.
- `outDir` and `rootDir` decide where emitted files go; `declaration` emits `.d.ts` files for libraries.
- `noEmit` is for projects where another tool produces the JavaScript.

One `tsconfig.json` describes one environment. A repository with browser code, server code and tests usually needs several, connected with `extends` or project references, so that `window` isn't available in server code and `process` isn't assumed in the browser.
