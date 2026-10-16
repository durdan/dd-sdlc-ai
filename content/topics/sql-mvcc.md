---
id: sql-mvcc
title: "MVCC: row versions, dead tuples and VACUUM"
summary: Updates write new rows; VACUUM cleans up the old ones
why: Bloat, slow scans after mass updates and the dreaded wraparound shutdown all come from how PostgreSQL keeps old row versions.
requires: [sql-transactions]
lesson: none
points:
  - title: An update is an insert plus a mark
    text: PostgreSQL never changes a row in place; it writes a new version and marks the old one as deleted by your transaction.
  - title: Snapshots pick a version
    text: Each row version records which transaction created it (xmin) and deleted it (xmax); your snapshot decides which versions you see.
  - title: Dead tuples wait for VACUUM
    text: A version no snapshot can see any more is dead; VACUUM makes its space reusable, and autovacuum does this in the background.
  - title: Long transactions hold back cleanup
    text: An open transaction keeps every version it might still need, so one idle session can make tables bloat.
quiz_hint: Remember that old versions stay in the table until VACUUM can prove nobody needs them.
quiz:
  - q: You UPDATE every row of a 10 GB table once. Roughly how big is the table afterwards, before VACUUM?
    options: [About 10 GB, About 20 GB, About 5 GB]
    answer: 1
    explain: Each update writes a new version of the row; the old ones stay until VACUUM marks their space reusable. Plain VACUUM then lets new rows reuse it, but usually does not shrink the file.
  - q: "Autovacuum runs, but n_dead_tup keeps growing and VACUUM VERBOSE reports many tuples that are dead but not yet removable. What is the likely cause?"
    options:
      - The disk is full
      - A long-running or idle-in-transaction session holds an old snapshot, so those versions might still be needed
      - The table has too many indexes
    answer: 1
    explain: VACUUM may only remove versions older than every open snapshot. Look in pg_stat_activity for old xact_start values and sessions in state idle in transaction.
  - q: What is the difference between VACUUM and VACUUM FULL?
    options:
      - None; FULL is an alias
      - VACUUM marks dead space reusable and runs alongside normal work; VACUUM FULL rewrites the table to return space to the operating system, holding an exclusive lock
      - VACUUM FULL only analyses statistics
    answer: 1
    explain: VACUUM FULL blocks all access to the table while it rewrites it. Regular (auto)vacuum is the normal tool; FULL is for exceptional bloat.
links:
  - title: Introduction to MVCC (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/mvcc-intro.html
  - title: Routine vacuuming (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/routine-vacuuming.html
  - title: The cumulative statistics system (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/monitoring-stats.html
---
Multiversion concurrency control (MVCC) is why readers in PostgreSQL never wait for writers and writers never wait for readers. Instead of locking a row while it changes, PostgreSQL keeps several versions of it. Each transaction's snapshot decides which version it sees. The price is that old versions pile up in the table until something removes them, and that something is VACUUM.

## Watching a row get a new version

Every row version carries hidden system columns: `xmin`, the transaction that created it; `xmax`, the transaction that deleted or replaced it (0 if none); and `ctid`, its physical position (page, item).

```sql
SELECT ctid, xmin, xmax, * FROM accounts WHERE id = 1;
--  ctid  | xmin | xmax | id | owner | balance_cents
-- (0,1)  |  875 |    0 |  1 | ana   |         10000

UPDATE accounts SET balance_cents = balance_cents - 100 WHERE id = 1;

SELECT ctid, xmin, xmax, * FROM accounts WHERE id = 1;
-- (0,3)  |  876 |    0 |  1 | ana   |          9900
```

The row moved from item 1 to item 3 of page 0 and was created by transaction 876. The old version at `(0,1)` is still in the page, with `xmax = 876`. Any snapshot taken before 876 committed still sees 10000. Once no snapshot can see the old version, it is a dead tuple:

```sql
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'accounts';
--  n_live_tup | n_dead_tup
--           2 |          1
```

## VACUUM

`VACUUM` scans the table, removes dead versions from the table and its indexes, and records the freed space in the free space map so new rows can reuse it. It runs alongside normal reads and writes. It usually does not give space back to the operating system (only empty pages at the very end of the file). `VACUUM FULL` rewrites the whole table compactly, but holds an `ACCESS EXCLUSIVE` lock while it does, which blocks even reads.

```text
VACUUM (VERBOSE) accounts;
INFO:  finished vacuuming "shop.public.accounts": index scans: 0
tuples: 1 removed, 2 remain, 0 are dead but not yet removable
```

VACUUM also sets bits in the visibility map (which index-only scans rely on) and freezes old rows (below).

## Autovacuum

The autovacuum launcher runs VACUUM and ANALYZE on tables that have changed enough. With the defaults, a table is vacuumed when its dead tuples exceed 50 plus 20% of its rows (`autovacuum_vacuum_threshold`, `autovacuum_vacuum_scale_factor`). On a 100-million-row table, that is 20 million dead rows before it starts, so large, busy tables often get a lower per-table scale factor:

```sql
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.02);
```

## What stops VACUUM

VACUUM can only remove versions that are older than every snapshot still open. A transaction left open for hours (often a session `idle in transaction`, or a long report) pins them all. `VACUUM VERBOSE` reports them as "dead but not yet removable". Find the culprit in `pg_stat_activity` by `xact_start`, and set `idle_in_transaction_session_timeout` to end abandoned sessions.

## Wraparound

Transaction ids are 32-bit counters, so they wrap around after about four billion. To keep old rows visible, VACUUM freezes them, marking them as visible to everyone regardless of id. If freezing falls too far behind, PostgreSQL warns and, as a last resort, stops assigning new transaction ids until a VACUUM catches up. Healthy autovacuum prevents this; monitor `age(datfrozenxid)` in `pg_database` to be sure.
