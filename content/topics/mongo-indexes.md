---
id: mongo-indexes
title: "Indexes: compound, multikey, TTL, partial"
summary: Field order decides which queries an index can serve
why: "In MongoDB almost every slow query is a missing or badly ordered index. Each extra index also slows every write and takes cache memory, so you want few indexes that each serve several queries."
requires: [mongo-explain, sql-indexes]
lesson: none
points:
  - title: Equality, then sort, then range
    text: "Put fields tested for equality first, then the sort field, then range filters. The index then hands back matches already in order."
  - title: Arrays make an index multikey
    text: "Indexing an array field creates one key per element. A compound index can include at most one array field per document."
  - title: TTL indexes delete for you
    text: "A single-field index on a date with expireAfterSeconds lets a background task remove old documents, within about a minute of expiry, not to the second."
  - title: Partial indexes index only some documents
    text: "A partialFilterExpression keeps the index small; queries must include that filter to use it."
quiz_hint: Picture the index as a sorted list of keys. Which field order lets you jump to the first match and read forward in the order you need?
quiz:
  - q: "A query filters on status (equality) and totalCents (range) and sorts by createdAt. Which index follows the ESR guideline?"
    options: ["{ status: 1, totalCents: 1, createdAt: 1 }", "{ status: 1, createdAt: 1, totalCents: 1 }", "{ createdAt: 1, totalCents: 1, status: 1 }"]
    answer: 1
    explain: "Equality first narrows the index to one status, whose entries are then in createdAt order, so no in-memory sort is needed; the range test on totalCents is checked as the scan goes. In the run on this page that read 24 keys instead of 25,111."
  - q: "Why does creating { a: 1, b: 1 } fail for a document like { a: [1, 2], b: [3, 4] }?"
    options:
      - "Compound indexes cannot contain numbers"
      - "A compound multikey index allows at most one array field per document, because indexing both would need every combination of elements"
      - The fields must be indexed separately first
    answer: 1
    explain: "MongoDB rejects it with \"cannot index parallel arrays\". Two arrays of 1,000 elements would need a million keys for one document."
  - q: "A partial index on { customerId: 1 } has partialFilterExpression { status: \"pending\" }. Which query can use it?"
    options: ["find({ customerId: 42 })", "find({ customerId: 42, status: \"pending\" })", "find({ status: \"paid\" })"]
    answer: 1
    explain: "The index only contains pending orders, so using it for a query that might match other statuses would return incomplete results. The query must include the filter (or a stricter version of it)."
links:
  - { title: "The ESR (equality, sort, range) guideline (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/" }
  - { title: "Multikey indexes (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/" }
  - { title: "TTL indexes (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/index-ttl/" }
  - { title: "Partial indexes (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/index-partial/" }
---
MongoDB's default index is a B-tree over one or more fields, kept in key order. A compound index on `{ status: 1, createdAt: 1 }` is sorted by status, and by date within each status, much like a composite index in PostgreSQL. What makes MongoDB indexes different is how they deal with arrays and the special kinds built on top: TTL indexes that delete expired documents and partial indexes that cover only some of them.

## Field order: equality, sort, range

MongoDB's guideline for compound indexes is ESR: fields matched by equality first, then the fields you sort by, then fields with range conditions. Equality narrows the index to one contiguous slice. If the sort field comes next, that slice is already in the order you asked for, so the server reads it in order and stops after `limit`. Put the range field before the sort and the matching entries come back ordered by the range field, so they must all be collected and sorted in memory.

The same query against two indexes on 200,000 orders, forced with `hint()`:

```js
db.orders.find({ status: "paid", totalCents: { $gte: 10000 } }).sort({ createdAt: -1 }).limit(10)
```

```text
{ status: 1, totalCents: 1, createdAt: 1 }  FETCH <- SORT <- IXSCAN   keys examined: 25111
{ status: 1, createdAt: 1, totalCents: 1 }  LIMIT <- FETCH <- IXSCAN  keys examined: 24
```

The planner picked the second one by itself. The guideline has an exception the manual also notes: if the range condition is very selective, putting it before the sort (ERS) can read fewer keys than ESR, at the price of a small sort.

This toy shows why, with twelve orders and an index as a plain sorted array:

```js run
const orders = [
  { id: 1, status: "paid", totalCents: 900, day: 3 },
  { id: 2, status: "paid", totalCents: 200, day: 12 },
  { id: 3, status: "pending", totalCents: 700, day: 11 },
  { id: 4, status: "paid", totalCents: 650, day: 9 },
  { id: 5, status: "paid", totalCents: 100, day: 10 },
  { id: 6, status: "paid", totalCents: 800, day: 5 },
  { id: 7, status: "pending", totalCents: 300, day: 8 },
  { id: 8, status: "paid", totalCents: 550, day: 1 },
  { id: 9, status: "paid", totalCents: 700, day: 7 },
  { id: 10, status: "paid", totalCents: 300, day: 4 },
  { id: 11, status: "paid", totalCents: 500, day: 2 },
  { id: 12, status: "pending", totalCents: 950, day: 6 },
];
// An index is the entries sorted by its key fields, in order.
function buildIndex(fields) {
  return [...orders].sort((a, b) => {
    for (const f of fields) {
      if (a[f] < b[f]) return -1;
      if (a[f] > b[f]) return 1;
    }
    return 0;
  });
}
// Query: status "paid", totalCents >= 500, newest day first, limit 2.

// E, R, S: every paid entry in the range must be read, then sorted by day.
const inRange = buildIndex(["status", "totalCents", "day"])
  .filter((o) => o.status === "paid" && o.totalCents >= 500);
const ersResult = [...inRange].sort((a, b) => b.day - a.day).slice(0, 2);
console.log("E,R,S examined", inRange.length, "then sorted", inRange.length, "in memory ->", ersResult.map((o) => o.id).join(","));

// E, S, R: walk paid entries newest first, test the range, stop at two.
const paidByDay = buildIndex(["status", "day", "totalCents"]).filter((o) => o.status === "paid").reverse();
let examined = 0;
const esrResult = [];
for (const o of paidByDay) {
  examined++;
  if (o.totalCents >= 500) esrResult.push(o);
  if (esrResult.length === 2) break;
}
console.log("E,S,R examined", examined, "and sorted 0 ->", esrResult.map((o) => o.id).join(","));
```

## Multikey indexes

Index a field that holds an array and MongoDB adds one key per element; `explain` reports `isMultiKey: true`. That is how `find({ "items.sku": "sku-7" })` uses an index on `items.sku`. A compound index may include at most one array-valued field per document; inserting `{ a: [1, 2], b: [3, 4] }` into a collection with an index on `{ a: 1, b: 1 }` fails with `cannot index parallel arrays [b] [a]`. Large arrays mean many keys, which is one more reason to keep arrays bounded.

## TTL and partial indexes

```js
db.sessions.createIndex({ lastSeen: 1 }, { expireAfterSeconds: 3600 })
db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  { name: "pending_by_customer", partialFilterExpression: { status: "pending" } }
)
```

A TTL index is a single-field index on a date. A background task on the primary runs every 60 seconds and deletes documents whose date is older than `expireAfterSeconds`, so expired documents can linger for a minute or more under load. Deletes replicate like any other write.

A partial index stores only documents matching its filter, so it is smaller and cheaper to maintain. In the run above, `find({ customerId: 42, status: "pending" })` used `pending_by_customer` and `find({ customerId: 42 })` did not. With a `unique` option, a partial index enforces uniqueness only among matching documents.
