---
id: dsa-linked-lists
title: Linked lists, and when they lose to arrays
summary: O(1) splicing, paid for with pointer chasing
why: Textbooks praise their O(1) inserts; real hardware usually punishes them. Knowing both sides tells you the few places they are the right tool.
requires: [dsa-arrays]
lesson: none
points:
  - title: Nodes and pointers
    text: Each element lives in its own node with a reference to the next (and, in a doubly linked list, the previous) node.
  - title: Cheap splicing
    text: Given a node, inserting or removing next to it is O(1). Nothing else moves.
  - title: Expensive finding
    text: There is no index. Reaching the k-th element, or searching, means walking from the head, O(n).
  - title: Caches hate them
    text: Nodes are scattered in memory, so a traversal is a chain of cache misses. A plain array scan is often dozens of times faster.
quiz_hint: Separate the cost of finding the spot from the cost of changing it.
quiz:
  - q: "You need to insert into the middle of a sequence of a million items, and you only know the position by index. Which is faster in practice?"
    options: ["A linked list, because insertion is O(1)", "Usually the array: both need O(n) work (walking vs shifting), and shifting contiguous memory is much faster than chasing a million pointers", They are the same]
    answer: 1
    explain: The O(1) insertion only applies once you already hold the neighbouring node. Finding it by index is a walk, and a walk through scattered nodes is slow. A memmove-style shift is one of the fastest things a CPU does.
  - q: An LRU cache needs O(1) lookup by key and O(1) "move this entry to the front". What is the classic structure?
    options: [A sorted array, A hash map whose values are nodes of a doubly linked list, A binary heap]
    answer: 1
    explain: The map finds the node in O(1), and because you hold the node you can unlink it and relink it at the front in O(1). This is a real place where a linked list earns its keep.
  - q: What does a doubly linked list add over a singly linked one?
    options: [Random access by index, "A prev pointer, so a node can be removed in O(1) without knowing its predecessor", Automatic sorting]
    answer: 1
    explain: In a singly linked list you need the node before the one you are removing, which may mean a walk. The extra pointer costs memory on every node.
links:
  - { title: "Linked lists (Sedgewick and Wayne, Algorithms 4th ed., section 1.3)", url: "https://algs4.cs.princeton.edu/13stacks/" }
  - { title: "collections.deque (Python docs)", url: "https://docs.python.org/3/library/collections.html#collections.deque" }
  - { title: "LinkedList (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedList.html" }
  - { title: "Linked list (Wikipedia)", url: "https://en.wikipedia.org/wiki/Linked_list" }
---
A linked list stores each element in its own small object, a node, that also holds a reference to the next node. The list itself is just a pointer to the first one. Because nodes don't have to sit next to each other, you can insert or remove an element by rewiring a couple of pointers without moving anything else. The same property is what makes them slow at almost everything else on modern hardware.

## What they are good at

If you already hold a reference to a node, splicing next to it is O(1): point the new node at the old successor and point the old node at the new one. Removing is the same in reverse. A doubly linked list adds a `prev` pointer to every node so you can also remove a node without knowing its predecessor, and walk backwards.

That makes linked lists the right tool in a few real places:

- **LRU caches**: a hash map from key to node, plus a doubly linked list ordered by recency. A hit unlinks the node and moves it to the front in O(1); eviction takes the node at the back.
- **Queues with unbounded growth** that must never copy, and lists embedded inside other objects (the "intrusive" lists common in operating system kernels).
- **Immutable, shared lists** in functional languages, where many lists share the same tail.

Here is the LRU pattern, with sentinel head and tail nodes so there are no special cases at the ends:

```js run
class LRU {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();                       // key -> node
    this.head = { prev: null, next: null };     // sentinel: most recent after it
    this.tail = { prev: this.head, next: null };
    this.head.next = this.tail;
  }
  unlink(node) { node.prev.next = node.next; node.next.prev = node.prev; }
  pushFront(node) {
    node.next = this.head.next; node.prev = this.head;
    this.head.next.prev = node; this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.unlink(node); this.pushFront(node);    // O(1): no searching, no shifting
    return node.value;
  }
  set(key, value) {
    if (this.map.has(key)) this.unlink(this.map.get(key));
    const node = { key, value };
    this.pushFront(node); this.map.set(key, node);
    if (this.map.size > this.capacity) {
      const oldest = this.tail.prev;
      this.unlink(oldest); this.map.delete(oldest.key);
    }
  }
  keys() { const out = []; for (let n = this.head.next; n !== this.tail; n = n.next) out.push(n.key); return out; }
}
const cache = new LRU(2);
cache.set("a", 1);
cache.set("b", 2);
cache.get("a");          // a is now the most recent
cache.set("c", 3);       // evicts b, the least recently used
console.log(cache.keys());   // [ 'c', 'a' ]
```

A JavaScript `Map` remembers insertion order, so a simpler LRU can delete and re-insert keys instead. The linked list version is the one you will meet in other languages and in interviews.

## Where they lose

There is no index, so `list[k]` means walking k nodes. Searching is a walk too. And every step of a walk is a pointer dereference to a node that may be anywhere in memory, which usually means a cache miss. Compare summing a million numbers stored both ways, with the nodes linked in a random order as they would be after a long-running program has inserted them over time:

```js run
const n = 1_000_000;
const values = Array.from({ length: n }, (_, i) => i);

// Build a list whose nodes are linked in a shuffled order, as they are
// in a long-running program where inserts happen over time.
const nodes = values.map((value) => ({ value, next: null }));
const order = values.slice();
for (let i = n - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}
const shuffled = order.map((i) => nodes[i]);
for (let i = 0; i < n - 1; i++) shuffled[i].next = shuffled[i + 1];

function time(label, fn) {
  const start = performance.now();
  let sum = 0;
  for (let r = 0; r < 10; r++) sum = fn();
  console.log(label.padEnd(12), (performance.now() - start).toFixed(0).padStart(4), "ms", sum);
}
time("array", () => { let s = 0; for (let i = 0; i < n; i++) s += values[i]; return s; });
time("linked list", () => { let s = 0; for (let node = shuffled[0]; node; node = node.next) s += node.value; return s; });
```

Both loops are O(n) and give the same sum. In Node 22 on a laptop the array took about 8 ms and the list between 750 and 1,000 ms. Each node also carries pointer and object-header overhead that an array of numbers doesn't have. This is why Java's `ArrayList` and `ArrayDeque` are usually recommended over `LinkedList`, and why Python's `deque` is built from blocks of 64 elements linked together rather than one node per item.
