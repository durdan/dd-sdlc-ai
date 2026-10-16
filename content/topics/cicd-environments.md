---
id: cicd-environments
title: Environments and promotion
summary: One artifact moves through dev, staging and production
why: "Every environment you add costs money and drifts from production. Knowing what each one is for, and promoting the same artifact through them, keeps staging useful instead of a place where bugs hide."
requires: [cicd-pipeline-design]
lesson: none
points:
  - title: Same artifact, different config
    text: "The build is promoted unchanged; only configuration and secrets differ per environment, injected at deploy time."
  - title: Each stage answers a question
    text: "Preview: does this change look right? Staging: does it work with real-like dependencies? Production: does it work for users?"
  - title: Promotion is a gate
    text: "Moving to the next environment happens when checks pass, sometimes with a human approval. The record of who promoted what is your audit trail."
  - title: Drift is the enemy
    text: "Staging that differs from production in versions, data shape or infrastructure gives false confidence. Define both from the same code."
quiz:
  - q: Where should a database password for production live?
    options: ["In the image, set at build time", "In a secret store, injected into the production environment when the app is deployed or started", "In a committed .env.production file"]
    answer: 1
    explain: "Baking it into the image ties the artifact to one environment and leaks the secret to anyone who can pull the image. Configuration and secrets come from the environment."
  - q: "Staging passes, production fails because production runs PostgreSQL 17 and staging runs 15. What is the root problem?"
    options: ["Not enough tests", "Environment drift: staging and production aren't defined from the same infrastructure code", "PostgreSQL 17 is buggy"]
    answer: 1
    explain: "Define environments from one set of infrastructure code with per-environment parameters, so versions match by construction."
  - q: What is a preview environment?
    options: ["A permanent copy of production", "A short-lived deployment of one pull request, torn down when it merges or closes", "The developer's laptop"]
    answer: 1
    explain: "Previews let reviewers click through a change before it merges, then disappear. They need cheap, automated setup and safe test data."
links:
  - { title: "Managing environments for deployment (GitHub Actions)", url: "https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments" }
  - { title: "The Twelve-Factor App: Config", url: "https://12factor.net/config" }
  - { title: "Continuous delivery (DORA capabilities)", url: "https://dora.dev/capabilities/continuous-delivery/" }
---
An environment is a place your software runs: a preview per pull request, a shared staging system, production. **Promotion** is moving one build from one environment to the next once it has earned it. The rule that makes this work is simple: the artifact never changes on the way; only its configuration does.

## What each environment is for

Have as few environments as you can justify, and know the question each one answers:

- **Local and CI**: does the code build and pass its tests?
- **Preview** (one per pull request): does the change look and behave right to a reviewer? Short-lived and disposable.
- **Staging**: does it work with real-like infrastructure, data volumes and neighbouring services? Often where migrations and end-to-end tests run first.
- **Production**: does it work for users? Some things can only be learned here, which is why canaries and feature flags exist.

Environments that don't answer a distinct question ("QA2", "UAT-old") mostly add waiting.

## Config comes from the environment

The same image runs everywhere, so anything that differs (URLs, credentials, feature defaults, resource sizes) is supplied at deploy time from environment variables, a config service or a secret store. That way:

- what you tested in staging is byte-for-byte what reaches production;
- secrets never sit inside an image someone can pull;
- a rollback is "deploy the previous digest", not "rebuild the old commit".

## Promotion as a pipeline

```yaml
# Sketch: one build, then deploy jobs that reuse its output.
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "build and push the image, record its digest"
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: echo "deploy the digest from build to staging, then smoke test"
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production   # can require reviewers, a wait timer, or main only
    steps:
      - run: echo "deploy the same digest to production"
```

In GitHub Actions, an environment can require reviewers, restrict which branches may deploy to it, and hold its own secrets. Other systems (Argo CD, Spinnaker, cloud deploy services) model the same idea as stages and approvals.

## Keeping staging honest

Define every environment from the same infrastructure code (Terraform, Pulumi, Helm values) with parameters for size and names. Keep versions of databases, runtimes and managed services aligned. Seed staging with realistic data shapes, generated or anonymised, never raw copies of production personal data. And watch for the slow drift of manual fixes: if someone changes staging by hand, the next deploy from code should put it back.
