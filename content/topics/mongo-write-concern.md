---
id: mongo-write-concern
title: "Write concern, read concern, read preference"
summary: "What \"acknowledged\" promises, and which copy you read"
why: "acknowledged: true sounds final. Whether that write survives a failover, and whether the next read sees it, depends on three settings most code leaves at their defaults without knowing what they are."
requires: [mongo-replica-sets]
lesson: none
points:
  - title: Write concern says who must confirm
    text: "w: 1 waits for the primary; w: \"majority\" waits until a majority of data-bearing voters have the write in their oplog. Majority is the default since 5.0 for most replica sets."
  - title: A write concern error is not a rollback
    text: "If wtimeout expires, the client gets an error but the write stays on the primary and may still replicate, or later roll back."
  - title: Read concern says what may be returned
    text: "local returns the member's latest data, which could still roll back; majority returns only majority-committed data; linearizable and snapshot are stronger still."
  - title: Read preference says which member answers
    text: "primary by default. secondary and nearest spread reads but can return stale data, because replication is asynchronous."
quiz_hint: Separate the three questions. Who confirmed the write? What may the read return? Which member serves it?
quiz:
  - q: "A write with { w: 3, wtimeout: 2000 } returns a WriteConcernTimeout error because one secondary is down. Is the document in the database?"
    options:
      - "No, MongoDB undoes the write"
      - "Yes, it was applied on the primary (and maybe one secondary); the error only says the requested acknowledgement did not arrive in time"
      - It is held in a queue until the secondary returns
    answer: 1
    explain: "MongoDB does not undo writes after a wtimeout. In the run on this page, the document was on the primary after the error. Treat the outcome as unknown and make retries idempotent."
  - q: Users update their profile and the next page, read with readPreference secondary, shows the old value. Why?
    options:
      - The write failed silently
      - "Secondaries apply the oplog asynchronously, so a read from one can be behind the primary"
      - Secondaries only see majority-committed data
    answer: 1
    explain: "For read-your-own-writes, read from the primary, or use a causally consistent session with majority read and write concern, which makes a secondary wait until it has caught up to your write."
  - q: Which read concern can return data that is later rolled back?
    options: ["\"local\"", "\"majority\"", "\"linearizable\""]
    answer: 0
    explain: "local (the default for reads) returns whatever the member has, including writes not yet on a majority. majority and linearizable only return majority-committed data."
links:
  - { title: "Write concern (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/write-concern/" }
  - { title: "Read concern (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/read-concern/" }
  - { title: "Read preference (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/read-preference/" }
---
When a driver reports `acknowledged: true`, it means the server confirmed the write to the level you asked for, nothing more. That level is the write concern. Two more settings decide what a later read can see: the read concern (how committed the data must be) and the read preference (which member answers). Together they are your consistency and durability settings, and each trades latency or availability for safety.

## What the defaults are

```js
db.adminCommand({ getDefaultRWConcern: 1 })
```

```json
{ "defaultReadConcern": { "level": "local" },
  "defaultWriteConcern": { "w": "majority", "wtimeout": 0 },
  "defaultWriteConcernSource": "implicit", "defaultReadConcernSource": "implicit" }
```

Since MongoDB 5.0 the implicit default write concern is `w: "majority"`, with one exception: in a replica set with arbiters where the data-bearing members are not more than a majority of voters (the classic primary-secondary-arbiter), it is `w: 1`. Many older drivers and code samples also set `w: 1` explicitly.

## Write concern

| Setting | Acknowledged when | Can it roll back? |
| --- | --- | --- |
| `w: 0` | Never; fire and forget | Yes, and you will not know if it failed |
| `w: 1` | The primary has applied it | Yes, if the primary fails before a secondary copies it |
| `w: "majority"` | A majority of data-bearing voting members have it in their oplog (journaled by default) | No |
| `j: true` | Also written to the on-disk journal | `j: true` alone does not prevent rollback |

`wtimeout` limits how long to wait for the acknowledgement. It does not cancel anything. With one of three members stopped:

```js
db.payments.insertOne({ _id: 2, amount: 700 }, { writeConcern: { w: 3, wtimeout: 2000 } })
```

```text
MongoWriteConcernError: waiting for replication timed out
{ code: 64, codeName: 'WriteConcernTimeout', errInfo: { wtimeout: true, ... } }
```

```js
db.payments.countDocuments({ _id: 2 })   // 1
```

The insert failed from the client's point of view but the document exists. After a write concern error or a network error the outcome is unknown, which is why retries should be idempotent (an upsert keyed on a business id, not a blind insert).

## Read concern

- `local` (default): the member's latest data, which may include writes that are later rolled back.
- `available`: like `local`; on sharded clusters it can also return orphaned documents. Fastest, weakest.
- `majority`: only data acknowledged by a majority, so it never rolls back. It may be slightly behind the newest writes.
- `linearizable`: majority data that reflects every majority write completed before the read began; primary only, slower.
- `snapshot`: a consistent point-in-time view, used by transactions.

## Read preference

`primary` (default), `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`. Reading from secondaries spreads load and keeps reads working during an election, but replication is asynchronous, so a secondary can be seconds behind under load. `maxStalenessSeconds` excludes secondaries that are too far behind. For read-your-writes across members, use a causally consistent session with `majority` read and write concern; otherwise read from the primary.
