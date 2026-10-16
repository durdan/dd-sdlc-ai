---
id: tf-state
title: "State: Terraform's memory"
summary: The map from configuration to real objects
why: "State is how Terraform knows that random_pet.name is the object with ID dev-known-woodcock. Lose it, corrupt it or let two runs write it at once, and Terraform can no longer manage what it built."
requires: [tf-declarative]
lesson: none
points:
  - title: State binds addresses to IDs
    text: "For each resource address, state records the real object's ID and its last known attributes."
  - title: Plans need it
    text: "Without state, Terraform would not know which objects it owns, and would try to create everything again."
  - title: Never hand-edit it
    text: "Use terraform state commands, moved, import and removed blocks. Editing the JSON risks corrupting the serial, lineage or resource data."
  - title: It is sensitive
    text: "State holds every attribute, including passwords and keys, in plain text. Protect it like a secret."
quiz_hint: Ask what Terraform would believe about the world if this state file were gone or wrong.
quiz:
  - q: You delete terraform.tfstate and run terraform plan. What does Terraform propose?
    options: ["No changes; it reads the cloud", "Creating every resource again, because it no longer knows that the existing objects are its own", "Destroying everything"]
    answer: 1
    explain: "Terraform only manages objects recorded in state. The existing ones become orphans, and creating duplicates may fail on name clashes or silently double your bill."
  - q: You need to rename a resource address in state. What is the safe way?
    options: ["Edit terraform.tfstate in a text editor", "A moved block (or terraform state mv), reviewed through a plan", "Delete the resource and recreate it"]
    answer: 1
    explain: "moved blocks are code-reviewed and show up in the plan as a move, with no change to the real object."
  - q: What are the serial and lineage fields in a state file for?
    options: ["Billing", "Lineage identifies one state's history; serial increases on every write, so Terraform can refuse to overwrite newer state with older", "They record the Terraform version"]
    answer: 1
    explain: "Pushing a state with a different lineage or a lower serial is refused unless forced. Hand-edits that get these wrong are a classic way to break a state."
links:
  - { title: "State (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/state" }
  - { title: "terraform state commands (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/cli/commands/state" }
  - { title: "Manage sensitive data (HashiCorp Developer)", url: "https://developer.hashicorp.com/terraform/language/state/sensitive-data" }
---
Every time Terraform creates something, it writes down what it created in the **state**: a JSON document that maps each resource address in your configuration (`random_pet.name`) to the real object's ID and its last known attributes. On the next run, Terraform reads state, refreshes those objects from the provider, and diffs them against the configuration. State is not a cache you can rebuild at will; it is the only record of which real objects belong to which blocks.

## What is inside

From the local demo used in this path (Terraform 1.5.7), abridged:

```json
{
  "version": 4,
  "terraform_version": "1.5.7",
  "serial": 3,
  "lineage": "86a3d8b9-6ec5-a133-dac0-a7eeb9bf9b0a",
  "resources": [
    {
      "mode": "managed",
      "type": "random_pet",
      "name": "name",
      "provider": "provider[\"registry.terraform.io/hashicorp/random\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": { "id": "dev-known-woodcock", "length": 2, "prefix": "dev", "separator": "-" }
        }
      ]
    }
  ]
}
```

- **lineage** is a unique ID for this state's history; **serial** increases on every write. Terraform refuses to replace a state with one of a different lineage or a lower serial unless forced.
- **attributes** are everything the provider returned, including computed values and secrets.
- Dependencies between instances are recorded too, so Terraform can destroy objects in the right order even after their blocks are deleted from the configuration.

## Working with state safely

```sh
terraform state list                        # every address in state
terraform state show random_pet.service     # one object's attributes
terraform state mv  OLD NEW                 # rename an address (prefer a moved block)
terraform state rm  ADDRESS                 # forget an object, leave it running (prefer a removed block)
terraform state pull > backup.tfstate       # copy the current remote state
```

Configuration-driven alternatives (`moved`, `import` and `removed` blocks, covered in the refactoring topic) are better for anything routine, because they go through a plan and code review like any other change. Keep the `state` subcommands for repairs.

**Do not edit the JSON by hand.** It is easy to break the structure, forget the serial or leave dependencies pointing at nothing, and a bad state can make the next apply destroy things. If you must repair one, pull a backup first, change it with the CLI, and verify with a plan that shows no unexpected changes.

## The rules that follow

1. **One writer at a time.** Two simultaneous applies against one state lose updates or corrupt it. Use a backend with locking (next topic).
2. **Store it remotely, versioned.** A laptop's `terraform.tfstate` is one disk failure from orphaning your infrastructure, and nobody else can run a plan.
3. **Keep it out of Git.** It contains secrets, and merges of state files are meaningless.
4. **Keep states small.** One state per environment and per area (network, data, apps) limits the blast radius of a bad apply and keeps plans fast.
5. **Restrict access.** Read access to state is read access to every secret in it.
