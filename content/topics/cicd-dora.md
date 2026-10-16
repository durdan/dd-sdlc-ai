---
id: cicd-dora
title: "DORA metrics: measuring delivery"
summary: Five numbers for throughput and instability
why: "Without measurement, delivery debates are opinions. DORA's metrics are well researched, cheap to collect and hard to game if you track them together."
requires: [cicd-continuous-integration]
lesson: none
points:
  - title: Throughput
    text: "Change lead time, deployment frequency and failed deployment recovery time: how quickly changes reach production and how fast you recover when one goes wrong."
  - title: Instability
    text: "Change fail rate and deployment rework rate: how often deployments need immediate fixing, and how many deploys are unplanned responses to incidents."
  - title: Speed and stability go together
    text: "DORA's research keeps finding that top teams do well on all five. Small, frequent changes are both faster and safer."
  - title: Per service, for improvement
    text: "Measure one application at a time, compare it with itself over time, and never use the numbers to rank teams or people."
quiz:
  - q: "In DORA's current model, how many software delivery performance metrics are there?"
    options: ["Four", "Five", "Seven"]
    answer: 1
    explain: "The original four keys gained deployment rework rate, and time to restore became failed deployment recovery time."
  - q: How does DORA define change lead time?
    options: ["From ticket creation to deploy", "From a change being committed to version control to it being deployed in production", "From pull request to merge"]
    answer: 1
    explain: "It starts at the commit, so it measures the delivery process (review, CI, deploy) rather than planning or design time."
  - q: A manager sets a target of 20 deployments per day for every team. What is the likely result?
    options: ["Better software", "Teams split deploys artificially to hit the number, while what matters (stability, lead time) may not change", "Nothing"]
    answer: 1
    explain: "A metric that becomes a target stops measuring. Use the five together, per service, to find bottlenecks, not as goals for comparison."
links:
  - { title: "DORA's software delivery performance metrics", url: "https://dora.dev/guides/dora-metrics/" }
  - { title: "DORA Quick Check", url: "https://dora.dev/quickcheck/" }
  - { title: "DORA research", url: "https://dora.dev/research/" }
---
DORA (DevOps Research and Assessment) has studied software delivery for more than a decade. Its software delivery performance metrics are a small set of outcome measures that predict both organisational performance and team well-being. The model has grown from the original "four keys" to **five metrics**, split into throughput and instability.

## The five metrics

**Throughput**: how many changes move through the system, and how fast.

- **Change lead time**: time from a change being committed to version control to it running in production.
- **Deployment frequency**: how many deployments happen in a period, or the time between them.
- **Failed deployment recovery time**: how long it takes to recover from a deployment that fails and needs immediate intervention. This replaced the older, broader "time to restore service" (MTTR).

**Instability**: how well deployments go.

- **Change fail rate**: the share of deployments that need immediate intervention afterwards, typically a rollback or hotfix.
- **Deployment rework rate**: the share of deployments that are unplanned and happen because of an incident in production.

## Computing them

You need two event streams: deployments (with the commits they contain) and failures linked to deployments. This sketch computes the metrics for one service over a week:

```js run
const hours = (a, b) => (new Date(b) - new Date(a)) / 36e5
const deploys = [
  { at: "2026-10-05T10:00Z", commits: ["2026-10-05T08:30Z"], failed: false, unplanned: false },
  { at: "2026-10-06T15:00Z", commits: ["2026-10-06T09:00Z", "2026-10-06T13:00Z"], failed: true, recoveredAt: "2026-10-06T15:40Z", unplanned: false },
  { at: "2026-10-06T15:35Z", commits: ["2026-10-06T15:20Z"], failed: false, unplanned: true }, // hotfix
  { at: "2026-10-08T11:00Z", commits: ["2026-10-07T16:00Z"], failed: false, unplanned: false },
  { at: "2026-10-09T09:30Z", commits: ["2026-10-09T08:00Z"], failed: false, unplanned: false },
]
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

const leadTimes = deploys.flatMap((d) => d.commits.map((c) => hours(c, d.at)))
const failures = deploys.filter((d) => d.failed)
console.log("deployment frequency:", deploys.length, "per week")
console.log("median change lead time:", median(leadTimes).toFixed(1), "h")
console.log("change fail rate:", Math.round((failures.length / deploys.length) * 100) + "%")
console.log("failed deployment recovery time:", failures.map((d) => hours(d.at, d.recoveredAt) * 60 + " min").join(", "))
console.log("deployment rework rate:", Math.round((deploys.filter((d) => d.unplanned).length / deploys.length) * 100) + "%")
```

Medians are more honest than averages here: one change that sat for a month would drag an average far away from the typical experience.

## Using them well

- **Track all five together.** Pushing deployment frequency alone can raise the fail rate; chasing a low fail rate alone tends to slow everything down. DORA's data says the best teams do well on all of them, because small changes are both quicker and safer.
- **Per application, over time.** Different systems have different contexts. Compare a service with its own history, not with another team's.
- **For learning, not ranking.** As soon as the numbers decide bonuses, people optimise the numbers. Use them to find the bottleneck (review waits, slow tests, manual approvals) and check whether a fix helped.
- **Start rough.** A spreadsheet of deploys and incidents for a month already shows where time goes. DORA's Quick Check gives a baseline in a few minutes.
