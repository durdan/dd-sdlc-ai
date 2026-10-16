---
id: sql-constraints
title: Constraints as correctness
summary: Rules the database enforces for every writer
why: Application checks race with each other and get bypassed by scripts and migrations; a constraint holds for every write, always.
requires: [sql-indexes]
lesson: none
points:
  - title: The last line of defence
    text: NOT NULL, CHECK, UNIQUE, PRIMARY KEY and FOREIGN KEY are checked inside the database, for every statement from every client.
  - title: Unique beats check-then-insert
    text: Two requests can both see that an email is free and both insert it; a unique index lets exactly one succeed.
  - title: Foreign keys need an index on your side
    text: PostgreSQL indexes the referenced key, not the referencing column; without one, deletes on the parent scan the child table.
  - title: NULL is not a value
    text: By default a unique constraint allows many rows with NULL in a constrained column; NULLS NOT DISTINCT changes that.
quiz_hint: Think about two requests arriving at the same moment, and about writers other than your application.
quiz:
  - q: "Signup code runs SELECT ... WHERE email = $1, and inserts only if nothing was found. Under load, duplicate accounts appear. What is the robust fix?"
    options:
      - Run the SELECT twice
      - "Add a UNIQUE constraint on email and handle the unique-violation error (or use INSERT ... ON CONFLICT)"
      - Use a longer sleep between SELECT and INSERT
    answer: 1
    explain: Both transactions can run the SELECT before either inserts. The unique index is checked atomically at insert time, so only one row can win.
  - q: "Table coupons has UNIQUE (code, user_id). How many rows can hold ('WELCOME', NULL)?"
    options: ["One", "Any number, because NULLs are not equal to each other by default", "None; NULL is rejected"]
    answer: 1
    explain: "Two NULLs are not considered equal, so the rows do not conflict. Declare UNIQUE NULLS NOT DISTINCT (PostgreSQL 15 and later) if NULL should count as a value."
  - q: Deleting one customer takes seconds and the plan shows a sequential scan on orders. orders.customer_id references customers.id. What is missing?
    options: [An index on orders.customer_id, An index on customers.id, A CHECK constraint]
    answer: 0
    explain: The delete must check (or cascade to) referencing rows. customers.id is a primary key and already indexed; the referencing column is not indexed automatically.
links:
  - title: Constraints (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/ddl-constraints.html
  - title: Data consistency checks at the application level (PostgreSQL 17)
    url: https://www.postgresql.org/docs/17/applevel-consistency.html
---
A constraint is a rule the database checks on every write: this column is never empty, this value is unique, this order belongs to a customer who exists. Validation in the application is still useful for friendly error messages, but it cannot see concurrent requests, and it does not run when someone fixes data with a script. Constraints do.

## The kinds

```sql
CREATE TABLE customers (
  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email   text NOT NULL UNIQUE,
  country text NOT NULL
);

CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers (id),
  status      text   NOT NULL CHECK (status IN ('new', 'paid', 'shipped', 'cancelled')),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at  timestamptz NOT NULL
);
```

Each rule rejects a bad write with an error that names it:

```text
INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES (999999, 'new', 100, now());
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(999999) is not present in table "customers".

INSERT INTO orders (customer_id, status, total_cents, created_at) VALUES (1, 'refunded', 100, now());
ERROR:  new row for relation "orders" violates check constraint "orders_status_check"
```

A `CHECK` on an account balance (`balance_cents >= 0`) turns an overdraft bug into an error instead of a negative balance. Check constraints only see the row being written; rules that span rows or tables need a unique or foreign key, an exclusion constraint, or a trigger.

## Unique constraints and races

The common bug: look for a row, and insert if it is not there. Two requests can both look before either inserts. A unique constraint is backed by a unique index, and the second insert fails with SQLSTATE `23505`. Handle that error, or let the database resolve it:

```sql
INSERT INTO customers (email, country)
VALUES ('user1@example.com', 'GB')
ON CONFLICT (email) DO NOTHING;
```

Watch out for NULLs. Under SQL's rules two NULLs are not equal, so `UNIQUE (code, user_id)` happily stores `('WELCOME', NULL)` twice. Since PostgreSQL 15, `UNIQUE NULLS NOT DISTINCT (code, user_id)` treats them as equal and rejects the second.

## Foreign keys

A foreign key says every `orders.customer_id` must exist in `customers.id`. You also choose what happens when the parent row is deleted or its key changes: the default `NO ACTION` (and `RESTRICT`) raise an error, `CASCADE` deletes the children too, `SET NULL` and `SET DEFAULT` change the reference. Make that choice deliberately; `ON DELETE CASCADE` on the wrong relationship deletes a lot.

PostgreSQL does not create an index on the referencing column. Without one, every delete of a customer scans `orders` to find children, and so do joins on that column. Index it unless the table is tiny.

## Adding constraints to a live table

Adding a constraint checks every existing row, holding a lock while it does. For large tables, add foreign keys and checks with `NOT VALID` (new writes are checked at once), then run `ALTER TABLE ... VALIDATE CONSTRAINT`, which checks old rows under a weaker lock that does not block writes. For a new unique constraint, build the index with `CREATE UNIQUE INDEX CONCURRENTLY` and then attach it with `ADD CONSTRAINT ... UNIQUE USING INDEX`.
