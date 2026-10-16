---
id: py-iterators
title: Iterators, generators and lazy evaluation
summary: Values on demand, one at a time
why: Generators let you stream a 10 GB file or an endless feed in constant memory, and they are the machinery that asyncio's coroutines grew out of.
requires: [py-data-model]
lesson: none
points:
  - title: Two methods make a for loop
    text: An iterable's `__iter__` returns an iterator; the iterator's `__next__` returns items until it raises StopIteration.
  - title: yield pauses a function
    text: Calling a generator function runs nothing. Each next() resumes the frame until the following yield.
  - title: Lazy pipelines
    text: Chained generators pull one item at a time through every stage, so memory stays flat however long the input is.
  - title: One pass only
    text: An iterator is used up after one pass. Iterate it again and you get nothing, silently.
quiz_hint: Ask who is pulling the next value, and whether the iterator has already been used up.
quiz:
  - q: What does this print?
    code: |
      squares = (x * x for x in range(3))
      print(sum(squares), sum(squares))
    options: ["5 5", "5 0", "TypeError"]
    answer: 1
    explain: A generator expression is an iterator. The first sum() consumes it; the second finds it already exhausted and adds up nothing. Use a list if you need two passes.
  - q: "`gen = countdown(3)` where countdown contains `print(\"starting\")` before its first yield. When is \"starting\" printed?"
    options: [When countdown(3) is called, On the first next(gen), When the generator is garbage collected]
    answer: 1
    explain: Calling a generator function only creates the generator object. The body starts running on the first next() and stops at the first yield.
  - q: Why does `max(line for line in open(path))` work on a file bigger than RAM?
    options:
      - Python compresses the lines
      - The file object is an iterator, so max() sees one line at a time and keeps only the current best
      - max() reads the file in a background thread
    answer: 1
    explain: Files iterate line by line, and the generator expression passes each line through without storing it. Nothing in the chain builds a list.
links:
  - { title: "Iterator types (Python docs)", url: "https://docs.python.org/3/library/stdtypes.html#iterator-types" }
  - { title: "Functional programming HOWTO: iterators and generators (Python docs)", url: "https://docs.python.org/3/howto/functional.html#iterators" }
  - { title: "itertools (Python docs)", url: "https://docs.python.org/3/library/itertools.html" }
  - { title: "PEP 255: Simple generators", url: "https://peps.python.org/pep-0255/" }
---
A `for` loop in Python does not know about lists or indexes. It asks the object for an iterator and then calls `next()` on it until the iterator says it is finished. Generators are the easy way to write iterators: a function containing `yield` that pauses at each value and resumes where it left off. Together they let you describe a whole pipeline of work that only happens when someone asks for the next item.

## The iterator protocol

An **iterable** is anything with an `__iter__` method that returns an **iterator**. An iterator has a `__next__` method that returns the next item or raises `StopIteration`. Iterators are themselves iterable (their `__iter__` returns `self`), which is why you can loop over one directly.

```python
nums = [10, 20]
it = iter(nums)
print(next(it), next(it))   # 10 20
try:
    next(it)
except StopIteration:
    print("exhausted")
```

`for x in nums:` is exactly this, with the `StopIteration` caught for you. A list is iterable but not an iterator, so every `for` loop over it gets a fresh iterator and starts from the beginning. A file, a `map()`, a `zip()` or a generator *is* an iterator, so it can only be walked once.

## Generators

A function with `yield` in it becomes a generator function. Calling it creates a generator object without running any of the body. Each `next()` runs the frame until the next `yield`, hands out that value, and freezes the frame, local variables and all:

```python
def countdown(n):
    print("starting")
    while n > 0:
        yield n
        n -= 1
    print("done")

gen = countdown(3)          # nothing printed yet: the body hasn't started
print(next(gen))            # starting, then 3
print(list(gen))            # [2, 1], after printing done
```

When the function returns, the generator raises `StopIteration` and the loop ends. `yield from other` delegates to another iterator, which makes it easy to split a generator into smaller ones.

## Lazy pipelines

Because each stage pulls from the one before only when asked, you can chain generators over input that would never fit in memory, or that never ends:

```python
import itertools

def read_lines():
    for i in range(1_000_000_000):
        yield f"line {i}"

errors = (line for line in read_lines() if line.endswith("7"))
print(list(itertools.islice(errors, 3)))   # ['line 7', 'line 17', 'line 27']
```

Only 28 lines were ever produced; `islice` stopped pulling after three matches. A list comprehension in the same place would try to build a billion strings first. Generator expressions (parentheses instead of square brackets) are the one-line version, and `itertools` has the building blocks: `islice`, `chain`, `groupby`, `batched` (3.12+), `pairwise` and more.

The price of laziness is that iterators are single-use and have no length:

```python
squares = (x * x for x in range(3))
print(sum(squares), sum(squares))   # 5 0
```

The second `sum` gets an exhausted iterator and silently returns 0. If you need several passes or `len()`, materialise the data with `list()`.

## Generators as coroutines

Generators can also receive values: `value = yield item` pauses, and `gen.send(x)` resumes with `x` as the result of the `yield`. That two-way pausing is the idea Python's `async`/`await` coroutines are built on. They are a separate type now, but an event loop still drives them by resuming each one until it next has to wait.
