---
id: sql-postgres
title: "SQL and PostgreSQL: what the database really does"
promise: "What happens between sending a query and getting rows back: the planner and its plans, the indexes it can use, the transactions and row versions that let many writers share a table, and what changes when you add a pooler, replicas and partitions."
kind: skill
level: intermediate
tags: [data, backend]
stages:
  - title: How a query runs
    blurb: Plans, indexes and joins
    topics: [sql-query-life, sql-explain, sql-indexes, sql-joins]
  - title: Shaping the data
    blurb: Constraints, tables and pages
    topics: [sql-constraints, sql-normalisation, sql-pagination]
  - title: Many writers at once
    blurb: Isolation, row versions, locks
    topics: [sql-transactions, sql-mvcc, sql-locks]
  - title: Running it for real
    blurb: Connections, replicas, partitions
    topics: [sql-pooling, sql-replication, sql-partitioning]
bridges:
  - id: cursor-pagination
    why: "Keyset pagination is the database half of a cursor API: the cursor you hand the client is the last (created_at, id) you returned."
  - id: write-ahead-log
    why: PostgreSQL's WAL is the textbook case. The library topic shows the same idea in Kafka, etcd and other systems.
  - id: read-replicas
    why: "Streaming replicas are asynchronous by default, so a read straight after a write can miss it. The library topic covers read-your-writes routing."
  - id: outbox
    why: "One transaction can write the order and the event row together; a relay publishes the event afterwards, so you never commit one without the other."
  - id: sharding
    why: Partitioning splits one table inside one server. When one server is not enough, the same choice of key decides how you shard across many.
next: [inside-db, redis]
---
Written for PostgreSQL 16 and 17; the links point to the version 17 manual. The examples were run on a scratch database (orders, customers and accounts tables with a few hundred thousand rows). Costs and timings in the plans will differ on your machine, but the plan shapes are what matter.
