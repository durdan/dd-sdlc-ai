---
id: qa-tests-in-ci
title: Running tests in CI
summary: Fast feedback, sharding, and retries that don't lie
why: "A suite only protects you if it runs on every change, finishes while the author is still waiting, and is trusted when it goes red."
requires: [qa-flaky-tests]
lesson: none
points:
  - title: Fastest checks first
    text: "Types, lint and unit tests in minutes; integration and end-to-end after. Fail early on the cheap stuff."
  - title: Parallel, then sharded
    text: "Workers use the cores of one machine. Shards split the suite across machines, and the reports are merged at the end."
  - title: Retries hide bugs
    text: "A retry turns a red build green without fixing anything. Report every test that only passed on retry, and track how often it happens."
  - title: Quarantine with a limit
    text: "Move known-flaky tests out of the gate so the rest stays trusted, but cap how many and for how long."
quiz:
  - q: "In Playwright, a test fails on the first try and passes on the retry. How is it reported?"
    options: [Passed, Flaky, Failed]
    answer: 1
    explain: "Playwright has three outcomes: passed (first try), flaky (failed, then passed on a retry) and failed (failed every time). --fail-on-flaky-tests makes flaky tests fail the run."
  - q: Why can retries be harmful even when every flaky test really is just a test problem?
    options:
      - They are slow but harmless
      - "They also hide intermittent bugs in the product, such as races and timeouts, which users then hit"
      - They corrupt the test report
    answer: 1
    explain: "A retry can't tell a flaky test from a flaky feature. If one checkout in twenty fails in CI and the retry passes, one checkout in twenty may also fail for customers."
  - q: "You shard a Playwright suite four ways without fullyParallel. How are tests divided?"
    options:
      - Test by test, evenly
      - "By file, so one shard can get a huge file and finish long after the others"
      - Randomly
    answer: 1
    explain: "Without fullyParallel, sharding works on whole files. Turn on fullyParallel to balance at the level of single tests, or split big files."
links:
  - { title: "Sharding (Playwright)", url: "https://playwright.dev/docs/test-sharding" }
  - { title: "Retries (Playwright)", url: "https://playwright.dev/docs/test-retries" }
  - { title: "Eradicating Non-Determinism in Tests: quarantine (Martin Fowler)", url: "https://martinfowler.com/articles/nonDeterminism.html" }
  - { title: "Running variations of jobs in a workflow (GitHub Actions)", url: "https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs" }
---
In CI, every change runs the whole suite on a clean machine. To be useful it has to be fast enough that people wait for it, and trustworthy enough that a red build means a real problem. Parallel workers and shards take care of speed. Trust comes from how you handle retries and flaky tests.

## Order and speed

Run checks from cheapest to most expensive and stop at the first failure: type check and lint, then unit tests, then integration tests with containers, then end-to-end tests against a preview build. Cache dependencies, and with Playwright install only the browsers you use (`npx playwright install --with-deps chromium`).

Playwright runs test files in parallel **workers** on one machine (`--workers`, 50% of logical cores by default). For more speed, **shard** across machines. Each job runs one slice with `--shard=1/4` and so on. Use the `blob` reporter, then merge the slices into one report:

```yaml
# .github/workflows/e2e.yml (the test job)
jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }} --reporter=blob
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report
# A later job downloads all blob-report-* artifacts into one folder and runs:
#   npx playwright merge-reports --reporter html ./all-blob-reports
```

Set `fullyParallel: true` so the shards are balanced test by test rather than file by file.

## What retries hide

Retries are tempting: set `retries: 2` and the build goes green. But a retry can't tell a flaky test from a flaky product. Here a checkout fails one call in three, and every CI run still ends green:

```js run
let calls = 0
let errors = 0
function placeOrder() {
  calls++
  if (calls % 3 === 0) { errors++; return "error" } // a race that loses one time in three
  return "ok"
}
function runWithRetries(test, retries) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (test()) return attempt === 0 ? "passed" : `flaky (passed on retry ${attempt})`
  }
  return "failed"
}

const runs = []
for (let run = 1; run <= 6; run++) runs.push(runWithRetries(() => placeOrder() === "ok", 2))
console.log(runs.join("\n"))
console.log(`all ${runs.length} runs green, but ${errors} of ${calls} calls failed`)
```

If you use retries, make them visible. Playwright already reports such tests as **flaky**. Keep the trace from the first retry (`trace: "on-first-retry"`), chart the flaky rate over time, and consider `--fail-on-flaky-tests` on the main branch. Never retry unit tests: they have no excuse to be non-deterministic.

## Quarantine, with limits

When a flaky test can't be fixed today, move it out of the gating suite (a tag, a separate project, or `test.fixme` with a ticket) so everyone else can trust the build again. A quarantined test protects nothing, so give quarantine limits: an owner, a ticket, a maximum number of tests and a maximum time (Fowler suggests something like a week). When a limit is reached, fixing the quarantined tests comes before new work.

## Make failures easy to act on

Upload reports, traces, screenshots and container logs as artifacts for every failed job. Show the failing test's name and first error in the pull request. Re-run only the failures with `--last-failed` while you debug, and on large suites use `--only-changed` for a quick first pass before the full run.
