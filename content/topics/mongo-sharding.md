---
id: mongo-sharding
title: "Sharding and the shard key"
summary: Splitting a collection across replica sets
why: "The shard key decides which queries hit one shard and which hit all of them, and whether writes spread out or pile onto one machine. Changing it later is possible, but it rewrites the collection."
requires: [mongo-indexes, mongo-replica-sets]
lesson: none
points:
  - title: A sharded cluster has three parts
    text: "Shards (each a replica set) hold the data, config servers hold the metadata, and mongos routers send each operation to the right shards."
  - title: The shard key splits data into ranges
    text: "Documents are grouped into ranges of shard key values (chunks, 128 MB by default), and the balancer moves ranges to even out data size between shards."
  - title: Good keys have many values, even frequency and no single hot end
    text: "Low cardinality causes jumbo chunks; a value that only grows, such as a timestamp, sends every insert to the last range."
  - title: Queries without the key go everywhere
    text: "A filter on the shard key (or its prefix) is routed to the shards that own it; anything else is broadcast to all shards and merged."
quiz_hint: For each candidate key, ask where the next thousand inserts go and how many shards a typical query must ask.
quiz:
  - q: "Orders are sharded on { createdAt: 1 } with ranged sharding. What happens to inserts?"
    options:
      - They spread evenly across shards
      - "They all go to the shard owning the range that ends at MaxKey, because each new createdAt is higher than every existing one"
      - mongos rejects them
    answer: 1
    explain: "A monotonically increasing key creates a hot shard for writes. Hash it, or lead with a field that spreads writes, such as { customerId: 1, createdAt: 1 }."
  - q: "Sharding on { country: 1 } produces jumbo chunks. Why?"
    options:
      - The balancer is turned off
      - "There are few distinct countries, and all documents for one value must stay in one chunk that cannot be split"
      - Strings cannot be shard keys
    answer: 1
    explain: "A chunk can only be split between different shard key values. With low cardinality or one very frequent value, a chunk grows past the range size and becomes jumbo. Refining the key with a second field (refineCollectionShardKey) fixes it."
  - q: "The collection is sharded with a hashed key on customerId. Which query is broadcast to every shard?"
    options: ["find({ customerId: 42 })", "find({ customerId: { $gt: 1000, $lt: 2000 } })", "updateOne({ customerId: 42, _id: 7 }, ...)"]
    answer: 1
    explain: "Hashing spreads neighbouring values across shards, so equality on the key is targeted but a range on it must ask every shard."
links:
  - { title: "Shard keys (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/sharding-shard-key/" }
  - { title: "Choose a shard key (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/" }
  - { title: "Data partitioning with chunks (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/sharding-data-partitioning/" }
  - { title: "Reshard a collection (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/sharding-reshard-a-collection/" }
---
Sharding splits one collection across several replica sets, called shards, so data and write load can exceed what one machine handles. The application talks to `mongos` routers, which use metadata from the config servers to send each operation to the shards that own the data. The single most important decision is the shard key: the field or fields whose values decide where each document lives.

The commands below were not run for this path (it needs config servers, several shards and routers); they show the shape of the operations.

## Ranged and hashed keys

```js
sh.shardCollection("shop.orders", { customerId: 1, createdAt: 1 })   // ranged, compound
sh.shardCollection("shop.events", { deviceId: "hashed" })            // hashed
```

With a ranged key, documents with nearby key values live together, so a range query on the key goes to one or a few shards. With a hashed key, MongoDB shards on a hash of the value: writes spread evenly, equality queries are still targeted, but range queries on the key are broadcast to every shard.

## Choosing the key

The manual's three questions:

1. **Cardinality.** How many distinct values? All documents with one value must sit in one chunk, so few values mean few possible chunks.
2. **Frequency.** Is one value far more common than the rest? A very popular tenant or a default value makes one huge chunk.
3. **Monotonic change.** Does each new value exceed the last (timestamps, ObjectIds, counters)? Then with ranged sharding every insert goes to the chunk ending at `MaxKey`, on one shard: a hot shard.

Then check the queries. A query that includes the shard key (or a prefix of it) is routed to the owning shards; one that does not is a scatter-gather across every shard, and the slowest shard sets its latency. A key like `{ customerId: 1, createdAt: 1 }` spreads writes across customers, keeps one customer's orders together, and serves "orders for customer X, newest first" from one shard.

## Chunks, the balancer and jumbo chunks

Data is grouped into ranges of key values (chunks), 128 MB by default. The balancer migrates ranges between shards when their data size for a collection differs by more than three times the range size (384 MB at the default). A range that has grown past the limit but contains a single key value cannot be split; this is a jumbo chunk. It stays where it is unless moved by hand, because by default the balancer refuses to migrate a range holding more than about twice the documents a normal range would. The fixes are a better key or a refined one.

## Changing your mind

- **Refine** (4.4 and later): `refineCollectionShardKey` adds suffix fields to the existing key, for example `{ country: 1 }` to `{ country: 1, customerId: 1 }`.
- **Reshard** (5.0 and later): `reshardCollection` copies the collection to a new key in the background, then blocks writes briefly (two seconds by default) to switch. It needs spare disk and I/O on every shard.
- **Unshard and move** (8.0 and later): `unshardCollection` turns a sharded collection back into an unsharded one, and `moveCollection` moves an unsharded collection to another shard.

Every shard is a replica set, so everything in the previous stage (elections, write concern, rollback) applies to each one separately.
