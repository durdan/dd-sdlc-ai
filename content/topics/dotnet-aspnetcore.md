---
id: dotnet-aspnetcore
title: "The ASP.NET Core request pipeline: Kestrel and middleware"
summary: Each request goes in through every middleware and back out in reverse
why: "Authentication that doesn't apply, CORS headers that never appear and exceptions that skip the error page are almost always middleware order."
requires: [dotnet-di, dotnet-async]
lesson: none
points:
  - title: Kestrel accepts the connection
    text: "The built-in, cross-platform server parses HTTP/1.1, HTTP/2 and HTTP/3 and hands an HttpContext to your pipeline."
  - title: Middleware is a chain
    text: "Each component gets the context and a next delegate. Code before await next() runs on the way in, code after it on the way out."
  - title: Order is behaviour
    text: Middleware runs in the order you add it. A component that doesn't call next short-circuits everything after it.
  - title: Routing then endpoints
    text: "UseRouting picks the endpoint; authentication and authorization run in between; the endpoint (a minimal API or controller action) runs last."
quiz:
  - q: "Middleware A then B are added, and B returns 403 without calling next. What does A see?"
    options:
      - "A never runs"
      - "A's code before next runs, then B short-circuits, then A's code after next runs with status 403"
      - "The endpoint runs anyway"
    answer: 1
    explain: "In this topic's run, /blocked printed 'A in', 'B short-circuits', 'A out 403'. The endpoint never ran."
  - q: Why must UseAuthentication come before UseAuthorization?
    options:
      - "Alphabetical order is required"
      - "Authorization checks the user that authentication has established on HttpContext.User; in the wrong order there is no user yet"
      - "Authentication is slower"
    answer: 1
    explain: "Middleware only sees what earlier middleware has done. The same reasoning puts UseExceptionHandler first, so it can catch exceptions from everything after it."
  - q: "Why is it a bug to write to the response after `await next()` once the endpoint has started sending a body?"
    options:
      - "Headers may already be on the wire, so changing them throws or is ignored"
      - "next() disposes the HttpContext"
      - "It isn't a bug; responses are always buffered"
    answer: 0
    explain: "Kestrel sends headers when the body starts. Check HttpContext.Response.HasStarted, or use Response.OnStarting to add headers in time."
links:
  - { title: "ASP.NET Core middleware (ASP.NET Core documentation)", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/" }
  - { title: "Kestrel web server in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel" }
  - { title: "Routing in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing" }
---
An ASP.NET Core app is a server plus a pipeline. The server, Kestrel, accepts connections, speaks HTTP, and turns each request into an `HttpContext`. The pipeline is a chain of middleware components, each of which can inspect the request, do some work, call the next component, and then inspect or change the response on the way back. Endpoints such as minimal API handlers and controller actions sit at the end of the chain.

## Watching the order

```csharp
#:sdk Microsoft.NET.Sdk.Web
var app = WebApplication.CreateBuilder(args).Build();

app.Use(async (context, next) =>
{
    Console.WriteLine($"A in  {context.Request.Path}");
    await next(context);
    Console.WriteLine($"A out {context.Response.StatusCode}");
});
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/blocked")
    {
        context.Response.StatusCode = 403;
        Console.WriteLine("B short-circuits");
        return;                           // next is never called
    }
    Console.WriteLine("B in");
    await next(context);
    Console.WriteLine("B out");
});
app.MapGet("/hello", () => { Console.WriteLine("endpoint"); return "hi"; });
app.Run("http://127.0.0.1:5005");
```

Requesting `/hello`, `/blocked` and `/nope` with curl, the .NET 10 app printed (framework log lines removed):

```
A in  /hello
B in
endpoint
B out
A out 200
A in  /blocked
B short-circuits
A out 403
A in  /nope
B in
B out
A out 404
```

The pipeline is nested calls, like layers of an onion: A wraps B, which wraps routing and the endpoint. `/nope` matched no endpoint, so the request fell off the end of the pipeline and the default 404 was returned on the way out.

## A typical order

```csharp
app.UseExceptionHandler("/error");   // first: catches exceptions from everything below
app.UseHsts();
app.UseHttpsRedirection();
app.UseStaticFiles();                // can short-circuit before auth for public files
app.UseRouting();                    // chooses the endpoint (added implicitly if omitted)
app.UseCors();
app.UseAuthentication();             // who are you? sets HttpContext.User
app.UseAuthorization();              // may you call this endpoint?
app.UseRateLimiter();
app.MapControllers();                // endpoints
```

Each line can only see what the lines above it have done. Put the exception handler later and exceptions from earlier middleware escape it. Put authorization before authentication and every user looks anonymous. Because routing runs before authorization, the authorization middleware can read the `[Authorize]` metadata of the endpoint that is about to run.

## Kestrel and what sits in front of it

Kestrel is a fast, cross-platform server that handles HTTP/1.1, HTTP/2 and HTTP/3 (over QUIC) and TLS. It is fine to expose directly, but production deployments often put a reverse proxy or load balancer in front (Nginx, YARP, a cloud load balancer, a Kubernetes ingress) for TLS termination, multiple apps on one port, or request buffering. Then the app sees the proxy's address, and you need the forwarded headers middleware (`UseForwardedHeaders`, early in the pipeline) to restore the original client IP and scheme.

Every request runs on a thread-pool thread without a synchronization context, so handlers should be async from top to bottom and pass `HttpContext.RequestAborted` to their I/O calls, so a client that disconnects stops the work.
