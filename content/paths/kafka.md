---
id: kafka
title: "Kafka: the log at the centre of the system"
promise: "How an append-only, partitioned, replicated log works, what producers and consumer groups really guarantee, what exactly-once does and does not cover, and the operational traps (lag, rebalances, too many partitions) that come with running one."
kind: skill
level: intermediate
tags: [data, backend]
stages:
  - title: The log
    blurb: Append, offset, partition
    topics: [kafka-log, kafka-partitions]
  - title: Writing and reading
    blurb: Producers, groups, guarantees
    topics: [kafka-producers, kafka-consumer-groups, kafka-delivery]
  - title: Keeping the data
    blurb: Replicas, retention, controllers
    topics: [kafka-replication, kafka-retention, kafka-kraft]
  - title: Building on it
    blurb: Schemas, tools, operations, choices
    topics: [kafka-schemas, kafka-streams-connect, kafka-operations, kafka-vs-queues]
bridges:
  - id: event-streaming
    why: Kafka is the reference implementation of event streaming. The library topic covers the pattern and its alternatives at a system design level.
  - id: competing-consumers
    why: "A consumer group is competing consumers with one twist: the unit of work handed out is a partition, not a message, which caps parallelism at the partition count."
  - id: idempotency
    why: "Kafka delivers at least once by default, and exactly-once ends at Kafka's edge. Every consumer that changes something outside Kafka needs an idempotent handler."
  - id: outbox
    why: "Writing to a database and producing to Kafka are two systems. The outbox commits the event with the data, and a relay or CDC connector publishes it."
  - id: backpressure
    why: "Kafka absorbs bursts because consumers pull at their own pace; consumer lag is the backpressure signal. The library topic covers what to do when lag keeps growing."
  - id: event-sourcing
    why: A compacted or long-retention topic can hold the events from which state is rebuilt. The library topic covers snapshots and replays.
  - id: cqrs
    why: "Kafka is a common way to feed read models: commands write to one store, events flow through topics, and consumers build query-shaped views."
next: [event-driven, data-consistency]
---
Written for Apache Kafka 3.x and 4.x; the links point to the 4.3 documentation (May 2026). The examples were run on Apache Kafka 4.1.0 from the `apache/kafka` Docker image, on a single-node cluster and on a three-node KRaft cluster with combined broker and controller roles. Exactly-once transactions, Kafka Streams and Connect were not run.

Recent changes worth knowing: Kafka 4.0 (March 2025) removed ZooKeeper entirely, made the new consumer rebalance protocol generally available and changed the producer's `linger.ms` default from 0 to 5. Kafka 4.1 (September 2025) turned on Eligible Leader Replicas for new clusters, and Kafka 4.2 (February 2026) made share groups ("queues for Kafka") production-ready. Schema Registry, mentioned in the schemas topic, is a Confluent component rather than part of Apache Kafka; other registries exist.
