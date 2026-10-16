---
id: dsa-stacks-queues
title: Stacks and queues
summary: Last in first out, first in first out
why: Undo, parsing, the call stack, depth-first search, job queues, breadth-first search and every message broker are one of these two.
requires: [dsa-arrays, dsa-linked-lists]
lesson: lanes
points:
  - title: A stack is LIFO
    text: push adds to the top and pop removes from the top, so the most recent item comes out first. Both are O(1) on the end of an array.
  - title: A queue is FIFO
    text: Items leave in the order they arrived. Adding at one end and removing at the other needs care to stay O(1).
  - title: shift() is not a queue
    text: Removing from the front of an array moves every remaining element. Use a ring buffer, a deque or two indexes.
  - title: Bound your queues
    text: An unbounded queue between a fast producer and a slow consumer is a memory leak with a delay.
quiz_hint: Ask which item has been waiting longest and whether it should come out first or last.
quiz:
  - q: You push 1, 2, 3 onto a stack and enqueue 1, 2, 3 into a queue. What do pop and dequeue return?
    options: [3 and 1, 1 and 3, 3 and 3]
    answer: 0
    explain: The stack returns the most recent item (3); the queue returns the oldest (1).
  - q: Why does checking balanced brackets use a stack?
    options:
      - Brackets must be sorted
      - The most recently opened bracket is the one the next closing bracket must match
      - Stacks use less memory than strings
    answer: 1
    explain: Nesting is last-opened, first-closed. The top of the stack is always the bracket that has to close next.
  - q: In a ring buffer of capacity 4 with head at index 3 and 2 items, where does the next enqueue go?
    options: [Index 5, "Index 1, because (3 + 2) % 4 wraps around", It must grow first]
    answer: 1
    explain: Items occupy indexes 3 and 0. The next free slot is (head + size) % capacity = 1. Nothing is shifted; the indexes wrap around.
links:
  - { title: "Bags, queues and stacks (Sedgewick and Wayne, Algorithms 4th ed., section 1.3)", url: "https://algs4.cs.princeton.edu/13stacks/" }
  - { title: "Using lists as stacks and queues (Python tutorial)", url: "https://docs.python.org/3/tutorial/datastructures.html#using-lists-as-stacks" }
  - { title: "ArrayDeque (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html" }
---
A stack and a queue are both containers you add to and take from, and the only difference is which item comes out next. A stack hands back the most recently added item (last in, first out), like a pile of plates. A queue hands back the item that has waited longest (first in, first out), like a checkout line. Choosing between them is choosing an order of work, and that choice is behind undo history, parsers, depth-first versus breadth-first search and job processing.

```trace lanes
id: brackets
title: Balanced brackets with a stack
subtitle: The top of the stack is the bracket that must close next
run: any
module: cjs
code: |
  const pairs = { ")": "(", "]": "[", "}": "{" };
  function balanced(s) {
    const stack = [];
    for (const ch of s) {
      if ("([{".includes(ch)) stack.push(ch);
      else if (stack.pop() !== pairs[ch]) return false;
    }
    return stack.length === 0;
  }
  console.log(balanced("([]{})"));
  console.log(balanced("(]"));
lanes:
  - { id: input, title: Characters still to read, hint: "The rest of the string, front first", kind: queue, tone: muted }
  - { id: stack, title: Stack, hint: "Open brackets waiting to be closed; top is the newest", kind: stack, tone: violet }
  - { id: matched, title: Matched, hint: Pairs that closed correctly, kind: plain, tone: teal }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. The function walks the string once and keeps unmatched open brackets on a stack.
  - line: 10
    caption: The first call checks "([]{})". Every character is waiting to be read.
    state:
      input: [{ id: a1, label: "(" }, { id: a2, label: "[" }, { id: a3, label: "]" }, { id: a4, label: "{" }, { id: a5, label: "}" }, { id: a6, label: ")" }]
  - line: 5
    caption: "\"(\" is an opening bracket, so it is pushed."
    state:
      input: [{ id: a2, label: "[" }, { id: a3, label: "]" }, { id: a4, label: "{" }, { id: a5, label: "}" }, { id: a6, label: ")" }]
      stack: [{ id: a1, label: "(" }]
  - line: 5
    caption: "\"[\" is pushed on top of it. The stack now says: close [ first, then (."
    state:
      input: [{ id: a3, label: "]" }, { id: a4, label: "{" }, { id: a5, label: "}" }, { id: a6, label: ")" }]
      stack: [{ id: a1, label: "(" }, { id: a2, label: "[" }]
  - line: 6
    caption: "\"]\" is a closing bracket. pop() returns \"[\", which is what pairs[\"]\"] expects, so the pair matches."
    state:
      input: [{ id: a4, label: "{" }, { id: a5, label: "}" }, { id: a6, label: ")" }]
      stack: [{ id: a1, label: "(" }]
      matched: [{ id: a2, label: "[ ]" }]
  - line: 5
    caption: "\"{\" is pushed."
    state:
      input: [{ id: a5, label: "}" }, { id: a6, label: ")" }]
      stack: [{ id: a1, label: "(" }, { id: a4, label: "{" }]
  - line: 6
    caption: "\"}\" pops \"{\". Another match."
    state:
      input: [{ id: a6, label: ")" }]
      stack: [{ id: a1, label: "(" }]
      matched: [{ id: a2, label: "[ ]" }, { id: a4, label: "{ }" }]
  - line: 6
    caption: "\")\" pops the \"(\" that has been waiting at the bottom since the start. Last opened, first closed."
    state:
      input: []
      stack: []
      matched: [{ id: a2, label: "[ ]" }, { id: a4, label: "{ }" }, { id: a1, label: "( )" }]
  - line: 8
    caption: The string is used up and the stack is empty, so every bracket was closed. The call returns true.
    log: "true"
  - line: 11
    caption: The second call checks "(]".
    state:
      matched: []
      input: [{ id: b1, label: "(" }, { id: b2, label: "]" }]
  - line: 5
    caption: "\"(\" is pushed."
    state:
      input: [{ id: b2, label: "]" }]
      stack: [{ id: b1, label: "(" }]
  - line: 6
    caption: "\"]\" pops \"(\", but pairs[\"]\"] is \"[\". The brackets cross, so the function returns false at once."
    state:
      input: []
      stack: []
    log: "false"
  - caption: "Done. A stack fits because nesting is last in, first out: the most recently opened bracket is always the one that must close next."
note: The same shape, a stack of things still open, is how parsers match tags and how your language's call stack tracks which function to return to.
expect: ["true", "false"]
```

## Stacks

A stack needs two operations, `push` and `pop`, both at the same end. The end of a dynamic array is perfect: `arr.push(x)` and `arr.pop()` in JavaScript, `list.append` and `list.pop()` in Python, `ArrayDeque.push` and `pop` in Java (its docs say it is likely to be faster than the old `Stack` class). Your program's call stack is one: each call pushes a frame and each return pops it, which is why recursion and explicit stacks are interchangeable. Depth-first search, undo and redo, and evaluating expressions all use one.

## Queues

A queue adds at the back and removes from the front. On a plain array, removing from the front is `shift()`, which moves every remaining element, so a busy queue becomes O(n) per operation. Two standard fixes:

- A **ring buffer**: a fixed array plus a head index and a count. Enqueue writes at `(head + size) % capacity`, dequeue reads at `head` and advances it, and both wrap around the end. Grow it like a dynamic array when it fills. This is how `ArrayDeque` works; Python's `collections.deque` uses linked blocks of elements for the same O(1) at both ends.
- **Two indexes** into a growing array, compacting occasionally.

```js run
class RingQueue {
  constructor(capacity = 4) {
    this.slots = new Array(capacity);
    this.head = 0;   // index of the front item
    this.size = 0;
  }
  enqueue(x) {
    if (this.size === this.slots.length) this.grow();
    this.slots[(this.head + this.size) % this.slots.length] = x;
    this.size++;
  }
  dequeue() {
    if (this.size === 0) return undefined;
    const x = this.slots[this.head];
    this.slots[this.head] = undefined;
    this.head = (this.head + 1) % this.slots.length;
    this.size--;
    return x;
  }
  grow() {
    const bigger = new Array(this.slots.length * 2);
    for (let i = 0; i < this.size; i++) bigger[i] = this.slots[(this.head + i) % this.slots.length];
    this.slots = bigger;
    this.head = 0;
  }
}

const q = new RingQueue();
for (const job of ["a", "b", "c"]) q.enqueue(job);
console.log(q.dequeue(), q.dequeue());   // a b: first in, first out
for (const job of ["d", "e", "f"]) q.enqueue(job);   // wraps around the end
console.log(q.slots);                    // [ 'e', 'f', 'c', 'd' ]
let next;
const order = [];
while ((next = q.dequeue()) !== undefined) order.push(next);
console.log(order.join(" "));            // c d e f
```

After two dequeues, "e" and "f" land in slots 0 and 1, the space freed at the front, and the order still comes out right.

Queues are also how systems absorb bursts: work arrives faster than it can be handled for a while, and the queue holds the difference. If the burst never ends, an unbounded queue just grows until memory runs out. A bounded queue that makes producers wait or rejects new work is the honest version, and it is the idea behind backpressure.
