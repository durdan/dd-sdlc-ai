---
id: dsa-heaps
title: Heaps and priority queues
summary: Always know the smallest item, cheaply
why: Schedulers, timers, Dijkstra's shortest paths, merging sorted streams and "top 10" queries all need the next-most-important item without sorting everything.
requires: [dsa-trees]
lesson: lanes
points:
  - title: A tree stored in an array
    text: "A binary heap is a complete binary tree laid out level by level: the children of index i are at 2i + 1 and 2i + 2, its parent at (i − 1) / 2, rounded down."
  - title: Parents beat children
    text: In a min-heap every parent is ≤ its children, so the minimum is always at index 0. Nothing else is sorted.
  - title: O(log n) push and pop
    text: Push adds a leaf and swaps it upwards; pop moves the last leaf to the root and swaps it downwards. Both walk one path.
  - title: A priority queue is the interface
    text: '"Insert" and "remove the most urgent" is the abstract idea; a binary heap is the usual way to build it.'
quiz_hint: Follow the new item along one path, comparing it only with its parent (on push) or its smaller child (on pop).
quiz:
  - q: In a min-heap stored as an array, where is the parent of the item at index 9?
    options: [Index 4, Index 8, Index 18]
    answer: 0
    explain: The parent is at Math.floor((9 − 1) / 2) = 4. Its children would be at 2 × 9 + 1 = 19 and 20.
  - q: Is the array of a valid min-heap sorted?
    options: ["Yes, always", "Only partly: each parent is ≤ its children, but siblings and cousins can be in any order", It is sorted in descending order]
    answer: 1
    explain: The trace above ends with [1, 3, 8, 5], which is a valid heap and not sorted. That weaker order is why heap operations are O(log n) instead of O(n).
  - q: You need the 10 largest values from a stream of a billion numbers. What is the memory-efficient approach?
    options: [Sort them all and take the last 10, "A min-heap of size 10: push each value and pop the smallest whenever the heap holds 11", A hash set of all values]
    answer: 1
    explain: The heap always holds the 10 largest seen so far, and its root is the smallest of them, the one to evict. That is O(n log k) time and O(k) memory.
links:
  - { title: "Priority queues (Sedgewick and Wayne, Algorithms 4th ed., section 2.4)", url: "https://algs4.cs.princeton.edu/24pq/" }
  - { title: "heapq: heap queue algorithm (Python docs)", url: "https://docs.python.org/3/library/heapq.html" }
  - { title: "PriorityQueue (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html" }
---
A priority queue lets you add items in any order and always take out the smallest (or most urgent) one next. The standard way to build it is a binary heap: a binary tree, stored flat in an array, where every parent is smaller than or equal to its children. That partial order is cheap to maintain, O(log n) per insert or removal, and it is all you need to find the minimum, which always sits at index 0.

```trace lanes
id: heap-push
title: Pushing into a min-heap
subtitle: "Sift up: swap with the parent until the parent is smaller"
run: any
module: cjs
code: |
  const heap = [];
  function push(x) {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }
  for (const x of [5, 3, 8, 1]) push(x);
  console.log(heap.join(" "));
lanes:
  - { id: incoming, title: Still to push, kind: queue, tone: muted }
  - { id: heap, title: "Heap array (index 0 first)", hint: "Children of index i live at 2i + 1 and 2i + 2", kind: queue, tone: violet }
  - { id: cmp, title: Comparing, hint: The new item and its parent, kind: plain, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. The heap is an ordinary array; the tree exists only in the index arithmetic.
  - line: 12
    caption: Four values will be pushed one at a time.
    state: { incoming: [{ id: v5, label: "5" }, { id: v3, label: "3" }, { id: v8, label: "8" }, { id: v1, label: "1" }] }
  - line: 3
    caption: 5 goes to the end of the array, index 0. It is the root, so there is no parent to compare with and the loop doesn't run.
    state:
      incoming: [{ id: v3, label: "3" }, { id: v8, label: "8" }, { id: v1, label: "1" }]
      heap: [{ id: v5, label: "5" }]
  - line: 3
    caption: 3 is appended at index 1, so it becomes the left child of the root.
    state:
      incoming: [{ id: v8, label: "8" }, { id: v1, label: "1" }]
      heap: [{ id: v5, label: "5" }, { id: v3, label: "3" }]
      cmp: [{ id: c, label: "i = 1, parent = (1 − 1) >> 1 = 0" }]
  - line: 7
    caption: The parent holds 5 and the new item 3. 5 > 3, so the order is wrong.
    state: { cmp: [{ id: c, label: "heap[0] = 5 > heap[1] = 3" }] }
  - line: 8
    caption: They swap. 3 is now the root and i moves up to 0, which ends the loop.
    state:
      heap: [{ id: v3, label: "3" }, { id: v5, label: "5" }]
      cmp: [{ id: c, label: "i = 0: reached the root" }]
  - line: 7
    caption: 8 is appended at index 2, the root's right child. Its parent is 3, and 3 ≤ 8, so it stays put after a single comparison.
    state:
      incoming: [{ id: v1, label: "1" }]
      heap: [{ id: v3, label: "3" }, { id: v5, label: "5" }, { id: v8, label: "8" }]
      cmp: [{ id: c, label: "heap[0] = 3 ≤ heap[2] = 8: break" }]
  - line: 3
    caption: 1 is appended at index 3, the left child of index 1.
    state:
      incoming: []
      heap: [{ id: v3, label: "3" }, { id: v5, label: "5" }, { id: v8, label: "8" }, { id: v1, label: "1" }]
      cmp: [{ id: c, label: "i = 3, parent = (3 − 1) >> 1 = 1" }]
  - line: 8
    caption: Its parent holds 5, and 5 > 1, so they swap. i becomes 1.
    state:
      heap: [{ id: v3, label: "3" }, { id: v1, label: "1" }, { id: v8, label: "8" }, { id: v5, label: "5" }]
      cmp: [{ id: c, label: "heap[1] = 5 > heap[3] = 1: swap" }]
  - line: 8
    caption: The new parent is the root, 3, and 3 > 1, so they swap again. 1 has climbed two levels to the top, one comparison per level.
    state:
      heap: [{ id: v1, label: "1" }, { id: v3, label: "3" }, { id: v8, label: "8" }, { id: v5, label: "5" }]
      cmp: [{ id: c, label: "heap[0] = 3 > heap[1] = 1: swap, i = 0" }]
  - line: 13
    caption: All four are in. The minimum, 1, is at index 0.
    state: { cmp: [] }
    log: 1 3 8 5
  - caption: "Done. The array is not sorted (8 comes before 5), but every parent is ≤ its children: 1 ≤ 3, 1 ≤ 8 and 3 ≤ 5. Each push walked at most one path, so it costs O(log n)."
note: Popping the minimum is the mirror image. Move the last item to index 0, then swap it with its smaller child until both children are larger.
expect: ["1 3 8 5"]
```

## Pop: sift down

Removing the minimum takes the item at index 0, moves the last leaf into its place and pushes it down, swapping with the smaller of its two children until neither child is smaller. Again one path, so O(log n):

```js run
class MinHeap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }
  push(x) {
    const a = this.items;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {                               // sift up
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;                                // move the last leaf to the root
      let i = 0;
      while (true) {                              // sift down
        const l = 2 * i + 1, r = l + 1;
        let smallest = i;
        if (l < a.length && a[l] < a[smallest]) smallest = l;
        if (r < a.length && a[r] < a[smallest]) smallest = r;
        if (smallest === i) break;
        [a[i], a[smallest]] = [a[smallest], a[i]];
        i = smallest;
      }
    }
    return top;
  }
}

const h = new MinHeap();
for (const x of [5, 3, 8, 1, 9, 2]) h.push(x);
const out = [];
while (h.size) out.push(h.pop());
console.log(out.join(" "));                     // 1 2 3 5 8 9

// Top 3 largest of a stream, keeping only 3 items in memory.
function topK(stream, k) {
  const heap = new MinHeap();
  for (const x of stream) {
    heap.push(x);
    if (heap.size > k) heap.pop();                // drop the smallest of the k + 1
  }
  return heap.items.sort((a, b) => b - a);
}
console.log(topK([42, 7, 19, 88, 3, 61, 25, 90, 14], 3));   // [ 90, 88, 61 ]
```

Popping everything returns the items in sorted order. That is heapsort: O(n log n), in place, but not stable, and it jumps around memory, so in practice it is mostly used as a safety net inside other sorts.

## Where heaps show up

- **Schedulers and timers**: the next job or timeout to fire is the minimum by time. Many event loops keep their timers in a heap.
- **Dijkstra's algorithm and A\***: the next node to explore is the one with the smallest known distance.
- **Merging k sorted lists**: keep the head of each list in a heap and repeatedly take the smallest (`heapq.merge` in Python).
- **Top-k**: a min-heap of size k over a stream, as above, uses O(k) memory however long the stream is.

Building a heap from n items you already have can be done in O(n), not O(n log n), by sifting down from the middle of the array to the front (`heapq.heapify`). Python's `heapq` works on plain lists as a min-heap; Java has `PriorityQueue`; JavaScript has no built-in heap, so you write one like the above or use a library. A heap can't find or remove an arbitrary item quickly, so to change a priority you usually push a new entry and skip stale ones when they come out.
