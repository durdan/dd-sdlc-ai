---
id: redis-single-thread
title: One command at a time, and why that is fast
summary: An event loop over data in memory
why: Redis's speed and its biggest operational trap (one slow command stalls everyone) have the same cause.
lesson: none
points:
  - title: Data lives in memory
    text: Every read and write touches RAM, not disk, so a typical command takes microseconds.
  - title: One thread runs commands
    text: An event loop serves all clients, executing one command at a time, so each command is atomic and there are no locks.
  - title: Slow commands block everyone
    text: A command that walks a million keys (KEYS, a huge SMEMBERS, a long Lua script) holds up every other client until it ends.
  - title: The network is usually the limit
    text: Round trips cost far more than command execution; pipelining sends many commands without waiting for each reply.
quiz_hint: There is one queue of commands. What happens to everyone else while one of them runs?
quiz:
  - q: An engineer runs KEYS user:* on a production instance with 50 million keys. What happens?
    options:
      - It runs in the background
      - Every other client waits until it has scanned all 50 million keys, so latency spikes for everyone
      - Redis refuses the command
    answer: 1
    explain: Commands run one at a time on the main thread. The latency documentation calls KEYS in production a very common source of latency; use SCAN, which iterates in small steps.
  - q: Two clients run INCR counter at the same moment. Can an increment be lost?
    options:
      - Yes, without a lock
      - No; each INCR runs to completion before the next command starts
      - Only on replicas
    answer: 1
    explain: Single-threaded execution makes every individual command atomic. Atomicity across several commands needs MULTI/EXEC or a script.
  - q: A service does 1,000 GETs per request, each waiting for its reply. What is the cheapest big improvement?
    options: [More Redis CPU cores, "Pipelining, or a multi-key command such as MGET, to cut round trips", Persisting to SSD]
    answer: 1
    explain: Each round trip costs network latency, often far more than executing the command. Pipelining sends commands in a batch and reads the replies together.
links:
  - title: Diagnosing latency issues (Redis docs)
    url: https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/
  - title: Pipelining (Redis docs)
    url: https://redis.io/docs/latest/develop/using-commands/pipelining/
  - title: Redis FAQ (Redis docs)
    url: https://redis.io/docs/latest/develop/get-started/faq/
  - title: SCAN (Redis docs)
    url: https://redis.io/docs/latest/commands/scan/
---
Redis keeps its whole dataset in memory and serves every client from a single event loop. Requests arrive on many connections; the loop reads whichever sockets are ready, executes one command at a time, and writes the replies. Because nothing else touches the data while a command runs, there are no locks, no lock contention and no partial updates: every single command is atomic. Most commands finish in microseconds, so one thread is enough for a very large number of operations per second.

## Mostly single-threaded

"Single-threaded" describes command execution, not the whole process. Redis uses background threads for things like closing files and freeing large values (`UNLINK` frees memory off the main thread, unlike `DEL`), and forks a child process for snapshots. Since Redis 6 it can also use I/O threads (`io-threads`, off by default) to read and write sockets in parallel; the commands themselves still run one at a time. To use many cores for commands, you run several Redis processes, or a cluster.

## The trap: one slow command

The flip side of one command at a time is that a slow command stops everyone. Commands are not all O(1):

```text
KEYS user:*            # walks every key in the database; debugging only
SMEMBERS big:set       # returns every member; fine for 50, not for 5 million
DEL huge:hash          # frees every field on the main thread; UNLINK does it in the background
LRANGE log 0 -1        # the whole list
```

While one of these runs, every other client's command waits. The usual fixes: `SCAN` (and `HSCAN`, `SSCAN`, `ZSCAN`) iterate with a cursor in small batches; `UNLINK` instead of `DEL` for large keys; keep collections bounded; keep Lua scripts short. The slow log records commands over a threshold:

```text
CONFIG SET slowlog-log-slower-than 10000     # microseconds
SLOWLOG GET 10
```

Snapshotting has a similar effect: `fork()` of a process with a large memory footprint can pause the main thread for milliseconds or more.

## Round trips cost more than commands

A command that takes a microsecond on the server may take half a millisecond or more to travel over the network and back. A loop of 1,000 `GET`s, each waiting for its reply, spends almost all its time waiting. Two fixes:

- **Multi-key commands**: `MGET k1 k2 k3`, `HMGET`, `MSET`.
- **Pipelining**: the client writes many commands without waiting, then reads all the replies. Redis executes them in order; other clients' commands may run in between, so a pipeline is not a transaction.

```sh
# Send three commands in one go from the shell; --pipe reports a summary, not each reply
printf 'SET a 1\r\nINCR a\r\nGET a\r\n' | redis-cli --pipe
# All data transferred. Waiting for the last reply...
# Last reply received from server.
# errors: 0, replies: 3
```

In application code, client libraries expose pipelines directly (a `pipeline()` or batch object that queues commands and sends them together).

## What this means for design

Keep values and collections at sizes where each command is cheap. Prefer commands that do the work on the server (`INCR`, `ZADD`, `HINCRBY`) over reading, changing and writing back from the client. And treat Redis as a shared resource: one service running an expensive command can slow down every other service using the same instance.
