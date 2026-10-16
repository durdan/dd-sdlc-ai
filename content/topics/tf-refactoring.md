---
id: tf-refactoring
title: "Import, moved and removed: changing state with code"
summary: Adopt, rename and release resources without rebuilding them
why: "Renaming a block or moving it into a module looks like destroy-and-create to Terraform. import, moved and removed blocks let you adopt, refactor and hand off infrastructure through reviewed plans instead of risky state surgery."
requires: [tf-state, tf-lifecycle]
lesson: none
points:
  - title: Addresses are identities
    text: "To Terraform, a resource is its address. Change the address and, without help, it plans to destroy the old object and create a new one."
  - title: moved renames in place
    text: "A moved block maps an old address to a new one; the plan shows a move and no change to the real object."
  - title: import adopts
    text: "An import block (1.5+) brings an existing object under management through a normal plan, and can generate its configuration."
  - title: removed releases
    text: "A removed block (1.7+) with destroy = false forgets an object without destroying it."
quiz_hint: Ask whether the real object should change at all. If not, the plan should say 0 to add, 0 to change, 0 to destroy.
quiz:
  - q: You rename resource "random_pet" "name" to "service". Without a moved block, what does the plan do?
    options: ["Renames it", "Destroys random_pet.name and creates random_pet.service", "Fails"]
    answer: 1
    explain: "The old address is in state but not in configuration, and the new one is in configuration but not in state. A moved block tells Terraform they are the same object."
  - q: What is the advantage of an import block over the terraform import command?
    options: ["It is faster", "The import is planned and reviewed like any change, can be applied in CI, and can generate configuration with -generate-config-out", "It works without a provider"]
    answer: 1
    explain: "The CLI command writes to state immediately with no plan. An import block shows 'will be imported' in the plan, and nothing happens until apply."
  - q: A resource should move to another team's configuration. What do you do in yours?
    options: ["Delete the block", "Replace the block with a removed block using destroy = false, then import it on the other side", "Run terraform destroy -target"]
    answer: 1
    explain: "Deleting the block would plan a destroy. A removed block forgets the object while leaving it running, and the other team adopts it with an import block."
links:
  - { title: "Import existing resources (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/import" }
  - { title: "Refactoring modules with moved blocks (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/modules/develop/refactoring" }
  - { title: "moved block reference (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/block/moved" }
  - { title: "removed block reference (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/block/removed" }
---
Terraform identifies everything it manages by **address**: `random_pet.name`, `module.service["api"].local_file.manifest`. State maps each address to a real object. Renaming a block, adding `count` or `for_each`, or moving resources into a module all change addresses, and Terraform's default reading of a changed address is "delete the old thing, create a new one". Three configuration blocks change state deliberately, through a plan you can review: **moved**, **import** and **removed**.

## moved: rename without rebuilding

```hcl
resource "random_pet" "service" {   # was "name"
  prefix = var.env
}

moved {
  from = random_pet.name
  to   = random_pet.service
}
```

The plan (Terraform 1.5.7) shows only the move:

```sh
Terraform will perform the following actions:

  # random_pet.name has moved to random_pet.service
    resource "random_pet" "service" {
        id        = "dev-known-woodcock"
        # (3 unchanged attributes hidden)
    }

Plan: 0 to add, 0 to change, 0 to destroy.
```

`moved` works for resources, modules (`module.old` to `module.new`) and instances (`aws_instance.web` to `aws_instance.web[0]`). Keep moved blocks for a while after applying, especially in shared modules, so every caller's state gets moved.

## import: adopt what already exists

```hcl
import {
  to = random_integer.port
  id = "8443,8000,8999"
}

resource "random_integer" "port" {
  min = 8000
  max = 8999
}
```

```sh
random_integer.port: Preparing import... [id=8443,8000,8999]
random_integer.port: Refreshing state... [id=8443]

  # random_integer.port will be imported
    resource "random_integer" "port" {
        id     = "8443"
        max    = 8999
        min    = 8000
        result = 8443
    }

Plan: 1 to import, 0 to add, 0 to change, 0 to destroy.
```

The import ID format is defined by each resource type (a bucket name, an instance ID, or for `random_integer`, `result,min,max`). If you do not want to write the resource block yourself, run `terraform plan -generate-config-out=generated.tf` with only the import block, then tidy the generated code. Aim for an import plan with no changes besides the import itself: any `~` line means your configuration does not yet match reality.

## removed: let go without destroying

```hcl
removed {
  from = random_password.db

  lifecycle {
    destroy = false
  }
}
```

Terraform 1.16.6 plans:

```sh
 # random_password.db will no longer be managed by Terraform, but will not be destroyed
 # (destroy = false is set in the configuration)
```

Use it to hand a resource to another configuration (which then imports it), or to stop managing something that should outlive this code.

## When to use the CLI instead

`terraform state mv`, `terraform state rm` and `terraform import` do the same jobs immediately, without a plan or review. They are fine for one-off repairs on a laptop with a state backup, but blocks are better in teams and CI: the change is in Git, visible in the plan, and applied with everything else.
