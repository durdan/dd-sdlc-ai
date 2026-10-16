---
id: redis-atomic
title: "Atomic steps: MULTI/EXEC, WATCH and Lua"
summary: Several commands as one, without a rollback
why: Read-modify-write from a client races with other clients; Redis gives you queued transactions, optimistic checks and server-side scripts to close the gap.
requires: [redis-single-thread]
lesson: none
points:
  - title: MULTI/EXEC runs a batch without interruption
    text: Commands are queued, then executed one after another with no other client's command in between.
  - title: No rollback
    text: If one queued command fails at run time, the others still run; Redis does not undo them.
  - title: WATCH is optimistic locking
    text: If a watched key changes before EXEC, the transaction is not executed and EXEC returns nil, so the client retries.
  - title: Lua scripts can decide
    text: A script runs atomically on the server and can read, branch and write, which MULTI cannot.
quiz_hint: MULTI queues commands without seeing their results. Ask whether your logic needs a value read in the middle.
quiz:
  - q: "Inside MULTI you queue SET k v, LPUSH k x, INCR counter. LPUSH fails with WRONGTYPE. After EXEC, what is the state?"
    options:
      - Nothing changed; the transaction rolled back
      - k is "v" and counter was incremented; only LPUSH failed
      - EXEC refused to run anything
    answer: 1
    explain: Redis has no rollbacks. Errors detected when queuing (such as a wrong number of arguments) abort EXEC; errors at execution time affect only that command.
  - q: "Client A runs WATCH stock, reads 5, then MULTI, DECR stock, EXEC. Between A's read and EXEC, client B decrements stock. What does A's EXEC return?"
    options: ["The new value, 3", "nil; the transaction was not executed because a watched key changed", "An error"]
    answer: 1
    explain: That is check-and-set. A should re-read and try again, usually in a small retry loop.
  - q: "You need: if the lock key still holds my token, delete it. Why is GET followed by DEL from the client not safe?"
    options:
      - DEL is slow
      - The lock can expire and be taken by someone else between the GET and the DEL, so you delete their lock; a Lua script does both atomically
      - GET does not work on lock keys
    answer: 1
    explain: The comparison and the delete must happen with no other command in between. A short Lua script (or WATCH with MULTI) does that.
links:
  - title: Transactions (Redis docs)
    url: https://redis.io/docs/latest/develop/using-commands/transactions/
  - title: Scripting with Lua (Redis docs)
    url: https://redis.io/docs/latest/develop/programmability/eval-intro/
  - title: Redis functions (Redis docs)
    url: https://redis.io/docs/latest/develop/programmability/functions-intro/
---
Every Redis command is atomic on its own, but most real operations need several: move money between two balances, take an item from stock only if some is left, release a lock only if you still own it. Done as separate commands from the client, other clients' commands can interleave. Redis offers three tools: `MULTI`/`EXEC` to run a batch without interruption, `WATCH` to abort the batch if something changed, and Lua scripts for logic that must read and decide on the server.

## MULTI and EXEC

`MULTI` starts queuing; each command replies `QUEUED`; `EXEC` runs them all in order, with no other client's command in between.

```text
> SET balance:1 100
OK
> MULTI
OK
> DECRBY balance:1 30
QUEUED
> INCRBY balance:2 30
QUEUED
> EXEC
1) (integer) 70
2) (integer) 30
```

There is no rollback. A command that fails when it runs fails alone, and the rest still apply (the `OK` and `QUEUED` replies are left out here):

```text
> MULTI
> SET k v
> LPUSH k x
> INCR counter
> EXEC
1) OK
2) (error) WRONGTYPE Operation against a key holding the wrong kind of value
3) (integer) 1
```

(Errors Redis can detect while queuing, such as a misspelt command, make `EXEC` discard the whole transaction.) The Redis docs explain this as a choice for simplicity and speed; runtime errors are usually programming errors that tests should catch. `DISCARD` abandons a queued transaction.

The bigger limit: queued commands have no results yet, so you cannot read a value and decide what to write inside `MULTI`.

## WATCH: check-and-set

`WATCH` marks keys; if any of them changes before your `EXEC`, the transaction is not run and `EXEC` returns nil. Reading a value, then writing based on it, becomes safe with a retry loop:

```text
# Client A                              # Client B
> WATCH stock:sku1
> GET stock:sku1
"5"
                                        > DECR stock:sku1
                                        (integer) 4
> MULTI
> DECR stock:sku1
QUEUED
> EXEC
(nil)                                   # A's transaction did not run; re-read and retry
```

This is optimistic: no one waits, but under heavy contention on one key many attempts fail and retry.

## Lua scripts

A script runs on the server, atomically: while it runs, no other command executes. It can read, branch and write, so it handles cases `MULTI` cannot:

```text
> EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 lock:invoice:7 3f9a1c
(integer) 1
```

Pass every key the script touches in `KEYS` (not built from strings inside the script), so that Redis Cluster can route it and check that the keys share a slot. Load scripts once with `SCRIPT LOAD` and call them by hash with `EVALSHA`, or, since Redis 7, use functions (`FUNCTION LOAD`, `FCALL`), which are stored with the data and replicated.

Atomic also means blocking. A slow script stops every other client. After the busy threshold (5 seconds by default) Redis starts answering other clients with a `BUSY` error, and `SCRIPT KILL` can stop a script that has not yet written anything; one that has written can only be stopped by shutting the server down without saving. Keep scripts short and bounded.

## Which to use

- Several independent writes that should all happen together: `MULTI`/`EXEC` (or a pipeline wrapped in it).
- Read, then write based on what you read, with little contention: `WATCH` with a retry loop.
- Conditional logic, or heavy contention on one key: a Lua script or function.
