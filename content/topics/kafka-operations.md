---
id: kafka-operations
title: "Operational pitfalls: lag, partitions, rebalances"
summary: The three problems most Kafka on-call pages are about
why: "Kafka rarely loses data when configured sensibly. What hurts in practice is consumers falling behind, clusters carrying far more partitions than they need, and groups that keep rebalancing instead of working."
requires: [kafka-consumer-groups, kafka-replication]
lesson: none
points:
  - title: Watch lag, per partition
    text: "Consumer lag is log end offset minus committed offset. Steady lag is a capacity problem; lag on one partition is a hot key or a stuck consumer."
  - title: Partitions are not free
    text: "Each one is files on disk, memory on brokers and clients, a leader to elect and a unit to rebalance. Size for the throughput and parallelism you need, plus headroom."
  - title: Rebalance storms stop work
    text: "Slow processing past max.poll.interval.ms, short session timeouts and rolling restarts can keep a group rebalancing. The new protocol, static membership and smaller batches help."
  - title: Alert on replication health
    text: "UnderReplicatedPartitions, UnderMinIsrPartitionCount and OfflinePartitionsCount should be zero; anything else means durability or availability is at risk."
quiz_hint: Ask whether the problem is the cluster, one partition, or one consumer.
quiz:
  - q: "Lag on a 12-partition topic grows on partition 7 only. What is the most likely cause?"
    options:
      - The brokers are overloaded
      - "A hot key sending most traffic to partition 7, or the one consumer that owns partition 7 being slow or stuck"
      - Retention is too short
    answer: 1
    explain: "Lag isolated to one partition points at that partition's data or its owner. Even lag on every partition points at total consumer capacity."
  - q: "Consumers take 8 minutes per poll batch on bad days and the group keeps rebalancing. Which change addresses the cause?"
    options:
      - Add more partitions
      - "Lower max.poll.records (or make processing faster) so each batch finishes well within max.poll.interval.ms (5 minutes by default)"
      - Increase retention
    answer: 1
    explain: "A member that does not poll within max.poll.interval.ms is removed and its partitions reassigned; then it rejoins and triggers another rebalance. Smaller batches, faster handlers, or a larger interval break the loop."
  - q: "Why is \"1,000 partitions per topic, to be safe\" a poor default?"
    options:
      - Kafka does not allow it
      - "Every partition costs broker memory, file handles, metadata and recovery time, and keyed topics cannot cheaply change count later; most topics need far fewer"
      - Partitions slow down producers linearly
    answer: 1
    explain: "Choose from target throughput per partition and the consumer parallelism you need, with room to grow. KRaft raised the practical limits on partitions per cluster, but the per-partition costs remain."
links:
  - { title: "Monitoring (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/monitoring/" }
  - { title: "Basic Kafka operations (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/basic-kafka-operations/" }
  - { title: "Consumer rebalance protocol (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/consumer-rebalance-protocol/" }
---
Kafka's guarantees hold as long as the cluster is healthy and consumers keep up. Most incidents are not data loss but a pipeline that silently falls behind, a cluster struggling under its own partition count, or a consumer group that spends more time reassigning partitions than processing them. Each has a recognisable signal.

## Consumer lag

```sh
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group billing
```

```text
GROUP    TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
billing  orders  0          3               4               1
billing  orders  1          1               4               3
billing  orders  2          0               0               0
```

Lag is the log end offset minus the committed offset, per partition. Read it as a trend: lag that rises during a burst and then drains is the log doing its job as a buffer; lag that climbs steadily means consumers are slower than producers, and they will eventually fall off the end of retention. Lag in time ("how old is the oldest unprocessed record") is easier to alert on than a record count, because a count means different things on different topics. Consumers publish `records-lag-max`; tools outside Kafka can also compute lag from committed offsets.

Fixes, by cause: add consumers if there are idle partitions to give them; add partitions if every partition already has an owner (keyed topics: plan this); speed up the handler (batching writes, fewer round trips); or deal with a hot key.

## Too many partitions

Every partition replica is a directory of segment files and indexes, memory on the broker, entries in the metadata log, and work during leader elections and broker restarts. On the client side, producers keep a buffer per partition and consumers fetch per partition. KRaft raised how many partitions a cluster can manage, but the cost per partition does not vanish. Pick counts from the throughput you need per topic and the consumer parallelism you need, with headroom, rather than a large round number for every topic.

## Rebalance storms

A rebalance pauses work on the partitions being moved. With the classic protocol and the old eager assignors, every rebalance stopped the whole group. Common triggers:

- **Slow batches.** A member that does not call `poll()` within `max.poll.interval.ms` (5 minutes) is removed, its partitions move, it comes back and triggers another rebalance.
- **Missed heartbeats.** Long GC pauses or overloaded hosts exceed the session timeout (45 s by default for classic consumers).
- **Rolling deploys.** Each restart is a leave and a join.

Remedies: smaller `max.poll.records` or faster processing; static membership (`group.instance.id`), so a restart within the session timeout keeps its partitions; the cooperative sticky assignor on the classic protocol; or the new protocol (`group.protocol=consumer`, GA in 4.0), which moves partitions incrementally without stopping the group.

## Broker health

```text
kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions       ISR smaller than the replica list
kafka.server:type=ReplicaManager,name=UnderMinIsrPartitionCount       acks=all writes are failing
kafka.controller:type=KafkaController,name=OfflinePartitionsCount     partitions with no leader
kafka.controller:type=KafkaController,name=ActiveControllerCount      exactly one controller should report 1
```

Alongside these: disk usage per broker (a full disk takes a broker down), request latency percentiles, and leader balance. Kafka tries to move leadership back to each partition's preferred replica after a broker returns; `kafka-reassign-partitions.sh` moves replicas when you add brokers, because new brokers start empty.
