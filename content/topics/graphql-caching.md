---
id: graphql-caching
title: "Caching behind one endpoint"
summary: Why HTTP caches struggle, and what replaces them
why: "REST gets CDN and browser caching almost for free because every resource has a URL. GraphQL sends different questions to one URL, usually as POST, so caching moves into persisted queries, the client and the server's data layer."
requires: [graphql-operations, web-http-caching]
lesson: none
points:
  - title: One URL, many answers
    text: "HTTP caches key on method and URL. A POST to `/graphql` with a body is not cached by browsers or CDNs at all."
  - title: GET plus persisted queries
    text: "Send queries as GET with a document hash instead of the full text. The URL becomes a stable, short cache key, and `Cache-Control` works again."
  - title: Normalised client caches
    text: "Clients such as Apollo, Relay and urql store each object once by type and id. A mutation that returns the updated object refreshes every screen that shows it."
  - title: Cache data, not responses
    text: "On the server, the reliable win is caching what resolvers load (per request with loaders, across requests with an application cache), whatever query asked for it."
quiz:
  - q: "Why does a CDN in front of `/graphql` usually cache nothing?"
    options: ["CDNs don't support JSON", "Requests are POSTs with the query in the body; shared caches key on method and URL, and don't store POST responses for reuse", "GraphQL disables caching headers"]
    answer: 1
    explain: "Same URL, different bodies, different answers. Unless the query and variables move into the URL (GET), there is no key for the CDN to use."
  - q: "What makes normalised caching possible on the client?"
    options: ["HTTP ETags", "A stable identity per object, usually `__typename` plus `id`", "Subscriptions"]
    answer: 1
    explain: "With an identity, two queries that return the same user share one cache entry. graphql.org recommends a globally unique `id` field for exactly this."
  - q: "One response mixes public product data and the viewer's cart. What `Cache-Control` should it get?"
    options: ["`public, max-age=3600`", "`private` (or `no-store`): a response is only as cacheable as its most personal field", "`immutable`"]
    answer: 1
    explain: "Shared caches must not serve one user's cart to another. Some servers compute the header from per-field hints, taking the shortest lifetime and the most restrictive scope."
links:
  - { title: "Caching (graphql.org)", url: "https://graphql.org/learn/caching/" }
  - { title: "Performance (graphql.org)", url: "https://graphql.org/learn/performance/" }
  - { title: "Serving over HTTP (graphql.org)", url: "https://graphql.org/learn/serving-over-http/" }
---
Caching GraphQL is harder than caching REST for one structural reason: every request goes to the same URL, and the question is in the body. Browser caches and CDNs key on method and URL and don't reuse POST responses, so out of the box they cache nothing. GraphQL is not uncacheable, though; it is as cacheable as any API with parameters. The caching just happens in different places: in the URL (GET requests with persisted query hashes), in the client (a normalised store of objects by identity), and on the server (loaders and data caches below the resolvers).

## Making HTTP caching work again

The GraphQL over HTTP draft allows `GET` for queries, with the document and variables in the query string. Long documents make long URLs, so most setups use **persisted queries**: the client sends a hash of a document the server already knows.

```text
GET /graphql?extensions={"persistedQuery":{"sha256Hash":"9f2c..."}}&variables={"id":"p1"}
Cache-Control: public, max-age=60
```

Now the URL is short and stable per query and variables, which is a key a CDN can use. When the documents are registered at build time and only those are accepted, they are called **trusted documents** and also serve as an allowlist (see the security topic). The response's `Cache-Control` must reflect its most sensitive field: if any part is per-user, the whole response is `private`. Some servers let you annotate fields with cache hints and compute the header from the fields actually selected.

## The client's normalised cache

```js run
// A tiny normalised cache: objects stored once by __typename:id, queries hold references.
const store = {}
const keyOf = (obj) => `${obj.__typename}:${obj.id}`

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === "object") {
    const fields = {}
    for (const [k, v] of Object.entries(value)) fields[k] = normalize(v)
    if (value.__typename && value.id) {
      store[keyOf(value)] = { ...store[keyOf(value)], ...fields }   // merge into the one copy
      return { __ref: keyOf(value) }
    }
    return fields
  }
  return value
}

function read(value) {
  if (Array.isArray(value)) return value.map(read)
  if (value && value.__ref) return read(store[value.__ref])
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, read(v)]))
  return value
}

// Two different queries return the same user.
const feed = normalize({ posts: [{ __typename: "Post", id: "p1", title: "Hi", author: { __typename: "User", id: "u1", name: "Ada" } }] })
const header = normalize({ me: { __typename: "User", id: "u1", name: "Ada" } })
console.log("entries:", Object.keys(store).join(", "))

// A mutation response carries the updated user; normalising it updates every query that refers to it.
normalize({ renameUser: { __typename: "User", id: "u1", name: "Ada L." } })
console.log("feed:  ", JSON.stringify(read(feed)))
console.log("header:", JSON.stringify(read(header)))
```

This is the idea behind the caches in Apollo Client, Relay and urql's graphcache: split responses into objects keyed by type and id, store each once, and rebuild query results from references. It only works if the schema gives objects stable identities, which is why graphql.org recommends a unique `id` on object types. The hard cases are lists: after `createPost`, the cache can't know which lists the new post belongs in, so the client updates them explicitly or refetches.

## On the server

Whole-response caches on the server rarely pay off, because two clients seldom send exactly the same query and variables. What does pay off is caching below the resolvers: DataLoader de-duplicates within a request, and an application cache (Redis, an in-memory LRU) in front of slow services helps every query that touches the same data, whatever its shape.
