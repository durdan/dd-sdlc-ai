---
id: graphql-n-plus-one
title: "The N+1 problem and DataLoader"
summary: One query for the list, one more per item, unless you batch
why: "Field-by-field execution makes every relationship a loop of single lookups. A page of 50 posts with authors is 51 database queries until you add batching, and it is the first thing to check when a GraphQL API is slow."
requires: [graphql-execution, microtasks]
lesson: diagram
points:
  - title: Where N+1 comes from
    text: "One resolver loads a list (1 query). A child field's resolver then runs once per item, each doing its own lookup (N queries)."
  - title: Batch within a tick
    text: "A loader collects every `load(key)` made in the same turn of the event loop, then calls your batch function once with all the keys."
  - title: Same length, same order
    text: "The batch function must return one result per key, in the order of the keys, using null or an Error for missing ones."
  - title: One loader per request
    text: "Loaders also cache by key. Create them per request in `context`, so one user's cached data never answers another user's request."
quiz:
  - q: "`{ posts(first: 50) { author { name } comments(first: 5) { author { name } } } }` with naive resolvers. Roughly how many queries?"
    options: ["About 3", "About 1 + 50 + 50 + 250 = 351", "Exactly 50"]
    answer: 1
    explain: "One for posts, 50 for post authors, 50 for comment lists, then one per comment for its author (50 times 5). Batching per field level collapses this to a handful of queries."
  - q: "Your batch function receives keys `[3, 1, 2]` and the database returns rows sorted by id, `[1, 2, 3]`. What must you do?"
    options: ["Return the rows as they are", "Reorder them to match the keys, and put null or an Error where a key had no row", "Sort the keys first"]
    answer: 1
    explain: "DataLoader matches results to keys by position. Returning rows in the database's order gives callers the wrong users, a subtle and serious bug."
  - q: "Why not create a single loader when the server starts and share it?"
    options: ["It would be slower", "Its cache would keep data across requests and users, serving stale or unauthorised results", "Loaders can't be shared between resolvers"]
    answer: 1
    explain: "A DataLoader's cache is a per-request memoisation, not an application cache. The DataLoader README recommends a new instance per request."
links:
  - { title: "DataLoader (GitHub)", url: "https://github.com/graphql/dataloader" }
  - { title: "Performance (graphql.org)", url: "https://graphql.org/learn/performance/" }
---
The N+1 problem is what you get when a list field and a relationship field meet. The list resolver does one query and returns N items; the relationship field's resolver then runs once for each item, and each call does its own lookup. Nothing is wrong with any single resolver, which is why it slips into production. The usual fix is a **loader**: an object that resolvers ask for one key at a time, which waits until the current turn of the event loop finishes, then fetches all requested keys in one batch. Facebook's DataLoader library is the reference implementation, and most GraphQL servers in any language have an equivalent.

## Seeing it

```js run
// N+1 versus batching, with a fake database that counts its queries.
const users = { u1: "Ada", u2: "Linus", u3: "Grace" }
const posts = [
  { id: "p1", authorId: "u1" }, { id: "p2", authorId: "u2" },
  { id: "p3", authorId: "u1" }, { id: "p4", authorId: "u3" },
]
let queries = 0
const db = {
  async userById(id) { queries++; console.log(`  SQL: SELECT * FROM users WHERE id = '${id}'`); return { id, name: users[id] } },
  async usersByIds(ids) { queries++; console.log(`  SQL: SELECT * FROM users WHERE id IN (${ids.map((i) => `'${i}'`).join(", ")})`); return ids.map((id) => ({ id, name: users[id] })) },
}

// A minimal loader: collect keys during this turn, load them in one batch, cache per key.
function createLoader(batchFn) {
  const cache = new Map()
  let queue = []
  return {
    load(key) {
      if (cache.has(key)) return cache.get(key)
      const promise = new Promise((resolve) => queue.push({ key, resolve }))
      cache.set(key, promise)
      if (queue.length === 1) setTimeout(async () => {
        const batch = queue
        queue = []
        const values = await batchFn(batch.map((item) => item.key))   // same order as the keys
        batch.forEach((item, i) => item.resolve(values[i]))
      }, 0)
      return promise
    },
  }
}

// query { posts { author { name } } }: Post.author runs once per post.
async function run(label, authorResolver) {
  queries = 0
  console.log(label)
  await Promise.all(posts.map((post) => authorResolver(post)))
  console.log(`  ${queries} user ${queries === 1 ? "query" : "queries"} for ${posts.length} posts\n`)
}

run("Naive resolver:", (post) => db.userById(post.authorId)).then(() => {
  const userLoader = createLoader((ids) => db.usersByIds(ids))   // one loader per request
  return run("With a loader:", (post) => userLoader.load(post.authorId))
})
```

The naive resolver asks for `u1` twice. The loader asks once, for three distinct ids, because the cache returns the same promise for a repeated key. This toy waits with `setTimeout`; DataLoader itself coalesces the loads made in one tick of the event loop (it schedules the batch after the promise jobs already queued, and lets you plug in your own scheduler), so loads made while one level of the query is being resolved end up in one batch, and the next level forms the next batch.

## Using DataLoader

```js
import DataLoader from "dataloader"

function createContext(req) {
  return {
    user: authenticate(req),
    loaders: {
      user: new DataLoader(async (ids) => {
        const rows = await sql`SELECT * FROM users WHERE id = ANY(${ids})`
        const byId = new Map(rows.map((r) => [r.id, r]))
        return ids.map((id) => byId.get(id) ?? null)   // one result per key, in key order
      }),
    },
  }
}

const resolvers = {
  Post: { author: (post, _args, ctx) => ctx.loaders.user.load(post.authorId) },
}
```

Three rules matter. The batch function returns an array of the same length as the keys, in the same order. Loaders are created per request, because their cache is request-scoped memoisation: share one across requests and users see each other's data, or stale data forever. And batching reduces round trips, not work: a query that asks for ten thousand comments still loads ten thousand comments, which is why pagination and cost limits come next.

```trace diagram
id: n-plus-one-timing
title: Four posts and their authors
subtitle: The same query without and with a DataLoader
kind: waterfall
unit: ms
lanes:
  - { id: server, label: GraphQL server, role: service }
  - { id: db, label: Database, role: data }
rows:
  - { id: naive, label: Without DataLoader, start: 0, end: 25, lane: server }
  - { id: posts-a, label: SELECT posts, start: 0, end: 12, lane: db, parent: naive }
  - { id: u1, label: SELECT user u1, start: 12, end: 23, lane: db, parent: naive }
  - { id: u2, label: SELECT user u2, start: 12, end: 24, lane: db, parent: naive }
  - { id: u1b, label: SELECT user u1 again, start: 12, end: 22, lane: db, parent: naive }
  - { id: u3, label: SELECT user u3, start: 12, end: 25, lane: db, parent: naive }
  - { id: batched, label: With DataLoader, start: 0, end: 26, lane: server }
  - { id: posts-b, label: SELECT posts, start: 0, end: 12, lane: db, parent: batched }
  - { id: collect, label: "collect keys (one turn)", start: 12, end: 13, lane: server, parent: batched }
  - { id: in, label: "SELECT users IN (u1, u2, u3)", start: 13, end: 26, lane: db, parent: batched }
steps:
  - caption: The same query, resolved two ways, for a list of four posts with their authors. The timings are illustrative.
  - caption: The posts resolver runs one query and returns four posts.
    focus: [naive, posts-a]
  - caption: Then the author field resolves once per post, and each call runs its own query. That is four more queries, one of them for an author already loaded. One plus N.
    focus: [u1, u2, u1b, u3]
  - caption: With a DataLoader, each author resolver calls load(id) instead. The loader waits until the current turn of the event loop ends, collecting the keys.
    focus: [batched, posts-b, collect]
  - caption: Then it runs one query for the three distinct ids and hands each resolver its user. Two queries in total, however long the list is.
    focus: [in]
  - caption: The time saved here is small. The query count is the point. N+1 grows with the list, and the database pays for every extra round trip.
    focus: [naive, batched]
```
