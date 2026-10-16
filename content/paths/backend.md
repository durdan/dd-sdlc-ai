---
id: backend
title: "Backend engineer: from a request to a service you can run"
promise: "What a backend engineer works with every day: the runtime under the service, a request's path through the framework, the database connections and transactions it borrows, the tests that prove it works across boundaries, and what changes when a language model is one of your dependencies."
kind: role
tags: [backend]
level: intermediate
stages:
  - title: The runtime
    blurb: Memory, collectors, threads
    topics: [java-memory, java-gc, java-concurrent, java-virtual-threads]
  - title: A request's journey
    blurb: Container, filters, security, transactions
    topics: [spring-ioc, spring-request, spring-filters, spring-security, spring-transactions]
  - title: Data and tests
    blurb: Queries, pools, tests across boundaries
    topics: [spring-jpa, spring-hikari, spring-testing, qa-api-testing, qa-contract-testing]
  - title: Running it in production
    blurb: Signals, safe releases, model calls
    topics: [spring-actuator, qa-testing-in-production, ai-structured-outputs, ai-cost-latency]
bridges:
  - id: timeout
    why: "Every outgoing call holds a thread and often a connection until it returns. A deadline on each one is what gives them back."
  - id: circuit-breaker
    why: "When a dependency, a model provider included, keeps failing, stop calling it for a while and serve a fallback instead of queueing threads behind it."
  - id: idempotency
    why: "Clients and queues retry. An idempotency key lets the service accept the same request twice and act once."
  - id: cache-aside
    why: "The usual first cache in front of a database: look in the cache, otherwise load and store. @Cacheable is this pattern behind a proxy."
  - id: outbox
    why: "Writing to the database and publishing an event in one step without two-phase commit: write both in the same transaction, publish afterwards."
  - id: competing-consumers
    why: "Background jobs taken from one queue by many workers: how a backend scales the work that doesn't belong in a request."
next: [resilience-101, data-consistency, inside-db, event-driven]
---
This role uses the JVM and Spring Boot as its stack because they show every layer of a request explicitly. If your services are in Node.js, the Node path covers the same runtime ideas (the event loop instead of thread pools, streams and backpressure, worker threads), and the later stages apply unchanged. Topics are shared with the Java, Spring Boot, QA automation and AI engineering paths, with shared progress.
