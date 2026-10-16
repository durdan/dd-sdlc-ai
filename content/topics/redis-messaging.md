---
id: redis-messaging
title: Pub/sub versus streams
summary: Fire-and-forget broadcast, or a log with acknowledgements
why: Pub/sub silently drops messages for anyone not listening; choosing it for work that must not be lost is a common and quiet bug.
requires: [redis-data-structures]
lesson: none
points:
  - title: Pub/sub is at-most-once
    text: A published message goes to the subscribers connected at that moment and is then gone; nothing is stored.
  - title: Streams are a stored log
    text: XADD appends entries with ids to a stream key; readers can read from any point, including history.
  - title: Consumer groups share work
    text: XREADGROUP hands each entry to one consumer in the group and keeps it pending until XACK.
  - title: Pending entries need care
    text: Entries a crashed consumer never acknowledged stay pending; XAUTOCLAIM lets another consumer take them over.
quiz_hint: Ask what happens to a message published while the receiver is restarting.
quiz:
  - q: An order service publishes "order paid" on a pub/sub channel. The email worker is restarting for 10 seconds. What happens to messages published during that time?
    options:
      - They are queued until the worker reconnects
      - They are lost for that worker; pub/sub does not store messages
      - Redis retries delivery
    answer: 1
    explain: Pub/sub delivers at most once, only to subscribers connected at the time. Use a stream (or a list) when every message must be processed.
  - q: Two workers in the same consumer group call XREADGROUP on a stream. How are new entries divided?
    options:
      - Each entry goes to both
      - Each entry goes to one of them; the group tracks which entries were delivered and not yet acknowledged
      - Only the first worker gets entries
    answer: 1
    explain: A consumer group behaves like competing consumers. Different groups each get every entry, which is how several services can process the same stream independently.
  - q: A worker read an entry with XREADGROUP and crashed before XACK. What happens to the entry?
    options:
      - It is deleted
      - It stays in the group's pending entries list; another consumer can claim it with XCLAIM or XAUTOCLAIM after an idle time
      - It is delivered again automatically to every consumer
    answer: 1
    explain: Delivery is at least once, so the processing must tolerate an entry being handled twice (make it idempotent).
links:
  - title: Redis Pub/Sub (Redis docs)
    url: https://redis.io/docs/latest/develop/pubsub/
  - title: Redis Streams (Redis docs)
    url: https://redis.io/docs/latest/develop/data-types/streams/
  - title: XAUTOCLAIM (Redis docs)
    url: https://redis.io/docs/latest/commands/xautoclaim/
---
Redis has two quite different ways to pass messages. Pub/sub broadcasts each message to whoever is subscribed right now and keeps nothing. Streams are a data type: an append-only log stored under a key, which consumers read at their own pace and acknowledge. Pick by asking whether a message may be lost when nobody is listening.

## Pub/sub

```text
# Terminal 1
> SUBSCRIBE news
1) "subscribe"
2) "news"
3) (integer) 1

# Terminal 2
> PUBLISH news hello
(integer) 1          # number of subscribers that received it

# Terminal 1 receives
1) "message"
2) "news"
3) "hello"
```

`PUBLISH` returns how many subscribers got the message; with nobody subscribed it returns 0 and the message is gone. The Redis docs describe the delivery as at most once. A subscriber that disconnects, restarts, or falls too far behind (its output buffer overflows and Redis drops the connection) misses messages, with no way to replay them. Pub/sub suits signals where only the latest state matters: "config changed, reload", cache invalidation hints, live presence or typing indicators. Since Redis 7, sharded pub/sub (`SSUBSCRIBE`, `SPUBLISH`) keeps a channel's traffic on the shard that owns it in a cluster.

## Streams

A stream is an append-only log. Each entry has an id (by default a millisecond timestamp and a sequence number) and a set of field-value pairs:

```text
> XADD orders:events * type created order 1001
"1760610000000-0"
> XADD orders:events * type paid order 1001
"1760610000001-0"
```

(The ids depend on the clock when you run it.) Entries stay until you trim them, for example with `XADD ... MAXLEN ~ 100000` or `XTRIM`, so a consumer that was offline can catch up. `XREAD` reads from any id, and can block waiting for new entries.

## Consumer groups

To spread work across several workers and know what has been done, create a group:

```text
> XGROUP CREATE orders:events billing 0
OK
> XREADGROUP GROUP billing worker-1 COUNT 10 STREAMS orders:events >
1) 1) "orders:events"
   2) 1) 1) "1760610000000-0"
         2) 1) "type"
            2) "created"
            ...
      2) 1) "1760610000001-0"
         ...
> XPENDING orders:events billing
1) (integer) 2
...
```

`>` means "entries never delivered to this group". Each one goes to one consumer and is added to the group's pending entries list until the consumer runs `XACK`. If a worker crashes, its entries stay pending; another worker can take them over with `XAUTOCLAIM` (Redis 6.2 and later) once they have been idle long enough. That makes delivery at least once, so handlers must cope with seeing an entry twice. A second group, say `analytics`, reads the same entries independently.

## Choosing

| Need | Use |
| --- | --- |
| Broadcast a hint; losing one is fine | Pub/sub |
| Every message processed, with retries | Stream with a consumer group |
| A simple work queue, no history | A list with `LMOVE`/`BLMOVE` to a processing list |
| Long retention, replay from weeks ago, very high volume | A log built for it, such as Kafka |

Streams live in memory like everything else in Redis, so trim them, and remember that their durability is Redis's: with asynchronous replication and periodic fsync, acknowledged entries can still be lost in a failover.
