---
id: csf-cpu
title: How a CPU runs your code
summary: Fetch, decode, execute, many instructions at once, guessing at every branch
why: "Knowing that a modern CPU overlaps and predicts instructions explains why the same loop can run several times faster on sorted data, and why 'fewer instructions' is not the same as 'faster'."
lesson: none
points:
  - title: The basic cycle
    text: "The CPU fetches the instruction at the program counter, decodes it, executes it, writes the result and moves on. Everything else is an optimisation of that loop."
  - title: Pipelines overlap work
    text: "Like an assembly line, different stages work on different instructions at the same time, so one instruction can finish per cycle or better."
  - title: Branches are guessed
    text: "To keep the pipeline full, the CPU predicts which way each branch goes and runs ahead. A wrong guess throws that work away and costs many cycles."
  - title: Out of order, then in order
    text: "Instructions run as soon as their inputs are ready, not strictly in program order, but their results become visible in program order."
quiz:
  - q: "In this topic's example, summing values of 128 or more over the same numbers took about 30 ms in random order and about 6 ms sorted. Why?"
    options:
      - "Sorted arrays use less memory"
      - "With sorted data the branch goes the same way for long runs, so the predictor is almost always right"
      - "The sort also computed the sum"
    answer: 1
    explain: "Random data makes the if unpredictable, so about half the guesses are wrong and each costs a pipeline flush. Sorted data gives one long run of 'no' then one long run of 'yes'."
  - q: What is a pipeline stall?
    options:
      - "The CPU overheating and slowing down"
      - "A stage that can't proceed, for example because it is waiting for an earlier instruction's result or for data from memory"
      - "The operating system pausing a process"
    answer: 1
    explain: "Dependencies and slow memory loads leave stages idle. Out-of-order execution reduces stalls by finding other independent instructions to run meanwhile."
  - q: "A CPU at 3 GHz retires on average 2 instructions per cycle. Roughly how many instructions per second is that?"
    options: ["6 million", "6 billion", "1.5 billion"]
    answer: 1
    explain: "3 × 10⁹ cycles per second × 2 instructions per cycle = 6 × 10⁹. Instructions per cycle (IPC) is the number profilers report; a cache miss or a mispredicted branch drags it down."
links:
  - { title: "Agner Fog: Software optimization resources (microarchitecture guides)", url: "https://www.agner.org/optimize/" }
  - { title: "CMU 15-213/18-213: Introduction to Computer Systems", url: "https://www.cs.cmu.edu/~213/" }
  - { title: "Agner Fog: The microarchitecture of Intel, AMD and VIA CPUs (PDF)", url: "https://www.agner.org/optimize/microarchitecture.pdf" }
---
A CPU core repeats one loop: fetch the instruction the program counter points to, decode it into the operation and its operands, execute it, write the result to a register or memory, and advance the program counter (or jump, if the instruction was a branch). A modern core still has that loop at heart, but runs it so aggressively in parallel that hundreds of instructions can be in flight at once, which is why the shape of your code can matter as much as how many operations it does.

## Pipelines

Executing one instruction takes several steps, and each needs different hardware. A pipeline lets them overlap: while instruction 1 executes, instruction 2 is being decoded and instruction 3 fetched, like cars on an assembly line. Modern cores go further. They are **superscalar** (several pipelines, so several instructions can start per cycle) and **out of order**: instructions wait in a buffer until their inputs are ready and then run, even if earlier instructions are still waiting for memory. Results are committed in program order, so the program can't tell, apart from the speed.

The enemy of a pipeline is not knowing what comes next. A load that misses the cache can take hundreds of cycles (the next topic), and a dependent instruction must wait for it. A branch is worse: until the condition is computed, the CPU doesn't know which instructions to fetch.

## Branch prediction

Rather than wait, the CPU guesses. A branch predictor remembers how each branch behaved recently and predicts the same pattern again; the core then runs speculatively down the predicted path. A correct guess costs nothing. A wrong one means discarding the speculative work and restarting, typically 15 to 20 cycles on current desktop cores.

```js run
const n = 1_000_000;
const data = new Int32Array(n);
for (let i = 0; i < n; i++) data[i] = (Math.random() * 256) | 0;
function sumBig(arr) {
  let sum = 0;
  for (let rep = 0; rep < 10; rep++)
    for (let i = 0; i < arr.length; i++)
      if (arr[i] >= 128) sum += arr[i];   // the branch being predicted
  return sum;
}
const sorted = data.slice().sort();
for (const [name, arr] of [["random", data], ["sorted", sorted], ["random", data], ["sorted", sorted]]) {
  const t = performance.now();
  const s = sumBig(arr);
  console.log(name, s, (performance.now() - t).toFixed(1), "ms");
}
```

On a Mac laptop with Node 22, the random array took about 30 ms per pass and the sorted one about 6 ms, the same work on the same numbers. With random values the `if` is a coin toss and the predictor is wrong about half the time. Sorted, it sees one long run of "skip" followed by one long run of "add". Your numbers will differ, and a compiler may remove the branch altogether (with a conditional move), in which case the gap disappears.

## What this means day to day

- **Predictable code is fast code.** Data-dependent branches inside hot loops are expensive when the data is random; sorting, partitioning or branch-free arithmetic can help.
- **Clock speed isn't everything.** Performance is roughly clock rate × instructions per cycle (IPC). Profilers such as `perf stat` report IPC and branch-miss counts, which tell you whether the CPU is busy or waiting.
- **Speculation leaks.** Spectre-class vulnerabilities (2018) showed that speculative execution leaves traces in the caches that attackers can measure. Operating systems, browsers and language runtimes now include mitigations that cost some performance.

Most of the time a core is not limited by arithmetic at all but by waiting for memory, which is the next topic.
