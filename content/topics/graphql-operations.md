---
id: graphql-operations
title: "Queries, mutations and subscriptions"
summary: Ask for exactly the fields you need, in the shape you want
why: "The client writes the shape of the response. Knowing what variables, fragments, aliases and the three operation types do is what lets a screen fetch everything it needs in one request, without over-fetching."
requires: [graphql-schema]
lesson: none
points:
  - title: The response mirrors the query
    text: "The client lists the fields it wants; the `data` in the response has exactly those keys, nested the same way."
  - title: Variables, not string building
    text: "Operations declare typed variables (`$id: ID!`) and the values travel separately. The document stays constant, which makes validation, caching and allowlisting possible."
  - title: Mutations run in order
    text: "Top-level mutation fields execute one after another; query fields may run in parallel. Serial is not a transaction: earlier fields stay done if a later one fails."
  - title: A subscription has one root field
    text: "Each subscription operation selects exactly one root field and receives a stream of results, usually over WebSocket or server-sent events."
quiz:
  - q: "A request contains `mutation { a: withdraw(amount: 50) { balance } b: withdraw(amount: 80) { balance } }` and the account holds 100. What happens?"
    options: ["Both run at the same time and may both succeed", "`a` finishes before `b` starts; `b` can fail with an error while `a` stays applied", "Both are rolled back if either fails"]
    answer: 1
    explain: "The spec executes top-level mutation fields serially, so there is no race between them. There is also no rollback: GraphQL has no transactions across fields."
  - q: "Why use `query Post($id: ID!) { post(id: $id) { title } }` rather than inserting the id into the query string?"
    options: ["It is required by HTTP", "The document stays the same for every id, so it can be validated once, persisted by hash and safely parameterised", "Variables are faster to parse"]
    answer: 1
    explain: "Constant documents are what make persisted queries, allowlists and query-level caching work, and they avoid injection through string concatenation."
  - q: "What does an alias do in `{ small: avatar(size: 64) big: avatar(size: 512) }`?"
    options: ["Renames the field in the schema", "Lets the same field be requested twice with different arguments, under different keys", "Caches the field"]
    answer: 1
    explain: "Without aliases, two `avatar` fields with different arguments would conflict. Aliases give each result its own key in `data`."
links:
  - { title: "Queries (graphql.org)", url: "https://graphql.org/learn/queries/" }
  - { title: "Mutations (graphql.org)", url: "https://graphql.org/learn/mutations/" }
  - { title: "Subscriptions (graphql.org)", url: "https://graphql.org/learn/subscriptions/" }
---
A GraphQL request carries a document with one or more operations, the name of the operation to run, and a map of variables. An operation is a `query` (read), a `mutation` (write, run in order) or a `subscription` (a stream of results over time). Inside it, the client writes a selection set: the fields it wants from the root type, and for each object field, the fields it wants from that object. The response's `data` has exactly that shape, so the client gets what one screen needs in a single round trip without endpoints tailored to it.

## A query with the usual tools

```graphql
query PostPage($id: ID!, $withComments: Boolean = false) {
  post(id: $id) {
    title
    author { ...AuthorBadge }
    comments(first: 20) @include(if: $withComments) {
      edges { node { body author { ...AuthorBadge } } }
    }
  }
  me { name }
}

fragment AuthorBadge on User {
  id
  name
  small: avatar(size: 64)
}
```

- **Variables** (`$id`) are declared with types and sent separately as JSON: `{ "id": "p_42", "withComments": true }`.
- **Fragments** name a reusable selection; client libraries often colocate one fragment with each component.
- **Aliases** (`small:`) rename a result key and allow the same field twice with different arguments.
- **Directives** `@include(if:)` and `@skip(if:)` drop parts of the selection based on a variable.
- On abstract types, **inline fragments** (`... on Post { title }`) select fields per concrete type, and `__typename` tells the client which one it got.

The server validates the document against the schema before running anything: unknown fields, wrong argument types or a fragment on the wrong type are rejected with no `data` at all.

## Mutations

```graphql
mutation Publish($input: CreatePostInput!) {
  createPost(input: $input) { id title publishedAt }
}
```

A mutation field returns an object like any other field, so the client can select the updated data and refresh its cache in the same round trip. When one document contains several top-level mutation fields, they run one after another in order. That prevents a race with yourself, but it is not a transaction; if the second fails, the first has already happened.

## Subscriptions

```graphql
subscription OnComment($postId: ID!) {
  commentAdded(postId: $postId) { id body author { name } }
}
```

Each subscription operation must select exactly one root field. The server keeps the request open and sends a result each time an event fires, running the selection for that event. The spec defines the semantics but not the transport; WebSockets and server-sent events are common. Subscriptions are stateful, long-lived connections, which affects scaling, load balancing and authentication in ways queries don't.

Incremental delivery with `@defer` and `@stream`, which lets one query return slow parts later, is a proposal still being worked on and not part of a published edition of the spec; some servers support experimental versions.
