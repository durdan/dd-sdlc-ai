---
id: py-performance
title: Performance basics
summary: Measure, fix the algorithm, then push loops into C
why: Python is fast enough for most work once you stop guessing; the wins come from profiling, better data structures and letting C do the inner loops.
requires: [py-gil, py-bytecode]
lesson: none
points:
  - title: Profile before optimising
    text: cProfile shows which functions take the time; timeit compares small alternatives reliably. Intuition is usually wrong.
  - title: The algorithm comes first
    text: Swapping a list for a set in a membership test can beat any amount of micro-tuning.
  - title: Every bytecode costs
    text: Built-ins like sum, sorted, str.join and comprehensions run their loops in C or in tighter bytecode than a hand-written loop.
  - title: C extensions for the hot core
    text: NumPy, compiled extensions (C, Cython, Rust via PyO3, mypyc) move the inner loop out of the interpreter, and can release the GIL.
quiz_hint: Ask where the time is actually going, then whether the loop runs in Python bytecode or in C.
quiz:
  - q: A profile shows 97% of the time in one function that checks `if key in seen` where seen is a list of 20,000 items. What is the best first fix?
    options: [Rewrite the function in C, Make seen a set, Run it in four threads]
    answer: 1
    explain: Membership in a list scans every item, so the loop is quadratic. A set uses a hash table and checks in roughly constant time; in this topic's example that took the run from 0.19 s to 0.007 s.
  - q: Why does `timeit` run a statement many times and why should you report the minimum of several repeats?
    options:
      - The first run is always wrong
      - Short timings are dominated by noise from the OS and other processes; the minimum is the run least disturbed by it
      - Python caches the result after one run
    answer: 1
    explain: The timeit docs recommend the minimum as a lower bound on what the machine can do; higher values are usually caused by other activity, not by your code.
  - q: Which of these speeds up a pure-Python numeric loop on a standard CPython 3.13 installed from python.org?
    options: ["The JIT, which is on by default in 3.13", "Rewriting the inner loop with NumPy array operations", Adding type hints]
    answer: 1
    explain: The 3.13 JIT only exists in builds configured with --enable-experimental-jit, and type hints are ignored by the interpreter. NumPy runs the loop in compiled C over a compact array.
links:
  - { title: "The Python profilers: cProfile and profile (Python docs)", url: "https://docs.python.org/3/library/profile.html" }
  - { title: "timeit: measure execution time of small code snippets (Python docs)", url: "https://docs.python.org/3/library/timeit.html" }
  - { title: "Extending Python with C or C++ (Python docs)", url: "https://docs.python.org/3/extending/extending.html" }
  - { title: "PEP 744: JIT compilation", url: "https://peps.python.org/pep-0744/" }
---
Python code is slow per operation, because each bytecode instruction goes through the eval loop and works on boxed objects, but most programs spend their time in a handful of places. Find those places with a profiler, fix the data structure or algorithm there, and if a hot loop is still too slow, move that loop into C, usually by calling a library that is already written in it.

## Measure first

`cProfile` records every function call and how long it took:

```python
import cProfile
import pstats

def parse(lines):
    return [line.split(",") for line in lines]

def find_dupes(rows):
    seen, dupes = [], []
    for row in rows:
        if row[0] in seen:      # a list: every check scans it
            dupes.append(row)
        seen.append(row[0])
    return dupes

lines = [f"{i % 5000},x,y" for i in range(20_000)]
with cProfile.Profile() as prof:
    find_dupes(parse(lines))
pstats.Stats(prof).sort_stats("cumulative").print_stats(4)
```

On Python 3.12 it reported 0.188 s in total, of which 0.183 s was `find_dupes` itself (`tottime`), while `parse` took 0.003 s. The culprit is `row[0] in seen`: membership in a list compares against every element, so the function is quadratic. Making `seen` a `set` (and `append` an `add`) dropped the whole run to 0.007 s. No micro-optimisation would have come close.

For production processes you can't restart under a profiler, a sampling profiler that attaches from outside (py-spy is a popular one) shows where time goes with almost no overhead. Python 3.12 also added `-X perf` so Linux `perf` can see Python function names.

## Why loops in Python are slow, and how to avoid them

Every iteration of a Python loop runs several instructions, each dispatched by the interpreter and each manipulating full objects. Built-ins do the same loop inside one C function:

```python
import timeit

nums = list(range(1_000_000))

def loop_sum():
    total = 0
    for n in nums:
        total += n
    return total

t_loop = min(timeit.repeat(loop_sum, number=10, repeat=5))
t_builtin = min(timeit.repeat(lambda: sum(nums), number=10, repeat=5))
print(f"loop: {t_loop:.3f}s  sum(): {t_builtin:.3f}s  ratio: {t_loop / t_builtin:.1f}x")
```

On an Apple-silicon laptop with Python 3.12 this printed a ratio of 6.8x. The same reasoning favours `"".join(parts)` over repeated `+=`, comprehensions over `append` loops, `sorted(key=...)` over hand-written comparisons, and `collections.Counter` or `dict` lookups over nested searches. Local variables are also cheaper than globals and attribute lookups, which is why hot loops sometimes bind `append = out.append` first.

## When you need C

If the hot loop is numeric, express it as whole-array operations with NumPy, which stores numbers in compact C arrays and runs the loop in compiled code. For custom logic, compile it: Cython, mypyc (which compiles type-annotated Python), Rust through PyO3, or a hand-written C extension using the C API. Compiled extensions can release the GIL around long computations, so they also scale across threads.

Two interpreter developments are worth knowing about but not counting on. Since 3.11 the specialising interpreter has sped up ordinary code with no changes on your part. Python 3.13 added an experimental JIT compiler (PEP 744), but it is only included when CPython is built with `--enable-experimental-jit`, so the regular python.org 3.13 installers don't use it. Upgrading Python is often the cheapest speed-up available.
