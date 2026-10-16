---
id: py-closures
title: Closures and decorators
summary: Functions that remember, and functions that wrap
why: Decorators are everywhere in Python (web routes, caching, retries, tests), and every one of them is a closure underneath.
requires: [py-objects]
lesson: none
points:
  - title: Scope is decided at compile time
    text: A name assigned anywhere in a function is local to the whole function, unless you declare it global or nonlocal.
  - title: Closures keep variables, not values
    text: An inner function holds a reference to the outer variable's cell, so it sees the latest value when it runs.
  - title: "@ is just a call"
    text: "`@deco` above `def f` means `f = deco(f)`, run once when the def executes."
  - title: Wrap politely
    text: Use functools.wraps so the wrapper keeps the original's name, docstring and signature for tools and debuggers.
quiz_hint: Ask when each line runs (at def time or at call time) and which variable a name refers to.
quiz:
  - q: What does this print?
    code: |
      fns = [lambda: i for i in range(3)]
      print([f() for f in fns])
    options: ["[0, 1, 2]", "[2, 2, 2]", "NameError"]
    answer: 1
    explain: "All three lambdas close over the same variable i, and they run after the loop has finished, when i is 2. Bind the current value with a default argument, `lambda i=i: i`, to get [0, 1, 2]."
  - q: When does the body of a decorator (not the wrapper) run?
    options: [Every time the decorated function is called, "Once, when the def statement executes (usually at import time)", Only the first time the function is called]
    answer: 1
    explain: "`@deco` is applied as soon as the def runs. That is why decorators like a route registry can record functions at import time, and why heavy work in a decorator slows imports."
  - q: Without functools.wraps, what is `slow_square.__name__` after `@timed`?
    options: [slow_square, wrapper, timed]
    answer: 1
    explain: The name now refers to the inner wrapper function. functools.wraps copies __name__, __doc__ and more from the original and sets __wrapped__ so tools can find it.
links:
  - { title: "Execution model: resolution of names (Python docs)", url: "https://docs.python.org/3/reference/executionmodel.html#resolution-of-names" }
  - { title: "functools.wraps (Python docs)", url: "https://docs.python.org/3/library/functools.html#functools.wraps" }
  - { title: "Glossary: decorator (Python docs)", url: "https://docs.python.org/3/glossary.html#term-decorator" }
  - { title: "PEP 318: Decorators for functions and methods", url: "https://peps.python.org/pep-0318/" }
---
Functions in Python are objects created when a `def` statement runs, and a function defined inside another one can keep using the outer function's variables after the outer call has returned. That pairing of a function and the variables it captured is a closure. A decorator is a function that takes a function and returns a replacement, usually a closure that wraps the original.

## How names are resolved

Python looks names up in four places, innermost first: the local scope, any enclosing function scopes, the module's globals, and the built-ins. Which scope a name belongs to is decided when the function is compiled: if a function assigns to a name anywhere in its body, that name is local everywhere in the function. That is why this fails:

```python
x = 10
def f():
    print(x)
    x = 2

f()   # UnboundLocalError: cannot access local variable 'x' where it is not associated with a value
```

To assign to an outer variable, declare it: `global x` for a module variable, `nonlocal x` for one in an enclosing function.

## Closures

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

tick = make_counter()
tick(); tick()
print(tick())                              # 3
print(tick.__closure__[0].cell_contents)   # 3
```

`count` outlives `make_counter` because `increment` holds a reference to it through a **cell** object, which you can see in `__closure__`. The closure stores the variable, not a snapshot of its value, which produces the late-binding surprise:

```python
fns = [lambda: i for i in range(3)]
print([f() for f in fns])                  # [2, 2, 2]
fns = [lambda i=i: i for i in range(3)]
print([f() for f in fns])                  # [0, 1, 2]
```

Default values are evaluated when the lambda is created, so `i=i` captures each value.

## Decorators

`@timed` written above a `def` is shorthand for `slow_square = timed(slow_square)`, applied immediately after the function is created:

```python
import functools
import time

def timed(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__} took {time.perf_counter() - start:.3f}s")
    return wrapper

@timed
def slow_square(n):
    """Square n, slowly."""
    time.sleep(0.1)
    return n * n

print(slow_square(4))   # prints "slow_square took 0.10…s", then 16
print(slow_square.__name__, slow_square.__doc__)   # slow_square Square n, slowly.
```

`wrapper` is a closure over `fn`. `*args, **kwargs` forwards any arguments, and `try/finally` reports the time even when `fn` raises. Without `functools.wraps` the decorated function would report its name as `wrapper` and lose its docstring, which confuses logs, debuggers and frameworks that inspect signatures.

## Decorators with arguments

`@retry(times=3)` has one more layer: `retry(times=3)` is called first and returns the real decorator. So a configurable decorator is a function that returns a function that returns a function:

```python
def retry(times):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError:
                    print("attempt", attempt, "failed")
            raise ConnectionError(f"gave up after {times} attempts")
        return wrapper
    return decorator
```

The standard library ships several decorators built this way, including `functools.cache`, `functools.lru_cache`, `contextlib.contextmanager`, `property`, `staticmethod` and `dataclasses.dataclass`. Class decorators work the same way, receiving the class instead of a function.
