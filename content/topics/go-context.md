---
id: go-context
title: "context: cancellation and deadlines"
summary: One value that tells a whole call tree when to stop
why: "When a client disconnects or a deadline passes, every goroutine and outbound call working on that request should stop. context is the standard way to say so, and every network library accepts one."
requires: [go-channels]
lesson: none
points:
  - title: A tree of contexts
    text: Each request gets a context; WithCancel, WithTimeout and WithDeadline derive children. Cancelling a parent cancels all of its children.
  - title: Done is a channel
    text: ctx.Done() is closed on cancellation, so it fits in a select. ctx.Err() then says why, Canceled or DeadlineExceeded.
  - title: Always call cancel
    text: The cancel function releases the child's timer and its link to the parent. Defer it right away; go vet reports when you forget.
  - title: First parameter, never a field
    text: Pass ctx explicitly as the first argument of each function that needs it, rather than storing it in a struct.
quiz:
  - q: "A handler derives ctx with a 2-second timeout and passes it to three calls in a row. The first takes 1.5 s. How long does the second have?"
    options:
      - 2 seconds
      - About 0.5 seconds, because the deadline is shared
      - Unlimited
    answer: 1
    explain: "A deadline is a point in time, not a duration per call. Everything using that context shares what is left, which is how a deadline travels through a call tree."
  - q: "What does ctx.Err() return after context.WithTimeout's deadline has passed?"
    options:
      - nil
      - context.Canceled
      - context.DeadlineExceeded
    answer: 2
    explain: "Err is nil while the context is live. It becomes DeadlineExceeded when the deadline passes and Canceled when cancel is called or a parent is cancelled."
  - q: "Which is the right way to make a goroutine stop when its context is cancelled?"
    options:
      - Check a global boolean in a loop
      - "select on ctx.Done() alongside the channel or call it is waiting on, and return ctx.Err()"
      - Call runtime.Goexit from the parent
    answer: 1
    explain: "Cancellation is cooperative. Nothing kills a goroutine from outside; the code has to watch Done and return."
links:
  - title: "Go concurrency patterns: Context (Go blog)"
    url: https://go.dev/blog/context
  - title: "context package documentation"
    url: https://pkg.go.dev/context
  - title: "Go concurrency patterns: pipelines and cancellation"
    url: https://go.dev/blog/pipelines
---
A `context.Context` carries a cancellation signal, an optional deadline and a few request-scoped values across API boundaries and goroutines. A server creates one per request; each function passes it to the functions it calls; and when the request is abandoned, because the client went away, a deadline passed or a sibling failed, every piece of work using that context can see it and stop. Nothing is stopped by force: cancellation is a signal that code has to check.

## Deriving and cancelling

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"time"
)

func fetch(ctx context.Context) (string, error) {
	select {
	case <-time.After(200 * time.Millisecond): // pretend this is a slow call
		return "data", nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel() // always release the timer and children

	_, err := fetch(ctx)
	fmt.Println(err)
	fmt.Println(errors.Is(err, context.DeadlineExceeded))

	parent, stop := context.WithCancel(context.Background())
	child, cancelChild := context.WithTimeout(parent, time.Hour)
	defer cancelChild()
	stop() // cancelling the parent cancels every child
	<-child.Done()
	fmt.Println(child.Err())
}
```

It prints `context deadline exceeded`, `true` and `context canceled`.

- `context.Background()` is the root, for `main`, tests and start-up. In a server, use `r.Context()` from the request instead; `net/http` cancels it when the client disconnects or the handler returns.
- A child can only shorten its parent's deadline, never extend it. A one-hour timeout under a parent with 50 ms left still ends in 50 ms.
- `Done()` returns a channel that is closed on cancellation, so a `select` can wait on it next to real work. After it is closed, `Err()` returns `context.Canceled` or `context.DeadlineExceeded`.
- Calling the cancel function releases resources. Forgetting it leaks the child until the parent ends; `go vet`'s `lostcancel` check catches most cases.

## Using it well

- Take `ctx context.Context` as the **first parameter**, and don't store it in a struct: a context belongs to one operation.
- Pass it to everything that can block: `http.NewRequestWithContext`, `db.QueryContext`, gRPC calls. Those libraries close connections or abort queries when it is cancelled.
- Set **one deadline at the edge** (when the request arrives, or before a batch job's call) and let it flow down. Per-call timeouts deeper in should only make it shorter.
- In a loop that does work in steps, check `ctx.Err()` between steps, or `select` on `ctx.Done()` next to each blocking send, so a cancelled job stops within one step rather than running to the end.
- `errgroup.WithContext` (in `golang.org/x/sync/errgroup`) runs several goroutines and cancels their shared context as soon as one returns an error: the usual way to fan out calls and fail fast.
- `context.WithValue` is for request-scoped data that crosses API boundaries, such as a trace ID. It is not a way to pass optional parameters.

Newer helpers: `WithCancelCause` and `context.Cause` (Go 1.20) record *why* something was cancelled; `WithoutCancel` (Go 1.21) keeps values but drops cancellation, useful for clean-up that must finish after the request ends; `AfterFunc` (Go 1.21) runs a function when a context is done.
