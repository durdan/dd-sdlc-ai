---
id: qa-performance-testing
title: Performance and load testing
summary: Percentiles, ramp-up and a pass/fail line
why: "Functional tests run one request at a time. Users don't. Pools running out, lock contention and slow queries only show up under realistic load."
requires: [qa-api-testing]
lesson: none
points:
  - title: Measure the tail
    text: "Report p95 and p99 latency next to the error rate and throughput. The mean hides the slow requests that users remember."
  - title: Pick the test type
    text: "Smoke (does the script work), average load, stress (above normal), spike, soak (hours), breakpoint (find the limit)."
  - title: Ramp, don't jump
    text: "Increase load in steps and hold it, so you can see at what level latency and errors start to climb."
  - title: Thresholds make it a test
    text: "Write the goal down, such as p95 under 300 ms and under 1% errors, so the run passes or fails like any other test."
quiz:
  - q: "Mean latency is 150 ms but p99 is 2.4 s. What does that tell you?"
    options:
      - The service is fast; the mean is what counts
      - "One request in a hundred takes 2.4 s or more, and a page that makes many calls will hit that tail often"
      - The measurement is broken
    answer: 1
    explain: "A page that makes 20 backend calls has a high chance that at least one of them lands in the slowest 1%. Percentiles show the tail; the mean blends it away."
  - q: "In a closed model (a fixed number of virtual users, each waiting for its response), the server slows down. What happens to the load?"
    options:
      - It stays the same
      - "It drops, because each user waits longer before sending the next request, so the test goes easy on the server just when it struggles"
      - It doubles
    answer: 1
    explain: "This is coordinated omission. For \"N requests per second, whatever happens\", use an open model: k6's constant-arrival-rate or ramping-arrival-rate executors."
  - q: "Why ramp up gradually instead of starting at full load?"
    options:
      - k6 can't start at full load
      - "You see the level where latency and errors start to rise, and caches and autoscaling get to warm up as they would in reality"
      - It makes the numbers look better
    answer: 1
    explain: "A sudden jump is a different test (a spike test). A ramp with holds shows how the system degrades, which is what you need for capacity planning."
links:
  - { title: "Thresholds (Grafana k6)", url: "https://grafana.com/docs/k6/latest/using-k6/thresholds/" }
  - { title: "Open and closed models (Grafana k6)", url: "https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/" }
  - { title: "Load test types (Grafana k6)", url: "https://grafana.com/docs/k6/latest/testing-guides/test-types/" }
  - { title: "Monitoring distributed systems (Google SRE book)", url: "https://sre.google/sre-book/monitoring-distributed-systems/" }
---
A load test sends many requests at once to find out how latency, errors and throughput change as traffic grows. Measure percentiles, not averages: the 95th and 99th percentile latencies are what the slowest one in twenty and one in a hundred users actually get. Ramp the load up in steps, and set thresholds so the run passes or fails like any other test.

## Why the mean lies

A thousand latencies, 2% of which take a slow path (a cache miss, a lock, a cold connection):

```js run
const latencies = []
for (let i = 0; i < 1000; i++) latencies.push(i % 50 === 0 ? 2000 + i : 80 + (i % 40))

const sorted = [...latencies].sort((a, b) => a - b)
const percentile = (p) => sorted[Math.ceil((p / 100) * sorted.length) - 1] // nearest rank
const mean = latencies.reduce((s, x) => s + x, 0) / latencies.length

console.log("mean:", Math.round(mean), "ms")
console.log("p50: ", percentile(50), "ms")
console.log("p95: ", percentile(95), "ms")
console.log("p99: ", percentile(99), "ms")
console.log("max: ", sorted[sorted.length - 1], "ms")
```

The mean looks healthy and so does p95. Only p99 shows that one request in a hundred takes over two seconds. Which percentile you set a goal on depends on how many calls make up one user action: the more calls, the further into the tail you need to look.

## What to measure

- **Latency** percentiles (p50, p95, p99), with successful and failed requests counted separately. A fast error is not a fast success.
- **Error rate**, including wrong answers that come back with a 200.
- **Throughput**: requests or completed journeys per second.
- **Saturation** on the server: CPU, memory, connection pools, queue depth. That is where you find out *why* latency climbs.

## A k6 script with a ramp and thresholds

```js
// load.js: run with  k6 run -e BASE_URL=https://staging.example.com load.js
import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  stages: [
    { duration: "2m", target: 50 }, // ramp up to 50 virtual users
    { duration: "5m", target: 50 }, // hold
    { duration: "1m", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],                   // under 1% errors
    http_req_duration: ["p(95)<300", "p(99)<800"],    // milliseconds
  },
}

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/products?page=1`)
  check(res, { "status is 200": (r) => r.status === 200 })
  sleep(1) // think time between a user's actions
}
```

If a threshold fails, k6 exits with a non-zero code, so a CI job fails the same way it would for a broken unit test.

## Closed and open load

Virtual users that wait for each response form a **closed model**: when the server slows down, they send less, and the test eases off exactly when it should push. To hold a fixed arrival rate whatever the response times, use an **open model**:

```js
export const options = {
  scenarios: {
    checkout: {
      executor: "constant-arrival-rate",
      rate: 100, timeUnit: "1s",      // 100 new iterations every second
      duration: "5m",
      preAllocatedVUs: 50, maxVUs: 300,
    },
  },
}
```

## Making results mean something

Test an environment sized like production, with realistic data volumes (an empty database is fast), and a realistic mix of requests rather than one URL. Start with a smoke run at minimal load to check the script works. Watch the system under test, not just the load generator. A load generator that runs out of CPU produces numbers about itself, not about your service.
