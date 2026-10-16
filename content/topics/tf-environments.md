---
id: tf-environments
title: "Environments: workspaces or separate state"
summary: One configuration, several isolated copies
why: "Dev, staging and prod must not share state, credentials or a blast radius. How you separate them decides whether a mistake in dev can touch prod."
requires: [tf-backends, tf-modules]
lesson: none
points:
  - title: Workspaces are named states
    text: "CLI workspaces give one configuration several states in the same backend, selected with terraform workspace select."
  - title: Not a security boundary
    text: "HashiCorp's docs say workspaces are not appropriate when deployments need separate credentials and access controls."
  - title: Separate roots per environment
    text: "A directory (or backend config) per environment, each with its own state, backend key and credentials, is the common pattern for prod."
  - title: Shared code through modules
    text: "Environments differ in inputs, not in copied code: each root calls the same versioned modules with its own values."
quiz_hint: Ask what stops a dev run from touching prod.
quiz:
  - q: With CLI workspaces, what separates dev and prod?
    options: ["Separate credentials and backends", "Only the state file name within the same backend; the configuration and usually the credentials are the same", "Separate AWS accounts automatically"]
    answer: 1
    explain: "The workspace selects a state. Anyone who can run the configuration for one workspace can usually select another, which is why they are a weak boundary for production."
  - q: Which layout gives prod its own blast radius?
    options: ["One root module with workspaces dev and prod", "A root directory per environment with its own backend key, its own credentials (often a separate account), and the same modules", "One state containing all environments"]
    answer: 1
    explain: "Separate state, backend access and credentials mean a mistake in dev cannot plan against prod. Shared modules keep the environments alike."
  - q: Where do HCP Terraform workspaces differ from CLI workspaces?
    options: ["They are the same thing", "An HCP Terraform workspace is a separate unit with its own state, variables, permissions and runs, closer to a separate root", "They cannot hold state"]
    answer: 1
    explain: "The names collide but the concepts differ. HCP Terraform workspaces carry their own access controls; CLI workspaces are just alternate states."
links:
  - { title: "Workspaces (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/state/workspaces" }
  - { title: "Managing workspaces in the CLI (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/workspaces" }
  - { title: "Backend configuration (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/settings/backends/configuration" }
---
Most teams need the same infrastructure several times: dev, staging, prod, maybe one per customer or Region. Terraform offers two broad ways to do it. **CLI workspaces** keep several states for one configuration in one backend. **Separate root modules** (or separate backend configurations) give each environment its own state, backend location and credentials. Both work; they differ sharply in how well they keep environments apart.

## CLI workspaces

```sh
$ terraform workspace new staging
Created and switched to workspace "staging"!

You're now on a new, empty workspace. Workspaces isolate their state,
so if you run "terraform plan" Terraform will not see any existing state
for this configuration.

$ terraform workspace list
  default
* staging
```

(Terraform 1.5.7, local backend, where the new state went into `terraform.tfstate.d/staging/`.) The configuration can read `terraform.workspace` to vary names or sizes. Workspaces are convenient for short-lived copies, such as one per feature branch or a developer's sandbox.

Their weakness is that the only difference between environments is which state is selected. The same code, the same backend and, usually, the same credentials can reach every workspace, and one forgotten `terraform workspace select` applies dev's change to prod. The Terraform documentation says plainly that workspaces are not appropriate for system decomposition or for deployments that need separate credentials and access controls.

## Separate state per environment

```sh
modules/
  service/            # shared, versioned building blocks
  network/
envs/
  dev/
    main.tf           # module calls with dev inputs
    backend.tf        # key = "checkout/dev/terraform.tfstate"
  prod/
    main.tf           # same modules, prod inputs
    backend.tf        # key = "checkout/prod/terraform.tfstate", prod account
```

Each environment directory is a small root module that calls shared modules with its own values. Each has its own backend key, often its own bucket in its own AWS account, and CI uses a different role for each, so a dev pipeline physically cannot write prod state. Differences between environments are visible as different inputs in code review, not hidden behind `terraform.workspace` conditionals.

Variants of the same idea: one root with `-backend-config` and `-var-file` per environment (less duplication, but the CI job must pass the right pair), wrapper tools such as Terragrunt that generate the per-environment boilerplate, and HCP Terraform workspaces, which are full units with their own state, variables and permissions and so behave more like separate roots than like CLI workspaces. Terraform Stacks, newer in HCP Terraform, model several deployments of the same components explicitly.

## Splitting by layer, too

Environments are one axis; layers are another. Keep long-lived, rarely changed infrastructure (accounts, networks, DNS) in different states from fast-moving application resources. Smaller states plan faster, lock less often, and limit what a single bad apply can damage. Pass values between them through outputs published to a parameter store, or narrow data sources, rather than one giant state.
