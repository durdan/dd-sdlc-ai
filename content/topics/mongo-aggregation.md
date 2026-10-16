---
id: mongo-aggregation
title: The aggregation pipeline
summary: Stages that filter, reshape, group and join
why: "Reports, dashboards, data migrations and many API responses are aggregations. Written well, the database does the work next to the data; written badly, it reads the whole collection into memory."
requires: [mongo-indexes]
lesson: none
points:
  - title: A pipeline is a list of stages
    text: "Each stage takes a stream of documents and passes a new stream on: $match filters, $project reshapes, $group groups, $sort sorts, $lookup joins."
  - title: Only the start can use indexes
    text: "A $match (and $sort) at the start of the pipeline can use an index. After $group or $unwind the documents are new and no index applies."
  - title: Filter early, shrink early
    text: "Put $match first, drop unneeded fields early, and limit before expensive stages, so later stages handle fewer and smaller documents."
  - title: Stages have memory limits
    text: "A blocking stage such as $sort or $group can use 100 MB before it spills to disk, allowed by default since 6.0. MongoDB 9.0 also caps a whole operation's memory."
quiz_hint: Follow one document through the stages and ask what each stage has to hold in memory.
quiz:
  - q: Why should $match on status come before $unwind of items?
    options:
      - "$unwind cannot run after $match"
      - "A $match at the start can use an index on status and leaves fewer documents to unwind and group"
      - "The order does not matter; the optimiser always rewrites it"
    answer: 1
    explain: "The optimiser does move some stages (for example a $match that only uses fields not changed by earlier stages), but writing $match first makes the index use obvious and does not depend on it."
  - q: "A $group stage builds one bucket per customer for 30 million customers and fails. What is the likely cause?"
    options:
      - "$group cannot group by a field"
      - "It exceeded the per-stage memory limit and spilling to disk was disabled, or (in 9.0) the operation hit its overall memory limit"
      - The collection needs to be sharded first
    answer: 1
    explain: "Each group's accumulator state is held in memory. With allowDiskUse (the default since 6.0) the stage spills to disk and slows down; without it, it fails. Filtering first or grouping in smaller ranges keeps it bounded."
  - q: "What does $lookup do?"
    options:
      - It creates an index
      - "It joins documents from another collection in the same database into an array field of each input document"
      - It reads from a secondary
    answer: 1
    explain: "$lookup is a left outer join. It runs a lookup per input document, so the foreign field should be indexed."
links:
  - { title: "Aggregation pipeline (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/aggregation-pipeline/" }
  - { title: "Aggregation pipeline limits (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/aggregation-pipeline-limits/" }
  - { title: "Aggregation pipeline optimisation (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/" }
---
An aggregation pipeline is a list of stages, each a small transformation, applied in order to the documents of a collection. It is MongoDB's answer to `GROUP BY`, joins, window functions and reshaping output, and it is also the language behind change streams, views and update pipelines. The skill is mostly in ordering the stages so the expensive ones see as little data as possible.

## A pipeline

Units and revenue per SKU for paid orders in September, top three:

```js
db.orders.aggregate([
  { $match: { status: "paid", createdAt: { $gte: ISODate("2026-09-01"), $lt: ISODate("2026-10-01") } } },
  { $unwind: "$items" },
  { $group: { _id: "$items.sku", units: { $sum: "$items.qty" }, revenueCents: { $sum: "$totalCents" } } },
  { $sort: { units: -1 } },
  { $limit: 3 }
])
```

```json
[
  { "_id": "sku-218", "units": 62, "revenueCents": 196683 },
  { "_id": "sku-293", "units": 62, "revenueCents": 238716 },
  { "_id": "sku-184", "units": 58, "revenueCents": 325402 }
]
```

(Synthetic data, one item per order, so `revenueCents` here is the order total.) `$match` selects documents, `$unwind` emits one document per array element, `$group` folds documents with the same `_id` into one using accumulators (`$sum`, `$avg`, `$max`, `$push`, `$addToSet`), and `$sort` with `$limit` keeps the top three. Because the sort is followed by a limit, the server only keeps the top three in memory while sorting.

## Indexes only help at the start

With an index on `{ status: 1, createdAt: 1 }`, explaining a pipeline that starts with that `$match` shows the familiar plan at the bottom:

```text
GROUP <- FETCH <- IXSCAN
```

Once documents have passed through `$group`, `$unwind` or `$project`, they are new documents in memory and no index can help. So:

1. Start with `$match` on indexed fields, then `$sort` if the order matters.
2. Use `$project` or `$unset` early to drop large fields you do not need.
3. Put `$limit` as early as the logic allows.

The optimiser reorders some stages itself (it can move a `$match` ahead of a `$project` that does not change the matched fields, and merge `$sort` with `$limit`), but writing them in the right order is clearer.

## Joins and memory

`$lookup` adds matching documents from another collection as an array, one lookup per input document, so index the foreign field. It is useful, but if every page view needs one, the schema may want an embedded copy instead.

Blocking stages (`$sort` without an index, `$group`, `$bucketAuto`, `$setWindowFields`) hold data in memory. Each stage may use 100 MB; above that it writes temporary files, which `allowDiskUseByDefault` permits from 6.0 onwards. MongoDB 9.0 adds a limit per operation (by default the larger of 1 GB and 20% of the server's memory), so a query that used to run slowly with huge memory now fails with `ExceededMemoryLimit`.

To write results somewhere, end with `$out` (replace a collection) or `$merge` (upsert into one), which is how materialised summaries are built on a schedule.
