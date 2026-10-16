---
id: dotnet-efcore
title: "EF Core: change tracking, N+1 and migrations"
summary: An object mapper that remembers what you loaded and writes back what changed
why: "EF Core makes data access short to write; the costs it hides (one query per row, tracking thousands of entities, schema drift) show up in production."
requires: [dotnet-linq, dotnet-di]
lesson: none
points:
  - title: DbContext is a unit of work
    text: "A short-lived, scoped object: it runs queries, tracks the entities it returned, and saves their changes in one SaveChanges call."
  - title: Tracking costs memory
    text: "Every tracked entity keeps a snapshot for change detection. Read-only queries should use AsNoTracking or a projection."
  - title: N+1 is the classic trap
    text: "Loading a list and then its children one parent at a time runs one query per parent. Include, projection or split queries load them in one or two."
  - title: Migrations version the schema
    text: "Each model change becomes a migration class; apply them in deployment, preferably as a reviewed SQL script or bundle."
quiz:
  - q: "This topic loaded 3 customers with ToList(), then each customer's orders with Entry(c).Collection(x => x.Orders).Load(). How many SELECT queries ran?"
    options: ["1", "2", "4"]
    answer: 2
    explain: "One for the customers and one per customer for orders: N+1 with N = 3. With Include(c => c.Orders) the same data took one query."
  - q: You load an entity, change one property and call SaveChanges. What does EF Core send?
    options:
      - "An UPDATE of every column"
      - "An UPDATE of only the changed column, because the change tracker compared it with the snapshot taken at load time"
      - "Nothing: you must call Update() first"
    answer: 1
    explain: "Tracked entities are compared with their original values in DetectChanges. In the example, the entity's state became Modified and SaveChanges reported 1 row."
  - q: Why should a DbContext not be registered as a singleton?
    options:
      - "It isn't thread-safe and its change tracker grows with every query, so it should live for one unit of work, such as a request"
      - "Singletons can't open database connections"
      - "EF Core forbids it at compile time"
    answer: 0
    explain: "AddDbContext registers it as scoped. For singletons and background services, use IDbContextFactory<T> to create a short-lived context per operation."
links:
  - { title: "Change tracking in EF Core", url: "https://learn.microsoft.com/en-us/ef/core/change-tracking/" }
  - { title: "Loading related data (EF Core)", url: "https://learn.microsoft.com/en-us/ef/core/querying/related-data/" }
  - { title: "Efficient querying (EF Core performance)", url: "https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying" }
  - { title: "Migrations overview (EF Core)", url: "https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/" }
---
Entity Framework Core maps classes to tables and LINQ queries to SQL. The central object is the `DbContext`: you query through its `DbSet<T>` properties, it materialises rows into objects, it tracks those objects, and `SaveChanges` turns whatever you changed into `INSERT`, `UPDATE` and `DELETE` statements inside a transaction. A context is meant to be short-lived: one per request or unit of work.

## Counting queries

The example below (EF Core 10 with SQLite in memory) counts the SELECT statements EF Core logs:

```csharp
// three customers with two orders each are already saved
foreach (var c in db.Customers.ToList())
    db.Entry(c).Collection(x => x.Orders).Load();     // one query per customer
// printed: load per customer: 4 queries

var all = db.Customers.Include(c => c.Orders).ToList();
// printed: Include: 1 query, 6 orders

var totals = db.Customers
    .Select(c => new { c.Name, Sum = c.Orders.Sum(o => o.Total) })
    .ToList();
// printed: projection: 1 query, first c1=15.0
```

The first loop is the N+1 pattern: one query for the list, then one per row. With 3 customers it is 4 round trips; with 3,000 it is a slow page. The same shape appears when lazy loading is enabled (it is off by default and needs a proxies package) and a loop touches a navigation property. Two fixes:

- **Include** loads the related rows in the same query with a JOIN. For several collection navigations, a single JOIN multiplies rows (a "cartesian explosion"); `AsSplitQuery()` loads each collection with its own query instead.
- **Projection** with `Select` asks only for the columns you need. The aggregate ran in SQL, nothing was tracked, and the result was a small anonymous object. For read endpoints this is usually the best option.

## Change tracking

```csharp
var first = all[0];
first.Name = "renamed";
Console.WriteLine(db.Entry(first).State);        // Modified
Console.WriteLine(db.SaveChanges());             // 1
var untracked = db.Customers.AsNoTracking().First();
Console.WriteLine(db.Entry(untracked).State);    // Detached
```

When a tracking query returns an entity, EF Core stores a snapshot of its original values. `SaveChanges` runs `DetectChanges`, compares each tracked entity with its snapshot, and writes only the columns that differ. The cost is memory and CPU for every tracked object, so read-only queries should use `AsNoTracking()` (or `UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)` as the context default). For bulk changes, `ExecuteUpdate` and `ExecuteDelete` (EF Core 7 and later) run one SQL statement without loading entities at all.

Because the context tracks state and isn't thread-safe, `AddDbContext` registers it as scoped. Two queries started concurrently on one context throw. In background services, inject `IDbContextFactory<T>` and create a context per operation.

## Migrations

When the model changes, `dotnet ef migrations add AddOrderStatus` generates a migration class with `Up` and `Down` methods plus an updated model snapshot. Review the generated code like any other code: renaming a property can come out as drop column and add column, losing data. To apply migrations in production, prefer a reviewed artifact over calling `Database.Migrate()` at start-up from every instance: `dotnet ef migrations script --idempotent` produces SQL a DBA can run, and `dotnet ef migrations bundle` produces an executable for the deployment pipeline. `EnsureCreated`, used in the example, skips migrations entirely and is only for tests and prototypes.
