---
id: dsa-binary-search
title: Binary search and its bugs
summary: Halve a sorted range until one place is left
why: It finds anything in a sorted array of a billion items in about 30 steps, and it is famously easy to get subtly wrong.
requires: [dsa-arrays]
lesson: none
points:
  - title: Sorted input, halving steps
    text: Compare with the middle element and throw away the half that can't contain the answer. O(log n) comparisons.
  - title: Pick one invariant and keep it
    text: Decide what lo and hi mean (for example, a half-open range [lo, hi)) and make every line preserve exactly that.
  - title: Find a boundary, not just a match
    text: Asking for the first index whose value is ≥ target handles duplicates, insertion points and "not found" in one function.
  - title: Mind the midpoint
    text: In fixed-width integer arithmetic, (lo + hi) / 2 can overflow. lo + (hi - lo) / 2 cannot.
quiz_hint: Write down what lo and hi mean, then check that each branch keeps that true and that the range always shrinks.
quiz:
  - q: About how many comparisons does binary search need on a sorted array of one billion elements?
    options: [About 30, "About 1,000", About 500 million]
    answer: 0
    explain: 2³⁰ is about 1.07 billion, so 30 halvings narrow a billion candidates down to one.
  - q: "With the half-open range [lo, hi), why must the update be `hi = mid` and not `hi = mid - 1`?"
    options:
      - It is only a style choice
      - hi is excluded from the range, so hi = mid already excludes mid; mid - 1 would also throw away an element that might be the answer
      - mid - 1 causes an overflow
    answer: 1
    explain: Mixing conventions (half-open bounds with closed-range updates) is the most common binary search bug. It either skips the answer or loops forever.
  - q: In Java, `int mid = (low + high) / 2` broke for very large arrays. Why?
    options: [Integer division rounds the wrong way, "low + high can exceed the largest int (2³¹ − 1) and wrap around to a negative number", Arrays that large are not allowed]
    answer: 1
    explain: Joshua Bloch described the bug in 2006; it had been in the JDK's binarySearch for years and only showed up for arrays of about 2³⁰ elements or more. low + (high - low) / 2, or an unsigned shift, avoids it.
links:
  - { title: "Nearly all binary searches and mergesorts are broken (Joshua Bloch, Google Research blog)", url: "https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/" }
  - { title: "bisect: array bisection algorithm (Python docs)", url: "https://docs.python.org/3/library/bisect.html" }
  - { title: "Binary search (Sedgewick and Wayne, Algorithms 4th ed., section 3.1)", url: "https://algs4.cs.princeton.edu/31elementary/" }
  - { title: "Binary search (Wikipedia)", url: "https://en.wikipedia.org/wiki/Binary_search" }
---
Binary search finds a value in a sorted array by looking at the middle element and discarding the half that can't contain the answer, again and again, until one position is left. Each step halves the remaining range, so a billion items need about 30 comparisons. The idea fits in one sentence, but the details are where implementations go wrong: off-by-one bounds, infinite loops and, in some languages, integer overflow.

## Search for a boundary

The most useful form doesn't ask "is the target here?" but "where is the first element that is ≥ target?" That one function, usually called lower bound (`bisect_left` in Python, `std::lower_bound` in C++), answers several questions at once: whether the target is present, where its first copy is, and where it would be inserted to keep the array sorted.

```js run
// Returns the first index whose value is >= target (arr.length if none).
function lowerBound(arr, target) {
  let lo = 0;
  let hi = arr.length;              // half-open range [lo, hi)
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const sorted = [2, 3, 3, 3, 8, 13, 21];
console.log(lowerBound(sorted, 3));    // 1: the first 3, not just any 3
console.log(lowerBound(sorted, 4));    // 4: where 4 would be inserted
console.log(lowerBound(sorted, 99));   // 7: past the end means "not found"
```

The invariant is: everything before `lo` is less than the target, and everything from `hi` onwards is greater than or equal to it. The answer is always in `[lo, hi]`. When `arr[mid] < target`, `mid` belongs to the "less than" part, so `lo = mid + 1`. Otherwise `mid` might be the answer, so `hi = mid` keeps it. Each iteration shrinks the range by at least one, so the loop ends, and when `lo === hi` that is the boundary.

## The usual bugs

- **Mixed conventions.** Using a closed range `[lo, hi]` (`hi = length - 1`, `while (lo <= hi)`) is fine, and so is a half-open one. Mixing their update rules skips elements or loops forever when two elements are left.
- **Returning any match.** A "return as soon as `arr[mid] === target`" search finds *a* match. With duplicates you usually want the first or last.
- **Unsorted input.** Binary search on data that isn't sorted by the same comparison returns nonsense without any error. Sort with the same comparator you search with.
- **Overflow.** In Java, C and C++, `(lo + hi) / 2` overflows when `lo + hi` exceeds the largest integer. Joshua Bloch wrote in 2006 that the JDK's own `binarySearch` had this bug, and it only appeared for arrays of about 2³⁰ elements. JavaScript numbers are doubles, so `Math.floor((lo + hi) / 2)` is safe for any array length, but the popular shortcut `(lo + hi) >> 1` converts to a 32-bit integer and goes negative:

```js run
const lo = 2 ** 30, hi = 2 ** 31 - 1;
console.log((lo + hi) >> 1, lo + ((hi - lo) >> 1));   // -536870913 1610612735
```

## Test it against something obviously right

Binary search is easy to check: compare it with a linear scan on thousands of small random inputs, including empty arrays, duplicates and targets outside the range.

```js run
function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
for (let trial = 0; trial < 10_000; trial++) {
  const arr = Array.from({ length: Math.floor(Math.random() * 20) }, () => Math.floor(Math.random() * 10)).sort((a, b) => a - b);
  const target = Math.floor(Math.random() * 12) - 1;
  const expected = arr.findIndex((x) => x >= target);
  const want = expected === -1 ? arr.length : expected;
  if (lowerBound(arr, target) !== want) throw new Error("mismatch: " + arr + " " + target);
}
console.log("10,000 random checks passed");
```

## Beyond arrays

The same halving works on anything monotonic: the first version where a test fails (`git bisect`), the smallest buffer size that is fast enough, or the square root of a number to a given precision. If you can answer "is the answer at or below x?" with yes or no, and the answers flip from no to yes exactly once, you can binary search it.
