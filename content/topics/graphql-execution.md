---
id: graphql-execution
title: "Resolvers and the execution model"
summary: Parse, validate, then one resolver per field, parent before child
why: "Every GraphQL performance problem and most of its security model follow from one rule: the server resolves the query field by field, passing each result down to the fields below it. See that once and N+1, auth and cost limits make sense."
requires: [graphql-operations, promises]
lesson: none
points:
  - title: Three phases
    text: "The server parses the document, validates it against the schema, and only then executes it. Errors in the first two return no `data` at all."
  - title: A function per field
    text: "Each field has a resolver `(parent, args, context, info)`. Fields without one use a default that reads the property of the same name from the parent."
  - title: Parent before child
    text: "A field's resolver runs only after its parent's value exists, and receives it as `parent`. Siblings can run concurrently."
  - title: Context is per request
    text: "The `context` object is created for each request and passed to every resolver: the place for the current user, database handles and loaders."
quiz:
  - q: "For `{ posts { author { name } } }` with 10 posts, how many times does the `Post.author` resolver run?"
    options: ["Once", "10 times, once per post", "11 times"]
    answer: 1
    explain: "Execution completes the list and runs the selection for each item, so `author` runs once per post with that post as `parent`. That is where N+1 comes from."
  - q: "`Post.title` has no resolver. What does the server return for it?"
    options: ["null", "The `title` property of the parent post object", "A validation error"]
    answer: 1
    explain: "The default resolver reads the property of the same name from the parent value (calling it if it is a function). Most fields never need a resolver."
  - q: "Where should a resolver find the logged-in user?"
    options: ["A module-level variable", "The per-request `context`, filled in by the server before execution", "A field argument the client sends"]
    answer: 1
    explain: "Module state is shared between concurrent requests, and anything the client sends can be forged. The server builds `context` from the verified request and hands it to every resolver."
links:
  - { title: "Execution (graphql.org)", url: "https://graphql.org/learn/execution/" }
  - { title: "Validation (graphql.org)", url: "https://graphql.org/learn/validation/" }
  - { title: "Execution, GraphQL specification (September 2025)", url: "https://spec.graphql.org/September2025/#sec-Execution" }
---
When a GraphQL request arrives, the server does three things in order. It **parses** the document into a syntax tree, **validates** that tree against the schema (do these fields exist, do the argument types match, are the fragments well formed), and then **executes** the chosen operation. Execution walks the selection set from the root type downwards. For each field it calls that field's resolver, gets a value, and if the field's type is an object or a list of objects, repeats the process for the sub-selection with that value as the parent. The response is assembled in the same shape as the query as those calls complete.

## Resolvers

A resolver is a function `(parent, args, context, info) => value | Promise<value>`:

- `parent`: the value the parent field resolved to (for root fields, a root value the server provides).
- `args`: the field's arguments, already coerced to their declared types.
- `context`: one object per request, shared by every resolver in it.
- `info`: the field's position in the query, its return type and the selection below it.

Most fields don't need a resolver. The default one returns `parent[fieldName]`, so if `Query.posts` returns objects with a `title` property, `Post.title` just works. You write resolvers for root fields, for relationships (`Post.author` given `authorId`), and for computed values.

## Watching it run

```js run
// A tiny executor: walks a selection tree and calls one resolver per field.
const db = {
  users: { u1: { id: "u1", name: "Ada" }, u2: { id: "u2", name: "Linus" } },
  posts: [
    { id: "p1", title: "Closures", authorId: "u1" },
    { id: "p2", title: "Kernels", authorId: "u2" },
  ],
}

const resolvers = {
  Query: {
    posts: () => db.posts,
  },
  Post: {
    author: (post) => db.users[post.authorId],   // parent -> child
  },
}

const schemaTypes = { Query: { posts: "Post" }, Post: { author: "User" }, User: {} }

async function executeFields(typeName, parent, selection, path) {
  const result = {}
  for (const [field, sub] of Object.entries(selection)) {
    const resolve = resolvers[typeName]?.[field] ?? ((obj) => obj[field])  // default resolver
    const value = await resolve(parent)
    console.log(`resolve ${typeName}.${field} at ${path.concat(field).join(".")}`)
    result[field] = sub === true ? value : await completeValue(schemaTypes[typeName][field], value, sub, path.concat(field))
  }
  return result
}

async function completeValue(typeName, value, selection, path) {
  if (value == null) return null
  if (Array.isArray(value)) return Promise.all(value.map((item, i) => completeValue(typeName, item, selection, path.concat(i))))
  return executeFields(typeName, value, selection, path)
}

// query { posts { title author { name } } }
const query = { posts: { title: true, author: { name: true } } }
executeFields("Query", null, query, []).then((data) => console.log(JSON.stringify({ data })))
```

`Post.author` runs once per post, after `Query.posts` has produced the list and with each post as its parent. `User.name` then uses the default resolver. The list items are completed concurrently, which is why the lines for the two posts interleave. A real server such as graphql-js does the same walk, plus argument coercion, abstract type resolution, error handling and null checks.

## Ordering

The spec lets a server resolve sibling fields of a query in any order, including in parallel; only top-level mutation fields must run serially. Children always wait for their parent's value. That makes the cost of a query depend on its shape: a list field multiplies the work of everything selected below it, and nothing in the execution model batches those calls for you. The next topic is about doing exactly that.
