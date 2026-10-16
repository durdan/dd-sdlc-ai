---
id: dsa-arrays
title: Arrays and dynamic arrays
summary: One block of memory, and the trick that makes push cheap
why: The array is the default data structure in every language for good reason; knowing its costs tells you when push is free and when unshift is a disaster.
requires: [dsa-big-o]
lesson: none
points:
  - title: Contiguous memory
    text: Elements sit side by side, so element i is at start + i × size. Reading any index is O(1), and scanning is cache-friendly.
  - title: Fixed capacity underneath
    text: A dynamic array (JS Array, Python list, Java ArrayList) keeps a block with spare room and tracks how much of it is used.
  - title: Grow by a factor
    text: When full it allocates a bigger block, copies everything, and frees the old one. Growing by a multiple keeps the average cost of push O(1).
  - title: The front is expensive
    text: Inserting or removing at the start shifts every element, which is O(n) per operation.
quiz_hint: Picture the elements as a row of boxes with no gaps, and ask how many boxes have to move.
quiz:
  - q: A dynamic array doubles its capacity when it is full. What is the total copying cost of n pushes, starting empty?
    options: ["O(n log n)", "O(n): fewer than 2n copies in total, so O(1) amortised per push", "O(n²)"]
    answer: 1
    explain: The copies are 1 + 2 + 4 + … up to n, which sums to less than 2n. Each push pays a constant amount on average, even though one push occasionally costs O(n).
  - q: What if the array grew by a fixed 10 slots each time instead of doubling?
    options: [Still O(1) amortised, "Pushes become O(n) amortised, so n pushes cost O(n²)", It uses more memory but is faster]
    answer: 1
    explain: With constant growth you copy about n/10 times, and each copy moves up to n elements, so the total is quadratic. The growth must be proportional to the current size.
  - q: Why is `arr.unshift(x)` on a large array much slower than `arr.push(x)`?
    options: [unshift allocates a new array every time, "Every existing element has to move one place to the right to make room at index 0", unshift sorts the array]
    answer: 1
    explain: In this topic's example, 100,000 unshifts took several hundred times longer than 100,000 pushes. If you need cheap insertion at both ends, use a ring buffer (a deque).
links:
  - { title: "Resizing arrays (Sedgewick and Wayne, Algorithms 4th ed., section 1.3)", url: "https://algs4.cs.princeton.edu/13stacks/" }
  - { title: "How are lists implemented in CPython? (Python design FAQ)", url: "https://docs.python.org/3/faq/design.html#how-are-lists-implemented-in-cpython" }
  - { title: "ArrayList (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html" }
  - { title: "Dynamic array (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dynamic_array" }
---
An array stores its elements in one contiguous block of memory, so the address of element i is simply the start address plus i times the element size. That makes indexing O(1) and scanning very fast, because the processor reads memory in cache lines and prefetches the next ones. The catch is that a block has a fixed size. Dynamic arrays (a JavaScript `Array`, a Python `list`, a Java `ArrayList`, a C++ `std::vector`) hide that by over-allocating and moving to a bigger block when they run out of room.

## Amortised growth

A dynamic array keeps two numbers: its **length** (elements in use) and its **capacity** (slots allocated). `push` writes into the next free slot, which is O(1). When length reaches capacity, it allocates a larger block, copies every element across, and frees the old one, which is O(n) for that one push. The trick is to grow by a *factor*, not a fixed amount:

```js run
class DynArray {
  constructor() {
    this.capacity = 1;
    this.length = 0;
    this.slots = new Array(this.capacity);
    this.copies = 0;
  }
  push(value) {
    if (this.length === this.capacity) {
      this.capacity *= 2;                    // grow geometrically
      const bigger = new Array(this.capacity);
      for (let i = 0; i < this.length; i++) bigger[i] = this.slots[i];
      this.copies += this.length;
      this.slots = bigger;
    }
    this.slots[this.length++] = value;
  }
}

for (const n of [1_000, 1_000_000]) {
  const a = new DynArray();
  for (let i = 0; i < n; i++) a.push(i);
  console.log(n, "pushes,", a.copies, "copies,", (a.copies / n).toFixed(2), "per push");
}
```

A million pushes cause 1,048,575 element copies in total, about one per push. The expensive pushes happen at sizes 1, 2, 4, 8 … and their costs add up to less than twice the final size. That is what **amortised O(1)** means: any one push may be slow, but n pushes cost O(n) altogether.

Real implementations choose different factors to trade memory for copying. CPython's list grows by roughly one eighth plus a little, about 1.125x; Java's `ArrayList` documentation promises only that adding an element "has constant amortized time cost". Any factor above 1 gives the same Big-O. If you know the final size, pre-size the array (`new Array(n)` then fill it, `ArrayList(capacity)`, `[None] * n`) to skip the copies entirely.

## The cost of the front

Inserting at index 0 means moving every existing element one slot to the right. Removing from the front means moving them all left. Each is O(n), so doing it n times is O(n²):

```js run
const n = 100_000;
let t = performance.now();
const back = [];
for (let i = 0; i < n; i++) back.push(i);
console.log("push to the back:", (performance.now() - t).toFixed(1), "ms");
t = performance.now();
const front = [];
for (let i = 0; i < n; i++) front.unshift(i);
console.log("unshift to the front:", (performance.now() - t).toFixed(1), "ms");
```

In Node 22 on a laptop this took about 2 ms for the pushes and between 650 and 950 ms for the unshifts, depending on the run. Inserting in the middle (`splice`) has the same cost. When you need cheap operations at both ends, use a ring buffer: a fixed block with a head and tail index that wrap around, which is how Python's `collections.deque` and Java's `ArrayDeque` avoid shifting.

## Why arrays usually win

Even for operations where another structure has a better Big-O, arrays often win in practice: no per-element allocation, no pointers to follow, and the hardware is built to stream through consecutive memory. Reach for something else when you need cheap insertion in the middle, cheap removal at the front, or lookups by key rather than by position.
