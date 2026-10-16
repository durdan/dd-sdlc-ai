---
id: tf-secrets
title: Secrets and state
summary: Sensitive is not secret; state stores the value
why: "Terraform often handles passwords, keys and tokens. Unless you design for it, every one of them ends up in plain text in state and in saved plans, readable by anyone with access to the bucket."
requires: [tf-state, tf-variables]
lesson: none
points:
  - title: Sensitive only hides output
    text: "sensitive = true redacts a value in plan and apply output. It is still stored in state and plan files in plain text."
  - title: Treat state as a secret
    text: "Encrypt the backend, restrict who can read it, and never commit it. Read access to state is read access to its secrets."
  - title: Ephemeral values stay out of state
    text: "Ephemeral resources (1.10+) and write-only arguments (1.11+) let Terraform use a secret without persisting it in state or plans."
  - title: Prefer references to values
    text: "Often the best answer is to let the service generate and store the secret (for example a managed master password) and pass only its ARN."
quiz_hint: Ask where the value is written to disk, and who can read that place.
quiz:
  - q: You create a random_password and mark the output sensitive. Where can the password be read?
    options: ["Nowhere; sensitive values are never stored", "In the state file in plain text, and with terraform output -raw", "Only in the AWS console"]
    answer: 1
    explain: "In the demo run, the state held the password in plain text while terraform output showed <sensitive>."
  - q: Which feature lets a resource receive a password that Terraform never writes to state?
    options: ["sensitive = true", "A write-only argument fed by an ephemeral value", "Putting the password in terraform.tfvars"]
    answer: 1
    explain: "Write-only arguments (Terraform 1.11 and later, where providers support them) accept ephemeral values and are not persisted to plan or state."
  - q: What is a safe place for a database password a Terraform configuration needs to pass to a service?
    options: ["A variable default in the repository", "A secrets manager, generated there or by the database service, with Terraform passing only its identifier", "A comment in main.tf"]
    answer: 1
    explain: "When the secret never passes through Terraform, it cannot leak through state, plans or CI logs. Rotation also becomes the secret store's job."
links:
  - { title: "Manage sensitive data (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/state/sensitive-data" }
  - { title: "Ephemeral values in resources (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/resources/ephemeral" }
  - { title: "Use temporary write-only arguments (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/resources/ephemeral/write-only" }
  - { title: "State and plan encryption (OpenTofu docs)", url: "https://opentofu.org/docs/language/state/encryption/" }
---
Terraform stores every attribute a provider returns in state, and saved plan files contain the values needed to apply them. For a database password, an API token or a private key, that means a plain-text copy in every state file and plan artefact. `sensitive = true` does not change this; it only keeps the value out of terminal output and logs. Handling secrets well means deciding, for each one, whether it should pass through Terraform at all.

## What "sensitive" does and does not do

From the local demo (Terraform 1.5.7):

```hcl
resource "random_password" "db" {
  length  = 20
  special = false
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true
}
```

```sh
$ terraform output
db_password = <sensitive>
file = "./out/dev-known-woodcock.txt"

$ terraform output -raw db_password | wc -c
      20
```

And in `terraform.tfstate`, the `result` attribute of `random_password.db` held the full 20-character password in plain text. The provider marks that attribute sensitive in its schema, so plans redact it, but redaction is about display only.

## Protecting state

- Use a remote backend with **encryption at rest** (S3 with KMS, for example), **versioning**, and **IAM that limits readers** to the roles that run Terraform.
- Never commit `*.tfstate` or plan files; add them to `.gitignore`. Treat CI artefacts containing plans as secrets and expire them quickly.
- **OpenTofu** can encrypt state and plan files client-side (since OpenTofu 1.7), so the storage backend never sees plain text. Terraform relies on backend-side encryption.

## Keeping secrets out of state

Recent Terraform versions add two features for this:

- **Ephemeral resources** (Terraform 1.10+) are read or generated during a run and never persisted: for example, fetching a secret from a secrets manager or generating a password just for this run.
- **Write-only arguments** (Terraform 1.11+), on resources whose providers support them, accept ephemeral values and are not stored in plan or state. They usually come with a version argument you bump to trigger rotation.

```hcl
ephemeral "random_password" "db" {
  length = 24
}

resource "aws_db_instance" "main" {
  # ...
  password_wo         = ephemeral.random_password.db.result
  password_wo_version = 1
}
```

Provider support varies; check the resource documentation for `_wo` arguments.

## Often better: do not handle the secret

Many services can own their secrets. RDS can generate and rotate the master password in Secrets Manager (`manage_master_user_password = true`), so Terraform only ever sees an ARN. Applications then read the secret at runtime with their own IAM role. The secret never appears in Terraform, its state, its plans or its CI logs, and rotation does not need a Terraform run.

Finally, keep secrets out of variable defaults and `.tfvars` files in Git, and avoid `local-exec` provisioners that echo them into logs.
