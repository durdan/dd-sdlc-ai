---
id: tf-testing
title: "Testing and policy: validate, test and plan checks"
summary: Catch mistakes before they reach apply
why: "A plan shows what will happen, but only a human reads it. Validation, tests, checks and policy rules let the pipeline reject bad changes before anyone has to spot them."
requires: [tf-modules]
lesson: none
points:
  - title: fmt and validate are free
    text: "terraform fmt -check and terraform validate need no credentials and catch syntax, type and reference errors in seconds."
  - title: terraform test runs scenarios
    text: "Since 1.6, .tftest.hcl files run plan or apply against a module with given inputs and assert on the results; mocks (1.7+) avoid real providers."
  - title: Conditions guard values
    text: "Variable validation, preconditions, postconditions and check blocks turn assumptions into errors or warnings at plan time."
  - title: Policy reads the plan
    text: "terraform show -json gives a machine-readable plan that policy tools (OPA, Sentinel, Checkov and others) can evaluate in CI."
quiz_hint: Ask how early in the pipeline each tool can run, and whether it needs real credentials.
quiz:
  - q: Which command can run in CI without any cloud credentials and catches an undefined variable reference?
    options: ["terraform apply", "terraform validate (after terraform init -backend=false)", "terraform state list"]
    answer: 1
    explain: "validate checks the configuration's syntax, types and references locally. It does not contact providers' APIs or read state."
  - q: "In a .tftest.hcl file, what does expect_failures = [var.env] mean?"
    options: ["The test is skipped", "The run passes only if the validation for var.env fails, which is how you test that bad input is rejected", "Errors in var.env are ignored for every run"]
    answer: 1
    explain: "Negative tests are as important as positive ones. In the example run, the qa input was rejected, so the test passed."
  - q: How does a check block differ from a precondition?
    options: ["They are identical", "A failed check block assertion produces a warning and does not stop the run; a failed precondition is an error", "Check blocks only run during destroy"]
    answer: 1
    explain: "Check blocks (1.5+) are for ongoing validation of the live system, such as a health endpoint. Preconditions and postconditions block the plan or apply."
links:
  - { title: "Tests (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/tests" }
  - { title: "terraform test command (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/test" }
  - { title: "Checks (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/checks" }
  - { title: "terraform validate command (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/validate" }
---
Infrastructure code fails in expensive ways: a deleted database, an open port, a bill. Reviewing plans is necessary but not enough, because humans skim. Terraform gives you layers of automated checking, from instant syntax checks to scenario tests and policy on the plan itself, and most of them need no real cloud account.

## The cheap layer

```sh
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

`validate` printed `Success! The configuration is valid.` for the demo configuration. It catches typos in references, wrong types and missing required arguments. Add a linter such as TFLint for provider-specific mistakes (an instance type that does not exist).

## terraform test

Test files (`*.tftest.hcl`, Terraform 1.6+) contain `run` blocks. Each run plans or applies the module under test with given variables and checks `assert` conditions; applied resources are destroyed at the end.

```hcl
# tests/main.tftest.hcl
variables {
  env = "dev"
}

run "default_has_two_replicas" {
  command = plan
  assert {
    condition     = length(random_pet.service) == 2
    error_message = "expected two replicas by default"
  }
}

run "names_carry_the_env_prefix" {
  command = apply
  variables {
    env      = "prod"
    replicas = 3
  }
  assert {
    condition     = alltrue([for n in output.names : startswith(n, "prod-")])
    error_message = "every name should start with prod-"
  }
}

run "rejects_unknown_env" {
  command = plan
  variables {
    env = "qa"
  }
  expect_failures = [var.env]
}
```

Against a module with a validated `env` variable and `count = var.replicas` (Terraform 1.16.6):

```sh
tests/main.tftest.hcl... in progress
  run "default_has_two_replicas"... pass
  run "names_carry_the_env_prefix"... pass
  run "rejects_unknown_env"... pass
tests/main.tftest.hcl... tearing down
tests/main.tftest.hcl... pass

Success! 3 passed, 0 failed.
```

`command = plan` tests need no real resources. For providers that would call a cloud, **mock providers** and overrides (Terraform 1.7+) return fake values, so module logic can be tested in CI without credentials. Real `apply` tests against a sandbox account catch what mocks cannot (permissions, API constraints), at the cost of time and money.

## Conditions in the configuration

- **Variable validation** rejects bad input before planning.
- **Preconditions and postconditions** in `lifecycle` assert facts about resources and data sources, and fail the run.
- **check blocks** (1.5+) assert on the live system and only warn. In the demo, a check on a port range produced:

```sh
Warning: Check block assertion failed

  on main.tf line 59, in check "port_in_range":
  59:     condition     = random_integer.port.result < 8400
    ├────────────────
    │ random_integer.port.result is 8443

Port 8443 is in the reserved upper range.
```

## Policy on the plan

`terraform plan -out=tfplan && terraform show -json tfplan > plan.json` produces the full plan as JSON. Policy engines evaluate it: Open Policy Agent (with Conftest), HashiCorp Sentinel in HCP Terraform, or scanners such as Checkov and Trivy. Typical rules: no security group open to the world on port 22, every bucket encrypted and private, no deletes of resources tagged `critical`, only approved instance types. Failing the pipeline on these makes the rules real, rather than a wiki page.
