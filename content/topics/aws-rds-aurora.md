---
id: aws-rds-aurora
title: "Relational databases: RDS and Aurora"
summary: Managed SQL, and what Multi-AZ really buys you
why: "Most systems keep their most valuable data in a relational database. Knowing what failover does, how long it takes and what replicas lag behind decides how your app behaves on a bad day."
requires: [aws-vpc, aws-regions-azs]
lesson: none
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
