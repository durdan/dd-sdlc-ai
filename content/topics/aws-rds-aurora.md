---
id: aws-rds-aurora
title: "Relational databases: RDS and Aurora"
summary: Managed SQL, and what Multi-AZ really buys you
why: "Most systems keep their most valuable data in a relational database. Knowing what failover does, how long it takes and what replicas lag behind decides how your app behaves on a bad day."
requires: [aws-vpc, aws-regions-azs]
lesson: diagram
points:
  - title: RDS runs the engine for you
    text: "RDS installs, patches, backs up and monitors PostgreSQL, MySQL, MariaDB, SQL Server, Oracle or Db2 on instances you size."
  - title: Multi-AZ is for failover, not reads
    text: "A Multi-AZ DB instance keeps a synchronous standby in another zone that serves no traffic. On failure, RDS points the DNS name at it."
  - title: Aurora separates storage from compute
    text: "Aurora writes each change to six storage nodes across zones; readers share that volume, so replica lag is usually well under 100 ms."
  - title: Read replicas lag
    text: "RDS read replicas are asynchronous. A read right after a write may not see it."
quiz_hint: Ask whether each copy is synchronous or asynchronous, and whether it serves traffic.
quiz:
  - q: Can you send read traffic to the standby of an RDS Multi-AZ DB instance deployment?
    options: ["Yes, it is a read replica", "No; that standby only exists for failover. Use a read replica or a Multi-AZ DB cluster for reads", "Only during maintenance windows"]
    answer: 1
    explain: "The single-standby deployment keeps a synchronous copy that serves no traffic. A Multi-AZ DB cluster has two readable standbys; read replicas are separate, asynchronous copies."
  - q: During an RDS or Aurora failover, what must the application do?
    options: ["Nothing; open connections move to the new primary", "Reconnect through the same endpoint name, and not cache DNS for long", "Change its connection string to the standby's address"]
    answer: 1
    explain: "Failover updates the endpoint's DNS record. Existing connections break, so the app needs retries with backoff and a client that respects short DNS TTLs. RDS Proxy can hide much of this."
  - q: A user updates their profile and the next page, which reads from an RDS read replica, shows the old data. Why?
    options: ["The write failed", "Read replicas are updated asynchronously and can lag behind the primary", "Replicas only update once an hour"]
    answer: 1
    explain: "Replica lag is usually small but unbounded under load. Read your own writes from the primary, or tolerate stale reads explicitly."
links:
  - { title: "Configuring and managing a Multi-AZ deployment (Amazon RDS docs)", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html" }
  - { title: "Amazon Aurora DB clusters (Aurora docs)", url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html" }
  - { title: "Amazon RDS Proxy (Amazon RDS docs)", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html" }
---
**Amazon RDS** runs a relational database engine on instances you choose, and takes over installation, minor-version patching, automated backups with point-in-time restore, and failover. **Aurora** is AWS's MySQL- and PostgreSQL-compatible engine built on a distributed storage layer. Both give you a DNS endpoint rather than a machine; most of what goes wrong on a bad day comes down to what sits behind that name, and how quickly it can change.

## Three kinds of copy

| Option | Replication | Serves reads? | Purpose |
| --- | --- | --- | --- |
| RDS Multi-AZ DB instance | Synchronous, one standby in another zone | No | Failover |
| RDS Multi-AZ DB cluster | Semisynchronous, two standbys in two other zones | Yes | Failover and reads, lower write latency |
| RDS read replica | Asynchronous, same or another Region | Yes | Read scaling, cross-Region copies |
| Aurora replica (up to 15) | Shared storage volume | Yes | Reads and failover targets |

With **Multi-AZ**, a write is not acknowledged until the standby has it, so a failover loses no committed data. On instance failure, a zone problem or some maintenance, RDS promotes the standby and updates the endpoint's DNS record. AWS quotes failover times of typically 60 to 120 seconds for a DB instance deployment (longer with large transactions to recover); DB clusters and Aurora are faster.

**Aurora** synchronously writes every change to six storage nodes spread across the Region's zones. Replicas read the same volume, so their lag is usually well under 100 milliseconds, and any replica can be promoted to writer; AWS says service is typically restored in under 60 seconds, often under 30. The storage volume grows automatically; you pay for storage used and I/O (or choose the I/O-Optimized configuration for I/O-heavy workloads). Aurora Serverless v2 scales capacity in small increments for variable load.

## Making failover survivable

```sh
orders.cluster-abc123.eu-west-1.rds.amazonaws.com      # writer endpoint
orders.cluster-ro-abc123.eu-west-1.rds.amazonaws.com   # reader endpoint
```

- Always connect through the **endpoint names**, never instance IPs, and do not cache DNS for longer than its TTL (some runtimes, such as older JVM settings, cache forever).
- **Retry** failed connections and idempotent queries with backoff. Transactions in flight at failover are rolled back.
- **RDS Proxy** pools connections, keeps client connections open during failover, and protects the database from connection storms from Lambda or autoscaling fleets.
- Test it: trigger a failover in staging (reboot with failover) and watch what your app does.

## Other common failures

- **Running out of connections** when many small clients each open a pool. Every PostgreSQL connection costs memory; size `max_connections` and pools together, or use a proxy.
- **Storage full**: enable storage autoscaling on RDS, and alarm on free storage.
- **Major-version upgrades** are not automatic and need testing; blue/green deployments let you switch to an upgraded copy with a short cutover.
- **Public accessibility**: keep databases in private subnets with security groups that admit only the app tier.
- **Backups you have never restored**: automated backups and snapshots are only useful if a restore has been rehearsed and timed.

Cross-Region disaster recovery uses cross-Region read replicas, or Aurora Global Database, which replicates the storage volume to other Regions asynchronously.

```trace diagram
id: rds-multi-az
title: RDS Multi-AZ and a read replica
subtitle: Who has the data, and what failover changes
groups:
  - { id: aza, label: Zone a }
  - { id: azb, label: Zone b }
elements:
  - { id: app, label: App, row: 0 }
  - { id: endpoint, label: Endpoint, sub: "orders.xxxx.rds.amazonaws.com", kind: component, row: 1, role: edge }
  - { id: primary, label: Primary, sub: reads and writes, kind: store, group: aza, row: 2 }
  - { id: standby, label: Standby, sub: serves no traffic, kind: store, tone: neutral, group: azb, row: 2 }
  - { id: replica, label: Read replica, sub: its own endpoint, kind: store, tone: data, row: 3 }
edges:
  - { id: connect, from: app, to: endpoint }
  - { id: route, from: endpoint, to: primary, label: DNS }
  - { id: sync, from: primary, to: standby, label: synchronous }
  - { id: async, from: primary, to: replica, label: asynchronous, style: dashed, flow: async }
  - { id: reads, from: app, to: replica, label: reads, style: dotted, flow: main }
  - { id: flip, from: endpoint, to: standby, label: after failover, style: dashed, flow: main }
steps:
  - caption: "This is an RDS Multi-AZ DB instance with one read replica. The app knows only names, never machines."
  - caption: "The app connects to the endpoint name, and DNS resolves it to the primary. All writes, and any reads that must be current, go there."
    trace: [connect, route]
  - caption: "Each write is copied to the standby in another zone before it is acknowledged, so a failover loses no committed data. The standby is only for failover and serves no reads."
    trace: [sync]
  - caption: "A read replica gets changes asynchronously and has its own endpoint. It takes read load off the primary, but a read right after a write may not see it yet."
    trace: [async, reads]
  - caption: "When the primary's instance or its zone fails, RDS promotes the standby. Open connections break, and transactions that were in flight roll back."
    focus: [primary, standby]
  - caption: "RDS then points the endpoint's DNS record at the new primary, typically within 60 to 120 seconds. Apps that retry with backoff and don't cache DNS reconnect by themselves."
    trace: [flip]
```

```trace diagram
id: aurora-cluster
title: An Aurora cluster
subtitle: Instances on top of one shared volume
elements:
  - { id: app, label: App, row: 0 }
  - { id: wep, label: Cluster endpoint, sub: always the writer, kind: component, row: 1, role: edge }
  - { id: rep, label: Reader endpoint, sub: spreads over replicas, kind: component, row: 1, role: edge }
  - { id: writer, label: Writer, sub: one instance, row: 2 }
  - { id: r1, label: Replica 1, sub: read-only, row: 2, role: service }
  - { id: r2, label: Replica 2, sub: read-only, row: 2, role: service }
  - { id: volume, label: Shared storage volume, sub: "6 copies across the Region's zones", kind: store, row: 3 }
edges:
  - { id: w-ep, from: app, to: wep, label: writes }
  - { id: r-ep, from: app, to: rep, label: reads }
  - { id: w-route, from: wep, to: writer }
  - { id: r-r1, from: rep, to: r1 }
  - { id: r-r2, from: rep, to: r2 }
  - { id: write, from: writer, to: volume, flow: data }
  - { id: read1, from: r1, to: volume, style: dotted, flow: data }
  - { id: read2, from: r2, to: volume, style: dotted, flow: data }
  - { id: flip, from: wep, to: r1, label: on failover, style: dashed, flow: main }
steps:
  - caption: "Aurora separates compute from storage. The writer and the replicas are instances, and the data lives in one shared volume underneath them."
  - caption: "Writes go through the cluster endpoint to the single writer. The writer sends every change to six storage nodes spread across the Region's zones."
    trace: [w-ep, w-route, write]
  - caption: "Reads can use the reader endpoint, which spreads connections over the replicas, up to 15 of them. They read the same volume, so replica lag is usually well under 100 ms."
    trace: [r-ep, r-r1, r-r2, read1, read2]
  - caption: "If the writer fails, Aurora promotes a replica. No data has to be copied because the storage is shared, so service is typically back in under 60 seconds."
    focus: [writer, r1, volume]
  - caption: "The cluster endpoint now points at the promoted replica. The app keeps using the same name, and RDS Proxy can keep client connections open through the switch."
    trace: [flip]
```
