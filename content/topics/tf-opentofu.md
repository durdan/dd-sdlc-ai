---
id: tf-opentofu
title: "OpenTofu and the licence change"
summary: One language, two tools since 2023
why: "Since 2023 there are two compatible-but-diverging tools: Terraform under the Business Source License and OpenTofu under MPL 2.0. Choosing between them, or switching, is now a real decision for teams."
requires: [tf-declarative]
lesson: none
points:
  - title: The licence changed in August 2023
    text: "HashiCorp moved Terraform from MPL 2.0 to the Business Source License 1.1 for releases after 1.5.x. Terraform 1.5.7 is the last MPL release."
  - title: OpenTofu forked from 1.5
    text: "A group of companies and contributors forked the last MPL code as OpenTofu, now a Linux Foundation project; its first stable release was 1.6.0 in January 2024."
  - title: Compatible, then diverging
    text: "Both read the same HCL, providers and state format from that era. Since then each has added features the other lacks."
  - title: Decide on facts
    text: "Check what your use case needs: the licence terms, features, the providers and modules you use, support, and HCP Terraform integration."
quiz_hint: Separate what is identical (the language and providers from the fork point) from what diverged (licences and newer features).
quiz:
  - q: Which Terraform release is the last one under the Mozilla Public License 2.0?
    options: ["1.4.7", "1.5.7", "1.6.0"]
    answer: 1
    explain: "The BSL applies to releases after 1.5.x. Terraform 1.6 and later are BSL 1.1; earlier releases stay MPL 2.0."
  - q: What is a feature OpenTofu added that Terraform does not have?
    options: ["The import block", "Client-side encryption of state and plan files, configured in the terraform block", "Provider plugins"]
    answer: 1
    explain: "OpenTofu 1.7 introduced built-in state and plan encryption. Import blocks predate the fork (Terraform 1.5), and providers are shared by both."
  - q: Does the BSL stop a company from using Terraform to manage its own infrastructure?
    options: ["Yes, all commercial use needs a licence", "No; HashiCorp's licence permits that. Its restrictions target offering a competing product built on Terraform", "Only for companies with more than 100 employees"]
    answer: 1
    explain: "Most end users are not affected by the licence terms. Vendors embedding or hosting Terraform as a product are, which is why many of them backed OpenTofu. Read the licence yourself for edge cases."
links:
  - { title: "OpenTofu documentation", url: "https://opentofu.org/docs/" }
  - { title: "What is OpenTofu? (OpenTofu docs)", url: "https://opentofu.org/docs/intro/" }
  - { title: "Migrating to OpenTofu from Terraform (OpenTofu docs)", url: "https://opentofu.org/docs/intro/migration/" }
  - { title: "State and plan encryption (OpenTofu docs)", url: "https://opentofu.org/docs/language/state/encryption/" }
---
On 10 August 2023 HashiCorp announced that future releases of Terraform (and its other products) would be published under the **Business Source License 1.1** instead of the **Mozilla Public License 2.0**. The BSL is a source-available licence that restricts using the software to build competing commercial offerings. In response, a group of vendors and community members published the OpenTF manifesto, then forked the last MPL code base. The fork was renamed **OpenTofu**, accepted by the **Linux Foundation** in September 2023, and released as stable 1.6.0 in January 2024. IBM completed its acquisition of HashiCorp in February 2025; Terraform remains under the BSL.

## What is the same

- **The language**: HCL configurations written for Terraform 1.5 work in OpenTofu, and most later configurations that avoid tool-specific features work in both.
- **Providers**: both use the same provider plugin protocol. Most providers are published to both the Terraform Registry and the OpenTofu Registry (`registry.opentofu.org`).
- **State**: OpenTofu works with state files written by Terraform up to 1.5.x; for state from later Terraform releases, follow the migration guide and verify with a plan.
- **Workflow**: `tofu init`, `tofu plan`, `tofu apply`, the same as `terraform`.

## What has diverged

Each project now ships features the other lacks. A few examples, not a complete list:

| OpenTofu | Terraform |
| --- | --- |
| Client-side state and plan encryption (1.7) | Ephemeral resources (1.10) and write-only arguments (1.11) |
| Early evaluation: variables in backend and module source blocks (1.8) | Stacks and deeper HCP Terraform integration |
| `for_each` on provider configurations (1.9), `-exclude` flag | Query (list) blocks for discovering existing resources to import |
| OCI registries for providers and modules (1.10) | |

Feature sets change with every release, so check the current documentation for anything you depend on. Configuration that uses features of one tool will not run on the other.

## Choosing, neutrally

Questions worth answering for your team:

- **Licence**: does the BSL affect you? For most companies managing their own infrastructure, HashiCorp's terms permit that use; vendors building products around Terraform are the main group restricted. Some organisations require OSI-approved licences for all tooling, which only OpenTofu meets.
- **Platform**: HCP Terraform and Terraform Enterprise run Terraform. Other platforms (Spacelift, env0, Scalr, Harness, self-hosted CI) commonly support both.
- **Features** you need from either column above.
- **Support and governance**: a single vendor's roadmap and commercial support, or a foundation-governed project with several backing companies.

## Switching

The OpenTofu migration guide describes a safe, reversible process: back up your state and code, install OpenTofu, initialise and verify the configuration (`tofu init` fetches providers from the OpenTofu Registry, and `tofu plan` should show no changes), then test with a small change before relying on it. Configurations that share data through `terraform_remote_state` need extra care, covered in a separate guide. Switching back is possible as long as you have not used OpenTofu-only features such as state encryption. Do it one state at a time, not across the whole estate at once.

Note: the examples in this path were run with Terraform, not OpenTofu (it was not installed); they use only features the two share, except where a version note says otherwise.
