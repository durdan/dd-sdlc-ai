---
id: sql-normalisation
title: Normalisation and when to denormalise
summary: One fact in one place, and the price of copies
why: Duplicated facts drift apart; but some reads need copies, and the trick is knowing which copy is the truth.
requires: [sql-constraints]
lesson: none
points:
  - title: Each fact once
    text: A normalised schema stores each fact in one row of one table, so an update changes it in one place.
  - title: Anomalies are the cost of copies
    text: When the same fact is stored twice, an update that misses one copy leaves the data contradicting itself.
  - title: Denormalise for a measured read
    text: Copies, counters and pre-joined tables make specific reads cheaper, at the price of keeping them in step.
  - title: Snapshots are not duplicates
    text: An order's price at purchase time is a different fact from the product's current price, and belongs on the order.
quiz_hint: For each copy, ask what happens when the original changes, and whether that change should reach the copy.
quiz:
  - q: "The orders table stores customer_email next to customer_id. A customer changes their email. What goes wrong?"
    options:
      - Nothing; orders are read-only
      - Old orders still show the old address unless every copy is updated, so the same customer has two emails
      - The foreign key prevents the change
    answer: 1
    explain: This is an update anomaly. Keep email in customers and join, unless the order genuinely needs the address as it was at checkout, which is a snapshot, not a copy.
  - q: "Should order_lines store unit_price, even though products already has a price?"
    options:
      - No, it is duplication; always join to products
      - Yes; the price paid is a fact about the order and must not change when the catalogue price does
      - Only if products has no index
    answer: 1
    explain: The two prices mean different things. Storing the price at purchase time is correct modelling, not denormalisation.
  - q: A product page shows a review count that needs a COUNT(*) over millions of rows on every view. What is a reasonable denormalisation?
    options:
      - A review_count column kept up to date in the same transaction that inserts or deletes a review (or a periodically refreshed materialised view)
      - Store the count in each review row
      - Remove the reviews table
    answer: 0
    explain: A counter makes the read cheap. Update it in the same transaction as the change, or accept staleness with a refreshed materialised view. Note that one hot counter row also becomes a point of lock contention.
links:
  - title: Table basics (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/ddl-basics.html
  - title: Generated columns (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/ddl-generated-columns.html
  - title: REFRESH MATERIALIZED VIEW (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/sql-refreshmaterializedview.html
---
Normalisation means arranging tables so that each fact is stored once: a customer's email lives in the customers row, and orders refer to the customer by id. The formal normal forms (first, second, third, Boyce-Codd) are precise ways of saying "no column depends on anything but the whole key". In day-to-day work the question is simpler: if this value changes, how many places must change with it?

## What goes wrong with copies

Suppose orders carry a copy of the customer's email and country:

```sql
-- denormalised: the customer's details are repeated on every order
CREATE TABLE orders_wide (
  id             bigint PRIMARY KEY,
  customer_id    bigint NOT NULL,
  customer_email text   NOT NULL,
  customer_country text NOT NULL,
  total_cents    integer NOT NULL
);
```

Three kinds of anomaly follow:

- **Update.** The customer changes their email; every one of their orders must be updated, and any that are missed now disagree.
- **Insert.** You cannot record a customer who has not ordered yet, because customer data only exists on orders.
- **Delete.** Deleting a customer's last order also deletes the only record of the customer.

The normalised version keeps customers in their own table, with `orders.customer_id REFERENCES customers (id)`, and a join puts them back together when a query needs both. With an index on the join column, that join is cheap; it is rarely the bottleneck people fear.

## Copies that are really snapshots

Not every repeated column is duplication. A line on an order should store the price that was charged, even though the products table has a price:

```sql
CREATE TABLE order_lines (
  order_id         bigint  NOT NULL REFERENCES orders (id),
  product_id       bigint  NOT NULL REFERENCES products (id),
  quantity         integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL,   -- the price at checkout, not a copy of products.price
  PRIMARY KEY (order_id, product_id)
);
```

The catalogue price will change; the price paid must not. The same goes for a shipping address on an order. These are separate facts that happen to look alike.

## Denormalising on purpose

Sometimes a read is too slow or too frequent to compute each time, and a copy is worth it:

- **Counters and totals** (`review_count`, `balance_cents`), updated in the same transaction as the rows they summarise.
- **Generated columns**, which the database computes from other columns in the same row, so they cannot drift: `total_cents integer GENERATED ALWAYS AS (quantity * unit_price_cents) STORED`.
- **Materialised views** for reports, refreshed on a schedule with `REFRESH MATERIALIZED VIEW` (add `CONCURRENTLY`, which needs a unique index on the view, to avoid blocking readers).
- **Read models in another store** (a search index, a cache), fed from the database's changes.

The rule for all of them: one place is the source of truth, and every copy says how it is kept in step and how stale it may be. Measure the slow read first; a missing index is a far more common cause than too many joins.
