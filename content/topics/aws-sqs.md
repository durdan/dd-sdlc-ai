---
id: aws-sqs
title: "SQS: queues, visibility timeouts and dead letters"
summary: Hand work off now, process it reliably later
why: "A queue between services absorbs spikes and outages. SQS's delivery rules (at least once, a visibility timeout, a receive count) decide whether that work is done once, twice or never."
requires: [aws-iam]
lesson: none
points:
  - title: Receiving hides, deleting finishes
    text: "A received message is hidden for the visibility timeout. Only DeleteMessage removes it; if the consumer does not delete it in time, it comes back."
  - title: Standard is at least once
    text: "Standard queues scale almost without limit but may deliver a message more than once and out of order. Handlers must be idempotent."
  - title: FIFO orders per group
    text: "FIFO queues preserve order within a message group and remove duplicates within a 5-minute window, at lower throughput."
  - title: Dead-letter queues catch poison
    text: "After maxReceiveCount receives without a delete, SQS moves the message to a dead-letter queue instead of retrying it forever."
quiz_hint: Track one message. When is it visible, who has it, and what happens if they never delete it?
quiz:
  - q: Processing usually takes 20 seconds but sometimes 50. The visibility timeout is the default 30 seconds. What goes wrong?
    options: ["Nothing; SQS waits for the consumer", "Slow messages become visible again after 30 seconds and a second consumer processes them too", "The message is deleted after 30 seconds"]
    answer: 1
    explain: "The timeout is a lease. Set it above your worst-case processing time, or extend it with ChangeMessageVisibility while you work."
  - q: Why can a standard queue deliver the same message twice even when nothing timed out?
    options: ["It is a bug", "SQS stores copies on several servers, and occasionally one is not yet marked as received or deleted; delivery is at least once by design", "Because the producer retried"]
    answer: 1
    explain: "At-least-once delivery is part of the standard queue contract. Make processing idempotent, for example by recording processed message or business IDs."
  - q: What does maxReceiveCount = 5 on a redrive policy do?
    options: ["Allows five consumers at once", "Moves a message to the dead-letter queue once it has been received five times without being deleted", "Deletes messages after five minutes"]
    answer: 1
    explain: "It bounds retries for a message that keeps failing. Alarm on the DLQ's depth and redrive messages back once the bug is fixed."
links:
  - { title: "Amazon SQS visibility timeout (AWS docs)", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html" }
  - { title: "Using dead-letter queues in Amazon SQS (AWS docs)", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html" }
  - { title: "Amazon SQS standard queues (AWS docs)", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html" }
  - { title: "Amazon SQS FIFO queues (AWS docs)", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html" }
---
Amazon SQS is a managed message queue: producers send messages, consumers poll for them. The key idea is that **receiving a message does not remove it**. SQS hides it from other consumers for the **visibility timeout** (30 seconds by default, up to 12 hours), and the consumer must call `DeleteMessage` once it has finished. If the consumer crashes, or is simply too slow, the message becomes visible again and someone else gets it. That is what makes SQS reliable, and it is also where duplicates come from.

## The life of a message

1. `SendMessage`: stored redundantly (up to 1 MiB; larger payloads go to S3 with a pointer). Kept for 4 days by default, up to 14.
2. `ReceiveMessage`: returned to one consumer with a fresh **receipt handle**, hidden for the visibility timeout, receive count incremented. Use long polling (`WaitTimeSeconds` up to 20) to avoid paying for empty responses.
3. `DeleteMessage` with the latest receipt handle: gone. Otherwise it reappears when the timeout expires.
4. With a **redrive policy**, once the receive count exceeds `maxReceiveCount`, SQS moves the message to a **dead-letter queue** (DLQ) instead.

## Try it

A simulated clock with one message, a 30-second visibility timeout and `maxReceiveCount` 3. Consumer A is slower than the timeout, B and C crash.

```js run
const visibilityTimeout = 30
const maxReceiveCount = 3
const msg = { id: "order-42", visibleAt: 0, receives: 0, deleted: false }
const events = []
const at = (t, text) => events.push({ t, text })

// Consumers poll at these times: [time, name, seconds of work, succeeds?]
const polls = [
  [0, "A", 45, true],   // slower than the timeout
  [30, "B", 10, false], // crashes
  [60, "C", 5, false],  // crashes
  [90, "D", 5, true],
]
for (const [t, who, work, ok] of polls) {
  if (msg.deleted || t < msg.visibleAt) { at(t, `${who} polls: nothing visible`); continue }
  if (msg.receives >= maxReceiveCount) { at(t, `${msg.id} was received ${msg.receives} times: moved to the DLQ`); break }
  msg.receives++
  msg.visibleAt = t + visibilityTimeout
  const receipt = msg.receives
  at(t, `${who} receives ${msg.id} (receive ${receipt}), hidden until t=${msg.visibleAt}`)
  if (!ok) at(t + work, `${who} crashes without deleting it`)
  else if (t + work > t + visibilityTimeout) at(t + work, `${who} finishes late; its receipt handle is stale, and another consumer already has the message`)
  else { msg.deleted = true; at(t + work, `${who} deletes ${msg.id}`) }
}
events.sort((a, b) => a.t - b.t).forEach((e) => console.log(`t=${String(e.t).padStart(2)}s  ${e.text}`))
```

```sh
t= 0s  A receives order-42 (receive 1), hidden until t=30
t=30s  B receives order-42 (receive 2), hidden until t=60
t=40s  B crashes without deleting it
t=45s  A finishes late; its receipt handle is stale, and another consumer already has the message
t=60s  C receives order-42 (receive 3), hidden until t=90
t=65s  C crashes without deleting it
t=90s  order-42 was received 3 times: moved to the DLQ
```

A did the work, but too late: the side effects happened, and the message was handed out again. Change `visibilityTimeout` to 60 and A deletes it cleanly.

## Standard or FIFO

**Standard** queues support a nearly unlimited request rate, deliver **at least once**, and make a best effort at ordering. **FIFO** queues (names end in `.fifo`) deliver in order within each **message group ID**, and deduplicate messages with the same deduplication ID within 5 minutes. Without high-throughput mode they handle 300 API calls per second per action (3,000 messages with batches of 10); high-throughput mode raises that a lot, depending on the Region. A failing message blocks the rest of its group until it succeeds or reaches the DLQ.

## Settings that prevent incidents

- Visibility timeout above worst-case processing time; for a Lambda trigger, AWS recommends at least six times the function's timeout.
- Always a DLQ, with an alarm on its depth (and on `ApproximateAgeOfOldestMessage` in the main queue).
- Idempotent consumers, keyed on a business ID, because duplicates will happen on standard queues.
- Batch sends, receives and deletes (up to 10 messages) to cut cost and API calls.
