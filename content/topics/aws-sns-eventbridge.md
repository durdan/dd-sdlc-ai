---
id: aws-sns-eventbridge
title: "Fan-out and events: SNS and EventBridge"
summary: One message, many consumers, decided by rules
why: "Queues connect one producer to one consumer group. Topics and event buses let many services react to the same fact without the producer knowing them, and fail in different ways."
requires: [aws-sqs]
lesson: none
points:
  - title: SNS pushes to subscribers
    text: "An SNS topic pushes each message to every subscription (SQS queues, Lambda functions, HTTP endpoints, email, SMS), optionally filtered."
  - title: SNS to SQS is the classic fan-out
    text: "Each consuming service subscribes its own queue, so it can fall behind, retry and scale without affecting the others."
  - title: EventBridge routes by content
    text: "An event bus matches each event against rules with patterns on its fields and sends matches to targets, including AWS service events and SaaS sources."
  - title: Both retry, then drop
    text: "Delivery is at least once with retries. Without a dead-letter queue, events that keep failing are eventually lost."
quiz_hint: Ask who receives a copy, who decides that, and where a failed delivery goes.
quiz:
  - q: Orders, emails and analytics all need every OrderPlaced message, and each can be slow or down independently. Best design?
    options: ["One SQS queue read by all three services", "An SNS topic (or EventBridge rule) delivering to a separate SQS queue per service", "The producer calls each service directly"]
    answer: 1
    explain: "With one queue, consumers compete and each message goes to only one of them. A queue per subscriber gives each its own copy, buffer and DLQ."
  - q: By default, how long does EventBridge keep retrying delivery to a failing target?
    options: ["It does not retry", "Up to 24 hours and 185 attempts, with exponential backoff and jitter", "Forever, until the target recovers"]
    answer: 1
    explain: "After the retry policy is exhausted the event is dropped, unless the target has a dead-letter queue. Some errors, such as missing permissions, are not retried at all."
  - q: Which is a strength of EventBridge over SNS for routing?
    options: ["Lower latency in every case", "Rules that match on any field of the event's JSON body, and built-in events from AWS services and SaaS partners", "Guaranteed exactly-once delivery"]
    answer: 1
    explain: "SNS filters on message attributes or body; EventBridge's patterns are richer and it receives events from many AWS services. Neither is exactly once."
links:
  - { title: "What is Amazon SNS? (AWS docs)", url: "https://docs.aws.amazon.com/sns/latest/dg/welcome.html" }
  - { title: "Fanout to Amazon SQS queues (Amazon SNS docs)", url: "https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html" }
  - { title: "What is Amazon EventBridge? (AWS docs)", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" }
  - { title: "Using dead-letter queues for EventBridge targets (AWS docs)", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-dlq.html" }
---
SQS gives each message to one consumer. When several services each need their own copy of the same fact ("order placed", "file uploaded", "instance stopped"), you publish it once and let the infrastructure fan it out. **SNS** does this with **topics** and subscriptions. **EventBridge** does it with **event buses** and **rules** that match on event content. Both deliver at least once, both retry, and both drop what they cannot deliver unless you give them a dead-letter queue.

## SNS: topics and subscriptions

A publisher sends to a topic; SNS pushes a copy to every subscription: SQS queues, Lambda functions, HTTP(S) endpoints, Amazon Data Firehose, email, SMS or mobile push. **Filter policies** on a subscription let a consumer receive only some messages, matched on message attributes or the body. FIFO topics, which only deliver to SQS queues, preserve ordering per message group and deduplicate.

The standard pattern is **SNS to SQS fan-out**:

```sh
OrderPlaced -> SNS topic orders
                 |-> SQS fulfilment-queue  -> fulfilment workers
                 |-> SQS email-queue       -> email sender
                 '-> SQS analytics-queue   -> analytics loader
```

Each service owns its queue, scales its consumers and has its own DLQ. If the email sender is down for an hour, its queue fills and drains later; fulfilment is unaffected. Delivering straight from SNS to Lambda or HTTP removes that buffer, so failures fall back on SNS's retry policy.

## EventBridge: buses and rules

An event is JSON with a standard envelope (`source`, `detail-type`, `time`, `detail`). Rules on a bus match events with patterns:

```json
{
  "source": ["com.example.orders"],
  "detail-type": ["OrderPlaced"],
  "detail": { "total": [{ "numeric": [">", 100] }], "country": ["DE", "FR"] }
}
```

Matching events go to up to five targets per rule: Lambda, SQS, Step Functions, API destinations (any HTTP API), another bus, and many more. The default bus receives events from AWS services themselves (an EC2 state change, a CodePipeline failure), and partner buses receive SaaS events. Extras include the **schema registry**, **archive and replay** of past events, **Pipes** for point-to-point source-to-target integrations, and **Scheduler** for cron-like and one-off invocations.

## How they fail

- **Retries and drops**: EventBridge retries a failing target for up to 24 hours and 185 attempts by default, then drops the event. Errors such as a missing permission or a deleted target are not retried. SNS retry policies depend on the protocol. Configure a **DLQ** (an SQS queue) on every target or subscription, and alarm on it.
- **Duplicates**: at-least-once delivery means consumers must be idempotent.
- **No ordering**: standard SNS topics and EventBridge do not guarantee order. Include versions or timestamps and let consumers ignore stale updates.
- **Permissions**: the queue's or function's resource policy must allow the topic or the rule to deliver; a missing policy silently routes to the DLQ, or nowhere.
- **Payload drift**: consumers depend on fields producers may change. Version events and document their schemas.
