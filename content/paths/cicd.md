---
id: cicd
title: "CI/CD and DevOps: from commit to production safely"
promise: "Build a pipeline that tells you within minutes whether a change works, ships the exact artifact it tested, proves where that artifact came from, and rolls changes out gradually enough that a bad one reaches few users and is undone automatically."
kind: skill
level: intermediate
tags: [devops, testing]
stages:
  - title: Integrate
    blurb: Small merges, fast pipelines
    topics: [cicd-continuous-integration, cicd-pipeline-design]
  - title: GitHub Actions
    blurb: Workflows, runners, OIDC
    topics: [cicd-github-actions, cicd-secrets-oidc]
  - title: Trust the artifact
    blurb: Reproducible, attested, signed
    topics: [cicd-reproducible-builds, cicd-supply-chain]
  - title: Release
    blurb: Promote, roll out, migrate
    topics: [cicd-environments, cicd-deploy-strategies, cicd-feature-flags, cicd-db-migrations, cicd-gitops]
  - title: Measure and run
    blurb: DORA, SLOs, on-call
    topics: [cicd-dora, cicd-slos]
bridges:
  - id: feature-flags
    why: "Flags drawn as a design pattern: how they switch features at runtime for chosen users, what goes wrong with them, and the trade-offs."
  - id: cell-based-architecture
    why: "Rolling a change out one cell at a time is the same idea as a canary, applied to whole copies of the system, so a bad deploy stays inside one cell."
  - id: contract-testing
    why: "Independent deploys only work if services can't break each other. Contract tests in the pipeline catch an incompatible API before it ships."
next: [evolve-safely, stay-up]
---
The workflow examples use GitHub Actions with actions pinned to full commit SHAs (current releases as of October 2026; the tag is in the comment). They are shown for reading, not run here. The JavaScript examples run in the page.
