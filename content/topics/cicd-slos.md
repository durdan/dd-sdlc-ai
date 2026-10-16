---
id: cicd-slos
title: "SLOs, error budgets and on-call"
summary: Decide how reliable is reliable enough, then spend the rest on change
why: "100% reliability is impossible and chasing it stops all change. An SLO says how much unreliability users will tolerate, and the error budget turns that into a rule for when to ship and when to slow down."
requires: [cicd-dora]
lesson: none
points:
  - title: SLI, SLO, SLA
    text: "An SLI is a measurement (the share of requests served successfully and fast). An SLO is a target for it over a window. An SLA is a contract with consequences, usually looser than the SLO."
  - title: The budget is what's left
    text: "A 99.9% SLO over 30 days allows 0.1% of requests, or about 43 minutes of full outage, to fail. That is the error budget."
  - title: The budget sets the pace
    text: "Budget left: ship. Budget burned: freeze risky changes and spend effort on reliability until it recovers."
  - title: Alert on burn rate
    text: "Page a human when the budget is being consumed fast enough to run out soon, not on every spike in a graph."
quiz:
  - q: "An SLO is 99.9% of requests successful over 30 days. The service handles 10 million requests in that window. How many failed requests does the error budget allow?"
    options: ["1,000", "10,000", "100,000"]
    answer: 1
    explain: "0.1% of 10,000,000 is 10,000. Every failed request beyond that means the SLO is missed for the window."
  - q: "Halfway through the month, 90% of the error budget is gone. Under a typical error budget policy, what happens?"
    options: ["Nothing until the month ends", "Risky releases pause and the team prioritises reliability work until the budget recovers", "The SLO is lowered"]
    answer: 1
    explain: "The policy, agreed in advance, ties the budget to decisions. Lowering the SLO is a separate conversation about what users actually need."
  - q: Why page on error budget burn rate rather than on CPU above 80%?
    options: ["CPU isn't measurable", "Burn rate measures what users experience and how urgent it is; high CPU may harm nobody", "Pagers can't show CPU"]
    answer: 1
    explain: "Paging should mean users are being hurt, or soon will be, at a rate that needs a human now. Causes like CPU belong on dashboards and in tickets."
links:
  - { title: "Service Level Objectives (Google SRE Book)", url: "https://sre.google/sre-book/service-level-objectives/" }
  - { title: "Implementing SLOs (Google SRE Workbook)", url: "https://sre.google/workbook/implementing-slos/" }
  - { title: "Alerting on SLOs (Google SRE Workbook)", url: "https://sre.google/workbook/alerting-on-slos/" }
  - { title: "Error budget policy (Google SRE Workbook)", url: "https://sre.google/workbook/error-budget-policy/" }
---
Fast delivery is only good if the service stays usable. Site reliability engineering gives you a way to put a number on "usable": a **service level objective (SLO)**. Whatever the SLO doesn't require is the **error budget**, room for failure that you can spend on releases, experiments and maintenance. When it runs out, reliability work comes first.

## SLI, SLO, SLA

- An **SLI** (indicator) is a ratio of good events to all events, measured where users feel it: the share of HTTP requests that return non-5xx in under 300 ms, the share of jobs that finish within an hour.
- An **SLO** (objective) is a target for an SLI over a window: 99.9% over a rolling 28 or 30 days.
- An **SLA** (agreement) is a contract with refunds or penalties. Set it looser than the SLO, so you notice trouble before it costs money.

Pick SLOs from what users need, not from what the system happens to do today. Few users notice the difference between 99.99% and 99.999%, but the second costs far more.

## The error budget

```js run
const slo = 0.999
const windowDays = 30
const minutes = windowDays * 24 * 60
console.log("budget as downtime:", (minutes * (1 - slo)).toFixed(1), "minutes in", windowDays, "days")

const requests = 10_000_000
const allowed = Math.round(requests * (1 - slo))
const failedSoFar = 7_200
console.log(`budget: ${allowed} failed requests, used ${failedSoFar} (${Math.round((failedSoFar / allowed) * 100)}%)`)

// Burn rate: how fast the budget is being used compared with "exactly on budget".
const lastHour = { total: 14_000, failed: 210 }
const burn = lastHour.failed / lastHour.total / (1 - slo)
console.log("burn rate over the last hour:", burn.toFixed(1) + "x")
console.log(burn >= 14.4 ? "page: at this rate 2% of the monthly budget goes in one hour" : "no page")
```

A burn rate of 1 uses exactly the whole budget by the end of the window. The SRE Workbook suggests paging at fast burns (around 14.4× over an hour, which spends 2% of a 30-day budget in that hour) and filing a ticket for slow ones, using two windows so alerts both fire quickly and stop quickly.

## An error budget policy

Agree in writing, before anything goes wrong, what happens as the budget runs down. For example: if the budget is exhausted, pause feature releases except security fixes, and put the next sprint into the top causes of failure; if a single incident burns more than a fifth of the budget, it gets a postmortem. The policy turns arguments about "are we being too risky?" into a shared rule.

## On-call that people can sustain

- **Page on symptoms**, like SLO burn, and route causes (disk filling, CPU) to tickets and dashboards.
- **Every page should need a human now.** If the right response is "wait and see", it shouldn't page.
- **Runbooks** for each alert: what it means, how to check, how to mitigate, and how to roll back the last deploy.
- **Blameless postmortems** that end in actions on the system, not on a person.
- **Watch the load.** Too many pages per shift is itself an incident to fix.
