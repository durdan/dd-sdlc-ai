---
id: tf-backends
title: Remote backends and state locking
summary: Shared, versioned state with one writer at a time
why: "As soon as two people or a CI pipeline run Terraform, local state stops working. A remote backend shares it; locking stops two applies from overwriting each other."
requires: [tf-state]
lesson: none
points:
  - title: A backend stores state
    text: "The backend block chooses where state lives: local disk by default, or S3, Azure Storage, GCS, HCP Terraform and others."
  - title: Locking prevents lost updates
    text: "Before writing, Terraform takes a lock. A second run waits or fails with the lock holder's details instead of corrupting state."
  - title: S3 now locks natively
    text: "The S3 backend can lock with a lock file in the bucket (use_lockfile = true). DynamoDB-based locking is deprecated."
  - title: Version the bucket
    text: "Object versioning lets you recover an earlier state after a bad write or an accidental delete."
quiz_hint: Ask what happens when two applies start at the same second.
quiz:
  - q: Two CI jobs run terraform apply on the same state at the same time with a locking backend. What happens?
    options: ["Both apply and the state merges", "One gets the lock; the other fails with 'Error acquiring the state lock' and the lock's ID, holder and time", "Both fail"]
    answer: 1
    explain: "Locking serialises writers. Configure CI so applies for one state run one at a time, and treat lock errors as a signal, not something to force past."
  - q: A run crashed and left a stale lock. What is the right response?
    options: ["Delete the state file", "Confirm no run is still active, then terraform force-unlock LOCK_ID", "Run apply with -lock=false from now on"]
    answer: 1
    explain: "force-unlock removes the lock record only. Doing it while another run is really active is how states get corrupted, so check first."
  - q: Which S3 backend setting is the current way to enable locking?
    options: ["dynamodb_table", "use_lockfile = true", "encrypt = true"]
    answer: 1
    explain: "S3 native locking writes a .tflock object next to the state. dynamodb_table still works but is deprecated and will be removed in a future minor version."
links:
  - { title: "Backend configuration (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/settings/backends/configuration" }
  - { title: "S3 backend (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/settings/backends/s3" }
  - { title: "State locking (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/state/locking" }
---
By default Terraform keeps state in `terraform.tfstate` next to your configuration. That works for one person on one machine. A **backend** moves state somewhere shared, and most remote backends add **locking**: before any operation that could write state, Terraform takes a lock, and anyone else trying at the same time is refused until it is released. That one rule prevents the worst Terraform accident, two applies racing and one silently discarding the other's changes.

## An S3 backend

```hcl
terraform {
  backend "s3" {
    bucket       = "example-tfstate-111122223333"
    key          = "checkout/prod/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

- `key` is the object path. Use one key per environment and component.
- `use_lockfile = true` turns on **S3 native locking**: Terraform writes a `.tflock` object beside the state using S3 conditional writes. The older `dynamodb_table` setting still works, but the documentation marks DynamoDB-based locking as deprecated and due for removal; both can be set during a migration.
- **Enable bucket versioning**, block public access, and restrict the bucket with IAM to the roles that run Terraform. Encryption with a KMS key you control adds an audit trail of who read state.
- Backend blocks cannot use variables. Pass environment-specific values with `terraform init -backend-config=prod.s3.tfbackend` or keep a small root directory per environment.

Other backends follow the same model: `azurerm` (blob leases), `gcs` (lock objects), `pg`, `kubernetes`, `consul`, and HCP Terraform, which also runs plans and applies remotely and keeps state history.

## Locking in practice

When a lock is held, the second run fails with a message of this shape (illustrative values; this one was not produced by a real S3 run):

```sh
Error: Error acquiring the state lock

Lock Info:
  ID:        3c9f1a2e-...
  Path:      example-tfstate-111122223333/checkout/prod/terraform.tfstate
  Operation: OperationTypeApply
  Who:       ci@runner-17
  Version:   1.16.6
  Created:   2026-10-16 09:12:44 UTC
```

Do not reach for `-lock=false`. If the holder really crashed (a killed CI job, a closed laptop), confirm nothing is still running and use `terraform force-unlock LOCK_ID`. Even the local backend locks: while an apply runs, a `.terraform.tfstate.lock.info` file sits next to the state.

## Bootstrapping

The bucket for state has to exist before any configuration can use it. Common answers: create it once with a tiny separate configuration that uses local state (then migrate that state into the bucket with `terraform init -migrate-state`), or create it by hand under a documented, locked-down account. Either way, protect it with `prevent_destroy` and strict IAM; deleting it orphans everything.

## Migrating backends

Change the `backend` block and run `terraform init`; Terraform offers to copy the existing state to the new location. Pull a backup first (`terraform state pull`), migrate when nobody else is running Terraform, and check that a plan afterwards shows no changes.
