---
id: kafka-replication
title: "Replication, ISR and min.insync.replicas"
summary: How many copies must have a record before it counts
why: "acks=all sounds like \"all replicas\". It means all replicas currently in sync, which can be just the leader. min.insync.replicas is the setting that turns acks=all into a real durability guarantee."
requires: [kafka-producers]
lesson: none
points:
  - title: One leader, some followers
    text: "Each partition has a leader that takes reads and writes, and followers that fetch from it. replication.factor is the number of copies."
  - title: The ISR is the set that keeps up
    text: "A follower drops out of the in-sync replica set if it falls behind for replica.lag.time.max.ms (30 s) or loses its session with the controller."
  - title: min.insync.replicas sets the floor
    text: "With acks=all, a write fails with NOT_ENOUGH_REPLICAS when the ISR is smaller than min.insync.replicas (default 1)."
  - title: Consumers see only replicated data
    text: "Consumers read up to the high watermark. Since 4.1 (ELR on), it does not advance while the ISR is below the minimum, whatever acks the producer used."
quiz_hint: Count the replicas in the ISR, compare with min.insync.replicas, and then ask what acks the producer used.
quiz:
  - q: "replication.factor=3, min.insync.replicas=2, acks=all. One broker fails. Can producers still write?"
    options:
      - No, all three replicas must confirm
      - "Yes; two replicas remain in sync, which meets the minimum, and both must confirm each write"
      - Only with acks=1
    answer: 1
    explain: "This is the usual setup: it survives one broker failure for writes, and every acknowledged record is on at least two brokers."
  - q: "replication.factor=3 with the default min.insync.replicas=1. Two followers fall out of the ISR and the leader accepts acks=all writes alone. Then the leader's disk dies. What happens to those writes?"
    options:
      - They are on the followers
      - "They are lost; with min.insync.replicas=1, acks=all was satisfied by the leader alone"
      - Kafka refuses to elect a new leader
    answer: 1
    explain: "The ISR had shrunk to the leader, so all of the ISR was one broker. Setting min.insync.replicas=2 would have rejected those writes instead."
  - q: What does unclean.leader.election.enable=true (default false) allow?
    options:
      - Faster elections with no downside
      - "Electing a replica that is not in sync when no in-sync replica is available, restoring availability at the cost of losing records it never received"
      - Electing two leaders
    answer: 1
    explain: "It is a choice between availability and consistency. Leaving it off means a partition stays offline until an in-sync replica returns."
links:
  - { title: "Design: replication (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
  - { title: "Topic configs: min.insync.replicas (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/topic-configs/" }
  - { title: "Eligible leader replicas (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/eligible-leader-replicas/" }
---
Each partition is copied to `replication.factor` brokers. One copy is the leader, which handles produce and fetch requests; the others are followers that fetch from it like consumers do. The leader tracks which followers are keeping up: the in-sync replica set, or ISR. A record is committed once every member of the ISR has it, and only committed records are visible to consumers. If the leader fails, the controller picks a new leader from the ISR, so committed records survive.

## The ISR shrinks

On a three-broker KRaft cluster, a topic with three replicas and `min.insync.replicas=2`:

```sh
bin/kafka-topics.sh --bootstrap-server kafka1:9092 --create --topic ledger \
  --replica-assignment 1:2:3 --config min.insync.replicas=2
docker stop kafka3        # stop one broker
bin/kafka-topics.sh --bootstrap-server kafka1:9092 --describe --topic ledger
```

```text
Topic: ledger  Partition: 0  Leader: 1  Replicas: 1,2,3  Isr: 1,2,3   (before)
Topic: ledger  Partition: 0  Leader: 1  Replicas: 1,2,3  Isr: 1,2     (after)
```

Writes with `acks=all` still succeeded: two in-sync replicas meet the minimum.

## Below the minimum

A second topic had two replicas (`--replica-assignment 1:2`) and `min.insync.replicas=2`. With broker 2 stopped, its ISR was just the leader, and an `acks=all` write failed:

```text
Topic: ledger2  Partition: 0  Leader: 1  Replicas: 1,2  Isr: 1  Elr: 2
WARN [Producer clientId=console-producer] Got error produce response with correlation id 7
  on topic-partition ledger2-0, retrying (0 attempts left). Error: NOT_ENOUGH_REPLICAS
```

The same write with `acks=1` was accepted, and `kafka-dump-log.sh` showed it in the leader's log file. But a consumer read nothing and the latest offset stayed 0:

```text
$ bin/kafka-get-offsets.sh --bootstrap-server kafka1:9092 --topic ledger2
ledger2:0:0
```

When broker 2 came back and rejoined the ISR, the latest offset became 2 and both records were readable. That is the documented behaviour: whatever `acks` the producer used, records are not visible to consumers until they reach all in-sync replicas and the ISR meets `min.insync.replicas`. In 4.x, with Eligible Leader Replicas (on by default for new clusters since 4.1), the high watermark cannot advance while the ISR is below the minimum, and replicas that left the ISR in that state (the `Elr: 2` above) remain safe choices for leader.

## Settings to decide on

```properties
default.replication.factor=3   # broker default is 1
min.insync.replicas=2          # default is 1
unclean.leader.election.enable=false
```

- **Replication factor 3, minimum 2, `acks=all`** is the usual production choice: it tolerates one broker failure without blocking writes or losing acknowledged data.
- **Minimum equal to the replication factor** means any single broker failure blocks writes.
- **Unclean leader election** (off by default) lets a replica outside the ISR become leader when no in-sync one is left. The partition comes back sooner, without the records that replica never received.

Spread replicas across racks or availability zones with `broker.rack`, so one zone outage does not take every copy of a partition.
