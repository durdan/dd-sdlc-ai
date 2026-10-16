---
id: sql-pagination
title: "Pagination: OFFSET versus keyset"
summary: Skip rows, or continue after the last one
why: OFFSET pages get slower the deeper you go and can repeat or skip rows; keyset pages stay fast and stable.
requires: [sql-indexes]
lesson: none
points:
  - title: OFFSET still does the work
    text: Rows skipped by OFFSET are computed and thrown away, so page 10,000 costs as much as reading 10,000 pages.
  - title: Keyset continues after a key
    text: "WHERE (created_at, id) > (last seen values) ORDER BY created_at, id LIMIT n seeks straight to the next page through an index."
  - title: A unique, total order
    text: Sort by something unique (add the primary key as a tie-breaker), or rows with equal sort values can repeat or vanish between pages.
  - title: The trade-off
    text: Keyset gives next and previous, not "jump to page 37"; that is usually fine for feeds and APIs.
quiz_hint: Think about what the database must read to produce page N, and what happens when a row is inserted before the page you are on.
quiz:
  - q: "Why does SELECT ... ORDER BY created_at, id LIMIT 20 OFFSET 400000 get slow even with an index on (created_at, id)?"
    options:
      - The index is not used for ORDER BY
      - The server still reads the first 400,020 entries in order and discards 400,000 of them
      - LIMIT disables indexes
    answer: 1
    explain: An index lets it read rows in order without sorting, but nothing lets it jump to the 400,000th entry. The documentation notes that skipped rows still have to be computed.
  - q: A user is on page 1 of a newest-first list when a new item is published. They click "next" (OFFSET 20). What do they see?
    options:
      - Exactly the next 20 items
      - The last item of page 1 again at the top of page 2, because everything shifted down by one
      - An error
    answer: 1
    explain: OFFSET counts positions, and positions moved. A keyset query continues after the last item actually shown, so inserts elsewhere do not shift it.
  - q: Why add id to ORDER BY created_at for keyset pagination?
    options:
      - Ids are faster to compare
      - Several rows can share a created_at; with id as a tie-breaker the order is unique, so "after this row" is unambiguous
      - PostgreSQL requires a primary key in every ORDER BY
    answer: 1
    explain: Without a unique order, rows with the same timestamp could fall on either side of the boundary and be skipped or repeated.
links:
  - title: LIMIT and OFFSET (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/queries-limit.html
  - title: Row constructor comparison (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/functions-comparisons.html
  - title: Multicolumn indexes (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/indexes-multicolumn.html
---
The obvious way to page through results is `LIMIT 20 OFFSET 40` for page 3. It works, and for the first few pages it is fine. But `OFFSET` means "produce these rows and throw them away", so the cost grows with the page number, and because it counts positions, any insert or delete before your page shifts what you see. Keyset pagination (sometimes called seek pagination) asks for "the next 20 after the last row I showed" instead.

## OFFSET, measured

On 500,000 orders with an index on `(created_at, id)`:

```sql
EXPLAIN ANALYZE
SELECT id, created_at FROM orders
ORDER BY created_at, id
LIMIT 20 OFFSET 400000;
```

```text
Limit  (cost=12160.42..12161.03 rows=20 width=16) (actual time=20.032..20.033 rows=20 loops=1)
  ->  Index Only Scan using orders_created_id_idx on orders  (cost=0.42..15200.42 rows=500000 width=16) (actual time=0.034..14.033 rows=400020 loops=1)
        Heap Fetches: 0
Execution Time: 20.039 ms
```

The index avoids a sort, but it still reads 400,020 entries to return 20. Without the index it was worse: a full sort of the table that spilled to disk (61 ms here). Page 20,000 of a busy table is reached by crawlers and scripts more often than by people, and each such request does this much work.

## Keyset: continue after the last row

Remember the sort key of the last row on the page and ask for rows after it. A row comparison does this neatly, and matches the index column by column:

```sql
EXPLAIN ANALYZE
SELECT id, created_at FROM orders
WHERE (created_at, id) > ('2025-10-10 18:40:00+01', 400000)
ORDER BY created_at, id
LIMIT 20;
```

```text
Limit  (cost=0.42..1.08 rows=20 width=16) (actual time=0.014..0.015 rows=20 loops=1)
  ->  Index Only Scan using orders_created_id_idx on orders  (cost=0.42..3049.08 rows=92609 width=16) (actual time=0.014..0.014 rows=20 loops=1)
        Index Cond: (ROW(created_at, id) > ROW('2025-10-10 18:40:00+01'::timestamp with time zone, 400000))
        Heap Fetches: 0
Execution Time: 0.026 ms
```

The `Index Cond` lets the scan start at the boundary and read exactly 20 entries, however deep the page. Three rules make it correct:

- The `ORDER BY` must be unique; add the primary key as a last column.
- The index must match the `ORDER BY` (same columns, same order; for newest first, compare with `<` and order `DESC` on both).
- The cursor you give the client is the last row's sort values, usually encoded as an opaque string.

## Seeing both behaviours

This plain-JS simulation pages through 100 rows sorted by `(createdAt, id)`, inserts a row at the front between pages, and counts the rows each method has to examine.

```js run
// 100 orders sorted by (createdAt, id); several share a timestamp
let rows = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, createdAt: Math.floor(i / 3) }))
const byKey = (a, b) => a.createdAt - b.createdAt || a.id - b.id

// OFFSET: skip n rows, every time counting from the start
function offsetPage(page, size) {
  const sorted = [...rows].sort(byKey)
  return { rows: sorted.slice(page * size, page * size + size), examined: page * size + size }
}

// Keyset: continue after the last (createdAt, id) seen
function keysetPage(after, size) {
  const sorted = [...rows].sort(byKey)
  const start = after ? sorted.findIndex((r) => byKey(r, after) > 0) : 0
  return { rows: sorted.slice(start, start + size), examined: size }  // with an index, the database seeks straight to start
}

const p1 = offsetPage(0, 10)
const k1 = keysetPage(null, 10)
console.log("page 1 ids:", p1.rows.map((r) => r.id).join(","))

// A new row is inserted at the very start while the user reads page 1
rows.push({ id: 101, createdAt: -1 })

const p2 = offsetPage(1, 10)
const k2 = keysetPage(k1.rows.at(-1), 10)
console.log("offset page 2:", p2.rows.map((r) => r.id).join(","), "(id 10 shown twice)")
console.log("keyset page 2:", k2.rows.map((r) => r.id).join(","))
console.log("rows examined for page 9 -> offset:", offsetPage(8, 10).examined, " keyset:", keysetPage({ createdAt: 26, id: 80 }, 10).examined)
```

The cost of keyset pagination is that you cannot jump to an arbitrary page number. For infinite scroll, "load more" and API cursors that is no loss; for a numbered admin table with a few pages, `OFFSET` is fine.
