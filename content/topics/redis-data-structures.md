---
id: redis-data-structures
title: Data structures, and choosing one
summary: Strings, hashes, lists, sets, sorted sets, streams
why: Picking the structure that matches the question turns a read-modify-write dance into one atomic server-side command.
requires: [redis-single-thread]
lesson: none
points:
  - title: Values have types
    text: A key holds a string, hash, list, set, sorted set or stream (among others), and each type has its own commands.
  - title: Let the server do the work
    text: INCR, HINCRBY, SADD and ZINCRBY change data in place, atomically, instead of reading it out and writing it back.
  - title: Sorted sets rank
    text: Members ordered by a score give leaderboards, priority queues, time-ordered indexes and sliding windows.
  - title: Small collections are compact
    text: Small hashes, lists, sets and sorted sets are stored in a compact listpack encoding, which saves a lot of memory.
quiz_hint: Name the question you will ask most often (how many, is it there, the top N, the next one) and pick the structure that answers it in one command.
quiz:
  - q: You need a live top-10 of players by score, updated thousands of times a second. Which structure fits?
    options: ["A list, sorted by the client", "A sorted set with ZINCRBY and ZRANGE ... REV", "A string holding JSON"]
    answer: 1
    explain: A sorted set keeps members ordered by score; updates and rank queries are O(log N). The others need the client to read, sort and write back.
  - q: A user object has 20 fields and the app often updates just the last-login time. What is the usual choice?
    options:
      - One string with the whole JSON, rewritten on every change
      - A hash, so HSET can change one field and HGET can read one
      - A set of field names
    answer: 1
    explain: A hash stores field-value pairs under one key. Small hashes also use the compact listpack encoding.
  - q: Which structure answers "has this user already liked this post?" directly?
    options: ["A set, with SISMEMBER", "A list, with LRANGE and a search in the client", "A counter"]
    answer: 0
    explain: A set holds unique members and checks membership in O(1). SADD returns 0 for a duplicate, so it also prevents double likes.
links:
  - title: Understand Redis data types (Redis docs)
    url: https://redis.io/docs/latest/develop/data-types/
  - title: Sorted sets (Redis docs)
    url: https://redis.io/docs/latest/develop/data-types/sorted-sets/
  - title: Memory optimisation, special encodings (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/
  - title: Keys and values (Redis docs)
    url: https://redis.io/docs/latest/develop/using-commands/keyspace/
---
Redis is often described as a key-value store, but the values are data structures with their own operations. The value under a key can be a string, a hash of fields, a list, a set, a sorted set or a stream (and more specialised types such as bitmaps, HyperLogLogs, geospatial indexes and, from Redis 8, JSON and vector sets). The commands for each type run on the server, atomically, so the right choice often removes a race and a round trip at once.

## The core types

All of these outputs come from `redis-cli`:

```text
# String: bytes up to 512 MB; also counters
> SET user:42:name Ana
OK
> INCR page:home:views
(integer) 1
> INCRBY page:home:views 10
(integer) 11

# Hash: fields under one key
> HSET user:42 name Ana country DK plan pro
(integer) 3
> HINCRBY user:42 logins 1
(integer) 1

# List: ordered, push and pop at both ends
> LPUSH jobs:email j1 j2 j3
(integer) 3
> RPOP jobs:email
"j1"

# Set: unique members
> SADD post:7:likes u1 u2 u3 u2
(integer) 3
> SISMEMBER post:7:likes u9
(integer) 0

# Sorted set: members ordered by a score
> ZADD leaderboard 3100 ana 2900 ben 3350 cy
(integer) 3
> ZINCRBY leaderboard 300 ben
"3200"
> ZRANGE leaderboard 0 -1 REV WITHSCORES
1) "cy"
2) "3350"
3) "ben"
4) "3200"
5) "ana"
6) "3100"
```

`SADD` counted three, not four: `u2` was already there. Streams, an append-only log with consumer groups, have their own topic later.

## Choosing

| You want | Use | Commands |
| --- | --- | --- |
| A cached blob, a flag, a counter | String | `GET`, `SET`, `INCR`, `SET ... NX` |
| An object whose fields change separately | Hash | `HSET`, `HGET`, `HINCRBY` |
| A simple queue or a capped recent-items list | List | `LPUSH`, `RPOP`, `BLMOVE`, `LTRIM` |
| Uniqueness and membership | Set | `SADD`, `SISMEMBER`, `SINTER` |
| Ranking, by score or by time | Sorted set | `ZADD`, `ZINCRBY`, `ZRANGE`, `ZREMRANGEBYSCORE` |
| An event log with acknowledgements | Stream | `XADD`, `XREADGROUP`, `XACK` |

Some patterns: a sorted set with timestamps as scores is a time-ordered index (`ZRANGE ... BYSCORE` for a time window) or a sliding-window rate limiter. `LPUSH` plus `LTRIM 0 99` keeps the latest hundred items. A set per tag plus `SINTER` answers "posts with both tags".

## Encodings and size

Redis picks an internal encoding per value. Small hashes, lists, sets and sorted sets use a listpack, a compact contiguous block; above a size threshold (configurable, for example `hash-max-listpack-entries`) they convert to a hash table or skip list, which is faster for large sizes and uses more memory. Strings holding integers are stored as integers.

```text
> OBJECT ENCODING user:42
"listpack"
> OBJECT ENCODING page:home:views
"int"
> MEMORY USAGE user:42
(integer) 84
```

This is why many small hashes can take less memory than the same data as separate string keys: each top-level key has its own overhead.

## Naming keys

Keys are binary-safe strings; the convention is colon-separated segments, `object:id:field`, such as `user:42:sessions`. Keep them readable but not huge, and never rely on listing them with `KEYS` in production. If you need to find all keys for a user, keep that index yourself, for example in a set.
