---
id: tf-dependencies
title: "Dependencies: references and depends_on"
summary: The graph decides the order, not the file
why: "Terraform creates, updates and destroys in parallel wherever it can. Getting the dependency graph right is what keeps it from creating a server before its network, or deleting a role while something still uses it."
requires: [tf-variables]
lesson: none
points:
  - title: References create edges
    text: "When one resource's argument refers to another's attribute, Terraform orders them automatically. This covers almost every case."
  - title: Order in files does not matter
    text: "Terraform builds a graph from references. Blocks can be in any file, in any order."
  - title: depends_on is for hidden dependencies
    text: "Use it only when a dependency exists that no reference expresses, such as a policy that must be attached before an app starts."
  - title: Destroy runs backwards
    text: "Dependents are destroyed before what they depend on, the reverse of creation."
quiz_hint: Ask whether Terraform can see the dependency in an expression. If it can, you need nothing else.
quiz:
  - q: A subnet block uses vpc_id = aws_vpc.main.id. What else do you need so the VPC is created first?
    options: ["depends_on = [aws_vpc.main] on the subnet", "Nothing; the reference already makes the subnet depend on the VPC", "Put the VPC block first in the file"]
    answer: 1
    explain: "Every reference is a dependency edge. Adding depends_on as well is redundant noise."
  - q: When is depends_on the right tool?
    options: ["Whenever two resources are related", "When a dependency exists only at runtime and no argument refers to it, for example an instance that needs an IAM policy attached to its role", "To make plans faster"]
    answer: 1
    explain: "The instance refers to the role (via the profile), not to the separate policy attachment. Without depends_on, it may boot before the permissions exist."
  - q: What is a cost of depends_on on a whole module?
    options: ["None", "Everything in the module waits for the dependency, and data sources inside it may be deferred to apply time, making plans less precise", "The module is destroyed"]
    answer: 1
    explain: "Module-level depends_on is coarse. Prefer passing specific outputs as inputs, which creates precise edges."
links:
  - { title: "depends_on meta-argument (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/meta-arguments/depends_on" }
  - { title: "Resource graph (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/internals/graph" }
  - { title: "Resource blocks (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/resources/syntax" }
---
Terraform turns your configuration into a **dependency graph**. Each resource, data source, module, variable and output is a node; each reference from one to another (`aws_vpc.main.id`, `random_pet.service.id`) is an edge. It then walks the graph, running independent nodes in parallel (10 at a time by default) and dependent ones in order. Where blocks sit in which file has no effect at all.

## Implicit dependencies

Most dependencies come for free. In this module, the file's name uses the pet's ID, so Terraform must create the pet first:

```hcl
resource "random_pet" "suffix" {
  prefix = "${var.env}-${var.name}"
}

resource "local_file" "manifest" {
  filename = "${path.root}/out/${random_pet.suffix.id}.txt"
  content  = "name=${random_pet.suffix.id}\n"
}
```

Calling it twice with `for_each` (Terraform 1.16.6) shows both rules at once: the two independent instances run in parallel, and inside each, the file waits for its pet:

```sh
module.service["api"].random_pet.suffix: Creating...
module.service["worker"].random_pet.suffix: Creating...
module.service["worker"].random_pet.suffix: Creation complete after 0s [id=dev-worker-workable-duck]
module.service["api"].random_pet.suffix: Creation complete after 0s [id=dev-api-literate-dingo]
module.service["api"].local_file.manifest: Creating...
module.service["worker"].local_file.manifest: Creating...
module.service["worker"].local_file.manifest: Creation complete after 0s [id=1e347b775a439277176c252f6080a6f7871c7c22]
module.service["api"].local_file.manifest: Creation complete after 0s [id=7134233230fea48d7f78bb41fd0a9f3999c59b70]

Apply complete! Resources: 4 added, 0 changed, 0 destroyed.
```

On destroy, the order reverses: the files go before the pets.

## Explicit dependencies

Sometimes a dependency is real but invisible in expressions:

```hcl
resource "aws_iam_role_policy_attachment" "app_s3" {
  role       = aws_iam_role.app.name
  policy_arn = aws_iam_policy.read_reports.arn
}

resource "aws_instance" "app" {
  ami                  = data.aws_ami.base.id
  instance_type        = "t4g.small"
  iam_instance_profile = aws_iam_instance_profile.app.name

  # The app reads S3 at boot; the attachment is not referenced anywhere above.
  depends_on = [aws_iam_role_policy_attachment.app_s3]
}
```

The instance refers to the profile, which refers to the role, but nothing refers to the attachment. Without `depends_on`, the instance may boot before its permissions exist. Add a comment explaining why each `depends_on` is there; it is otherwise hard to tell a needed one from a superstitious one.

## When the graph is wrong

- **Cycles**: A refers to B and B refers to A, for example two security groups that each allow the other inline. Terraform reports `Error: Cycle`. Break it by using separate rule resources (`aws_vpc_security_group_ingress_rule`) that refer to both groups.
- **Eventual consistency**: a resource is created, but the cloud API does not yet return it everywhere. Dependencies cannot fix that; providers usually retry, and sometimes a `time_sleep` is the honest fix.
- **Over-wide depends_on** on modules or data sources defers reads to apply time and hides real changes behind `(known after apply)`.

`terraform graph` prints the graph in DOT format if you ever need to see it.
