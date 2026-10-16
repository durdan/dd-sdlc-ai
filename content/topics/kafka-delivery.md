---
id: kafka-delivery
title: "Delivery semantics and exactly-once"
summary: "At-least-once by default; exactly-once inside Kafka, with care"
why: "\"Exactly-once\" is the most misunderstood phrase in Kafka. It is real, but it covers reading from Kafka, processing and writing back to Kafka, not the email your consumer sends or the row it writes to PostgreSQL."
requires: [kafka-producers, kafka-consumer-groups]
lesson: none
points:
  - title: Three possible guarantees
    text: "At-most-once (commit before processing), at-least-once (commit after processing, the default) and exactly-once (the result appears once even if steps are retried)."
  - title: Transactions tie output to input
    text: "A transactional producer writes output records and the consumer's offsets in one atomic transaction, so either both happen or neither."
  - title: Readers must ask for committed data
    text: "Consumers see aborted and in-flight transactional records unless isolation.level=read_committed; the default is read_uncommitted."
  - title: It stops at Kafka's edge
    text: "Side effects outside Kafka (databases, emails, HTTP calls) are not covered. They need idempotent handlers or the outbox and inbox patterns."
quiz_hint: List every system the record touches. Exactly-once covers only the ones that take part in the Kafka transaction.
quiz:
  - q: A Kafka Streams app with processing.guarantee=exactly_once_v2 reads payments and also calls an external fraud API per record. Is the API called exactly once per record?
    options:
      - Yes; exactly-once covers the whole application
      - "No; after a failure the transaction is retried, and the API call can happen again. Only the records written to Kafka (and the offsets) are exactly-once"
      - Yes, if the API returns quickly
    answer: 1
    explain: "Transactions make Kafka writes atomic and invisible until commit. They cannot undo or deduplicate an external call. Make the call idempotent (an idempotency key) or move it to its own consumer."
  - q: A transactional producer aborts a transaction. A consumer with the default isolation.level reads the topic. What does it see?
    options:
      - Nothing from the aborted transaction
      - "The aborted records too, because the default is read_uncommitted"
      - An error
    answer: 1
    explain: "Set isolation.level=read_committed on consumers of transactional topics. They then read only up to the last stable offset, so an open transaction also holds back records after it."
  - q: Which setup gives at-most-once delivery?
    options:
      - Commit offsets after processing
      - "Commit offsets before processing (and disable producer retries)"
      - Use acks=all
    answer: 1
    explain: "If the consumer crashes after committing but before processing, those records are skipped. That is acceptable for some metrics and never for payments."
links:
  - { title: "Design: message delivery semantics (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
  - { title: "Transaction protocol (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/transaction-protocol/" }
  - { title: "Consumer configs: isolation.level (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/consumer-configs/" }
  - { title: "Exactly-once semantics are possible (Confluent blog)", url: "https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/" }
---
Every messaging system has to answer one question: when something fails halfway, is a message lost, delivered twice, or neither? Kafka's design documentation lists three answers. At most once: records may be lost, never redelivered. At least once: never lost, sometimes redelivered. Exactly once: each record's effect happens once. Kafka gives at-least-once by default, and exactly-once for pipelines that read from Kafka and write back to Kafka.

## Where duplicates and gaps come from

- **Producer side.** A send is retried after a lost acknowledgement. The idempotent producer (default since 3.0) removes these duplicates within a producer session.
- **Consumer side.** The consumer processes records, then crashes before committing. The next owner starts from the old commit and processes them again (the trace in the previous topic). Committing before processing turns this into a gap instead.

So, by default: no loss with `acks=all` and sensible replication, but possible duplicates at the consumer.

## Exactly-once: read, process, write

For a consumer that reads topic A and writes results to topic B, the dangerous moment is between writing to B and committing A's offset. Kafka's transactions put both in one atomic unit:

```properties
# producer
transactional.id=payments-enricher-1
enable.idempotence=true
# consumer
isolation.level=read_committed
enable.auto.commit=false
```

```java
producer.initTransactions();
while (true) {
  ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
  producer.beginTransaction();
  for (var r : records) producer.send(new ProducerRecord<>("payments-enriched", r.key(), enrich(r.value())));
  producer.sendOffsetsToTransaction(nextOffsets(records), consumer.groupMetadata());
  producer.commitTransaction();   // output and input offsets together, or neither
}
```

(Error handling omitted: on failure, abort and rewind.) The `transactional.id` survives restarts, so a restarted instance fences off its old self and the old instance can no longer commit. Consumers with `read_committed` only see records from committed transactions; the default `read_uncommitted` also returns aborted ones. Kafka Streams does all of this for you with `processing.guarantee=exactly_once_v2`.

Kafka 4.0 strengthened the protocol on the broker side (KIP-890): with 4.0 clients the producer epoch is bumped on every transaction, so a late, retried write cannot slip into the next transaction.

## What it does not cover

Exactly-once covers records in Kafka and offsets in Kafka. It does not cover:

- writes to a database, a cache or a search index;
- emails, payments, HTTP calls;
- a producer that calls `send()` twice because your code ran twice.

For those, design the consumer to be idempotent: upsert by a business key, keep a table of processed record ids (an inbox) in the same database transaction as the effect, or carry an idempotency key to the external API. With Kafka Connect, whether a sink is exactly-once depends on the connector and the target system, so read its documentation. The pragmatic default for most services is at-least-once delivery plus idempotent handling.
