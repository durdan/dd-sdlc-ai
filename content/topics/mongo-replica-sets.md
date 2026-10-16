---
id: mongo-replica-sets
title: "Replica sets, elections and failover"
summary: One primary, copies that can take over
why: "Failover is automatic, but it is not instant and not free: writes stop for seconds, and writes the old primary never replicated can be rolled back. Applications must be ready for both."
requires: [mongo-documents]
lesson: none
points:
  - title: One primary takes writes
    text: "Secondaries copy the primary's oplog, an ordered log of changes, and apply it to their own data."
  - title: A majority elects the next primary
    text: "If the primary is unreachable for electionTimeoutMillis (10 s by default), a secondary that can reach a majority of voters calls an election."
  - title: Writes pause during failover
    text: "Until a new primary is elected, writes fail. Drivers retry a write once (retryable writes) and rediscover the new primary."
  - title: Unreplicated writes roll back
    text: "A write the old primary accepted but no majority received is undone when it rejoins, unless it was written with w majority."
quiz_hint: Count votes. Which side of a network split can still form a majority?
quiz:
  - q: "A three-member replica set is split by the network: the primary on one side, both secondaries on the other. What happens?"
    options:
      - Both sides keep a primary
      - "The primary steps down because it sees only a minority; the two secondaries elect a new primary"
      - Writes continue on the old primary until someone intervenes
    answer: 1
    explain: "A primary that cannot see a majority of voters steps down, and only a side with a majority can elect one. That is why replica sets use an odd number of voting members, and why two data centres alone cannot fail over automatically in both directions."
  - q: Why might you prefer three data-bearing members to two members plus an arbiter?
    options:
      - Arbiters are not allowed in MongoDB 8
      - "With an arbiter, losing one data-bearing member leaves a single copy, and majority writes cannot be acknowledged until it returns"
      - Arbiters slow down reads
    answer: 1
    explain: "An arbiter votes but holds no data. In P-S-A with one data member down, an election can still succeed, but w majority writes block or time out because only one member can store them."
  - q: "A write succeeded with w: 1. Two seconds later the primary crashed before any secondary copied it. What happens to the write?"
    options:
      - It is copied when the old primary rejoins
      - "The new primary never had it; when the old primary rejoins as a secondary it rolls the write back"
      - The new primary waits for the old one before accepting writes
    answer: 1
    explain: "Rolled-back documents are saved to rollback files for manual recovery, but the application was told the write succeeded. w majority prevents this."
links:
  - { title: "Replica set elections (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/replica-set-elections/" }
  - { title: "Rollbacks during replica set failover (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/replica-set-rollbacks/" }
  - { title: "Retryable writes (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/retryable-writes/" }
---
A replica set is a group of `mongod` processes holding the same data. One member, the primary, accepts writes and records each change in its oplog, a capped collection of operations. The secondaries pull the oplog and apply it, a little behind. If the primary disappears, the remaining members elect a new one. Production deployments use replica sets even on a single shard, and features such as transactions and change streams require one.

## What the set looks like

```js
rs.initiate({ _id: "rs0", members: [
  { _id: 0, host: "mongo1:27017" }, { _id: 1, host: "mongo2:27017" }, { _id: 2, host: "mongo3:27017" }
] })
rs.status().members.map(m => m.name + " " + m.stateStr)
```

```text
[ 'mongo1:27017 PRIMARY', 'mongo2:27017 SECONDARY', 'mongo3:27017 SECONDARY' ]
```

A set can have up to 50 members, of which at most 7 vote. Use an odd number of voters so that a majority exists on one side of any split.

## Elections

Members send each other heartbeats every two seconds. When a secondary has not heard from the primary for `electionTimeoutMillis` (10,000 ms by default), it raises the term and asks for votes. The first candidate to win a majority becomes primary; members prefer candidates with the most recent oplog and higher `priority`. MongoDB's documentation puts the median time to elect a new primary at no more than about 12 seconds with default settings.

Two failovers on the test set show the difference between a clean shutdown and a crash:

```text
docker stop  (clean shutdown)  14:05:17 stop sent  -> 14:05:18 new primary, term 2
docker kill  (crash)           14:05:35 kill sent  -> 14:05:44 new primary, term 3
```

A primary shutting down cleanly steps down and lets a caught-up secondary take over at once. A crashed one has to be noticed first, which costs most of the election timeout. A primary that can see only a minority of voters steps down by itself, so a partitioned old primary stops accepting writes.

## What applications see

During those seconds, writes fail with errors such as `NotWritablePrimary` and reads that require the primary fail too. Drivers since the 4.2 generation enable retryable writes: they retry an eligible write once after a network error or failover, and the server uses a transaction number to avoid applying it twice. Set your timeouts so a 10 to 15 second gap degrades gracefully instead of cascading.

## Rollback

If the old primary accepted writes that no other member received, the new primary's history does not include them. When the old member rejoins, it rolls those writes back to match, saving them to rollback files for manual inspection. The client was told they succeeded. Writing with `w: "majority"` (the next topic) means an acknowledged write is on a majority and survives any election.
