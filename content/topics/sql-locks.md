---
id: sql-locks
title: Locks and deadlocks
summary: Who waits for whom, and how to stop waiting in circles
why: A migration that waits for one lock can stall every query behind it, and two transactions locking rows in opposite orders will deadlock under load.
requires: [sql-mvcc]
lesson: none
points:
  - title: Writers lock rows, not readers
    text: An UPDATE or DELETE locks the rows it changes until the transaction ends; plain SELECTs take no row locks and are never blocked by them.
  - title: Table locks come from DDL
    text: Most ALTER TABLE forms take ACCESS EXCLUSIVE, which conflicts with everything, including SELECT.
  - title: Lock queues stack up
    text: A DDL statement waiting for a lock also blocks every later query that needs a conflicting lock, so set lock_timeout.
  - title: Deadlocks are detected, not prevented
    text: PostgreSQL notices a cycle after deadlock_timeout (1 s by default) and aborts one transaction; lock in a consistent order to avoid them.
quiz_hint: Draw who holds what and who is waiting for what. A cycle is a deadlock; a long line is a queue.
quiz:
  - q: "Transaction 1 updates account 1 then account 2. Transaction 2 updates account 2 then account 1. Both start at the same moment. What happens?"
    options:
      - Both succeed
      - Each waits for the other; after deadlock_timeout PostgreSQL aborts one with "deadlock detected" and the other continues
      - Both wait forever
    answer: 1
    explain: Which one is aborted cannot be relied on. The fix is to lock rows in a consistent order, for example always the lower account id first.
  - q: "A long report query is running on orders. You run ALTER TABLE orders ADD COLUMN note text. Why do all new SELECTs on orders start hanging?"
    options:
      - ADD COLUMN rewrites the table
      - The ALTER waits for an ACCESS EXCLUSIVE lock behind the report, and new queries queue behind the ALTER
      - SELECTs always wait for DDL
    answer: 1
    explain: Adding a nullable column without a volatile default is quick once it gets the lock, but it must wait for the lock, and later requests queue behind it. SET lock_timeout = '2s' makes the ALTER give up instead, so you can retry.
  - q: Several workers take jobs from a table. How can each claim a different job without waiting on rows other workers have locked?
    options:
      - "SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1"
      - LOCK TABLE jobs IN ACCESS EXCLUSIVE MODE
      - Use serializable isolation
    answer: 0
    explain: SKIP LOCKED passes over rows another transaction has locked, which is exactly what a queue of competing workers needs.
links:
  - title: Explicit locking (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/explicit-locking.html
  - title: SELECT, the locking clause (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-select.html
  - title: Lock management settings (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/runtime-config-locks.html
---
MVCC removes most locking between readers and writers, but not all of it. Two transactions that change the same row must take turns, and schema changes need the table to themselves. PostgreSQL takes these locks automatically. Problems start when locks are held for a long time, or taken in an order that lets two transactions wait for each other.

## Row locks

`UPDATE`, `DELETE` and `SELECT ... FOR UPDATE` lock the rows they touch until the transaction commits or rolls back. Another writer of the same row waits; plain readers do not, they see the last committed version. Variants let you say what you need:

```sql
-- Lock the row you are about to change, so nobody changes it under you
BEGIN;
SELECT balance_cents FROM accounts WHERE id = 1 FOR UPDATE;
UPDATE accounts SET balance_cents = balance_cents - 100 WHERE id = 1;
COMMIT;

-- Fail at once instead of waiting
SELECT * FROM accounts WHERE id = 1 FOR UPDATE NOWAIT;

-- Work queue: each worker takes a job nobody else holds
SELECT id FROM jobs WHERE state = 'ready'
ORDER BY id LIMIT 1
FOR UPDATE SKIP LOCKED;
```

`FOR SHARE`, `FOR NO KEY UPDATE` and `FOR KEY SHARE` are weaker modes; foreign key checks use `FOR KEY SHARE` on the parent row, so inserting an order does not block an update of the customer's name.

## Table locks

Every statement takes a table-level lock too, but the ordinary ones (`ACCESS SHARE` for `SELECT`, `ROW EXCLUSIVE` for writes) do not conflict with each other. The one to fear is `ACCESS EXCLUSIVE`, taken by most forms of `ALTER TABLE`, `DROP`, `TRUNCATE` and `VACUUM FULL`. It conflicts with everything.

Lock requests wait in a queue. If an `ALTER TABLE` is waiting behind a long query, every new query on that table queues behind the `ALTER`, and an instant change takes the site down. Set a timeout for migrations and retry:

```sql
SET lock_timeout = '2s';
ALTER TABLE orders ADD COLUMN note text;
```

To see who is blocking whom:

```sql
SELECT pid, pg_blocking_pids(pid) AS blocked_by, state, left(query, 60)
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

## Deadlocks

Two transfers, one from account 1 to 2 and one from 2 to 1, started together:

```text
ERROR:  deadlock detected
DETAIL:  Process 96066 waits for ShareLock on transaction 893; blocked by process 96064.
Process 96064 waits for ShareLock on transaction 894; blocked by process 96066.
CONTEXT:  while updating tuple (0,11) in relation "accounts"
```

A waiting backend checks for a cycle after `deadlock_timeout` (1 second by default). If it finds one, one transaction is aborted and the others proceed. Which one is not predictable. The fixes are ordinary:

- Take locks in a consistent order: update the lower account id first, whichever direction the money goes.
- Keep transactions short, so the window for a cycle is small.
- Treat a deadlock (SQLSTATE `40P01`) like a serialization failure: roll back and retry.

## Advisory locks

For coordination that is not about a particular row, such as "only one instance runs this job", `pg_advisory_lock(key)` and `pg_try_advisory_lock(key)` take a lock on a number of your choosing. Session-level advisory locks last until released or the connection closes, which matters behind a transaction-mode pooler; `pg_advisory_xact_lock` is released at the end of the transaction.
