---
id: dsa-tries-bloom
title: Tries and Bloom filters
summary: Prefix lookups, and "definitely not here" in a few bits per item
why: Autocomplete, URL routers, IP lookup tables and every LSM-tree database (RocksDB, Cassandra) lean on these two less famous structures.
requires: [dsa-trees, dsa-hash-tables]
lesson: none
points:
  - title: A trie branches on characters
    text: Each edge is one character, so all words sharing a prefix share a path. Looking up a key costs its length, not the number of keys.
  - title: Prefix queries for free
    text: Walk down the prefix, then everything below that node starts with it. Hash tables can't do that.
  - title: A Bloom filter answers maybe or no
    text: k hash functions set k bits per item in a bit array. If any of an item's bits is 0 it was never added; if all are 1 it probably was.
  - title: Tune the false-positive rate
    text: About 9.6 bits per item and 7 hash functions give roughly a 1% false-positive rate, whatever the size of the items.
quiz_hint: For the trie, follow characters from the root. For the Bloom filter, ask which answer can be wrong.
quiz:
  - q: A Bloom filter says an item is not in the set. How sure can you be?
    options: [About 99%, "Completely: every added item set all of its bits, so a 0 bit proves it was never added", It depends on the hash functions]
    answer: 1
    explain: Bloom filters have no false negatives (as long as you never remove items). Only "maybe present" can be wrong, because other items may have set the same bits.
  - q: Why can't you delete from a standard Bloom filter by clearing an item's bits?
    options: [The bits are read-only, "Other items may share those bits, so clearing them would create false negatives", Deleting is O(n)]
    answer: 1
    explain: A bit doesn't remember who set it. Counting Bloom filters replace each bit with a small counter to support deletion, at several times the memory.
  - q: What does a trie lookup for a word of length L cost in a trie holding n words?
    options: ["O(log n)", "O(L), independent of n", "O(n)"]
    answer: 1
    explain: The lookup takes one step per character, however many other words are stored. Comparing whole strings in a balanced tree costs O(L log n).
links:
  - { title: "Tries (Sedgewick and Wayne, Algorithms 4th ed., section 5.2)", url: "https://algs4.cs.princeton.edu/52trie/" }
  - { title: "RocksDB Bloom filter (RocksDB wiki)", url: "https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter" }
  - { title: "Less hashing, same performance: building a better Bloom filter (Kirsch and Mitzenmacher)", url: "https://www.eecs.harvard.edu/~michaelm/postscripts/rsa2008.pdf" }
  - { title: "Bloom filter (Wikipedia)", url: "https://en.wikipedia.org/wiki/Bloom_filter" }
---
Some of the most useful data structures in production are not the ones in the first chapter of a textbook. A trie stores strings as paths of characters, so all keys with a common prefix share the same branch, which makes prefix search and longest-prefix matching cheap. A Bloom filter is a compact bit array that can tell you an item is definitely not in a set, using a few bits per item, at the price of sometimes saying "maybe" when the answer is no.

## Tries

A trie's root represents the empty string. Each node has a child per next character, and nodes that complete a word are marked. Looking up a key takes one step per character, independent of how many keys are stored, and finding every key with a given prefix means walking to the prefix's node and listing everything below it:

```js run
class Trie {
  constructor() { this.root = { children: new Map(), end: false }; }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    node.end = true;
  }
  withPrefix(prefix) {
    let node = this.root;
    for (const ch of prefix) {                    // walk down: cost is the prefix length
      node = node.children.get(ch);
      if (!node) return [];
    }
    const out = [];
    const walk = (n, word) => {
      if (n.end) out.push(word);
      for (const [ch, child] of n.children) walk(child, word + ch);
    };
    walk(node, prefix);
    return out;
  }
}
const t = new Trie();
for (const w of ["car", "cart", "carbon", "care", "cat", "dog"]) t.insert(w);
console.log(t.withPrefix("car"));   // [ 'car', 'cart', 'carbon', 'care' ]
console.log(t.withPrefix("ca").length, t.withPrefix("x"));   // 5 []
```

That makes tries natural for autocomplete, spell checkers and routing tables. A one-character-per-node trie wastes a lot of memory on long chains with a single child, so real implementations compress those chains into one edge labelled with a whole substring. That is a **radix tree** (or Patricia trie), the structure many HTTP routers use to match paths like `/users/:id/posts`, and the basis of longest-prefix matching for IP routes.

## Bloom filters

A Bloom filter is an array of m bits, all 0 at the start, plus k hash functions that each map an item to a bit position. Adding an item sets its k bits. Checking an item looks at the same k bits: if any is 0, the item was definitely never added; if all are 1, it was probably added, but other items may have set those bits by coincidence. There are no false negatives, only false positives, and the filter never stores the items themselves.

For n items, the false-positive rate is about (1 − e^(−kn/m))^k, and the best k is (m/n) · ln 2. Roughly 9.6 bits per item with 7 hash functions gives 1%, and every extra 4.8 bits per item divides the rate by ten, regardless of whether the items are 8-byte ids or 2 KB URLs. The example uses one well-mixed hash and derives the k positions from two values, a trick from Kirsch and Mitzenmacher that loses nothing in accuracy:

```js run
function hash(str, seed) {                        // FNV-1a with a seed, 32 bits
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= h >>> 16;                                  // final mixing (from MurmurHash3) spreads similar keys apart
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

class BloomFilter {
  constructor(bits, hashes) {
    this.m = bits;
    this.k = hashes;
    this.bits = new Uint8Array(Math.ceil(bits / 8));
  }
  positions(item) {
    // Double hashing: k positions from two hash values (Kirsch and Mitzenmacher).
    const h1 = hash(item, 0), h2 = (hash(item, 0x9e3779b9) | 1) >>> 0;
    return Array.from({ length: this.k }, (_, i) => (h1 + i * h2) % this.m);
  }
  add(item) {
    for (const p of this.positions(item)) this.bits[p >> 3] |= 1 << (p & 7);
  }
  mightContain(item) {
    return this.positions(item).every((p) => (this.bits[p >> 3] & (1 << (p & 7))) !== 0);
  }
}

const n = 10_000;                                 // items we will add
const m = 95_851;                                 // bits: about 9.6 per item, 12 KB in total
const k = 7;                                      // hash functions: round((m / n) * ln 2)
const filter = new BloomFilter(m, k);
for (let i = 0; i < n; i++) filter.add("user-" + i);

let missed = 0;
for (let i = 0; i < n; i++) if (!filter.mightContain("user-" + i)) missed++;
let falsePositives = 0;
const trials = 100_000;
for (let i = 0; i < trials; i++) if (filter.mightContain("other-" + i)) falsePositives++;

const predicted = (1 - Math.exp((-k * n) / m)) ** k;
console.log("false negatives:", missed);                                   // always 0
console.log("false positive rate:", (falsePositives / trials * 100).toFixed(2) + "%");   // 1.00%
console.log("predicted:", (predicted * 100).toFixed(2) + "%");             // 1.00%
```

The measured rate matches the formula, 1.00%. Without the final mixing step the bit positions of similar keys like `user-1` and `user-2` were correlated: fewer bits got set than the formula assumes, and the measured rate came out at 0.54% instead of 1.00%. Better than predicted, but no longer predictable, which is a good reminder that a Bloom filter is only as good as its hash.

Bloom filters earn their place in front of something expensive. An LSM-tree database such as RocksDB or Cassandra keeps one per on-disk file, so a read for a key that isn't in a file usually skips reading that file at all. Caches use them to avoid storing items seen only once, and distributed joins use them to avoid shipping rows that can't match. Removing items needs a variant, such as a counting Bloom filter or a cuckoo filter, because clearing a shared bit would create false negatives.
