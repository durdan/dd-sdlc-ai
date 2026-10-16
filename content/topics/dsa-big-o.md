---
id: dsa-big-o
title: Big-O in practice
summary: How cost grows with input, and what the notation leaves out
why: It is the quickest way to tell whether code that is fine on 100 rows will fall over on 10 million, as long as you remember what it hides.
requires: []
lesson: none
points:
  - title: Growth, not speed
    text: O(n) says the work grows in proportion to the input. It says nothing about how long one step takes.
  - title: Keep the biggest term
    text: 3n² + 50n + 7 is O(n²). For large inputs the largest term dominates and constant factors are dropped.
  - title: Constants still matter
    text: Memory layout, allocation and cache misses can make an O(n) structure several times slower than another O(n) structure.
  - title: Say which case
    text: Worst case, average case and amortised cost can differ. A hash lookup is O(1) on average and O(n) in the worst case.
quiz_hint: Find the loop or recursion that depends on n, and ask how many times it runs as n doubles.
quiz:
  - q: An O(n log n) function takes 1 second for a million items. Roughly how long for two million?
    options: [About 1 second, A little over 2 seconds, 4 seconds]
    answer: 1
    explain: Doubling n doubles the n part and adds one to log₂ n (about 20 to 21), so the time grows by about 2.1x. A quadratic algorithm would take 4 seconds.
  - q: Which loop is O(log n)?
    code: |
      for (let i = 0; i < n; i++) {}          // A
      for (let i = n; i > 1; i = Math.floor(i / 2)) {}   // B
      for (let i = 0; i < n * n; i++) {}      // C
    options: [A, B, C]
    answer: 1
    explain: B halves i each time, so it runs about log₂ n times. A is O(n) and C is O(n²).
  - q: Two algorithms are both O(n). Can one still be ten times faster than the other?
    options: ["No, the same Big-O means the same speed", "Yes: Big-O drops constant factors such as the cost of each step, memory access patterns and allocation"]
    answer: 1
    explain: Big-O only describes the shape of growth. For real decisions, measure; for scaling decisions, Big-O tells you which measurement will still hold at 100x the data.
links:
  - { title: "Analysis of algorithms (Sedgewick and Wayne, Algorithms 4th ed.)", url: "https://algs4.cs.princeton.edu/14analysis/" }
  - { title: "Big O notation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Big_O_notation" }
---
Big-O notation describes how the work an algorithm does grows as its input grows. O(1) means the cost doesn't depend on the input size, O(n) means it grows in step with it, O(n²) means doubling the input quadruples the work. It is a statement about the shape of the curve, not about speed, so it is most useful for asking "what happens at 100 times the data?" and least useful for choosing between two things with the same shape.

## Counting steps

The notation comes from counting the basic steps an algorithm takes in terms of the input size n, then keeping only the fastest-growing term. Here are three loops side by side:

```js run
function countSteps(n) {
  let linear = 0, quadratic = 0, logarithmic = 0;
  for (let i = 0; i < n; i++) linear++;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) quadratic++;
  for (let i = n; i > 1; i = Math.floor(i / 2)) logarithmic++;
  return { n, logarithmic, linear, quadratic };
}
for (const n of [10, 100, 1000]) console.log(countSteps(n));
```

At n = 1000 the halving loop runs 9 times, the single loop 1,000 times and the nested loop a million times. That gap only widens. The common classes, from cheapest to most expensive, are O(1), O(log n) (halving: binary search, balanced trees), O(n) (one pass), O(n log n) (good sorting), O(n²) (comparing every pair) and O(2ⁿ) (trying every subset).

Formally, f(n) is O(g(n)) if f(n) ≤ c·g(n) for some constant c once n is large enough. That makes Big-O an upper bound; people usually mean the tight bound (Θ) when they say it, and this path does too.

## What the notation hides

**Constant factors.** O(n) with a cheap step and O(n) with an expensive step are the same class. A loop over a JavaScript array of numbers and a loop over a linked list of the same numbers are both O(n), but the array is read from consecutive memory that the CPU prefetches into cache, while each list node can sit anywhere and costs a separate memory fetch. On real hardware that difference is easily several times, and in the linked lists topic, with nodes scattered across the heap, it is close to a hundred.

**Small n.** For small inputs a "worse" algorithm with tiny constants often wins. Production sorting routines switch to insertion sort, which is O(n²), for short runs for exactly this reason.

**Memory.** Big-O is usually quoted for time. An algorithm that is fast but needs O(n) extra memory, such as merge sort, may be the wrong choice when n is a billion rows.

**Which case.** Quicksort is O(n log n) on average but O(n²) in the worst case. A hash table lookup is O(1) on average but O(n) when every key collides. Appending to a dynamic array is O(n) when it has to grow, but **amortised** O(1), meaning the total cost of n appends is O(n). Always ask which of these a claim is about.

## Using it well

Use Big-O to rule things out early: a nested loop over two tables of a million rows each is a trillion steps, whatever language you write it in. Then measure the candidates that survive, with realistic data sizes, because constants, caches and the shape of real data decide the rest.
