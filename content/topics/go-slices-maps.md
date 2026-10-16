---
id: go-slices-maps
title: Slices and maps under the hood
summary: A slice is a view of an array; a map is a hash table you don't own
why: "Most surprising Go bugs with collections come from two slices sharing one array or from code that relies on map order. Both make sense once you see the structures."
requires: [go-build]
lesson: none
points:
  - title: A slice is three words
    text: A pointer to an array, a length and a capacity. Copying a slice copies those three words, not the elements.
  - title: append may or may not copy
    text: If there is spare capacity, append writes into the same array. If not, it allocates a bigger one, copies, and returns a slice of the new array.
  - title: Map order is unspecified
    text: The spec makes no promise about iteration order, and in practice it changes from one loop to the next. Sort the keys when order matters.
  - title: Maps aren't safe for concurrent writes
    text: A map written by one goroutine while another reads or writes it is a data race. The runtime often detects it and stops the program.
quiz:
  - q: What does this print?
    code: |
      base := make([]int, 3, 4)
      a := append(base, 1)
      b := append(base, 2)
      fmt.Println(a[3], b[3])
    options:
      - "1 2"
      - "2 2"
      - It panics with index out of range
    answer: 1
    explain: "base has room for one more element, so both appends write into the same array slot. a and b are two views of one array, and the second write wins."
  - q: "How do you stop an append through a sub-slice from overwriting the original's later elements?"
    options:
      - "Use a full slice expression such as s[lo:hi:hi], so the sub-slice has no spare capacity"
      - Call copy() after the append
      - It can't happen; append always allocates
    answer: 0
    explain: "The third index caps the capacity. With no spare room, the next append must allocate a new array and leave the original alone."
  - q: "You range over the same map twice in a row. What order do you get?"
    options:
      - Insertion order both times
      - Sorted key order
      - Unspecified, and often different each time
    answer: 2
    explain: "The spec says the order is not specified and not guaranteed to repeat. Collect the keys and sort them (slices.Sorted(maps.Keys(m))) when you need a stable order."
links:
  - title: "Go Slices: usage and internals"
    url: https://go.dev/blog/slices-intro
  - title: "Go maps in action"
    url: https://go.dev/blog/maps
  - title: "Faster Go maps with Swiss Tables"
    url: https://go.dev/blog/swisstable
---
Go's two built-in collections hide simple structures. A slice is a small header (a pointer into an array, a length and a capacity) and a map is a pointer to a hash table that the runtime manages. Passing either to a function copies only that small value, so the callee sees the same elements. Most of the surprises, and the bugs, follow from that.

## Slices share arrays

`s[i:j]` makes a new header that points into the same array. Writes through one slice are visible through every other slice of that array. `append` is where it gets subtle:

```go
package main

import "fmt"

func main() {
	base := make([]int, 3, 4) // len 3, cap 4: one free slot
	a := append(base, 1)      // fits: writes into base's array
	b := append(base, 2)      // fits too: overwrites the same slot
	fmt.Println(a[3], b[3])   // 2 2

	c := append(base[:3:3], 3) // full slice expression caps it at 3, so append copies
	fmt.Println(c[3], a[3])    // 3 2

	var s []int
	last := -1
	for i := 0; i < 2000; i++ {
		s = append(s, i)
		if cap(s) != last {
			fmt.Print(cap(s), " ")
			last = cap(s)
		}
	}
	fmt.Println()
}
```

When capacity runs out, `append` allocates a larger array, copies, and returns a header for the new one. The old slice still points at the old array. That is why you must always use the result: `s = append(s, x)`. With Go 1.26 the capacities printed were `4 8 16 32 64 128 256 512 848 1280 1792 2560`: doubling while small, then growing by a smaller factor, rounded up to the allocator's size classes. The exact numbers are an implementation detail and change between releases; only "amortised constant time" is promised.

Two practical consequences:

- A function that appends to a slice it was given may, or may not, change the caller's elements. Return the new slice and document who owns it.
- A small slice of a huge array keeps the whole array alive. Copy out what you need (`slices.Clone`) before storing it.

## Maps

A map value is a pointer to a runtime hash table, so a `nil` map can be read (it is empty) but writing to it panics. Since Go 1.24 the table is based on Swiss tables, which made lookups and inserts faster. It didn't change the rules:

- **Iteration order is unspecified.** The spec doesn't promise any order, and in practice the order differs from one `range` loop to the next. Running a loop over a five-key map three times printed `eabcd abcde cdeab`. For a stable order, sort the keys: `slices.Sorted(maps.Keys(m))`.
- **Entries aren't addressable.** `&m[k]` doesn't compile, because growing the table moves entries. Store pointers, or read, modify and write back.
- **No concurrent writes.** If one goroutine writes while another reads or writes, that is a data race; the runtime often notices and stops with `fatal error: concurrent map writes`. Use a `sync.Mutex`, or `sync.Map` for its two specialised cases (keys written once and read many times, or goroutines working on disjoint keys).

Since Go 1.22, `for i := range n` counts from 0 to n-1, and each loop iteration gets its own copy of the loop variables, so closures and goroutines started inside a loop no longer all see the last value.
