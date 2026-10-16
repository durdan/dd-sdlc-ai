---
id: py-bytecode
title: Source, bytecode and the eval loop
summary: Python compiles first, then a C loop runs the result
why: Knowing that CPython compiles to bytecode and then interprets it explains .pyc files, why tight Python loops are slow, and why 3.11+ got faster without you changing a line.
requires: []
lesson: none
points:
  - title: Compile, then run
    text: CPython parses your file into a tree, compiles it into a code object full of bytecode, and only then starts executing.
  - title: A stack machine
    text: Each bytecode instruction pushes or pops values on a small per-call stack; the eval loop in C runs them one after another.
  - title: Cached per module
    text: Imported modules have their bytecode saved under __pycache__ so the next import can skip compiling. The script you run directly is not cached.
  - title: It adapts as it runs
    text: Since 3.11 the interpreter rewrites hot instructions into specialised versions, such as an add that only handles two ints.
quiz_hint: Separate the two jobs, compiling and executing, and ask which one each fact belongs to.
quiz:
  - q: You run `python app.py`, which imports `utils.py`. Which file gets a cached .pyc in __pycache__?
    options: [Only app.py, Only utils.py, Both of them, Neither; Python never writes bytecode to disk]
    answer: 1
    explain: Bytecode is cached for imported modules. The top-level script is compiled fresh every run, which is one reason to keep it small and put the real code in modules.
  - q: What does `dis.dis(f, adaptive=True)` show that plain `dis.dis(f)` does not?
    options:
      - The machine code the JIT produced
      - The specialised instructions the interpreter swapped in after watching the function run
      - The original source code
    answer: 1
    explain: After a function has run a few times, instructions like BINARY_OP can be replaced by specialised forms such as BINARY_OP_ADD_INT. adaptive=True shows those; it is still bytecode, not machine code.
  - q: Why is a Python loop over a million numbers usually slower than calling the built-in sum() on them?
    options:
      - sum() runs on another thread
      - The loop executes several bytecode instructions per item in the eval loop, while sum() loops in C
      - Python loops are compiled lazily
    answer: 1
    explain: Every iteration of a Python loop dispatches several instructions (fetch the next item, load, add, store). sum() does the same work in one C function with no per-item dispatch.
links:
  - { title: "dis: disassembler for Python bytecode (Python docs)", url: "https://docs.python.org/3/library/dis.html" }
  - { title: "PEP 659: Specializing Adaptive Interpreter", url: "https://peps.python.org/pep-0659/" }
  - { title: "The import system: cached bytecode invalidation (Python docs)", url: "https://docs.python.org/3/reference/import.html#cached-bytecode-invalidation" }
  - { title: "PEP 3147: PYC repository directories", url: "https://peps.python.org/pep-3147/" }
---
Python is often called an interpreted language, but CPython (the interpreter you get from python.org) never runs your source text directly. It first compiles each module into bytecode, a compact list of instructions for a virtual machine, and then a loop written in C executes those instructions one at a time. Most of what makes Python feel fast or slow comes from that second step.

## From text to a code object

When CPython loads a file it tokenises the text, parses it into an abstract syntax tree, and compiles the tree into **code objects**: one for the module and one for every function and class body inside it. A code object holds the bytecode plus the tables it needs, such as constants and local variable names. You can look at both:

```python
import dis

def add(a, b):
    return a + b

dis.dis(add)
print(add.__code__.co_varnames)   # ('a', 'b')
```

On Python 3.12 the disassembly is:

```text
  3           0 RESUME                   0

  4           2 LOAD_FAST                0 (a)
              4 LOAD_FAST                1 (b)
              6 BINARY_OP                0 (+)
             10 RETURN_VALUE
```

Read it as a stack machine: push `a`, push `b`, pop both and push their sum, return the top of the stack. The exact instructions change between versions. Python 3.13 fuses the two loads into a single `LOAD_FAST_LOAD_FAST` and stops printing offsets by default, so never treat bytecode as a stable interface.

## The eval loop

Executing a function means creating a frame (its local variables and value stack) and handing it to the evaluation loop, CPython's big `switch` over opcodes in `Python/ceval.c`; since 3.12 the instruction bodies are generated from `Python/bytecodes.c`. Each instruction costs a dispatch plus whatever work it does, and generic work is expensive: `BINARY_OP` has to look at the types of both operands to decide what `+` means. This is why a loop of simple arithmetic is slow in Python and why the same loop inside a built-in like `sum()` or `sorted()` is fast. The built-in does all the iterations in C.

## The interpreter adapts

Python 3.11 added the specialising adaptive interpreter (PEP 659). After an instruction has run a few times, the interpreter rewrites it in place into a version specialised for what it has seen, guarded by a cheap check that falls back if the guess stops being true:

```python
for _ in range(1000):
    add(1, 2)
dis.dis(add, adaptive=True)
```

On 3.12 this shows `BINARY_OP_ADD_INT` in place of `BINARY_OP`, and the two loads fused into `LOAD_FAST__LOAD_FAST`. Your code did not change; the interpreter learned that `add` is called with ints. This is the main reason 3.11 was noticeably faster than 3.10. Python 3.13 also added an experimental JIT compiler, but it is only present if CPython was built with `--enable-experimental-jit`, so the standard installers do not use it.

## Cached bytecode

Compiling takes time, so when you import a module CPython writes its bytecode to `__pycache__/name.cpython-312.pyc` (the tag names the interpreter version, PEP 3147). On the next import it checks that file against the source's modification time and size and skips compiling if they match. The script you run directly is always compiled from scratch, and deleting `__pycache__` is always safe: it is only a cache.
