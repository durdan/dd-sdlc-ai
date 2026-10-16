---
id: spring-hikari
title: The connection pool (HikariCP)
summary: Ten connections, and why that is often enough
why: The pool is the narrowest pipe in most Spring services; too small and requests queue, too large and the database slows down for everyone.
requires: [spring-transactions]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Borrow, use, return
    text: Every transaction borrows one connection from the pool and returns it at commit or rollback. Opening a new one per request would cost far more.
  - title: The defaults
    text: Boot uses HikariCP with maximumPoolSize 10, a fixed-size pool, and connectionTimeout 30 seconds.
  - title: Bigger is not faster
    text: A database does a limited amount of work at once; more connections than it can serve add contention, not throughput.
  - title: Watch the waiting
    text: Pending threads and acquire time tell you whether the pool, or the code holding connections, is the problem.
quiz_hint: Think about where requests wait when all connections are in use, and what the database can really do in parallel.
quiz:
  - q: All 10 connections are in use and an eleventh request needs one. What happens with Boot's defaults?
    options:
      - Hikari opens an eleventh connection
      - The thread waits for up to connectionTimeout (30 s), then gets an SQLException if none was returned
      - The request fails immediately
    answer: 1
    explain: getConnection() blocks until a connection is returned or the timeout passes. Thirty seconds is a long time to hold a Tomcat thread; many services lower it so they fail fast instead.
  - q: Using HikariCP's starting formula, roughly how many connections suit a database server with 4 physical cores and its data set cached in memory?
    options: ["8 to 10", "100", "One per expected user"]
    answer: 0
    explain: "The wiki suggests connections = (core_count x 2) + effective_spindle_count as a starting point, where the spindle count is about zero when data is cached. Then test under realistic load."
  - q: Each request thread holds a connection and then, through REQUIRES_NEW, asks for a second one. With 10 threads and a pool of 10, what can happen?
    options:
      - Nothing; Hikari detects the pattern
      - Every thread holds one connection and waits for a second, so all of them block until connectionTimeout (pool lock-up)
      - The second request reuses the first connection
    answer: 1
    explain: The Spring docs warn that REQUIRES_NEW needs a pool larger than the number of concurrent threads. Hikari's wiki gives the bound pool = threads x (connections per thread - 1) + 1, and suggests fixing the code first.
links:
  - title: About pool sizing (HikariCP wiki)
    url: https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing
  - title: HikariCP configuration reference (README)
    url: https://github.com/brettwooldridge/HikariCP
  - title: Connection pools in Spring Boot (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/data/sql.html
  - title: Metrics for DataSource and Hikari (Spring Boot 3.5)
    url: https://docs.spring.io/spring-boot/3.5/reference/actuator/metrics.html
---
Opening a database connection means a TCP handshake, often TLS, authentication and session set-up: milliseconds that you don't want to pay on every request. A connection pool opens a fixed number of connections up front and lends them out. Spring Boot picks HikariCP when it is on the classpath, which it is with any JDBC or JPA starter. Every transaction, and every repository call outside one, borrows a connection and gives it back when it finishes.

## The settings that matter

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/shop
    hikari:
      maximum-pool-size: 10      # default 10; also the size, since minimum-idle defaults to it
      connection-timeout: 2000   # ms; default 30000: how long a caller waits for a free connection
      max-lifetime: 1500000      # ms (25 min); default 30 min: keep it below any database or proxy cut-off
      pool-name: shop-db
```

Hikari's own advice is to leave `minimum-idle` unset, so the pool stays at a fixed size and never has to open connections during a spike. `max-lifetime` retires connections before a firewall or the database drops them silently; it should be a little shorter than any such limit.

## How big?

It is tempting to match the pool to Tomcat's 200 threads. Hikari's sizing page argues the opposite. A database server with 4 cores can only execute a handful of queries truly at once; past that, extra connections add context switching and lock contention. Its starting formula is:

```text
connections = (core_count x 2) + effective_spindle_count
```

`core_count` is the database server's physical cores, and `effective_spindle_count` is about 0 when the working set is cached (and has not been analysed for SSDs). For 4 cores that gives roughly 9 or 10, which is why 10 is a reasonable default. Treat it as a starting point and measure.

Remember the pool is per application instance. Ten replicas with 10 connections each is 100 connections on the database, and its `max_connections` is shared by everyone.

## When the pool is the bottleneck

Usually it is not the size but how long connections are held:

- A transaction that calls a slow HTTP service keeps its connection the whole time.
- Open-session-in-view holds one until the response is written.
- `REQUIRES_NEW` needs a second connection while the first is still held. With every thread doing it at once, the pool can lock up completely; the Spring docs say such a pool must exceed the number of concurrent threads.

## Seeing it

With Actuator, Boot publishes pool metrics with the `hikaricp` prefix (and generic `jdbc.connections.*` gauges):

| Metric | Tells you |
| --- | --- |
| `hikaricp.connections.active` | Connections in use now |
| `hikaricp.connections.pending` | Threads waiting for one |
| `hikaricp.connections.acquire` | How long they waited |
| `hikaricp.connections.timeout` | Callers that gave up |

A pending count above zero most of the time means requests are queuing for the database. Shorten what holds connections before raising the size, and set a `connection-timeout` that fails fast rather than parking threads for 30 seconds.

```trace diagram
id: borrow-return
title: Borrow, wait, time out
subtitle: Three threads, a pool of two
kind: sequence
elements:
  - { id: t1, label: Thread 1 }
  - { id: t2, label: Thread 2 }
  - { id: t3, label: Thread 3 }
  - { id: pool, label: HikariCP pool }
  - { id: db, label: PostgreSQL }
edges:
  - { id: ask1, from: t1, to: pool, label: getConnection() }
  - { id: give1, from: pool, to: t1, label: connection A, style: dashed }
  - { id: ask2, from: t2, to: pool, label: getConnection() }
  - { id: give2, from: pool, to: t2, label: connection B, style: dashed }
  - { id: sql1, from: t1, to: db, label: INSERT on A }
  - { id: ask3, from: t3, to: pool, label: "getConnection(): none idle, waits" }
  - { id: close1, from: t1, to: pool, label: "close(): A goes back", style: dashed }
  - { id: give3, from: pool, to: t3, label: "A, to the waiting thread", style: dashed }
  - { id: slow, from: t2, to: db, label: "slow query, holds B" }
  - { id: ask4, from: t1, to: pool, label: "getConnection(): waits" }
  - { id: fail, from: pool, to: t1, label: "30 s later: SQLTransientConnectionException", style: dashed }
steps:
  - caption: Three request threads share a pool of two connections. The pool is small to keep the picture simple; Boot's default is ten.
    focus: [pool]
  - caption: Thread 1 asks for a connection and gets an idle one at once. No TCP handshake, no login, just a hand-over.
    trace: [ask1, give1]
  - caption: Thread 2 takes the other one. Both connections are now in use and the pool has none idle.
    trace: [ask2, give2]
  - caption: Thread 1 runs its SQL. Thread 3 asks for a connection too, but none is idle, so getConnection blocks and the thread just waits.
    trace: [sql1, ask3]
  - caption: Thread 1's transaction ends. Closing a pooled connection does not close it; it goes back to the pool, which hands it straight to the waiting thread 3.
    trace: [close1, give3]
  - caption: Meanwhile thread 2 is stuck in a slow query and holds its connection the whole time.
    trace: [slow]
  - caption: Thread 1 needs a connection again, and both are busy. If none comes back within connectionTimeout, 30 seconds by default, getConnection gives up with an SQLTransientConnectionException.
    trace: [ask4, fail]
  - caption: A bigger pool rarely fixes this. Hold connections for less time, keep slow calls out of transactions, and set a shorter connectionTimeout so requests fail fast instead of parking threads.
    focus: [pool, db]
```
