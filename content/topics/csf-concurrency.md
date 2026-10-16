---
id: csf-concurrency
title: "Concurrency: races, locks, deadlock and atomics"
summary: When two things share data, the order they interleave in is the bug
why: "Lost updates, double bookings, counters that drift and services that freeze under load all come from shared state touched by more than one thread or task."
requires: [csf-os]
lesson: lanes
points:
  - title: A race needs three things
    text: "Shared data, at least one writer, and no ordering between the accesses. Remove any one and the race is gone."
  - title: Read-modify-write is not one step
    text: "x = x + 1 reads, adds and writes. Another thread or task can run in between, and one update is lost."
  - title: Locks make sections exclusive
    text: "A mutex lets one thread at a time into a critical section. Hold it briefly, and never across slow I/O if you can avoid it."
  - title: Deadlock needs four conditions
    text: "Mutual exclusion, hold and wait, no preemption, and a circular wait. Taking locks in one global order breaks the circle."
quiz_hint: Write down, step by step, what each task reads and writes, and in which order those steps happen.
quiz:
  - q: "In the trace, two withdrawals of 30 and 50 from 100 leave a balance of 50. Which change fixes it without a lock?"
    options:
      - "Use a longer pause"
      - "Read and write the balance in the same step with no await between, as in balance -= amount"
      - "Run withdraw(50) first"
    answer: 1
    explain: "JavaScript runs one piece of code at a time, so a read-modify-write with no await in the middle can't be interrupted. With real threads you would need a lock or an atomic operation."
  - q: "Thread 1 holds lock A and waits for lock B. Thread 2 holds lock B and waits for lock A. What is the standard prevention?"
    options:
      - "Give thread 1 a higher priority"
      - "Make every thread acquire locks in the same global order, for example always A before B"
      - "Add more threads"
    answer: 1
    explain: "A consistent order makes a circular wait impossible, which removes one of the four Coffman conditions. Lock timeouts (tryLock) are another way out."
  - q: What does an atomic compare-and-swap (CAS) do?
    options:
      - "Swaps two variables' names"
      - "In one indivisible step, writes a new value only if the current value is still what you expected, and reports whether it did"
      - "Locks the whole memory bus for a millisecond"
    answer: 1
    explain: "CAS lets threads update shared data without a lock: read, compute, CAS, and retry if someone else got there first. Atomic counters and lock-free queues are built on it."
links:
  - { title: "OSTEP chapter 28: Locks (PDF)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-locks.pdf" }
  - { title: "Atomics (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics" }
  - { title: "OSTEP chapter 32: Common concurrency problems, including the deadlock conditions (PDF)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf" }
---
Concurrency means more than one sequence of work is in progress at once: threads on several cores, or tasks taking turns on one thread, as in JavaScript. The result is only well defined if every possible interleaving of their steps is acceptable. A **race condition** is a case where some interleavings give a wrong answer. Races are hard to find because the bad interleaving may happen once in a million runs, and adding a log line can make it disappear.

JavaScript runs one piece of code at a time, but an `await` is a point where other tasks can run. That is enough for a lost update. In the lesson below, two withdrawals each read the balance, pause (as a database call would), then write their result.

```trace lanes
id: lost-update
title: Two withdrawals, one lost
subtitle: Each task reads, waits, then writes what it read minus its amount
run: any
module: cjs
code: |
  let balance = 100;
  const pause = () => new Promise(resolve => setTimeout(resolve, 0));
  async function withdraw(amount) {
    const seen = balance;
    await pause();
    balance = seen - amount;
  }
  Promise.all([withdraw(30), withdraw(50)]).then(() => console.log(balance));
lanes:
  - { id: a, title: "Task A: withdraw(30)", hint: What A has read or written, kind: plain, tone: blue }
  - { id: b, title: "Task B: withdraw(50)", hint: What B has read or written, kind: plain, tone: violet }
  - { id: shared, title: Shared balance, kind: plain, tone: amber }
  - { id: timers, title: Timer queue, hint: Paused tasks waiting to resume, kind: queue, tone: muted }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. Two withdrawals of 30 and 50 should leave 20.
  - line: 1
    caption: The shared balance starts at 100.
    state: { shared: [{ id: bal, label: "balance = 100" }] }
  - line: 4
    caption: withdraw(30) starts and reads the balance into its own local, seen.
    state: { a: [{ id: sa, label: "seen = 100" }] }
  - line: 5
    caption: It reaches await. A's continuation waits for its timer, and control returns to the caller.
    state: { timers: [{ id: ta, label: "resume A" }] }
  - line: 4
    caption: withdraw(50) starts. A hasn't written anything yet, so B also reads 100.
    state: { b: [{ id: sb, label: "seen = 100" }] }
  - line: 5
    caption: B pauses too. Both tasks now hold a copy of a balance that is about to change.
    state: { timers: [{ id: ta, label: "resume A" }, { id: tb, label: "resume B" }] }
  - line: 6
    caption: "A's timer fires first. A writes 100 − 30 = 70."
    state:
      timers: [{ id: tb, label: "resume B" }]
      a: [{ id: sa, label: "wrote 70" }]
      shared: [{ id: bal, label: "balance = 70" }]
  - line: 6
    caption: "B resumes and writes its own 100 − 50 = 50, overwriting A's update. The 30 withdrawal is lost."
    state:
      timers: []
      b: [{ id: sb, label: "wrote 50" }]
      shared: [{ id: bal, label: "balance = 50", tone: rose }]
  - line: 8
    caption: Both promises have resolved, and the program prints 50 instead of 20.
    log: "50"
note: Real threads can interleave between any two machine instructions, not only at await, so the same bug is even easier to hit.
expect: ["50"]
```

## Fixing it

There are three families of fixes, in every language:

1. **Don't share.** Give each piece of state one owner, and send it messages (actors, channels, a single-writer queue).
2. **Make the critical section exclusive.** A lock (mutex) lets only one thread at a time run the read-modify-write. In JavaScript, the simplest fix here is to remove the `await` between read and write: `balance -= amount` runs in one uninterrupted step. Across processes or machines, the database does this for you with a transaction, `SELECT … FOR UPDATE`, or a conditional `UPDATE … WHERE balance >= 30`.
3. **Use an atomic operation.** CPUs provide instructions that read, modify and write a memory location in one indivisible step: atomic add, exchange and **compare-and-swap** (CAS). Java's `AtomicLong`, C#'s `Interlocked`, Go's `sync/atomic` and JavaScript's `Atomics` on a `SharedArrayBuffer` expose them.

```js run
let balance = 100;
let tail = Promise.resolve();
function withLock(fn) {          // a tiny async mutex: run tasks one after another
  const run = tail.then(fn);
  tail = run.catch(() => {});
  return run;
}
const pause = () => new Promise(resolve => setTimeout(resolve, 0));
async function withdraw(amount) {
  await withLock(async () => {
    const seen = balance;
    await pause();
    balance = seen - amount;
  });
}
Promise.all([withdraw(30), withdraw(50)]).then(() => console.log(balance));
```

This prints 20: the second withdrawal can't start its read until the first has written.

## Deadlock

Locks bring their own failure. Coffman and colleagues showed in 1971 that deadlock requires four conditions at once: **mutual exclusion** (a resource can be held by one party), **hold and wait** (a party holds one resource while waiting for another), **no preemption** (nobody can take a resource away), and **circular wait** (A waits for B, which waits for A). Break any one and deadlock can't happen. In practice: acquire locks in one global order, hold as few as possible for as short as possible, use timeouts, and never call unknown code (callbacks, I/O) while holding a lock.
