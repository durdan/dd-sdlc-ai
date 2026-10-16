---
id: mongo-schema-design
title: "Schema design: embed or reference"
summary: Design for the reads you run, within 16 MB
why: "Schema mistakes in MongoDB rarely fail on day one. They show up months later as documents near the size limit, slow updates to huge arrays, or one change that must be copied to thousands of places."
requires: [mongo-documents, sql-normalisation]
lesson: none
points:
  - title: Start from the access patterns
    text: "List the queries and updates, how often each runs and what it returns. The schema follows from that list, not from the entities alone."
  - title: Embed what you own and read together
    text: "Lines inside an order, an address inside a customer. One read, one atomic write, no join."
  - title: Reference what is shared or grows without bound
    text: "Store an id and look it up when the related data is shared, large, changes independently, or keeps growing."
  - title: 16 MB is a hard ceiling
    text: "A BSON document cannot exceed 16 MiB. Long before that, a large document is slow to read, rewrite and replicate."
quiz_hint: For each relationship, ask how many items there can be, in the worst case, five years from now.
quiz:
  - q: A blog post document embeds every comment in a comments array. Popular posts get tens of thousands of comments. What goes wrong first?
    options:
      - Nothing; arrays have no limit
      - "The posts become slow to read and update, and the busiest ones head for the 16 MB document limit"
      - MongoDB moves the comments to another collection for you
    answer: 1
    explain: "This is the unbounded array anti-pattern. Store comments in their own collection with a postId (indexed), and embed only a small subset, such as the latest five, if the post page needs them."
  - q: Each order needs the customer's name for display. The name rarely changes. What is a reasonable design?
    options:
      - Always $lookup the customers collection
      - "Store customerId and copy the name into the order, accepting that old orders keep the old name or are updated in the background"
      - Embed the whole customer document in every order
    answer: 1
    explain: "Copying a few stable fields next to the reference (an extended reference) saves a lookup on every read. The cost is updating the copies when the source changes, or deciding that the order should keep the name as it was."
  - q: Why does the same data model often look different in MongoDB and in a normalised relational schema?
    options:
      - "MongoDB cannot store references"
      - "Relational design starts from entities and removes duplication; document design starts from access patterns and may duplicate data to serve them"
      - Normalisation is not possible in MongoDB
    answer: 1
    explain: "You can normalise in MongoDB, but you then pay with $lookup or several round trips on each read. Document design trades some duplication for cheaper common reads."
links:
  - { title: "Data modeling best practices (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/data-modeling/best-practices/" }
  - { title: "Avoid unbounded arrays (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/" }
  - { title: "MongoDB limits and thresholds (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/limits/" }
---
In a relational schema you normalise first and let queries join what they need. In MongoDB you start from the other end: write down what the application reads and writes, and shape documents so the common operations touch one document, or a few. The main decision, made for every relationship, is whether the related data is embedded in the parent document or kept in its own collection and referenced by id.

## Embedding

Embed when the child belongs to the parent, is read with it, and the number of children is small and bounded: order lines, addresses, a product's variants. You get one read, no join, and a single atomic update:

```js
db.orders.updateOne(
  { _id: "o-1001", status: "pending" },
  { $push: { items: { sku: "sku-33", qty: 1, priceCents: 400 } }, $inc: { totalCents: 400 } }
)
```

The status check, the new line and the new total are applied together or not at all, with no transaction.

## Referencing

Reference when the related data is shared by many parents (a product used in many orders), is large, changes on its own schedule, or grows without limit. Store the id, index it, and read the related documents in a second query or with `$lookup`:

```js
db.comments.createIndex({ postId: 1, createdAt: -1 })
db.comments.find({ postId: "p-17" }).sort({ createdAt: -1 }).limit(20)
```

There are useful middle grounds. An extended reference copies a few stable fields (a customer's name) next to the id so most reads need no lookup. A subset keeps the latest few children embedded and the full history in its own collection. A bucket groups many small items, such as one document per sensor per hour, so the count per document stays bounded.

## Unbounded arrays and the 16 MB limit

A BSON document can be at most 16 MiB. The limit is enforced by the server, so a document that grows past it through updates starts failing at an unpredictable moment. Here, a 9 MB string is copied into a second field:

```js
db.big.insertOne({ _id: 1, blob: "x".repeat(9 * 1024 * 1024) })
db.big.updateOne({ _id: 1 }, [{ $set: { copy: "$blob" } }])
```

```text
MongoServerError: Plan executor error during update :: caused by :: Serializing Document failed
  :: caused by :: Size 18874404 exceeds maximum 16793600
```

(The maximum shown includes a little internal headroom over 16 MiB.) Most designs suffer long before the limit: every update rewrites and replicates a large document, and every read moves it over the network. For files, MongoDB offers GridFS, which splits content into chunk documents. For growing lists, move the children to their own collection.

## A checklist

1. List the operations with their rates, for example "show order: 2,000/s; add line: 50/s".
2. For each relationship, estimate the worst-case count of children.
3. Embed bounded, owned, read-together data; reference the rest.
4. Add indexes for each query (next stage), and validation for the shape you settled on.
