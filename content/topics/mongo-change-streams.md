---
id: mongo-change-streams
title: Change streams
summary: Subscribe to committed changes, and resume after a crash
why: "Change streams let other parts of a system react to data changes (search indexes, caches, events to Kafka) without polling and without the dual-write bug of updating the database and a broker separately."
requires: [mongo-replica-sets, mongo-aggregation]
lesson: none
points:
  - title: A cursor over the oplog
    text: "watch() on a collection, database or deployment returns events for inserts, updates, replaces and deletes, in commit order."
  - title: Only majority-committed changes
    text: "Events are sent once a majority has the change, so a consumer never sees a write that is later rolled back."
  - title: Every event carries a resume token
    text: "Store the token after processing an event; after a restart, resumeAfter (or startAfter) continues from there."
  - title: The oplog is the window
    text: "You can only resume from a point still in the oplog. A consumer that is down longer than the oplog window must start again from a full copy."
quiz_hint: Ask what happens to your consumer if it restarts, and how far back it can go.
quiz:
  - q: "A consumer processes an event, crashes before saving its resume token, and restarts from the previous token. What happens?"
    options:
      - The event is lost
      - "It receives the event again, so processing must be idempotent"
      - MongoDB remembers which events each consumer has seen
    answer: 1
    explain: "The consumer owns its position. Saving the token after processing gives at-least-once delivery, so the handler must tolerate repeats."
  - q: An update event has updateDescription but no fullDocument. How do you get the whole document?
    options:
      - "Open the stream with fullDocument: \"updateLookup\" (the current version, read at notification time) or enable post-images"
      - It is impossible with change streams
      - Read it from a secondary
    answer: 0
    explain: "updateLookup fetches the document as it is when the event is delivered, which may include later changes. Pre- and post-images (6.0 and later) record the document exactly as it was before and after that change."
  - q: Can you open a change stream on a standalone mongod?
    options: [Yes, "No; change streams need a replica set or sharded cluster, because they read the oplog", Only with read concern local]
    answer: 1
    explain: "A standalone has no oplog. A single-member replica set is enough for development."
links:
  - { title: "Change streams (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/changestreams/" }
  - { title: "Change events (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/change-events/" }
  - { title: "Replica set oplog (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/replica-set-oplog/" }
---
A change stream is a cursor that returns an event for every change to a collection, a database or the whole deployment, in the order the changes were committed. It is built on the oplog, the replication log every replica set already keeps, and exposed through the aggregation framework, so you can filter and reshape events with pipeline stages. It is MongoDB's built-in change data capture.

## Watching a collection

```js
const cs = db.orders.watch(
  [{ $match: { operationType: { $in: ["insert", "update"] } } }],
  { fullDocument: "updateLookup" }
)
while (true) {
  const ev = cs.tryNext()
  if (ev) printjson(ev); else sleep(200)
}
```

In another shell:

```js
db.orders.insertOne({ _id: "o-1001", customerId: 42, status: "pending", totalCents: 2500 })
db.orders.updateOne({ _id: "o-1001" }, { $set: { status: "paid" } })
```

The watcher printed (trimmed, tokens shortened):

```json
{ "operationType": "insert", "documentKey": { "_id": "o-1001" },
  "fullDocument": { "_id": "o-1001", "customerId": 42, "status": "pending", "totalCents": 2500 },
  "_id": { "_data": "826AD2214B000000012B042C0100296E5A10..." } }
{ "operationType": "update", "documentKey": { "_id": "o-1001" },
  "updateDescription": { "updatedFields": { "status": "paid" }, "removedFields": [], "truncatedArrays": [] },
  "fullDocument": { "_id": "o-1001", "customerId": 42, "status": "paid", "totalCents": 2500 },
  "_id": { "_data": "826AD2214B000000022B042C0100296E5A10..." } }
```

An update event normally carries only `updateDescription`, the changed fields. `fullDocument: "updateLookup"` adds the current document, read when the event is delivered, so it may already include later changes. For the exact before and after state of each change, enable pre- and post-images on the collection (6.0 and later) and use `fullDocumentBeforeChange`.

## Resuming

Each event's `_id` is its resume token. A consumer that stores the token after processing each event can restart with `watch(pipeline, { resumeAfter: token })` and continue exactly after it. That is at-least-once delivery: if the process crashes after acting on an event but before saving its token, it sees the event again, so make the handler idempotent. Do not remove or change `_id` in your pipeline; the server rejects streams that modify it.

Events are only sent for changes a majority of data-bearing members have, so a consumer never acts on a write that a failover later rolls back.

## The oplog window

Resuming only works while the token's position is still in the oplog, which is a capped collection that overwrites old entries. On the test set, `db.getReplicationInfo()` showed an oplog sized at about 42 GB (by default it takes a share of free disk) but holding only 0.05 hours of history, because the set was new; on a busy production system the window might be hours or days. A consumer down longer than the window gets an error on resume and must rebuild from a full read of the collection. Monitor the window, and size the oplog for your longest expected outage.

## Typical uses

Updating a search index or cache, publishing domain events (an outbox: write the order and its event in one transaction, and let a change stream publish the event), and feeding Kafka through the MongoDB Kafka connector.
