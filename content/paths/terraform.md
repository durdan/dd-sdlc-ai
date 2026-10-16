---
id: terraform
title: "Terraform: infrastructure as code that you can trust"
promise: "How Terraform turns declarative configuration into real infrastructure: the plan and apply cycle, the state file it all depends on, how to change and refactor resources without destroying them, how to split environments and modules, how to test and police changes, and where OpenTofu fits."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: The model
    blurb: Declare, plan, apply
    topics: [tf-declarative, tf-providers, tf-variables, tf-dependencies]
  - title: State
    blurb: What Terraform remembers
    topics: [tf-state, tf-backends, tf-secrets]
  - title: Changing things safely
    blurb: Lifecycle, drift, refactoring
    topics: [tf-lifecycle, tf-drift, tf-refactoring]
  - title: At scale
    blurb: Modules, environments, tests, the fork
    topics: [tf-modules, tf-environments, tf-testing, tf-opentofu]
bridges:
  - id: idempotency
    why: "Applying the same configuration twice should change nothing the second time. The pattern explains why convergent, repeatable operations are what make automation safe."
  - id: distributed-locks
    why: "State locking stops two applies from writing the same state at once. This is the general problem, including what happens when a lock holder dies."
  - id: strangler-fig
    why: "Bringing hand-made infrastructure under Terraform is done piece by piece with import blocks. The strangler fig pattern is the same incremental idea for whole systems."
next: [aws, kubernetes]
---
Written for Terraform 1.x (the current release is 1.16) and OpenTofu 1.x (currently 1.13). Features are marked with the version that introduced them where it matters: `import` and `check` blocks (1.5), `terraform test` (1.6), `removed` blocks and test mocks (1.7), ephemeral resources (1.10), write-only arguments (1.11) and S3 native state locking. Every example that was run uses only the `random` and `local` providers and the built-in `terraform_data` resource, so no cloud account is involved; the few AWS-flavoured snippets (backends, cloud resources) are illustrative and were not applied. The plan and test output shown comes from real runs: most with Terraform 1.5.7 (the last MPL-licensed release), and the `terraform test`, module, `removed` and `replace_triggered_by` examples with Terraform 1.16.6, both on macOS arm64 with `hashicorp/random` 3.9.1 and `hashicorp/local` 2.9.1.
