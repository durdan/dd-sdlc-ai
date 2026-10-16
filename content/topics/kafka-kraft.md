---
id: kafka-kraft
title: "KRaft: metadata without ZooKeeper"
summary: Controllers keep cluster metadata in a Raft log
why: "Every Kafka 4.x cluster runs KRaft; ZooKeeper support is gone. Knowing what the controllers do explains how leaders are elected, what a quorum loss does, and why upgrading an old cluster takes a migration first."
requires: [kafka-replication]
lesson: none
points:
  - title: Controllers own the metadata
    text: "Topics, partitions, leaders, ISRs, configs and ACLs live in a metadata log, __cluster_metadata, replicated among controllers with the Raft-based KRaft protocol."
  - title: A majority of controllers must be up
    text: "Run 3 controllers to tolerate one failure, or 5 to tolerate two. Without a majority, no metadata can change, including leader elections."
  - title: Brokers follow the log
    text: "Brokers fetch the metadata log and apply it, so each has a current local copy instead of asking a separate system."
  - title: ZooKeeper was removed in 4.0
    text: "Kafka 4.0 (March 2025) supports only KRaft. ZooKeeper clusters must migrate to KRaft on 3.x (3.9 is the last 3.x release) before upgrading."
quiz_hint: Separate data from metadata. Which one does a controller majority protect?
quiz:
  - q: A cluster has 3 dedicated controllers. Two of them fail. What still works?
    options:
      - Everything; brokers do not need controllers
      - "Brokers keep serving partitions whose leaders are healthy, but no metadata can change: no new topics, no leader elections when a broker fails"
      - Nothing; all brokers stop
    answer: 1
    explain: "The quorum needs a majority to commit metadata records. Existing leaders continue, but the cluster cannot react to further failures until a majority of controllers is back."
  - q: Why can't you upgrade a ZooKeeper-based 3.6 cluster straight to Kafka 4.0?
    options:
      - 4.0 needs new hardware
      - "4.0 has no ZooKeeper mode, so the cluster must first be migrated to KRaft using a 3.x release that supports migration, such as 3.9, the last 3.x release"
      - ZooKeeper data is converted automatically on startup
    answer: 1
    explain: "The upgrade notes say ZooKeeper clusters have to be migrated to KRaft before they can be upgraded to 4.x; the migration tooling is documented in the 3.x releases."
  - q: "What is a combined server (process.roles=broker,controller)?"
    options:
      - A server that is both a broker and a controller; simple for development, less isolated in production
      - A server running ZooKeeper and Kafka together
      - A load balancer
    answer: 0
    explain: "The docs recommend combined mode for small or development clusters. In production, dedicated controllers keep broker load and failures away from the metadata quorum."
links:
  - { title: "KRaft operations (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/operations/kraft/" }
  - { title: "KRaft vs ZooKeeper (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/zk2kraft/" }
  - { title: "Upgrade notes (Apache Kafka 4.3 docs)", url: "https://kafka.apache.org/43/getting-started/upgrade/" }
---
A Kafka cluster has two kinds of state: the records in partitions, and the metadata about them (which topics exist, where each partition's replicas are, who leads, who is in sync, configuration and ACLs). For most of Kafka's history the metadata lived in ZooKeeper, a separate system to deploy and secure. KRaft moves it into Kafka: a small set of controller nodes replicate a metadata log among themselves with a Raft-style consensus protocol, and brokers follow that log. KRaft became production-ready in 3.3, and Kafka 4.0 removed ZooKeeper mode entirely.

## Roles

```properties
# a dedicated controller
process.roles=controller
node.id=1
listeners=CONTROLLER://controller1.example.com:9093
controller.listener.names=CONTROLLER
controller.quorum.bootstrap.servers=controller1.example.com:9093,controller2.example.com:9093,controller3.example.com:9093
```

`process.roles` can be `broker`, `controller`, or `broker,controller` (combined). Combined servers are convenient for development and small clusters; the documentation's caution is that a controller sharing a machine with a broker is less isolated from broker load. Every node is formatted once with a cluster id (`kafka-storage.sh random-uuid`, then `kafka-storage.sh format`); Kafka no longer formats storage automatically.

## The quorum

On the three-node test cluster (combined mode):

```sh
bin/kafka-metadata-quorum.sh --bootstrap-server kafka1:9092 describe --status
```

```text
ClusterId:              anD7Csf_SH-oHi5O2uMR7w
LeaderId:               1
LeaderEpoch:            1
HighWatermark:          42
MaxFollowerLag:         0
MaxFollowerLagTimeMs:   0
CurrentVoters:          [{"id": 1, ...}, {"id": 2, ...}, {"id": 3, ...}]
```

One controller is the active leader of the metadata log; the others are hot standbys with the log already applied, so failover is quick. A majority of voters must be alive: 3 controllers tolerate one failure, 5 tolerate two. Lose the majority and existing partition leaders keep serving, but nothing in the metadata can change, which includes electing new partition leaders when a broker fails.

The features command shows what the cluster has switched on. On 4.1.0:

```text
Feature: eligible.leader.replicas.version  ... FinalizedVersionLevel: 1
Feature: group.version                     ... FinalizedVersionLevel: 1
Feature: kraft.version                     ... FinalizedVersionLevel: 0
Feature: metadata.version                  ... FinalizedVersionLevel: 4.1-IV1
Feature: share.version                     ... FinalizedVersionLevel: 0
Feature: transaction.version               ... FinalizedVersionLevel: 2
```

`group.version 1` enables the new consumer protocol on the broker, `transaction.version 2` the strengthened transaction protocol, and `kraft.version 0` means a static controller set; Kafka 4.1 added an upgrade to dynamic controller membership, so controllers can be added and removed.

## Upgrading from ZooKeeper

A ZooKeeper-mode cluster cannot be upgraded straight to 4.x. It must first be migrated to KRaft on a 3.x release that supports migration (3.9, the last 3.x release, is the usual choice), with the controllers copying the metadata from ZooKeeper and the brokers then restarted in KRaft mode. Some configurations and metrics that only existed for ZooKeeper are gone. Java requirements also changed in 4.0: brokers need Java 17, clients Java 11.
