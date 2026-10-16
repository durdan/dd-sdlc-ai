---
id: dotnet-async-context
title: "SynchronizationContext, ConfigureAwait and ValueTask"
summary: Where code resumes after an await, and when to skip the Task allocation
why: "The classic .Result deadlock, the advice to sprinkle ConfigureAwait(false), and ValueTask's sharp edges all come from the same few rules."
requires: [dotnet-async]
lesson: none
points:
  - title: await captures a context
    text: "By default the continuation is posted back to the current SynchronizationContext (a UI thread, for example) or TaskScheduler, if there is one."
  - title: ASP.NET Core has none
    text: "Console apps and ASP.NET Core don't install a SynchronizationContext, so continuations run on the thread pool either way."
  - title: ConfigureAwait(false) in libraries
    text: "General-purpose library code shouldn't care where it resumes, so it opts out of the context. App code that needs the UI thread doesn't."
  - title: ValueTask is for hot paths
    text: "It avoids allocating a Task when a result is often available synchronously, but may be awaited only once."
quiz:
  - q: A WPF button handler calls `var s = LoadAsync().Result;` and `LoadAsync` contains `await http.GetStringAsync(url);`. Why does the window freeze forever?
    options:
      - "HttpClient can't be used from a UI thread"
      - "The await wants to resume on the UI thread, which is blocked in .Result waiting for LoadAsync to finish"
      - "The request has no timeout"
    answer: 1
    explain: "Each side waits for the other. Await the call in an async handler instead; ConfigureAwait(false) inside LoadAsync also breaks the cycle, but blocking a UI thread is still a bug."
  - q: "In an ASP.NET Core controller, what does adding .ConfigureAwait(false) to every await change?"
    options:
      - "It prevents deadlocks that would otherwise happen"
      - "Practically nothing, because ASP.NET Core has no SynchronizationContext to return to"
      - "It makes the requests run in parallel"
    answer: 1
    explain: "Classic ASP.NET on .NET Framework had a request context; ASP.NET Core doesn't. ConfigureAwait(false) still matters in libraries that might be called from UI apps."
  - q: Which use of a ValueTask<T> is safe?
    options:
      - "Awaiting it twice to read the result again"
      - "Awaiting it exactly once, directly"
      - "Storing it and awaiting it from two tasks at once"
    answer: 1
    explain: "A ValueTask may wrap a pooled object that is reused once you have consumed it. If you need to await more than once or concurrently, call .AsTask() once and use the Task."
links:
  - { title: "ConfigureAwait FAQ (.NET Blog)", url: "https://devblogs.microsoft.com/dotnet/configureawait-faq/" }
  - { title: "Understanding the whys, whats and whens of ValueTask (.NET Blog)", url: "https://devblogs.microsoft.com/dotnet/understanding-the-whys-whats-and-whens-of-valuetask/" }
  - { title: "SynchronizationContext class (.NET API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.synchronizationcontext" }
---
When an `await` has to suspend, it needs to decide where the rest of the method should run when the awaited work completes. The default is to go back to where it came from: if the current thread has a `SynchronizationContext` (WinForms, WPF, MAUI and classic ASP.NET install one), the continuation is posted to it; otherwise it runs on the thread pool. That default is what makes UI code safe to write, and what makes blocking on async code deadlock.

## The deadlock

```csharp
// WPF or WinForms: this freezes the window
void Button_Click(object sender, EventArgs e)
{
    string html = LoadAsync().Result;     // blocks the UI thread
    label.Text = html;
}

async Task<string> LoadAsync()
{
    string s = await http.GetStringAsync(url);   // wants to resume on the UI thread
    return s.ToUpperInvariant();
}
```

The UI thread is blocked inside `.Result`, waiting for `LoadAsync`. When the download finishes, the continuation is posted to the UI thread's queue, which nobody is processing. Neither can proceed. The fix is to make the handler `async void` (event handlers are the one place that is right) and `await LoadAsync()`.

ASP.NET Core and console apps have no context: in this path's .NET 10 runs, `SynchronizationContext.Current` was null in a console app and in a web app, and the ConfigureAwait FAQ confirms that ASP.NET Core doesn't install one for requests either. So this exact deadlock can't occur there, but blocking still causes thread-pool starvation, and the same library code may be called from a UI app.

## ConfigureAwait(false)

`await task.ConfigureAwait(false)` tells the await not to post back to the captured context or scheduler. Guidance from the .NET team:

- **Library code** that doesn't touch UI elements or context-bound state should use it on every await, so it works the same wherever it is called from and avoids the cost of hopping back.
- **Application code** that needs the context (updating a control after an await) must not use it.
- In ASP.NET Core app code it changes practically nothing; many teams leave it out there.

`ConfigureAwait(false)` doesn't force a thread switch: if the task has already completed, the method simply continues on the current thread.

## ValueTask

Every `async Task<T>` method that completes asynchronously allocates a `Task<T>`. When a method usually has its answer ready (a cache hit, data already in a buffer), `ValueTask<T>` can carry the result directly, with no allocation:

```csharp
static ValueTask<string> GetCachedAsync(int id) =>
    id == 1 ? ValueTask.FromResult("from cache, no Task allocated")
            : new ValueTask<string>(LoadAsync(id));
```

It can also wrap a pooled `IValueTaskSource`, which is how sockets and `System.IO.Pipelines` read without allocating per operation. The price is a set of rules: await a `ValueTask` only once, never concurrently, and don't call `.Result` before it has completed. If you need any of that, call `.AsTask()` once. `Task` stays the right default for public APIs; reach for `ValueTask` where profiling shows the allocations matter.
