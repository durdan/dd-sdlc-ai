---
id: tf-variables
title: Variables, outputs and locals
summary: Inputs, results and named expressions
why: "Variables make one configuration serve several environments, outputs connect configurations, and locals keep repeated logic in one place. Typed, validated inputs catch mistakes before they reach a plan."
requires: [tf-providers]
lesson: none
points:
  - title: Variables are inputs
    text: "Declare them with a type, a description and, where sensible, a default and validation rules."
  - title: Locals are named expressions
    text: "A local computes a value once (a name prefix, a merged tag map) so it is not repeated across resources."
  - title: Outputs are results
    text: "Outputs expose values to the caller of a module, to the CLI and to other configurations."
  - title: Validation fails fast
    text: "A validation block rejects bad input with your own error message before anything is planned."
quiz_hint: Ask who supplies the value (variable), who computes it (local) and who consumes it (output).
quiz:
  - q: Where should a value used in five resource names, built from the environment and the service name, live?
    options: ["A variable the caller must pass", "A local value, such as local.name_prefix", "An output"]
    answer: 1
    explain: "Locals hold expressions derived from other values. A variable would let callers pass something inconsistent; an output exposes results, it does not feed resources."
  - q: Which value wins if env is set in terraform.tfvars, in TF_VAR_env and with -var on the command line?
    options: ["terraform.tfvars", "TF_VAR_env", "The -var flag"]
    answer: 2
    explain: "Command-line -var and -var-file options are applied last and win. Environment variables are read first, then terraform.tfvars, then *.auto.tfvars."
  - q: "An output is marked sensitive = true. What does that do?"
    options: ["Encrypts it in the state file", "Hides it in plan and apply output; it is still stored in state in plain text", "Prevents other modules from reading it"]
    answer: 1
    explain: "Sensitive only redacts display. terraform output -raw still prints it, and anyone who can read the state can read the value."
links:
  - { title: "Input variables (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/values/variables" }
  - { title: "Local values (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/values/locals" }
  - { title: "Output values (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/values/outputs" }
---
A configuration becomes reusable once its varying parts are **input variables**. **Local values** give names to expressions you would otherwise repeat. **Outputs** publish results: to you on the command line, to the module that called this one, or to other configurations. Together they are the interface of every Terraform module, including the root module you run directly.

## Variables with types and validation

```hcl
variable "env" {
  type        = string
  description = "Deployment environment."
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging or prod."
  }
}

variable "replicas" {
  type    = number
  default = 2
}

variable "tags" {
  type    = map(string)
  default = {}
}
```

Types (`string`, `number`, `bool`, `list(...)`, `map(...)`, `object({...})`, `set(...)`) convert and check input. Validation rules run before planning. Running `terraform plan -var env=qa` on a configuration with this `env` variable (Terraform 1.5.7; the line numbers are from that larger file) stops immediately:

```sh
Error: Invalid value for variable

  on main.tf line 9:
   9: variable "env" {
    ├────────────────
    │ var.env is "qa"

env must be dev, staging or prod.

This was checked by the validation rule at main.tf:13,3-13.
```

Values come from, in increasing priority: environment variables (`TF_VAR_env`), `terraform.tfvars`, `*.auto.tfvars` files, and `-var` or `-var-file` on the command line. A variable without a default must be set somewhere; in CI, an interactive prompt for it means the job hangs.

## Locals

```hcl
locals {
  name_prefix = "${var.env}-checkout"
  tags = merge(var.tags, {
    environment = var.env
    managed_by  = "terraform"
  })
}

resource "random_pet" "bucket_suffix" {
  prefix = local.name_prefix
}
```

Use locals for derived values and naming conventions. Do not overuse them: a local that is used once just hides where a value comes from.

## Outputs

```hcl
output "bucket_name" {
  value       = random_pet.bucket_suffix.id
  description = "Name for the artefact bucket."
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true
}
```

`terraform output` prints them (sensitive ones as `<sensitive>`; `terraform output -raw db_password` still prints the value). Inside a module, outputs are the only way the caller can see anything: `module.network.private_subnet_ids`. Across separate configurations, prefer passing values through a parameter store or the `terraform_remote_state` data source sparingly, since the latter gives read access to the whole of the other state.

## Habits

- Give every variable a `description` and a precise `type`; `any` is an escape hatch, not a default.
- Keep secrets out of `.tfvars` files in Git. Pass them from a secret manager or the environment, and remember that they end up in state unless you use ephemeral values (see the secrets topic).
- Mark outputs `sensitive` when they are, so they do not appear in CI logs.
- Use `nullable = false` and optional object attributes (`optional(string, "default")`) to make inputs strict but convenient.
