---
id: graphql-security
title: "Query cost, depth limits and introspection"
summary: Decide what a query may cost before you run it
why: "The client chooses the shape of the work. Without limits, one short query can ask for millions of objects, and a public schema explorer hands attackers a map. Demand control is what makes a GraphQL endpoint safe to expose."
requires: [graphql-n-plus-one, graphql-pagination]
lesson: none
points:
  - title: Limit depth and breadth
    text: "Cap how deeply fields may nest, and how many fields, aliases and operations one request may contain."
  - title: Estimate cost first
    text: "Before execution, add up the objects a query could fetch, multiplying through list sizes. Reject queries over a budget, and rate-limit by cost, not by request count."
  - title: Trusted documents for your own apps
    text: "If only your clients call the API, register their operations at build time and execute only those hashes."
  - title: Introspection and errors in production
    text: "Disabling introspection and masking error details are common for private APIs. They reduce what you reveal, but they are not a substitute for limits and authorisation."
quiz:
  - q: "Which query is the most dangerous to an unprotected server?"
    code: |
      # A
      { me { name } }
      # B
      { posts(first: 100) { comments(first: 100) { author { posts(first: 100) { title } } } } }
      # C
      { a: me { name } b: me { name } }
    options: ["A", "B: list sizes multiply, so it can touch about a million objects", "C"]
    answer: 1
    explain: "Depth alone isn't the measure; each list multiplies the work of everything below it. 100 × 100 × 100 posts, before counting authors. Batching doesn't help: it reduces round trips, not objects."
  - q: "Your API serves only your web and mobile apps. Which control closes off arbitrary queries completely?"
    options: ["Disabling introspection", "Trusted documents: only operations registered at build time may run", "A depth limit of 10"]
    answer: 1
    explain: "Hiding the schema doesn't stop someone guessing fields or reading them from your app's bundle. An allowlist executes only known operations; it doesn't suit public APIs, where cost analysis does the job."
  - q: "Why limit the number of aliases in one request?"
    options: ["Aliases are deprecated", "Aliases let one request run the same expensive field hundreds of times, or try many passwords in one call", "They break caching"]
    answer: 1
    explain: "`a1: login(...) a2: login(...) ...` turns one HTTP request into hundreds of attempts, slipping past rate limits counted per request."
links:
  - { title: "Security (graphql.org)", url: "https://graphql.org/learn/security/" }
  - { title: "Introspection (graphql.org)", url: "https://graphql.org/learn/introspection/" }
  - { title: "Performance (graphql.org)", url: "https://graphql.org/learn/performance/" }
---
In REST, the server decides how much work an endpoint does. In GraphQL, the client does: it chooses how deep to nest, how many items each list returns, and how many times to repeat a field under different aliases. Most GraphQL-specific attacks are therefore about demand: queries cheap to send and expensive to answer. The defence is to look at a query **after validation and before execution**, estimate its cost, and refuse it if it is over budget, combined with the usual API controls: authentication, timeouts, rate limits and careful error messages.

## Estimating cost before execution

```js run
// Depth and estimated cost of a query before running it.
// A selection is { field: true } or { field: { args, select } }.
const query = {
  posts: { args: { first: 50 }, select: {
    title: true,
    comments: { args: { first: 20 }, select: {
      body: true,
      author: { select: { name: true } },
    } },
  } },
}

function analyse(selection, multiplier = 1, depth = 1) {
  let cost = 0
  let maxDepth = depth
  for (const field of Object.values(selection)) {
    if (field === true) continue                       // scalars: free in this model
    const items = field.args?.first ?? 1               // a list multiplies everything below it
    cost += multiplier * items                         // one unit per object fetched
    const sub = analyse(field.select, multiplier * items, depth + 1)
    cost += sub.cost
    maxDepth = Math.max(maxDepth, sub.maxDepth)
  }
  return { cost, maxDepth }
}

const limits = { maxDepth: 5, maxCost: 5000 }
for (const [label, q] of [["feed page", query], ["same with first: 500", { posts: { ...query.posts, args: { first: 500 } } }]]) {
  const { cost, maxDepth } = analyse(q)
  const verdict = maxDepth > limits.maxDepth || cost > limits.maxCost ? "reject before execution" : "run"
  console.log(`${label}: depth ${maxDepth}, cost ${cost} -> ${verdict}`)
}
```

Real cost analysers work on the parsed document, use the schema to know which fields are lists, read page sizes from arguments or variables, and let you weight expensive fields (a search, a call to a slow service) more than cheap ones. The same number can drive rate limiting: give each client a cost budget per minute instead of a request count, and report the cost in `extensions` so client developers can see it.

## The other limits

- **Paginate every list** and enforce a maximum page size. Without that, cost analysis has nothing to multiply.
- **Depth**: cap nesting, with a smaller cap for nested lists. Schemas with cycles (`user.friends.friends...`) need it most.
- **Breadth and batching**: cap fields and aliases per request, and the number of operations if your server accepts batched requests. Aliases can multiply a login mutation into hundreds of password guesses in one request.
- **Timeouts and cancellation** at the HTTP and resolver levels, so a query that slips through doesn't run forever.

## Trusted documents

For APIs used only by your own apps, the strongest control is an allowlist. At build time, the client's operations are extracted, hashed and registered with the server; at runtime the client sends the hash and the server runs only documents it knows. Arbitrary queries become impossible, and requests get smaller and cacheable as a bonus. Public APIs can't do this, because they can't know their clients' queries in advance, so they rely on cost limits.

## Introspection and error detail

Introspection lets anyone download the full schema. For private APIs it is common to disable it in production and keep it in development and for tooling. Similarly, mask internal error messages and stack traces, and disable "did you mean…" field suggestions, which can reveal the schema piece by piece. None of these replace authorisation and limits: a determined client can recover most of a schema from your app's network traffic.
