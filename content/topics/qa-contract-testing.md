---
id: qa-contract-testing
title: Contract tests between services
summary: Each consumer says what it needs; the provider proves it
why: "End-to-end tests across many services are slow and flaky, and stubs of other teams' APIs go stale. Contract tests catch breaking changes before either side deploys."
requires: [qa-api-testing, qa-test-doubles]
lesson: diagram
points:
  - title: Consumer-driven
    text: "Each consumer records the requests it makes and the parts of the responses it reads. The provider's contract is the union of those needs."
  - title: Two halves
    text: "The consumer tests against a mock provider and produces a contract. The provider replays that contract against its real code."
  - title: Provider states
    text: "Each interaction names the state it needs (\"order 42 exists\"), and the provider sets that up before the replay."
  - title: Gate the deploy
    text: "A broker stores contracts and verification results, and answers \"can I deploy this version to this environment?\""
quiz:
  - q: "The provider removes a response field that no consumer's contract mentions. What happens at verification?"
    options:
      - Every consumer's verification fails
      - Verification passes, because no consumer depends on that field
      - The broker deletes the contract
    answer: 1
    explain: "Contracts list only what consumers actually read, so the provider is free to change everything else. That is the point of consumer-driven contracts."
  - q: What is a provider state?
    options:
      - The provider's current version number
      - "A named precondition, like \"order 42 exists\", that the provider sets up before replaying an interaction"
      - The HTTP status the provider returns
    answer: 1
    explain: "The consumer writes given(\"order 42 exists\"), and the provider's verification registers a handler that puts that data in place. Each interaction stays independent."
  - q: What question does can-i-deploy answer?
    options:
      - Whether the unit tests passed
      - "Whether this version has a successful verification against the versions of its counterparts already in the target environment"
      - Whether the deploy pipeline is free
    answer: 1
    explain: "It looks up the matrix of consumer and provider versions in the broker. Together with record-deployment, it stops you deploying a version that would break a partner already in that environment."
links:
  - { title: "How Pact works (Pact docs)", url: "https://docs.pact.io/getting_started/how_pact_works" }
  - { title: "Can I Deploy (Pact docs)", url: "https://docs.pact.io/pact_broker/can_i_deploy" }
  - { title: "Consumer-Driven Contracts: A Service Evolution Pattern (Ian Robinson, martinfowler.com)", url: "https://martinfowler.com/articles/consumerDrivenContracts.html" }
---
A contract test checks that two services agree on the messages between them, without deploying both at once. With consumer-driven contracts, each consumer writes down the requests it sends and the parts of the response it actually uses. The provider then proves, in its own build, that it still meets every one of those contracts. A breaking change fails a build instead of reaching production.

## Only what is used

The idea comes from Ian Robinson's 2006 article: a provider's real obligations are the combined expectations of its current consumers, not every field it happens to return. A toy verifier makes the consequence clear:

```js run
const contracts = {
  "checkout-web": { id: "number", status: "string" },
  "email-worker": { id: "number", customerEmail: "string" },
}
function verify(label, response) {
  console.log(label)
  for (const [consumer, needs] of Object.entries(contracts)) {
    const missing = Object.entries(needs).filter(([k, type]) => typeof response[k] !== type).map(([k]) => k)
    console.log(" ", consumer, missing.length ? `BROKEN (missing ${missing.join(", ")})` : "ok")
  }
}

verify("v1", { id: 42, status: "paid", customerEmail: "a@example.com", legacyCode: "X1" })
verify("v2 drops legacyCode", { id: 42, status: "paid", customerEmail: "a@example.com" })
verify("v2 renames status to state", { id: 42, state: "paid", customerEmail: "a@example.com" })
```

Dropping a field nobody reads is safe, and the provider learns that without asking. The rename breaks exactly one consumer, and the failure names it.

## The Pact flow

[Pact](https://docs.pact.io/) is a widely used open-source tool for this, with libraries for most languages. On the **consumer** side, a unit test describes an interaction against a Pact mock server, and your real client code calls it:

```ts
import { Matchers, Pact } from "@pact-foundation/pact"
import { getOrder } from "../src/orders-client"
const { like } = Matchers

const provider = new Pact({ consumer: "checkout-web", provider: "orders-api" })

test("reads an order's status", () =>
  provider
    .addInteraction()
    .given("order 42 exists")
    .uponReceiving("a request for order 42")
    .withRequest("GET", "/orders/42", (b) => b.headers({ Accept: "application/json" }))
    .willRespondWith(200, (b) => b.jsonBody({ id: like(42), status: like("paid") }))
    .executeTest(async (mockServer) => {
      const order = await getOrder(mockServer.url, 42)
      expect(order.status).toBe("paid")
    }))
```

`like` matches by type, so the contract says "a number" and "a string", not those exact values. A passing run writes a pact file, which CI publishes to a **Pact Broker**.

On the **provider** side, a verification test fetches the pacts, starts the real service, sets up each provider state through a handler you write (`"order 42 exists"` inserts that order), replays every request and compares the responses with what each consumer expects. The results go back to the broker.

Before deploying either side, the pipeline asks the broker:

```sh
pact-broker can-i-deploy --pacticipant checkout-web --version "$GIT_SHA" --to-environment production
# ...deploy...
pact-broker record-deployment --pacticipant checkout-web --version "$GIT_SHA" --environment production
```

## What contracts don't do

A contract test checks the shape of the conversation, not the provider's business rules. Whether refunds are calculated correctly is the provider's own functional tests' job. Keep contracts minimal: put in a field only if the consumer really reads it, or the provider can't change anything. If a provider can't run consumer contracts, checking both sides against a shared OpenAPI schema is a weaker alternative.

```trace diagram
id: pact-flow
title: From a consumer test to a safe deploy
subtitle: checkout-web needs orders-api; the broker sits in between
direction: DOWN
groups:
  - { id: consumer, label: "Consumer build: checkout-web" }
  - { id: provider, label: "Provider build: orders-api" }
elements:
  - { id: ctest, label: Consumer test, sub: your real client code, kind: component, group: consumer }
  - { id: mock, label: Pact mock server, sub: answers as orders-api would, group: consumer }
  - { id: pactfile, label: Pact file, sub: the interactions it used, kind: store, group: consumer }
  - { id: pacts, label: "Broker: pacts", sub: one per consumer version, kind: store, role: data }
  - { id: matrix, label: "Broker: matrix", sub: "versions, results, environments", kind: store, tone: data, role: data }
  - { id: verify, label: Provider verification, sub: replays every interaction, kind: component, group: provider }
  - { id: states, label: State handlers, sub: "\"order 42 exists\"", group: provider }
  - { id: api, label: orders-api, sub: the real service, group: provider }
  - { id: gate, label: can-i-deploy, sub: run before each deploy, role: security }
  - { id: prod, label: Production, sub: record-deployment, kind: system }
edges:
  - { id: call, from: ctest, to: mock }
  - { id: write, from: ctest, to: pactfile }
  - { id: publish, from: pactfile, to: pacts }
  - { id: fetch, from: pacts, to: verify }
  - { id: setup, from: verify, to: states }
  - { id: replay, from: verify, to: api }
  - { id: results, from: verify, to: matrix }
  - { id: ask, from: gate, to: matrix }
  - { id: go, from: gate, to: prod }
  - { id: record, from: prod, to: matrix, style: dashed, flow: main }
steps:
  - caption: The consumer's unit test describes one interaction, given order 42 exists, a GET for it, and the fields it reads. Its real client code then calls a Pact mock server instead of the real API.
    focus: [ctest, mock]
    trace: [call]
  - caption: The mock checks the request matches and answers with the expected response. When every interaction passes, Pact writes a pact file listing them, matched by type, not by exact values.
    focus: [ctest, mock, pactfile]
    trace: [write]
  - caption: CI publishes the pact file to the broker, tagged with the consumer's version, usually the git commit.
    focus: [pactfile, pacts]
    trace: [publish]
  - caption: In the provider's own build, a verification test fetches the pacts of its consumers and starts the real orders-api.
    focus: [pacts, verify, api]
    trace: [fetch]
  - caption: "Before each interaction it runs the matching state handler, which puts order 42 in place. Then it replays the request and compares the real response with what the consumer said it needs, and nothing more."
    focus: [verify, states, api]
    trace: [setup, replay]
  - caption: The results go back to the broker. Its matrix now records that this provider version does or does not satisfy that consumer version.
    focus: [verify, matrix]
    trace: [results]
  - caption: Before either side deploys, the pipeline asks can-i-deploy. It looks for a successful verification between this version and the versions of its partners already in production.
    focus: [gate, matrix]
    trace: [ask]
  - caption: Only if every required result is there and green does the deploy go ahead. Otherwise the command fails and the pipeline stops.
    focus: [gate, prod]
    trace: [go]
  - caption: After the deploy, record-deployment tells the broker which version is now in production, so the next can-i-deploy, from either side, checks against it.
    focus: [prod, matrix]
    trace: [record]
```
