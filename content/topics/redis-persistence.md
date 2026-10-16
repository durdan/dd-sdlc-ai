---
id: redis-persistence
title: "Persistence: RDB, AOF and what you can lose"
summary: Snapshots, an append-only log, or both
why: Redis acknowledges a write before it is on disk; how much you lose in a crash is a setting you should choose on purpose.
requires: [redis-single-thread]
lesson: none
points:
  - title: RDB is a snapshot
    text: A forked child writes the whole dataset to a compact file every so often; a crash loses everything since the last snapshot.
  - title: AOF is a log of writes
    text: Every write command is appended to a file; with appendfsync everysec, a crash loses about a second.
  - title: Fork has a cost
    text: Snapshots and AOF rewrites fork the process; with a large dataset the fork can pause Redis, and copy-on-write needs spare memory.
  - title: Persistence is not replication
    text: Disk files protect against a restart; they do not keep you running when the machine dies.
quiz_hint: For each setting, ask what has reached the disk at the moment the power goes out.
quiz:
  - q: Redis runs with only the default RDB snapshots (save 3600 1 300 100 60 10000). The process is killed. What can be lost?
    options:
      - Nothing
      - Every write since the last completed snapshot, potentially minutes of data
      - Only the last write
    answer: 1
    explain: These save points snapshot after 1 hour if at least 1 key changed, after 5 minutes if at least 100 did, or after 60 seconds if at least 10,000 did. Writes after the last snapshot are not on disk.
  - q: "AOF is on with appendfsync everysec, the default. How much data can a server crash lose?"
    options: ["About one second of writes", "None", "Everything since the last rewrite"]
    answer: 0
    explain: The log is fsynced once a second. appendfsync always fsyncs before replying, which is much slower; appendfsync no leaves it to the operating system.
  - q: A Redis instance using 24 GB on a 32 GB machine starts a background save during heavy writes and is killed by the OOM killer. Why?
    options:
      - RDB files are loaded into memory
      - The forked child shares pages copy-on-write; every page the parent changes during the save is copied, so memory use can grow towards double
      - AOF and RDB cannot both run
    answer: 1
    explain: Leave headroom for copy-on-write when persistence or replication is enabled, which is also why the eviction docs advise setting maxmemory below the machine's RAM.
links:
  - title: Redis persistence (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
  - title: Diagnosing latency, fork (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/
  - title: Redis FAQ, snapshots and fork (Redis docs)
    url: https://redis.io/docs/latest/develop/get-started/faq/
---
Redis keeps the dataset in memory and replies to a write as soon as it has changed memory. Whether that write survives a crash depends on persistence, which comes in two forms: RDB snapshots of the whole dataset at intervals, and the AOF, an append-only file of every write. You can use either, both, or neither (for a pure cache, restarting empty may be fine). Each choice has a clear answer to "what do I lose if the process dies now?".

## RDB snapshots

Redis forks a child process that writes the dataset to a compact binary file (`dump.rdb`) while the parent keeps serving. A Redis 8 server with no configuration file reports these save points:

```text
> CONFIG GET save
1) "save"
2) "3600 1 300 100 60 10000"
```

That means: snapshot after 3600 seconds if at least 1 key changed, after 300 seconds if 100 changed, after 60 seconds if 10,000 changed. Between snapshots nothing reaches the disk, so a crash can lose minutes of writes. In exchange, RDB files are small, fast to load at restart, and convenient for backups: copy the file somewhere else.

`BGSAVE` takes a snapshot on demand; `SAVE` does it on the main thread and blocks everyone, so avoid it.

## AOF: the append-only file

With `appendonly yes`, every command that changes data is appended to a log, and replayed at startup. How often the log is forced to disk with `fsync` sets the loss window:

| `appendfsync` | Loss on a crash | Cost |
| --- | --- | --- |
| `always` | Practically none | An fsync before replying; much slower |
| `everysec` (default) | About one second | Small |
| `no` | Whatever the operating system has not flushed, often tens of seconds | Least |

The log grows, so Redis rewrites it in the background into a minimal form. Since Redis 7, the AOF is multi-part: a base file (by default in RDB format, `aof-use-rdb-preamble yes`) plus incremental files, tracked by a manifest in the `appenddirname` directory.

Many deployments enable both: AOF for a short loss window, RDB for backups and fast restarts. When AOF is on, Redis uses it at startup, because it is the more complete of the two.

## The fork and its memory

Both snapshots and AOF rewrites fork the process. The child shares memory with the parent through copy-on-write: pages are only copied when the parent changes them. With a write-heavy workload during a long save, much of the dataset may be copied, so the machine needs spare memory beyond the dataset itself, and Linux should be configured with `vm.overcommit_memory = 1` as the Redis docs advise. Forking a process with a very large memory footprint also takes time, during which the main thread is paused; on some virtual machines this was notably slow.

## What persistence does not do

Disk files protect against a restart. They do not keep the service available while a machine is replaced, and a disk that dies with the machine takes its files with it. For that you need replicas, and for backups you need copies elsewhere. And with any setting other than `appendfsync always`, an acknowledged write can still be lost, which matters for anything Redis is the only home for.
