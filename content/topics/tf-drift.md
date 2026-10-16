---
id: tf-drift
title: Drift and refresh
summary: When the world changes behind Terraform's back
why: "Console fixes during incidents, autoscalers and other tools change real infrastructure. Each plan refreshes and shows that drift; reading it correctly decides whether the next apply repairs or breaks things."
requires: [tf-state]
lesson: none
points:
  - title: Every plan refreshes first
    text: "Terraform reads each managed object from the provider before diffing, and reports what changed outside Terraform."
  - title: Apply reverts drift
    text: "If configuration and reality differ, a normal apply changes reality back to the configuration, whoever made the change."
  - title: Refresh-only accepts reality
    text: "plan -refresh-only shows drift without proposing fixes, and apply -refresh-only updates state to match the real world."
  - title: terraform refresh is deprecated
    text: "Use the -refresh-only mode instead; it shows what it will write and asks for approval."
quiz_hint: Decide which should win, the code or the change someone made, before running apply.
quiz:
  - q: During an incident someone raised an instance size in the console. The next terraform apply will...
    options: ["keep the larger size because it is newer", "change it back to the size in the configuration, unless you update the code first", "fail with a drift error"]
    answer: 1
    explain: "Configuration is the source of truth. If the change was right, put it in code before the next apply; otherwise the apply quietly undoes the fix."
  - q: What does terraform apply -refresh-only do?
    options: ["Reverts all drift", "Updates state to match the real objects without changing any infrastructure", "Deletes resources that drifted"]
    answer: 1
    explain: "It accepts reality into state. The next normal plan then compares configuration against that updated picture."
  - q: A file managed by the local provider was deleted outside Terraform. What does a normal plan propose?
    options: ["Nothing", "Creating it again", "Removing it from state"]
    answer: 1
    explain: "Refresh finds the object gone, drops it from the refreshed state, and the plan proposes to create it to match the configuration."
links:
  - { title: "Detect and manage drift (HashiCorp tutorial)", url: "https://developer.hashicorp.com/terraform/tutorials/state/resource-drift" }
  - { title: "terraform refresh command, deprecated (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/refresh" }
  - { title: "terraform plan: planning modes (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/plan" }
---
**Drift** is any difference between what state says about an object and what the object actually is: a tag added in the console, a security group rule changed by a script, a disk resized during an incident, a resource deleted by hand. Terraform does not watch for drift. It notices only when you run it, because every plan starts by **refreshing**: reading each managed object back from its provider.

## Seeing drift

In the local demo, the managed file was deleted by hand, then `terraform plan` run (Terraform 1.5.7):

```sh
random_pet.name: Refreshing state... [id=dev-known-woodcock]
local_file.config: Refreshing state... [id=c3e960e2083e532b153d68d3a8631ab3ce5abfa2]

Terraform will perform the following actions:

  # local_file.config will be created
  + resource "local_file" "config" {
      + content              = <<-EOT
            service=dev-known-woodcock
        EOT
      + filename             = "./out/dev-known-woodcock.txt"
      + id                   = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

The same drift with `terraform plan -refresh-only` (Terraform 1.16.6) reports it instead of fixing it:

```sh
Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform since the
last "terraform apply" which may have affected this plan:

  # local_file.config has been deleted
  - resource "local_file" "config" {
      - filename             = "./out/dev-known-woodcock.txt" -> null
      - id                   = "c3e960e2083e532b153d68d3a8631ab3ce5abfa2" -> null
    }

This is a refresh-only plan, so Terraform will not take any actions to undo
```

(Hash attributes are trimmed from both.)

## Deciding who wins

For each drifted object, ask whether the outside change was right:

- **The change was a mistake** (someone clicked the wrong thing): run a normal apply, and Terraform puts it back.
- **The change was right** (an emergency fix): copy it into the configuration first, so the plan shows no change, then apply. Otherwise the next apply silently undoes the fix.
- **Another system owns the value** (an autoscaler, a tagging service): add it to `ignore_changes`, so Terraform stops fighting.
- **You only want state to catch up** (for example after a provider upgrade changed how a value reads back): `terraform apply -refresh-only` updates state without changing infrastructure. The old `terraform refresh` command did the same without showing you first, and is deprecated.

## Preventing drift

- Make Terraform the only way to change what it manages: read-only console access for most people, break-glass roles that are audited.
- Run a scheduled `terraform plan -detailed-exitcode` in CI (exit code 2 means changes are pending) and alert on unexpected drift.
- Use `check` blocks (Terraform 1.5+) for assertions about the live system that should hold on every plan, such as "the health endpoint returns 200".
- Keep states small, so plans run quickly enough to run often.

Skipping the refresh with `-refresh=false` speeds up plans for huge states, but then the plan is only as good as the last recorded state.
