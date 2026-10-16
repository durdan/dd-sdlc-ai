---
id: csf-memory-hierarchy
title: The memory hierarchy and caches
summary: Registers are instant, RAM is a long walk, and caches hide the difference
why: "Most code is limited by memory, not arithmetic. Knowing how caches work explains why arrays beat linked lists and why the loop order can change speed several times over."
requires: [csf-cpu]
lesson: none
points:
  - title: A ladder of speeds
    text: "Registers, then L1, L2 and L3 cache, then main memory, then SSD and network. Each step down is bigger and slower, by up to orders of magnitude."
  - title: Cache lines
    text: "Memory moves in blocks of 64 bytes on most current CPUs. Reading one byte brings its neighbours along for free."
  - title: Locality wins
    text: "Code that touches nearby addresses (spatial locality) or the same data again soon (temporal locality) mostly hits the cache."
  - title: Prefetching rewards patterns
    text: "The hardware spots sequential or strided access and fetches ahead. Pointer chasing defeats it, because the next address isn't known until the load finishes."
quiz:
  - q: "Roughly how much slower is a read from main memory than from L1 cache?"
    options: ["About 2 times", "About 100 times", "About a million times"]
    answer: 1
    explain: "L1 is about a nanosecond or less (a few cycles); DRAM is on the order of 100 ns. That is why a cache miss can cost more than hundreds of arithmetic instructions."
  - q: "Summing a 2048 × 2048 grid stored row by row, why is the row-by-row loop faster than column-by-column?"
    options:
      - "Rows are shorter than columns"
      - "Row order reads consecutive addresses, so each 64-byte line serves 8 doubles and the prefetcher can run ahead; column order jumps 16 KB each step"
      - "JavaScript optimises only the first loop"
    answer: 1
    explain: "In this topic's run, row order took about 3 to 5 ms and column order about 10 to 14 ms. Same arithmetic, different memory traffic."
  - q: Why does iterating a linked list usually lose to iterating an array of the same values, even though both are O(n)?
    options:
      - "Linked lists have a higher Big-O"
      - "Each node can be anywhere in memory, so every step may be a cache miss, and the CPU can't prefetch an address it hasn't loaded yet"
      - "Arrays are stored in registers"
    answer: 1
    explain: "Big-O counts steps, not the cost of each step. Pointer chasing serialises memory latency; arrays stream."
links:
  - { title: "Ulrich Drepper: What Every Programmer Should Know About Memory (PDF)", url: "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf" }
  - { title: "Latency numbers every programmer should know, by year (interactive)", url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html" }
  - { title: "Agner Fog: Optimizing software in C++ (chapter on memory and caches)", url: "https://www.agner.org/optimize/optimizing_cpp.pdf" }
---
A CPU core can do several operations per nanosecond, but fetching a value from main memory (DRAM) takes on the order of 100 nanoseconds. Without help, the core would spend almost all its time waiting. The help is a hierarchy of caches: small, fast memories next to the core that keep copies of recently used data. When the data is in cache, a load takes a few cycles; when it isn't, the core stalls. Whether your code is fast is often decided by how it walks through memory.

## The ladder

Approximate figures for a current desktop or server core (they vary by chip and change slowly):

| Level | Typical size | Typical latency |
| --- | --- | --- |
| Registers | a few hundred bytes | 0 to 1 cycle |
| L1 cache (per core) | 32 to 64 KB of data | about 1 ns (4 to 5 cycles) |
| L2 cache (per core) | 1 to 2 MB | about 3 to 5 ns |
| L3 cache (shared) | tens of MB | about 10 to 20 ns |
| Main memory | GBs | about 80 to 120 ns |
| NVMe SSD read | TBs | tens of microseconds |
| Round trip in one data centre | | about 0.5 ms |

The jump from cache to RAM is the one that matters for ordinary code. Two more facts make it manageable. Memory moves in **cache lines**, usually 64 bytes: load one `double` and the next seven come with it. And **hardware prefetchers** watch the addresses you load; if they see a sequential or regular stride, they fetch lines before you ask.

## Locality, measured

A 2048 × 2048 grid of doubles stored row after row in one array is 32 MB, larger than the caches. Summing it in two orders:

```js run
const n = 2048;
const grid = new Float64Array(n * n).fill(1);
function rowMajor() {
  let sum = 0;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) sum += grid[r * n + c];   // next address: +8 bytes
  return sum;
}
function columnMajor() {
  let sum = 0;
  for (let c = 0; c < n; c++)
    for (let r = 0; r < n; r++) sum += grid[r * n + c];   // next address: +16 KB
  return sum;
}
for (const f of [rowMajor, columnMajor, rowMajor, columnMajor]) {
  const t = performance.now();
  const s = f();
  console.log(f.name, s, (performance.now() - t).toFixed(1), "ms");
}
```

On a Mac laptop with Node 22, row order took 3 to 5 ms and column order 10 to 14 ms over several runs. The arithmetic is identical. Row order uses all 8 values of every cache line it loads and gives the prefetcher a simple pattern; column order uses one value per line and jumps 16 KB at a time. The gap depends on the machine (big caches and clever prefetchers narrow it), so run it yourself.

## Why arrays beat linked lists

A linked list stores each node in its own allocation, wherever the allocator put it. Walking the list means loading a node to learn the address of the next one, so each step can be a full cache miss, and the prefetcher can't help because the next address isn't known until the current load completes. An array of the same values streams through memory at full speed. That is why dynamic arrays, hash tables with open addressing, and B-trees (wide nodes, few pointer hops) dominate real systems, as the data structures path shows.

The same ideas apply higher up the ladder: a database page cache, a CDN and an in-process memoisation map are all caches that pay off only when access has locality.
