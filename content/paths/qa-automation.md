---
id: qa-automation
title: "QA automation: tests that catch real bugs"
promise: "Decide what is worth testing and at which layer, write tests that fail for real bugs and only for real bugs, and keep a growing suite fast and trusted from the first unit test to production."
kind: skill
level: intermediate
stages:
  - title: Foundations
    blurb: What to test, and how small
    topics: [qa-strategy, qa-unit-tests, qa-test-doubles, qa-coverage-mutation]
  - title: Across boundaries
    blurb: Databases, APIs, services, browsers
    topics: [qa-integration-tests, qa-api-testing, qa-contract-testing, qa-e2e-playwright]
  - title: Trust at scale
    blurb: Flakes, pipelines, load, production
    topics: [qa-flaky-tests, qa-tests-in-ci, qa-performance-testing, qa-testing-in-production]
bridges:
  - id: contract-testing
    why: "The same consumer-driven idea, drawn as a design pattern: how contracts let two teams change services independently."
  - id: idempotency
    why: "API tests check that a retried POST does not charge twice. Here is how the server side makes that true."
  - id: feature-flags
    why: "Testing in production depends on separating deploy from release. Flags are how you do that."
next: [evolve-safely]
---
Each topic has short examples. The plain JavaScript ones run in the page; the Playwright, Testcontainers, Pact and k6 snippets need their own tools and are shown for reading.
