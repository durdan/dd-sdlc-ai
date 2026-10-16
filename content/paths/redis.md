---
id: redis
title: "Redis: fast data and its trade-offs"
promise: "Why Redis is fast, which data structure fits which job, and what you give up for the speed: memory limits and eviction, persistence that can lose writes, asynchronous replicas, a cluster with hash slots, and locks with caveats."
kind: skill
level: intermediate
tags: [data, backend]
stages:
  - title: Why it is fast
    blurb: One thread, the right structure
    topics: [redis-single-thread, redis-data-structures, redis-expiry]
  - title: Using it well
    blurb: Caches, atomic steps, messages, locks
    topics: [redis-caching, redis-atomic, redis-messaging, redis-locks]
  - title: Keeping it running
    blurb: Disk, replicas, cluster, memory
    topics: [redis-persistence, redis-replication, redis-cluster, redis-memory]
bridges:
  - id: cache-aside
    why: Most Redis deployments start as a cache-aside cache. The library topic covers invalidation and consistency in more depth.
  - id: distributed-locks
    why: "SET NX PX is the building block; the library topic covers leases, fencing tokens and when a lock service with consensus is the better tool."
  - id: rate-limiting
    why: "INCR with EXPIRE, or a sorted set of timestamps, is how many rate limiters are built; the library topic compares the algorithms."
  - id: consistent-hashing
    why: Redis Cluster uses fixed hash slots rather than a hash ring, but the problem it solves (moving few keys when nodes change) is the same.
  - id: event-streaming
    why: "Redis Streams give you consumer groups and acknowledgements in memory; Kafka-style logs trade latency for retention and replay at scale."
next: [fast-reads, sql-postgres]
---
Written for Redis Open Source 7.x and 8.x (the examples were run on 8.8). On licensing: Redis up to 7.2 was BSD-licensed. From 7.4 (2024) it was dual-licensed under RSALv2 and SSPLv1, which are source-available rather than open source licences, and from Redis 8 (2025) AGPLv3 was added as a third option. In March 2024 contributors forked Redis 7.2.4 as Valkey, under the BSD licence and backed by the Linux Foundation. The core ideas here apply to both; features added to either project since the fork may differ, so check the documentation of the one you run.
