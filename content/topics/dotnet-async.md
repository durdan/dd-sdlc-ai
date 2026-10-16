---
id: dotnet-async
title: "async/await: Task and the state machine"
summary: The compiler rewrites your method so it can pause without holding a thread
why: "A server that blocks a thread per request runs out of threads; async I/O lets a handful of threads serve thousands of requests, as long as nothing blocks them."
requires: [dotnet-types]
lesson: none
points:
  - title: A Task is a promise
    text: "Task and Task<T> represent work that will finish later, with a result or an exception, and let you register what to run next."
  - title: Synchronous until the first real wait
    text: An async method runs on the caller's thread until it awaits something that hasn't finished. Then it returns an incomplete Task to its caller.
  - title: The compiler builds a state machine
    text: "Locals become fields, each await becomes a numbered state, and the continuation calls MoveNext to resume where it left off."
  - title: Don't block on async
    text: ".Result and .Wait() tie up a thread waiting for work that may need a thread to finish. Await all the way up."
quiz:
  - q: "In a console app, what runs on the calling thread when you call `var t = Work();`?"
    code: |
      static async Task Work()
      {
          Console.WriteLine("A");
          await Task.Delay(50);
          Console.WriteLine("B");
      }
    options:
      - "Nothing: async methods always start on a thread-pool thread"
      - "Everything up to the await: it prints A, then Work returns an incomplete Task"
      - "The whole method, including B"
    answer: 1
    explain: "Calling an async method runs it synchronously until the first await of an incomplete task. In this topic's run, 'Work starts' printed on thread 1 before the caller saw IsCompleted=False."
  - q: Where do an async method's local variables live while it is waiting?
    options:
      - "On the stack of the thread that started it, which stays blocked"
      - "In fields of the compiler-generated state machine, which is moved to the heap the first time it really suspends"
      - "In thread-local storage"
    answer: 1
    explain: "In Release builds the state machine starts as a struct on the stack. On the first await that has to suspend, it is boxed onto the heap so it survives after the method returns."
  - q: "What happens to an exception thrown inside an `async Task` method?"
    options:
      - "It crashes the process immediately"
      - "It is stored in the returned Task and rethrown where the Task is awaited"
      - "It is logged and swallowed"
    answer: 1
    explain: "The state machine catches it and faults the Task. That is why async void is dangerous: there is no Task, so the exception is raised on the synchronization context or thread pool, which usually terminates the process."
links:
  - { title: "Asynchronous programming with async and await (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/" }
  - { title: "How async/await really works in C# (.NET Blog)", url: "https://devblogs.microsoft.com/dotnet/how-async-await-really-works/" }
  - { title: "Task-based asynchronous pattern (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap" }
---
`async` and `await` let you write code that waits for I/O as if it were sequential, without holding a thread while it waits. The compiler does the heavy lifting: it turns an `async` method into a state machine that can stop at each `await`, hand its thread back, and continue later on whatever thread completes the awaited work. A `Task` is the object that connects the two halves.

## What runs where

```csharp
Console.WriteLine($"main thread {Environment.CurrentManagedThreadId}");
var t = Work();
Console.WriteLine("Work returned a Task; IsCompleted=" + t.IsCompleted);
await t;
Console.WriteLine($"after await, thread {Environment.CurrentManagedThreadId}");

static async Task Work()
{
    Console.WriteLine($"Work starts synchronously on thread {Environment.CurrentManagedThreadId}");
    await Task.Delay(50);
    Console.WriteLine($"Work resumes on thread {Environment.CurrentManagedThreadId}");
}
```

In the .NET 10 console run this printed:

```
main thread 1
Work starts synchronously on thread 1
Work returned a Task; IsCompleted=False
Work resumes on thread 5
after await, thread 5
```

`Work` started on the caller's thread. At `await Task.Delay(50)` the delay wasn't finished, so `Work` registered a continuation and returned an incomplete `Task`. When the timer fired, a thread-pool thread ran the rest. A console app has no synchronization context, so nothing brings the code back to thread 1; the next topic covers when that differs. Your numbers will vary.

## The state machine

The compiler rewrites `Work` into roughly this:

```csharp
struct WorkStateMachine : IAsyncStateMachine
{
    public int state;                       // which await we are at
    public AsyncTaskMethodBuilder builder;  // creates and completes the Task
    TaskAwaiter awaiter;

    public void MoveNext()
    {
        if (state == 0) goto resume0;
        Console.WriteLine("Work starts ...");
        awaiter = Task.Delay(50).GetAwaiter();
        if (!awaiter.IsCompleted)
        {
            state = 0;
            builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);  // box, register MoveNext, return
            return;
        }
    resume0:
        awaiter.GetResult();                // rethrows if the delay faulted
        Console.WriteLine("Work resumes ...");
        builder.SetResult();                // completes the Task, runs its continuations
    }
}
```

(Simplified: the real code wraps the body in a try/catch that calls `builder.SetException`.) Locals that live across an `await` become fields. If every awaited task is already complete, the method runs straight through and nothing is allocated except, possibly, the `Task` itself. Only when it genuinely suspends is the state machine boxed onto the heap.

## Why it scales

While `Work` waits, no thread is blocked. A socket read in ASP.NET Core is registered with the operating system's I/O notification mechanism (epoll on Linux, I/O completion ports on Windows), and a thread-pool thread runs the continuation when data arrives. A few dozen threads can serve thousands of concurrent requests.

That advantage disappears if code blocks. `task.Result`, `task.Wait()` and `Thread.Sleep` inside request handling hold a pool thread hostage. Under load the pool has to inject new threads slowly, requests queue up, and latency climbs: the problem known as thread-pool starvation. Keep the chain async from the controller down to the I/O call, use `Task.WhenAll` to wait for several operations at once, and pass a `CancellationToken` all the way down so abandoned requests stop their work.

Avoid `async void` except for event handlers: there is no `Task` for the caller to await, so an exception can't be observed and typically crashes the process.
