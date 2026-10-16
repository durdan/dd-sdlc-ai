---
id: tf-declarative
title: "The declarative model: write, plan, apply"
summary: Describe the end state; Terraform works out the steps
why: "Terraform's value is the plan: a precise preview of what will be created, changed and destroyed before anything happens. Everything else in this path is about keeping that preview trustworthy."
lesson: none
points:
  - title: You declare, Terraform diffs
    text: "Configuration says what should exist. Terraform compares it with its state and the real world, and proposes only the differences."
  - title: Plan is a contract
    text: "terraform plan -out saves the exact actions; terraform apply of that file performs exactly those, or fails if things moved underneath."
  - title: Read the symbols
    text: "+ create, ~ update in place, - destroy, -/+ replace. A replace you did not expect is the most important line in any plan."
  - title: Convergent by design
    text: "Applying an unchanged configuration again should plan no changes. If it does not, something outside Terraform is changing things."
quiz_hint: "Ask what Terraform compares: configuration, state and the real objects."
quiz:
  - q: You run terraform apply twice in a row with no changes to the configuration. What should the second run do?
    options: ["Create everything again", "Nothing: 'No changes. Your infrastructure matches the configuration.'", "Destroy and recreate everything"]
    answer: 1
    explain: "Declarative tools converge. A second apply that still wants changes points to drift, a provider quirk or something else managing the same resource."
  - q: Why save a plan with -out and apply that file in CI?
    options: ["It is faster", "The apply performs exactly the reviewed actions, and fails if the state changed since the plan", "It skips the provider"]
    answer: 1
    explain: "Without a saved plan, apply plans again, and the result can differ from what was reviewed if someone else changed things in between."
  - q: In a plan, what does -/+ mean?
    options: ["Update in place", "Destroy, then create a replacement", "Create, then destroy"]
    answer: 1
    explain: "The default replacement order destroys first. +/- means the opposite order, which you get with create_before_destroy."
links:
  - { title: "What is Terraform? (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/intro" }
  - { title: "The core Terraform workflow (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/run" }
  - { title: "terraform plan command (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/plan" }
  - { title: "terraform apply command (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/apply" }
---
With Terraform you do not write the steps to build infrastructure ("create a VPC, then a subnet, then..."). You write `.tf` files in HCL describing what should exist, and Terraform works out the steps. Each run compares three things: your **configuration**, the **state** (Terraform's record of what it created last time) and the **real objects**, read fresh from the provider. The difference becomes a **plan**, and `apply` carries it out.

## The cycle

```sh
terraform init      # download providers and modules, configure the backend
terraform fmt       # canonical formatting
terraform validate  # syntax and internal consistency, no API calls
terraform plan -out=tfplan
terraform apply tfplan
```

A small configuration, using only providers that touch the local machine:

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    random = { source = "hashicorp/random", version = "~> 3.6" }
    local  = { source = "hashicorp/local", version = "~> 2.5" }
  }
}

variable "env" {
  type    = string
  default = "dev"
}

resource "random_pet" "name" {
  prefix = var.env
}

resource "local_file" "config" {
  filename = "${path.module}/out/${random_pet.name.id}.txt"
  content  = "service=${random_pet.name.id}\n"
}
```

The first plan (Terraform 1.5.7; the `local_file` hash attributes, all `(known after apply)`, are trimmed):

```sh
Terraform will perform the following actions:

  # local_file.config will be created
  + resource "local_file" "config" {
      + content              = (known after apply)
      + directory_permission = "0777"
      + file_permission      = "0777"
      + filename             = (known after apply)
      + id                   = (known after apply)
    }

  # random_pet.name will be created
  + resource "random_pet" "name" {
      + id        = (known after apply)
      + length    = 2
      + prefix    = "dev"
      + separator = "-"
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Saved the plan to: tfplan
```

`(known after apply)` marks values the provider only learns while creating the object: here the random name, and so the file name built from it. Applying the saved plan created both, and a second `terraform plan` reported `No changes. Your infrastructure matches the configuration.`

## Reading a plan for danger

Changing `env` to `prod` gives a very different plan:

```sh
  # random_pet.name must be replaced
-/+ resource "random_pet" "name" {
      ~ id        = "dev-known-woodcock" -> (known after apply)
      ~ prefix    = "dev" -> "prod" # forces replacement
        # (2 unchanged attributes hidden)
    }

Plan: 2 to add, 0 to change, 2 to destroy.
```

`# forces replacement` names the argument that cannot be changed in place. With random names that is harmless; with a database, a disk or a load balancer's address, a `-/+` line means downtime or data loss. In review, look for three things first: the destroy count, every `must be replaced`, and anything changing that you did not touch.

## What declarative does not mean

Terraform does not watch your infrastructure. It only acts when you run it, it only knows about resources in its state, and the order of blocks in files does not matter (dependencies do, see later). It also cannot make a non-idempotent API safe: if a provider cannot read back a setting, Terraform cannot tell when it drifts.
