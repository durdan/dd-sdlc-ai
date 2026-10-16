---
id: py-objects
title: Names, objects and references
summary: Variables are labels; assignment never copies
why: Most "Python changed my data behind my back" bugs come from two names pointing at one mutable object.
requires: [py-bytecode]
lesson: none
points:
  - title: Everything is an object
    text: Ints, functions, classes and modules all have an identity, a type and a value.
  - title: Names point, they don't contain
    text: Assignment binds a name to an object. It never copies the object.
  - title: Mutable or not
    text: Lists, dicts and sets can change in place; ints, strings and tuples cannot. Two names on one mutable object see each other's changes.
  - title: is vs ==
    text: "`is` asks whether two names point at the same object; `==` asks whether the values are equal."
quiz_hint: Draw boxes for objects and arrows for names, then follow the arrows.
quiz:
  - q: What does this print?
    code: |
      a = [1, 2]
      b = a
      a = a + [3]
      print(b)
    options: ["[1, 2]", "[1, 2, 3]", "An error"]
    answer: 0
    explain: "`a + [3]` builds a new list and rebinds a to it. b still points at the original list. With `a += [3]` instead, the list would be extended in place and b would see [1, 2, 3]."
  - q: Why is `def f(items=[])` a classic bug?
    options:
      - Default values are evaluated once, when the def runs, so every call without an argument shares the same list
      - Lists are not allowed as defaults
      - The list is recreated on every call, losing data
    answer: 0
    explain: The default is an object stored on the function. Use `items=None` and create a new list inside the function when it is None.
  - q: Which comparison is the right one for "is this value missing?"
    options: ["x == None", "x is None", "x is 0"]
    answer: 1
    explain: There is exactly one None object, so `is None` is both correct and immune to classes that override `==`. Use `==` for comparing values such as numbers and strings; `is` with a literal even triggers a SyntaxWarning.
links:
  - { title: "Data model: objects, values and types (Python docs)", url: "https://docs.python.org/3/reference/datamodel.html#objects-values-and-types" }
  - { title: "Execution model: naming and binding (Python docs)", url: "https://docs.python.org/3/reference/executionmodel.html#naming-and-binding" }
  - { title: "Why are default values shared between objects? (Python FAQ)", url: "https://docs.python.org/3/faq/programming.html#why-are-default-values-shared-between-objects" }
---
In Python every value is an object living somewhere in memory, and a variable is just a name bound to one of those objects. Assigning, passing an argument or putting something in a list all copy a reference, never the object. Once you picture names as arrows, aliasing, mutability and the difference between `is` and `==` stop being surprising.

## Everything is an object

Every object has three things: an **identity** (fixed for its lifetime; `id()` returns it, and in CPython it is the memory address), a **type** (which decides what operations it supports) and a **value**. That really does mean everything: `type(len)` is `builtin_function_or_method`, `type("abc")` is `str`, and `type(str)` is `type`. Functions, classes and modules are objects you can store in a dict or pass to another function, which is what makes decorators and plugin registries possible.

## Names are arrows

```python
a = [1, 2]
b = a              # a second name for the same list
b.append(3)
print(a, a is b)   # [1, 2, 3] True

c = list(a)        # a new list with the same items
print(c == a, c is a)   # True False
```

`b = a` did not copy the list; it made a second arrow to the same object, so a change through `b` is visible through `a`. `list(a)` builds a new object, so it is equal (`==`) but not identical (`is`). Function calls work the same way: the parameter is a new name for the caller's object. If the function mutates it, the caller sees the change; if the function rebinds the name, it doesn't.

## Mutable and immutable

Lists, dicts, sets and most user-defined objects are **mutable**: they can change in place. Ints, floats, strings, tuples and frozensets are **immutable**: any "change" builds a new object. Immutability is shallow, though. A tuple can hold a list, and that list can still change. That leads to a famous oddity: `t = (1, [2]); t[1] += [3]` raises `TypeError: 'tuple' object does not support item assignment`, yet afterwards `t` is `(1, [2, 3])`. The list was extended in place first, and only the step that stores the result back into the tuple failed.

Augmented assignment is where the difference shows. For a list, `x += [3]` extends it in place (every alias sees it); for an int or a tuple there is no in-place version, so `x += 1` builds a new object and rebinds only that name.

## Default arguments are shared

```python
def add_item(x, items=[]):
    items.append(x)
    return items

print(add_item(1))   # [1]
print(add_item(2))   # [1, 2]: the default list is shared between calls
```

The default list is created once, when `def` runs, and stored on the function. Every call that omits `items` mutates that same list. The fix is `items=None` and `if items is None: items = []` inside the body.

## is vs ==

`==` calls the type's `__eq__` and compares values. `is` compares identities and can't be overridden. Use `is` only for singletons like `None`, `True`, `False` or a sentinel object you created. CPython happens to reuse some small ints and strings, so `x is 5` may appear to work and then fail for larger numbers (`1000 is int("1000")` is `False`). Python 3.8 and later warn about `is` with a literal for exactly this reason.
