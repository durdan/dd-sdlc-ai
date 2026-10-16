---
id: redis-expiry
title: Expiry and eviction
summary: Keys that time out, and what goes when memory is full
why: Without a memory limit and the right policy, a cache either fills the host's memory or starts refusing writes at peak time.
requires: [redis-data-structures]
lesson: none
points:
  - title: A TTL per key
    text: EXPIRE or SET ... EX gives a key a time to live; Redis deletes it when that runs out, lazily on access and in a background sweep.
  - title: Some writes clear the TTL
    text: A plain SET on an existing key removes its expiry unless you pass KEEPTTL.
  - title: maxmemory and a policy
    text: When used memory reaches maxmemory, the eviction policy decides what to delete; the default, noeviction, refuses writes instead.
  - title: LRU is approximate
    text: Redis samples a few keys and evicts the best candidate among them, which comes close to true LRU at a fraction of the cost.
quiz_hint: Separate "this key should disappear at a time" (expiry) from "memory is full, something must go" (eviction).
quiz:
  - q: A session key was set with EX 1800. Later the app runs SET session:abc newvalue. What is its TTL now?
    options: ["Still about 1800 seconds", "None; a plain SET removes the expiry, unless it is given KEEPTTL", "Zero; the key is deleted"]
    answer: 1
    explain: SET replaces the value and discards the old TTL. Use SET ... KEEPTTL, or set a new EX in the same command.
  - q: Redis is used purely as a cache and has reached maxmemory with the default policy. What happens to a new SET?
    options:
      - The least recently used key is evicted
      - "It fails with an OOM error, because the default policy is noeviction"
      - Redis writes the key to disk
    answer: 1
    explain: noeviction protects data that must not be dropped, but it is wrong for a cache. Set maxmemory-policy to allkeys-lru or allkeys-lfu.
  - q: Redis holds both cache keys (with TTLs) and job data that must not be lost (no TTL). Which policy evicts only the cache keys?
    options: [allkeys-lru, volatile-lru, allkeys-random]
    answer: 1
    explain: The volatile-* policies only consider keys with an expiry. If no such key is left, they behave like noeviction. Better still, keep caches and durable data in separate instances.
links:
  - title: Key eviction (Redis docs)
    url: https://redis.io/docs/latest/develop/reference/eviction/
  - title: EXPIRE (Redis docs)
    url: https://redis.io/docs/latest/commands/expire/
  - title: SET (Redis docs)
    url: https://redis.io/docs/latest/commands/set/
---
Two separate mechanisms remove keys from Redis. Expiry removes a key when the time to live you gave it runs out. Eviction removes keys when memory reaches the limit you configured, according to a policy. A cache needs both: TTLs so stale data goes away, and an eviction policy so a burst of new keys pushes out old ones rather than failing.

## Expiry

```text
> SET session:abc '{"user":42}' EX 1800
OK
> TTL session:abc
(integer) 1800
> SET session:abc '{"user":43}'
OK
> TTL session:abc
(integer) -1
```

The second `SET` wiped the TTL; `-1` means the key exists with no expiry (`-2` means no such key). Pass `KEEPTTL` to keep it, or set `EX` again. `EXPIRE key seconds` sets a TTL on an existing key, with options `NX` (only if it has none), `XX`, `GT` and `LT`; `PERSIST` removes it. Hash fields can have their own TTLs too, since Redis 7.4 (`HEXPIRE`).

Expired keys are removed in two ways: lazily, when a client touches one, and by a periodic background task that samples keys with TTLs and deletes the expired ones. So memory used by expired keys is reclaimed gradually, not exactly at the moment they expire. Give large numbers of keys slightly different TTLs (add some random seconds), or they all expire, and all miss, together.

## Eviction

With `maxmemory` set (0, the default on 64-bit systems, means no limit), Redis checks memory before running commands that may add data. If it is over the limit, it evicts keys according to `maxmemory-policy`:

| Policy | Evicts |
| --- | --- |
| `noeviction` (default) | Nothing; commands that would add data fail |
| `allkeys-lru` | The least recently used keys |
| `allkeys-lfu` | The least frequently used keys |
| `allkeys-random` | Random keys |
| `volatile-lru`, `volatile-lfu`, `volatile-random` | As above, but only keys that have a TTL |
| `volatile-ttl` | Keys with a TTL, shortest remaining first |

Redis 8.6 added `allkeys-lrm` and `volatile-lrm` (least recently modified: reads do not count as use). With the default policy and a full instance:

```text
> SET one-more value
(error) OOM command not allowed when used memory > 'maxmemory'.
```

For a cache, `allkeys-lru` is a sound default; `allkeys-lfu` does better when a stable set of keys is popular over time. `INFO stats` reports `evicted_keys`, worth watching: steady eviction means the cache is smaller than its working set.

## Approximate LRU

Tracking exact recency for millions of keys would cost memory and time. Instead, Redis samples a few keys (`maxmemory-samples`, default 5) and evicts the best candidate among them, keeping a small pool of good candidates between evictions. This toy compares exact LRU with sampling on a workload where 80% of requests go to 50 hot keys:

```js run
// A cache of 100 keys in front of 1,000; 80% of requests go to 50 "hot" keys.
let seed = 7
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
const requests = Array.from({ length: 20000 }, () =>
  rand() < 0.8 ? "hot:" + Math.floor(rand() * 50) : "cold:" + Math.floor(rand() * 950))

function run(pickVictim) {
  const cache = new Map()       // key -> last access time
  let hits = 0
  requests.forEach((key, t) => {
    if (cache.has(key)) hits++
    else if (cache.size >= 100) cache.delete(pickVictim(cache))
    cache.set(key, t)
  })
  return ((100 * hits) / requests.length).toFixed(1) + "% hits"
}

// Exact LRU: evict the key with the oldest access time
const exact = (cache) => [...cache].reduce((a, b) => (b[1] < a[1] ? b : a))[0]
// Redis-style: look at a few random keys, evict the oldest of those
const sampled = (n) => (cache) => {
  const keys = [...cache.keys()]
  let victim = null
  for (let i = 0; i < n; i++) {
    const k = keys[Math.floor(rand() * keys.length)]
    if (victim === null || cache.get(k) < cache.get(victim)) victim = k
  }
  return victim
}

console.log("exact LRU      ", run(exact))
console.log("sampled, 5 keys", run(sampled(5)))
console.log("sampled, 1 key ", run(sampled(1)), "(that is random eviction)")
```

Five samples get within a couple of points of exact LRU here; one sample is just random eviction. Raising `maxmemory-samples` gets closer to exact LRU, at the cost of more CPU per eviction.
