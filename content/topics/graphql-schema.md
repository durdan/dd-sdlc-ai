---
id: graphql-schema
title: "Schema and types"
summary: Every field typed, every type named, nullable unless marked
why: "The schema is the whole contract between client and server: what can be asked, what each answer looks like, and where null can appear. Tools, validation, documentation and code generation all start from it."
lesson: none
points:
  - title: Object types and fields
    text: "A schema is a set of named types. Object types have fields; each field has a type and may take arguments."
  - title: Three roots
    text: "`Query`, `Mutation` and `Subscription` are the entry points. Every operation starts at one of them."
  - title: Nullable by default
    text: "A field can return null unless its type ends in `!`. `[Post!]!` is a list that is never null and never contains null."
  - title: Abstract types
    text: "Interfaces and unions let a field return one of several object types; the client asks which with `__typename` and fragments."
quiz:
  - q: "What can `tags: [String]!` return?"
    options: ["Only a list of non-null strings", "A list that is never null itself, but whose items may be null", "Null or a list"]
    answer: 1
    explain: "The `!` after the brackets applies to the list. Items are `String`, which is nullable. `[String!]!` would forbid null items too."
  - q: "Why are fields nullable by default in GraphQL?"
    options: ["For backwards compatibility with JSON", "So one failing field can be returned as null with an error instead of failing its whole parent", "Because the spec has no non-null types"]
    answer: 1
    explain: "A nullable field is a place where a partial result can stop. Non-null is a promise; if it's broken, the null spreads to the nearest nullable parent."
  - q: "Which type should a mutation take for a large set of fields to create a user?"
    options: ["The `User` object type", "An input object type such as `CreateUserInput`", "A `String` containing JSON"]
    answer: 1
    explain: "Arguments can only use input types (scalars, enums and input objects). Object types are output only, since they can have arguments and resolvers of their own."
links:
  - { title: "Schemas and Types (graphql.org)", url: "https://graphql.org/learn/schema/" }
  - { title: "GraphQL specification, September 2025", url: "https://spec.graphql.org/September2025/" }
  - { title: "GraphQL specification, October 2021", url: "https://spec.graphql.org/October2021/" }
---
A GraphQL service is described by a schema written in the Schema Definition Language (SDL). It names every type the API can return and every field on those types, along with each field's arguments and return type. Three special object types, `Query`, `Mutation` and `Subscription`, are the roots: every operation a client sends starts at one of them and walks down from there. Because the server knows the type of every field, it can reject a malformed request before running any code, and tools can generate documentation, types and client code from the same file.

## A small schema

```graphql
"""A person who writes posts."""
type User {
  id: ID!
  name: String!
  email: String          # nullable: hidden from other users
  posts(first: Int = 10, after: String): PostConnection!
}

type Post implements Node {
  id: ID!
  title: String!
  author: User!
  tags: [String!]!
  publishedAt: DateTime
}

interface Node { id: ID! }

union SearchResult = User | Post

scalar DateTime @specifiedBy(url: "https://www.rfc-editor.org/rfc/rfc3339")

enum Role { READER WRITER ADMIN }

input CreatePostInput {
  title: String!
  body: String!
  tags: [String!] = []
}

type Query {
  me: User
  node(id: ID!): Node
  search(text: String!): [SearchResult!]!
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
}
```

The building blocks:

- **Scalars**: `Int`, `Float`, `String`, `Boolean`, `ID`, plus custom ones like `DateTime`, whose format `@specifiedBy` can document.
- **Object types** have fields; **input objects** are their counterpart for arguments. The two never mix: arguments take only scalars, enums and input objects.
- **Enums** are a closed set of values.
- **Interfaces** declare fields that implementing types must have; **unions** list possible types without shared fields.
- **Lists** `[T]` and **non-null** `T!` wrap other types and combine.
- The September 2025 edition adds `@oneOf` input objects, where exactly one field must be set: a typed way to say "find a user by id or by email, but not both".

## Nullability is a design decision

Every field is nullable unless you add `!`. That is deliberate. If a resolver fails or a backend times out, a nullable field can come back as `null` with an entry in the response's `errors`, and the rest of the result still arrives. A non-null field promises a value; if it can't keep that promise, the null moves up to the nearest nullable parent, possibly wiping out much more of the response. A common rule of thumb is to make identifiers and fields that are always present non-null, and leave fields backed by other services nullable.

## The schema is also data

A running server can describe itself through introspection: the `__schema` and `__type` fields that any query can ask for, and `__typename` on every object. Explorers and code generators use it. Whether to allow it in production is a security question covered later in this path.
