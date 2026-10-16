---
id: aws-cost
title: "Cost basics: where the bill comes from"
summary: Data transfer, NAT and the things nobody turned off
why: "AWS bills are rarely dominated by the instance prices people compare. Data transfer, NAT processing, idle resources and logs are where surprises come from, and they are architecture decisions."
requires: [aws-vpc, aws-s3]
lesson: diagram
points:
  - title: Moving data costs money
    text: "Inbound from the internet is free; outbound to the internet, between Regions and between Availability Zones is billed per GB."
  - title: NAT gateways charge twice
    text: "Each NAT gateway is billed per hour and per GB it processes, on top of normal transfer. Heavy traffic through NAT adds up fast."
  - title: Idle is not free
    text: "Unattached EBS volumes, old snapshots, idle load balancers, unused public IPv4 addresses and forgotten test stacks all bill by the hour or month."
  - title: Make cost visible
    text: "Tag resources by team and service, turn on budgets with alerts, and look at Cost Explorer by usage type, not just by service."
quiz_hint: For each line on the bill, ask whether it scales with traffic, with time, or with forgetting.
quiz:
  - q: Two services in the same Region talk heavily to each other, one in zone a and one in zone b. Which charge appears?
    options: ["None; traffic inside a Region is free", "Data transfer between Availability Zones, billed on both sides", "Internet egress"]
    answer: 1
    explain: "Cross-zone traffic is billed per GB in each direction. Keep chatty pairs in the same zone where availability allows, and watch cross-zone load balancing settings."
  - q: Private ECS tasks pull large images from ECR and read from S3 through a NAT gateway. What cuts the cost most?
    options: ["A bigger NAT gateway", "An S3 gateway endpoint (free) and interface endpoints for ECR", "Moving the S3 bucket to another Region"]
    answer: 1
    explain: "Endpoints take that traffic off the NAT gateway's per-GB processing. ECR image layers are stored in S3, so the S3 gateway endpoint helps image pulls too."
  - q: Which of these is billed even when nothing uses it?
    options: ["An S3 bucket with no objects", "A public IPv4 address, including an Elastic IP that is not attached", "An IAM role"]
    answer: 1
    explain: "AWS charges for every public IPv4 address, attached or not. IAM is free, and an empty bucket stores nothing to bill."
links:
  - { title: "Understanding data transfer charges (AWS docs)", url: "https://docs.aws.amazon.com/cur/latest/userguide/cur-data-transfers-charges.html" }
  - { title: "Pricing for NAT gateways (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html" }
  - { title: "Managing your costs with AWS Budgets (AWS docs)", url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html" }
  - { title: "Cost optimization pillar (AWS Well-Architected)", url: "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html" }
---
On AWS you pay for what you provision and for what you move. Instance and database prices are easy to compare, so teams compare them, but the surprises on a bill usually come from elsewhere: **data transfer**, **NAT gateway processing**, **resources left running**, and **telemetry** nobody set limits on. Most of these are decided when you draw the architecture, not when you pick instance sizes.

## Data transfer

| Traffic | Billed? |
| --- | --- |
| From the internet into AWS | No |
| From AWS out to the internet | Yes, per GB (a monthly free allowance applies) |
| Between Availability Zones in a Region | Yes, per GB in each direction |
| Between Regions | Yes, per GB |
| Within one zone over private IPs | Generally no |
| To S3 or DynamoDB through a gateway endpoint | No endpoint charge |

Consequences: a multi-zone design pays for its replication and cross-zone calls (usually worth it, but measure it); serving large downloads straight from S3 or EC2 to the internet costs more than through CloudFront in many cases; and moving data between Regions for analytics can cost more than the analytics.

## NAT gateways

A NAT gateway is billed for each hour it exists and **each gigabyte it processes**, and the traffic then pays normal transfer too. Typical offenders: pulling container images, calling S3 or DynamoDB without endpoints, and sending logs or metrics to AWS APIs from private subnets. Fixes are gateway endpoints for S3 and DynamoDB (free), interface endpoints for heavily used services, image caching, and checking the NAT gateway's `BytesOutToDestination` metric to see who is talking.

## Things that bill while idle

- **Public IPv4 addresses**: AWS charges per hour for every public IPv4 address, whether attached to an instance, a load balancer, a NAT gateway or sitting unused as an Elastic IP.
- **EBS volumes and snapshots** left behind after instances are terminated, and snapshots kept forever.
- **Load balancers, NAT gateways and interface endpoints** in environments nobody uses.
- **Over-provisioned capacity**: instances at 5 % CPU, provisioned DynamoDB tables or RDS instances sized for a launch that never came.
- **CloudWatch Logs** with no retention, and high-cardinality custom metrics.
- **S3 incomplete multipart uploads** and old object versions without lifecycle rules.

## Making cost an engineering signal

1. **Tag** everything with owner, service and environment, and activate those tags as cost allocation tags.
2. Create **AWS Budgets** with alerts at, say, 80 % and 100 % of the expected monthly spend, per account or per tag. Turn on Cost Anomaly Detection.
3. Read **Cost Explorer** grouped by **usage type**: `DataTransfer-Regional-Bytes`, `NatGateway-Bytes` and `PublicIPv4` lines tell you more than "EC2-Other".
4. Commit to steady baselines with **Savings Plans**, use **Spot** for interruptible work, and pick Graviton (Arm) instances where your software supports it.
5. Delete what is idle, and give test environments a schedule or an expiry date. Infrastructure as code makes that safe: what was created by a pipeline can be destroyed by one.

```trace diagram
id: where-the-bill-comes-from
title: Where the bill comes from
subtitle: Hours, requests, storage and moving bytes
groups:
  - { id: vpc, label: "VPC, two zones" }
elements:
  - { id: internet, label: Internet users, kind: person, row: 0 }
  - { id: lb, label: Load balancer, sub: per hour + usage, group: vpc, row: 1 }
  - { id: egress, label: Responses out, sub: per GB, kind: external, row: 2 }
  - { id: svc-a, label: Service, sub: "zone a, per hour", group: vpc, row: 2 }
  - { id: svc-b, label: Service, sub: "zone b, per hour", group: vpc, row: 3 }
  - { id: nat, label: NAT gateway, sub: per hour + per GB, tone: stream, group: vpc, row: 4 }
  - { id: endpoint, label: S3 endpoint, sub: free, kind: component, group: vpc, row: 4 }
  - { id: apis, label: "Images, AWS APIs", kind: external, row: 5 }
  - { id: s3, label: S3, sub: "GB-month + requests", kind: store, row: 5 }
  - { id: logs, label: CloudWatch Logs, sub: ingest + storage, kind: store, row: 5 }
  - { id: idle, label: Forgotten things, sub: "IPv4, EBS, old stacks", kind: component, tone: neutral, row: 5 }
edges:
  - { id: in, from: internet, to: lb, label: in is free }
  - { id: out, from: lb, to: egress }
  - { id: to-a, from: lb, to: svc-a }
  - { id: cross, from: svc-a, to: svc-b, label: "cross-AZ, per GB" }
  - { id: via-nat, from: svc-b, to: nat }
  - { id: pulls, from: nat, to: apis }
  - { id: to-ep, from: svc-b, to: endpoint }
  - { id: ep-s3, from: endpoint, to: s3 }
  - { id: ship-logs, from: svc-b, to: logs, style: dotted }
steps:
  - caption: "A typical service, and what each part of it bills for. The surprises are rarely the instance prices that people compare."
  - caption: "Compute bills by the hour whether it is busy or not: instances, load balancers and NAT gateways. Right-size, cover the steady baseline with Savings Plans, and use Spot for interruptible work."
    focus: [lb, svc-a, svc-b, nat]
  - caption: "Data coming in from the internet is free, but data going out is billed per GB. For large downloads, serving through CloudFront is often cheaper."
    trace: [in, out]
  - caption: "Two services in different zones pay per GB in each direction. Multi-AZ is usually worth it, but keep chatty pairs in one zone where you can, and measure it."
    trace: [to-a, cross]
  - caption: "Traffic from private subnets through a NAT gateway pays per GB processed, on top of normal transfer. Container image pulls and calls to AWS APIs are the usual offenders."
    trace: [via-nat, pulls]
  - caption: "A gateway endpoint for S3 or DynamoDB takes that traffic off the NAT gateway for free. Interface endpoints help for other heavily used services."
    trace: [to-ep, ep-s3]
  - caption: "S3 bills per GB-month and per request. Lifecycle rules, and cleaning up old versions and incomplete multipart uploads, are where storage savings come from."
    focus: [s3]
  - caption: "CloudWatch Logs bills for ingestion and storage, and keeps logs forever unless you set retention. High-cardinality custom metrics add up too."
    trace: [ship-logs]
  - caption: "Some things bill with no traffic at all: every public IPv4 address, unattached EBS volumes, old snapshots and test stacks nobody deleted."
    focus: [idle]
  - caption: "Make cost visible. Tag resources by owner and service, set AWS Budgets alerts, and read Cost Explorer by usage type, such as NatGateway-Bytes."
```
