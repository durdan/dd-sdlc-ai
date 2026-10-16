---
id: graphql
title: "GraphQL: what happens behind one endpoint"
promise: "What a GraphQL server does with a query: the schema that types every field, how execution walks the selection one resolver at a time, why that invites N+1 queries and how batching fixes it, what partial data and the errors array mean, and how caching, authorisation, cost limits, federation and schema evolution work when every request goes to the same URL."
kind: skill
level: intermediate
tags: [web, backend]
stages:
  - title: The contract
    blurb: Types, operations, the schema
    topics: [graphql-schema, graphql-operations]
  - title: Execution
    blurb: Resolvers, batching, errors, pages
    topics: [graphql-execution, graphql-n-plus-one, graphql-errors, graphql-pagination]
  - title: In production
    blurb: Who may see it, caching, limits
    topics: [graphql-auth, graphql-caching, graphql-security]
  - title: At scale
    blurb: Many teams, many years, other styles
    topics: [graphql-federation, graphql-schema-evolution, graphql-vs-rest-grpc]
bridges:
  - id: bff
    why: "A GraphQL server in front of several services is often a backend for frontend with a typed query language. The library topic covers when one gateway per client beats one shared graph."
  - id: cursor-pagination
    why: "GraphQL connections are cursor pagination with a fixed shape. The library topic explains why cursors beat offsets underneath."
  - id: rate-limiting
    why: "One GraphQL request can cost one row or a million. Rate limiting by query cost rather than by request count is the GraphQL version of this pattern."
  - id: api-gateway
    why: "A federation router is an API gateway that also plans queries across services. The library topic covers what any gateway must handle: auth, limits, routing, observability."
  - id: contract-testing
    why: "Clients depend on exact fields. Checking each client's operations against a proposed schema before deploying is contract testing with the schema as the contract."
next: [apis-edge, backend]
---
The language and type system follow the GraphQL specification (the October 2021 edition, the September 2025 edition that succeeds it, and the current working draft). Examples of server code are plain JavaScript without libraries, so you can run them and see the execution model; real servers such as graphql-js add parsing, validation and much more around the same ideas. The SQL pagination and JavaScript promise topics are prerequisites from other paths and share their progress.
