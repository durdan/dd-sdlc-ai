---
id: py-typing
title: Type hints at runtime vs static checkers
summary: Hints are metadata; a separate tool does the checking
why: Teams adopt mypy or pyright expecting runtime safety, then are surprised when a wrong type sails straight through in production.
requires: [py-data-model]
lesson: none
points:
  - title: The interpreter ignores them
    text: CPython stores annotations on the function or class but never checks a value against them.
  - title: Checkers read your source
    text: mypy, pyright and similar tools analyse the code without running it and report mismatches before you ship.
  - title: Some libraries read them at runtime
    text: dataclasses, Pydantic, FastAPI and typing.get_type_hints use annotations as data, to generate code or validate input.
  - title: The syntax keeps improving
    text: 3.12 added `def f[T]()` generics and the `type` statement; 3.14 evaluates annotations lazily (PEP 649).
quiz_hint: Ask who reads the annotation, the interpreter, a checker before the program runs, or a library while it runs.
quiz:
  - q: 'What happens when you call `double("ab")` with `def double(x: int) -> int: return x * 2`?'
    options: [TypeError at the call, "It returns \"abab\"", "It returns 0"]
    answer: 1
    explain: Annotations are not enforced at runtime, and str supports * with an int. mypy would flag the call before you ran it.
  - q: "A Protocol marked @runtime_checkable declares `def close(self) -> None`. What does isinstance(obj, ThatProtocol) check?"
    options: [That obj.close exists, That obj.close exists and returns None, That obj's class inherits from the protocol]
    answer: 0
    explain: Runtime protocol checks only look for the attributes by name. Signatures and return types are the static checker's job.
  - q: Why is `isinstance(x, list[int])` an error?
    options: [list is not a class, "Generic aliases with parameters can't be used with isinstance, because the element type isn't recorded on the object", It is fine since 3.12]
    answer: 1
    explain: A list does not know what its elements are meant to be, so there is nothing to check cheaply. Python raises "isinstance() argument 2 cannot be a parameterized generic". Check list, then the items if you must.
links:
  - { title: "typing: support for type hints (Python docs)", url: "https://docs.python.org/3/library/typing.html" }
  - { title: "PEP 484: Type hints", url: "https://peps.python.org/pep-0484/" }
  - { title: "PEP 695: Type parameter syntax", url: "https://peps.python.org/pep-0695/" }
  - { title: "PEP 649: Deferred evaluation of annotations using descriptors", url: "https://peps.python.org/pep-0649/" }
---
Type hints in Python are annotations: expressions attached to parameters, return values and attributes that the interpreter stores and otherwise ignores. Checking happens elsewhere, in a static type checker such as mypy or pyright that reads your source code before it runs. Some libraries also read annotations while the program runs, which is why they can feel like more than comments.

## Stored, not enforced

```python
def double(x: int) -> int:
    return x * 2

print(double("ab"))            # abab: nothing checks the hint at runtime
print(double.__annotations__)  # {'x': <class 'int'>, 'return': <class 'int'>}
```

The call succeeds because `str * int` is valid. Run mypy (2.4 here) on a file containing that call and it reports, without running anything:

```text
error: Argument 1 to "double" has incompatible type "str"; expected "int"  [arg-type]
```

That split is deliberate (PEP 484). Hints cost nothing at runtime, they can be added gradually to an existing code base, and the checker can reason about things no runtime check could, such as every path through a function or `None` being possible.

## What a static checker gives you

A checker infers types through your program and complains when they don't line up: passing a `str` where an `int` is expected, forgetting that a dict lookup with `.get()` may return `None`, calling a method that doesn't exist, or returning the wrong type from one branch. The useful vocabulary is small: `X | None` for optional values (3.10+), `list[str]` and `dict[str, int]` for containers, `Callable`, `TypedDict` for JSON-shaped dicts, and `Protocol` for "anything with these methods". `reveal_type(x)` asks the checker what it thinks `x` is.

Python 3.12 added cleaner generics (PEP 695):

```python
def first[T](items: list[T]) -> T:      # 3.12+ syntax (PEP 695)
    return items[0]

type Pair[T] = tuple[T, T]              # 3.12+ type alias statement
```

## Annotations at runtime

Some tools treat annotations as data. `@dataclass` reads the class annotations to decide which fields go in `__init__`, though it still doesn't check the values (`Point("a")` happily stores a string in `x: int`). Pydantic and FastAPI do validate: they read the hints with `typing.get_type_hints()` and convert or reject incoming data. `isinstance` works with plain classes, and with a `Protocol` marked `@runtime_checkable`, but it only checks that the methods exist by name:

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None: ...

class Door:
    def close(self):
        return "slam"

print(isinstance(Door(), Closeable))   # True: only checks that a close attribute exists
```

Parameterised generics like `list[int]` can't be used with `isinstance` at all; Python raises `TypeError: isinstance() argument 2 cannot be a parameterized generic`.

## When annotations are evaluated

Up to 3.13, annotations are evaluated when the `def` or `class` statement runs, so a hint that names a class defined later in the file needs quotes (`"Node"`) or `from __future__ import annotations`, which turns every annotation into a string. Python 3.14 implements PEP 649: annotations are evaluated lazily, the first time something asks for them, so forward references just work. Code that reads annotations should use `typing.get_type_hints()` or, on 3.14, `annotationlib.get_annotations()` rather than poking at `__annotations__` directly.
