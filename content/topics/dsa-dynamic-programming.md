---
id: dsa-dynamic-programming
title: Memoisation and dynamic programming
summary: Solve each subproblem once and remember the answer
why: It turns exponential brute force into polynomial time for diffs, spell checkers, route costs and scheduling, and memoisation is the same idea as every cache you run.
requires: [dsa-recursion, dsa-hash-tables]
lesson: none
points:
  - title: Overlapping subproblems
    text: If a recursive solution asks the same question many times, caching the answers removes the repeats.
  - title: Memoisation is top-down
    text: Keep the natural recursion and store each result in a map keyed by its arguments. Compute on first request, look up after that.
  - title: Tabulation is bottom-up
    text: Fill a table from the smallest subproblems upwards, in an order where everything a cell needs is already filled.
  - title: Often only the last row matters
    text: Many tables only look one row back, so you can keep two rows instead of the whole table.
quiz_hint: Write the answer in terms of answers to smaller inputs, then ask how many distinct smaller inputs there are.
quiz:
  - q: Naive recursive fib(30) makes about 2.7 million calls. How many does the memoised version make?
    options: [About 2.7 million, "31, one per distinct n from 0 to 30", About 900]
    answer: 1
    explain: There are only 31 distinct subproblems. Memoisation computes each once; every other request is a cache hit.
  - q: When is memoisation unsafe?
    options:
      - When the function is recursive
      - When the function's result depends on something other than its arguments, such as the time, a database or a global that changes
      - When the arguments are numbers
    answer: 1
    explain: A cache assumes the same arguments always give the same answer. Impure functions return stale results; that is cache invalidation, the hard part of every cache.
  - q: The edit distance table for strings of lengths m and n has (m + 1) × (n + 1) cells. Why can the implementation keep only two rows?
    options: [It gives an approximate answer, "Each cell depends only on the cell to its left and the two cells in the row above", Strings are always short]
    answer: 1
    explain: Once a row is complete, rows before the previous one are never read again, so memory drops from O(m × n) to O(n) while time stays O(m × n).
links:
  - { title: "functools.cache and lru_cache (Python docs)", url: "https://docs.python.org/3/library/functools.html#functools.cache" }
  - { title: "Dynamic programming, chapter 3 of Algorithms (Jeff Erickson, free PDF)", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf" }
  - { title: "Levenshtein distance (Wikipedia)", url: "https://en.wikipedia.org/wiki/Levenshtein_distance" }
  - { title: "Dynamic programming (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dynamic_programming" }
---
Dynamic programming is a way of solving a problem whose answer can be built from answers to smaller versions of the same problem, when those smaller versions repeat. Instead of recomputing them, you compute each one once and store it. Done lazily inside a recursive function, that is memoisation; done eagerly by filling a table from the bottom up, it is tabulation. Either way, an algorithm that would take exponential time often becomes quadratic or linear.

## Memoisation: cache the recursion

The textbook example is Fibonacci, where `fib(n) = fib(n − 1) + fib(n − 2)`. Written directly, `fib(30)` recomputes `fib(28)` twice, `fib(27)` three times and so on, so the number of calls grows exponentially. A cache keyed by `n` fixes it without changing the shape of the code:

```js run
let calls = 0;
function fibNaive(n) {
  calls++;
  return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}
console.log(fibNaive(30), "naive calls:", calls);           // 832040 naive calls: 2692537

function memoize(fn) {
  const cache = new Map();
  return function (n) {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}
calls = 0;
const fibMemo = memoize((n) => { calls++; return n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2); });
console.log(fibMemo(30), "memoised calls:", calls);         // 832040 memoised calls: 31
```

From 2.7 million calls to 31: one per distinct subproblem. Python has this built in as the `@functools.cache` decorator (and `@lru_cache(maxsize=…)` for a bounded version). Memoisation is only correct for **pure** functions, ones whose result depends only on their arguments. It is also the same idea as an application cache in front of a database, with the same hard question: when does a stored answer stop being true?

## Tabulation: fill a table

Memoised recursion still uses the call stack, and its depth can be a problem. Tabulation computes subproblems in an order where each one's inputs are already known, usually with plain loops. Edit distance, the minimum number of single-character inserts, deletes and substitutions to turn one string into another, is a good real example: it powers spell-check suggestions, fuzzy search and parts of diff tools.

Let `d[i][j]` be the distance between the first `i` characters of `a` and the first `j` of `b`. Turning nothing into `j` characters takes `j` inserts, so the first row is `0, 1, 2, …`. Every other cell is the cheapest of three moves: delete from `a` (`d[i−1][j] + 1`), insert into `a` (`d[i][j−1] + 1`), or substitute (`d[i−1][j−1]`, plus 1 if the characters differ). Each row only needs the row above it, so two rows are enough:

```js run
function editDistance(a, b) {
  // prev[j] = distance between the first i - 1 chars of a and the first j chars of b
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitute = prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, substitute);   // delete, insert, substitute
    }
    prev = cur;
  }
  return prev[b.length];
}
console.log(editDistance("kitten", "sitting"));   // 3
console.log(editDistance("recieve", "receive"));  // 2
```

"kitten" to "sitting" is 3: substitute k→s, substitute e→i, insert g. The table has O(m × n) cells, so the time is O(m × n); keeping two rows makes the memory O(n).

## Recognising a DP problem

Look for two properties. **Optimal substructure**: the best answer for the whole is built from the best answers for parts (the shortest route to C through B contains the shortest route to B). **Overlapping subproblems**: the same parts come up again and again. Typical shapes are prefixes of one or two sequences (edit distance, longest common subsequence, the problem behind `diff`), capacities (knapsack, making change with the fewest coins), and positions in a grid. Write the recurrence first, check how many distinct states it has, and that number times the work per state is your running time.
