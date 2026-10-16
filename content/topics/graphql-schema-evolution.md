---
id: graphql-schema-evolution
title: "Evolving a schema without versions"
summary: Add freely, deprecate loudly, remove only when nobody asks
why: "GraphQL APIs usually have no /v2. That works only if every change is checked against what clients really send; otherwise \"versionless\" just means breaking people without warning."
requires: [graphql-schema, qa-contract-testing]
lesson: none
points:
  - title: Adding is safe
    text: "Clients get only the fields they ask for, so new types, new fields and new optional arguments break nobody."
  - title: Deprecate, then remove
    text: "Mark the old field `@deprecated(reason: ...)`, point to its replacement, watch usage fall to zero, then delete it."
  - title: Know what clients send
    text: "Field-level usage from logged operations, or a registry of client documents, tells you whether a change is safe."
  - title: Nullability is part of the contract
    text: "Making a field nullable can break clients that assumed a value; making an argument required breaks every caller that omits it."
quiz:
  - q: "Which change is safe for existing clients?"
    options: ["Renaming `User.fullName` to `User.name`", "Adding a new field `User.displayName`", "Making the `first` argument required"]
    answer: 1
    explain: "A new field is invisible to operations that don't select it. Renaming removes a field clients use, and a newly required argument rejects every query that omits it."
  - q: "`email: String!` becomes `email: String`. Who can break?"
    options: ["Nobody: it only adds a possible value", "Clients that rely on the value always being present, such as generated non-optional types", "Only the server"]
    answer: 1
    explain: "Output types becoming nullable widens what clients receive. Typed clients generated from the old schema may crash on the new null; treat it as breaking."
  - q: "In the September 2025 edition of the spec, where can `@deprecated` be used?"
    options: ["Only on fields", "On fields, enum values, arguments and input fields", "Only on types"]
    answer: 1
    explain: "The October 2021 edition allowed fields and enum values. The 2025 edition adds arguments and input object fields, so input changes can be phased out the same way."
links:
  - { title: "Schema Change Management (graphql.org)", url: "https://graphql.org/learn/governance-versioning/" }
  - { title: "Schema Design (graphql.org)", url: "https://graphql.org/learn/schema-design/" }
  - { title: "FAQ: versioning (graphql.org)", url: "https://graphql.org/faq/" }
  - { title: "@deprecated, GraphQL specification (September 2025)", url: "https://spec.graphql.org/September2025/#sec--deprecated" }
---
Most GraphQL APIs are never versioned. Because each client names the exact fields it uses, the server can add types and fields at any time without affecting anyone, and the schema grows continuously instead of jumping from v1 to v2. Removing or changing things is where care is needed. The built-in `@deprecated` directive marks what is going away, introspection and tooling show it to client developers, and the server's knowledge of which fields clients actually request tells you when removal is safe. Nothing stops you from versioning a GraphQL API like any other, but the language is designed so you rarely have to.

## Safe and breaking changes

| Usually safe | Breaking |
|---|---|
| Add a type, field, or enum value* | Remove or rename a field, type or enum value |
| Add an optional argument or input field | Add a required argument or input field |
| Make an argument optional | Make an argument required, or change its type |
| Make an output field non-null | Make an output field nullable |
| Deprecate anything | Change what a field means while keeping its name |

\*A new enum value can surprise clients that switch exhaustively over an output enum; give them a default branch. The direction of nullability flips between inputs and outputs: a non-null output promises more (safe), a non-null input demands more (breaking).

## Deprecation

```graphql
type User {
  id: ID!
  name: String!
  fullName: String @deprecated(reason: "Use `name`. Removed after 2027-01-31.")
}

type Query {
  users(first: Int, limit: Int @deprecated(reason: "Use `first`.")): UserConnection!
}

enum Status {
  ACTIVE
  DISABLED
  BANNED @deprecated(reason: "Use DISABLED with a `reason` field.")
}
```

The October 2021 edition of the spec allowed `@deprecated` on fields and enum values; the September 2025 edition also allows it on arguments and input fields, as in `limit` above. Deprecated elements still work, are hidden from introspection unless the client asks with `includeDeprecated: true`, and are flagged by editors and linters.

## Removing with evidence

The loop is: add the replacement, deprecate the old field with a reason and a date, tell client owners, then **measure**. Servers can record which fields each operation selects; a registry of persisted or trusted documents tells you exactly which shipped clients use what. When usage reaches zero (or the remaining callers have been contacted and the date has passed), remove the field. Mobile apps make this slower, because old versions stay installed for months.

Automate the check. On every schema change in CI, compare the new schema with the old one, list breaking changes, and test them against the operations clients have registered. That is contract testing with the schema as the contract: the change fails the build, not a customer's app.
