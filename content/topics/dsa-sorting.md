---
id: dsa-sorting
title: Sorting, and which sort your language uses
summary: Timsort for stability, introsort for raw speed, and why
why: You will almost never write a sort, but you will rely on whether the built-in one is stable, how it compares values and what it costs on nearly sorted data.
requires: [dsa-heaps, dsa-recursion]
lesson: none
points:
  - title: n log n is the floor
    text: Any sort that only compares pairs of items needs on the order of n log n comparisons in the worst case.
  - title: Stability matters
    text: A stable sort keeps items that compare equal in their original order, so you can sort by one key and then another.
  - title: Timsort exploits order
    text: Python, Java (for objects) and V8 use Timsort, a merge sort that finds already-sorted runs. Sorted input costs O(n).
  - title: Introsort guards quicksort
    text: C++ std::sort and .NET's Array.Sort use quicksort, switching to heapsort if recursion gets too deep and to insertion sort for small slices.
quiz_hint: Ask whether equal items must keep their order, and whether the data is already partly sorted.
quiz:
  - q: What does `[10, 9, 1, 100].sort()` return in JavaScript?
    options: ["[1, 9, 10, 100]", "[1, 10, 100, 9]", "[100, 10, 9, 1]"]
    answer: 1
    explain: Without a comparator, Array.prototype.sort converts items to strings and compares them as text, and "100" sorts before "9". Pass (a, b) => a - b for numbers.
  - q: You sort users by name, then sort the result by team with a stable sort. What order are users within one team in?
    options: [Random, By name, Reversed by name]
    answer: 1
    explain: A stable sort never reorders items that compare equal, so within each team the earlier name order survives. Since ES2019 JavaScript requires Array.prototype.sort to be stable.
  - q: Why does introsort switch from quicksort to heapsort when recursion gets deep?
    options:
      - Heapsort is faster on average
      - Deep recursion signals bad pivots heading towards quicksort's O(n²) worst case; heapsort guarantees O(n log n)
      - Heapsort is stable
    answer: 1
    explain: Quicksort is very fast on average but degrades on unlucky or adversarial input. Capping the depth at about 2 log n and falling back to heapsort keeps the worst case at O(n log n).
links:
  - { title: "listsort.txt: Timsort and powersort in CPython (Tim Peters)", url: "https://github.com/python/cpython/blob/main/Objects/listsort.txt" }
  - { title: "Getting things sorted in V8 (V8 blog)", url: "https://v8.dev/blog/array-sort" }
  - { title: "Arrays.sort (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html" }
  - { title: "Array.Sort (.NET API documentation)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.array.sort?view=net-8.0" }
---
Every mainstream language ships a sort that is better than anything you would write in an afternoon, and they don't all use the same algorithm. Python, Java (for object arrays) and JavaScript's V8 use Timsort, a stable merge sort that takes advantage of order already in the data. C++'s `std::sort` and .NET's `Array.Sort` use introsort, an unstable quicksort with safety nets. The differences show up as stability guarantees, worst cases and speed on nearly sorted input.

## The ground rules

A comparison sort learns about the data only by comparing pairs. There are n! possible orderings of n items, and each comparison at best halves the possibilities, so any comparison sort needs about log₂(n!) ≈ n log₂ n comparisons in the worst case. Merge sort, heapsort and Timsort reach that bound; quicksort reaches it on average.

Two properties matter as much as speed:

- **Stability**: items that compare equal stay in their original order. That lets you sort by a secondary key first and the primary key second, and it makes results predictable.
- **Extra memory**: merge-based sorts need a buffer of up to n/2 items; quicksort and heapsort sort in place.

```js run
console.log([10, 9, 1, 100].sort());                 // [ 1, 10, 100, 9 ]: compared as strings
console.log([10, 9, 1, 100].sort((a, b) => a - b));  // [ 1, 9, 10, 100 ]

const people = [
  { name: "Ana", team: "red" },
  { name: "Ben", team: "blue" },
  { name: "Cy", team: "red" },
  { name: "Dee", team: "blue" },
];
// Already in name order. A stable sort by team keeps names in order within each team.
const byTeam = people.slice().sort((a, b) => a.team.localeCompare(b.team));
console.log(byTeam.map((p) => p.team + ":" + p.name).join(" "));   // blue:Ben blue:Dee red:Ana red:Cy
```

## Timsort: Python, Java objects, V8

Tim Peters wrote Timsort for Python in 2002. It scans the array for **runs**, stretches that are already ascending (or strictly descending, which it reverses), extends short runs to a minimum length with binary insertion sort, and merges runs pairwise using a stack of pending runs. When merging, it "gallops", jumping ahead exponentially when one run keeps winning. Real data is full of runs (appended logs, mostly sorted lists, concatenated sorted chunks), so Timsort often does far fewer than n log n comparisons:

```js run
function countComparisons(arr) {
  let n = 0;
  arr.slice().sort((a, b) => { n++; return a - b; });
  return n;
}
const size = 100_000;
const sorted = Array.from({ length: size }, (_, i) => i);
const random = sorted.map(() => Math.random());
console.log("already sorted:", countComparisons(sorted));   // 99999: one run, n - 1 comparisons
console.log("random:", (countComparisons(random) / 1e6).toFixed(1), "million");   // about 1.5 million
```

On random data the count is close to n log₂ n (about 1.66 million for n = 100,000); on sorted data it is n − 1. Java's `Arrays.sort` for object arrays (and `Collections.sort`) is a Timsort adapted from Python's, V8 switched `Array.prototype.sort` to Timsort in V8 7.0 (Chrome 70), and since 3.11 CPython chooses which runs to merge with the "powersort" policy. ECMAScript has required `sort` to be stable since ES2019.

## Introsort: C++ and .NET

Quicksort picks a pivot, partitions the array into smaller and larger items, and recurses into both sides. It is in place and very cache-friendly, which makes it fast on average, but bad pivots give O(n²). **Introsort** keeps quicksort's speed and removes that risk: it tracks recursion depth and switches to heapsort once the depth passes about 2 log₂ n, and it finishes small partitions (16 items or fewer in .NET) with insertion sort. .NET's `Array.Sort` documentation describes exactly this, and C++ implementations use it to meet the standard's O(n log n) requirement for `std::sort`. Neither is stable; C++ offers `std::stable_sort` when you need it.

Java uses a different trick for primitive arrays: `Arrays.sort(int[])` is a dual-pivot quicksort. Stability means nothing for plain numbers, since two equal ints are indistinguishable.

## What this means for you

Use the built-in sort, always with an explicit comparator for numbers in JavaScript. If you need a stable sort and your language doesn't promise one, add the original index as a tie-breaker. Sort once and keep the data sorted (insert with binary search, or use a sorted structure) rather than re-sorting on every request. If you only need the top k items, a heap is cheaper than a full sort.
