---
id: py-data-model
title: The data model (dunder methods)
summary: How len(), +, in and for find your code
why: Operators, built-ins and for loops are all hooks into special methods; implement the right ones and your class works everywhere a built-in type does.
requires: [py-objects]
lesson: none
points:
  - title: Syntax calls methods
    text: "`a + b` becomes `type(a).__add__(a, b)`, `len(x)` becomes `type(x).__len__(x)`, and so on for most of the language."
  - title: Looked up on the type
    text: Python finds special methods on the class, not the instance, so attaching `__len__` to one object does nothing.
  - title: NotImplemented means try the other side
    text: Returning NotImplemented from `__add__` lets Python try the right operand's `__radd__` before raising TypeError.
  - title: Equality and hashing go together
    text: Defining `__eq__` without `__hash__` makes instances unhashable, so they can't be dict keys or set members.
quiz_hint: Translate the syntax into the special method call, then ask which class Python looks it up on.
quiz:
  - q: A class defines `__eq__` but not `__hash__`. What happens when you put an instance in a set?
    options: ["It works, using id() as the hash", "TypeError: unhashable type", "The set silently stores it twice"]
    answer: 1
    explain: Defining __eq__ sets __hash__ to None, because the default identity-based hash would break the rule that equal objects have equal hashes. Define __hash__ from the same fields as __eq__, or use a frozen dataclass.
  - q: "`__add__` returns NotImplemented for an int argument. What does `v + 1` do?"
    options: ["Returns NotImplemented to the caller", "Tries int's __radd__ with v, and raises TypeError when that also fails", "Converts v to an int"]
    answer: 1
    explain: NotImplemented is a signal to the interpreter, not a result. Python then tries the reflected method on the other operand, and only raises TypeError when both sides decline.
  - q: A class has `__len__` and `__getitem__` (accepting 0, 1, 2…) but no `__iter__` or `__contains__`. Does `for x in obj` work?
    options: ["No, __iter__ is required", "Yes, Python falls back to calling __getitem__ with 0, 1, 2… until IndexError", "Only if the class inherits from list"]
    answer: 1
    explain: The old sequence protocol is still supported. `in` falls back the same way, scanning item by item.
links:
  - { title: "Data model: special method names (Python docs)", url: "https://docs.python.org/3/reference/datamodel.html#special-method-names" }
  - { title: "dataclasses (Python docs)", url: "https://docs.python.org/3/library/dataclasses.html" }
  - { title: "collections.abc: abstract base classes for containers (Python docs)", url: "https://docs.python.org/3/library/collections.abc.html" }
---
Python's syntax is a thin layer over a set of special methods, the "dunder" (double underscore) methods described in the language reference's data model chapter. `a + b`, `len(x)`, `x[i]`, `for item in x`, `with x:` and `print(x)` all turn into calls such as `__add__`, `__len__`, `__getitem__`, `__iter__`, `__enter__` and `__repr__`. Write those methods and your own class behaves like a built-in.

## Operators are method calls

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)

    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

v = Vector(3, 4)
print(v + Vector(1, 1))   # Vector(4, 5)
print(abs(v))             # 5.0
print(v == Vector(3, 4))  # True
```

`v + 1` raises `TypeError: unsupported operand type(s) for +: 'Vector' and 'int'`. Returning `NotImplemented` (a special singleton, not an exception) tells Python to try the other operand's reflected method, `int.__radd__`, and only when that also declines does it raise. That is how `2 * vector` can work if you define `__rmul__`.

`__repr__` is the developer-facing text used by the REPL, debuggers and containers; `__str__` is for end users and falls back to `__repr__`. Define `__repr__` first.

## Equality, hashing and dict keys

Dicts and sets locate keys by hash and then confirm with `==`, so equal objects must have equal hashes. Because the default hash is based on identity, defining `__eq__` sets `__hash__` to `None`, and `{v}` raises `TypeError: unhashable type: 'Vector'`. If instances are immutable, add `def __hash__(self): return hash((self.x, self.y))`. If they are mutable, leave them unhashable: a key whose hash changes after insertion can never be found again.

`@dataclass` writes `__init__`, `__repr__` and `__eq__` for you, and `@dataclass(frozen=True)` adds a matching `__hash__`.

## Protocols, not base classes

Python cares about which methods exist, not what you inherit from. A class with `__len__` and `__getitem__` is already a usable sequence:

```python
class Deck:
    def __init__(self):
        self.cards = [r + s for s in "SH" for r in "AKQ"]
    def __len__(self):
        return len(self.cards)
    def __getitem__(self, i):
        return self.cards[i]

d = Deck()
print(len(d), d[0], d[-1])   # 6 AS QH
print("KH" in d)             # True: no __contains__, so Python scans with __getitem__
print(list(reversed(d))[:2]) # ['QH', 'KH']
```

Iteration, `in` and `reversed()` all work through fallbacks. When you want to state the contract explicitly, the abstract classes in `collections.abc` (such as `Sequence` and `Mapping`) fill in the rest of the methods from a minimal set.

## Looked up on the type

Special methods are found on the class, skipping the instance's own attributes. Setting `obj.__len__ = lambda: 3` on an instance has no effect on `len(obj)`, which still raises `TypeError: object of type 'C' has no len()`. This rule lets the interpreter take fast paths, and it is why the place to customise behaviour is always the class.
