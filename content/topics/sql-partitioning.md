---
id: sql-partitioning
title: Partitioning, at a high level
summary: One logical table, many physical ones
why: Partitioning makes dropping old data instant and keeps queries on recent data small, but only if the partition key matches how you query.
requires: [sql-indexes, sql-mvcc]
lesson: none
points:
  - title: A parent with children
    text: A partitioned table holds no rows itself; each row goes to the partition whose range, list or hash bucket matches its partition key.
  - title: Pruning skips partitions
    text: A query that filters on the partition key reads only the partitions that can match.
  - title: Retention becomes DROP
    text: Removing a month of data is dropping or detaching a partition, not a huge DELETE that VACUUM must clean up.
  - title: Keys and constraints follow the partition key
    text: A primary key or unique constraint on a partitioned table must include the partition key columns.
quiz_hint: Ask whether the query's WHERE clause mentions the partition key; if not, every partition is a candidate.
quiz:
  - q: "events is partitioned by month on created_at. A query filters only on user_id = 42. How many partitions does it scan?"
    options: ["Just the newest one", "All of them, because nothing in the condition rules any partition out", "None"]
    answer: 1
    explain: Pruning needs a condition on the partition key. Indexes on user_id in each partition help each scan, but every partition is still visited.
  - q: Why does CREATE TABLE ... (id bigint PRIMARY KEY, created_at timestamptz) PARTITION BY RANGE (created_at) fail?
    options:
      - bigint cannot be a primary key
      - A unique constraint on a partitioned table must include all partition key columns, and the primary key lacks created_at
      - Range partitioning needs an integer key
    answer: 1
    explain: Each partition can only enforce uniqueness within itself. Including the partition key guarantees that two equal keys would land in the same partition. Use PRIMARY KEY (id, created_at).
  - q: What is the cheapest way to delete everything older than twelve months from a table partitioned by month?
    options:
      - DELETE ... WHERE created_at < now() - interval '12 months'
      - Detach (or drop) the old partitions
      - VACUUM FULL
    answer: 1
    explain: A big DELETE writes a dead version for every row and leaves VACUUM a lot to clean. Dropping a partition removes its files at once; DETACH PARTITION ... CONCURRENTLY avoids blocking queries on the parent.
links:
  - title: Table partitioning (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/ddl-partitioning.html
  - title: CREATE TABLE, PARTITION BY (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-createtable.html
  - title: ALTER TABLE, ATTACH and DETACH PARTITION (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-altertable.html
---
Declarative partitioning lets one logical table be stored as several physical tables, called partitions. You query and insert into the parent; PostgreSQL routes each row to the partition its partition key belongs in, and skips partitions a query cannot need. It is a tool for very large tables, mostly time-series data such as events, logs or orders, where most queries touch recent rows and old rows are eventually deleted.

## The three kinds

- **Range**: each partition holds a range of key values, typically a month or a day of `created_at`.
- **List**: each partition holds listed values, such as a set of countries or tenants.
- **Hash**: rows are spread by a hash of the key into a fixed number of partitions (`MODULUS 8, REMAINDER 3`), when there is no natural range but you want smaller pieces.

```sql
CREATE TABLE events (
  id         bigint GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz NOT NULL,
  payload    jsonb,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_09 PARTITION OF events
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE events_2026_10 PARTITION OF events
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
```

Range bounds include the lower value and exclude the upper one. An insert with no matching partition fails, unless you add a `DEFAULT` partition. Partitions are usually created ahead of time by a scheduled job or an extension such as pg_partman.

## Pruning

A query that filters on the partition key reads only the partitions that can contain matching rows:

```sql
EXPLAIN SELECT count(*) FROM events
WHERE created_at >= '2026-10-05' AND created_at < '2026-10-06';
```

```text
Aggregate  (cost=790.57..790.58 rows=1 width=8)
  ->  Seq Scan on events_2026_10 events  (cost=0.00..787.01 rows=1422 width=0)
        Filter: ((created_at >= '2026-10-05 00:00:00+01'::timestamp with time zone) AND (created_at < '2026-10-06 00:00:00+01'::timestamp with time zone))
```

September is not even mentioned. Pruning also happens at execution time, for parameters and values from joins. A query without a condition on the key, though, visits every partition, so pick the key your important queries filter on.

## What partitioning buys

- **Cheap retention.** `DROP TABLE events_2025_09` or `ALTER TABLE events DETACH PARTITION events_2025_09 CONCURRENTLY` removes a month instantly, without a mass `DELETE`, dead tuples and a long vacuum.
- **Smaller working sets.** Recent partitions and their indexes stay small enough to keep in memory.
- **Per-partition maintenance.** Each partition is vacuumed and analysed on its own; old, unchanging ones need little.

## What it costs

- Unique and primary keys must include the partition key:

  ```text
  ERROR:  unique constraint on partitioned table must include all partitioning columns
  DETAIL:  PRIMARY KEY constraint on table "bad" lacks column "created_at" which is part of the partition key.
  ```

  So "id is unique across all events" can only be enforced together with `created_at`.
- Many partitions mean more planning work; thousands of tiny partitions usually make things slower, not faster.
- Updating a row's partition key moves it to another partition, which is a delete plus an insert.

Partitioning stays inside one server. When one server can no longer hold the data or the write load, the same question of which key to split on comes back as sharding across servers.
