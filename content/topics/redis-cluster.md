---
id: redis-cluster
title: Redis Cluster and hash slots
summary: 16,384 slots spread across primaries
why: Cluster lets Redis grow past one machine, but it changes which multi-key operations work and how clients talk to it.
requires: [redis-replication, redis-atomic]
lesson: none
points:
  - title: Keys map to slots
    text: Every key belongs to one of 16,384 hash slots, computed as CRC16 of the key modulo 16384; each primary owns a set of slots.
  - title: Hash tags group keys
    text: If a key contains {...}, only the part inside the braces is hashed, so keys with the same tag land in the same slot.
  - title: Multi-key commands need one slot
    text: MGET, MULTI/EXEC across keys and Lua scripts only work when all their keys hash to the same slot.
  - title: Clients follow redirects
    text: A node that does not own a key's slot replies MOVED (or ASK during resharding); cluster-aware clients cache the slot map.
quiz_hint: Compute which slot each key lands in, and ask whether one command needs keys from different slots.
quiz:
  - q: "In a cluster, MGET user:42 user:43 fails with CROSSSLOT. Why?"
    options:
      - MGET is not supported in cluster mode
      - The two keys hash to different slots, possibly on different nodes, so one node cannot answer for both
      - The keys do not exist
    answer: 1
    explain: Multi-key operations need every key in the same slot. Use hash tags such as {user:42}:cart if the keys belong together, or issue separate commands.
  - q: "Which keys are guaranteed to be in the same slot?"
    options: ["user:42:cart and user:42:profile", "{user:42}:cart and {user:42}:profile", "cart:{} and profile:{}"]
    answer: 1
    explain: "Only the text inside the first non-empty {...} is hashed. Without braces the whole key is hashed; empty braces are ignored, so the whole key is hashed then too."
  - q: All keys of a large multi-tenant system use the hash tag {tenant}, with the same literal text. What goes wrong?
    options:
      - Nothing
      - Every key lands in one slot, so one node holds all the data and takes all the load
      - Redis rejects the keys
    answer: 1
    explain: Hash tags trade distribution for co-location. Tag with something that has many values, such as the tenant id, and keep each tag's data small.
links:
  - title: Scale with Redis Cluster (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/
  - title: Redis Cluster specification (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/
  - title: CLUSTER KEYSLOT (Redis docs)
    url: https://redis.io/docs/latest/commands/cluster-keyslot/
---
One Redis process runs commands on one core and holds its data in one machine's memory. Redis Cluster spreads data across several primaries, each with its own replicas, without a proxy in between. Instead of a hash ring, the key space is split into 16,384 fixed hash slots. Each primary owns some of the slots, and moving a slot from one node to another is how a cluster is resized.

## From key to slot

The slot is `CRC16(key) mod 16384`, using the CRC16-XMODEM variant. If the key contains a `{`, followed later by a `}` with at least one character between them, only that part is hashed. This plain-JS version gives the same answers as `CLUSTER KEYSLOT` on a real cluster-enabled server:

```js run
// CRC16-XMODEM (polynomial 0x1021), the checksum Redis Cluster uses for key slots
function crc16(str) {
  let crc = 0
  for (const byte of new TextEncoder().encode(str)) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc
}

// Only the part inside the first {...} is hashed, if it is not empty
function keySlot(key) {
  const open = key.indexOf("{")
  if (open !== -1) {
    const close = key.indexOf("}", open + 1)
    if (close > open + 1) key = key.slice(open + 1, close)
  }
  return crc16(key) % 16384
}

for (const key of ["user:42", "user:43", "{user:42}:cart", "{user:42}:profile", "foo"]) {
  console.log(key.padEnd(18), keySlot(key))
}
```

```text
> CLUSTER KEYSLOT user:42
(integer) 15880
> CLUSTER KEYSLOT {user:42}:cart
(integer) 15880
```

`user:42` and `user:43` land in different slots; `{user:42}:cart` and `{user:42}:profile` both hash `user:42`, so they share one.

## What changes for your code

**Multi-key operations need one slot.** `MGET`, `MSET`, `SUNION`, a `MULTI`/`EXEC` touching several keys, and a Lua script with several `KEYS` all fail with `CROSSSLOT` unless every key is in the same slot. Hash tags are how you put related keys together. Use them for data that is genuinely accessed together, and tag with something that has many values (a user or tenant id), or one slot, and one node, gets everything.

**Clients follow redirects.** Any node accepts a connection, but if it does not own a key's slot it replies with a redirect:

```text
-MOVED 15880 10.0.0.7:6379
```

Cluster-aware client libraries learn the slot map, send each command to the right node, and refresh the map on `MOVED`. During resharding, a slot being migrated answers `ASK` for keys that have already moved, for that one request only. With `redis-cli`, pass `-c` to follow redirects.

**One database.** Only database 0 exists; `SELECT` to another number is not allowed.

## Failover and consistency

Each primary has replicas. Nodes gossip with each other; if a majority of primaries agree that one is unreachable, one of its replicas is promoted. Replication is still asynchronous, so the cluster specification says plainly that acknowledged writes can be lost during failovers and partitions. A primary on the minority side of a partition stops accepting writes after `cluster-node-timeout`, which bounds the loss. By default, if any slot has no reachable owner, the cluster stops serving queries and replies with `CLUSTERDOWN` errors (`cluster-require-full-coverage yes`); setting it to `no` keeps the covered slots available.

## Sizing

The specification suggests a practical maximum on the order of 1,000 nodes. In practice: enough primaries that each holds a comfortable share of memory and load, at least one replica per primary on a different machine, and keys designed so that the operations you need stay within one slot.
