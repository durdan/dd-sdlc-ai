---
id: java-collections
title: "Collections inside: ArrayList and HashMap"
summary: An array that grows, and an array of buckets
why: "A bad hashCode, a mutable key or the wrong initial size turns O(1) into O(n). Knowing the internals makes these bugs obvious."
requires: [java-generics, java-memory]
lesson: none
points:
  - title: ArrayList is an array
    text: Reading by index is constant time; adding at the end is amortised constant time; inserting or removing in the middle shifts everything after it.
  - title: HashMap is an array of buckets
    text: The key's hashCode picks a bucket and equals finds the entry in it, so both methods must agree.
  - title: Crowded buckets become trees
    text: In OpenJDK, a bucket that collects 8 or more entries in a large enough table is turned into a red-black tree, which limits the damage a bad hashCode can do.
  - title: Fail fast
    text: Changing a collection while iterating over it, other than through the iterator, usually throws ConcurrentModificationException.
quiz:
  - q: Which operation on a large ArrayList is slowest?
    options:
      - get(i) near the end
      - remove(0)
      - add(x) at the end
    answer: 1
    explain: Removing the first element shifts every remaining element one place left, which is O(n). Indexed reads are O(1) and appending is amortised O(1).
  - q: "A class overrides equals but not hashCode. You put an instance in a HashSet, then call contains with an equal instance. What is the likely result?"
    options:
      - true, because equals says they are the same
      - false, because the two objects most likely have different identity hash codes and land in different buckets
      - A compile error
    answer: 1
    explain: "HashSet only calls equals on entries in the bucket chosen by hashCode. Without a matching hashCode the equal object is looked for in the wrong bucket. Equal objects must have equal hash codes."
  - q: "In OpenJDK 21, what happens when a HashMap bucket collects many colliding keys?"
    options:
      - The map throws an exception
      - "Once a bucket has 8 entries and the table has at least 64 buckets, it becomes a red-black tree"
      - The colliding keys are silently dropped
    answer: 1
    explain: "With a smaller table, HashMap resizes instead. A tree bin keeps lookups at O(log n) as long as the keys' hashes differ or the keys are Comparable. These thresholds are implementation details, not part of the Map contract."
links:
  - title: HashMap (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html
  - title: ArrayList (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html
  - title: The collections framework (dev.java)
    url: https://dev.java/learn/api/collections-and-streams/collections-framework/
  - title: "JEP 431: sequenced collections"
    url: https://openjdk.org/jeps/431
---
The two collections you use most are thin layers over plain arrays. `ArrayList` keeps its elements in an `Object[]` that it replaces with a bigger one when full. `HashMap` keeps an array of buckets and uses each key's `hashCode` to choose one. The Javadoc specifies their complexity and behaviour; the exact growth factors and thresholds below are how OpenJDK implements them, and could change.

## ArrayList

An `ArrayList` holds a reference to an `Object[]` and a size. `get(i)` is an array read. `add(x)` writes into the next free slot; when the array is full, OpenJDK allocates one about 1.5 times larger and copies everything across. Copying is rare enough that appending is amortised O(1), which is all the Javadoc promises. Inserting or removing anywhere but the end shifts the elements after it, so `remove(0)` on a million-element list moves a million references.

If you know the final size, say so with `new ArrayList<>(n)` or `ensureCapacity(n)` and skip the copies. Remember too that the array holds references: a `List<Integer>` is an array of pointers to separate boxed objects, much bigger than an `int[]`.

## HashMap

A `HashMap` is an array of buckets whose length is always a power of two (16 by default). To place a key, OpenJDK takes `key.hashCode()`, mixes the high bits into the low ones (`h ^ (h >>> 16)`), and uses the low bits as the index. Entries in the same bucket form a short linked list. When the number of entries passes capacity times the load factor (0.75 by default), the table doubles and entries are redistributed.

Two methods carry the whole design:

- `hashCode` must return equal values for equal keys, or the lookup searches the wrong bucket.
- `equals` decides which entry in the bucket is the right one.

So never mutate a field that `hashCode` uses while the object is a key: the entry stays in its old bucket and becomes unreachable by lookup. Records and immutable value classes make good keys.

## When hashing goes wrong

```java
import java.util.*;

public class Buckets {
    record Key(int id) {
        @Override public int hashCode() { return 1; }   // every key in one bucket
    }

    public static void main(String[] args) {
        Map<Key, String> map = new HashMap<>();
        for (int i = 0; i < 10_000; i++) map.put(new Key(i), "v" + i);
        System.out.println(map.get(new Key(9_999)));   // still found, just slowly
    }
}
```

Every key collides. Since Java 8, OpenJDK limits the damage: once a bucket holds 8 entries (and the table has at least 64 buckets; below that it resizes instead), the bucket is converted to a red-black tree, and back to a list when it shrinks to 6. The tree is ordered by hash first and then, if the keys are `Comparable`, by `compareTo`; then lookups are O(log n). Keys like this `Key`, with identical hashes and no ordering, can still force a search of the whole tree. Give keys a good `hashCode` and treat the trees as a safety net.

## Iterating safely

`ArrayList` and `HashMap` iterators are fail-fast: each collection counts structural changes, and the iterator throws `ConcurrentModificationException` if the count changes underneath it. That is a best-effort bug detector, not a thread-safety mechanism.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer n : list) if (n == 1) list.remove(n);   // ConcurrentModificationException
list.removeIf(n -> n == 1);                          // the safe way
```

For sharing between threads use `ConcurrentHashMap` or `CopyOnWriteArrayList`, not a synchronised wrapper around a `HashMap`. And Java 21's sequenced collections (JEP 431) give `List`, `Deque`, `LinkedHashMap` and friends a common `getFirst()`, `getLast()` and `reversed()`.
