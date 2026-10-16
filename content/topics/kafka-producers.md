---
id: kafka-producers
title: "Producers: acks, batching, idempotence"
summary: When a send counts as done, and why retries don't duplicate
why: "The producer settings decide whether an acknowledged record can be lost, whether retries create duplicates, and how much latency you trade for throughput. The defaults changed in 3.0 and again in 4.0."
requires: [kafka-partitions]
lesson: none
points:
  - title: acks sets who must confirm
    text: "acks=0 waits for nothing, acks=1 for the partition leader, acks=all for every in-sync replica. all has been the default since 3.0."
  - title: Records travel in batches
    text: "The producer groups records per partition up to batch.size (16 KB) or linger.ms (5 ms since 4.0, 0 before), and compresses whole batches if asked."
  - title: Retries are on by default
    text: "Failed sends are retried until delivery.timeout.ms (2 minutes) runs out, so a transient broker problem usually costs latency, not data."
  - title: Idempotence removes retry duplicates
    text: "With enable.idempotence (default true) the broker drops a batch it has already written, using a producer id and per-partition sequence numbers."
quiz_hint: Picture the acknowledgement getting lost on the way back. What does the producer do next, and what does the broker do with the second copy?
quiz:
  - q: "A producer with acks=1 gets an acknowledgement, then the leader's disk fails before followers copy the record. What happens?"
    options:
      - The record is safe on the followers
      - "The record can be lost: acks=1 only waited for the leader to write it"
      - The producer retries automatically
    answer: 1
    explain: "acks=1 trades durability for latency. acks=all, with a replication factor of 3 and min.insync.replicas=2, waits until the record is on every in-sync replica, at least two."
  - q: "The broker wrote a batch but the response timed out, so the producer retries. With idempotence enabled, what ends up in the partition?"
    options:
      - Two copies of the batch
      - "One copy; the broker sees the same producer id and sequence number and does not append it again"
      - Nothing; both are rejected
    answer: 1
    explain: "This covers retries within one producer session. It does not stop your application from calling send() twice for the same event, or a restarted producer (with a new id) from resending; that needs transactions or idempotent consumers."
  - q: Why did Kafka 4.0 change the default linger.ms from 0 to 5?
    options:
      - To reduce throughput
      - "Waiting a few milliseconds builds larger batches, which the docs say typically gives similar or lower latency overall because the cluster does less work per record"
      - Because batching was removed
    answer: 1
    explain: "Larger batches mean fewer requests and better compression. Under load the effective linger is often higher anyway, because batches wait for in-flight requests."
links:
  - { title: "Producer configs (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/producer-configs/" }
  - { title: "Design: the producer and message delivery semantics (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
  - { title: "Upgrade notes, 3.0 producer defaults (Apache Kafka 3.0 docs)", url: "https://kafka.apache.org/30/getting-started/upgrade/" }
---
A producer turns `send()` calls into batches, sends each batch to the leader of its partition and waits for an acknowledgement. Three groups of settings matter: how many replicas must confirm a write (`acks`), how records are grouped (batching), and what happens when a send fails (retries and idempotence). The modern defaults are safe; the risk is usually code or old configuration that overrides them.

## acks

| `acks` | The producer waits for | An acknowledged record can be lost if |
| --- | --- | --- |
| `0` | Nothing; offsets come back as -1 | Anything goes wrong |
| `1` | The leader to write it to its log | The leader fails before a follower copies it |
| `all` (`-1`) | Every in-sync replica | All in-sync replicas fail together |

`acks=all` has been the default since Kafka 3.0. It is only as strong as the in-sync replica set, which is why it is paired with `min.insync.replicas` (the replication topic).

## Batching

The producer keeps a buffer per partition. A batch is sent when it reaches `batch.size` (16,384 bytes by default) or has waited `linger.ms`. Kafka 4.0 changed the `linger.ms` default from 0 to 5 ms because larger batches usually lower overall latency by reducing the work per record. Compression (`compression.type`: none by default; `lz4` or `zstd` are common choices) is applied per batch, so better batching also compresses better.

## Retries and idempotence

`retries` defaults to the maximum integer, bounded in time by `delivery.timeout.ms` (120,000 ms): the total time `send()` may take, including waiting in the buffer and every retry. When it expires, the send fails and your callback must decide what to do.

Retrying is where duplicates come from: the broker may have written the batch and only the response was lost. The idempotent producer (on by default since 3.0, and required for transactions) fixes this. The broker gives each producer an id, the producer numbers its batches per partition, and the broker refuses to append a sequence number it has already written. It also keeps batches in order with up to 5 requests in flight per connection, which is why idempotence requires `max.in.flight.requests.per.connection` of 5 or less.

A simplified model of the broker's check:

```js run
const partitionLog = [];
const lastSeq = new Map(); // producerId -> last sequence appended

function brokerAppend(producerId, seq, value) {
  const last = lastSeq.get(producerId) ?? -1;
  if (seq <= last) return "duplicate, not appended";
  if (seq !== last + 1) return "out of order, rejected";
  partitionLog.push(value);
  lastSeq.set(producerId, seq);
  return "appended at offset " + (partitionLog.length - 1);
}

console.log(brokerAppend(7, 0, "created"));
console.log(brokerAppend(7, 1, "paid"));
console.log(brokerAppend(7, 1, "paid")); // retry after a lost acknowledgement
console.log(brokerAppend(7, 2, "shipped"));
console.log("log:", partitionLog.join(", "));
```

The real broker tracks sequences per producer id and partition, for the last five batches, and the producer id changes when a non-transactional producer restarts.

## A sensible starting configuration

```properties
acks=all
enable.idempotence=true
compression.type=lz4
linger.ms=5
delivery.timeout.ms=120000
```

These are mostly the defaults made explicit, which protects you from a library or an old config file silently changing them. Note that a conflicting setting (for example `acks=1`) quietly disables idempotence unless you set `enable.idempotence=true` explicitly, in which case the producer refuses to start.
