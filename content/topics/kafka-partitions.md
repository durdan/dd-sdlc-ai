---
id: kafka-partitions
title: "Partitions, keys and ordering"
summary: Order is per partition, and the key picks the partition
why: "Partitions are how Kafka scales, and they are also the limit of its ordering guarantee. The key you choose decides which events stay in order and whether load spreads evenly."
requires: [kafka-log]
lesson: none
points:
  - title: Ordering holds only within a partition
    text: "Records in one partition are read in the order they were written. Across partitions there is no order at all."
  - title: The key picks the partition
    text: "By default the producer hashes the key (murmur2) modulo the partition count, so every record with the same key lands in the same partition."
  - title: No key means spread
    text: "Records without a key are spread by a sticky partitioner, which fills a batch for one partition before moving to another."
  - title: Adding partitions moves keys
    text: "Changing the partition count changes hash mod n, so new records for a key may go to a different partition than its old ones."
quiz_hint: Ask which records must be processed in order relative to each other. Those need the same key.
quiz:
  - q: "Order events (created, paid, shipped) must be processed in order per order. Which key should the producer use?"
    options: [A random UUID per event, The order id, No key]
    answer: 1
    explain: "Same order id, same partition, same order of processing. Events for different orders can be processed in parallel on other partitions."
  - q: You increase a topic from 3 to 4 partitions. What happens to the key customer-42?
    options:
      - "Its old records move to the new partition"
      - "Old records stay where they are; new records may hash to a different partition, so for a while that key's records are split across two partitions"
      - Nothing; the mapping is fixed when the topic is created
    answer: 1
    explain: "Kafka never moves existing records between partitions. In the run on this page customer-42 went to partition 0 of 3 and partition 1 of 4. Plan partition counts up front for keyed topics."
  - q: One tenant produces 60% of all traffic, and the topic is keyed by tenant id. What is the problem?
    options:
      - "None; hashing spreads it evenly"
      - "All of that tenant's records go to one partition, so one partition (and the one consumer reading it) carries most of the load"
      - The tenant's records are rejected
    answer: 1
    explain: "A hot key makes a hot partition. Options: a finer key (tenant plus order id) if per-tenant order is not needed, or a dedicated topic for the big tenant."
links:
  - { title: "Introduction: topics and partitions (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/introduction/" }
  - { title: "Producer configs: partitioner.class (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/producer-configs/" }
  - { title: "Design: the producer (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
---
A topic is divided into partitions, each an independent log on some broker. Partitions let a topic grow beyond one machine and let many consumers read in parallel. The price is that Kafka only orders records within a partition. If two records must be processed in order, they must be in the same partition, which in practice means they must have the same key.

## Keys pick partitions

Producing six order events with keys:

```sh
printf "customer-42:created\ncustomer-7:created\ncustomer-42:paid\ncustomer-99:created\ncustomer-7:paid\ncustomer-42:shipped\n" \
  | bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic orders \
      --property parse.key=true --property key.separator=:
```

Reading them back with `print.partition` and `print.offset`:

```text
Partition:0	Offset:0	customer-42	created
Partition:0	Offset:1	customer-42	paid
Partition:0	Offset:2	customer-42	shipped
Partition:1	Offset:0	customer-7	created
Partition:1	Offset:1	customer-99	created
Partition:1	Offset:2	customer-7	paid
```

All of customer-42's events are in partition 0, in order. customer-7 and customer-99 share partition 1, interleaved; that is fine, because order only matters per key. Partition 2 got nothing: with three keys, an even spread is not guaranteed.

## The default partitioner, in JavaScript

For a record with a key, the Java producer takes the murmur2 hash of the key bytes, clears the sign bit and takes it modulo the number of partitions. This port gives the same answers the cluster gave above (and, for 4 partitions, the same as a second test topic):

```js run
function murmur2(bytes) {
  const m = 0x5bd1e995, r = 24;
  let h = (0x9747b28c ^ bytes.length) | 0;
  const len4 = bytes.length >> 2;
  for (let i = 0; i < len4; i++) {
    const j = i * 4;
    let k = (bytes[j] & 0xff) | ((bytes[j + 1] & 0xff) << 8) | ((bytes[j + 2] & 0xff) << 16) | ((bytes[j + 3] & 0xff) << 24);
    k = Math.imul(k, m);
    k ^= k >>> r;
    k = Math.imul(k, m);
    h = Math.imul(h, m) ^ k;
  }
  const tail = len4 * 4, left = bytes.length % 4;
  if (left === 3) h ^= (bytes[tail + 2] & 0xff) << 16;
  if (left >= 2) h ^= (bytes[tail + 1] & 0xff) << 8;
  if (left >= 1) { h ^= bytes[tail] & 0xff; h = Math.imul(h, m); }
  h ^= h >>> 13;
  h = Math.imul(h, m);
  h ^= h >>> 15;
  return h;
}
const partitionFor = (key, partitions) =>
  (murmur2(new TextEncoder().encode(key)) & 0x7fffffff) % partitions;

for (const key of ["customer-42", "customer-7", "customer-99"]) {
  console.log(key, "-> partition", partitionFor(key, 3), "of 3,", partitionFor(key, 4), "of 4");
}
```

Note the last column: going from 3 to 4 partitions moves every one of these keys. Kafka does not move existing records, so after adding partitions a key's old records are in one partition and its new ones in another, and a consumer can see them out of order across the switch. For keyed topics, choose a partition count with room to grow and avoid changing it.

Records with no key are spread for throughput. The Java producer's default logic sends keyless records to one partition until `batch.size` bytes have gone there, then switches, which builds fuller batches than round-robin. Clients in other languages (librdkafka, for example) may use a different hash by default, so a mixed-language system should agree on a partitioner if keys must line up.

## Choosing a key

- Use the entity whose events must stay in order: order id, account id, device id.
- Check the spread. One key with a large share of traffic makes one hot partition and one overloaded consumer.
- Partition count caps consumer parallelism in a group: with 12 partitions, a 13th consumer sits idle.
