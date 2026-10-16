---
id: aws-vpc
title: "VPC networking: subnets, routes and NAT"
summary: Your private network inside a Region
why: "Whether a database is reachable from the internet, whether a task can pull its image, and a surprising share of the bill are all decided by subnets and route tables."
requires: [aws-regions-azs]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: A VPC spans a Region, a subnet one zone
    text: "You give the VPC an address range and carve it into subnets, each in a single Availability Zone."
  - title: Routes make a subnet public or private
    text: "A subnet is public only because its route table sends 0.0.0.0/0 to an internet gateway. Nothing else about it is special."
  - title: NAT lets private subnets call out
    text: "A NAT gateway lets instances without public addresses start outbound connections. It is billed per hour and per gigabyte processed."
  - title: Endpoints keep AWS traffic private
    text: "Gateway endpoints for S3 and DynamoDB are free and take that traffic off the NAT gateway."
quiz_hint: Follow a packet. Which route table does its subnet use, and what is the next hop for its destination?
quiz:
  - q: What makes a subnet public?
    options: ["Its name", "Its route table has a route for 0.0.0.0/0 to an internet gateway", "It has a security group that allows all traffic"]
    answer: 1
    explain: "Public and private are just routing. Instances in a public subnet still need a public IP address to be reachable, and security groups still apply."
  - q: Tasks in private subnets download 5 TB a month from S3 through a NAT gateway. What is the cheapest fix?
    options: ["Move the tasks to public subnets", "Add an S3 gateway endpoint to the private route tables", "Use a bigger NAT gateway"]
    answer: 1
    explain: "Gateway endpoints for S3 and DynamoDB have no charge and route that traffic privately, so it no longer pays NAT data processing."
  - q: You have one zonal NAT gateway in zone a, used by private subnets in zones a, b and c. Zone a fails. What happens?
    options: ["Nothing; NAT gateways fail over automatically", "Instances in zones b and c lose outbound internet access, and they paid cross-zone charges to reach it before", "Only zone a loses access"]
    answer: 1
    explain: "A standard NAT gateway lives in one zone. Use one per zone with per-zone route tables, or a regional NAT gateway, which expands across zones for you."
links:
  - { title: "How Amazon VPC works (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html" }
  - { title: "Route tables (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html" }
  - { title: "NAT gateways (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html" }
  - { title: "Gateway endpoints (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html" }
---
A **VPC** (virtual private cloud) is an isolated network in one Region with an address range you choose, for example `10.20.0.0/16`. You divide it into **subnets**, each a smaller range in exactly one Availability Zone, and attach a **route table** to each subnet. Every packet leaving an instance is matched against its subnet's route table, most specific route first, and that decides where it goes next.

## A common layout

```sh
VPC 10.20.0.0/16 (eu-west-1)
  public-a   10.20.0.0/20    route 0.0.0.0/0 -> internet gateway   (load balancers, NAT)
  public-b   10.20.16.0/20   route 0.0.0.0/0 -> internet gateway
  private-a  10.20.64.0/19   route 0.0.0.0/0 -> NAT gateway        (app tasks, instances)
  private-b  10.20.96.0/19   route 0.0.0.0/0 -> NAT gateway
  data-a     10.20.160.0/21  no default route                      (databases)
  data-b     10.20.168.0/21  no default route
```

Every route table also has a `local` route for the VPC's own range, so all subnets can reach each other unless security groups or network ACLs say otherwise. "Public" means only that the route table points `0.0.0.0/0` at an **internet gateway**; an instance there also needs a public IPv4 address (or IPv6) to be reachable. A private subnet has no such route, so nothing on the internet can start a connection to it.

## NAT: outbound only, and not free

Instances in private subnets still need to call out: to download packages, pull images or call third-party APIs. A **NAT gateway** translates their private addresses to its own public one, so replies come back but nobody outside can start a connection. Two things bite:

- **Zones.** A standard (zonal) NAT gateway lives in one zone. If every private subnet routes through the one in zone a, losing zone a cuts outbound access everywhere, and traffic from the other zones also pays cross-zone transfer. Run one per zone, each with its own route table, or use a **regional NAT gateway**, which expands across the zones where you have workloads and uses a single ID in all routes.
- **Cost.** You pay for each hour the gateway exists and for every gigabyte it processes, on top of normal data transfer. A busy service pulling container images or talking to S3 through NAT can cost more in NAT processing than in compute.

## Keep AWS traffic off the NAT

**VPC endpoints** let private subnets reach AWS services without the internet. **Gateway endpoints** (only S3 and DynamoDB) are entries in your route tables and have no charge. **Interface endpoints** (PrivateLink) put a network interface for a service such as ECR, SQS or Secrets Manager in your subnets; they are billed per hour and per gigabyte, but often still cost less than NAT for heavy traffic and keep that traffic inside AWS.

## Plan addresses once

You cannot easily renumber a VPC later, and peering or Transit Gateway connections fail when ranges overlap. Pick non-overlapping ranges per VPC and environment from the start, leave room for more zones and subnets, and remember that AWS reserves five addresses in every subnet.

```trace diagram
id: two-zone-vpc
title: A VPC across two zones
subtitle: "10.20.0.0/16 in eu-west-1: public and private subnets, NAT and an S3 endpoint"
groups:
  - { id: pub-a, label: "Public subnet, zone a" }
  - { id: pub-b, label: "Public subnet, zone b" }
  - { id: priv-a, label: "Private subnet, zone a" }
  - { id: priv-b, label: "Private subnet, zone b" }
elements:
  - { id: s3ep, label: S3 gateway endpoint, sub: "a route table entry, no charge", tone: stream, row: 2 }
  - { id: s3, label: S3, kind: store, row: 3 }
  - { id: app-a, label: App task, sub: private IP only, group: priv-a, row: 0 }
  - { id: app-b, label: App task, sub: private IP only, group: priv-b, row: 0 }
  - { id: nat-a, label: NAT gateway, sub: zonal, group: pub-a, row: 1 }
  - { id: nat-b, label: NAT gateway, sub: zonal, group: pub-b, row: 1 }
  - { id: igw, label: Internet gateway, sub: one per VPC, kind: system, row: 2 }
  - { id: internet, label: Internet, kind: external, row: 3 }
edges:
  - { id: a-nat, from: app-a, to: nat-a, label: "0.0.0.0/0" }
  - { id: b-nat, from: app-b, to: nat-b, label: "0.0.0.0/0" }
  - { id: nat-a-igw, from: nat-a, to: igw }
  - { id: nat-b-igw, from: nat-b, to: igw }
  - { id: out, from: igw, to: internet }
  - { id: a-ep, from: app-a, to: s3ep }
  - { id: b-ep, from: app-b, to: s3ep }
  - { id: ep-s3, from: s3ep, to: s3 }
steps:
  - caption: "A VPC is a private network in one Region with an address range you choose. You carve it into subnets, and each subnet lives in exactly one zone."
  - caption: "A subnet is public only because its route table sends 0.0.0.0/0 to the internet gateway. Load balancers and NAT gateways go here; an instance also needs a public IP to be reachable."
    focus: [pub-a, pub-b, igw]
  - caption: "The private subnets' route tables have no route to the internet gateway, so nothing outside can start a connection to the app tasks."
    focus: [priv-a, priv-b]
  - caption: "Every route table also has a local route for the VPC's own range, so the subnets can reach each other unless security groups or network ACLs say no."
    focus: [app-a, app-b]
  - caption: "To call out, the task in zone a follows its default route to the NAT gateway, which swaps the private address for its own public one. Replies come back; new inbound connections can't."
    trace: [a-nat, nat-a-igw, out]
  - caption: "A standard NAT gateway lives in one zone, so zone b gets its own, with its own route table. If both zones used zone a's, losing zone a would cut outbound access everywhere."
    trace: [b-nat, nat-b-igw, out]
  - caption: "NAT is billed for every hour it exists and every gigabyte it processes. A regional NAT gateway is the other option: it expands across zones and uses one ID in all routes."
    focus: [nat-a, nat-b]
  - caption: "S3 traffic doesn't need NAT at all. A gateway endpoint adds an S3 route to the private route tables, free of charge, so that traffic stays inside AWS."
    trace: [a-ep, b-ep, ep-s3]
  - caption: "Other services, such as ECR, SQS or Secrets Manager, need interface endpoints instead. They are billed per hour and per gigabyte, but often cost less than NAT for heavy traffic."
    focus: [s3ep, nat-a, nat-b]
  - caption: "Plan the address ranges once. A VPC is hard to renumber, connected VPCs must not overlap, and AWS reserves five addresses in every subnet."
note: A data subnet for databases would look like the private ones, but with no default route at all.
```
