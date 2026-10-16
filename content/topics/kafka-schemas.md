---
id: kafka-schemas
title: "Schemas and evolution"
summary: Agree on the shape of records, and change it safely
why: "Kafka stores bytes and never looks inside them. Producers and consumers deploy on different schedules and old records stay in the log, so every change to a record's shape must be readable by code that is older or newer than the writer."
requires: [kafka-producers]
lesson: none
points:
  - title: Kafka only sees bytes
    text: "Serialisers in the client turn objects into bytes and back. The broker does not check formats, so nothing stops a producer from writing something consumers cannot parse."
  - title: A schema registry stores the contract
    text: "Producers register schemas (Avro, Protobuf or JSON Schema) and put a small schema id in each record; consumers fetch the schema by id."
  - title: Compatibility rules gate changes
    text: "The registry rejects a new schema version that breaks the chosen rule: BACKWARD (the Confluent default), FORWARD, FULL, their TRANSITIVE variants, or NONE."
  - title: The rule decides the deploy order
    text: "With BACKWARD, upgrade consumers first; with FORWARD, upgrade producers first; with FULL, either order works."
quiz_hint: Ask who reads with which schema. A consumer on version 2 reading a record written with version 1 needs backward compatibility.
quiz:
  - q: "Under BACKWARD compatibility, you add a field discount_cents to an Avro schema. What must the new field have?"
    options:
      - "Nothing; any new field is fine"
      - "A default value, so a consumer using the new schema can read old records that lack the field"
      - It must be the first field
    answer: 1
    explain: "Readers with the new schema fill in the default for old records. Without a default, the registry rejects the change as incompatible."
  - q: "Why is BACKWARD (rather than FORWARD) the usual default for Kafka topics?"
    options:
      - It is faster
      - "Consumers with the newest schema can read the whole topic, including old records, so they can rewind and replay"
      - FORWARD is not supported by Avro
    answer: 1
    explain: "Kafka keeps history, and the common operation is a new consumer reading it. Confluent's documentation gives this as the main reason for the default."
  - q: Is Schema Registry part of Apache Kafka?
    options:
      - Yes, it ships with every broker
      - "No; the widely used one is Confluent's (under its community licence), and other registries exist (for example Apicurio or AWS Glue)"
      - It was added in Kafka 4.0
    answer: 1
    explain: "Apache Kafka has serialiser interfaces and Connect converters but no registry. The registry is a separate service your clients talk to."
links:
  - { title: "Schema evolution and compatibility (Confluent docs)", url: "https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html" }
  - { title: "Formats, serializers and deserializers (Confluent docs)", url: "https://docs.confluent.io/platform/current/schema-registry/fundamentals/serdes-develop/index.html" }
  - { title: "Kafka Connect user guide: converters (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/kafka-connect/user-guide/" }
---
A Kafka record's key and value are byte arrays. The broker stores them without looking inside, so the format is an agreement between producers and consumers that Kafka itself does not enforce. Because a topic outlives many deployments of the services around it, that agreement changes over time while old records remain in the log. A schema registry turns the agreement into something checked automatically.

## How a registry works

The common setup, with Confluent's Schema Registry:

1. The producer's serialiser registers the record's schema under a subject (by default `<topic>-value` or `<topic>-key`) and gets back a numeric id.
2. Each record starts with a version byte (0) and the 4-byte schema id, then the encoded data.
3. The consumer's deserialiser reads the id, fetches and caches the schema, and decodes.

Registering a new version triggers a compatibility check against earlier versions of the same subject. An incompatible change is rejected at the producer, before any bad record reaches the topic.

## Evolving a schema

Version 1 of an Avro schema:

```json
{ "type": "record", "name": "OrderPaid", "namespace": "shop",
  "fields": [
    { "name": "orderId", "type": "string" },
    { "name": "amountCents", "type": "long" }
  ] }
```

Version 2 adds a field with a default:

```json
{ "type": "record", "name": "OrderPaid", "namespace": "shop",
  "fields": [
    { "name": "orderId", "type": "string" },
    { "name": "amountCents", "type": "long" },
    { "name": "discountCents", "type": "long", "default": 0 }
  ] }
```

A consumer on version 2 reading a version 1 record gets `discountCents: 0`. That makes version 2 backward compatible. Checking it against the registry's REST API (not run here; host and topic are examples):

```sh
curl -s -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schema": "<version 2 as an escaped JSON string>"}' \
  http://registry:8081/compatibility/subjects/orders-paid-value/versions/latest
```

## Compatibility modes

| Mode | Guarantees | Safe changes (Avro) | Upgrade first |
| --- | --- | --- | --- |
| BACKWARD (default) | New schema reads data written with the previous one | Delete fields, add fields with defaults | Consumers |
| FORWARD | Previous schema reads data written with the new one | Add fields, delete fields with defaults | Producers |
| FULL | Both | Add or delete fields that have defaults | Either |
| `*_TRANSITIVE` | The same, against all earlier versions, not just the last | | |
| NONE | No checks | Anything | All at once |

Plain BACKWARD only compares with the latest version, so a consumer replaying a topic from the beginning may meet records written with much older versions; `BACKWARD_TRANSITIVE` protects that case. For a change that no mode allows (changing a field's type from number to string), create a new topic or a new record type and migrate consumers.

## Without a registry

JSON without a schema works until someone renames a field. If you go without a registry, at least version your records (a `schemaVersion` field or a header), write consumers that ignore unknown fields, and never remove or repurpose a field in place. The same rules apply to events in any log or queue.
