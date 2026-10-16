---
id: py-memory
title: Reference counting and the cycle collector
summary: Most objects die the instant nobody points at them
why: It explains why CPython frees files and sockets promptly, why reference cycles linger, and what gc.collect() is actually for.
requires: [py-objects]
lesson: none
points:
  - title: Every object keeps a count
    text: CPython stores in each object how many references point to it, and adjusts that count on every assignment, call and del.
  - title: Zero means freed, immediately
    text: When the count drops to zero the object is deallocated on the spot, running __del__ and freeing anything it referred to.
  - title: Cycles need a second mechanism
    text: Objects that refer to each other never reach zero, so a separate cycle collector periodically finds and frees unreachable groups.
  - title: An implementation detail
    text: The language only promises that unreachable objects may be reclaimed. PyPy, for example, has no reference counts, so close files with `with`.
quiz_hint: Count the arrows pointing at each object, and ask whether any of them come from outside the group.
quiz:
  - q: Two objects refer to each other and nothing else refers to either. In CPython, when are they freed?
    options: ["Immediately, when the last outside name goes away", "When the cycle collector next runs (automatically, or on gc.collect())", Never; this is a memory leak in CPython]
    answer: 1
    explain: Each object still has a count of 1 from the other, so reference counting alone never frees them. The cycle collector finds groups that are only reachable from each other and frees them.
  - q: Why does `sys.getrefcount(x)` report one more than you expect?
    options: [The interpreter keeps a hidden copy, "Passing x as the argument creates a temporary reference for the duration of the call", It counts weak references too]
    answer: 1
    explain: The call itself holds a reference to the argument. The docs note that the count is generally one higher than you might expect.
  - q: What does a weak reference (weakref.ref) do to an object's reference count?
    options: [Adds one, "Nothing; the object can still be freed, and the weak reference then returns None", Makes the object immortal]
    answer: 1
    explain: Weak references let caches and observers point at an object without keeping it alive. Once the last strong reference is gone, calling the weakref returns None.
links:
  - { title: "gc: garbage collector interface (Python docs)", url: "https://docs.python.org/3/library/gc.html" }
  - { title: "Reference counting (Python C API docs)", url: "https://docs.python.org/3/c-api/refcounting.html" }
  - { title: "weakref: weak references (Python docs)", url: "https://docs.python.org/3/library/weakref.html" }
  - { title: "PEP 683: Immortal objects", url: "https://peps.python.org/pep-0683/" }
---
CPython manages memory mostly by reference counting: every object records how many references point at it, and the moment that number reaches zero the object is freed. Reference counting can't see objects that point at each other in a loop, so CPython also runs a cycle garbage collector that occasionally looks for groups of objects nothing outside the group can reach. Between the two, you almost never free anything yourself.

## Reference counting

Each object's header holds a count. Binding a name, storing the object in a list, or passing it to a function increments it; rebinding the name, removing it from the list or returning from the function decrements it. When the count hits zero, CPython deallocates the object right there, which also decrements everything *it* referred to, so whole structures unravel at once.

```python
import gc
import sys

class Node:
    def __init__(self, name):
        self.name = name
        self.peer = None
    def __del__(self):
        print("freed", self.name)

a = Node("a")
print(sys.getrefcount(a))   # 2: the name a, plus the argument to getrefcount
del a                       # freed a: the count reached zero
```

`del a` deletes the *name*, not the object. The object is freed because that was its last reference. This immediacy is why, in CPython, a file object you forget to close is usually closed as soon as its last reference disappears. It is still a CPython behaviour, not a language rule, and other implementations such as PyPy use a tracing collector and free objects later. Write `with open(...)` and don't depend on the timing.

## Cycles and the collector

```python
b, c = Node("b"), Node("c")
b.peer, c.peer = c, b       # a cycle: each keeps the other's count at 1
del b, c                    # nothing printed
print("collecting")
gc.collect()                # freed b, freed c
```

After `del`, the two nodes are unreachable but each still holds a reference to the other. The cycle collector, the `gc` module, tracks container objects (lists, dicts, class instances and so on; not ints or strings, which can't form cycles). When it runs, it subtracts the references that come from inside the tracked set; anything left with no outside references is garbage, and it is freed even if it has a `__del__` method (since Python 3.4, PEP 442).

On 3.12 and 3.13 the collector is generational. New objects start in generation 0; survivors are promoted to 1 and then 2, because objects that have survived a while tend to keep surviving. A collection of generation 0 starts when allocations minus deallocations exceed the first threshold: `gc.get_threshold()` returns `(700, 10, 10)` on 3.12, and 3.13 raised the first value to 2000. Python 3.14.0 to 3.14.4 shipped an incremental collector instead, but 3.14.5 reverted to the 3.13 generational one after reports of memory pressure in production.

You rarely need to call `gc.collect()`. It helps in tests that check for leaks, and some long-running servers call `gc.freeze()` before forking workers so the collector doesn't touch, and therefore copy, pages shared with the parent.

## Avoiding cycles you don't need

Parent pointers, caches and callbacks are the usual sources of cycles. When one side only needs to *find* the other, not keep it alive, use `weakref.ref`, `WeakValueDictionary` or `WeakSet`: a weak reference does not increase the count and returns `None` once the object is gone.

## Small details worth knowing

Since 3.12 some objects are **immortal** (PEP 683): `None`, `True`, small ints and other core singletons have their count pinned, so `sys.getrefcount(None)` returns a huge fixed number (4294967295 on a 64-bit 3.12). Small objects are carved out of CPython's own allocator (pymalloc) in larger blocks, so freeing memory in Python does not always shrink the process as the operating system sees it.
