---
id: spring-boot
title: "Spring Boot: how a request becomes a response"
promise: "What Spring Boot does between an HTTP request arriving and a response leaving: the container that builds your objects, the proxies that wrap them, the threads, transactions and connections each request borrows, and how to see and test it all."
kind: skill
level: intermediate
stages:
  - title: The container
    blurb: Beans, wiring and auto-configuration
    topics: [spring-ioc, spring-beans, spring-autoconfig, spring-config]
  - title: A request's journey
    blurb: Threads, filters, proxies, transactions
    topics: [spring-request, spring-filters, spring-security, spring-transactions]
  - title: Data and production
    blurb: Queries, pools, signals and tests
    topics: [spring-jpa, spring-hikari, spring-actuator, spring-testing]
bridges:
  - id: bulkhead
    why: "Tomcat's thread pool and Hikari's connection pool are bulkheads already. Give each downstream dependency its own, so one slow service can't take every thread."
  - id: timeout
    why: A request holds a thread and often a connection until it ends. Timeouts on every outgoing call are what give them back.
  - id: circuit-breaker
    why: When a dependency keeps failing, stop calling it for a while; in Spring this is usually Resilience4j, applied through the same kind of proxy as @Transactional.
  - id: cache-aside
    why: "@Cacheable is cache-aside behind a proxy: look in the cache, otherwise load and store. The self-invocation trap applies here too."
next: [resilience-101, inside-db]
---
Written for Spring Boot 3.x on Spring Framework 6.x and Java 17 or later; the links point to the 3.5 and 6.2 reference docs.
