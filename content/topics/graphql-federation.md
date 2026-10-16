---
id: graphql-federation
title: "Federation: one graph from many services"
summary: Subgraphs own types, a router plans queries across them
why: "One schema for the whole company is what clients want; one server owned by every team is what nobody wants. Federation keeps the single graph while letting each team ship its part on its own schedule."
requires: [graphql-execution, graphql-n-plus-one]
lesson: none
points:
  - title: Subgraphs
    text: "Each team runs a GraphQL service for its own domain, with its own schema and resolvers: users, orders, products."
  - title: Entities join the graph
    text: "A type with a key (such as `User` by `id`) can be referenced and extended by other subgraphs. Orders can add `User.orders` without owning `User`."
  - title: Composition at build time
    text: "Subgraph schemas are composed into one supergraph before deployment, and conflicts fail the composition, not production traffic."
  - title: A router plans each query
    text: "The router splits a client query into subgraph requests, runs them in dependency order (batched by entity), and merges the results."
quiz:
  - q: "The Orders team wants clients to query `user { orders { total } }`, but `User` belongs to the Users subgraph. What do they do?"
    options: ["Copy the user table into the orders service", "Declare `User` as an entity by its key in their subgraph and add an `orders` field; the router fetches the user from Users and the orders from Orders", "Ask the Users team to add the field"]
    answer: 1
    explain: "Entities let a subgraph contribute fields to a type it doesn't own, given only the key. Ownership of each field stays with the team that has the data."
  - q: "When should a subgraph's breaking schema change be caught?"
    options: ["When a client hits an error in production", "At composition, before deploy, by checking it against the other subgraphs and the operations clients actually send", "Never: federation makes changes non-breaking"]
    answer: 1
    explain: "Composition catches conflicts between subgraphs; checking recorded client operations against the new supergraph catches changes that would break callers."
  - q: "A query for 50 orders and each order's products crosses two subgraphs. What keeps it from becoming 50 calls to the products subgraph?"
    options: ["Nothing, it will be 50 calls", "The router batches entity fetches: one request with 50 product keys, which the subgraph resolves with a loader", "HTTP keep-alive"]
    answer: 1
    explain: "Query planning applies the same batching idea as DataLoader between services. Inside the subgraph, a loader still matters for turning those keys into one database query."
links:
  - { title: "GraphQL federation (graphql.org)", url: "https://graphql.org/learn/federation/" }
  - { title: "Schema Ownership and Governance Models (graphql.org)", url: "https://graphql.org/learn/governance-ownership/" }
---
Federation is a way to build one GraphQL API out of several independently deployed GraphQL services. Each **subgraph** owns part of the schema and the resolvers behind it. A **composition** step merges the subgraph schemas into one **supergraph** and checks that they fit together. A **router** (or gateway) receives client queries against that supergraph, works out which subgraph can resolve which fields, sends each its part, and stitches the answers into one response. Clients see a single endpoint and a single schema; teams keep their own code, deploys and data. Apollo Federation popularised the approach, and a GraphQL Foundation working group on composite schemas is writing a vendor-neutral specification for it.

## Entities

The glue is the **entity**: an object type with a key that any subgraph can use to refer to it. In Apollo Federation's syntax:

```graphql
# Users subgraph: owns User
type User @key(fields: "id") {
  id: ID!
  name: String!
}
type Query { user(id: ID!): User }
```

```graphql
# Orders subgraph: owns Order, and adds a field to User
type User @key(fields: "id") {
  id: ID!
  orders(first: Int = 10): [Order!]!
}
type Order @key(fields: "id") {
  id: ID!
  total: Int!
  product: Product!
}
type Product @key(fields: "id") { id: ID! }   # a reference: Products owns the rest
```

The client sees one `User` type with `name` and `orders`, and one `Order` whose `product` has every field the Products subgraph defines.

## What the router does

```graphql
query { user(id: "u1") { name orders { total product { title } } } }
```

1. Ask Users for `user(id: "u1") { id name }`.
2. Send Orders the entity key `{ __typename: "User", id: "u1" }` and ask for `orders { total product { id } }`.
3. Send Products all the product keys from step 2 in **one** request and ask for `title`.
4. Merge the three results into the shape of the original query.

This plan is the execution model from earlier in this path, applied across services: parents before children, siblings in parallel, and entity lookups batched per step so ten orders don't mean ten calls to Products. Inside each subgraph, a DataLoader still turns those keys into one database query.

## Costs and trade-offs

- **Latency adds up** along the plan's longest chain of dependent fetches. Deeply interleaved ownership (A needs B needs A) makes slow plans.
- **The router is critical infrastructure**: authentication, cost limits, timeouts and tracing usually live there, as in any API gateway.
- **Composition is a contract check.** Run it in CI for every subgraph change, together with checks of the operations clients actually send, so a removed field is caught before deploy.
- **You may not need it.** A single GraphQL server in front of several REST or gRPC services (a backend for frontend) is simpler until several teams need to evolve the schema independently.
