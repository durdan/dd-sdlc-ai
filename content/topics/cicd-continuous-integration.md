---
id: cicd-continuous-integration
title: What continuous integration really means
summary: Small merges to main, many times a day, on a build you trust
why: "Most teams have a CI server. Far fewer integrate continuously. The difference shows up as week-long merges, a main branch nobody trusts, and releases that need a freeze."
requires: [git-workflows]
lesson: none
points:
  - title: A practice, not a tool
    text: "Continuous integration means everyone merges small changes into the shared main branch at least daily. A build server that tests long-lived branches is not CI."
  - title: Main is always releasable
    text: "Every merge is built and tested. If main goes red, fixing it beats every other task, because everyone builds on it."
  - title: Small batches
    text: "A change of a few hundred lines is quick to review, quick to test and quick to revert. Risk grows faster than size."
  - title: Fast feedback
    text: "The checks on a pull request should finish in roughly ten minutes, so the author is still thinking about the change when the result arrives."
quiz:
  - q: A team runs a full test suite on every push to feature branches that live for three weeks. Are they doing continuous integration?
    options: ["Yes, every push is tested", "No: the work is not integrated with everyone else's until the merge, which is exactly what CI is meant to avoid", "Only if the tests pass"]
    answer: 1
    explain: "Testing a branch in isolation says nothing about how it combines with three weeks of other people's changes. CI is about merging into the shared line often, and testing that."
  - q: "Main has been red for two hours. What does a CI team do?"
    options: ["Keep merging; the next release will fix it", "Stop merging and fix it or revert the breaking change first", "Disable the failing test"]
    answer: 1
    explain: "A red main blocks everyone from knowing whether their own change works. Revert first, investigate after; disabling a test hides the problem rather than fixing it."
  - q: How can you merge unfinished features into main every day without users seeing them?
    options: ["You can't; wait until the feature is done", "Hide them behind a feature flag or build them in small, invisible steps", "Merge them into a release branch instead"]
    answer: 1
    explain: "Flags, branch by abstraction and dark launches let code reach main, and even production, before the feature is switched on."
links:
  - { title: "Continuous integration (DORA capabilities)", url: "https://dora.dev/capabilities/continuous-integration/" }
  - { title: "Trunk-based development (DORA capabilities)", url: "https://dora.dev/capabilities/trunk-based-development/" }
  - { title: "Continuous Integration (Martin Fowler)", url: "https://martinfowler.com/articles/continuousIntegration.html" }
---
Continuous integration is a habit, not a product. Everyone on the team merges small changes into one shared branch, usually `main`, at least once a day. Each merge is built and tested automatically, and the team treats a broken main as an emergency. The CI server is just the tool that makes the habit cheap.

## Why integrate so often

Two people changing the same code for three weeks will collide. The longer they wait, the bigger the collision, and the harder it is to tell whose change caused a failure. Merging daily turns one painful merge into many trivial ones. It also means the tests run against the code that will actually ship, not against a private copy of it.

DORA's research has found the same thing for years: teams that work in small batches on a short-lived trunk deliver more often and break production less. Speed and stability go together; they are not a trade-off.

## What it takes

- **One shared line.** Branches live for hours or a day or two, not weeks. Pull requests are fine as long as they are small and merged quickly.
- **A build anyone can run.** One command builds and tests the project on a clean machine. If it only works on the build server, or only on one laptop, it is not trusted.
- **Tests you believe.** A red build has to mean a real problem. Flaky tests teach people to click "re-run" and ignore failures, which defeats the point.
- **Fast feedback.** Aim for checks that finish in about ten minutes. Slow suites push people towards bigger, less frequent merges.
- **Fix main first.** When main breaks, revert or fix within minutes. Nobody merges on top of a red build.

## Unfinished work on main

The usual objection is "my feature isn't ready". You don't have to ship a feature to merge its code. Put new behaviour behind a feature flag, add a new code path next to the old one and switch over later (branch by abstraction), or build the backend before any UI uses it. The code is integrated and tested every day; users see it only when you turn it on.

## Signs you are not really doing CI

- Pull requests that sit open for a week and touch dozens of files.
- A "merge day" or a code freeze before every release.
- People asking "is main green?" before starting work.
- Tests that pass on retry and nobody investigates.

Fixing these is mostly about batch size and discipline. A faster pipeline helps, and the next topic shows how to build one.
