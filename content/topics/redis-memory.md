---
id: redis-memory
title: Memory sizing
summary: Everything must fit, with room to spare
why: Redis's dataset lives in RAM; running out means evictions, refused writes or the process being killed, usually at peak traffic.
requires: [redis-expiry, redis-data-structures]
lesson: none
points:
  - title: Data is not the only cost
    text: Each key carries overhead, and buffers for clients, replication and the AOF also use memory.
  - title: Measure, then multiply
    text: Load a realistic sample, read used_memory and MEMORY USAGE, and scale up; do not estimate from the raw size of your values.
  - title: Leave headroom
    text: Set maxmemory well below the machine's RAM, to leave room for copy-on-write during saves, buffers and fragmentation.
  - title: Fragmentation is real
    text: RSS can stay higher than used memory after many deletes; mem_fragmentation_ratio shows how much.
quiz_hint: List everything that uses memory besides the values themselves, and what happens to memory during a background save.
quiz:
  - q: You store 10 million keys whose values are 20 bytes each. Is about 200 MB of RAM enough?
    options:
      - Yes
      - No; per-key overhead (the key itself, the dictionary entry, object headers, allocator rounding) usually makes the real figure several times larger
      - It depends only on the eviction policy
    answer: 1
    explain: For tiny values, overhead dominates. Measure with a sample (MEMORY USAGE, INFO memory), and consider grouping small values into hashes, which use a compact encoding while small.
  - q: "A 16 GB machine runs Redis with persistence on. Why not set maxmemory to 16gb?"
    options:
      - maxmemory cannot exceed 4 GB
      - Forked saves need copy-on-write memory, and buffers and fragmentation need space too; without headroom the operating system may kill the process
      - The setting is ignored with persistence on
    answer: 1
    explain: The eviction docs advise leaving RAM free for replication and persistence buffers. Many operators keep maxmemory well below physical RAM when snapshots or AOF rewrites run.
  - q: "INFO memory shows used_memory 2 GB and mem_fragmentation_ratio 1.8 after a large batch of deletes. What does that mean?"
    options:
      - Redis is leaking memory
      - The process's resident memory (RSS) is about 1.8 times what Redis is using for data; freed memory has not been returned to the operating system
      - Half the keys are corrupt
    answer: 1
    explain: The allocator keeps freed pages, partly scattered. Active defragmentation (activedefrag yes, with jemalloc builds) can reclaim some of it while running.
links:
  - title: Memory optimisation (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/
  - title: MEMORY USAGE (Redis docs)
    url: https://redis.io/docs/latest/commands/memory-usage/
  - title: Key eviction, maxmemory (Redis docs)
    url: https://redis.io/docs/latest/develop/reference/eviction/
  - title: INFO (Redis docs)
    url: https://redis.io/docs/latest/commands/info/
---
Everything Redis stores is in memory, so the size of the machine is the size of the database. Sizing is more than adding up value sizes: each key has overhead, client and replication buffers take space, background saves need extra memory while they run, and the allocator rarely hands freed memory back neatly. Most Redis incidents involving memory come from a plan that only counted the data.

## Where memory goes

- **Keys and values**, plus per-key overhead: the key string, the entry in the main dictionary, object headers, expiry metadata, and allocator rounding. For small values the overhead can be larger than the value.
- **Encodings**: small hashes, lists, sets and sorted sets use compact listpacks; past their thresholds they convert to larger structures. Grouping many tiny values as fields of hashes can save a lot of memory.
- **Buffers**: each client's output buffer (a slow pub/sub subscriber or a huge reply can grow it), the replication backlog, and buffers for replicas being synchronised.
- **Copy-on-write during forks**: a snapshot or AOF rewrite shares memory with the parent, but every page written during the save is duplicated.
- **Fragmentation**: after many deletes and resizes, the process holds more memory (RSS) than Redis is using for data.

## Measure it

Load a realistic sample, then look:

```text
> MEMORY USAGE user:42
(integer) 84
> MEMORY USAGE user:42:name
(integer) 48
```

Even a three-letter string costs 48 bytes once its key and overhead are counted. For the whole instance:

```text
> INFO memory
used_memory_human:2.00M
maxmemory_policy:noeviction
mem_fragmentation_ratio:1.74
...
```

(These figures come from a small test instance capped at 2 MB; on datasets that small, fixed overhead dominates and the fragmentation ratio means little.) Multiply the sample's per-key figure by the expected key count, add the buffers and growth you expect, then add headroom. `redis-cli --bigkeys` and `--memkeys` scan for the largest keys without blocking the server for long.

## Set limits

```text
maxmemory 10gb
maxmemory-policy allkeys-lru     # for a cache; noeviction for data you must keep
```

`maxmemory` limits the dataset, not everything the process uses, so set it below the machine's RAM: buffers, fragmentation and copy-on-write all sit on top. How much below depends on the write rate during saves; leaving a large share free on machines that fork for persistence is common practice. With `noeviction`, reaching the limit means writes fail with an OOM error, which is right for data that must not be silently dropped and wrong for a cache.

## Keep it in check

- Give cache keys TTLs, and bound collections that grow (`LTRIM`, `XADD ... MAXLEN`, `ZREMRANGEBYRANK`).
- Avoid very large single keys; they are slow to delete (use `UNLINK`), to migrate between cluster nodes and to replicate.
- Watch `used_memory`, `evicted_keys`, `mem_fragmentation_ratio` and client output buffers over time, and alert well before the limit.
- When one machine is not enough, shard with Redis Cluster rather than buying ever larger hosts; smaller primaries also fork and restart faster.
