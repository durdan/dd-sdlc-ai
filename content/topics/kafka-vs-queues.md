---
id: kafka-vs-queues
title: "Kafka or a queue (RabbitMQ, SQS)?"
summary: A replayable log versus messages that disappear when done
why: "Kafka and message queues overlap enough to be confused and differ enough to hurt when you pick the wrong one. The question is whether you are distributing work or publishing a history of facts."
requires: [kafka-consumer-groups, kafka-delivery]
lesson: none
points:
  - title: A queue hands out work
    text: "Each message goes to one consumer, is acknowledged individually and is then deleted. Failed messages are redelivered or sent to a dead letter queue."
  - title: A log publishes facts
    text: "Records stay for the retention period; any number of groups read them independently, at their own pace, and can replay."
  - title: Ordering and parallelism are tied together in Kafka
    text: "Kafka orders per partition and gives each partition to one consumer per group. Queues spread messages freely and usually give up ordering to do it."
  - title: Share groups blur the line
    text: "Since Kafka 4.2, share groups let many consumers take records from the same partition with per-record acknowledgement and delivery counts."
quiz_hint: Ask whether a second, unrelated team will want the same messages next year, and whether one slow message should hold up the ones behind it.
quiz:
  - q: "Three teams (billing, analytics, search) each need every order event, and analytics wants to reprocess last month after a bug fix. Which fits better?"
    options:
      - "A work queue, one copy per team"
      - "A Kafka topic: each team has its own consumer group, and analytics resets its offsets to replay"
      - Either; they are equivalent
    answer: 1
    explain: "A log serves many independent readers from one copy and supports replay within retention. With queues you fan out copies per subscriber and cannot replay what was already deleted."
  - q: "Image-resize jobs take from 1 second to 5 minutes each, order does not matter, and one slow job should not hold up others. With classic consumer groups, what is the weakness of Kafka here?"
    options:
      - Kafka cannot store jobs
      - "A slow record blocks the records behind it in its partition, and parallelism is capped by the partition count"
      - Kafka loses jobs under load
    answer: 1
    explain: "This is queue-shaped work. A queue (or a Kafka share group, production-ready in 4.2) lets any free worker take the next message and redelivers individually."
  - q: "In SQS, a consumer receives a message and does not delete it within the visibility timeout (30 seconds by default). What happens?"
    options:
      - It is deleted
      - "It becomes visible again and another consumer can receive it, which is at-least-once delivery"
      - The queue blocks
    answer: 1
    explain: "Queues and Kafka both redeliver on failure, so handlers need to be idempotent in both. The unit of redelivery differs: one message in a queue, everything after the committed offset in a Kafka partition."
links:
  - { title: "Introduction: use cases (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/uses/" }
  - { title: "Upgrade notes: queues for Kafka in 4.2 (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/upgrade/" }
  - { title: "Group configs: share groups (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/group-configs/" }
---
Kafka and message queues such as RabbitMQ and Amazon SQS all move messages from producers to consumers, but they are built on different ideas. A queue is a list of work: a message is delivered to one consumer, acknowledged, and deleted. Kafka is a log of facts: records are kept for a retention period, and every reader keeps its own position. Most choices between them follow from that difference.

## Side by side

| | Kafka (consumer groups) | Work queue (RabbitMQ queues, SQS) |
| --- | --- | --- |
| After processing | Record stays until retention | Message is deleted on acknowledgement |
| Many independent readers | Each group reads everything | Fan out to one queue per subscriber (exchanges, SNS) |
| Replay | Reset offsets within retention | Not possible once deleted |
| Ordering | Per partition, by key | Usually none (SQS FIFO and single-consumer queues are exceptions) |
| Parallelism | Up to the partition count per group | Add consumers freely |
| Unit of acknowledgement | An offset per partition | One message |
| A slow or poison message | Holds up its partition | Others carry on; it is retried or dead-lettered |
| Routing | Topic and key | Rich in RabbitMQ (exchanges, bindings); simple in SQS |
| Retention | Configurable: hours, days or forever | Until consumed; SQS also expires messages after 4 days by default, 14 at most |

## When Kafka fits

- Events that several systems consume, now or later: order placed, payment captured, profile changed.
- Replay and backfill: rebuilding a search index, recomputing analytics after a bug fix, onboarding a new service from history.
- Streams processing and change data capture, where ordering per key matters.
- High sustained throughput with consumers that read in batches.

## When a queue fits

- Task distribution: send this email, resize this image, call this webhook. Jobs vary in duration, ordering does not matter, and one stuck job should not delay the rest.
- Per-message retries with delays and dead letter queues, without writing that machinery yourself.
- Request/reply and routing patterns, where RabbitMQ's exchanges do the work.
- Small volumes where running a Kafka cluster (or paying for a managed one) is not worth it; SQS is serverless and pay per request.

## Share groups: queues inside Kafka

Kafka 4.2 made share groups (KIP-932, "queues for Kafka") production-ready. Consumers in a share group take records from the same partitions cooperatively instead of owning whole partitions. Each record is acquired with a time-limited lock (`share.record.lock.duration.ms`, 30 s by default), acknowledged individually, and redelivered if not, up to `share.delivery.count.limit` attempts (5 by default). That suits queue-shaped work on data that already lives in Kafka, without ordering guarantees. It is new, so check client support in your language before relying on it.

## Both, often

Many systems use both: Kafka as the record of what happened, and queues (or share groups) for the tasks those events cause. In either case delivery is at least once, so the handlers are idempotent.
