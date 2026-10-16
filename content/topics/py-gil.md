---
id: py-gil
title: The GIL and free-threaded Python
summary: One thread runs Python bytecode at a time, unless you opt out
why: It decides whether threads will speed your program up, and Python is in the middle of making it optional.
requires: [py-memory, py-bytecode]
lesson: none
points:
  - title: One lock per interpreter
    text: In the standard build, a thread must hold the global interpreter lock to run Python bytecode, so CPU-bound threads take turns.
  - title: Released while waiting
    text: Blocking I/O, time.sleep and many C extensions release the GIL, which is why threads still help I/O-bound programs.
  - title: Not a thread-safety guarantee
    text: Threads can switch between any two bytecode instructions, so `counter += 1` from several threads can lose updates.
  - title: Free-threaded builds
    text: "PEP 703 adds a separate build with no GIL: experimental in 3.13, officially supported but still optional in 3.14."
quiz_hint: Ask whether the threads are mostly waiting (I/O) or mostly computing in Python bytecode, and which build is running.
quiz:
  - q: "Four threads each run a pure-Python loop that does arithmetic. On the standard (GIL) build of 3.12, roughly how long does it take compared with running the four loops one after another?"
    options: [About a quarter of the time, About the same time, Four times longer]
    answer: 1
    explain: Only one thread can execute bytecode at a time, so the work is serialised. Use processes (multiprocessing, ProcessPoolExecutor), a C extension that releases the GIL, or a free-threaded build to use more cores.
  - q: Is `counter += 1` atomic across threads because of the GIL?
    options: ["Yes, the GIL makes every statement atomic", "No: it is several bytecode instructions, and a thread switch between the load and the store loses an update", Only for global variables]
    answer: 1
    explain: The GIL protects the interpreter's own data structures, not your invariants. Use threading.Lock (or a thread-safe structure like queue.Queue) around shared updates.
  - q: In Python 3.13, how do you get a Python without the GIL?
    options:
      - Pass -X nogil to the normal python3.13
      - Install or build the separate free-threaded interpreter (python3.13t), which is experimental
      - It is the default in 3.13
    answer: 1
    explain: The free-threaded build is a different executable, built with --disable-gil and offered as an option in the official macOS and Windows installers. A normal build cannot turn its GIL off.
links:
  - { title: "PEP 703: Making the Global Interpreter Lock optional in CPython", url: "https://peps.python.org/pep-0703/" }
  - { title: "Python support for free threading (Python 3.14 docs)", url: "https://docs.python.org/3.14/howto/free-threading-python.html" }
  - { title: "What's new in Python 3.13: free-threaded CPython", url: "https://docs.python.org/3.13/whatsnew/3.13.html#free-threaded-cpython" }
  - { title: "PEP 779: Criteria for supported status for free-threaded Python", url: "https://peps.python.org/pep-0779/" }
---
The standard CPython build has a global interpreter lock, the GIL: a mutex that a thread must hold to execute Python bytecode. It makes reference counting and the interpreter's internals safe without fine-grained locks, at the price that only one thread runs Python code at any moment. Since 3.13 there is also a separate free-threaded build without the GIL, and in 3.14 that build moved from experimental to officially supported, though it is still not the default.

## What the GIL does and doesn't block

A thread running Python code holds the GIL and is asked to give it up every few milliseconds (`sys.getswitchinterval()` returns `0.005`, five milliseconds) so other threads get a turn. More importantly, the GIL is released whenever a thread waits: reading a socket, `time.sleep`, waiting on a lock. C extensions can also release it around long computations, as NumPy, `hashlib` and `zlib` do. So:

- **I/O-bound** work (HTTP calls, database queries, file reads) scales well with threads, because most threads are waiting without the GIL.
- **CPU-bound pure-Python** work does not. The threads take turns on one core.

```python
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def burn(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

def timed(executor_cls):
    start = time.perf_counter()
    with executor_cls(max_workers=4) as pool:
        list(pool.map(burn, [3_000_000] * 4))
    return time.perf_counter() - start

if __name__ == "__main__":
    start = time.perf_counter()
    for _ in range(4):
        burn(3_000_000)
    print(f"one thread: {time.perf_counter() - start:.2f}s")
    print(f"4 threads:   {timed(ThreadPoolExecutor):.2f}s")
    print(f"4 processes: {timed(ProcessPoolExecutor):.2f}s")
```

On an otherwise idle laptop with Python 3.12, one run printed 0.29 s for one thread, 0.29 s for four threads, and 0.13 s for four processes. The exact numbers vary from run to run and machine to machine; the pattern (threads no faster, processes faster) doesn't. Each process has its own interpreter and its own GIL; the cost is starting the processes and pickling arguments and results between them.

## The GIL doesn't make your code thread-safe

`counter += 1` on a global compiles to separate instructions: `LOAD_GLOBAL`, `LOAD_CONST`, `BINARY_OP (+=)`, `STORE_GLOBAL`. A switch between the load and the store means two threads read the same old value and one increment is lost. The GIL keeps the interpreter from crashing; it does not protect your invariants. Guard shared state with `threading.Lock`, or pass work through a `queue.Queue`.

## Free-threaded Python

PEP 703 makes the GIL optional. It needed deep changes: biased and deferred reference counting so threads don't fight over counts, immortal objects, per-object locks inside `dict` and `list`, and the mimalloc allocator. Its status, precisely:

- **3.13**: experimental. A separate executable, usually `python3.13t`, offered as an option in the official macOS and Windows installers or built with `--disable-gil`. The docs warned of bugs and a substantial single-threaded slowdown, about 40% on the pyperformance suite, mostly because the specialising interpreter was disabled in that build.
- **3.14**: officially supported but still optional (phase II, PEP 779). The specialising interpreter is back on, and the 3.14 docs put the single-threaded overhead at about 1% to 8% depending on platform.
- **Default build**: still has the GIL. Making free-threading the default would be a later, separate decision (phase III).

C extensions must be rebuilt for the free-threaded build and declare that they support it. Importing one that doesn't re-enables the GIL for the whole process and prints a warning; `PYTHON_GIL=0` or `-X gil=0` forces it off anyway. To check what you are running:

```python
import sys
import sysconfig

print(sys.getswitchinterval())                        # 0.005
print(sysconfig.get_config_var("Py_GIL_DISABLED"))    # 1 only on a free-threaded build
print(getattr(sys, "_is_gil_enabled", lambda: True)())  # True unless the GIL is really off (3.13+)
```

## Other ways to use more cores

`multiprocessing` and `ProcessPoolExecutor` are the long-standing answer. Python 3.12 gave each subinterpreter its own GIL at the C API level (PEP 684), and 3.14 exposed this in the standard library as `concurrent.interpreters` and `InterpreterPoolExecutor` (PEP 734).
