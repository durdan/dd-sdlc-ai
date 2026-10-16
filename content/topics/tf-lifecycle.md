---
id: tf-lifecycle
title: "The resource lifecycle: replace, protect, ignore"
summary: Controlling how changes turn into actions
why: "Some changes can only be made by destroying and recreating a resource. The lifecycle block decides the order, refuses dangerous plans, and keeps Terraform from fighting other systems."
requires: [tf-dependencies, tf-state]
lesson: none
points:
  - title: Replacement destroys first by default
    text: "When an argument forces replacement, Terraform destroys the old object and then creates the new one, unless told otherwise."
  - title: create_before_destroy flips it
    text: "The new object is created first and the old one destroyed afterwards, avoiding a gap, provided names and addresses can coexist."
  - title: prevent_destroy refuses
    text: "A plan that would destroy a protected resource fails with an error. It is a seat belt, not a lock: deleting the block removes it."
  - title: Replace on purpose
    text: "terraform apply -replace=ADDRESS rebuilds one object, and replace_triggered_by rebuilds it when something else changes."
quiz_hint: For each setting, ask what plan it changes and what it cannot stop.
quiz:
  - q: An instance behind a load balancer must be replaced to change its image. How do you avoid a gap with no instance?
    options: ["prevent_destroy = true", "create_before_destroy = true, so the new instance exists before the old is destroyed", "ignore_changes = [ami]"]
    answer: 1
    explain: "The plan shows +/- (create replacement and then destroy). It only works if two copies can exist at once: unique names, no fixed IP that both need."
  - q: A database has prevent_destroy = true. Someone deletes its resource block. What does the next apply do?
    options: ["Refuses, because prevent_destroy is stored in state", "Plans to destroy the database; the protection was in the deleted block", "Moves the database to another state"]
    answer: 1
    explain: "prevent_destroy lives in configuration, so removing the block removes the protection. Use a removed block with destroy = false to stop managing it, and add cloud-side deletion protection as well."
  - q: An autoscaler changes desired_count on a service, and every plan wants to set it back. What fits?
    options: ["create_before_destroy", "lifecycle { ignore_changes = [desired_count] }", "depends_on"]
    answer: 1
    explain: "ignore_changes tells Terraform to set the argument on create but leave later changes alone, so it stops fighting the autoscaler."
links:
  - { title: "lifecycle meta-argument (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle" }
  - { title: "terraform plan, including -replace (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/plan" }
  - { title: "Custom conditions (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/expressions/custom-conditions" }
---
Each resource type's schema says which arguments can be changed in place and which **force replacement**: a new object is created and the old one destroyed. Terraform's default order for a replacement is destroy first, then create, shown as `-/+` in a plan. The `lifecycle` block, which every resource accepts, changes that behaviour: the order of replacement, whether destruction is allowed at all, which drift to ignore, and what else should trigger a rebuild.

## create_before_destroy

```hcl
resource "random_pet" "name" {
  prefix = var.env

  lifecycle {
    create_before_destroy = true
  }
}
```

With this setting, changing `prefix` produced (Terraform 1.5.7):

```sh
+/- create replacement and then destroy

  # random_pet.name must be replaced
+/- resource "random_pet" "name" {
      ~ prefix    = "dev" -> "prod" # forces replacement
```

`+/-` instead of `-/+`. Use it for anything serving traffic (instances, launch templates, certificates). The new and old objects must be able to exist together, so avoid fixed names (use `name_prefix` where the provider offers it). The setting also propagates to the resources this one depends on.

## prevent_destroy

```hcl
lifecycle {
  prevent_destroy = true
}
```

Any plan that would destroy the resource, including a replacement, fails:

```sh
Error: Instance cannot be destroyed

  on main.tf line 14:
  14: resource "random_pet" "name" {

Resource random_pet.name has lifecycle.prevent_destroy set, but the plan
calls for this resource to be destroyed. To avoid this error and continue
with the plan, either disable lifecycle.prevent_destroy or reduce the scope
of the plan using the -target flag.
```

It protects state buckets, databases and DNS zones from a careless change. It does not survive deleting the block (the protection lives in configuration), so pair it with the provider's own deletion protection where one exists.

## ignore_changes

```hcl
lifecycle {
  ignore_changes = [desired_count, tags["LastScannedBy"]]
}
```

Terraform sets these on create and then leaves them alone. Use it for values another system owns (an autoscaler, a tagging tool). Avoid `ignore_changes = all`, which hides real drift.

## Replacing on purpose

- `terraform apply -replace=aws_instance.app` rebuilds one object that is degraded but whose configuration is unchanged. It replaces the deprecated `terraform taint`.
- `replace_triggered_by` rebuilds a resource when another changes. With the built-in `terraform_data` resource as a trigger (Terraform 1.16.6):

```hcl
resource "terraform_data" "release" {
  input = var.release
}

resource "random_id" "cache_key" {
  byte_length = 4
  lifecycle {
    replace_triggered_by = [terraform_data.release]
  }
}
```

```sh
  # random_id.cache_key will be replaced due to changes in replace_triggered_by
-/+ resource "random_id" "cache_key" {

  # terraform_data.release will be updated in-place
  ~ resource "terraform_data" "release" {
      ~ input  = "v1" -> "v2"

Plan: 1 to add, 1 to change, 1 to destroy.
```

## Preconditions and postconditions

`lifecycle` also takes `precondition` and `postcondition` blocks: assertions checked during plan or after apply, such as "the AMI must be arm64" or "the bucket must have versioning". They turn assumptions into errors with clear messages, before a wrong value reaches production.
