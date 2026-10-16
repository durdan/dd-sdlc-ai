---
id: cicd-gitops
title: GitOps
summary: Git holds the desired state; an agent makes the cluster match it
why: "When deploys are commits and an agent keeps reconciling, you get an audit trail, easy rollback and no CI job holding admin credentials to production."
requires: [cicd-environments]
lesson: none
points:
  - title: Desired state in Git
    text: "What should run (images by digest, replicas, config) is written declaratively in a repository, reviewed through pull requests."
  - title: Pull, not push
    text: "An agent inside the environment (Argo CD, Flux) pulls that state and applies it, so CI never needs credentials to production."
  - title: Continuous reconciliation
    text: "The agent keeps comparing the live system with Git and corrects drift, including manual changes."
  - title: Rollback is a revert
    text: "Going back to the previous version is reverting a commit; the agent does the rest."
quiz:
  - q: "In a GitOps setup, what does CI do after building a new image?"
    options: ["Runs kubectl apply against production", "Opens or merges a commit that updates the image digest in the config repository", "Nothing; the agent builds images"]
    answer: 1
    explain: "CI builds and publishes; the change to what runs is a commit. The in-cluster agent notices it and applies it."
  - q: Someone runs `kubectl scale --replicas=10` by hand. What happens with reconciliation turned on?
    options: ["It stays at 10 forever", "The agent sees drift from Git and sets it back to the declared value", "The cluster rejects the command"]
    answer: 1
    explain: "Git is the source of truth. To change replicas for good, change Git (or let an autoscaler own that field and tell the agent to ignore it)."
  - q: Which is one of the four OpenGitOps principles?
    options: ["Deploy on Fridays only", "Desired state is pulled automatically by software agents", "Every service has its own cluster"]
    answer: 1
    explain: "The principles are: declarative, versioned and immutable, pulled automatically, and continuously reconciled."
links:
  - { title: "OpenGitOps principles", url: "https://opengitops.dev/" }
  - { title: "Argo CD documentation", url: "https://argo-cd.readthedocs.io/en/stable/" }
  - { title: "Flux documentation", url: "https://fluxcd.io/flux/" }
---
GitOps is a way of running deployments where a Git repository describes what should be running, and software inside the environment keeps making reality match it. You deploy by merging a commit. You roll back by reverting one. The CNCF's OpenGitOps project sums it up in four principles: the desired state is **declarative**, **versioned and immutable**, **pulled automatically**, and **continuously reconciled**.

## How it fits with CI

CI still builds, tests, scans and publishes the artifact. What changes is the last step. Instead of a CI job calling `kubectl apply` or a cloud API with production credentials, CI (or a person) updates a config repository: "the `checkout` service now runs image `…@sha256:4f1e…`". An agent such as **Argo CD** or **Flux**, running inside the cluster, watches that repository and applies the change.

```yaml
# config repo: apps/checkout/production/kustomization.yaml (sketch)
resources:
  - ../base
images:
  - name: ghcr.io/my-org/checkout
    digest: sha256:4f1e0000000000000000000000000000000000000000000000000000000000aa
```

Pinning the image by digest keeps the "versioned and immutable" promise: the commit describes exactly what runs.

## Why pull matters

With push-based deploys, the CI system needs credentials that can change production, and so does anything that can compromise CI. With pull, the agent already lives inside the environment and only needs read access to Git. Production credentials never leave it. It also works for clusters that CI can't reach directly, such as private networks or edge sites.

## Reconciliation and drift

The agent doesn't just apply on change; it keeps comparing. If someone edits a Deployment by hand, the agent reports it as out of sync and, if self-healing is on, puts it back. That makes manual hot-fixes visible, which is mostly a good thing. For fields another controller owns, such as replica counts managed by an autoscaler, tell the agent to ignore them.

## Promotion and rollback

Environments are usually directories or branches in the config repository (`staging/`, `production/`). Promoting is a pull request that copies the digest from staging to production, so review, approval and history come from Git. Rolling back is `git revert`. The agent rolls the environment back to the previous state, provided the database changes underneath were backward compatible.

## Where it stops

GitOps describes Kubernetes-style declarative systems well. It doesn't run your database migrations, decide canary steps or manage secrets by itself: pair it with a progressive-delivery controller (Argo Rollouts, Flagger), a migration step, and encrypted or external secrets (Sealed Secrets, SOPS, External Secrets) instead of plain secrets in Git.
