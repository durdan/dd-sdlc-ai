---
id: py-exceptions
title: Exceptions and context managers
summary: Errors as objects, cleanup you can't forget
why: Python reports almost every failure by raising, and `with` is how files, locks, transactions and connections get released even when something goes wrong.
requires: [py-data-model]
lesson: none
points:
  - title: Exceptions are objects
    text: They are instances of classes arranged in a hierarchy, so `except OSError` also catches FileNotFoundError.
  - title: Chained on purpose
    text: "`raise NewError(...) from e` keeps the original as __cause__, so the traceback shows both."
  - title: finally always runs
    text: Whether the block returns, raises or finishes normally, the finally clause runs on the way out.
  - title: with is try/finally in a method pair
    text: "`with x:` calls __enter__ on the way in and __exit__ on the way out, with any exception passed to __exit__."
quiz_hint: Follow the exception as it travels outwards, and note every finally or __exit__ it passes through.
quiz:
  - q: "In `try: return \"a\"` / `finally: print(\"b\")`, what happens?"
    options: ["The function returns \"a\" and \"b\" is never printed", "\"b\" is printed, then the function returns \"a\"", "SyntaxError: return inside try"]
    answer: 1
    explain: The finally clause runs on every way out of the try, including return. (Returning from inside finally itself would override the first return; Python 3.14 warns about that.)
  - q: What does an `__exit__` method that returns True do?
    options: [Re-raises the exception, Suppresses the exception so execution continues after the with block, Closes the file]
    answer: 1
    explain: A truthy return value from __exit__ tells Python the exception has been handled. contextlib.suppress(KeyError) is built on exactly this.
  - q: Why prefer `except KeyError:` over a bare `except:`?
    options:
      - A bare except is slower
      - A bare except also catches KeyboardInterrupt and SystemExit, and hides bugs you did not expect
      - A bare except doesn't work in functions
    answer: 1
    explain: Catch the narrowest exception you know how to handle. Bare except (or except BaseException) swallows Ctrl-C and sys.exit() too.
links:
  - { title: "Errors and exceptions (Python tutorial)", url: "https://docs.python.org/3/tutorial/errors.html" }
  - { title: "The with statement (Python docs)", url: "https://docs.python.org/3/reference/compound_stmts.html#the-with-statement" }
  - { title: "contextlib (Python docs)", url: "https://docs.python.org/3/library/contextlib.html" }
  - { title: "PEP 654: Exception groups and except*", url: "https://peps.python.org/pep-0654/" }
---
When something goes wrong, Python raises an exception: an ordinary object that travels up the call stack, frame by frame, until an `except` clause that matches its class catches it, or until it reaches the top and the program prints a traceback. Context managers, the objects you use with `with`, are the other half: they make sure cleanup code runs on the way out whether the block succeeded or not.

## Raising and catching

Exceptions are classes in a hierarchy rooted at `BaseException`. Almost everything you would catch derives from `Exception`; `KeyboardInterrupt` and `SystemExit` deliberately do not, so that `except Exception:` lets Ctrl-C and `sys.exit()` through. Catching a base class catches its subclasses: `except OSError` handles `FileNotFoundError` and `PermissionError` too.

A `try` statement has up to four parts. `except` handles matching errors, `else` runs only if nothing was raised, and `finally` runs no matter how the block is left, including by `return`:

```python
def check():
    try:
        print("try")
        return "from try"
    finally:
        print("finally runs before the function returns")
print(check())   # try / finally runs before the function returns / from try
```

Python style leans towards "easier to ask forgiveness than permission" (EAFP): try the dictionary lookup and catch `KeyError`, rather than checking first. It avoids a race between the check and the use, and the fast path stays fast.

## Chaining

When you translate a low-level error into one that makes sense to your caller, keep the original:

```python
import json

def load_config(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError("config is not valid JSON") from e

try:
    load_config("{oops")
except ValueError as e:
    print(e, "| caused by:", type(e.__cause__).__name__)
# config is not valid JSON | caused by: JSONDecodeError
```

`from e` stores the original in `__cause__` and the traceback prints both. If an exception is raised while handling another without `from`, Python still records the first one in `__context__` and prints "During handling of the above exception, another exception occurred". `raise ... from None` hides the context when it is just noise. Since 3.11 you can also attach extra lines to a traceback with `e.add_note("...")`.

## Context managers

`with open(path) as f:` is shorthand for a try/finally that calls two methods: `__enter__` when the block starts (its return value is bound to `f`) and `__exit__(exc_type, exc, tb)` when it ends. If the block raised, `__exit__` receives the exception and may return `True` to suppress it. Files close, locks release and database transactions commit or roll back this way.

The easiest way to write one is a generator with `contextlib.contextmanager`. Everything before `yield` is the setup, everything after it is the cleanup:

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - start:.2f}s")

with timer("sleep"):
    time.sleep(0.05)   # sleep: 0.05s
```

The `try/finally` around `yield` matters: if the `with` body raises, the exception is thrown into the generator at the `yield`, and without `finally` the cleanup would be skipped. `contextlib` also has `suppress`, `closing`, `ExitStack` (for a variable number of resources) and async versions for `async with`.

## Many errors at once

Concurrent code can fail in several places at the same time. Python 3.11 added `ExceptionGroup` and the `except*` syntax, which matches each kind of exception inside a group separately. `asyncio.TaskGroup` raises one when more than one task fails:

```python
try:
    raise ExceptionGroup("two failures", [ValueError("bad"), TypeError("worse")])
except* ValueError as eg:
    print("values:", eg.exceptions)   # values: (ValueError('bad'),)
except* TypeError as eg:
    print("types:", eg.exceptions)    # types: (TypeError('worse'),)
```
