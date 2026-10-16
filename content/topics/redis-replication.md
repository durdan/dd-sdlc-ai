---
id: redis-replication
title: Replication and Sentinel
summary: Asynchronous copies, and automatic failover
why: Replicas keep Redis available when a machine dies, but asynchronous replication means a failover can quietly drop acknowledged writes.
requires: [redis-persistence]
lesson: none
points:
  - title: Replicas copy the primary
    text: A replica receives a snapshot, then the stream of write commands, and serves read-only queries.
  - title: Asynchronous by default
    text: The primary replies before replicas have the write, so a replica can lag and a failover can lose recent writes.
  - title: WAIT is not consensus
    text: WAIT blocks until N replicas acknowledge, which narrows the window but does not make Redis strongly consistent.
  - title: Sentinel automates failover
    text: At least three Sentinels watch the primary, agree that it is down, promote a replica and tell clients where the new primary is.
quiz_hint: Follow a write that was acknowledged to the client just before the primary dies. Was it on a replica yet?
quiz:
  - q: A client writes to the primary and gets OK. The primary dies a moment later and Sentinel promotes a replica. Is the write guaranteed to be there?
    options:
      - Yes, OK means it is replicated
      - No; replication is asynchronous, so the replica may not have received it
      - Yes, Sentinel copies it during failover
    answer: 1
    explain: The Sentinel docs say plainly that acknowledged writes are not guaranteed to survive failures, because replication is asynchronous.
  - q: Why does the Sentinel documentation say to run at least three Sentinels on independent machines?
    options:
      - Sentinels share load
      - So that a majority can still agree and authorise a failover when one of them, or its machine, is down or partitioned
      - Clients need three addresses
    answer: 1
    explain: The quorum detects the failure, but a failover also needs a majority of Sentinels to authorise it. With two, losing one leaves no majority.
  - q: What does min-replicas-to-write 1 with min-replicas-max-lag 10 do on the primary?
    options:
      - Makes every write synchronous
      - Makes the primary refuse writes when fewer than one replica has acknowledged within the last 10 seconds, limiting how long an isolated primary keeps accepting writes
      - Limits how many replicas can connect
    answer: 1
    explain: An old primary cut off from its replicas stops accepting writes after the lag limit, which bounds what is lost when a replica on the other side is promoted.
links:
  - title: Redis replication (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/replication/
  - title: High availability with Redis Sentinel (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/
  - title: WAIT (Redis docs)
    url: https://redis.io/docs/latest/commands/wait/
---
A Redis replica is a copy of a primary that follows its changes. It gives you a standby for when the primary's machine fails, and somewhere to send reads. Replication in Redis is asynchronous: the primary replies to the client first and sends the change to replicas afterwards. That is what keeps writes fast, and it is also why "the write was acknowledged" and "the write survived a failover" are different statements.

## How a replica follows

```text
# on the replica
REPLICAOF 10.0.0.5 6379
```

The replica connects, the primary sends a snapshot (an RDB produced by a fork, or streamed straight to the socket with diskless sync), then streams every write command it executes. If the connection drops briefly, the replica asks to continue from its offset in the primary's replication backlog (a partial resync); if it has fallen too far behind, it needs a full resync, another snapshot. Size `repl-backlog-size` for the outages you expect.

Replicas are read-only by default and can serve reads, but those reads can be slightly stale. `INFO replication` on the primary shows each replica's offset, and the difference from the primary's offset is how far behind it is.

## Narrowing the loss window

Two tools, neither of which turns Redis into a strongly consistent system:

- `WAIT numreplicas timeout` blocks the client until that many replicas have acknowledged its earlier writes, or the timeout passes. The replication docs stress that this does not make a set of Redis instances a CP system: a write acknowledged by a replica can still be lost depending on the failover.
- `min-replicas-to-write` and `min-replicas-max-lag` make a primary refuse writes when too few replicas are connected and recently caught up. A primary isolated by a network partition then stops accepting writes after a bounded time, instead of collecting writes that the promoted replica on the other side will never see.

## Sentinel

Replication alone does not fail over. Redis Sentinel is a separate process (`redis-sentinel`, or `redis-server --sentinel`) that monitors primaries, decides when one is down, promotes a replica, reconfigures the others, and tells clients the new address.

```text
sentinel monitor mymaster 10.0.0.5 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
```

The last argument of `monitor` (here 2) is the quorum: how many Sentinels must agree the primary is unreachable. To actually perform a failover, a Sentinel must also be authorised by a majority of all Sentinels. Hence the advice to run at least three, on machines that fail independently. Clients do not hard-code the primary; they ask Sentinel (`SENTINEL get-master-addr-by-name mymaster`), and most client libraries support this.

## What to expect in a failover

- A few seconds without a writable primary: detection (`down-after-milliseconds`) plus election and promotion.
- Possible loss of writes acknowledged by the old primary but not yet replicated.
- If the old primary was only partitioned, not dead, it may keep accepting writes from clients on its side until it is reconfigured as a replica, and those writes are discarded. `min-replicas-to-write` limits this.

So Redis with replicas and Sentinel is highly available, not strongly consistent. For a cache that is fine. For data that must not be lost, keep the source of truth somewhere with synchronous, consensus-based replication.
