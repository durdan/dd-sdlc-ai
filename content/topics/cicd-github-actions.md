---
id: cicd-github-actions
title: "GitHub Actions: workflows, jobs, runners, matrices"
summary: YAML in .github/workflows, run on events, one fresh machine per job
why: "GitHub Actions is the CI system many teams meet first. Knowing what runs where, and what each job can see, is the difference between a fast pipeline and a slow, leaky one."
requires: [cicd-pipeline-design]
lesson: none
points:
  - title: Events start workflows
    text: "A workflow file says which events (push, pull_request, schedule, manual dispatch) start it. Each run gets the commit that triggered it."
  - title: Jobs run on separate runners
    text: "Every job gets a fresh machine. Jobs run in parallel unless `needs` orders them, and share files only through artifacts or caches."
  - title: Matrices fan out
    text: "A matrix runs the same job for each combination of values, such as several Node versions or operating systems."
  - title: Pin what you run
    text: "Third-party actions are code with access to your job. Pin them to a full commit SHA (or a lockfile) and give the job token the least permissions it needs."
quiz:
  - q: Job B writes `dist/` and job C, which has `needs` on B, runs `ls dist/`. What does C see?
    options: ["The files from B", "Nothing: each job runs on a fresh runner, so B must upload an artifact and C must download it", "Whatever is cached on the runner"]
    answer: 1
    explain: "Jobs don't share a filesystem. `needs` only orders them. Pass files with upload-artifact and download-artifact."
  - q: "Why pin `actions/checkout@3d3c42e…` rather than `actions/checkout@v7`?"
    options: ["SHAs run faster", "A tag can be moved to different code by whoever controls the repository; a full commit SHA can't", "Tags are deprecated"]
    answer: 1
    explain: "If an action's repository is compromised, the attacker can repoint its tags. A full-length SHA keeps running the code you reviewed. Dependabot can still bump the SHA for you."
  - q: "A matrix has `os: [ubuntu-latest, windows-latest]` and `node: [22, 24]`. How many jobs run?"
    options: ["2", "4", "6"]
    answer: 1
    explain: "A matrix runs every combination: 2 operating systems × 2 Node versions = 4 jobs, unless you add include or exclude entries."
links:
  - { title: "GitHub Actions documentation", url: "https://docs.github.com/en/actions" }
  - { title: "Workflow syntax (GitHub Actions)", url: "https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax" }
  - { title: "Secure use reference (GitHub Actions)", url: "https://docs.github.com/en/actions/reference/security/secure-use" }
  - { title: "Workflow dependency lockfiles (GitHub Actions)", url: "https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles" }
---
A GitHub Actions **workflow** is a YAML file in `.github/workflows/`. **Events** such as a push or a pull request start it. A workflow contains **jobs**; each job runs on a **runner** (a fresh virtual machine or container) and is a list of **steps**, which are either shell commands (`run`) or reusable **actions** (`uses`).

## A worked example

```yaml
# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read            # the default token can read the repo, nothing more

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true  # a new push to the same branch cancels the old run

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: [22, 24]
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: dist
          path: dist/
```

The `test` job fans out into two jobs, one per Node version. `build` waits for both (`needs: test`) and uploads `dist/` as an artifact, which a later deploy job or workflow can download. Nothing else carries over between jobs: each starts on a clean runner.

## Runners

GitHub-hosted runners (`ubuntu-latest`, `windows-latest`, `macos-latest`, plus larger and ARM sizes) are created for one job and thrown away. Self-hosted runners are your own machines. They can reach private networks and keep warm caches, but they can also keep state between jobs, so never let untrusted code (pull requests from forks of a public repository) run on them.

## The token and permissions

Each job gets an automatic `GITHUB_TOKEN`. Set `permissions` at the top of the workflow to the least it needs (often `contents: read`) and widen it per job, for example `packages: write` only on the job that publishes.

## Supply chain of the workflow itself

An action runs with whatever your job can reach: the token, secrets and the checked-out code. So:

- **Pin third-party actions to a full commit SHA** and keep the tag in a comment so people can read it; let Dependabot propose updates. GitHub now also has workflow dependency lockfiles (`.github/workflows/actions.lock`, in public preview at the time of writing) that record the commit for every action, including transitive ones.
- **Don't paste untrusted input into scripts.** `run: echo "${{ github.event.pull_request.title }}"` puts a pull request title straight into a shell command. Pass it through `env:` and refer to `"$TITLE"` instead.
- **Be careful with `pull_request_target`.** It runs with secrets and a write token on the base repository. Never check out and run a fork's code from it.
