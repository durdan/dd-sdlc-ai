---
id: redis-caching
title: "Caching patterns and stampedes"
summary: Cache-aside, write-through, and the thundering herd
why: A cache that is wrong or that collapses under a burst of misses can do more harm than no cache at all.
requires: [redis-expiry]
lesson: none
points:
  - title: Cache-aside
    text: The application reads the cache, and on a miss loads from the database and stores the result with a TTL.
  - title: Write-through
    text: Writes go to the cache and the database together, so reads find fresh data, at the cost of caching data nobody reads.
  - title: Invalidate by deleting
    text: After a database write, delete the cache key rather than setting it; the next read reloads it from the source.
  - title: Stampedes
    text: When a hot key expires, every request misses at once and all of them hit the database; collapse them into one load.
quiz_hint: Follow one popular key from expiry to the next successful read, and count the database queries in between.
quiz:
  - q: A product page key with 10,000 requests a second expires. Each miss runs a 200 ms query. With plain cache-aside, what happens?
    options:
      - One request reloads it; the rest wait for the cache
      - About 2,000 requests miss during those 200 ms and each runs the query, which can overload the database
      - Redis reloads the key itself
    answer: 1
    explain: That is a cache stampede. Single flight (one loader, others wait), a short lock in Redis, or refreshing popular keys before they expire avoid it.
  - q: After updating a product in the database, why do many teams DEL the cache key instead of SETting the new value?
    options:
      - DEL is faster
      - Two concurrent writers can SET in the opposite order to their database commits, leaving an old value cached; deleting lets the next read load whatever is committed
      - SET is not allowed after an update
    answer: 1
    explain: Deleting does not close every race (a slow reader can still put back an old value), so keep TTLs as a safety net. But it is far less error-prone than writing values from two places.
  - q: When does write-through make more sense than cache-aside?
    options:
      - When most written data is read soon after, and stale reads are costly
      - When most data is written once and never read
      - Never
    answer: 0
    explain: Write-through keeps the cache current, but caches everything written. For write-heavy data that is rarely read, it wastes memory.
links:
  - title: Client-side caching (Redis docs)
    url: https://redis.io/docs/latest/develop/clients/client-side-caching/
  - title: Key eviction (Redis docs)
    url: https://redis.io/docs/latest/develop/reference/eviction/
  - title: SET with NX and EX (Redis docs)
    url: https://redis.io/docs/latest/commands/set/
  - title: INFO, keyspace hits and misses (Redis docs)
    url: https://redis.io/docs/latest/commands/info/
---
The most common use of Redis is as a cache in front of a slower database. The idea is simple: keep the answer to an expensive question in memory for a while. The details decide whether it helps. When is a cached value filled? What happens on a write? And what happens when a popular key expires and thousands of requests miss at the same moment?

## Cache-aside

The application owns the logic. Read from the cache; on a miss, load from the database, store with a TTL, return.

```text
GET product:7                    # miss: (nil)
# ...application queries the database...
SET product:7 '{"id":7,"name":"Kettle","price":2900}' EX 300
GET product:7                    # hit for the next five minutes
```

Only data that is actually read gets cached, and if Redis is down the application can still fall back to the database (slower). The cost is that the first read after a miss is slow, and cached data can be stale for up to the TTL.

## Write-through and write-behind

- **Write-through**: every write updates the database and the cache together, so reads are always fresh. Everything written is cached, read or not.
- **Write-behind**: write to the cache, and copy to the database later. Fast writes, but anything not yet copied is lost if the cache fails. Rarely worth it for data you cannot lose.

## Invalidation

When the source changes, the simplest robust rule is: write the database, then delete the key.

```text
DEL product:7
```

Setting the new value from the writer instead invites races: two writers can update the cache in the opposite order to their database commits, leaving the older value cached until the TTL ends. Deleting is not perfect either (a reader that loaded the old row just before the write can store it after the delete), which is why a TTL is the safety net in every pattern.

## Stampedes

When a hot key expires, every request that arrives before it is reloaded misses, and each one runs the expensive query. This simulation sends 200 concurrent requests for a just-expired key:

```js run
const cache = new Map()
let dbLoads = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function loadFromDb(key) { dbLoads++; await sleep(50); return "value of " + key }

// Plain cache-aside: every request that misses goes to the database
async function getPlain(key) {
  if (cache.has(key)) return cache.get(key)
  const v = await loadFromDb(key)
  cache.set(key, v)
  return v
}

// Single flight: requests that miss at the same moment share one load
const inFlight = new Map()
async function getShared(key) {
  if (cache.has(key)) return cache.get(key)
  if (!inFlight.has(key)) {
    inFlight.set(key, loadFromDb(key).then((v) => { cache.set(key, v); inFlight.delete(key); return v }))
  }
  return inFlight.get(key)
}

async function burst(get) {
  cache.clear(); dbLoads = 0
  await Promise.all(Array.from({ length: 200 }, () => get("product:7")))   // 200 requests just after the key expired
  return dbLoads
}

burst(getPlain).then((n) => {
  console.log("plain cache-aside: database loads =", n)
  return burst(getShared)
}).then((n) => console.log("single flight:     database loads =", n))
```

Single flight works within one process. Across many application instances, the usual tools are:

- **A short lock in Redis**: the first instance to `SET lock:product:7 <token> NX PX 5000` reloads the value; the others briefly serve the stale copy or retry.
- **Early refresh**: reload a popular key before it expires (for example, when its remaining TTL drops below some fraction, with a bit of randomness so instances do not all refresh together).
- **Jittered TTLs**, so keys written together do not expire together.
- **Stale-while-revalidate**: keep the old value a little longer and serve it while one request refreshes it.

## What to cache

Cache what is read far more often than it changes, and size the TTL by how stale it may be. Track the hit ratio (`keyspace_hits` and `keyspace_misses` in `INFO stats`): a cache with a low hit ratio adds a network hop to every request and saves little.
