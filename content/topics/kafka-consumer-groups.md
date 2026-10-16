---
id: kafka-consumer-groups
title: "Consumer groups, rebalancing and offsets"
summary: Partitions shared out, positions committed, records redelivered
why: "Almost every duplicate, every gap and every mysterious pause in a Kafka consumer comes from when offsets are committed and what happens during a rebalance."
requires: [kafka-partitions]
lesson: lanes
points:
  - title: A group shares partitions, not records
    text: "Each partition is assigned to exactly one member of the group. More members than partitions leaves some idle."
  - title: Committed offset means next to read
    text: "The group stores, per partition, the offset of the next record to process. A new owner starts there."
  - title: Commit after processing gives at-least-once
    text: "If a consumer crashes after processing but before committing, the next owner processes those records again."
  - title: Rebalances move partitions
    text: "Members joining, leaving, crashing or missing max.poll.interval.ms trigger a rebalance. Kafka 4.0's new protocol makes it incremental and server-driven."
quiz_hint: Find the committed offset at the moment of the crash. Everything from there on will be read again.
quiz:
  - q: "A consumer processes offsets 3 and 4, then crashes before committing. The last commit was 3. Where does the next owner start?"
    options: [At offset 5, At offset 3, At offset 0]
    answer: 1
    explain: "The committed offset is 3, the next record to read, so offsets 3 and 4 are processed twice. That is at-least-once delivery, and why handlers should be idempotent."
  - q: "With enable.auto.commit=true (the default), when are offsets committed?"
    options:
      - After your code finishes processing each record
      - "Every auto.commit.interval.ms (5 s by default), during poll(), for the records returned by earlier polls"
      - Never
    answer: 1
    explain: "Auto-commit commits what poll() has handed out, not what you have finished. If you process records asynchronously and crash, records can be committed but never processed. Commit manually after processing when that matters."
  - q: A topic has 6 partitions and the group has 8 consumers. How many consumers receive records?
    options: ["8, sharing each partition", "6; two members get no partitions", "1, the group leader"]
    answer: 1
    explain: "A partition has one owner within a group. Parallelism is capped by the partition count. Share groups (production-ready in Kafka 4.2) remove that cap for queue-style work."
links:
  - { title: "Consumer configs (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/configuration/consumer-configs/" }
  - { title: "Consumer rebalance protocol (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/consumer-rebalance-protocol/" }
  - { title: "Design: consumer position (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/design/design/" }
---
Consumers that share a `group.id` form a consumer group. The group's coordinator, a broker, divides the topic's partitions among the members so each partition has exactly one owner, and stores each partition's committed offset in the internal `__consumer_offsets` topic. When a member arrives, leaves or dies, partitions are reassigned: a rebalance. The trace below follows one partition through a commit, a crash and a handover.

```trace lanes
id: commit-crash-redeliver
title: Commit, crash, redeliver
subtitle: Why at-least-once is the default
run: any
module: cjs
code: |
  const log = ["o1", "o2", "o3", "o4", "o5"];
  let committed = 0; // kept by the group coordinator
  const poll = (from, max) =>
    log.slice(from, from + max).map((v, i) => ({ offset: from + i, v }));

  // Consumer A owns the partition: process a batch, then commit
  let batch = poll(committed, 3);
  for (const r of batch) console.log("A processed", r.offset, r.v);
  committed = batch[batch.length - 1].offset + 1;

  // A processes the next batch but crashes before committing
  batch = poll(committed, 3);
  for (const r of batch) console.log("A processed", r.offset, r.v);

  // Rebalance: B gets the partition and resumes from the commit
  batch = poll(committed, 3);
  for (const r of batch) console.log("B processed", r.offset, r.v);
  committed = batch[batch.length - 1].offset + 1;
  console.log("committed", committed);
lanes:
  - { id: log, title: Partition 0, hint: "The log; reading never removes records", kind: queue, tone: muted }
  - { id: a, title: Consumer A, hint: Records it has fetched, kind: plain, tone: blue }
  - { id: b, title: Consumer B, hint: Records it has fetched, kind: plain, tone: teal }
  - { id: off, title: Committed offset, hint: "Next offset to read, stored by the group", kind: plain, tone: amber }
  - { id: out, title: Console, kind: console }
steps:
  - caption: Nothing has run yet. One partition, a group with consumers A and B, and A owns the partition.
  - line: 1
    caption: The partition holds five records at offsets 0 to 4.
    state:
      log: [{ id: r0, label: "0 o1" }, { id: r1, label: "1 o2" }, { id: r2, label: "2 o3" }, { id: r3, label: "3 o4" }, { id: r4, label: "4 o5" }]
  - line: 2
    caption: "The group has committed offset 0: the next record to read, not the last one read."
    state:
      off: [{ id: c, label: "next: 0" }]
  - line: 7
    caption: "A polls from the committed offset and gets offsets 0 to 2. The records stay in the log."
    state:
      a: [{ id: a0, label: "0 o1" }, { id: a1, label: "1 o2" }, { id: a2, label: "2 o3" }]
  - line: 8
    caption: A processes all three, for example by writing to a database.
    log: ["A processed 0 o1", "A processed 1 o2", "A processed 2 o3"]
  - line: 9
    caption: "Only after processing does A commit, and it commits 3: the offset of the next record."
    state:
      a: []
      off: [{ id: c, label: "next: 3" }]
  - line: 12
    caption: The next poll returns offsets 3 and 4, all that is left.
    state:
      a: [{ id: a3, label: "3 o4" }, { id: a4, label: "4 o5" }]
  - line: 13
    caption: A processes both. Their side effects have happened.
    log: ["A processed 3 o4", "A processed 4 o5"]
  - line: 15
    caption: "A crashes before it commits. The group still says next: 3."
    state:
      a: [{ id: dead, label: crashed before commit, tone: rose }]
  - line: 16
    caption: "The coordinator notices (missed heartbeats, or max.poll.interval.ms) and rebalances. B gets the partition and starts at the committed offset, 3."
    state:
      a: []
      b: [{ id: b3, label: "3 o4" }, { id: b4, label: "4 o5" }]
  - line: 17
    caption: B processes offsets 3 and 4 again. Nothing was lost, but two records were handled twice.
    log: ["B processed 3 o4", "B processed 4 o5"]
  - line: 18
    caption: B commits 5.
    state:
      b: []
      off: [{ id: c, label: "next: 5" }]
  - line: 19
    caption: "Committing after processing gives at-least-once delivery. Committing before processing would give at-most-once: a crash would skip records instead."
    log: committed 5
note: "A model of one partition, not the Kafka client API. In Java the commit is consumer.commitSync() after the processing loop."
expect:
  - A processed 0 o1
  - A processed 1 o2
  - A processed 2 o3
  - A processed 3 o4
  - A processed 4 o5
  - B processed 3 o4
  - B processed 4 o5
  - committed 5
```

## On a real cluster

Two console consumers in group `shipping` on a three-partition topic, using the new protocol (`group.protocol=consumer`):

```sh
bin/kafka-consumer-groups.sh --bootstrap-server kafka1:9092 --describe --group shipping --members --verbose
```

```text
GROUP     CONSUMER-ID             CLIENT-ID  #PARTITIONS  CURRENT-EPOCH  CURRENT-ASSIGNMENT  ...
shipping  CNZp_LDPRGCdXHKzF638Mw  worker-1   2            2              orders:0,1
shipping  WUzGEJhgTdyzZpJbweOUeg  worker-2   1            2              orders:2
```

The group's state showed the server-side assignor `uniform`. Describing a group without `--members` shows lag per partition, the gap between the committed offset and the end of the log:

```text
GROUP    TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
billing  orders  0          3               4               1
billing  orders  1          1               4               3
```

`--reset-offsets --to-earliest` (or `--to-datetime`, `--shift-by`) moves a stopped group's position, which is how you replay.

## Settings that cause trouble

- `enable.auto.commit=true` (default) commits every `auto.commit.interval.ms` (5 s) whatever poll() has returned, done or not.
- `max.poll.interval.ms` (5 minutes): a member that does not call poll() within it is considered dead and its partitions are moved. Slow processing per batch looks like a crash. Lower `max.poll.records` (default 500) or speed up the handler.
- `auto.offset.reset` decides where a group with no committed offset starts: `latest` by default, so a new group skips history unless you set `earliest`.
- Static membership (`group.instance.id`) lets a restarting member keep its partitions within the session timeout instead of triggering two rebalances.

Kafka 4.0 made the new rebalance protocol (KIP-848) generally available. The broker computes assignments and moves partitions incrementally, without stopping the whole group. Clients still default to `group.protocol=classic`; you opt in with `group.protocol=consumer`.
