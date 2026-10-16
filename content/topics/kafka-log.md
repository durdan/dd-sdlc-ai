---
id: kafka-log
title: "The log: append-only, with offsets"
summary: Records are appended, kept and read by position
why: "Most of Kafka's behaviour (replay, many independent readers, ordering, retention) follows from one decision: a topic is a log that readers do not remove anything from."
lesson: none
points:
  - title: Records are appended, never edited
    text: "Each record (key, value, headers, timestamp) is added to the end of a partition's log and gets the next offset: 0, 1, 2 and so on."
  - title: Reading does not delete
    text: "A consumer reads from an offset and moves forward. The record stays for every other reader until retention removes it."
  - title: Each reader keeps its own position
    text: "The broker does not track which messages were delivered; a consumer (or its group) stores the offset it has reached."
  - title: Sequential and cache-friendly
    text: "Appends and reads are sequential I/O through the OS page cache, and brokers send log data to sockets without copying it through the JVM."
quiz_hint: Ask what changes in the log when a consumer reads a record. (Nothing.)
quiz:
  - q: "Three services read the same topic. One of them is down for an hour. What happens to the records it misses?"
    options:
      - They are deleted after the other two read them
      - "Nothing; they stay in the log, and the service continues from its last committed offset when it returns (as long as retention has not removed them)"
      - The broker redirects them to the other services
    answer: 1
    explain: "Reading does not remove records, so readers are independent. Retention, not consumption, decides when data goes."
  - q: What is an offset?
    options:
      - A globally unique message id across the cluster
      - "The position of a record within one partition; offsets increase by one per record in that partition"
      - The time a record was written
    answer: 1
    explain: "Offsets are per partition. Topic, partition and offset together identify a record."
  - q: "Why can a consumer replay yesterday's data from Kafka but not from a typical work queue?"
    options:
      - Kafka stores a backup copy
      - "A queue deletes a message once it is acknowledged; Kafka keeps the log and lets a consumer move its offset back"
      - Queues cannot store data on disk
    answer: 1
    explain: "Resetting a consumer group's offsets (to the earliest offset, a timestamp or a specific offset) replays whatever is still retained."
links:
  - { title: "Introduction (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/introduction/" }
  - { title: "Design (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
  - { title: "Implementation: the log (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/implementation/log/" }
---
A Kafka topic is a log: an ordered sequence of records that only grows at the end. Producers append records; each one gets an offset, its position in the log. Consumers read from an offset of their choosing and move forward, and reading changes nothing in the log. That one idea separates Kafka from a classic message queue, where a delivered and acknowledged message is gone.

## A topic, as the broker sees it

```sh
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic orders --partitions 3 --replication-factor 1
bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic orders
```

```text
Topic: orders  TopicId: mKocV5hnSlCzNaZDxh26kA  PartitionCount: 3  ReplicationFactor: 1  Configs: min.insync.replicas=1,segment.bytes=1073741824
    Topic: orders  Partition: 0  Leader: 1  Replicas: 1  Isr: 1  ...
    Topic: orders  Partition: 1  Leader: 1  Replicas: 1  Isr: 1  ...
    Topic: orders  Partition: 2  Leader: 1  Replicas: 1  Isr: 1  ...
```

A topic is split into partitions (the next topic), and each partition is a separate log. On disk a partition is a directory of segment files:

```text
/tmp/kraft-combined-logs/orders-0/
  00000000000000000000.log        the records
  00000000000000000000.index      offset -> byte position
  00000000000000000000.timeindex  timestamp -> offset
  leader-epoch-checkpoint
  partition.metadata
```

Each segment is named after its first offset. When it reaches `segment.bytes` (1 GiB by default) or `segment.ms`, the broker starts a new one. Retention deletes whole old segments, which is why removing old data is cheap.

## Reading by position

Any consumer can start anywhere still retained. After writing six orders, reading partition 0 from offset 1:

```sh
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic orders \
  --partition 0 --offset 1 --property print.offset=true --property print.key=true --max-messages 2
```

```text
Offset:1	customer-42	paid
Offset:2	customer-42	shipped
```

The broker does not record that these were read. A consumer that wants to resume later stores its own position: consumer groups commit offsets to an internal topic, `__consumer_offsets`. The offset committed is the next one to read, not the last one processed.

## Why it is fast

The design documentation makes two points. Appending to and reading from the end of files is sequential I/O, which disks and SSDs handle well, and Kafka leans on the operating system's page cache instead of keeping its own cache of records in the JVM heap. When a consumer fetches data, the broker can hand file data straight to the socket (`sendfile` on Linux) without copying it through the application. Producers and consumers also work in batches, so per-record overhead is small.

Consumers pull rather than being pushed to. A slow consumer simply falls behind and catches up later; the gap is called consumer lag, and it is the main health signal for anything reading from Kafka.
