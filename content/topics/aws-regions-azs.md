---
id: aws-regions-azs
title: Regions and Availability Zones
summary: Where your resources physically live
why: "Every AWS resource lives in a Region, and most live in a single zone inside it. Knowing which is which tells you what a data centre failure will take down."
lesson: none
points:
  - title: A Region is a separate world
    text: "Each Region is an independent set of data centres with its own copy of most services. Resources, quotas and prices are per Region."
  - title: A zone is a failure boundary
    text: "An Availability Zone is one or more data centres with their own power and networking, far enough from the others to fail alone."
  - title: Know each service's scope
    text: "An EC2 instance or EBS volume is zonal, S3 and DynamoDB are regional, IAM is global. The scope decides what one zone failing breaks."
  - title: Spread across zones by default
    text: "Running in at least two zones (three is better) is the cheapest big step up in availability AWS offers."
quiz_hint: For each resource, ask which failure boundary it lives inside.
quiz:
  - q: You run one EC2 instance with an EBS volume in eu-west-1a. The zone has a power event. What survives?
    options: ["Everything; AWS moves the instance to eu-west-1b", "Nothing in that zone is reachable until it recovers; EBS snapshots in S3 are still available", "Only the instance; EBS is regional"]
    answer: 1
    explain: "Instances and EBS volumes are zonal. Snapshots are stored regionally, so you can restore elsewhere, but nothing moves by itself."
  - q: Why can services replicate synchronously between zones but usually not between Regions?
    options: ["Zones in a Region are close enough for single-digit millisecond latency; Regions are often far apart", "AWS forbids traffic between Regions", "Regions use different IP protocols"]
    answer: 0
    explain: "Zones are meaningfully distant from each other (up to about 100 km) but close enough for synchronous replication. Between Regions, round trips are usually tens of milliseconds or more, so replication is asynchronous."
  - q: Two accounts both run in us-east-1a. Are they guaranteed to be in the same physical zone?
    options: ["Yes, zone names are global", "No; in the oldest Regions, accounts created before November 2025 have their own name mapping, so compare zone IDs such as use1-az1", "Only for accounts in the same organization"]
    answer: 1
    explain: "AWS used to map zone names to physical zones independently per account in its oldest Regions. Zone IDs are the same in every account, so use them when you coordinate placement."
links:
  - { title: "AWS Regions (AWS docs)", url: "https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html" }
  - { title: "Availability Zones: AWS Fault Isolation Boundaries (AWS whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html" }
  - { title: "AWS Fault Isolation Boundaries (AWS whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/abstract-and-introduction.html" }
  - { title: "Availability Zones and zone IDs (AWS docs)", url: "https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-availability-zones.html" }
---
AWS is not one big computer. It is a set of **Regions** (such as `eu-west-1` in Ireland), each a separate group of data centres, and inside each Region a few **Availability Zones** (AZs). A zone is one or more data centres with independent power, cooling and network links, placed far enough from the other zones in the Region that a fire, flood or power failure should hit only one of them. Almost every design decision about availability on AWS comes down to which of these boundaries a resource sits inside.

## Three kinds of scope

| Scope | Examples | What a single failure takes down |
| --- | --- | --- |
| Zonal | EC2 instances, EBS volumes, a subnet, a zonal NAT gateway | Everything in that zone |
| Regional | S3, DynamoDB, SQS, Lambda, an ALB spread over several zones | Rarely anything; the service is built across zones |
| Global | IAM, Route 53, CloudFront | Designed with a separate control plane and data plane |

A regional service such as S3 already spreads your data across zones for you. A zonal resource does not: if you run one instance, you run it in one zone, and it shares that zone's fate. That is why the default advice is to run every tier in at least two zones, and three where the service supports it, so that losing a zone means losing a third of your capacity rather than all of it.

## Data planes and control planes

AWS separates the **control plane** (the APIs that create, change and delete resources) from the **data plane** (the resources doing their job: an instance serving requests, a queue delivering messages). Data planes are simpler and are designed to keep working when control planes struggle. The practical lesson, which the AWS fault-isolation whitepaper calls *static stability*, is to avoid recovery plans that depend on calling a control plane during an outage. If you need three zones' worth of capacity to survive one zone failing, provision it in advance rather than counting on launching new instances in the middle of the event, when everyone else is trying to do the same.

## Choosing a Region

Pick a Region for the latency to your users, the data residency rules you are under, which services and instance types are offered there (newer services arrive in some Regions first), and price, which differs between Regions. Quotas are per Region too, so a second Region needs its own limit increases. Most Regions have three or more zones; a few older ones offer fewer to new accounts.

## Zone names are not always zone IDs

In AWS's oldest Regions, accounts created before November 2025 have their own mapping of zone names to physical zones, so `us-east-1a` in one account may be a different building from `us-east-1a` in another. Newer accounts get the same mapping. The **zone ID** (`use1-az1`) is the same everywhere. Use zone IDs when two accounts need to agree on placement, for example to keep cross-zone traffic (which is billed) to a minimum.
