---
id: cicd-pipeline-design
title: "Pipeline design: stages, caching, build once"
summary: Fail fast, cache the slow parts, promote one artifact
why: "A slow or leaky pipeline pushes people towards big batches and manual steps. A well-shaped one gives answers in minutes and ships exactly what it tested."
requires: [cicd-continuous-integration, qa-tests-in-ci]
lesson: none
points:
  - title: Cheap checks first
    text: "Lint and type checks, then unit tests, then slower integration and end-to-end tests. Stop at the first failure so feedback comes quickly."
  - title: Run in parallel where you can
    text: "Independent jobs run side by side. The pipeline takes as long as its longest chain, not the sum of every step."
  - title: Cache inputs, not results you can't trust
    text: "Cache downloaded dependencies keyed on the lockfile. Never let a cache decide whether code is correct."
  - title: Build once, promote everywhere
    text: "Build the artifact one time, give it an immutable identity, and deploy that same artifact to staging and production."
quiz:
  - q: "Staging and production each run their own `docker build` from the same commit. What is the risk?"
    options: ["None; same commit means same image", "The two images can differ (new base image, new dependency version), so production runs something staging never tested", "Builds will be slower but identical"]
    answer: 1
    explain: "A rebuild can pick up a moved base image tag, a new transitive dependency or a different toolchain. Build once, push by digest, and promote that digest."
  - q: What makes a good dependency cache key?
    options: ["The branch name", "A hash of the lockfile (plus OS and tool version)", "The date"]
    answer: 1
    explain: "When the lockfile changes, the key changes and the cache is rebuilt. Keying on the branch or date either misses real changes or throws away good caches."
  - q: "Your pipeline runs lint (1 min), unit tests (4 min) and an image build (6 min) one after another, then e2e (8 min). Lint and unit tests don't depend on the image. What is the quickest safe layout?"
    options: ["Keep it sequential", "Run lint, unit tests and the image build in parallel, then e2e once the image exists", "Skip lint"]
    answer: 1
    explain: "The critical path becomes 6 + 8 = 14 minutes instead of 19, and a lint error still fails within a minute."
links:
  - { title: "Dependency caching reference (GitHub Actions)", url: "https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching" }
  - { title: "Deployment automation (DORA capabilities)", url: "https://dora.dev/capabilities/deployment-automation/" }
  - { title: "Continuous delivery (DORA capabilities)", url: "https://dora.dev/capabilities/continuous-delivery/" }
---
A pipeline is the automated path from a commit to something you can deploy. Its shape decides how quickly people learn that a change is broken, and whether what reaches production is what you actually tested. Three ideas cover most of it: fail fast, keep the slow parts off the critical path, and build the artifact exactly once.

## Stages and failing fast

Order checks by cost. Formatting, lint and type checks take seconds and catch a lot. Unit tests come next. Integration tests with real databases, image builds and end-to-end tests are slower, so they run after the cheap gates pass, or in parallel with them if they don't depend on each other.

```text
lint ────────┐
unit ────────┼──> e2e (needs the image) ──> publish
build-image ─┘
```

Think about the **critical path**: the longest chain of jobs that depend on each other. Parallel jobs are nearly free; shortening the critical path is what makes the pipeline faster.

## Caching

Most pipeline time goes on downloading and compiling the same things again. Cache them:

- **Package caches** (npm, pip, Maven, Go modules) keyed on a hash of the lockfile, the OS and the tool version.
- **Build caches** (Docker layers, Gradle, Bazel, Turborepo) where the tool itself checks inputs.

A cache should only make things faster. If deleting it changes whether the build passes, something is wrong. And cache downloads, not secrets: a cache can be read by later runs, sometimes from other branches.

## Artifacts: build once, promote

The output of the build stage is an **artifact**: a container image, a JAR, a tarball, a mobile build. Build it one time, from one commit, and give it an identity that can't change. For images that is the digest (`sha256:...`), not a tag like `latest`. Every later stage, staging tests and the production deploy alike, uses that same artifact.

Rebuilding per environment looks harmless but isn't. Between the staging build and the production build a base image tag can move or a dependency range can resolve to a new version. Then production runs code nobody tested. Configuration differs between environments; the artifact should not.

## Keep the pipeline in the repository

The pipeline definition lives next to the code, is reviewed like code, and changes in the same pull request as the build it describes. Anyone should be able to run the same steps locally (`make test`, `npm run ci`) so the pipeline is a thin wrapper, not a second build system only the CI server understands.

## When to stop and look

Track how long the pipeline takes and how often it fails for reasons unrelated to the change. If the median run creeps past fifteen minutes, or reruns become routine, fix that before adding more checks.
