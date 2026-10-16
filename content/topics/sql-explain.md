---
id: sql-explain
title: Reading EXPLAIN and EXPLAIN ANALYZE
summary: The plan tree, estimated and actual
why: You cannot fix a slow query by guessing; EXPLAIN shows exactly where the time and the rows go.
requires: [sql-query-life]
lesson: none
points:
  - title: EXPLAIN plans, ANALYZE runs
    text: Plain EXPLAIN shows the chosen plan and its estimates; EXPLAIN ANALYZE also executes the statement and adds real times and row counts.
  - title: Read it inside out
    text: The most indented nodes run first and feed their parents; the top node produces the result.
  - title: Compare estimated and actual rows
    text: A large gap between rows= in the estimate and rows= in the actuals usually explains a bad plan.
  - title: Mind the side effects
    text: EXPLAIN ANALYZE of an UPDATE really updates; wrap it in BEGIN and ROLLBACK.
quiz_hint: Look for the node with loops greater than one, and remember which numbers are per loop.
quiz:
  - q: You want to see the real timing of a DELETE without losing data. What do you do?
    options:
      - Run EXPLAIN DELETE ...; it executes but rolls back automatically
      - "Run BEGIN; EXPLAIN ANALYZE DELETE ...; ROLLBACK;"
      - EXPLAIN ANALYZE never executes data-changing statements
    answer: 1
    explain: Plain EXPLAIN does not execute anything, so it has no real timings. ANALYZE executes the statement with all its side effects; the documentation suggests wrapping it in a transaction you roll back.
  - q: "A node shows (actual time=0.010..0.020 rows=25 loops=40). How many rows did it produce in total?"
    options: ["25", "40", "About 1,000"]
    answer: 2
    explain: Actual rows and times are averages per loop. This node ran 40 times (typically the inner side of a nested loop), producing about 25 x 40 rows in total.
  - q: The plan estimates rows=5 for a filter that actually returns 80,000 rows. What is the most likely cause?
    options: ["The disk is slow", "Missing or stale statistics, or correlated columns the planner cannot see", "The query has no LIMIT"]
    answer: 1
    explain: "The planner chose its plan for 5 rows. Run ANALYZE, raise the column's statistics target, or create extended statistics (CREATE STATISTICS) for correlated columns."
links:
  - title: Using EXPLAIN (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/using-explain.html
  - title: EXPLAIN (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-explain.html
  - title: Row estimation examples (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/row-estimation-examples.html
---
`EXPLAIN` prints the plan the planner chose, as a tree of nodes, each with its estimated cost and row count. `EXPLAIN ANALYZE` goes further: it runs the statement and prints what really happened at each node. Most query tuning is reading these two outputs and asking where the estimate and the reality part ways.

## A first plan

With no index on `customer_id`, looking up one customer's orders in a 500,000-row table:

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;
```

```text
Gather  (cost=1000.00..7672.67 rows=25 width=34) (actual time=0.252..9.184 rows=25 loops=1)
  Workers Planned: 2
  Workers Launched: 2
  ->  Parallel Seq Scan on orders  (cost=0.00..6670.17 rows=10 width=34) (actual time=1.214..4.549 rows=8 loops=3)
        Filter: (customer_id = 42)
        Rows Removed by Filter: 166658
Planning Time: 0.007 ms
Execution Time: 9.189 ms
```

Read it from the innermost node outwards. Three processes (the leader and two workers, hence `loops=3`) each scan a share of the table, keep about 8 rows and throw away about 166,658. `Gather` collects their rows. `cost=1000.00..7672.67` is the estimated cost to produce the first row and all rows, in planner units, not milliseconds. `rows=25` was the estimate; the actual was also 25, so the statistics are good. The problem is simply that the only way to find 25 rows is to read all of them.

After `CREATE INDEX orders_customer_idx ON orders (customer_id)`, the same query with `EXPLAIN (ANALYZE, BUFFERS)` (planning lines trimmed):

```text
Bitmap Heap Scan on orders  (cost=4.62..99.05 rows=25 width=34) (actual time=0.018..0.037 rows=25 loops=1)
  Recheck Cond: (customer_id = 42)
  Heap Blocks: exact=25
  Buffers: shared hit=28 read=3
  ->  Bitmap Index Scan on orders_customer_idx  (cost=0.00..4.61 rows=25 width=0) (actual time=0.015..0.015 rows=25 loops=1)
        Index Cond: (customer_id = 42)
Execution Time: 0.048 ms
```

The index finds the 25 row locations, sorts them by page, and the heap scan visits just those pages. From 9 ms to 0.05 ms.

## What to look at

- **Estimated against actual rows.** A factor of 10 or more at a low node means the nodes above were planned for the wrong amount of data.
- **loops.** Actual rows and times are per loop. A cheap-looking inner node with `loops=50000` is where the time goes.
- **Rows Removed by Filter.** Many rows read and thrown away suggests a missing or unusable index.
- **Buffers.** `EXPLAIN (ANALYZE, BUFFERS)` shows pages found in shared memory (`hit`) and read from the operating system (`read`). It is often a better measure of work than time, which depends on what happens to be cached.
- **Sort Method.** `external merge  Disk: ...` means the sort did not fit in `work_mem` and spilled to disk.

## Run it safely

`ANALYZE` really executes the statement. For writes:

```sql
BEGIN;
EXPLAIN (ANALYZE, BUFFERS) UPDATE orders SET status = 'paid' WHERE id = 7;
ROLLBACK;
```

Timing every node also adds overhead, so the total can be a little higher than the query's real runtime. For queries that are slow only now and then, the `auto_explain` module can log the plans of statements that exceed a duration you choose.
