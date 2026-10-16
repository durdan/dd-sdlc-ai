---
id: git-workflows
title: "Workflows: trunk-based, GitFlow and pull requests"
summary: How a team agrees to use branches
why: "Git allows any branching scheme. The one a team picks decides how often people hit conflicts, how fast changes reach users and how releases are cut."
requires: [git-remotes, git-merge-rebase]
lesson: none
points:
  - title: Trunk-based keeps one main line
    text: "Everyone merges small changes into main at least daily, behind feature flags when unfinished. Releases come from main."
  - title: GitFlow keeps several long-lived lines
    text: "develop, release/* and hotfix/* branches around main suit software with versioned releases to support."
  - title: A pull request is a proposal to merge
    text: "It is a hosting feature, not a Git one: a branch, a diff, review comments and CI checks before the merge."
  - title: Short branches, fewer conflicts
    text: "The longer a branch lives, the further it drifts from main and the harder it is to merge."
quiz:
  - q: "What lets trunk-based teams merge unfinished features into main without users seeing them?"
    options: ["Long-lived feature branches", "Feature flags (and branch by abstraction) that keep new code switched off", "Force-pushing main"]
    answer: 1
    explain: "The code is merged and deployed but not released. A flag decides at runtime who sees it, so integration happens daily while release stays a separate decision."
  - q: "Which kind of project is GitFlow still a reasonable fit for, according to its author?"
    options: ["A continuously deployed web app", "Software that is explicitly versioned, with several versions supported in the wild", "Any project with more than five developers"]
    answer: 1
    explain: "Vincent Driessen added a note in 2020 recommending a simpler flow for continuous delivery, and keeping git-flow for versioned products that maintain multiple releases."
  - q: "Where does a pull request live?"
    options: ["In the .git directory of each clone", "On the hosting service (GitHub, GitLab, Bitbucket), which tracks a source branch, a target branch, review and checks", "In a special commit"]
    answer: 1
    explain: "Git itself has no pull request object; git request-pull only writes a summary. The review, discussion and merge button belong to the host, which also exposes refs such as refs/pull/<n>/head."
links:
  - { title: "Trunk Based Development", url: "https://trunkbaseddevelopment.com/" }
  - { title: "A successful Git branching model, with its 2020 note (Vincent Driessen)", url: "https://nvie.com/posts/a-successful-git-branching-model/" }
  - { title: "About pull requests (GitHub Docs)", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests" }
  - { title: "Distributed Workflows (Pro Git)", url: "https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows" }
---
Git doesn't care how many branches you have or what they mean; a workflow is the team's agreement about that. The two ends of the range are trunk-based development, where everyone integrates small changes into one main branch at least once a day, and GitFlow, which keeps several long-lived branches for development, releases and hotfixes. Most teams today work close to the trunk-based end and use pull requests on a hosting service to review each change before it merges.

## Trunk-based development

There is one long-lived branch, `main`. Work happens on short-lived branches (hours to a day or two) or directly on `main` in small commits, and each change merges as soon as it passes review and CI. Unfinished features are merged too, switched off behind a feature flag or hidden behind an abstraction, so integration never waits for a feature to be complete. Releases are cut from `main`, either continuously or by tagging, with a short release branch only if a fix has to be backported.

Why teams choose it: conflicts stay small because nobody drifts far from `main`, CI tests what will actually ship, and deploying becomes routine. What it demands: a fast, reliable test suite, review that keeps up, and the discipline to keep `main` releasable at every commit.

## GitFlow

GitFlow, described by Vincent Driessen in 2010, has `main` holding only released versions and `develop` collecting finished features. Features branch from `develop`, a `release/1.4` branch is cut for stabilisation and merged into both `main` and `develop`, and `hotfix/*` branches start from `main` for urgent fixes. Releases are tagged on `main`.

It fits products with explicit version numbers where several versions are supported at once: installed software, libraries, firmware. For a web app that deploys continuously it is mostly overhead, and in 2020 its author added a note saying exactly that and suggesting a simpler flow such as GitHub flow (branch from `main`, open a pull request, merge, deploy).

## Pull requests

A pull request (GitLab says merge request) is a hosting-service feature: a proposal to merge a source branch into a target branch, with a diff, line comments, approvals and status checks. Git only provides the branches; the host adds the review. Habits that make them work:

- **Keep them small.** A few hundred lines get a real review; a few thousand get a skim.
- **Let machines check first.** Required CI checks, branch protection on `main` and code owners for sensitive paths.
- **Pick a merge method on purpose.** A merge commit keeps the branch's commits and records the join; squash merging turns the pull request into one commit on `main`; rebase merging replays each commit with no merge commit.
- **Open early as a draft** to share direction before the work is ready.

To try someone's pull request locally on GitHub, fetch the ref the host keeps for it:

```sh
git fetch origin pull/123/head:pr-123
git switch pr-123
```

Whatever the workflow, the same rule from the force-push topic applies: rewrite your own branch freely, never a shared one.
