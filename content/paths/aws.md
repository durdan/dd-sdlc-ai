---
id: aws
title: "AWS fundamentals: the building blocks and how they fail"
promise: "The handful of AWS building blocks most systems are made of (Regions and zones, IAM, VPC networking, compute, storage, databases, load balancers, queues and events, monitoring), what each one promises, what it costs, and the specific ways each one fails when you lean on it."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: Ground rules
    blurb: Where things run, who may touch them
    topics: [aws-regions-azs, aws-shared-responsibility, aws-iam, aws-iam-evaluation]
  - title: The network
    blurb: VPCs, firewalls, load balancers
    topics: [aws-vpc, aws-security-groups, aws-load-balancing]
  - title: Compute
    blurb: Servers, containers, functions
    topics: [aws-compute, aws-lambda]
  - title: Storage and databases
    blurb: Objects, disks, SQL, key-value
    topics: [aws-s3, aws-ebs-efs, aws-rds-aurora, aws-dynamodb]
  - title: Messaging
    blurb: Queues, topics, event buses
    topics: [aws-sqs, aws-sns-eventbridge]
  - title: Running it
    blurb: Signals, bills, surviving failure
    topics: [aws-observability, aws-cost, aws-resilience]
bridges:
  - id: competing-consumers
    why: "Several workers polling one SQS queue is this pattern. It explains how to scale consumers, and why each message may still be handled twice."
  - id: idempotency
    why: "SQS standard queues, SNS, EventBridge and Lambda retries all deliver at least once. Idempotent handlers are what make that safe."
  - id: retry
    why: "SDKs, Lambda event sources and EventBridge all retry for you. This is how to retry without turning one failure into a storm."
  - id: pub-sub
    why: "SNS topics and EventBridge rules are managed publish/subscribe. The pattern covers fan-out, filtering and what subscribers must not assume."
  - id: cell-based-architecture
    why: "AWS builds its own services as independent cells per zone and Region. The pattern shows how to apply the same blast-radius thinking to your system."
  - id: graceful-degradation
    why: "When a zone or a dependency fails, serving a reduced answer often beats failing completely. This is how to design for that."
next: [terraform, stay-up, event-driven]
---
Written against the AWS documentation as of October 2026. Recent changes are called out where they matter: S3 strong read-after-write consistency (since December 2020), the 1 MiB SQS message size limit, Lambda's per-function scaling rate, regional NAT gateways, the charge for every public IPv4 address, and the X-Ray SDKs entering maintenance mode in favour of OpenTelemetry (February 2026). No command on these pages was run against a real AWS account: the JSON and shell examples are illustrative, and the two `js run` toys simulate behaviour locally.
