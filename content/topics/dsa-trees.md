---
id: dsa-trees
title: Trees, binary search trees and balance
summary: Ordered lookups in O(log n), if the tree stays bushy
why: Sorted maps, database indexes, file systems and the DOM are trees; whether they stay balanced decides whether a lookup takes 30 steps or 30 million.
requires: [dsa-binary-search, dsa-recursion]
lesson: none
points:
  - title: The BST rule
    text: Every key in a node's left subtree is smaller than the node's key, and every key in its right subtree is larger.
  - title: Cost is the height
    text: Search, insert and delete walk one path from the root, so they cost O(height). In-order traversal visits keys in sorted order.
  - title: Sorted input breaks a naive tree
    text: Inserting keys in order builds a tree that is one long path, so every operation becomes O(n).
  - title: Balanced trees fix it
    text: Red-black and AVL trees rebalance with rotations to keep the height O(log n); B-trees keep many keys per node for disks.
quiz_hint: Draw the path from the root to the key, and ask how long it can get for the worst insertion order.
quiz:
  - q: You insert 1, 2, 3, …, 10,000 in that order into a plain (unbalanced) binary search tree. What is its height?
    options: [About 14, About 100, "10,000"]
    answer: 2
    explain: Each new key is larger than everything so far, so it goes to the right of the last node. The tree is a linked list, and a lookup walks all of it.
  - q: What does an in-order traversal (left subtree, node, right subtree) of a BST produce?
    options: [The keys in insertion order, The keys in sorted order, The keys level by level]
    answer: 1
    explain: The BST rule puts everything smaller on the left and everything larger on the right, so visiting left, self, right yields ascending order.
  - q: Why do databases use B-trees for indexes rather than binary trees?
    options:
      - B-trees use less memory per key
      - Each node holds hundreds of keys and fits one disk page, so a lookup touches only 3 or 4 pages even for millions of rows
      - Binary trees can't store strings
    answer: 1
    explain: Reading a page from disk costs far more than comparing keys in memory. A high branching factor keeps the tree very shallow, so lookups need few page reads.
links:
  - { title: "Binary search trees (Sedgewick and Wayne, Algorithms 4th ed., section 3.2)", url: "https://algs4.cs.princeton.edu/32bst/" }
  - { title: "Balanced search trees (Sedgewick and Wayne, Algorithms 4th ed., section 3.3)", url: "https://algs4.cs.princeton.edu/33balanced/" }
  - { title: "TreeMap (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html" }
  - { title: "B-Tree indexes (PostgreSQL documentation)", url: "https://www.postgresql.org/docs/current/btree.html" }
---
A tree is a set of nodes where each node has one parent (except the root) and any number of children. A binary search tree (BST) adds one rule: everything in a node's left subtree is smaller than it and everything in its right subtree is larger. That rule turns lookups into a walk down a single path, so the cost is the height of the tree, which is O(log n) if the tree is balanced and O(n) if it isn't.

## Search, insert and sorted order

To find a key, start at the root and go left if the key is smaller, right if it is larger, until you find it or fall off the tree. Inserting is the same walk, attaching a new node where you fell off. Visiting the left subtree, then the node, then the right subtree gives every key in ascending order, which is what a hash table can't do:

```js run
function insert(root, key) {
  const node = { key, left: null, right: null };
  if (!root) return node;
  let cur = root;
  while (true) {                                  // iterative, so deep trees can't overflow the stack
    const side = key < cur.key ? "left" : "right";
    if (!cur[side]) { cur[side] = node; return root; }
    cur = cur[side];
  }
}

function* inOrder(node) {                       // left subtree, node, right subtree
  if (!node) return;
  yield* inOrder(node.left);
  yield node.key;
  yield* inOrder(node.right);
}

let small = null;
for (const k of [50, 30, 70, 20, 40, 60, 80]) small = insert(small, k);
console.log([...inOrder(small)].join(" "));      // 20 30 40 50 60 70 80
```

Because keys are ordered, a BST also answers range queries ("all keys between 30 and 60"), the smallest or largest key, and "the next key after x", each in O(height) plus the size of the answer.

## Why balance matters

A plain BST's shape depends entirely on the order of insertion. Random order gives a bushy tree of height a small multiple of log n. Sorted order, which is very common in practice (timestamps, auto-increment ids), gives a single path:

```js run
function insert(root, key) {
  const node = { key, left: null, right: null };
  if (!root) return node;
  let cur = root;
  while (true) {
    const side = key < cur.key ? "left" : "right";
    if (!cur[side]) { cur[side] = node; return root; }
    cur = cur[side];
  }
}
function height(root) {
  let max = 0;
  const stack = root ? [[root, 1]] : [];
  while (stack.length) {
    const [node, depth] = stack.pop();
    max = Math.max(max, depth);
    if (node.left) stack.push([node.left, depth + 1]);
    if (node.right) stack.push([node.right, depth + 1]);
  }
  return max;
}

let seed = 1;                                     // a tiny seeded random generator, so runs repeat
const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const n = 10_000;
const sortedKeys = Array.from({ length: n }, (_, i) => i);
const shuffledKeys = sortedKeys.slice();
for (let i = n - 1; i > 0; i--) {                 // Fisher-Yates shuffle
  const j = Math.floor(random() * (i + 1));
  [shuffledKeys[i], shuffledKeys[j]] = [shuffledKeys[j], shuffledKeys[i]];
}
let fromSorted = null, fromShuffled = null;
for (const k of sortedKeys) fromSorted = insert(fromSorted, k);
for (const k of shuffledKeys) fromShuffled = insert(fromShuffled, k);
console.log("sorted inserts, height:", height(fromSorted));       // 10000: a linked list
console.log("shuffled inserts, height:", height(fromShuffled));   // 29
console.log("log2(n):", Math.log2(n).toFixed(1));                 // 13.3
```

Building the sorted tree took about 50 million comparisons (0 + 1 + … + 9,999); in the shuffled tree no insert needed more than 29.

## Balanced trees, at a high level

Self-balancing trees do a little extra work on each insert and delete to keep the height O(log n) whatever the order:

- **AVL trees** keep the heights of every node's two subtrees within one of each other, restoring that with **rotations**, small local re-wirings that preserve the BST order.
- **Red-black trees** colour nodes and enforce rules that keep the longest path at most twice the shortest. They rebalance less often than AVL trees. Java's `TreeMap` is one (its docs promise log(n) time for get, put and remove), and C++'s `std::map` is usually implemented as one.
- **B-trees** (and B+ trees) give each node hundreds of keys and children, sized to a disk page. With that much branching a table of millions of rows is only 3 or 4 levels deep, so a lookup reads only 3 or 4 pages. That is the default index type in PostgreSQL, MySQL's InnoDB and SQLite.

You will rarely implement one of these yourself. What matters is knowing that an ordered map gives you O(log n) operations plus ordering, a hash map gives you O(1) average without ordering, and an unbalanced tree gives you neither guarantee.
