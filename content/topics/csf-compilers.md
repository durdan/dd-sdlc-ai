---
id: csf-compilers
title: Compilers, interpreters and JITs
summary: Translate ahead of time, translate as you go, or watch and then translate
why: "Start-up time, peak speed, portability and what an error message can tell you all follow from how a language gets from source text to machine instructions."
requires: [csf-cpu]
lesson: none
points:
  - title: The front end is shared
    text: "Every implementation first lexes source into tokens, parses them into a syntax tree and checks it. The differences come after."
  - title: Compilers translate ahead of time
    text: "C, C++, Rust and Go produce machine code before the program runs: fast start, full optimisation time, one binary per platform."
  - title: Interpreters execute directly
    text: "CPython walks bytecode in a loop, one instruction at a time: instant start and easy portability, but each operation costs many machine instructions."
  - title: JITs compile what is hot
    text: "V8, the JVM and .NET start quickly with an interpreter or a quick compiler, profile the running program, and optimise the hot code using what they observed."
quiz:
  - q: "Why can a JIT sometimes produce faster code than an ahead-of-time compiler for the same source?"
    options:
      - "JITs skip type checks"
      - "It optimises using the actual run-time behaviour, such as which types really appear at a call site, and can undo assumptions that stop holding"
      - "JIT-compiled code doesn't need the CPU"
    answer: 1
    explain: "Profile-guided speculation (inline the one class seen so far, drop branches never taken) is the JIT's advantage. Ahead-of-time compilers can get some of this with profile-guided optimisation from a training run."
  - q: "Python compiles .py files to .pyc. Does that make CPython a compiler to machine code?"
    options:
      - "Yes, .pyc files contain machine code"
      - "No: .pyc holds bytecode for CPython's virtual machine, which an interpreter loop executes"
      - "Only on Linux"
    answer: 1
    explain: "Many 'interpreted' languages compile to bytecode first. Since 3.13, CPython also has an experimental JIT, off by default."
  - q: What is the main cost of a JIT compared with ahead-of-time compilation?
    options:
      - "Programs can't use libraries"
      - "Warm-up: the program runs slowly at first and spends CPU and memory compiling while it runs"
      - "JIT code can't be debugged"
    answer: 1
    explain: "That is why serverless functions and command-line tools often prefer ahead-of-time options such as GraalVM native-image or .NET Native AOT."
links:
  - { title: "Robert Nystrom: Crafting Interpreters (free online book)", url: "https://craftinginterpreters.com/" }
  - { title: "V8 blog: Sparkplug, a non-optimizing JavaScript compiler", url: "https://v8.dev/blog/sparkplug" }
  - { title: "Python 3.13 release notes: experimental JIT compiler", url: "https://docs.python.org/3/whatsnew/3.13.html" }
---
A CPU executes only its own machine instructions, so every program written in a higher-level language has to be translated. The choice is when: all at once before the program runs (a compiler), a little at a time while it runs (an interpreter), or a mix that starts by interpreting and then compiles the parts that turn out to matter (a just-in-time compiler). Most real languages use a combination, and the label "compiled language" describes an implementation, not the language.

## The common front end

Whatever happens later, an implementation starts the same way:

1. **Lexing** turns characters into tokens: `let x = a + 1;` becomes `let`, identifier `x`, `=`, identifier `a`, `+`, number `1`, `;`.
2. **Parsing** builds a tree from the tokens according to the grammar, so that `a + 1 * 2` groups as `a + (1 * 2)`.
3. **Analysis** resolves names, checks types (in typed languages) and reports errors with line numbers.

Then comes the back end: either generate code for a real CPU, or generate code for a virtual machine.

## Ahead-of-time compilers

C, C++, Rust, Go and Swift compile to native machine code before the program ships. The compiler (typically through an intermediate representation, as in LLVM) can spend seconds or minutes optimising: inlining, unrolling loops, vectorising, allocating registers. The program starts instantly at full speed and needs no runtime translator. The costs are slow builds, one binary per CPU and operating system, and optimisations limited to what can be proven from the source, without knowing what the real inputs will be.

## Interpreters

An interpreter executes the program without producing machine code for it. Simple ones walk the syntax tree; most real ones first compile to **bytecode**, a compact instruction set for a virtual machine, and then run a loop that fetches, decodes and executes one bytecode at a time. CPython works this way (the `.pyc` files are cached bytecode). Interpreters start immediately and run anywhere the interpreter runs, but every bytecode costs dozens of machine instructions of dispatch overhead, which is why pure-Python loops are much slower than the same loop in C.

## Just-in-time compilers

A JIT combines the two. V8 (Chrome, Node.js) starts JavaScript in the Ignition bytecode interpreter, compiles warm functions quickly with Sparkplug and Maglev, and sends the hottest to TurboFan, its optimising compiler. HotSpot (Java) and RyuJIT (.NET) follow the same tiered idea, as the Java and .NET paths explain.

The advantage of waiting is information. While the program runs, the JIT records which types actually appear and which branches are taken, then compiles code specialised for that behaviour, guarded by cheap checks. If an assumption breaks (a function that has only ever seen integers receives a string), the runtime **deoptimises** back to the interpreter and may compile again later. The disadvantages are warm-up time, memory for the compiler and its profiles, and less predictable performance.

## Choosing in practice

- Start-up time matters most (command-line tools, serverless functions): prefer ahead-of-time output, such as Go or Rust binaries, GraalVM native-image for Java, or .NET Native AOT.
- Long-running services: a JIT's warm-up is paid once and its profile-driven optimisations keep paying.
- Benchmarks of JIT-compiled code must warm up first, or they measure the interpreter.

WebAssembly shows that the line is blurry: it is a portable bytecode that browsers compile to machine code, sometimes ahead of time and sometimes in tiers, just like a JIT.
