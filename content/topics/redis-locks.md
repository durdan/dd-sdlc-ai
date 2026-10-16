---
id: redis-locks
title: Distributed locks and their caveats
summary: SET NX PX, Redlock, and the debate about both
why: A lock with a timeout can be held by two clients at once; whether that matters decides whether Redis is the right tool.
requires: [redis-atomic, redis-expiry]
lesson: none
points:
  - title: SET NX PX with a random token
    text: Acquire with SET key token NX PX ttl; release with a script that deletes the key only if it still holds your token.
  - title: The timeout is the danger
    text: If the holder pauses longer than the TTL (GC, swapping, a slow network), the lock expires and a second client takes it while the first still thinks it holds it.
  - title: Efficiency or correctness
    text: For avoiding duplicate work, an occasional double holder is tolerable; for protecting data, it is not, and the resource must check a fencing token.
  - title: Redlock is contested
    text: Redlock takes the lock on a majority of independent instances; Kleppmann argued its safety rests on timing assumptions, antirez replied, and the docs link both.
quiz_hint: Imagine the lock holder freezing for longer than the TTL, then waking up and writing.
quiz:
  - q: Why release a lock with a script that compares the token, instead of a plain DEL?
    options:
      - DEL is not atomic
      - If your lock already expired and another client took it, a plain DEL would delete their lock
      - Scripts are faster than DEL
    answer: 1
    explain: The random token identifies the holder. Compare and delete must be one atomic step, which is what the Lua script does.
  - q: "Client 1 holds a lock with a 30 s TTL, then a 40 s GC pause hits. Client 2 acquires the lock and writes. Client 1 wakes up and writes too. What prevents the damage?"
    options:
      - A longer TTL makes it impossible
      - A fencing token, an increasing number issued with each lock that the storage checks, rejecting writes with an older token
      - Using Redlock instead of a single instance
    answer: 1
    explain: Kleppmann's point is that no lock with auto-expiry can stop a paused client from acting late; only the resource refusing stale tokens can. Redlock alone does not provide such a counter.
  - q: You use a Redis lock so that only one instance sends the nightly report. Occasionally two send it. How serious is this?
    options:
      - It is an efficiency lock; a rare duplicate is a nuisance, and a single Redis instance is usually adequate
      - It is a correctness failure; you need Redlock
      - Locks cannot be used for scheduling
    answer: 0
    explain: Kleppmann distinguishes locks for efficiency (failure means duplicated work) from locks for correctness (failure means corrupt data). The tool should match the cost of failure.
links:
  - title: Distributed locks with Redis (Redis docs)
    url: https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
  - title: How to do distributed locking (Martin Kleppmann)
    url: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
  - title: Is Redlock safe? (antirez)
    url: http://antirez.com/news/101
  - title: SET (Redis docs)
    url: https://redis.io/docs/latest/commands/set/
---
A distributed lock lets one process among many do something at a time: run a scheduled job, process an invoice, rebuild a cache entry. Redis makes a simple lock easy, because `SET ... NX` is atomic and keys can expire. The expiry is also the problem: a lock that frees itself after a timeout can be held by two clients at once if one of them stalls. Whether that is acceptable depends on what the lock protects.

## The single-instance lock

Acquire with a random token, only if the key does not exist, with a time limit:

```text
> SET lock:invoice:7 3f9a1c NX PX 30000
OK
> SET lock:invoice:7 other NX PX 30000
(nil)                        # someone else holds it
```

Release only if the key still holds your token, atomically:

```text
> EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 lock:invoice:7 3f9a1c
(integer) 1
```

The token matters. Without it, a client whose lock has already expired would delete the next holder's lock. The TTL matters too: without one, a crashed holder keeps the lock forever.

## Redlock

A single Redis instance is a single point of failure, and with asynchronous replication a failover can lose a lock key that was just written, so two clients can hold the "same" lock. Redlock, described in the Redis docs, uses N independent masters (typically 5). The client tries to set the key on all of them with the same token and TTL, and holds the lock only if it succeeded on a majority within a time that is small compared with the TTL. The remaining validity is the TTL minus the time spent acquiring.

## The debate

In 2016 Martin Kleppmann published an analysis arguing that Redlock is unsafe for correctness. His main points:

- Any lock with automatic expiry can be held by two clients when one pauses (a GC pause, a page fault, a delayed network packet) for longer than the TTL. The paused client wakes up and acts as though it still holds the lock.
- The fix is a **fencing token**: a number that increases every time the lock is granted, sent with every write, and checked by the storage, which rejects a token older than one it has already seen. Redlock does not produce such a counter.
- Redlock's safety depends on timing assumptions: bounded network delay, bounded pauses, and clocks that do not jump. Algorithms built on consensus (such as ZooKeeper or etcd) stay safe when those assumptions fail and only lose liveness.

Salvatore Sanfilippo (antirez), Redis's creator, replied that fencing is not specific to Redlock: if the storage can check tokens, it can often provide the needed safety on its own, and the random token can be used for check-and-set. He argued that Redlock checks the elapsed time after acquiring, which limits the effect of delays before that point, and that clock jumps can be avoided operationally; he agreed implementations should use monotonic time. The Redis docs now link both pieces and recommend fencing tokens for long-running work.

## Choosing

- **Efficiency lock** (avoid doing the same work twice; a rare duplicate is tolerable): a single Redis instance with `SET NX PX` and a token is simple and usually fine.
- **Correctness lock** (two holders would corrupt data): make the protected resource enforce it, with fencing tokens, a conditional write, a unique constraint or a database row lock, or use a coordination service built on consensus. Redlock alone should not be the only thing standing between you and corrupt data.

In every case, set the TTL well above the expected work time, renew it for long jobs (only if you still hold the token), and design the work to be idempotent.
