---
id: cicd-db-migrations
title: "Database migrations: expand and contract"
summary: Change the schema in steps both versions can live with
why: "Code can be rolled back in seconds; a dropped column can't. Schema changes are where zero-downtime deploys usually fail, unless each step works with both the old and new code."
requires: [cicd-deploy-strategies]
lesson: none
points:
  - title: Old and new code share one database
    text: "During any rolling, blue-green or canary deploy, both versions read and write the same tables, so every schema change must suit both."
  - title: Expand first
    text: "Add the new column, table or index alongside the old one. Nothing that runs today breaks."
  - title: Migrate, then switch
    text: "Write to both, backfill old rows in batches, then move reads to the new shape, one deploy at a time."
  - title: Contract last
    text: "Only when no running version uses the old shape, drop it. That step is the one you can't undo, so it waits."
quiz:
  - q: "You want to rename column `fullname` to `display_name`. Why not just run `ALTER TABLE ... RENAME COLUMN` in the deploy?"
    options: ["Renames are slow", "Pods still running the old version query `fullname` and start failing the moment it disappears", "SQL doesn't support renames"]
    answer: 1
    explain: "During the rollout old code is still serving traffic. Add the new column, write both, backfill, switch reads, and drop the old column in a later release."
  - q: In which step can you no longer roll the application back to the old version?
    options: ["Expand", "Backfill", "Contract (dropping the old column)"]
    answer: 2
    explain: "Until the contract step, the old code still finds everything it needs. After it, the old version is incompatible, so contract only once you are sure you won't go back."
  - q: "Why backfill a large table in batches rather than one UPDATE?"
    options: ["Batches give different results", "A single huge UPDATE holds locks and creates a long transaction that can stall writes and replication", "Databases can't update more than 1000 rows"]
    answer: 1
    explain: "Small batches with short transactions keep locks brief and let replicas keep up. Make the backfill idempotent so it can be restarted."
links:
  - { title: "ParallelChange (Danilo Sato, martinfowler.com)", url: "https://martinfowler.com/bliki/ParallelChange.html" }
  - { title: "Evolutionary Database Design (martinfowler.com)", url: "https://martinfowler.com/articles/evodb.html" }
  - { title: "ALTER TABLE (PostgreSQL documentation)", url: "https://www.postgresql.org/docs/current/sql-altertable.html" }
---
In a zero-downtime deploy the old and new versions of your app run at the same time against one database. So a schema change can't be a single step that suits only the new code. **Expand and contract** (also called parallel change) splits it into steps that each keep both versions working: add the new shape, move to it, and only then remove the old one.

## The steps, for a column rename

Say `users.fullname` should become `users.display_name`.

1. **Expand.** Add `display_name` as a nullable column. Old code ignores it. Deploy.
2. **Dual write.** Release code that writes both columns and still reads `fullname`. Deploy.
3. **Backfill.** Copy `fullname` into `display_name` for existing rows, in batches.
4. **Switch reads.** Release code that reads `display_name` (still writing both, so a rollback is safe). Deploy.
5. **Stop the old writes.** Release code that only uses `display_name`.
6. **Contract.** When no running or rollback-candidate version touches `fullname`, drop it, and add `NOT NULL` or constraints you need.

```sql
-- 1. expand: cheap, no table rewrite in PostgreSQL 11+ for a nullable column
ALTER TABLE users ADD COLUMN display_name text;

-- 3. backfill: small batches, safe to re-run
UPDATE users SET display_name = fullname
WHERE id IN (SELECT id FROM users WHERE display_name IS NULL LIMIT 1000);

-- 6. contract: only after every running version has stopped using fullname
ALTER TABLE users DROP COLUMN fullname;
```

Six steps for a rename feels like a lot. It is the cost of never having a moment where a running version and the schema disagree.

## Migrations in the pipeline

- Version every migration in the repository and run it with a tool (Flyway, Liquibase, Alembic, Prisma Migrate, golang-migrate), never by hand.
- Run migrations as their own pipeline step **before** the code that needs them is deployed, and make each migration safe for the code that's already running.
- Run them first against staging with production-like data volumes; a migration that takes a second on test data can lock a large table for minutes.
- Watch for locks. Adding an index on a busy PostgreSQL table should use `CREATE INDEX CONCURRENTLY`; adding a column with a volatile default or changing a column type can rewrite the whole table. Set a `lock_timeout` so a migration fails fast instead of queueing behind long transactions and blocking everyone.
- Keep destructive steps (drops, `NOT NULL` on existing data, type narrowing) in a separate, later release.

## Why this ties back to rollback

Rolling back code is easy only while the previous version still works against the current schema. Expand-and-contract keeps that true at every step except the last, and you choose when to take the last step.
