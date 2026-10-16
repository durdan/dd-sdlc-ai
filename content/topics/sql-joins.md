---
id: sql-joins
title: "Joins: nested loop, hash and merge"
summary: Three ways to match rows, chosen by estimated size
why: The same join can take microseconds or minutes depending on the method; knowing the three lets you read why a plan was chosen.
requires: [sql-indexes]
lesson: none
points:
  - title: Nested loop
    text: For each row on the outer side, look up matches on the inner side. Excellent when the outer side is small and the inner side has an index.
  - title: Hash join
    text: Build a hash table from the smaller input, then stream the larger one past it. Good for big, unsorted inputs with an equality condition.
  - title: Merge join
    text: Walk two inputs that are sorted on the join key side by side. Good when both are already in order, for example from indexes.
  - title: Estimates choose
    text: The planner picks the method and order from estimated row counts, so a bad estimate often shows up as a nested loop over far too many rows.
quiz_hint: Ask how many rows come out of each side, and whether either side is already sorted or indexed on the join key.
quiz:
  - q: "One customer (found by a unique email) joined to their orders, with an index on orders.customer_id. Which method fits best?"
    options: [Nested loop, Hash join, Merge join]
    answer: 0
    explain: One outer row means one index lookup on the inner side. Building a hash table or sorting would be wasted work.
  - q: Total sales per country across all 500,000 orders and 20,000 customers. Which method does PostgreSQL typically choose?
    options: [Nested loop with an index lookup per order, Hash join with a hash table built from customers, Cartesian product]
    answer: 1
    explain: Every row of both tables is needed. Hashing the smaller table once and streaming the larger one through it reads each table once.
  - q: A plan shows a nested loop where the outer side was estimated at 10 rows but actually produced 200,000. What does that tell you?
    options:
      - Nothing; nested loops are always the fastest
      - The plan was chosen for 10 rows; fix the estimate (statistics, query shape) and the planner will probably choose a hash join
      - The inner table needs VACUUM FULL
    answer: 1
    explain: The method was reasonable for the estimate. The root cause is the estimate, not the join method.
links:
  - title: Planner/optimizer, join methods (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/planner-optimizer.html
  - title: Controlling the planner with explicit JOIN clauses (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/explicit-joins.html
  - title: Planner method configuration (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/runtime-config-query.html
---
A join in SQL says which rows belong together. The planner decides how to find them, choosing for each pair of inputs one of three methods, and choosing the order in which tables are joined. For queries with many tables (by default 12 or more `FROM` items) it switches from exhaustive search to a genetic algorithm, because the number of possible orders explodes.

## Nested loop

For every row from the outer input, scan the inner input for matches. That sounds slow, and it is if both sides are large. But if the outer side is small and the inner side has an index on the join column, each "scan" is one index lookup:

```sql
EXPLAIN SELECT o.id, c.email
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE c.email = 'user42@example.com';
```

```text
Nested Loop  (cost=4.90..107.60 rows=25 width=29)
  ->  Index Scan using customers_email_key on customers c  (cost=0.29..8.30 rows=1 width=29)
        Index Cond: (email = 'user42@example.com'::text)
  ->  Bitmap Heap Scan on orders o  (cost=4.62..99.05 rows=25 width=16)
        Recheck Cond: (customer_id = c.id)
        ->  Bitmap Index Scan on orders_cust_cov_idx  (cost=0.00..4.61 rows=25 width=0)
              Index Cond: (customer_id = c.id)
```

One customer, one index lookup into orders. Nested loops are also the only method that works for conditions that are not equalities, such as `ON a.ts BETWEEN b.start AND b.finish`.

## Hash join

Read the smaller input, build an in-memory hash table on the join key, then stream the larger input and probe the table for each row. Each input is read once. It needs an equality condition, and the hash table must fit in `work_mem` (times `hash_mem_multiplier`) or it is split into batches on disk.

```sql
EXPLAIN SELECT c.country, sum(o.total_cents)
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.country;
```

```text
...
  ->  Hash Join  (cost=607.00..7303.32 rows=208333 width=7)
        Hash Cond: (o.customer_id = c.id)
        ->  Parallel Seq Scan on orders o  (cost=0.00..6149.33 rows=208333 width=12)
        ->  Hash  (cost=357.00..357.00 rows=20000 width=11)
              ->  Seq Scan on customers c  (cost=0.00..357.00 rows=20000 width=11)
```

The 20,000 customers become the hash table; the 500,000 orders stream past it, split across parallel workers.

## Merge join

If both inputs are sorted on the join key, walk them together like merging two sorted lists. The sort can come from an index or from an explicit sort node. Asking for every order with its customer, sorted by `customer_id` (`ORDER BY o.customer_id`), makes this the cheapest plan here, because both indexes already deliver rows in that order:

```text
Merge Join  (cost=0.74..32472.70 rows=500000 width=24)
  Merge Cond: (o.customer_id = c.id)
  ->  Index Scan using orders_customer_idx on orders o  (cost=0.42..25644.42 rows=500000 width=16)
  ->  Index Only Scan using customers_pkey on customers c  (cost=0.29..528.29 rows=20000 width=8)
```

## When the planner gets it wrong

The choice depends almost entirely on estimated row counts. The classic failure is a nested loop chosen for an outer side estimated at a handful of rows that turns out to be hundreds of thousands, each paying for an index lookup. Find the node where estimated and actual rows diverge and fix that: fresh statistics, extended statistics for correlated columns, or a rewrite the planner can estimate. Settings such as `enable_nestloop = off` exist for experiments in a session, to see what the alternative plan would cost; they are a diagnostic tool, not a fix to ship.

Index the foreign key columns you join on. PostgreSQL indexes the referenced primary key automatically, but not the referencing column.
