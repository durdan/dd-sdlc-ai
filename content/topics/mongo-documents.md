---
id: mongo-documents
title: Documents, BSON and when they fit
summary: Records that keep related data together
why: "The document model pays off when you read and write whole aggregates. Use it for highly connected data with many-to-many relationships and ad-hoc joins, and you pay for that choice on every query."
lesson: none
points:
  - title: A document is a nested record
    text: "Fields can hold sub-documents and arrays, so an order can carry its lines and its shipping address inside it."
  - title: BSON has more types than JSON
    text: "Dates, ObjectId, 32- and 64-bit integers, doubles and Decimal128 are distinct types, and the type you store decides how values compare and sort."
  - title: One document, one atomic write
    text: "A write to a single document is atomic, however many fields and array elements it changes. Data you always change together belongs in one document."
  - title: Flexible is not schemaless
    text: "The server does not force one shape per collection, but your code still expects one. Without validation, nothing stops a typo from becoming a new field."
quiz_hint: Ask which data is read and changed together, and how many other things point at it.
quiz:
  - q: "In mongosh you insert { qty: 3000000000 }. What BSON type does the server store for qty?"
    options: ["int, because it is a whole number", "double, because it does not fit in a 32-bit int and mongosh does not choose long for you", "long, chosen automatically"]
    answer: 1
    explain: "mongosh sends small whole numbers as int and anything else as double. Use NumberLong(...) for 64-bit integers and NumberDecimal(...) for money; a double cannot hold 0.1 exactly."
  - q: Which workload suits the document model best?
    options:
      - A product catalogue where each product has different attributes and is read as a whole
      - A ledger joined across accounts, customers and branches in ad-hoc reports
      - "A social graph queried for friends of friends"
    answer: 0
    explain: "Products with varying attributes, read as one unit, are the classic fit. Heavily joined reporting favours a relational database, and deep graph traversal favours a graph database (MongoDB's $graphLookup exists but is not built for it)."
  - q: An order and its lines live in one document. Two clients each add a line at the same moment with $push. What happens?
    options:
      - "One of the lines is lost, because the second write overwrites the first"
      - "Both lines are added; each update to a single document is atomic and they are applied one after the other"
      - You need a multi-document transaction
    answer: 1
    explain: "Update operators like $push and $inc change the stored document in place, atomically. Losing a line only happens if your code reads the whole document, edits it in memory and replaces it."
links:
  - { title: "Documents (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/document/" }
  - { title: "ObjectId() (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/method/objectid/" }
  - { title: "Data modeling (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/data-modeling/" }
---
A MongoDB document is a record made of field-value pairs, where a value can itself be a document or an array. Documents live in collections, and the server stores them as BSON, a binary format with more types than JSON. The model's promise is that data used together is stored together: one read fetches an order with its lines, and one atomic write changes it. The cost is that data shared between many records has to be either copied or referenced, and you decide which.

## What a document looks like

```js
db.orders.insertOne({
  _id: "o-1001",
  customerId: 42,
  status: "pending",
  createdAt: new Date("2026-10-16T09:30:00Z"),
  totalCents: 2500,
  shipTo: { city: "Leeds", postcode: "LS1 4AP" },
  items: [
    { sku: "sku-7", qty: 2, priceCents: 750 },
    { sku: "sku-19", qty: 1, priceCents: 1000 }
  ]
})
```

Every document needs a unique `_id`, and the collection always has an index on it. If you do not supply one, the driver generates an ObjectId: 12 bytes made of a 4-byte timestamp in seconds, a 5-byte random value per process and a 3-byte counter. ObjectIds therefore sort roughly by creation time, which is handy, and become a problem in the sharding topic.

## Types matter

BSON distinguishes 32-bit `int`, 64-bit `long`, `double` and `decimal`, and mongosh picks for you. Checking with `$type` on the server:

```js
db.t.insertOne({ _id: 1, a: 42, b: 4.5, c: 3000000000, d: NumberDecimal("19.99"), e: new Date(0) })
db.t.aggregate([{ $project: { _id: 0, a: { $type: "$a" }, b: { $type: "$b" },
  c: { $type: "$c" }, d: { $type: "$d" }, e: { $type: "$e" } } }])
```

```json
[ { "a": "int", "b": "double", "c": "double", "d": "decimal", "e": "date" } ]
```

`3000000000` silently became a double. Values of different numeric types still compare by value, but store dates as dates rather than strings, money as integer cents or Decimal128, and be consistent: an index on a field holding a mix of strings and numbers sorts them into separate groups.

## When it fits, and when it does not

| Fits well | Fits poorly |
| --- | --- |
| Aggregates read and written as a unit (orders with lines, user profiles, content items) | Many-to-many data joined in different directions for ad-hoc reports |
| Varying attributes per record (catalogues, settings, event payloads) | Strict invariants spanning many records (double-entry ledgers) |
| Read-heavy pages that want one round trip | Data that is mostly shared and referenced, rarely owned |

None of these are absolute. MongoDB has `$lookup` for joins, multi-document transactions and schema validation, and PostgreSQL has `jsonb` columns. The question is which operations are common and cheap in your workload. A document database rewards designing around the queries you run (the next topic); a relational database rewards designing around the entities and letting the planner find a way to answer any question.
