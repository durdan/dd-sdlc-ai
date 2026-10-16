---
id: sql-replication
title: WAL, replication and read replicas
summary: Log first, then copy the log elsewhere
why: The write-ahead log is what makes commits durable and replicas possible; replica lag is what makes "I just saved it, where is it?" bugs.
requires: [sql-mvcc]
lesson: none
points:
  - title: Log before data
    text: A change is durable once its WAL record is flushed to disk; the data pages themselves can be written later, and replayed from the log after a crash.
  - title: Replicas replay the log
    text: Streaming replication sends WAL records to standbys, which apply them and can serve read-only queries (hot standby).
  - title: Asynchronous by default
    text: The primary does not wait for standbys, so a replica can be behind and a failover can lose the last commits.
  - title: Synchronous costs latency
    text: With synchronous_standby_names set, a commit waits for standby confirmation; synchronous_commit chooses how far the standby must have got.
quiz_hint: Follow one commit from the primary's WAL to a standby, and ask at each step what a reader there would see.
quiz:
  - q: A user saves their profile and the next page load, served by a read replica, shows the old values. Why?
    options:
      - The write failed
      - Replication is asynchronous by default; the replica had not replayed that commit yet
      - Replicas cache pages for 60 seconds
    answer: 1
    explain: Route reads that must see the user's own writes to the primary (for a while after a write, or always for that user's session), or wait for the replica to reach the commit's WAL position.
  - q: With streaming replication left asynchronous, the primary's disk dies right after a commit returned success. What can happen?
    options:
      - Nothing is ever lost; the commit was acknowledged
      - Commits not yet sent to a standby are lost if you fail over to it
      - The standby refuses to be promoted
    answer: 1
    explain: The documentation is explicit that log shipping is asynchronous and there is a window for data loss. Synchronous replication closes it at the cost of commit latency.
  - q: "A long report runs on a hot standby while the primary vacuums the rows it is reading. What can happen to the report?"
    options:
      - It always waits forever
      - It can be cancelled with a conflict error once max_standby_streaming_delay is exceeded, unless hot_standby_feedback lets the primary keep those rows
      - The primary pauses vacuum automatically, always
    answer: 1
    explain: Replaying the cleanup would remove rows the query still needs. The standby delays replay up to a limit, then cancels the query. hot_standby_feedback avoids it but can cause bloat on the primary.
links:
  - title: Write-ahead logging (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/wal-intro.html
  - title: Log-shipping standby servers (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/warm-standby.html
  - title: Hot standby (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/hot-standby.html
  - title: pg_stat_replication and the statistics views (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/monitoring-stats.html
---
Before PostgreSQL changes a data page on disk, it writes a description of the change to the write-ahead log (WAL), an append-only sequence of records. A commit is durable once its WAL records are flushed; the modified pages can stay in memory and be written out later by checkpoints. After a crash, the server replays the WAL from the last checkpoint and arrives at the same state. The same log, streamed to another server and replayed there, is how replication works.

## Why log first

Writing a few sequential WAL records is much cheaper than writing every changed page in random places at every commit. Pages are flushed in bulk at checkpoints. The settings that trade safety for speed live here:

- `synchronous_commit = on` (the default): a commit waits for its WAL to be flushed locally (and, if synchronous standbys are configured, for them as well).
- `synchronous_commit = off`: the commit returns before the flush. A crash can lose the last few hundred milliseconds of commits, but never corrupts the database. It can be set per transaction, for data you could afford to lose.
- `fsync = off`: never in production; a crash can corrupt data.

## Streaming replication

A standby connects to the primary and receives WAL records as they are generated, then replays them. With `hot_standby` on (the default), it accepts read-only queries while it does. Two consequences follow.

**Replicas lag.** Streaming replication is asynchronous by default. The primary commits and replies, and the standby applies the change a little later, usually milliseconds, sometimes much more under heavy writes or a slow network. Measure it on the primary:

```sql
SELECT application_name, state, write_lag, flush_lag, replay_lag
FROM pg_stat_replication;
```

`replay_lag` is how long it takes for a commit on the primary to be visible on that standby. On the standby itself, `now() - pg_last_xact_replay_timestamp()` gives a rough figure (misleading when the primary is idle).

**Failover can lose commits.** If the primary dies, commits it had acknowledged but not yet sent are gone when you promote a standby. Synchronous replication closes that window:

```text
synchronous_standby_names = 'ANY 1 (replica_a, replica_b)'
synchronous_commit = on            # wait until a standby has flushed the WAL
# remote_apply: wait until it has also applied it, so reads there see the commit
```

Every commit now waits for a network round trip, and if no synchronous standby is available, commits wait indefinitely. That is why "ANY 1" of two or more is common.

## Reading from replicas

Read replicas spread read load, but the application has to cope with lag:

- Send reads that must see the user's own recent writes to the primary, for example for a few seconds after a write, or remember the WAL position of the write (`pg_current_wal_lsn()`) and read from a replica only once `pg_last_wal_replay_lsn()` has passed it.
- Use replicas for work that tolerates staleness: reports, search indexing, dashboards.

Long queries on a standby can conflict with replay: if the primary vacuums away rows the query still needs, the standby holds back replay up to `max_standby_streaming_delay` (30 seconds by default) and then cancels the query. `hot_standby_feedback = on` tells the primary to keep those rows instead, at the cost of bloat there.

Logical replication is a different mechanism: it decodes the WAL into row changes per table and publishes them to subscribers, which can run other major versions or have different indexes. It is how change data capture tools read PostgreSQL.
