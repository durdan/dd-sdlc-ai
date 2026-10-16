---
id: tf-providers
title: Providers, resources and data sources
summary: Plugins that turn HCL blocks into API calls
why: "Terraform core knows nothing about AWS, GitHub or DNS. Providers do, and which version you run, how it is configured and how it is pinned decide whether tomorrow's plan matches today's."
requires: [tf-declarative]
lesson: none
points:
  - title: A provider is a plugin
    text: "Each provider is a separate binary downloaded by terraform init that maps resource types to an API."
  - title: Resources are managed, data sources are read
    text: "A resource block creates and owns an object. A data block only looks something up that exists already."
  - title: Pin versions, commit the lock file
    text: "Constraints in required_providers say which versions are acceptable; .terraform.lock.hcl records exactly which one was chosen."
  - title: Aliases for several configurations
    text: "Two Regions or two accounts means two provider configurations, selected per resource with provider = aws.west."
quiz_hint: Separate what Terraform owns (resources) from what it only reads (data sources).
quiz:
  - q: Your colleague runs terraform init and gets a newer provider version than you, and the plan differs. What prevents this?
    options: ["Deleting the .terraform directory", "Committing .terraform.lock.hcl, so everyone gets the recorded version until someone runs init -upgrade", "Using latest as the version"]
    answer: 1
    explain: "The dependency lock file pins the exact version and package checksums. Upgrades become deliberate changes reviewed like code."
  - q: You need the ID of an existing VPC that another team manages. Which block do you use?
    options: ["A resource block with the same name", "A data block that looks the VPC up", "An import block"]
    answer: 1
    explain: "A data source reads without taking ownership. A resource or import would make your configuration manage, and possibly destroy, the other team's VPC."
  - q: "What does version = \"~> 3.6\" allow?"
    options: ["Exactly 3.6.0", "3.6 or any later 3.x version, but not 4.0", "Any version from 3.6 upward, including 4.x"]
    answer: 1
    explain: "The pessimistic constraint allows only the rightmost given component to increase. ~> 3.6.0 would allow 3.6.x only."
links:
  - { title: "Providers (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/providers" }
  - { title: "Provider requirements (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/providers/requirements" }
  - { title: "Dependency lock file (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/files/dependency-lock" }
  - { title: "Resource blocks (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/resources/syntax" }
---
Terraform itself is a small engine: it parses configuration, builds a dependency graph, stores state and computes plans. Everything that touches a real system lives in **providers**, plugins that `terraform init` downloads from a registry and runs as separate processes. The AWS provider knows what an `aws_s3_bucket` is and which API calls create one; the `random` provider generates values; the `local` provider manages files. A **resource** block asks a provider to create and manage an object; a **data** block asks it to read one.

## Requiring and configuring

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 6.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "aws" {
  region = "eu-west-1"
}

provider "aws" {
  alias  = "us"
  region = "us-east-1"
}
```

`source` is `namespace/type` on the registry (`registry.terraform.io` by default). The provider block holds settings such as the Region; credentials should come from the environment (a role, SSO session or CI identity), never from the file. A second configuration gets an `alias`, and resources choose it with `provider = aws.us`.

## The lock file

`terraform init` picks the newest version matching the constraints and writes `.terraform.lock.hcl`:

```hcl
# This file is maintained automatically by "terraform init".
# Manual edits may be lost in future updates.

provider "registry.terraform.io/hashicorp/local" {
  version     = "2.9.1"
  constraints = "~> 2.5"
  hashes = [
    "h1:OZGJN0LSSat5QIxZPxDXtVr4XpHb2oG7cVKJhSqBFIE=",
    "zh:25606c7a5e308144fb627f6e31611bb52ff72bb9ae2d27af39673ab1a6b3c1bf",
```

Commit it. Later runs use exactly this version and verify the checksums, so a laptop, CI and a colleague all run the same provider. Upgrading is explicit: `terraform init -upgrade`, then review the plan. If CI runs on Linux and people on macOS, record hashes for both with `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64`.

## Resources and data sources

```hcl
data "aws_vpc" "shared" {
  tags = { Name = "shared-network" }
}

resource "aws_security_group" "api" {
  name   = "api"
  vpc_id = data.aws_vpc.shared.id
}
```

The VPC is looked up on every plan and never modified; the security group is created, tracked in state, updated and, if you remove the block, destroyed. Every resource has an address (`aws_security_group.api`) that Terraform uses in plans and state, and each argument's behaviour (in-place update or forced replacement) is defined by the provider's schema, which is why the provider documentation is the reference you will read most.

## Things that go wrong

- **Unpinned providers**: a major version changes defaults or removes arguments, and the next plan wants to replace things.
- **Provider configuration inside reusable modules**: modules should declare `required_providers` but receive provider configurations from the caller, so they can be used with any Region or account.
- **Data sources that find nothing or several results** fail the plan. That is usually a feature: better than guessing.
