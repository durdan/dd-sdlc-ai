---
id: sql-transactions
title: Transactions and isolation levels
summary: What concurrent transactions can see of each other
why: Most concurrency bugs in database code are anomalies the chosen isolation level permits; knowing which ones lets you pick a level or a lock on purpose.
requires: [sql-constraints]
lesson: diagram
points:
  - title: Read committed is the default
    text: Each statement sees data committed before that statement began, so two reads in one transaction can disagree.
  - title: Repeatable read is a snapshot
    text: The whole transaction sees one snapshot, and an update of a row someone else changed meanwhile fails with a serialization error.
  - title: Serializable detects the rest
    text: PostgreSQL's serializable level aborts transactions whose combined effect could not have happened one at a time, including write skew.
  - title: Retries are part of the deal
    text: Under repeatable read and serializable, be ready to retry the whole transaction on SQLSTATE 40001.
quiz_hint: For each anomaly, ask whether the two transactions wrote the same row or different rows.
quiz:
  - q: "Under read committed, transaction A reads a balance of 10000, computes 9900 in the application and writes SET balance = 9900. Meanwhile B runs SET balance = balance - 500 and commits. What is the final balance?"
    options: ["9400", "9900, so B's withdrawal is lost", "An error"]
    answer: 1
    explain: A's update waits for B, then overwrites it with a value computed from a stale read. Writing balance = balance - 100 (computed in SQL), SELECT ... FOR UPDATE, or repeatable read would each prevent the lost update.
  - q: Two doctors are on call. Each transaction checks that at least two are on duty, then takes a different doctor off. Under repeatable read, what happens?
    options:
      - One transaction fails
      - Both commit and nobody is on call (write skew)
      - They deadlock
    answer: 1
    explain: The transactions wrote different rows, so there is no write conflict. Only serializable detects the dangerous read/write pattern and aborts one of them.
  - q: Which isolation levels does PostgreSQL actually implement differently?
    options:
      - All four standard levels
      - Three; read uncommitted behaves like read committed, so dirty reads never happen
      - Only serializable
    answer: 1
    explain: You may request read uncommitted, but PostgreSQL gives you read committed. Its repeatable read also prevents phantom reads, which the standard allows.
links:
  - title: Transaction isolation (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/transaction-iso.html
  - title: Concurrency control (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/mvcc.html
  - title: Data consistency checks at the application level (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/applevel-consistency.html
---
A transaction groups statements so that they all take effect or none do (`BEGIN` ... `COMMIT`, or `ROLLBACK` to undo). That is atomicity, and it is the easy part. The harder question is what a transaction sees while others run at the same time. That is the isolation level, and PostgreSQL offers three that behave differently: read committed (the default), repeatable read and serializable.

## The anomalies

- **Dirty read**: seeing another transaction's uncommitted changes. Never happens in PostgreSQL.
- **Non-repeatable read**: reading a row twice and getting different values, because another transaction committed a change in between.
- **Phantom read**: running the same query twice and getting a different set of rows.
- **Lost update**: two transactions read a value, both write a new value based on it, and one write silently replaces the other.
- **Write skew / serialization anomaly**: each transaction is fine alone, but together they break a rule neither could see being broken.

## Read committed

Each statement gets a fresh snapshot. If an `UPDATE` finds a row that another transaction is changing, it waits; when that commits, it re-evaluates its condition against the new version and applies the change to it. So `SET balance_cents = balance_cents - 100` is safe: both decrements land. The lost update happens when the new value is computed in the application from an earlier read:

```sql
-- Transaction A (read committed)
BEGIN;
SELECT balance_cents FROM accounts WHERE id = 1;   -- 10000
-- ... meanwhile B commits: UPDATE accounts SET balance_cents = balance_cents - 500 WHERE id = 1;
UPDATE accounts SET balance_cents = 9900 WHERE id = 1;  -- computed from the stale 10000
COMMIT;
-- final balance: 9900, B's -500 is lost
```

Fixes: do the arithmetic in SQL, lock the row when reading it with `SELECT ... FOR UPDATE`, or use a stronger level.

## Repeatable read

The transaction sees one snapshot, taken at its first statement. Running the same lost-update script under `BEGIN ISOLATION LEVEL REPEATABLE READ`, A's update no longer overwrites B:

```text
ERROR:  could not serialize access due to concurrent update
```

The application must retry the transaction from the start, reading the new balance. Repeatable read in PostgreSQL also prevents phantoms. What it does not prevent is write skew. In the on-call example, both transactions count two doctors on duty and each takes a different doctor off; there is no conflicting write, so both commit and nobody is on call.

## Serializable

Serializable uses Serializable Snapshot Isolation: transactions run on snapshots as in repeatable read, while PostgreSQL tracks which transactions read data that others wrote. If the pattern could produce a result no serial order could, one transaction is aborted. The on-call example:

```text
ERROR:  could not serialize access due to read/write dependencies among transactions
DETAIL:  Reason code: Canceled on identification as a pivot, during commit attempt.
HINT:  The transaction might succeed if retried.
```

All serialization failures use SQLSTATE `40001`. Code that uses repeatable read or serializable needs a retry loop around the whole transaction, including the reads, and should keep transactions short, because the longer they run the more they conflict. Declaring read-only transactions as `READ ONLY` helps the serializable checks.

The next topic shows the machinery that makes all of this possible without readers blocking writers: row versions.

```trace diagram
id: lost-update
title: A lost update under read committed
subtitle: Two transactions, one balance
kind: sequence
elements:
  - { id: a, label: Transaction A, role: client }
  - { id: pg, label: PostgreSQL, role: data }
  - { id: b, label: Transaction B, role: client }
edges:
  - { id: a-begin, from: a, to: pg, label: BEGIN }
  - { id: a-read, from: a, to: pg, label: SELECT balance }
  - { id: a-got, from: pg, to: a, label: "10000", style: dashed }
  - { id: b-update, from: b, to: pg, label: UPDATE … - 500 }
  - { id: b-commit, from: b, to: pg, label: COMMIT }
  - { id: a-update, from: a, to: pg, label: "UPDATE … = 9900" }
  - { id: a-commit, from: a, to: pg, label: COMMIT }
phases:
  - { label: A reads, from: a-begin, to: a-got }
  - { label: B commits, from: b-update, to: b-commit }
  - { label: A writes a stale value, from: a-update, to: a-commit }
steps:
  - caption: Two transactions change the same account. A wants to take 100 cents off, B 500.
  - caption: A begins and reads the balance, 10000.
    trace: [a-begin, a-read, a-got]
  - caption: Meanwhile B subtracts 500 in SQL and commits. The balance is now 9500.
    trace: [b-update, b-commit]
  - caption: A writes 9900, computed in the application from the 10000 it read earlier, and commits.
    trace: [a-update, a-commit]
  - caption: The final balance is 9900. B's change is lost. Fix it by doing the arithmetic in SQL, locking the row with SELECT … FOR UPDATE, or using a stronger isolation level.
    focus: [pg]
```
