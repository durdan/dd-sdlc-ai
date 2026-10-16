---
id: aws-lambda
title: "Lambda: cold starts and concurrency"
summary: Functions that scale per request, within limits
why: "Lambda scales to zero and to thousands without servers, but its concurrency limits and cold starts shape latency, throttling and what it does to your database."
requires: [aws-compute]
lesson: none
points:
  - title: One request per environment
    text: "Each execution environment handles one invocation at a time. Concurrency is how many environments are busy at once."
  - title: Cold starts are new environments
    text: "When no idle environment exists, Lambda creates one and runs your init code first; that extra latency is the cold start."
  - title: Limits are per Region and per function
    text: "Accounts start with 1,000 concurrent executions per Region, shared by all functions. Each function can add up to 1,000 environments every 10 seconds."
  - title: Reserve and provision deliberately
    text: "Reserved concurrency guarantees and caps a function's share. Provisioned concurrency keeps environments initialised to remove cold starts."
quiz_hint: "Concurrency is requests per second times average duration in seconds."
quiz:
  - q: A function takes 200 ms on average and receives 5,000 requests per second. How much concurrency does it need?
    options: ["200", "1,000", "5,000"]
    answer: 1
    explain: "5,000 requests per second x 0.2 seconds = 1,000 environments busy at once, which is the whole default account quota in a Region."
  - q: A burst of traffic to one function uses all the account's concurrency, and an unrelated function starts getting throttled. What prevents this?
    options: ["A longer timeout", "Reserved concurrency on the critical function (and a cap on the noisy one)", "More memory for the noisy function"]
    answer: 1
    explain: "Reserved concurrency sets aside a slice of the Regional pool that no other function can use, and also caps the function at that number."
  - q: Where should you create a database connection pool or SDK client in a Lambda function?
    options: ["Inside the handler, so each request gets a fresh one", "Outside the handler, in init code, so warm invocations reuse it", "In a separate function"]
    answer: 1
    explain: "Code outside the handler runs once per environment. Reusing clients and connections across invocations saves time; keep pools small, since each environment opens its own."
links:
  - { title: "Understanding Lambda function scaling (AWS docs)", url: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html" }
  - { title: "Lambda execution environment lifecycle (AWS docs)", url: "https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html" }
  - { title: "Configuring provisioned concurrency (AWS docs)", url: "https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html" }
  - { title: "Improving startup performance with Lambda SnapStart (AWS docs)", url: "https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html" }
---
A Lambda function runs your code in short-lived **execution environments**, small isolated micro-VMs with your runtime and code loaded. Each environment handles **one invocation at a time**. When a request arrives and an idle environment exists, it is reused (a warm start). When none is free, Lambda creates a new one, runs your initialisation code, then the handler: that is a **cold start**. The number of environments busy at once is the function's **concurrency**. (This page describes the default compute type. Lambda Managed Instances, which run functions on EC2 instances in your account, let one environment handle several invocations at once and change some of these rules.)

## Concurrency is the real limit

```sh
concurrency = requests per second x average duration (s)
            = 5,000 x 0.2 = 1,000
```

By default an account has **1,000 concurrent executions per Region**, shared by every function in it (it can be raised to tens of thousands on request). On top of that, each function can scale by at most **1,000 new environments every 10 seconds**. Above either limit, synchronous calls get a `429 TooManyRequestsException`, and asynchronous events are retried for a while before being dropped or sent to a failure destination.

The pool being shared is the surprise: a noisy batch function can throttle your checkout API. Two controls help:

- **Reserved concurrency** sets aside part of the pool for one function and caps it at that number. Setting it to 0 stops a function entirely, a useful emergency switch.
- **Provisioned concurrency** keeps a number of environments initialised and ready, removing cold starts for that much traffic. You pay for it while it is configured.

## Cold starts

A cold start costs the time to create the environment, download the code and run your init code: from well under a second for a small Node.js or Python function to several seconds for a large Java app with heavy frameworks. To shrink it: keep packages small, do less work at import time, pick more memory (which also gives proportionally more CPU), and for Java, Python 3.12+ and .NET 8+, consider **SnapStart**, which restores environments from a snapshot taken after init. Code that runs outside the handler runs once per environment, so put SDK clients and connection setup there and reuse them.

## How Lambda fails your other systems

- **Connection storms**: 1,000 environments each opening a database connection can exhaust a relational database. Use RDS Proxy, keep per-environment pools to one or two connections, or cap the function with reserved concurrency.
- **Retries and duplicates**: asynchronous invocations and event source mappings (SQS, Kinesis, DynamoDB Streams) retry on failure, and delivery is at least once. Handlers must be idempotent.
- **Timeouts**: the maximum is 15 minutes, and the default is only 3 seconds. Set it just above your real worst case, and below the visibility timeout of any SQS queue that triggers the function.
- **Poison messages**: with SQS, one bad message can block or retry forever. Configure partial batch responses and a dead-letter queue.

Lambda is excellent for spiky, event-driven work and glue between AWS services. For steady high throughput, long-running jobs or many open connections, containers are often cheaper and simpler.
