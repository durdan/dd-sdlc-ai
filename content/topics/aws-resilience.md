---
id: aws-resilience
title: "Resilience: multi-AZ, multi-Region and Well-Architected"
summary: Deciding which failures you survive, and paying for it
why: "Availability is a design choice with a price. Multi-AZ covers the common failures cheaply; multi-Region covers rare ones at a high cost. Knowing which you need, and testing it, is the job."
requires: [aws-regions-azs, aws-load-balancing, aws-rds-aurora]
lesson: none
points:
  - title: Multi-AZ is the baseline
    text: "Spread every tier over at least two zones (three is better) with load balancers, Auto Scaling and Multi-AZ databases. It handles most real failures."
  - title: Multi-Region is a business decision
    text: "Surviving a Regional outage means duplicating data and infrastructure, and choosing a disaster recovery strategy from backup-and-restore to active/active."
  - title: Static stability
    text: "Provision enough capacity in advance to lose a zone, so recovery does not depend on launching resources during the event."
  - title: Test it
    text: "Failovers you have never rehearsed do not work. Game days and fault injection turn assumptions into evidence."
quiz_hint: Start from the recovery time and data loss the business can accept, then pick the cheapest design that meets them.
quiz:
  - q: An app runs in three zones with 3 instances per zone at 60 % CPU. A zone fails. Is it statically stable?
    options: ["Yes, two zones remain", "No; the remaining 6 instances would need to absorb 90 % CPU each, so it depends on scaling out during the failure", "It does not matter, Auto Scaling is instant"]
    answer: 1
    explain: "Nine instances at 60 % is 540 % of one instance's capacity; spread over six that is 90 % each. Over-provision so losing a zone stays under a safe load, or accept a dependency on scaling during the event."
  - q: Which disaster recovery strategy has the lowest cost and the longest recovery time?
    options: ["Multi-site active/active", "Warm standby", "Backup and restore"]
    answer: 2
    explain: "AWS describes four strategies: backup and restore, pilot light, warm standby and multi-site active/active, in increasing order of cost and decreasing recovery time."
  - q: What are RTO and RPO?
    options: ["Recovery time objective (how long you may be down) and recovery point objective (how much data you may lose)", "Two AWS services for backups", "Response time objective and request per operation"]
    answer: 0
    explain: "They are the two numbers to agree with the business before choosing a design. An RPO of zero needs synchronous replication; an RTO of minutes needs running standby capacity."
links:
  - { title: "AWS Well-Architected Framework (AWS)", url: "https://aws.amazon.com/architecture/well-architected/" }
  - { title: "Reliability pillar (AWS Well-Architected)", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html" }
  - { title: "Disaster recovery options in the cloud (AWS whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html" }
  - { title: "Use fault isolation to protect your workload (AWS Well-Architected)", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/use-fault-isolation-to-protect-your-workload.html" }
---
Every building block in this path has a failure boundary: an instance, a zone, a Region, a quota, a dependency. **Resilience** is choosing which of those failures your system must survive, designing for them, and proving that the design works. AWS's **Well-Architected Framework** collects the guidance in six pillars (operational excellence, security, reliability, performance efficiency, cost optimisation and sustainability); the reliability pillar is the one this topic draws on.

## Start from two numbers

- **RTO** (recovery time objective): how long the service may be unavailable.
- **RPO** (recovery point objective): how much recently written data may be lost.

A shop that can be down for a day and lose an hour of orders needs a very different design from a payment system with an RTO of minutes and an RPO of zero. Agree these first; they decide everything else.

## Multi-AZ: the default

Spreading across zones within one Region handles instance failures, data centre problems and most zone-wide events, for modest cost and little complexity:

- Load balancer across at least two zones, targets in every one of them.
- Auto Scaling groups or ECS and EKS services spread across the same zones.
- RDS or Aurora with Multi-AZ, DynamoDB and S3 (already multi-zone).
- One NAT gateway per zone (or a regional NAT gateway), so a zone failure does not cut outbound access everywhere.

**Static stability** is what makes this hold up: run enough capacity that losing a zone still leaves the rest below their limits, so you do not depend on launching instances or changing configuration while the failure is happening.

## Multi-Region: when the business needs it

A Regional outage is rare but real. Surviving it requires data in a second Region (cross-Region replicas, Aurora Global Database, DynamoDB global tables, S3 replication), infrastructure ready there, and a way to move traffic (Route 53 health checks and failover records, or Application Recovery Controller). AWS describes four disaster recovery strategies:

| Strategy | Second Region holds | Recovery time |
| --- | --- | --- |
| Backup and restore | Backups only | Hours |
| Pilot light | Replicated data, core infrastructure switched off | Tens of minutes |
| Warm standby | A scaled-down working copy | Minutes |
| Multi-site active/active | Full capacity serving traffic | Near zero |

Cost and complexity rise down the table. Active/active also forces you to deal with writes in two places: conflicts, ordering and data that must live in one jurisdiction.

## Limit the blast radius

Not every outage is infrastructure. A bad deploy, a configuration push or a runaway client can take down every zone at once. Defences: deploy gradually (one zone or cell at a time, with automatic rollback on alarms), use separate accounts per environment, set timeouts and retries with backoff on every call, protect dependencies with circuit breakers and load shedding, and keep quotas well above normal peaks.

## Prove it

Rehearse: fail over the database in staging, block a zone's subnets, kill instances. AWS Fault Injection Service runs such experiments in a controlled way, including simulated zone power interruptions. A recovery plan that has never been run is a hope, not a plan.
