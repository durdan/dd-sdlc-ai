---
id: aws-dynamodb
title: "DynamoDB: partition keys and capacity"
summary: A key-value store that scales if your keys do
why: "DynamoDB delivers single-digit millisecond reads at any scale, but only if the partition key spreads traffic. A bad key gives you throttling on a table that is mostly idle."
requires: [aws-iam]
lesson: none
points:
  - title: Design for the queries
    text: "You can only query efficiently by the primary key and secondary indexes, so list the access patterns first and design keys to serve them."
  - title: The partition key spreads load
    text: "Items are placed on partitions by a hash of the partition key. Each partition serves at most 3,000 reads and 1,000 writes per second."
  - title: On-demand or provisioned
    text: "On-demand (the default) bills per request and scales automatically. Provisioned sets capacity per second, cheaper when traffic is steady."
  - title: Reads are eventually consistent by default
    text: "Ask for a strongly consistent read when you must see the latest write; it costs twice as much and is not available on global secondary indexes."
quiz_hint: Ask how many distinct partition key values share the traffic.
quiz:
  - q: An events table uses the date (2026-10-16) as its partition key. Writes are throttled even though the table is far below its total capacity. Why?
    options: ["DynamoDB cannot store dates", "Every write today goes to the same partition key, so one partition takes all the traffic", "The table needs more sort keys"]
    answer: 1
    explain: "A partition handles at most 1,000 writes per second. Use a high-cardinality key (such as a device or user ID), or shard the hot key with a suffix."
  - q: When is provisioned capacity a better choice than on-demand?
    options: ["For new tables with unknown traffic", "For steady, predictable traffic where you can keep utilisation high, often with auto scaling", "Never; on-demand is always cheaper"]
    answer: 1
    explain: "On-demand is the default and recommended starting point. Provisioned can be cheaper for steady load, but spikes beyond capacity are throttled."
  - q: A user writes an item and immediately reads it through a global secondary index. Are they guaranteed to see it?
    options: ["Yes, always", "No; reads from global secondary indexes are always eventually consistent", "Only with on-demand capacity"]
    answer: 1
    explain: "Index updates are asynchronous. Read the base table with ConsistentRead when you need to see your own write."
links:
  - { title: "Best practices for designing partition keys (DynamoDB docs)", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html" }
  - { title: "DynamoDB throughput capacity (DynamoDB docs)", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html" }
  - { title: "DynamoDB read consistency (DynamoDB docs)", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html" }
---
DynamoDB is a serverless key-value and document database. There are no instances to size: you create a table, choose a **primary key**, and read and write items of up to 400 KB through an HTTPS API. It replicates every table across three zones in the Region, and it performs the same at ten items or ten billion, provided your **partition key** spreads the work.

## Keys decide everything

The primary key is either a **partition key** alone or a partition key plus a **sort key**. DynamoDB hashes the partition key to choose a physical partition; items with the same partition key are stored together, ordered by sort key. That allows two efficient operations: `GetItem` by full key, and `Query` for one partition key with a condition on the sort key. Anything else is a `Scan` of the whole table, which is slow and expensive at scale.

```json
{ "PK": "CUSTOMER#81", "SK": "ORDER#2026-10-16#5531", "total": 42.50, "status": "paid" }
```

With this design, "all orders for customer 81, newest first" is one `Query` on `PK = CUSTOMER#81`, reading the sort key backwards. Additional access patterns get **global secondary indexes**, which are asynchronously maintained copies keyed differently. The discipline is to list the queries first and design keys for them, the opposite of relational modelling.

## Hot partitions

Each partition can serve up to **3,000 read units and 1,000 write units per second**. DynamoDB splits partitions and moves capacity to busy ones automatically (adaptive capacity), but it cannot split a single partition key value's traffic beyond that limit. Keys that concentrate traffic (a date, a status, a tenant that is much bigger than the rest, a global counter) get throttled while the rest of the table idles. Fixes: choose a higher-cardinality key, add a random or computed suffix to spread one logical key over several (write sharding), and cache hot reads.

## Capacity modes

- **On-demand** is the default and recommended mode. You pay per request; a table instantly handles up to double its previous peak, and grows beyond that over time. Throttling is still possible if traffic more than doubles within 30 minutes, or if one key is hot.
- **Provisioned** sets read and write capacity units per second, usually with auto scaling. It is cheaper for steady, predictable traffic, but sudden spikes above capacity are throttled until scaling catches up.

## Consistency and other details

Reads are **eventually consistent** by default, and usually current within a second. A **strongly consistent** read (`ConsistentRead: true`) returns the latest committed write, costs twice the read capacity, and is not available on global secondary indexes. Conditional writes (`ConditionExpression`) give optimistic locking and create-if-absent; transactions group up to 100 actions atomically. **Streams** publish every change for triggers and replication, **TTL** deletes expired items for free, and **global tables** replicate a table to other Regions.

The common failures are a hot key, a design that needs scans, forgetting that GSIs lag, and very large items that make every read expensive.
