---
id: mongo-transactions
title: Multi-document transactions
summary: All-or-nothing across documents, at a price
why: "Transactions make some designs possible that used to need awkward workarounds. They are also slower than single-document writes, can abort on conflict, and are not a reason to keep a relational schema in a document database."
requires: [mongo-write-concern, sql-transactions]
lesson: none
points:
  - title: Single-document writes need no transaction
    text: "One document is always updated atomically. Good schema design keeps most invariants inside one document."
  - title: Replica sets since 4.0, sharded clusters since 4.2
    text: "A transaction runs in a session, reads a snapshot, and commits all its writes together or none of them."
  - title: Conflicts abort, so retry
    text: "If two transactions write the same document, one fails with a WriteConflict labelled TransientTransactionError. The callback API retries the whole transaction for you."
  - title: Keep them short
    text: "By default a transaction is aborted after 60 seconds. Long transactions hold cache and history, and across shards every commit is a two-phase commit."
quiz_hint: Ask whether the data could live in one document. If it can, you do not need a transaction.
quiz:
  - q: What do other clients see while a transaction that moved 30 from ana to ben is still open?
    options:
      - "ana with 70 and ben with 20, a half-finished transfer"
      - "The old balances, 100 and 20, until the transaction commits"
      - They are blocked until it commits
    answer: 1
    explain: "Uncommitted writes are invisible outside the transaction, and readers are not blocked. In the run on this page a read during the transaction showed the old values and a read after the commit showed 70 and 50."
  - q: A transaction fails with WriteConflict and errorLabels TransientTransactionError. What should the application do?
    options:
      - Report the failure to the user
      - "Retry the whole transaction from the start; the label means it is safe to retry"
      - Retry only the operation that failed
    answer: 1
    explain: "The conflict aborted the transaction, so all of its writes are gone. withTransaction (the callback API in drivers) retries on TransientTransactionError and retries the commit on UnknownTransactionCommitResult."
  - q: An order and its lines are in separate collections and every change uses a transaction. What is often the better design?
    options:
      - Increase transactionLifetimeLimitSeconds
      - "Embed the lines in the order document, so each change is a single atomic document write"
      - Use read concern local
    answer: 1
    explain: "MongoDB's own guidance is that transactions are not a replacement for schema design; embedding data that changes together avoids the transaction and its cost."
links:
  - { title: "Transactions (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/transactions/" }
  - { title: "Production considerations for transactions (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/transactions-production-consideration/" }
  - { title: "Drivers API for transactions (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/transactions-in-applications/" }
---
A multi-document transaction groups reads and writes across documents and collections so they commit together or not at all, with snapshot isolation. MongoDB has supported them on replica sets since 4.0 and on sharded clusters since 4.2. They work much as in a relational database, but the trade-off is different: MongoDB is built so that most operations touch one document, which is atomic anyway, and a transaction adds coordination on top of that.

## A transfer

```js
const session = db.getMongo().startSession()
const accounts = session.getDatabase("shop").accounts
session.startTransaction({ readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } })
accounts.updateOne({ _id: "ana" }, { $inc: { balance: -30 } })
accounts.updateOne({ _id: "ben" }, { $inc: { balance: 30 } })
// another client reads here
session.commitTransaction()
```

```text
outside, before commit: [{"_id":"ana","balance":100},{"_id":"ben","balance":20}]
after commit:           [{"_id":"ana","balance":70},{"_id":"ben","balance":50}]
```

Readers outside the transaction see the old values and are not blocked. The commit's write concern applies to the whole transaction; operations inside it do not take their own.

## Conflicts

Two transactions that write the same document cannot both proceed. The second writer does not wait for the first: it fails at once.

```text
112 WriteConflict ["TransientTransactionError"]
```

The label tells you the whole transaction can be retried from the start. In application code, use the driver's callback API, which retries on that label and retries the commit on `UnknownTransactionCommitResult`:

```js
await session.withTransaction(async () => {
  await accounts.updateOne({ _id: "ana" }, { $inc: { balance: -30 } }, { session })
  await accounts.updateOne({ _id: "ben" }, { $inc: { balance: 30 } }, { session })
})
```

Because the callback can run more than once, keep side effects such as sending email or calling another service out of it.

## What it costs

- **Time limit.** A transaction running longer than `transactionLifetimeLimitSeconds` (60 by default) is aborted.
- **Cache pressure.** Open transactions keep old versions of data in the WiredTiger cache. Abort abandoned transactions instead of leaving them open.
- **Sharded commits.** A transaction that writes to several shards commits with a two-phase protocol coordinated by one shard, adding round trips. Transactions that stay on one shard are cheaper.
- **Concurrency.** MongoDB 9.0 caps the number of open transactions (`maxConcurrentMultiDocumentTransactions`, 10,000 by default) and rejects new ones with `TooManyOpenTransactions` above it.
- **Oplog.** A large transaction is written as several oplog entries; each must still fit the 16 MB document limit.

The manual is direct about it: in most cases a distributed transaction costs more than single-document writes and should not replace effective schema design. Use transactions for invariants that genuinely span documents (a transfer between two accounts, a uniqueness rule across collections, an order plus its outbox event), and embed the rest.
