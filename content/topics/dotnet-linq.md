---
id: dotnet-linq
title: "LINQ: deferred execution, IEnumerable vs IQueryable"
summary: A query is a recipe, run each time you enumerate it
why: "Most LINQ surprises (double database calls, queries that see later changes, filters that ran in memory instead of SQL) come from not knowing when and where a query runs."
requires: [dotnet-generics]
lesson: none
points:
  - title: Deferred
    text: "Where, Select, OrderBy and friends build a query object. Nothing runs until you enumerate it with foreach, ToList, Count or First."
  - title: Re-run on every enumeration
    text: Enumerating the same query twice runs it twice and sees the source as it is at that moment. Materialise with ToList when you need a snapshot.
  - title: Delegates or expression trees
    text: "On IEnumerable<T>, lambdas are compiled delegates run in memory. On IQueryable<T>, they are expression trees a provider translates, for example into SQL."
  - title: Watch the boundary
    text: "Calling AsEnumerable, ToList or a method the provider can't translate moves the rest of the query into memory."
quiz:
  - q: What does this print?
    code: |
      var numbers = new List<int> { 1, 2, 3 };
      var evens = numbers.Where(n => n % 2 == 0);
      numbers.Add(4);
      Console.WriteLine(evens.Count());
    options: ["1", "2", "It throws"]
    answer: 1
    explain: "Where only stores the source and the predicate. Count() runs the filter over the list as it is then, which includes 4, so the evens are 2 and 4."
  - q: "`IQueryable<Order> q = db.Orders.Where(o => o.Total > 100);` What is `o => o.Total > 100` here?"
    options:
      - "A compiled delegate that EF Core calls once per row in memory"
      - "An expression tree that EF Core translates into a SQL WHERE clause"
      - "A string of SQL"
    answer: 1
    explain: "Queryable.Where takes Expression<Func<T, bool>>, so the compiler builds a data structure describing the lambda, and the provider turns it into SQL."
  - q: A method takes `IEnumerable<Order>` and you pass it an EF Core DbSet. The method calls `.Where(o => o.Total > 100).ToList()`. Where does the filter run?
    options:
      - "In the database"
      - "In memory, after every order has been loaded"
      - "It depends on the order count"
    answer: 1
    explain: "The static type decides which Where is called. Through IEnumerable, Enumerable.Where is chosen, which enumerates the whole table and filters in C#. Keep the parameter IQueryable<T> if filtering should reach the database."
links:
  - { title: "Language Integrated Query overview (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/" }
  - { title: "Deferred execution and lazy evaluation (.NET documentation)", url: "https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation" }
  - { title: "IQueryable<T> interface (.NET API)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.linq.iqueryable-1" }
  - { title: "Expression trees (C# guide)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/" }
---
LINQ is a set of extension methods (`Where`, `Select`, `OrderBy`, `GroupBy`, `Join` and many more) plus an optional query syntax, over any `IEnumerable<T>`. Most of the operators don't produce results when called. They return an object that remembers its source and what to do, and the work happens when something enumerates that object. Knowing when that is, and whether the work runs in your process or in a database, explains nearly every LINQ bug.

## Deferred execution

```csharp
var numbers = new List<int> { 1, 2, 3 };
int calls = 0;
var evens = numbers.Where(n => { calls++; return n % 2 == 0; });
Console.WriteLine($"after Where: {calls} calls");
numbers.Add(4);
Console.WriteLine($"count: {evens.Count()}, calls: {calls}");
Console.WriteLine($"count: {evens.Count()}, calls: {calls}");
var snapshot = evens.ToList();
numbers.Add(6);
Console.WriteLine($"snapshot: {snapshot.Count}, live: {evens.Count()}");
```

On .NET 10 this printed:

```
after Where: 0 calls
count: 2, calls: 4
count: 2, calls: 8
snapshot: 2, live: 3
```

`Where` ran the predicate zero times. Each `Count()` ran it over all four elements again. `ToList()` captured a snapshot that later changes don't affect. The operators also stream: `Where` and `Select` pass elements on one at a time, so `First()` stops at the first match. Some operators, such as `OrderBy`, `GroupBy` and `Reverse`, must read the whole source before producing the first result.

The rule of thumb: if you'll enumerate a query more than once, or the source may change, call `ToList()` or `ToArray()` once and reuse the result. Return `IReadOnlyList<T>` from methods that have already done the work, so callers don't need to wonder.

## Two kinds of lambdas

There are two sets of LINQ methods with the same names:

- `Enumerable.Where(this IEnumerable<T>, Func<T, bool>)`: the lambda compiles to a delegate, and LINQ to Objects calls it for each element in memory.
- `Queryable.Where(this IQueryable<T>, Expression<Func<T, bool>>)`: the compiler builds an **expression tree**, a data structure describing the lambda. The query provider (EF Core, for example) reads the tree and translates it, into SQL in EF Core's case.

The compiler picks one by the **static type** of the source. A `DbSet<Order>` is an `IQueryable<Order>`, so `db.Orders.Where(o => o.Total > 100)` becomes `WHERE "Total" > 100`. Pass the same DbSet to a method whose parameter is `IEnumerable<Order>` and the same-looking `Where` becomes `Enumerable.Where`: EF Core loads every row and the filter runs in C#.

Since EF Core 3.0, a query whose filter can't be translated (because it calls one of your own C# methods, for instance) throws rather than silently evaluating on the client, except in the final `Select`, where untranslatable parts are run in memory on the results. If you really want to continue in memory, say so with `AsEnumerable()` after the parts the database should do.

## Performance notes

LINQ to Objects allocates enumerators and delegates, and lambdas that capture variables allocate a closure. In hot loops that matters; in most code it doesn't. Each recent release has made common operators faster, and the runtime team publishes the numbers every year in its performance blog posts.
