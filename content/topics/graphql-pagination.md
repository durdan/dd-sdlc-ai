---
id: graphql-pagination
title: "Pagination with cursor connections"
summary: Edges, nodes, cursors and pageInfo
why: "Any list field without a limit is a denial-of-service waiting to happen, and offset paging skips or repeats items when data changes. The connection pattern fixes both in a shape every major client library understands."
requires: [graphql-execution, sql-pagination]
lesson: none
points:
  - title: Never return an unbounded list
    text: "List fields that can grow take `first` (and usually `after`), with a maximum the server enforces."
  - title: Cursors, not offsets
    text: "Each item carries an opaque cursor that marks its position. The next page starts `after` that cursor, so inserts and deletes don't shift it."
  - title: The connection shape
    text: "A connection has `edges` (each with a `cursor` and a `node`) and `pageInfo` (`hasNextPage`, `endCursor`, and their backward twins)."
  - title: Edges can carry data
    text: "Facts about the relationship rather than the item, such as when someone joined a team, belong on the edge type."
quiz:
  - q: "Why are cursors opaque (for example base64 strings) rather than plain row ids?"
    options: ["To save bytes", "So the server can change what a cursor encodes (an id, a sort key, a timestamp) without breaking clients", "Because GraphQL forbids integers"]
    answer: 1
    explain: "Clients should only pass cursors back, never build them. Keeping them opaque leaves the server free to switch to a compound sort key or a different store."
  - q: "A feed paged with `offset: 20, limit: 10` gets a new item at the top between two requests. What does the user see?"
    options: ["Exactly the next 10 items", "One item repeated from the previous page, because everything shifted down by one", "An error"]
    answer: 1
    explain: "Offsets count positions, and positions move. A cursor names an item, so `after` that item still means the same place."
  - q: "What should the server do with `friends(first: 100000)`?"
    options: ["Return 100000 items", "Reject or cap it at a documented maximum", "Ignore the argument"]
    answer: 1
    explain: "The argument limits work only if the server enforces a ceiling. Pagination is the first line of demand control."
links:
  - { title: "Pagination (graphql.org)", url: "https://graphql.org/learn/pagination/" }
  - { title: "Global Object Identification (graphql.org)", url: "https://graphql.org/learn/global-object-identification/" }
---
A GraphQL list field that can grow should be paginated, and the convention most APIs and client libraries use is the **connection** pattern. Instead of returning `[Post!]!`, the field returns a `PostConnection` with a list of `edges`, each holding a `node` (the item) and a `cursor` (an opaque marker for that item's position), plus a `pageInfo` object that says whether there is more and where to continue. The client asks for `first: 20`, then for `first: 20, after: <endCursor>`, and so on. Underneath, a good implementation turns the cursor into a keyset condition (`WHERE (created_at, id) < (...)`), which stays fast on deep pages.

## The shape

```graphql
type Query {
  posts(first: Int = 20, after: String, last: Int, before: String): PostConnection!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int          # optional, and can be expensive
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

```graphql
query Feed($after: String) {
  posts(first: 20, after: $after) {
    edges { cursor node { id title } }
    pageInfo { hasNextPage endCursor }
  }
}
```

`first`/`after` page forwards and `last`/`before` page backwards. The spec for this pattern grew out of Relay, but it is used well beyond Relay. Fields that describe the relationship rather than either side belong on the edge: `TeamMemberEdge.role` or `joinedAt`.

## A toy connection

```js run
// A cursor connection over a sorted list: first/after, edges, pageInfo.
const posts = Array.from({ length: 7 }, (_, i) => ({ id: `p${i + 1}`, title: `Post ${i + 1}` }))

const encode = (id) => btoa(`Post:${id}`)              // opaque to the client
const decode = (cursor) => atob(cursor).split(":")[1]

function postsConnection({ first, after }) {
  if (first > 3) throw new Error("first may be at most 3")  // a server-side cap
  const start = after ? posts.findIndex((p) => p.id === decode(after)) + 1 : 0
  const slice = posts.slice(start, start + first)
  const edges = slice.map((node) => ({ cursor: encode(node.id), node }))
  return {
    edges,
    pageInfo: {
      hasNextPage: start + first < posts.length,
      endCursor: edges.length ? edges[edges.length - 1].cursor : null,
    },
  }
}

// The client loop: ask for a page, continue after its endCursor.
let after = null
let page = 1
do {
  const { edges, pageInfo } = postsConnection({ first: 3, after })
  console.log(`page ${page++}: ${edges.map((e) => e.node.id).join(", ")}  endCursor=${pageInfo.endCursor} hasNextPage=${pageInfo.hasNextPage}`)
  after = pageInfo.hasNextPage ? pageInfo.endCursor : null
} while (after)

// Insert a post at the start while paging: cursors keep their place, offsets would not.
posts.unshift({ id: "p0", title: "New" })
console.log("after an insert, continuing from p3:", postsConnection({ first: 3, after: encode("p3") }).edges.map((e) => e.node.id).join(", "))
try { postsConnection({ first: 1000 }) } catch (e) { console.log("first: 1000 ->", e.message) }
```

The toy finds the cursor's item by scanning an array; a real server decodes the cursor into the sort key and asks the database for rows after it, using an index. It should also reject a cursor it can't decode rather than starting from the beginning.

## Choices to make

- **Maximum page size**: document it and enforce it; it is also an input to query cost limits.
- **`totalCount`**: a `COUNT(*)` over a large filtered set can cost more than the page itself. Offer it only where it is cheap, or approximate it.
- **Stable order**: cursors need a total order, so add a unique tie-breaker (usually the id) to any sort key.
- **Normalised caches** on the client merge pages by the connection's field and arguments, so keep argument names consistent across the schema.
