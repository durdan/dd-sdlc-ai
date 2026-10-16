---
id: aws-ebs-efs
title: "Block and file storage: EBS and EFS"
summary: Disks for one instance versus a shared file system
why: "Databases, build caches and shared uploads need a file system, not an object store. Choosing a disk that lives in one zone or a file system that spans several decides what survives a zone failure."
requires: [aws-compute]
lesson: none
points:
  - title: EBS is a network disk in one zone
    text: "An EBS volume attaches to an instance in the same Availability Zone and behaves like a local block device."
  - title: Snapshots are your way out
    text: "EBS snapshots are incremental copies stored regionally. They are how you back up, copy volumes across zones and Regions, and recover."
  - title: EFS is shared NFS
    text: "EFS is an elastic NFSv4 file system that many instances, containers and functions mount at once, across zones."
  - title: Pick by access pattern
    text: "One writer needing low latency: EBS. Many readers and writers sharing files: EFS. Whole objects over HTTP: S3."
quiz_hint: Ask how many machines need the data at once, and which zone it lives in.
quiz:
  - q: An EC2 instance in zone a fails and the Auto Scaling group launches a replacement in zone b. Can it attach the old EBS volume?
    options: ["Yes, EBS volumes attach anywhere in the Region", "No; EBS volumes are zonal. Restore a snapshot into zone b, or keep state off the instance", "Yes, but only read-only"]
    answer: 1
    explain: "A volume can only attach to instances in its own zone. Snapshots are the bridge to another zone or Region."
  - q: Ten ECS tasks across three zones need to read and write the same directory of uploaded files. Which fits?
    options: ["One EBS volume attached to all tasks", "An EFS file system mounted by every task", "Instance store volumes"]
    answer: 1
    explain: "EFS is built for concurrent access from many clients in many zones. Regional EFS file systems store data redundantly across zones."
  - q: What happens to data on an instance store volume when the instance is stopped?
    options: ["It is kept until the instance starts again", "It is lost; instance store is temporary storage tied to the host", "It is copied to EBS automatically"]
    answer: 1
    explain: "Instance store disks are physically attached to the host. They are fast but vanish on stop, hibernation or host failure; use them for caches and scratch space."
links:
  - { title: "What is Amazon EBS? (AWS docs)", url: "https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html" }
  - { title: "What is Amazon EFS? (AWS docs)", url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html" }
  - { title: "Understanding and managing Amazon S3 storage classes (AWS docs)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html" }
---
Not everything fits in an object store. A database wants a block device it can `fsync`; a legacy app wants a directory it can share. AWS has three answers. **EBS** (Elastic Block Store) gives an instance a network-attached disk in one zone. **EFS** (Elastic File System) gives many machines a shared NFS file system that spans zones. **Instance store** is fast local disk on the physical host that disappears with the instance.

## EBS: a disk with a zone

An EBS volume is created in one Availability Zone, replicated across several servers inside it, and attached to instances in that zone (one at a time, except io1 and io2 multi-attach for clustered software). Volume types trade cost for performance:

| Type | Notes |
| --- | --- |
| gp3 | General purpose SSD; baseline IOPS and throughput you can raise independently of size. The default choice. |
| io2 Block Express | Provisioned IOPS for demanding databases, higher durability |
| st1, sc1 | Throughput-oriented and cold HDD for large sequential workloads |

Because a volume lives in one zone, so does whatever depends on it. If that zone fails, the volume is unavailable until it recovers. **Snapshots** are the escape hatch: incremental, point-in-time copies stored at Region level, which you can restore into any zone, copy to another Region or account, and schedule with Data Lifecycle Manager or AWS Backup. A snapshot of a running database is crash-consistent at best; use the database's own backup or flush before snapshotting.

Encrypt volumes (you can make encryption the default per Region in account settings), and watch the throughput limits of both the volume and the instance type, since either can be the bottleneck.

## EFS: shared and elastic

EFS speaks NFSv4.1 and grows and shrinks as you add files, so there is nothing to size. Many EC2 instances, ECS and EKS tasks, and Lambda functions can mount it at once. **Regional** file systems (the recommended kind) store data redundantly across several zones, with a mount target in each zone; **One Zone** file systems are cheaper and live in one zone. Throughput modes include Elastic, which scales with demand and bills per use.

The costs of sharing: every operation is a network round trip, so workloads with many small files and metadata calls (such as `npm install` or a Git checkout) are much slower than on a local disk, and NFS locking semantics are weaker than a local file system's. Lifecycle management can move cold files to cheaper Infrequent Access and Archive classes.

## Choosing

- **Single writer, low latency, a database or a boot disk**: EBS.
- **Many clients sharing files across zones**: EFS.
- **Whole objects, HTTP access, unlimited scale, cheapest per GB**: S3.
- **Scratch space and caches that may vanish**: instance store.

Whatever you choose, the safest design keeps durable state in a managed service (S3, RDS, DynamoDB) and treats instances and their disks as replaceable.
