---
id: py-asyncio
title: asyncio and the event loop
summary: Thousands of waits on one thread, taking turns at await
why: Async frameworks (FastAPI, aiohttp, most modern clients) run on it, and one blocking call inside them stalls every request at once.
requires: [py-iterators, py-gil]
lesson: none
points:
  - title: Calling a coroutine runs nothing
    text: "`fetch()` on an async def only creates a coroutine object. It runs when awaited or wrapped in a task."
  - title: await is where switching happens
    text: The event loop runs one task until it awaits something not ready yet, then runs another. There is no pre-emption.
  - title: Never block the loop
    text: A time.sleep, a synchronous HTTP call or a long computation inside a coroutine freezes every other task.
  - title: Pick the right tool
    text: asyncio for many concurrent waits, threads for blocking libraries, processes for CPU-bound work.
quiz_hint: Find the awaits. Between two of them, a task has the thread to itself.
quiz:
  - q: "Inside an async function you call `time.sleep(1)` instead of `await asyncio.sleep(1)`. What happens to the other tasks?"
    options: [They keep running; asyncio patches time.sleep, "They all stop for a second, because the loop's only thread is stuck in your call", Only tasks created after it stop]
    answer: 1
    explain: The event loop can only switch at an await. A blocking call holds the thread, so no other task, timer or I/O callback runs until it returns. Use the async version or asyncio.to_thread.
  - q: What does `asyncio.TaskGroup` give you over firing tasks with create_task and forgetting them?
    options:
      - Tasks run in parallel on several cores
      - The async with block waits for all tasks, and if one fails the others are cancelled and the errors are raised together as an ExceptionGroup
      - Nothing; it is an alias
    answer: 1
    explain: Structured concurrency. No task outlives the block, failures are not silently lost, and the docs also warn that a task you hold no reference to can be garbage collected mid-flight.
  - q: You need to resize 10,000 images (pure CPU work) as fast as possible. Which is the best fit on a standard CPython build?
    options: ["asyncio.gather of 10,000 coroutines", A ThreadPoolExecutor, A ProcessPoolExecutor]
    answer: 2
    explain: asyncio and threads both share one GIL, so CPU-bound Python code doesn't run in parallel. Processes each have their own interpreter. (Libraries that release the GIL, like Pillow for many operations, change this.)
links:
  - { title: "asyncio: coroutines and tasks (Python docs)", url: "https://docs.python.org/3/library/asyncio-task.html" }
  - { title: "asyncio event loop (Python docs)", url: "https://docs.python.org/3/library/asyncio-eventloop.html" }
  - { title: "Developing with asyncio (Python docs)", url: "https://docs.python.org/3/library/asyncio-dev.html" }
  - { title: "concurrent.futures (Python docs)", url: "https://docs.python.org/3/library/concurrent.futures.html" }
---
asyncio runs many tasks on a single thread by having them take turns. Each task is a coroutine, a function defined with `async def` that can pause at `await`. When a task awaits something that isn't ready yet, such as a network reply or a timer, the event loop parks it and resumes another task that can make progress. Nothing runs in parallel. The win is that a single thread can keep thousands of slow conversations going without a thread per connection.

## Coroutines, tasks and the loop

```python
import asyncio
import time

async def fetch(name, delay):
    await asyncio.sleep(delay)   # stands in for a network call
    print("done", name)
    return name

async def main():
    start = time.perf_counter()
    async with asyncio.TaskGroup() as tg:
        a = tg.create_task(fetch("a", 0.2))
        b = tg.create_task(fetch("b", 0.1))
    print(a.result(), b.result(), f"{time.perf_counter() - start:.1f}s")

asyncio.run(main())
# done b
# done a
# a b 0.2s
```

Calling `fetch("a", 0.2)` only creates a coroutine object; nothing has run. `create_task` hands it to the loop to run concurrently, and `asyncio.run` creates the loop, runs `main` to completion and closes it. Both sleeps overlap, so the total is 0.2 s, not 0.3 s. The loop itself is a scheduler around the operating system's I/O readiness API (epoll, kqueue, or IOCP on Windows): it runs ready callbacks, asks the OS which sockets have data, and wakes the tasks waiting on them.

`TaskGroup` (3.11+) is the structured way to run tasks: the `async with` block waits for all of them, and if one raises, the rest are cancelled and the failures come out together as an `ExceptionGroup`. `asyncio.gather` is the older alternative. If you do use bare `create_task`, keep a reference to the task; the event loop only holds a weak one.

## The one rule: don't block the loop

The loop can only switch tasks at an `await`. Any call that blocks the thread, such as `time.sleep`, `requests.get`, a synchronous database driver or a long computation, stops every task:

```python
async def tick():
    for _ in range(3):
        await asyncio.sleep(0.1)

async def blocking():
    start = time.perf_counter()
    t = asyncio.create_task(tick())
    time.sleep(0.3)          # blocks the loop: tick cannot run
    await t
    print(f"blocked: {time.perf_counter() - start:.1f}s")    # blocked: 0.6s

    start = time.perf_counter()
    t = asyncio.create_task(tick())
    await asyncio.to_thread(time.sleep, 0.3)
    await t
    print(f"to_thread: {time.perf_counter() - start:.1f}s")  # to_thread: 0.3s

asyncio.run(blocking())
```

The ticks only started after the blocking sleep, so the work took twice as long. `asyncio.to_thread` runs a blocking function in a worker thread and gives you something to await, so the loop stays free. Running with `PYTHONASYNCIODEBUG=1` (or `asyncio.run(main(), debug=True)`) logs callbacks that hold the loop for more than 100 ms.

Every wait should also have a limit. `async with asyncio.timeout(5):` (3.11+) cancels the block and raises `TimeoutError` when the time is up.

## asyncio, threads or processes

- **asyncio**: many concurrent waits (sockets, HTTP, websockets) with libraries that are async all the way down. Lowest cost per connection, cooperative switching, and switch points you can see.
- **Threads**: blocking libraries you can't replace, and a modest number of concurrent waits. The OS switches threads at any moment, so shared state needs locks.
- **Processes**: CPU-bound Python work. Each process has its own interpreter and GIL, at the price of start-up time and copying data between processes.

They combine: an async server can hand CPU work to a `ProcessPoolExecutor` with `loop.run_in_executor`, and blocking calls to threads with `asyncio.to_thread`.
