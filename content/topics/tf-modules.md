---
id: tf-modules
title: Modules and composition
summary: Reusable building blocks with a small interface
why: "Modules are how a team stops copy-pasting the same network or service setup into ten directories. Good ones encode decisions once; bad ones become a second, worse cloud API."
requires: [tf-variables]
lesson: none
points:
  - title: Every directory is a module
    text: "The directory you run Terraform in is the root module. A module block calls another directory, from a local path, a registry or Git."
  - title: Inputs in, outputs out
    text: "A module's variables are its parameters and its outputs are all the caller can see. Keep both small and meaningful."
  - title: Compose, do not nest deeply
    text: "Prefer a flat root that wires several modules together over modules that call modules that call modules."
  - title: Pin module versions
    text: "Registry modules take a version constraint; Git sources take a ref. Upgrades should be deliberate changes."
quiz_hint: Ask what decision the module makes for its callers, and what it leaves to them.
quiz:
  - q: Which is a sign of a poor module?
    options: ["It has five well-named inputs", "It wraps one resource and exposes every one of its arguments as a variable", "It outputs the IDs its callers need"]
    answer: 1
    explain: "A thin wrapper adds indirection without encoding any decision. Good modules group resources around one purpose and choose sensible defaults."
  - q: How do you create one instance of a module per service name in a set?
    options: ["Copy the module block", "Use for_each on the module block", "Use depends_on"]
    answer: 1
    explain: "Modules support count and for_each. Each instance gets an address like module.service[\"api\"]."
  - q: Should a reusable module contain a provider block with a Region?
    options: ["Yes, always", "No; declare required_providers and let the caller pass provider configurations", "Only for AWS"]
    answer: 1
    explain: "Provider configuration belongs to the root module. Modules with their own provider blocks cannot be used with for_each, count or depends_on, and are hard to reuse across Regions."
links:
  - { title: "Modules overview (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/modules" }
  - { title: "Module composition (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/modules/develop/composition" }
  - { title: "Refactoring modules (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/modules/develop/refactoring" }
---
A **module** is a directory of `.tf` files. The one you run `terraform plan` in is the **root module**; it can call **child modules** with `module` blocks, passing values into their variables and reading their outputs. Modules are Terraform's unit of reuse: one module for "a service with its queue, alarms and IAM role", called once per service, instead of the same 200 lines pasted ten times.

## A small module

```hcl
# modules/service/main.tf
variable "name" { type = string }
variable "env"  { type = string }

resource "random_pet" "suffix" {
  prefix = "${var.env}-${var.name}"
}

resource "local_file" "manifest" {
  filename = "${path.root}/out/${random_pet.suffix.id}.txt"
  content  = "name=${random_pet.suffix.id}\n"
}

output "id" { value = random_pet.suffix.id }
```

```hcl
# main.tf (root)
locals {
  services = toset(["api", "worker"])
}

module "service" {
  source   = "./modules/service"
  for_each = local.services

  name = each.key
  env  = "dev"
}

output "ids" {
  value = { for k, m in module.service : k => m.id }
}
```

Applied with Terraform 1.16.6:

```sh
Apply complete! Resources: 4 added, 0 changed, 0 destroyed.

Outputs:

ids = {
  "api" = "dev-api-literate-dingo"
  "worker" = "dev-worker-workable-duck"
}
```

and the state addresses include the module path and key:

```sh
module.service["api"].local_file.manifest
module.service["api"].random_pet.suffix
module.service["worker"].local_file.manifest
module.service["worker"].random_pet.suffix
```

## Sources and versions

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"   # public registry
  version = "~> 6.0"
}

module "alarms" {
  source = "git::https://github.com/example/tf-modules.git//alarms?ref=v2.3.1"
}
```

Local paths need no version. Registry modules take `version`; Git sources take a `ref` (a tag or commit). `terraform init` downloads them into `.terraform/modules`. Read third-party modules before using them: they run with your credentials and decide what your infrastructure looks like.

## Design guidelines

- **One purpose per module**, with a few meaningful inputs and sensible defaults. A module that exposes every argument of every resource is not an abstraction.
- **Composition over nesting.** Let the root module connect modules by passing outputs to inputs (`vpc_id = module.network.vpc_id`), rather than modules that create their own networks. Dependencies stay visible and each piece stays testable.
- **No provider blocks in reusable modules**: declare `required_providers` and receive configurations from the caller (`providers = { aws = aws.us }`).
- **Stable addresses**: renaming resources inside a module affects every caller. Add `moved` blocks when you refactor, and release a new version.
- **Document and test**: variable descriptions, an example directory, and `terraform test` files (see the testing topic) make a module trustworthy.
