---
id: aws-lambda
title: "Lambda: cold starts and concurrency"
summary: Functions that scale per request, within limits
why: "Lambda scales to zero and to thousands without servers, but its concurrency limits and cold starts shape latency, throttling and what it does to your database."
requires: [aws-compute]
lesson: diagram
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

```trace diagram
id: lambda-cold-warm
title: Cold starts, warm starts, concurrency
subtitle: One request per environment
kind: sequence
elements:
  - { id: caller, label: Caller }
  - { id: svc, label: Lambda }
  - { id: env1, label: Env 1 }
  - { id: env2, label: Env 2 }
edges:
  - { id: inv1, from: caller, to: svc, label: Invoke }
  - { id: create1, from: svc, to: env1, label: "create env, load code" }
  - { id: init1, from: env1, to: env1, label: "init: SDK clients, DB pool" }
  - { id: h1, from: env1, to: env1, label: "handler(event)" }
  - { id: res1, from: env1, to: caller, label: response, style: dashed }
  - { id: inv2, from: caller, to: svc, label: Invoke again }
  - { id: warm, from: svc, to: env1, label: reuse the idle env }
  - { id: h2, from: env1, to: env1, label: handler only }
  - { id: inv3, from: caller, to: svc, label: two at once }
  - { id: create2, from: svc, to: env2, label: "Env 1 busy: new env" }
  - { id: init2, from: env2, to: env2, label: init (cold start) }
  - { id: throttle, from: svc, to: caller, label: 429 over the limit, style: dashed }
steps:
  - caption: "Lambda runs each invocation in an execution environment, a small micro-VM that handles one request at a time. Whether an idle one exists decides between a cold and a warm start."
  - caption: "The first request finds no environment, so Lambda creates one, with the runtime and your code loaded."
    trace: [inv1, create1]
  - caption: "Then your init code runs: everything outside the handler. Creating the environment plus init is the cold start, well under a second for a small Node.js function and seconds for a heavy Java app."
    trace: [init1]
  - caption: "Only then does the handler run, and the response goes back to the caller."
    trace: [h1, res1]
  - caption: "The next request finds Env 1 idle and reuses it, a warm start. The clients and connections made in init are still there, which is why they belong outside the handler."
    trace: [inv2, warm, h2]
  - caption: "Two requests at the same moment need two environments, and the second one pays its own cold start. Concurrency is requests per second times average duration."
    trace: [inv3, create2, init2]
  - caption: "Every function in the Region shares a default pool of 1,000 concurrent executions, and each function adds at most 1,000 environments every 10 seconds. Above that, synchronous calls get 429 TooManyRequestsException."
    trace: [throttle]
  - caption: "Provisioned concurrency keeps environments initialised in advance, so that much traffic has no cold starts. Reserved concurrency sets aside part of the pool for one function and also caps it there."
    focus: [svc, env1, env2]
```

```trace diagram
id: lambda-async
title: An asynchronous invoke that keeps failing
subtitle: Retries, then a destination or nothing
kind: sequence
elements:
  - { id: src, label: Event source }
  - { id: queue, label: Lambda queue }
  - { id: fn, label: Function }
  - { id: dest, label: On-failure, role: queue }
edges:
  - { id: send, from: src, to: queue, label: "async invoke: 202", flow: async }
  - { id: run1, from: queue, to: fn, label: attempt 1 }
  - { id: err1, from: fn, to: queue, label: error or timeout, style: dashed }
  - { id: run2, from: queue, to: fn, label: retry after 1 min }
  - { id: run3, from: queue, to: fn, label: retry after 2 more min }
  - { id: fail, from: queue, to: dest, label: event and error, flow: async }
steps:
  - caption: "An asynchronous invoke, such as one from S3 or SNS, returns 202 straight away. Lambda puts the event on its own internal queue, and the sender stops waiting."
    trace: [send]
  - caption: "Lambda passes the event to the function. If the handler throws or times out, that counts as a function error."
    trace: [run1, err1]
  - caption: "By default Lambda tries twice more, one minute and then two minutes later. Throttles and system errors are different: those events go back on the queue and are retried for up to 6 hours."
    trace: [run2, run3]
  - caption: "When the last attempt fails, or the event gets too old, Lambda discards it. An on-failure destination or a dead-letter queue keeps a copy for you."
    trace: [fail]
    note: "The same event can arrive twice even without errors, so handlers must be idempotent."
```
