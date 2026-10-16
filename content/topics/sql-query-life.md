---
id: sql-query-life
title: "How a query runs: parse, plan, execute"
summary: SQL says what you want; the planner decides how
why: Almost every performance question about a database is really a question about the plan it picked, and why.
lesson: none
points:
  - title: One backend per connection
    text: Each client connection is served by its own server process, which parses, plans and executes that client's statements.
  - title: Declarative in, plan out
    text: SQL describes the result; the planner turns it into a tree of scans, joins and sorts that produces it.
  - title: Cost is an estimate
    text: The planner compares candidate plans by estimated cost, using table statistics gathered by ANALYZE. Bad statistics make bad plans.
  - title: Prepared statements reuse work
    text: A prepared statement is parsed once; after a few runs PostgreSQL may switch it to one generic plan for all parameter values.
quiz_hint: Separate the stages. Which one decides between an index and a full scan, and what does it base that on?
quiz:
  - q: Which stage decides whether a query reads the table with an index scan or a sequential scan?
    options: [The parser, The rewriter, The planner/optimiser, The executor]
    answer: 2
    explain: The parser checks syntax and builds a tree, the rewriter applies rules such as views, the planner picks the cheapest plan it can find, and the executor runs that plan.
  - q: After a bulk load of a million rows, a query that should use an index is doing a full scan. What is the first thing to try?
    options: ["Run ANALYZE on the table, so the planner's statistics describe the new data", Restart the server, Rewrite the query as a stored procedure]
    answer: 0
    explain: The planner estimates row counts from statistics. Autovacuum will analyse the table eventually, but straight after a big load the numbers can be far from the truth.
  - q: "With plan_cache_mode at its default (auto), what happens to a prepared statement with parameters?"
    options:
      - It is planned once, at PREPARE time, and never again
      - The first five executions get custom plans; after that PostgreSQL uses a generic plan if it does not look more expensive than the average custom one
      - Every execution is planned from scratch
    answer: 1
    explain: This saves planning time for repeated statements, but a generic plan cannot use the actual parameter value. If one value is very common and another very rare, the generic plan can be wrong for one of them.
links:
  - title: The path of a query (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/query-path.html
  - title: Planner/optimizer (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/planner-optimizer.html
  - title: Statistics used by the planner (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/planner-stats.html
  - title: PREPARE (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-prepare.html
---
When you send `SELECT ... FROM orders WHERE customer_id = 42`, you have said nothing about how to find those rows. The server process that owns your connection turns the text into a parse tree, rewrites it (expanding views, for instance), asks the planner for the cheapest way to produce the result, and then runs that plan. The same SQL can run in a millisecond or a minute depending on which plan wins.

## The four stages

1. **Parse.** Check the syntax and build a tree; look up the tables and columns it names.
2. **Rewrite.** Apply rules. A query on a view becomes a query on the view's underlying tables here.
3. **Plan.** Generate candidate plans (scan each table this way or that, join in this order with this method) and estimate the cost of each. Keep the cheapest.
4. **Execute.** Walk the plan tree. Each node pulls rows from its children and hands rows to its parent, so a `LIMIT 10` at the top can stop the work early.

Each client connection has its own backend process doing all of this. That is one reason connections are not free, which comes back in the pooling topic.

## Cost, statistics and ANALYZE

The planner cannot run every candidate to see which is fastest. It estimates. For each table it knows roughly how many rows and pages there are; for each column, the most common values, a histogram of the rest, and the fraction of nulls. These live in `pg_statistic` (readable through the `pg_stats` view) and are refreshed by `ANALYZE`, which autovacuum also runs in the background.

```sql
ANALYZE orders;

SELECT attname, n_distinct, most_common_vals
FROM pg_stats
WHERE tablename = 'orders' AND attname = 'status';
```

From these numbers it estimates how many rows each step will produce, and from that the cost in abstract units (by default, reading one page sequentially costs 1.0 and a random page 4.0). If the estimate says a condition matches 25% of the table, reading the whole table in order is usually cheaper than millions of random index lookups. If it matches 25 rows, the index wins. When estimates are wrong, for example right after a bulk load, or when two columns are correlated in ways single-column statistics cannot see, the planner can pick a plan that is cheap on paper and slow in practice.

## Planning once, running many times

Planning costs time too, so drivers often use prepared statements: parse once, then execute with different parameters.

```sql
PREPARE orders_for(bigint) AS
  SELECT id, total_cents FROM orders WHERE customer_id = $1;

EXECUTE orders_for(42);
```

By default the first five executions are planned for the actual parameter values (custom plans). After that PostgreSQL also builds a generic plan and uses it if its estimated cost is not worse than the average of the custom ones. That is usually a good trade, but if one parameter value matches half the table and another matches three rows, a single generic plan suits only one of them. `plan_cache_mode` lets you force either behaviour when you see this.

The next topic is how to see the plan the planner picked, and how close its estimates were.
