---
id: mongo-storage
title: "WiredTiger: cache, checkpoints, journal"
summary: Where documents live between memory and disk
why: "Most MongoDB performance problems end up as cache problems: a working set that no longer fits, or too many writes waiting to be flushed. Knowing what the storage engine does tells you what to measure."
requires: [mongo-write-concern]
lesson: none
points:
  - title: An internal cache in front of the files
    text: "By default the larger of 50% of (RAM minus 1 GB) or 256 MB. The filesystem cache holds compressed file pages on top of that."
  - title: Checkpoints every 60 seconds
    text: "WiredTiger writes a consistent snapshot of the data files about once a minute; the last checkpoint is always a valid recovery point."
  - title: The journal covers the gap
    text: "Changes since the last checkpoint are in the write-ahead journal, flushed every 100 ms or immediately for j true and majority writes."
  - title: Documents are locked, not collections
    text: "WiredTiger uses document-level concurrency with MVCC snapshots, so writers to different documents do not block each other."
quiz_hint: Follow one write from memory to the journal to a checkpoint, and ask what is lost if the power goes at each step.
quiz:
  - q: "mongod crashes 40 seconds after the last checkpoint. How does it recover the writes made since?"
    options:
      - They are lost
      - "It starts from the last checkpoint and replays the journal, which holds every change written since"
      - It copies them from the filesystem cache
    answer: 1
    explain: "Checkpoints give a consistent base; the journal is a write-ahead log on top of it. Only writes not yet in the on-disk journal (up to about 100 ms of w 1 writes) can be lost on a crash."
  - q: A server has 32 GB of RAM and default settings. Roughly how large is the WiredTiger internal cache?
    options: ["16 GB", "15.5 GB", "31 GB"]
    answer: 1
    explain: "50% of (32 GB minus 1 GB) is 15.5 GB. The rest is used by connections, other processes and the filesystem cache, which WiredTiger also benefits from. In a container with a memory limit, check hostInfo and set the cache size explicitly, because WiredTiger may not see the limit."
  - q: Collection stats show size 27.7 MB and storageSize 8.8 MB. Why the difference?
    options:
      - The collection is corrupt
      - "size is the uncompressed size of the documents; storageSize is the space on disk, which is smaller because blocks are compressed (snappy by default)"
      - Half of the documents are deleted
    answer: 1
    explain: "WiredTiger compresses collection data with snappy and indexes with prefix compression by default. zstd and zlib give smaller files at more CPU cost."
links:
  - { title: "WiredTiger storage engine (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/wiredtiger/" }
  - { title: "Journaling (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/journaling/" }
  - { title: "MongoDB limits and thresholds (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/reference/limits/" }
---
WiredTiger has been MongoDB's default storage engine since 3.2, and the only one in recent releases apart from the in-memory engine of Enterprise. It stores each collection and each index in its own file as a B-tree, keeps hot pages in an internal cache, and makes changes durable with a combination of a write-ahead journal and periodic checkpoints. You rarely configure it, but its behaviour explains most of what you see in production.

## The cache

The internal cache holds uncompressed pages of collections and indexes. Its default size is the larger of 50% of (RAM minus 1 GB) and 256 MB. On the test container, which saw 7.8 GB of memory:

```js
db.serverStatus().wiredTiger.cache["maximum bytes configured"]   // 3570401280, about 3.3 GiB
```

That is half of (7,835 MB minus 1,024 MB). The operating system's filesystem cache keeps compressed file pages as well, so leave memory for it rather than raising the WiredTiger cache to nearly all of RAM. The quantity to watch is the working set: the indexes and documents your queries touch regularly. While it fits in cache, reads are memory reads. When it stops fitting, reads go to disk, and eviction (writing changed pages out to make room) starts to compete with your workload; the `wiredTiger.cache` section of `serverStatus` shows bytes in cache, dirty bytes and pages read into cache.

## Checkpoints and the journal

WiredTiger gives each operation a snapshot of the data (multiversion concurrency control) and, about every 60 seconds, writes a consistent snapshot of all data files to disk: a checkpoint. The previous checkpoint stays valid until the new one is complete, so the files on disk are always consistent as of some checkpoint.

Changes made since then are recorded in the journal, a write-ahead log. The journal is flushed to disk every 100 ms, and at once for writes with `j: true` or with `w: "majority"` (which implies journaling by default). After a crash, `mongod` opens the last checkpoint and replays the journal. A `w: 1` write without `j: true` that was acknowledged but not yet flushed can therefore be lost if the machine fails, which is one more reason for majority writes.

## Concurrency and compression

Writes take document-level concurrency control: two clients updating different documents of one collection proceed in parallel, and a conflict on the same document is retried internally (or surfaces as a `WriteConflict` in a transaction). Some operations, such as dropping a collection, still take stronger locks.

Collection data is compressed with snappy by default (zstd for time series collections), indexes with prefix compression, and the journal with snappy. On the test data:

```js
const s = db.orders.stats()
s.wiredTiger.creationString.match(/block_compressor=\w+/)[0]   // block_compressor=snappy
s.size          // 27678888, documents uncompressed
s.storageSize   // 8839168, on disk
```

You can choose `zstd` or `zlib` per collection when you create it, trading CPU for disk. The compression applies on disk only; in the cache, pages are uncompressed, so the cache needs room for the data as your queries see it.
