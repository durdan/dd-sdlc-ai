---
id: sql-pooling
title: Connection limits and pooling (PgBouncer)
summary: A process per connection, so share a few
why: Running out of connections is one of the most common ways a PostgreSQL-backed service falls over during a traffic spike or a deploy.
requires: [sql-transactions]
lesson: none
points:
  - title: Each connection is a process
    text: PostgreSQL forks a backend process per connection, with its own memory, so max_connections (default 100) is a real limit.
  - title: Pools multiply
    text: Every application instance has its own pool; twenty pods with twenty connections each is 400 connections.
  - title: PgBouncer shares server connections
    text: In transaction mode a server connection is lent to a client only for the length of one transaction, so thousands of clients can share a few dozen.
  - title: Transaction mode has rules
    text: Session state (SET, LISTEN, session advisory locks, WITH HOLD cursors, SQL-level PREPARE) does not survive between transactions.
quiz_hint: Count connections from the database's side, and ask what state a client expects to still be there on its next transaction.
quiz:
  - q: Thirty application pods each open a pool of 10 connections to a server with max_connections = 100. What happens as they start?
    options:
      - PostgreSQL queues the extra connections
      - The first ~100 connections succeed (minus reserved superuser slots); the rest fail with "too many clients already"
      - Each pod gets 3 connections automatically
    answer: 1
    explain: The limit is enforced per server, not per application. Either shrink the per-instance pools or put a pooler such as PgBouncer in between.
  - q: Behind PgBouncer in transaction mode, a client runs SET search_path = tenant_7 and then, in a later transaction, a query. Which schema does the query use?
    options:
      - Always tenant_7
      - Whatever the server connection it happens to get has set; the SET may have gone to a different connection
      - PgBouncer rejects SET
    answer: 1
    explain: PgBouncer's feature table lists SET/RESET as never working in transaction mode. Use SET LOCAL inside the transaction, or schema-qualified names.
  - q: "Your driver uses protocol-level prepared statements, and you move to PgBouncer transaction mode. What do you need?"
    options:
      - Nothing; they never work
      - PgBouncer 1.21 or later, with max_prepared_statements above zero
      - Session mode for every client
    answer: 1
    explain: "PgBouncer 1.21 added tracking of protocol-level named prepared statements in transaction mode, controlled by max_prepared_statements (on by default, at 200, since 1.24). SQL-level PREPARE and DEALLOCATE still do not work."
links:
  - title: Connection settings, max_connections (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/runtime-config-connection.html
  - title: PgBouncer features and pool modes
    url: https://www.pgbouncer.org/features.html
  - title: PgBouncer configuration
    url: https://www.pgbouncer.org/config.html
  - title: PgBouncer changelog (prepared statement support)
    url: https://www.pgbouncer.org/changelog.html
---
PostgreSQL serves each connection with its own operating-system process. That design is robust, but each process costs memory and the server has to coordinate all of them, so the number is capped by `max_connections`, 100 by default (a few of those slots are reserved for superusers). Opening a connection also takes time: TCP, often TLS, authentication, then a fork. So applications keep pools of open connections, and large deployments put a pooler such as PgBouncer between the applications and the database.

## Counting connections

The limit is per server. Every application instance has its own pool, and they add up:

```text
pods x pool size per pod  = connections on the database
  30 x 10                 = 300   (max_connections = 100: most of them fail)
```

The error the client sees is `FATAL: sorry, too many clients already`. It tends to appear at the worst moments: during a deploy, when old and new pods both hold pools, or when autoscaling adds instances in a spike. Check what is connected:

```sql
SELECT usename, application_name, state, count(*)
FROM pg_stat_activity
GROUP BY 1, 2, 3
ORDER BY 4 DESC;
```

Raising `max_connections` is rarely the answer. The server can only run as many queries truly in parallel as it has cores, and thousands of mostly idle backends still cost memory and coordination. Many `idle` connections usually mean the pools are bigger than they need to be.

## PgBouncer's pool modes

PgBouncer accepts many client connections and keeps a small number of real server connections, per database and user pair (`default_pool_size`, 20 by default). How long a client keeps a server connection depends on the mode:

| Mode | A client holds a server connection | Session features |
| --- | --- | --- |
| `session` | For as long as the client stays connected | All work |
| `transaction` | Only for the length of each transaction | Some do not (below) |
| `statement` | Only for one statement; multi-statement transactions are refused | Fewer still |

Transaction mode is what makes pooling pay off: a client that spends most of its time between transactions holds nothing.

```ini
[databases]
shop = host=10.0.0.5 port=5432 dbname=shop

[pgbouncer]
pool_mode = transaction
default_pool_size = 20
max_client_conn = 2000
max_prepared_statements = 200
```

## What breaks in transaction mode

Anything that relies on a session lasting beyond one transaction, because your next transaction may run on a different server connection:

- `SET` and `RESET` (use `SET LOCAL` inside the transaction instead);
- `LISTEN`;
- session-level advisory locks (use `pg_advisory_xact_lock`);
- `WITH HOLD` cursors and temporary tables that outlive a transaction;
- SQL-level `PREPARE` / `DEALLOCATE`.

Protocol-level prepared statements, which most drivers use, work in transaction mode from PgBouncer 1.21 when `max_prepared_statements` is above zero; since 1.24 it defaults to 200, so the support is on unless you turn it off.

## Sizing

Start small. A pool a few times the database's core count is usually plenty, and a query waiting briefly for a pooled connection is cheaper than one fighting hundreds of others for CPU and locks. Watch the time clients wait for a connection, not just the number in use; a long wait means queries hold connections too long, often because a transaction stays open around slow application work.
