---
id: kafka-retention
title: "Retention and log compaction"
summary: Keep records for a time, or keep the latest per key
why: "Retention decides how far back consumers can replay and how much disk you buy. Compaction turns a topic into a changelog of current state, which is how Kafka stores consumer offsets and how Streams rebuilds its tables."
requires: [kafka-log]
lesson: none
points:
  - title: Delete is the default policy
    text: "cleanup.policy=delete removes whole old segments once they pass retention.ms (7 days) or the partition exceeds retention.bytes (unlimited)."
  - title: Compaction keeps the latest value per key
    text: "cleanup.policy=compact removes older records whose key has a newer record, in the background, without changing offsets or order."
  - title: Tombstones delete keys
    text: "A record with a key and a null value marks the key deleted; compaction removes the tombstone itself after delete.retention.ms (1 day)."
  - title: Retention works on segments
    text: "The active segment is never deleted or compacted. Records can outlive their retention by up to segment.ms or segment.bytes."
quiz_hint: Ask whether consumers need the history of every change, or only the current value of each key.
quiz:
  - q: "A compacted topic receives c1=old, c2=x, c1=new. After compaction runs, what can a consumer reading from the beginning see?"
    options:
      - "c1=old, c2=x, c1=new"
      - "c2=x and c1=new, at their original offsets"
      - "c1=new and c2=x, renumbered from offset 0"
    answer: 1
    explain: "Compaction removes superseded records but never changes offsets or order. In the run on this page the survivors kept offsets 2, 3 and 4 and offsets 0 and 1 were gone."
  - q: "A topic has retention.ms of 1 hour but records two days old are still there. Why?"
    options:
      - Retention is broken
      - "Retention deletes whole closed segments; on a quiet topic the active segment can stay open until segment.ms (7 days by default) rolls it"
      - Consumers have not read them yet
    answer: 1
    explain: "Lower segment.ms for low-volume topics that need prompt deletion (for example to meet a data deletion policy)."
  - q: How do you delete a key from a compacted topic?
    options:
      - Use kafka-delete-records.sh on the key
      - "Produce a record with that key and a null value (a tombstone)"
      - It cannot be done
    answer: 1
    explain: "Consumers see the tombstone and remove the key from their state; compaction later drops the earlier values and, after delete.retention.ms, the tombstone."
links:
  - { title: "Design: log compaction (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
  - { title: "Topic configs (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/topic-configs/" }
  - { title: "Tiered storage (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/tiered-storage/" }
---
Kafka keeps records whether or not anyone has read them, so something has to remove them eventually. Each topic chooses a cleanup policy. With `delete`, records are kept for a period of time or up to a size and then dropped. With `compact`, Kafka keeps at least the latest record for every key, so the topic always holds the current state of each key. A topic can use both.

## Time and size retention

```properties
cleanup.policy=delete
retention.ms=604800000      # 7 days, the default
retention.bytes=-1          # per partition; -1 (the default) means no size limit
segment.ms=604800000        # roll the active segment at least weekly (default)
segment.bytes=1073741824    # or at 1 GiB (default)
```

Retention removes whole segments, and only closed ones. A record becomes eligible once the newest record in its segment is older than `retention.ms`. On a busy topic that is close to exact; on a quiet one a segment can stay open for days, so records outlive their retention. `retention.bytes` is per partition, so a topic's total is roughly that times the partition count times the replication factor.

Retention is also the replay window. A consumer that falls further behind than retention loses data: its committed offset no longer exists, and `auto.offset.reset` decides where it jumps.

## Compaction

A compacted topic treats records as upserts by key. Five email-address records for three customers:

```sh
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic customer-email --partitions 1 \
  --config cleanup.policy=compact --config segment.ms=1000 --config min.cleanable.dirty.ratio=0.01
printf "c1:ana@old.example\nc2:ben@example.com\nc1:ana@new.example\nc3:cy@example.com\nc2:ben@work.example\n" \
  | bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic customer-email \
      --property parse.key=true --property key.separator=:
```

(The tiny `segment.ms` and dirty ratio make the cleaner act within a minute; never use them in production.) After the log cleaner ran, reading from the beginning:

```text
Offset:2	c1	ana@new.example
Offset:3	c3	cy@example.com
Offset:4	c2	ben@work.example
Offset:5	c9	tick
Offset:6	c9	tock
```

Offsets 0 and 1 (c1's and c2's old addresses) are gone. The survivors keep their offsets and order; compaction never renumbers. The `c9` records were produced afterwards to roll segments, since the active segment is never cleaned.

What compaction guarantees: a consumer that keeps up with the head of the log sees every record; one that reads from the start sees at least the final value of every key. `min.compaction.lag.ms` keeps records uncompacted for a minimum time, `max.compaction.lag.ms` bounds how long they can wait.

## Tombstones

To delete a key, produce the key with a null value. Consumers see the tombstone and drop the key from whatever they build; compaction removes older values for the key and, after `delete.retention.ms` (1 day by default), the tombstone too. A consumer rebuilding state from the start must finish within that time or it can miss a deletion.

## Uses and limits

Compacted topics hold consumer offsets (`__consumer_offsets`), Kafka Streams state store changelogs, Connect's configuration and offsets, and reference data such as current prices or customer profiles. `cleanup.policy=compact,delete` keeps the latest per key but also drops anything older than retention.

For long retention without buying broker disks, tiered storage keeps recent segments locally and moves older ones to object storage. It does not support compacted topics.
