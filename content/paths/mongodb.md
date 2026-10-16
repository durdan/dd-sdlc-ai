---
id: mongodb
title: "MongoDB: documents, and the trade-offs they bring"
promise: "How to shape documents around the way you read them, which index serves which query, what a write acknowledgement really promises, how a replica set fails over, and what changes when you add transactions, shards and change streams."
kind: skill
level: intermediate
tags: [data, backend]
stages:
  - title: Documents and schemas
    blurb: Shape data by how you read it
    topics: [mongo-documents, mongo-schema-design, mongo-validation]
  - title: Finding things fast
    blurb: Plans, indexes, pipelines
    topics: [mongo-explain, mongo-indexes, mongo-aggregation]
  - title: Writes you can trust
    blurb: Replicas, acknowledgements, transactions
    topics: [mongo-replica-sets, mongo-write-concern, mongo-transactions]
  - title: Scale and change
    blurb: Shards, streams, storage
    topics: [mongo-sharding, mongo-change-streams, mongo-storage]
bridges:
  - id: read-replicas
    why: "Reading from a secondary is reading from an asynchronous replica. The library topic covers stale reads and read-your-writes routing in general."
  - id: sharding
    why: "A shard key is a partitioning decision you live with for years. The library topic compares hash and range partitioning across systems."
  - id: change-data-capture
    why: Change streams are MongoDB's built-in change data capture over the oplog. The library topic shows the pattern with other databases and Kafka.
  - id: outbox
    why: "Write the order and its event in one transaction (or one document), then publish from a change stream, so you never commit one without the other."
  - id: leader-election
    why: A replica set election is leader election with terms and majorities. The library topic explains why a majority is what prevents two leaders.
next: [scaling-out, inside-db, kafka]
---
Written for MongoDB 7.0 and 8.x; the links point to the current manual. The examples were run on MongoDB 8.3.13 with mongosh 2.13.0, on a three-member replica set in Docker with 200,000 synthetic orders, so counts and timings will differ on your machine. Sharding examples were not run. MongoDB 9.0 was released in September 2026; where it changes something covered here, the topic says so.

On licensing: MongoDB Community Server versions released on or after 16 October 2018 are under the Server Side Public License (SSPL), a licence written by MongoDB Inc. and based on the GPLv3. It is not approved by the Open Source Initiative, which is why MongoDB is usually described as source-available rather than open source. Its extra copyleft condition (section 13) applies when you offer MongoDB's own functionality to third parties as a service; MongoDB's FAQ says other applications that merely use MongoDB, including SaaS products, are not subject to it. Earlier versions remain under the AGPLv3, and the official drivers are Apache 2.0. If licensing matters for your use, read the licence and its FAQ rather than a summary.
