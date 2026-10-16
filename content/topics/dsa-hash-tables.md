---
id: dsa-hash-tables
title: Hash tables
summary: Turn a key into an array index, and handle the clashes
why: Objects, Maps, Python dicts, sets, database hash joins, caches and deduplication all run on them. Their O(1) is an average with conditions attached.
requires: [dsa-arrays]
lesson: none
points:
  - title: Hash, then index
    text: A hash function turns the key into a number, and the number modulo the table size picks a slot in an array.
  - title: Collisions are normal
    text: Different keys land in the same slot. Chaining keeps a small list per slot; open addressing probes for another free slot.
  - title: Load factor drives resizing
    text: When entries ÷ slots passes a limit (0.75 in Java's HashMap, two thirds in CPython's dict), the table doubles and every key is rehashed.
  - title: Equal keys, equal hashes
    text: If a == b then hash(a) must equal hash(b), or lookups silently fail. Mutating a key after inserting it breaks this.
quiz_hint: Ask how many keys end up in the slot you are looking at, and what decides that.
quiz:
  - q: Why is a hash table lookup O(1) on average but O(n) in the worst case?
    options:
      - The array has to be sorted first
      - If many keys hash to the same slot, a lookup has to compare against all of them
      - Hashing a key is O(n)
    answer: 1
    explain: With a good hash function and a bounded load factor, each slot holds a small constant number of keys. If an attacker or a bad hash sends everything to one slot, the table degrades to a list.
  - q: Why do Python and many web frameworks randomise string hashing per process?
    options: [To use less memory, "So an attacker can't precompute thousands of keys that collide, which would turn each request into an O(n²) insertion loop", To make dict order random]
    answer: 1
    explain: Hash flooding was a real denial-of-service attack against web servers parsing form fields. A secret per-process seed (Python uses SipHash, PEP 456) makes collisions unpredictable.
  - q: "You use a JavaScript object `{x: 1}` as a key in a Map, then look it up with a different object `{x: 1}`. What do you get?"
    options: [The stored value, undefined, A TypeError]
    answer: 1
    explain: Map compares object keys by identity, not by contents. Two separate objects are different keys even if they look the same. Use a string or number key derived from the contents if you need value equality.
links:
  - { title: "Hash tables (Sedgewick and Wayne, Algorithms 4th ed., section 3.4)", url: "https://algs4.cs.princeton.edu/34hash/" }
  - { title: "How are dictionaries implemented in CPython? (Python design FAQ)", url: "https://docs.python.org/3/faq/design.html#how-are-dictionaries-implemented-in-cpython" }
  - { title: "HashMap (Java SE 21 API)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html" }
  - { title: "PEP 456: Secure and interchangeable hash algorithm", url: "https://peps.python.org/pep-0456/" }
---
A hash table stores key–value pairs in an array and finds the right position for a key by computing it rather than searching for it. A hash function turns the key into a large number, and that number modulo the array's length gives the slot. Lookups, inserts and deletes are O(1) on average, which is why hash tables are behind JavaScript's `Map` and `Set`, Python's `dict` and `set`, Java's `HashMap`, and most caches and indexes held in memory.

## Hashing and collisions

A good hash function spreads keys evenly and is fast to compute. Even so, with more possible keys than slots, two keys will sometimes land in the same slot. There are two main ways to cope:

- **Separate chaining**: each slot holds a short list of entries. Java's `HashMap` does this, and (since Java 8) turns a chain into a small balanced tree once it reaches 8 entries in a table of at least 64 slots.
- **Open addressing**: all entries live in the array itself. On a collision the table probes other slots in a fixed sequence until it finds a free one. CPython's `dict` does this, with a probe sequence that mixes in the higher bits of the hash.

Either way the expected work per lookup depends on the **load factor**, entries divided by slots. Keep it bounded and each slot holds a constant number of keys on average. Java's `HashMap` resizes at 0.75 by default; CPython's dict resizes when it is two thirds full. Resizing allocates a table about twice as big and reinserts every key, because each key's slot depends on the table size. Like a dynamic array's growth, it is O(n) occasionally and O(1) amortised.

Here is a small chained table with a 0.75 limit, first with a real hash function and then with one that sends every key to the same place:

```js run
function fnv1a(str) {                    // a simple, decent string hash
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

class HashMap {
  constructor(hash = fnv1a) {
    this.hash = hash;
    this.buckets = Array.from({ length: 8 }, () => []);
    this.size = 0;
    this.resizes = 0;
  }
  bucketFor(key) {
    return this.buckets[this.hash(key) % this.buckets.length];
  }
  set(key, value) {
    const bucket = this.bucketFor(key);
    const entry = bucket.find((e) => e[0] === key);
    if (entry) { entry[1] = value; return; }
    bucket.push([key, value]);
    if (++this.size / this.buckets.length > 0.75) this.grow();   // load factor limit
  }
  get(key) {
    const entry = this.bucketFor(key).find((e) => e[0] === key);
    return entry && entry[1];
  }
  grow() {
    const old = this.buckets.flat();
    this.buckets = Array.from({ length: this.buckets.length * 2 }, () => []);
    for (const [k, v] of old) this.bucketFor(k).push([k, v]);       // rehash everything
    this.resizes++;
  }
  longestChain() {
    return this.buckets.reduce((max, b) => Math.max(max, b.length), 0);
  }
}

const good = new HashMap();
for (let i = 0; i < 100_000; i++) good.set("user:" + i, i);
console.log("buckets", good.buckets.length, "resizes", good.resizes, "longest chain", good.longestChain());
console.log(good.get("user:4242"));

const bad = new HashMap(() => 42);        // every key gets the same hash
let t = performance.now();
for (let i = 0; i < 5_000; i++) bad.set("user:" + i, i);
console.log("all in one bucket:", bad.longestChain(), "long, took", (performance.now() - t).toFixed(0), "ms for 5,000 keys");
```

With FNV-1a, 100,000 keys spread over 262,144 buckets after 15 resizes and no chain was longer than 4. With the constant hash every insert scans one ever-longer list, so 5,000 keys took tens of milliseconds in Node 22 (40 to 80 ms across runs), and doubling the keys roughly quadrupled the time. That quadratic blow-up is what **hash flooding** attacks exploit, by sending a server thousands of form fields whose names collide. Python randomises its string hash per process (SipHash, PEP 456) for exactly this reason; set `PYTHONHASHSEED` only when you need reproducible runs.

## The contract on keys

A table finds a key by hash and then confirms with equality. So equal keys must produce equal hashes, and a key's hash must not change while it is in the table. In Java you override `equals` and `hashCode` together; in Python, `__eq__` and `__hash__`; mutable lists can't be dict keys at all. JavaScript's `Map` compares objects by identity, so two different objects with the same contents are different keys.

## What you give up

Hash tables have no useful order. JavaScript `Map` and Python `dict` iterate in insertion order because they keep a separate dense array of entries, but neither can give you "all keys between A and C" or "the smallest key" without a full scan. When you need ranges or ordering, use a sorted structure: a balanced tree, a B-tree, or a sorted array with binary search.
