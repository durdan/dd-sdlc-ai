---
id: kafka-streams-connect
title: "Kafka Streams and Kafka Connect"
summary: Process topics in your app; move data in and out without code
why: "Most teams that adopt Kafka end up writing the same two things: consumers that transform topics into other topics, and glue that copies data between Kafka and databases. Streams and Connect are Kafka's built-in answers, and knowing their shape tells you when to use them."
requires: [kafka-delivery, kafka-retention]
lesson: none
points:
  - title: Streams is a library, not a cluster
    text: "A Kafka Streams app is a normal Java application. Instances share work through a consumer group, one task per input partition."
  - title: State lives in local stores backed by topics
    text: "Aggregations and joins keep state in local stores (RocksDB by default), each backed up to a compacted changelog topic so a new instance can rebuild it."
  - title: Connect runs connectors
    text: "A Connect cluster runs source connectors (system into Kafka) and sink connectors (Kafka into system), configured with JSON, with offsets and configs stored in Kafka topics."
  - title: Converters and transforms at the edge
    text: "Converters turn Connect's internal records into bytes (JSON, Avro, Protobuf); single message transforms make small per-record changes."
quiz_hint: Ask where the code runs and where the state is kept if a machine disappears.
quiz:
  - q: A Kafka Streams app counts orders per customer. One of its three instances dies. What happens to its counts?
    options:
      - They are lost
      - "Its tasks move to the remaining instances, which rebuild the state stores from the changelog topics and continue"
      - The app stops until the instance returns
    answer: 1
    explain: "The changelog topic is the durable copy of the state. Standby replicas (num.standby.replicas) keep warm copies on other instances to shorten the rebuild."
  - q: "You want every change in a PostgreSQL table to appear in a Kafka topic. What is a common approach?"
    options:
      - Poll the table every second from a custom consumer
      - "Run a CDC source connector (for example Debezium) in Kafka Connect, which reads the database's change log"
      - Use a Kafka Streams KTable
    answer: 1
    explain: "Change data capture reads the write-ahead log, so it sees every change, including deletes, in order, without loading the table with queries."
  - q: What limits the parallelism of a Kafka Streams application?
    options: ["The number of threads you configure", "The number of partitions of its input topics", "The number of brokers"]
    answer: 1
    explain: "Work is split into tasks, one per input partition (for each sub-topology). Instances or threads beyond the task count sit idle."
links:
  - { title: "Kafka Streams introduction (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/streams/introduction/" }
  - { title: "Kafka Streams core concepts (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/streams/core-concepts/" }
  - { title: "Kafka Connect overview (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/kafka-connect/overview/" }
  - { title: "Kafka Connect user guide (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/kafka-connect/user-guide/" }
---
Apache Kafka ships two frameworks on top of producers and consumers. Kafka Streams is a Java library for programs that read topics, transform, join and aggregate them, and write topics. Kafka Connect is a service that runs connectors to copy data between Kafka and other systems. Neither was run for this path; this topic is about their shape and their trade-offs.

## Kafka Streams

```java
StreamsBuilder builder = new StreamsBuilder();
KStream<String, Order> orders = builder.stream("orders");          // key: customer id
KTable<String, Long> paidPerCustomer = orders
    .filter((customerId, order) -> order.status().equals("paid"))
    .groupByKey()
    .count(Materialized.as("paid-per-customer"));                  // a state store
paidPerCustomer.toStream().to("paid-per-customer");
```

```properties
application.id=paid-counter
bootstrap.servers=kafka1:9092
processing.guarantee=exactly_once_v2
```

The ideas:

- **KStream** is a stream of events; **KTable** is a changelog seen as a table, the latest value per key. Joins between them are what make Streams more than a consumer loop.
- **Tasks and partitions.** The topology is split into tasks, one per input partition. Instances with the same `application.id` form a consumer group and share the tasks, so you scale by starting more instances, up to the partition count.
- **State.** `count`, `aggregate` and joins keep state in local stores (RocksDB by default). Every update is also written to a compacted changelog topic. When a task moves, its new owner replays the changelog to rebuild the store; standby replicas keep warm copies elsewhere.
- **Exactly-once.** With `exactly_once_v2`, reading input, updating state and writing output happen in Kafka transactions (the delivery topic). External calls inside the topology are not covered.
- **Repartitioning.** Grouping by a different key writes records through an internal repartition topic, which costs a round trip through the brokers.

Streams runs inside your service, with no separate processing cluster. Engines such as Apache Flink offer more (other sources, larger state, SQL), at the cost of running one.

## Kafka Connect

A Connect cluster is a group of worker processes. You submit a connector configuration over its REST API, and the workers run the connector's tasks, record source offsets in Kafka topics and restart failed tasks. Not run here; a CDC source connector for PostgreSQL using Debezium might look like:

```json
{
  "name": "orders-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "db",
    "database.dbname": "shop",
    "topic.prefix": "shop",
    "table.include.list": "public.orders",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "shop.public.(.*)",
    "transforms.route.replacement": "cdc.$1"
  }
}
```

(Credentials omitted.) The parts you configure for any connector:

- **Connector class and tasks.** Source connectors poll a system and produce; sink connectors consume and write.
- **Converters** turn records into bytes and back: JSON, or Avro and Protobuf with a schema registry.
- **Single message transforms** rename topics, mask fields or route records, one record at a time. Anything heavier belongs in Streams or a consumer.
- **Errors.** `errors.tolerance` decides whether one bad record stops the connector; sink connectors can also send failed records to a dead letter queue topic.

Connectors are separate plugins, many maintained outside Apache Kafka (Debezium for CDC, others for JDBC, object storage and search engines), so check each one's delivery guarantees and licence.
