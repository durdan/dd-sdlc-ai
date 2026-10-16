---
id: cicd-deploy-strategies
title: "Rolling, blue-green and canary deploys"
summary: Replace the old version without taking the service down
why: "Most outages start with a change. How you roll a change out decides how many users a bad version reaches, and how quickly you can take it back."
requires: [cicd-environments]
lesson: none
points:
  - title: Rolling
    text: "Replace instances a few at a time. Cheap and the default in Kubernetes, but old and new versions serve traffic side by side for a while."
  - title: Blue-green
    text: "Run the new version alongside the old one, then switch all traffic at once. Rollback is switching back, at the cost of double capacity during the swap."
  - title: Canary
    text: "Send a small slice of traffic to the new version, compare its metrics with the old one, then widen step by step or abort."
  - title: Automate the rollback
    text: "Decide in advance which signals (error rate, latency, saturation) mean abort, and let the pipeline act on them without waiting for a human."
quiz:
  - q: Why must a change deployed with a rolling update be backward compatible?
    options: ["Kubernetes requires it", "Old and new versions run at the same time, sharing the same database, caches and queues", "It doesn't need to be"]
    answer: 1
    explain: "During the rollout, requests hit both versions. A new message format or a dropped column can break the old pods still serving traffic."
  - q: "A canary at 5% shows 2.1% errors; the baseline shows 0.3%. What should happen?"
    options: ["Continue to 50%; 5% is small", "Abort and roll back automatically, then investigate", "Wait a day and look again"]
    answer: 1
    explain: "Seven times the baseline error rate is a clear failure. The point of a canary is that only 5% of traffic saw it; widening would spread it."
  - q: What is the main cost of blue-green deployment?
    options: ["It can't be rolled back", "You need capacity for two full copies of the service during the switch, and shared state such as the database still has to work with both", "It only works for static sites"]
    answer: 1
    explain: "Switching back is instant, but you pay for double capacity, and the database can't be blue and green at once, so schema changes still need care."
links:
  - { title: "Canarying releases (Google SRE Workbook)", url: "https://sre.google/workbook/canarying-releases/" }
  - { title: "Deployments: rolling update (Kubernetes)", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" }
  - { title: "BlueGreenDeployment (Martin Fowler)", url: "https://martinfowler.com/bliki/BlueGreenDeployment.html" }
---
A deployment strategy is how traffic moves from the old version to the new one. The three common ones trade cost against blast radius: **rolling** swaps instances gradually, **blue-green** swaps all traffic at once between two full copies, and **canary** gives the new version a small slice first and widens only if its metrics look healthy.

## Rolling updates

Instances are replaced a few at a time: start a new one, wait until it is ready, stop an old one, repeat. Kubernetes Deployments do this by default (`maxSurge`, `maxUnavailable`). It needs no extra capacity beyond the surge and no special routing. The catch is that for the length of the rollout, old and new versions serve traffic together. Every change must work in that mixed state, and a bad version is gradually reaching everyone unless something stops the rollout.

## Blue-green

Run the current version (blue) and the new version (green) as two complete environments. Test green privately, then switch the router or load balancer so all traffic goes to green. If something breaks, switch back: rollback takes seconds. The costs are double capacity during the switch, and shared state. There is usually one database, so schema changes must work with both colours (see the migrations topic).

## Canary

Route a small share of real traffic, say 1% then 5% then 25%, to the new version, and compare it with the old version serving the rest. Compare like with like: the canary against a baseline of the same size started at the same time, on the metrics users feel (error rate, latency, saturation). Tools like Argo Rollouts and Flagger, service meshes and cloud load balancers can do the traffic split and the analysis.

This toy analysis compares each step's canary error rate with the baseline and stops at the first bad step:

```js run
const steps = [
  { weight: 1, baseline: { req: 9900, err: 30 }, canary: { req: 100, err: 0 } },
  { weight: 5, baseline: { req: 9500, err: 28 }, canary: { req: 500, err: 2 } },
  { weight: 25, baseline: { req: 7500, err: 24 }, canary: { req: 2500, err: 55 } },
  { weight: 50, baseline: { req: 5000, err: 15 }, canary: { req: 5000, err: 14 } },
]
const rate = ({ req, err }) => err / req
const maxRatio = 2 // abort if the canary's error rate is more than twice the baseline's

for (const s of steps) {
  const b = rate(s.baseline)
  const c = rate(s.canary)
  const ok = c <= Math.max(b * maxRatio, 0.001) // small floor so 0 vs 0.0001 isn't an abort
  console.log(`${s.weight}%: baseline ${(b * 100).toFixed(2)}% canary ${(c * 100).toFixed(2)}% -> ${ok ? "continue" : "ABORT, roll back"}`)
  if (!ok) break
}
```

Real analysis also needs enough traffic for the difference to mean something; a canary that served 40 requests proves very little.

## Rollback that doesn't need a meeting

Decide before the deploy what "bad" means, and wire it to an automatic action: pause the rollout, shift traffic back, or redeploy the previous digest. Keep the previous version's artifact and configuration ready. And remember that rolling back code doesn't roll back data. If the new version wrote data the old one can't read, rollback fails, which is why database changes are split into backward-compatible steps.
