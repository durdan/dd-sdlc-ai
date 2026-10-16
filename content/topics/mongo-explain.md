---
id: mongo-explain
title: "Reading explain()"
summary: Which plan ran, and how much it touched
why: "A query that returns 30 documents can still read 200,000. explain() is how you see that before your users do."
requires: [mongo-documents]
lesson: none
points:
  - title: Plans are trees of stages
    text: "COLLSCAN reads every document; IXSCAN walks an index; FETCH loads documents; SORT sorts in memory; PROJECTION_COVERED answers from the index alone."
  - title: Compare examined with returned
    text: "totalKeysExamined and totalDocsExamined against nReturned is the quickest health check. Close to 1:1 is good."
  - title: The planner races candidates
    text: "When several indexes could serve a query, MongoDB tries the candidate plans briefly, keeps the winner and caches it for that query shape."
  - title: Pick the verbosity
    text: "queryPlanner shows the chosen plan without running it; executionStats runs it and adds counts and timings; allPlansExecution adds the losing candidates."
quiz_hint: Look for the stage at the bottom of the tree and the ratio of documents examined to documents returned.
quiz:
  - q: "explain shows totalDocsExamined: 200001 and nReturned: 32. What does that tell you?"
    options:
      - The query is well indexed
      - "It scanned the whole collection (or a poorly matching index) to find 32 documents; an index on the filter field would help"
      - The collection has 32 duplicate documents
    answer: 1
    explain: "A large gap between examined and returned means wasted work. With an index on customerId the same query examined 32 keys and 32 documents."
  - q: "The winning plan is SORT <- FETCH <- IXSCAN. What is the SORT stage telling you?"
    options:
      - The results are already in index order
      - "The index does not provide the requested order, so the matching documents are sorted in memory"
      - The query used a text index
    answer: 1
    explain: "A blocking SORT has to collect every matching document before it returns the first. It is limited to 100 MB per stage before it spills to disk (on by default since 6.0). An index whose key order matches the sort removes the stage."
  - q: Which verbosity should you use to see how many keys and documents a query really examined?
    options: [queryPlanner, executionStats, "explain() never reports counts"]
    answer: 1
    explain: "queryPlanner only plans. executionStats runs the winning plan to completion and reports counts and time; allPlansExecution adds the trial runs of the rejected plans."
links:
  - { title: "Explain results (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/explain-results/" }
  - { title: "cursor.explain() (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/method/cursor.explain/" }
  - { title: "Query plans (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/query-plans/" }
---
`explain()` asks MongoDB how it would run a query, or how it did. The answer is a tree of stages, each feeding documents or index keys to the one above, plus counters for how much each stage touched. Learning to read three or four stage names and two counters is enough to diagnose most slow queries.

## From a collection scan to an index

On a collection of 200,001 orders, with no index on `customerId`:

```js
db.orders.find({ customerId: 42 }).explain("executionStats")
```

The full output is long. These are the fields that matter (the stage chain is read bottom-up, from `executionStats.executionStages` and its `inputStage`s):

```json
{ "winningPlan": "COLLSCAN", "nReturned": 32, "totalKeysExamined": 0,
  "totalDocsExamined": 200001, "executionTimeMillis": 58 }
```

Every document was read to return 32. After `db.orders.createIndex({ customerId: 1 })`:

```json
{ "winningPlan": "FETCH <- IXSCAN customerId_1", "nReturned": 32,
  "totalKeysExamined": 32, "totalDocsExamined": 32, "executionTimeMillis": 0 }
```

`IXSCAN` walked the index to the 32 matching keys and `FETCH` loaded each document. Ratios close to 1:1 are what you want.

## In-memory sorts and covered queries

Add `.sort({ createdAt: -1 })` and the plan becomes `SORT <- FETCH <- IXSCAN customerId_1`. The index finds the documents but not in date order, so they are sorted in memory. For 32 documents that costs nothing; for 50,000 it is the slow part, and a sort stage that needs more than 100 MB spills to disk (allowed by default since 6.0). With an index on `{ customerId: 1, createdAt: -1 }` the SORT stage disappears. If the projection asks only for fields in the index, MongoDB need not fetch documents at all:

```js
db.orders.find({ customerId: 42 }, { _id: 0, customerId: 1, createdAt: 1 }).sort({ createdAt: -1 })
```

```json
{ "winningPlan": "PROJECTION_COVERED <- IXSCAN customerId_1_createdAt_-1",
  "nReturned": 32, "totalKeysExamined": 32, "totalDocsExamined": 0 }
```

`totalDocsExamined: 0` is a covered query. Exclude `_id` explicitly, or it has to be fetched.

## How the plan is chosen

When several indexes could serve a query, the planner runs the candidate plans for a short trial, picks the one that produced results with the least work, and caches it for that query shape (the filter, sort and projection shape, not the values). From MongoDB 8.3 a cost-based ranker backs up this trial when it cannot decide. `explain("allPlansExecution")` shows the losers too. `hint()` forces an index, which is useful for comparing plans while you test, and risky to leave in application code. To find slow queries in the first place, use the slow query log (operations over 100 ms by default) or the database profiler.
