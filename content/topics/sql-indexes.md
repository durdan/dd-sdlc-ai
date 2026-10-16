---
id: sql-indexes
title: "Indexes: B-trees, column order and covering"
summary: A sorted copy of some columns, and when it helps
why: The right index turns a full scan into a few page reads; the wrong one costs every write and is never used.
requires: [sql-explain]
lesson: none
points:
  - title: A B-tree is a sorted list you can jump into
    text: It finds an exact value or the start of a range in a few page reads, and returns entries in order.
  - title: Leading columns first
    text: An index on (a, b) serves conditions on a, or on a and b; a condition on b alone can use it only by scanning much of it.
  - title: Covering avoids the table
    text: If the index holds every column the query needs, PostgreSQL can answer with an index-only scan.
  - title: Indexes are not free
    text: Every insert and most updates must change every index on the table, and the planner skips an index when a scan is cheaper.
quiz_hint: Picture the index as a phone book sorted by its first column, then its second. Which lookups can jump straight to the right page?
quiz:
  - q: "There is an index on orders (customer_id, created_at). Which query can use it most efficiently?"
    options:
      - "WHERE created_at > now() - interval '1 day'"
      - "WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10"
      - "WHERE total_cents > 1000"
    answer: 1
    explain: Equality on the leading column narrows the index to one customer, whose entries are already sorted by created_at; PostgreSQL reads them backwards and stops after 10. A condition on created_at alone cannot jump to a starting point.
  - q: "There is an index on customers (email), but WHERE lower(email) = 'ana@example.com' does a sequential scan. Why?"
    options:
      - The index is corrupt
      - "The index stores email, not lower(email); the condition needs an expression index on lower(email)"
      - Text columns cannot be indexed
    answer: 1
    explain: An index can only be used when the condition compares the indexed expression itself. CREATE INDEX ON customers (lower(email)) fixes it, as long as queries use exactly that expression.
  - q: "A quarter of all orders have status = 'paid'. With an index on status, why does WHERE status = 'paid' still use a sequential scan?"
    options:
      - Because reading a quarter of the table through random index lookups is estimated to cost more than reading it all in order
      - Because the index is only used inside transactions
      - Because equality conditions never use indexes
    answer: 0
    explain: Indexes win when a condition is selective. For a large fraction of the table, a sequential scan that reads each page once is cheaper.
links:
  - title: Multicolumn indexes (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/indexes-multicolumn.html
  - title: Index-only scans and covering indexes (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/indexes-index-only-scans.html
  - title: Index types (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/indexes-types.html
  - title: Examining index usage (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/indexes-examine.html
---
A table's rows sit in its heap in no particular order. An index is a separate structure that keeps some columns sorted, each entry pointing back at a row's location. PostgreSQL's default index type is the B-tree: a shallow, balanced tree of pages where even millions of entries are only three or four page reads from the root. It handles equality, ranges (`<`, `BETWEEN`), `ORDER BY` and prefix `LIKE 'abc%'` (with the right collation or operator class).

## Column order in a composite index

An index on `(customer_id, created_at)` is sorted by customer first, then by time within each customer. The documentation's rule: equality conditions on leading columns, plus a range condition on the first column without an equality, limit the part of the index that is read.

```sql
CREATE INDEX orders_cust_created_idx ON orders (customer_id, created_at);

EXPLAIN ANALYZE
SELECT id, total_cents FROM orders
WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10;
```

The plan, with costs left out:

```text
Limit  (actual time=0.013..0.024 rows=10 loops=1)
  ->  Index Scan Backward using orders_cust_created_idx on orders  (actual time=0.013..0.023 rows=10 loops=1)
        Index Cond: (customer_id = 42)
```

No sort node: the entries for customer 42 are already in time order, so PostgreSQL walks them backwards and stops after ten. A query filtering only on `created_at` gets a sequential scan instead, because one day's orders are spread across every customer's section of the index. Put the column you filter by equality first, and the one you sort or range on after it.

## Covering indexes and index-only scans

Usually an index scan still visits the table to fetch the other columns. If the index contains everything the query asks for, it need not:

```sql
CREATE INDEX orders_cust_cov_idx ON orders (customer_id, created_at) INCLUDE (total_cents);

EXPLAIN ANALYZE SELECT created_at, total_cents FROM orders WHERE customer_id = 42;
```

Again without costs:

```text
Index Only Scan using orders_cust_cov_idx on orders  (actual time=0.033..0.034 rows=25 loops=1)
  Index Cond: (customer_id = 42)
  Heap Fetches: 0
```

`INCLUDE` columns are stored in the index but not sorted on. There is a catch: the index does not know whether a row version is visible to your transaction, so PostgreSQL checks the table's visibility map, which VACUUM maintains. On a table with many recent changes, `Heap Fetches` climbs and the advantage shrinks.

## When an index is not used

- **The condition is not on the indexed expression.** `WHERE lower(email) = ...` needs `CREATE INDEX ON customers (lower(email))`; `WHERE customer_id + 0 = 42` defeats the index on `customer_id`.
- **The condition is not selective.** For a value that matches a large share of rows, reading the whole table in order is cheaper.
- **The leading column is missing** from the condition, as above.
- **Types do not match**, so a cast is applied to the column rather than to the constant.
- **The statistics are stale**, so the planner thinks the condition matches far more, or fewer, rows than it does.

## The cost side

Each index is written on every insert and on updates that change indexed columns (or that cannot be done as a heap-only update). `pg_stat_user_indexes.idx_scan` shows indexes that are never scanned; they are candidates for removal. On a busy table, build new indexes with `CREATE INDEX CONCURRENTLY`, which takes longer but does not block writes.
