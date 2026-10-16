---
id: graphql-vs-rest-grpc
title: "GraphQL, REST or gRPC?"
summary: Who chooses the shape, who pays for caching, who it is for
why: "Each style moves cost to a different place: REST to the number of round trips, GraphQL to the server's execution and limits, gRPC to tooling and browser support. Picking one is picking which problems you want."
requires: [graphql-caching, graphql-security]
lesson: none
points:
  - title: REST is resources and HTTP
    text: "One URL per resource, HTTP methods and status codes, and caching by URL that browsers and CDNs already understand."
  - title: GraphQL lets the client shape the response
    text: "One endpoint, one typed schema; each screen asks for exactly what it needs in one round trip. The server must control cost and cache below the HTTP layer."
  - title: gRPC is typed calls between services
    text: "Methods defined in Protocol Buffers, compact binary messages over HTTP/2, generated clients and streaming. Browsers need a proxy to use it."
  - title: Often all three
    text: "gRPC between services, GraphQL as a backend for frontends, REST for public, cache-heavy or webhook-style APIs."
quiz:
  - q: "A public API serves the same product catalogue to thousands of anonymous clients and must be cached at a CDN. Which style fits most easily?"
    options: ["GraphQL with POST requests", "REST: GET by URL is cached by every CDN with plain HTTP headers", "gRPC streaming"]
    answer: 1
    explain: "Shared, read-heavy, cacheable data is REST's home ground. GraphQL can get there with GET and persisted queries, but REST gets it for free."
  - q: "A mobile screen needs a user, their last five orders and each order's items. Which style avoids several round trips without adding a custom endpoint?"
    options: ["REST with one endpoint per resource", "GraphQL: one query describes the whole tree", "gRPC unary calls"]
    answer: 1
    explain: "This is the case GraphQL was built for: many related resources, fetched in the shape of one screen, on a slow network."
  - q: "Two backend services exchange millions of small messages per second inside a data centre. Which style is the usual choice?"
    options: ["GraphQL", "gRPC: compact binary encoding, HTTP/2 multiplexing, and generated typed stubs", "REST with XML"]
    answer: 1
    explain: "Service-to-service traffic benefits most from gRPC's efficiency and strict contracts, and doesn't need browser support or flexible queries."
links:
  - { title: "FAQ (graphql.org)", url: "https://graphql.org/faq/" }
  - { title: "Thinking in Graphs (graphql.org)", url: "https://graphql.org/learn/thinking-in-graphs/" }
  - { title: "Serving over HTTP (graphql.org)", url: "https://graphql.org/learn/serving-over-http/" }
---
GraphQL, REST and gRPC answer the same question, how one program asks another for data, with different trade-offs. REST models the API as resources at URLs and leans on HTTP for methods, status codes and caching. GraphQL exposes one typed graph at one endpoint and lets each client write the exact shape of the response it wants. gRPC defines remote procedures in Protocol Buffers and calls them with compact binary messages over HTTP/2. None of them is better in general; they suit different callers, and large systems often use all three.

## Side by side

| | REST | GraphQL | gRPC |
|---|---|---|---|
| Contract | Optional (OpenAPI) | Required schema, introspectable | Required `.proto` files |
| Who shapes the response | Server, per endpoint | Client, per query | Server, per method |
| Round trips for related data | Often several | Usually one | One per call; you design the methods |
| HTTP caching | Natural, by URL | Needs GET plus persisted queries | Not used |
| Errors | HTTP status codes | `errors` array, often with HTTP 200 | Status codes in the gRPC protocol |
| Streaming | SSE, WebSocket alongside | Subscriptions | Built in, both directions |
| Browser support | Native | Native (it is HTTP plus JSON) | Needs gRPC-Web or a proxy |
| Server-side risk | Endpoint does known work | Client chooses the work: needs cost limits | Method does known work |
| Evolution | Versions or careful additions | Add fields, deprecate, measure usage | Add fields by number, never reuse numbers |

## When each fits

**REST** is a good default for public APIs, simple CRUD, file uploads and downloads, webhooks, and anything that benefits from CDN caching. Every tool, proxy and developer understands it.

**GraphQL** pays off when many different clients (web, iOS, Android, partners) need different views of the same connected data, when screens combine many resources, and when the frontend changes faster than the backend. It costs you a query engine to secure: cost limits, field-level authorisation, batching to avoid N+1, and caching that lives in clients and data loaders rather than URLs.

**gRPC** suits internal service-to-service calls: low latency, high volume, strict typed contracts with generated clients in many languages, and streaming both ways. It is awkward for browsers and for ad hoc exploration with everyday tools.

## Combining them

A common shape: services talk gRPC (or REST) to each other; a GraphQL layer, a single server or a federated graph, sits in front of them as the backend for frontends; and a small REST surface handles public, cacheable or callback endpoints. The GraphQL resolvers become thin adapters calling the services underneath, which is also where DataLoader batching turns a graph of field requests into a few efficient service calls.
