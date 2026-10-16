---
id: dotnet-di
title: Dependency injection and the generic host
summary: One container builds your objects, one host runs your app
why: "Every ASP.NET Core app, worker service and Azure Function is built on the same host and container, and most lifetime bugs are a scoped service captured by a singleton."
requires: [dotnet-async]
lesson: none
points:
  - title: Register, then resolve
    text: "You map services to implementations in IServiceCollection; the built IServiceProvider creates them and passes their dependencies to their constructors."
  - title: Three lifetimes
    text: "Singleton: one for the app. Scoped: one per scope, which is one per HTTP request in ASP.NET Core. Transient: a new one every time."
  - title: Don't capture shorter lifetimes
    text: "A singleton that takes a scoped service keeps one instance forever. Scope validation, on in Development, throws at start-up instead."
  - title: The host ties it together
    text: "Host.CreateApplicationBuilder sets up configuration, logging and DI, then runs hosted services until shutdown."
quiz:
  - q: "In one HTTP request, a controller and a repository both take an AppDbContext registered with AddDbContext. How many contexts are created?"
    options:
      - "One, shared by both, because AddDbContext registers it as scoped"
      - "Two, one each"
      - "One for the whole application"
    answer: 0
    explain: "Scoped services are created once per scope. ASP.NET Core creates a scope per request, so everything in that request shares one DbContext and one unit of work."
  - q: A singleton cache takes a scoped service in its constructor. What happens?
    options:
      - "The container creates a new scoped instance on every call"
      - "The singleton keeps the first scoped instance forever, a captive dependency; with scope validation on, building the provider throws instead"
      - "It is always a compile error"
    answer: 1
    explain: "Lifetimes are resolved once, at construction. Inject IServiceScopeFactory and create a scope when you need fresh scoped services inside a singleton or background service."
  - q: "This topic's example resolved a scoped service directly from the root provider. Why did it throw only with DOTNET_ENVIRONMENT=Development?"
    options:
      - "Scoped services don't exist in Production"
      - "The host enables ValidateScopes and ValidateOnBuild only in the Development environment by default"
      - "Development uses a different container"
    answer: 1
    explain: "In Production the same code silently created a scoped instance that lived as long as the app. Turning validation on in tests catches these bugs everywhere."
links:
  - { title: "Dependency injection in .NET (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection" }
  - { title: ".NET Generic Host (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host" }
  - { title: "Dependency injection guidelines (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines" }
---
Dependency injection in .NET means your classes ask for what they need in their constructors, and a container (`Microsoft.Extensions.DependencyInjection`) builds them. The generic host (`Microsoft.Extensions.Hosting`) is the standard way to start an app: it reads configuration, sets up logging, builds the container, starts background services, and shuts everything down cleanly on Ctrl+C or SIGTERM. ASP.NET Core, worker services and many other app models are built on it.

## Lifetimes, observed

```csharp
#:package Microsoft.Extensions.Hosting@10.0.0
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddSingleton<Clock>();
builder.Services.AddScoped<UnitOfWork>();
builder.Services.AddTransient<Handler>();
using var host = builder.Build();

for (int request = 1; request <= 2; request++)
{
    using var scope = host.Services.CreateScope();     // what ASP.NET Core does per request
    var h1 = scope.ServiceProvider.GetRequiredService<Handler>();
    var h2 = scope.ServiceProvider.GetRequiredService<Handler>();
    Console.WriteLine($"request {request}: handlers {h1.Id}/{h2.Id}, unit of work {h1.Uow.Id}/{h2.Uow.Id}, clock {h1.Clock.Id}");
}
try { host.Services.GetRequiredService<UnitOfWork>(); }
catch (InvalidOperationException e) { Console.WriteLine(e.Message); }

class Clock { public string Id { get; } = Guid.NewGuid().ToString()[..4]; }
class UnitOfWork { public string Id { get; } = Guid.NewGuid().ToString()[..4]; }
class Handler(UnitOfWork uow, Clock clock)
{
    public string Id { get; } = Guid.NewGuid().ToString()[..4];
    public UnitOfWork Uow => uow;
    public Clock Clock => clock;
}
```

Run with `DOTNET_ENVIRONMENT=Development`, it printed (ids are random):

```
request 1: handlers e103/c528, unit of work 8d12/8d12, clock e2ef
request 2: handlers 8709/8b8f, unit of work 371e/371e, clock e2ef
Cannot resolve scoped service 'UnitOfWork' from root provider.
```

Transient handlers differ every time, the scoped unit of work is shared within a request and new for the next one, and the singleton clock never changes. In the default Production environment the last line didn't appear: resolving a scoped service from the root silently returned an instance that lives as long as the app.

## Rules that prevent bugs

- **A service may depend only on services that live at least as long.** Singleton depends on singleton; scoped on scoped or singleton; transient on anything. Breaking this creates a captive dependency: a `DbContext` captured by a singleton is shared across threads, which it doesn't support.
- **Background work creates its own scopes.** A `BackgroundService` is a singleton. Inject `IServiceScopeFactory` and create a scope per unit of work.
- **Let the container dispose.** Services implementing `IDisposable` or `IAsyncDisposable` are disposed when their scope (or, for singletons, the host) ends. Don't dispose injected services yourself.
- **Prefer constructor injection.** Calling `GetService` all over the code (the service locator pattern) hides dependencies and defeats validation.

## The host

`Host.CreateApplicationBuilder` (and `WebApplication.CreateBuilder` for web apps) gives you `Configuration` layered from appsettings.json, appsettings.{Environment}.json, environment variables and the command line; `Logging` with console output; and `Services`. Classes implementing `IHostedService` are started when the host starts and stopped gracefully on SIGINT or SIGTERM (`docker stop` sends the latter), and `IHostApplicationLifetime` lets code react to start-up and shutdown. Bind settings to typed classes with the options pattern (`services.Configure<SmtpOptions>(config.GetSection("Smtp"))`, then inject `IOptions<SmtpOptions>`).
