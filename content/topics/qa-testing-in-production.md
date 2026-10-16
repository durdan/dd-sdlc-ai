---
id: qa-testing-in-production
title: Testing in production, safely
summary: Flags, canaries and synthetic checks
why: "Production has traffic, data and configuration that no test environment copies exactly. Some bugs only show up there, so limit how many users they can reach and find them before users report them."
requires: [qa-tests-in-ci]
lesson: diagram
points:
  - title: Not instead of, as well as
    text: "Tests only cover scenarios someone thought of. Production checks catch the rest, but they don't replace the suite."
  - title: Separate deploy from release
    text: "Feature flags ship code turned off, then turn it on for staff, then 1%, then everyone, and can turn it off again in seconds."
  - title: Canaries compare
    text: "Send a small share of traffic to the new version, compare its errors and latency with the old one, and roll back automatically if it is worse."
  - title: Synthetic checks
    text: "A script runs a key journey against production every few minutes, as a dedicated test user, and alerts when it fails."
quiz:
  - q: "A canary on 5% of traffic shows twice the error rate of the baseline. What should happen?"
    options:
      - Roll it out to everyone and watch
      - "Stop the rollout and send the canary's traffic back to the old version, ideally automatically"
      - Wait a day to collect more data
    answer: 1
    explain: "The point of a canary is to limit how many users a bad version reaches. The old version is still running, so rolling back is just a routing change."
  - q: "Which flag configurations does Pete Hodgson suggest testing, since testing every combination is impractical?"
    options:
      - Only all flags off
      - "The configuration you expect in production with the new flag on, the fallback with it off, and optionally all flags on"
      - Every combination, every time
    answer: 1
    explain: "Most flags don't interact, so a few configurations cover what matters: what will be live, what you fall back to, and a look ahead at everything turned on."
  - q: What does a synthetic check catch that unit and integration tests can't?
    options:
      - Logic errors in pricing
      - "A broken journey in the real production setup (DNS, certificates, a third-party outage, a bad config), before customers report it"
      - Low code coverage
    answer: 1
    explain: "It is black-box monitoring: it uses the live system the way a user would and fails when they would. It complements, not replaces, your other tests."
links:
  - { title: "Feature Toggles (Pete Hodgson, martinfowler.com)", url: "https://martinfowler.com/articles/feature-toggles.html" }
  - { title: "CanaryRelease (Danilo Sato, martinfowler.com)", url: "https://martinfowler.com/bliki/CanaryRelease.html" }
  - { title: "QA in Production (Rouan Wilsenach, martinfowler.com)", url: "https://martinfowler.com/articles/qa-in-production.html" }
  - { title: "Monitoring distributed systems: black-box monitoring (Google SRE book)", url: "https://sre.google/sre-book/monitoring-distributed-systems/" }
---
Testing in production means checking new code against real traffic, while limiting how many users a problem can reach. Three tools do most of the work: feature flags turn a change on for a few users at a time, canary releases send a small share of traffic to the new version and compare it with the old, and synthetic checks run scripted journeys against the live system around the clock. None of them replaces the tests that run before a deploy.

## Rolling out with a flag

A percentage rollout must give the same answer for the same user every time, or a user would flip between old and new on every page. Hashing the user id into a bucket does that:

```js run
function bucket(key) {          // a stable number from 0 to 99 for each key
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 100
}
function isEnabled(flag, userId) {
  if (flag.allow.includes(userId)) return true
  return bucket(`${flag.name}:${userId}`) < flag.percent
}

const newCheckout = { name: "new-checkout", percent: 10, allow: ["synthetic-bot"] }
const users = Array.from({ length: 1000 }, (_, i) => `user-${i}`)

console.log("users on the new checkout:", users.filter((u) => isEnabled(newCheckout, u)).length, "of", users.length)
console.log("user-7 gets the same answer twice:", isEnabled(newCheckout, "user-7") === isEnabled(newCheckout, "user-7"))
console.log("the synthetic check account always sees it:", isEnabled(newCheckout, "synthetic-bot"))
```

Including the flag name in the hash keeps the same users from being first in line for every experiment. The allow-list lets staff and test accounts see the feature before anyone else. Raise `percent` in steps while watching error rates. To roll back, set it to 0; there is no redeploy.

Testing flags before they reach production: run the suite with the configuration that will be live (new flag on) and with the fallback (new flag off). Then remove the flag once the rollout is done, because every flag left in the code doubles the paths someone has to reason about.

## Canary releases

A canary deploys the new version next to the old one and routes a small slice of traffic to it: a random 1%, staff first, or a single region. Compare the canary with the baseline on the same signals you load test with (error rate, p95 and p99 latency, saturation) and on business signals such as checkouts per minute. Automate the decision: tools like Argo Rollouts and Flagger, or your cloud's deployment service, can step traffic up and roll back when a metric crosses a limit.

## Synthetic checks

A synthetic check is a short script that runs a critical journey against production every few minutes, from outside your network, and pages someone when it fails. A Playwright test works well:

```ts
import { expect, test } from "@playwright/test"

test("search to product page works in production", async ({ page }) => {
  await page.goto("https://shop.example.com")
  await page.getByRole("searchbox", { name: "Search" }).fill("mug")
  await page.getByRole("searchbox", { name: "Search" }).press("Enter")
  await page.getByRole("link", { name: /mug/i }).first().click()
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeEnabled()
})
```

## Doing it safely

- Use dedicated test accounts that are marked as synthetic, so their traffic is left out of analytics, emails and billing.
- Never move real money. Use the payment provider's test mode for those accounts, or stop the journey before payment.
- Make checks read-only where you can. Where they write, clean up, and make it obvious which data is test data.
- Keep a kill switch for every risky change, and practise using it.

```trace diagram
id: canary-rollout
title: A canary with a flag inside
subtitle: Reach a few users, compare, then promote or roll back
direction: DOWN
groups:
  - { id: prod, label: Production }
elements:
  - { id: users, label: Users, kind: person }
  - { id: synthetic, label: Synthetic check, sub: "every few minutes, test account", kind: person, tone: neutral }
  - { id: router, label: Router, sub: splits traffic, group: prod }
  - { id: baseline, label: v1 baseline, sub: 90% of traffic, group: prod }
  - { id: canary, label: v2 canary, sub: 10% of traffic, group: prod, tone: stream }
  - { id: flags, label: Flag service, sub: "allow-list, then 10%", group: prod }
  - { id: metrics, label: Metrics, sub: "errors, p95 and p99, checkouts/min", kind: store, tone: data }
  - { id: controller, label: Rollout controller, sub: compares canary with baseline }
  - { id: promote, label: Promote, sub: "25%, 50%, 100%", kind: system }
  - { id: rollback, label: Roll back, sub: canary back to 0%, kind: system }
edges:
  - { id: traffic, from: users, to: router }
  - { id: old, from: router, to: baseline }
  - { id: new, from: router, to: canary }
  - { id: ask, from: canary, to: flags }
  - { id: probe, from: synthetic, to: router }
  - { id: m1, from: baseline, to: metrics }
  - { id: m2, from: canary, to: metrics }
  - { id: compare, from: metrics, to: controller }
  - { id: up, from: controller, to: promote }
  - { id: down, from: controller, to: rollback, style: dashed }
steps:
  - caption: Version 2 is deployed next to version 1, with no users routed to it yet. Deploying is not releasing.
    focus: [baseline, canary]
  - caption: The router starts sending a small slice of real traffic to the canary, here 10%. It could be random users, staff first, or one region.
    focus: [users, router, canary]
    trace: [traffic, old, new]
  - caption: Inside v2, the new checkout is still behind a flag. Staff and the synthetic test account are on its allow-list; everyone else is hashed into a stable bucket, so a user gets the same answer on every page.
    focus: [canary, flags]
    trace: [ask]
  - caption: A synthetic check runs a key journey against production every few minutes, as a dedicated test account. It catches a broken certificate, DNS or config before customers report it.
    focus: [synthetic, router]
    trace: [probe]
  - caption: Both versions report the same signals, error rate, p95 and p99 latency, and business numbers such as checkouts per minute.
    focus: [baseline, canary, metrics]
    trace: [m1, m2]
  - caption: A rollout controller, such as Argo Rollouts or Flagger, compares the canary with the baseline on those signals, so the decision does not wait for a person watching a dashboard.
    focus: [metrics, controller]
    trace: [compare]
  - caption: If the canary is as good as the baseline, it promotes the next step, more traffic each time, until v2 takes it all and v1 can be removed.
    focus: [controller, promote]
    trace: [up]
  - caption: If it is worse, say twice the error rate, traffic goes back to v1. The old version never stopped running, so rolling back is just a routing change. A bad flag is undone the same way, by setting it back to 0%.
    focus: [controller, rollback]
    trace: [down]
```
