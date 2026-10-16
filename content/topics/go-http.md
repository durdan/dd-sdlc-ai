---
id: go-http
title: How net/http serves a request
summary: A goroutine per connection, a mux, and timeouts you must set
why: "Most Go services are net/http underneath, including the popular routers. Knowing its concurrency model and its defaults explains slow-client outages, leaked goroutines and how graceful shutdown works."
requires: [go-goroutines, go-context]
lesson: none
points:
  - title: One goroutine per connection
    text: Serve accepts connections in a loop and starts a goroutine for each. Your handler runs on it, so handlers must be safe to run concurrently.
  - title: ServeMux patterns since Go 1.22
    text: "Patterns can include a method and wildcards, such as GET /items/{id}. r.PathValue reads the wildcard."
  - title: Default timeouts are none
    text: A zero-value http.Server never times out a slow client. Set ReadHeaderTimeout at least, and usually read, write and idle timeouts too.
  - title: The request carries a context
    text: r.Context() is cancelled when the client disconnects or the handler returns. Pass it to every downstream call.
quiz:
  - q: "Two requests arrive at the same moment. How does net/http run your handler?"
    options:
      - One after the other, on the main goroutine
      - Concurrently, each on its connection's goroutine
      - On a fixed pool of worker threads sized by GOMAXPROCS
    answer: 1
    explain: "Each connection gets its own goroutine (HTTP/2 streams get their own too). Shared state that handlers touch needs a mutex or another form of synchronisation."
  - q: "With mux.HandleFunc(\"GET /items/{id}\", h), what does POST /items/42 return?"
    options:
      - "200, the same handler runs"
      - "405 Method Not Allowed"
      - "404 Not Found"
    answer: 1
    explain: "Since Go 1.22, a pattern with a method only matches that method (GET also matches HEAD). When the path matches but the method doesn't, the mux replies 405 with an Allow header."
  - q: "What does srv.Shutdown(ctx) do?"
    options:
      - Closes every connection immediately
      - Stops accepting, closes idle connections, and waits for active requests to finish or ctx to expire
      - Restarts the server
    answer: 1
    explain: "Graceful shutdown lets in-flight requests complete. Call it on SIGTERM with a context that has a deadline shorter than the orchestrator's kill timeout."
links:
  - title: "net/http package documentation"
    url: https://pkg.go.dev/net/http
  - title: "Routing enhancements for Go 1.22 (Go blog)"
    url: https://go.dev/blog/routing-enhancements
  - title: "Go concurrency patterns: Context (Go blog)"
    url: https://go.dev/blog/context
---
The standard library's HTTP server is small enough to understand and good enough for production. `Server.Serve` sits in a loop accepting connections and starts a new goroutine for each one; that goroutine reads requests off the connection and calls your `Handler`. Everything else, from routers to middleware, is a `Handler` wrapping another `Handler`. Because each connection has its own goroutine and the scheduler parks it while it waits on the network, a single process can hold many thousands of mostly idle connections.

## Routing with ServeMux

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /items/{id}", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "item %s\n", r.PathValue("id")) // Go 1.22+ patterns
	})

	srv := httptest.NewServer(mux) // a real listener on 127.0.0.1
	defer srv.Close()

	for _, req := range []struct{ method, path string }{
		{"GET", "/items/42"}, {"POST", "/items/42"}, {"GET", "/nope"},
	} {
		r, _ := http.NewRequest(req.method, srv.URL+req.path, nil)
		resp, err := http.DefaultClient.Do(r)
		if err != nil {
			panic(err)
		}
		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		fmt.Printf("%s %s -> %d %q\n", req.method, req.path, resp.StatusCode, body)
	}
}
```

Output: `GET /items/42 -> 200 "item 42\n"`, `POST /items/42 -> 405 "Method Not Allowed\n"` and `GET /nope -> 404 "404 page not found\n"`. Go 1.22 added methods and `{name}` wildcards to patterns (and `{path...}` for the rest of a path). When two patterns match, the more specific one wins, and conflicting registrations panic at start-up. For many services this removes the need for a third-party router.

## What a handler should know

- **It runs concurrently** with other handlers. Anything shared, such as a cache map or a counter, needs synchronisation.
- **`r.Context()`** is cancelled when the client disconnects, when an HTTP/2 stream is reset, or when `ServeHTTP` returns. Pass it to database and HTTP calls so abandoned work stops.
- **Panics are recovered** per request and logged, so one bad request doesn't kill the server. Goroutines the handler starts are not protected.
- **Always close response bodies** on the client side, as above, or connections can't be reused.

## Middleware

Because a `Handler` is just an interface with one method, middleware is a function that takes a handler and returns one: `func logging(next http.Handler) http.Handler`. It can inspect the request, call `next.ServeHTTP(w, r)`, and look at what happened afterwards. Authentication, request IDs, metrics and panic reporting are all written this way, and `r.WithContext` lets middleware attach values or a deadline for the handlers below it.

## Timeouts and shutdown

A zero `http.Server` has no timeouts, so a client that sends its headers one byte a minute keeps a goroutine and a file descriptor forever. Configure them:

```go
srv := &http.Server{
	Addr:              ":8080",
	Handler:           mux,
	ReadHeaderTimeout: 5 * time.Second,
	ReadTimeout:       30 * time.Second,
	WriteTimeout:      30 * time.Second,
	IdleTimeout:       2 * time.Minute,
}
```

For per-handler limits, `http.TimeoutHandler` wraps a handler, and `http.NewResponseController` (Go 1.20) can extend a deadline for one streaming response.

On `SIGTERM`, call `srv.Shutdown(ctx)`: it closes the listeners, closes idle connections, and waits for active requests to finish or for `ctx` to expire. `ListenAndServe` then returns `http.ErrServerClosed`, which is the normal case, not a failure. The client side has the same issue: `http.DefaultClient` has no overall timeout, so build an `http.Client` with `Timeout` or use request contexts.
