---
id: mongo-validation
title: Schema validation
summary: Let the server reject documents of the wrong shape
why: "Every service that writes to a collection has its own idea of the schema. A validator on the collection is the one place that applies to all of them, including the script someone runs by hand."
requires: [mongo-schema-design]
lesson: none
points:
  - title: Validators live on the collection
    text: "A $jsonSchema document (or query operators) is checked on every insert and update, whichever client sends it."
  - title: The level decides which documents are checked
    text: "strict (the default) checks every insert and update; moderate skips updates to documents that were already invalid."
  - title: The action decides what happens
    text: "error rejects the write; warn lets it through and logs the violation. 8.1 adds errorAndLog, which does both."
  - title: Errors explain themselves
    text: "A rejected write returns code 121 with details of which rule failed and for which field."
quiz_hint: Think about documents that were written before the validator existed.
quiz:
  - q: You add a validator with validationLevel strict to a collection holding old documents that do not match. What happens to them?
    options:
      - They are deleted
      - "Nothing yet; they stay, but any later update to one of them must produce a valid document"
      - The validator is rejected until the collection is clean
    answer: 1
    explain: "Validators are not applied retroactively. With strict, updating an old invalid document fails unless the result is valid; with moderate, such updates are allowed. MongoDB 9.0 adds a constraint level that guarantees every document in the collection is valid."
  - q: Why might you start a new validator with validationAction warn?
    options:
      - "To see in the log which writers would break before you start rejecting their writes"
      - Because warn is faster
      - Because error is not supported with $jsonSchema
    answer: 0
    explain: "warn logs each violation and lets the write succeed. Once the log is quiet, switch to error with collMod."
  - q: Does a $jsonSchema validator make MongoDB enforce foreign keys between collections?
    options:
      - Yes, through the required keyword
      - "No; a validator checks one document at a time and cannot look at other collections"
      - Only inside transactions
    answer: 1
    explain: "Validation is per document: types, required fields, ranges, enums, patterns. Relationships between documents remain the application's job."
links:
  - { title: "Schema validation (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/schema-validation/" }
  - { title: "Specify JSON Schema validation (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/schema-validation/specify-json-schema/" }
  - { title: "Specify validation level (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/schema-validation/specify-validation-level/" }
  - { title: "Choose how to handle invalid documents (MongoDB manual)", url: "https://www.mongodb.com/docs/manual/core/schema-validation/handle-invalid-documents/" }
---
MongoDB does not require the documents in a collection to share a shape, but it can enforce one. A validator attached to the collection is checked by the server on every insert and update, so it protects the data from every client at once: each service, each migration script, each person in a shell. It is the closest MongoDB gets to the column types and `CHECK` constraints of a relational table.

## A validator

```js
db.createCollection("customers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "plan"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        plan: { enum: ["free", "pro"] }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})

db.customers.insertOne({ email: "ana@example.com", plan: "gold" })
```

The insert fails with code 121, "Document failed validation", and the error's `errInfo` says exactly why:

```json
{
  "operatorName": "properties",
  "propertiesNotSatisfied": [{
    "propertyName": "plan",
    "details": [{
      "operatorName": "enum",
      "specifiedAs": { "enum": ["free", "pro"] },
      "reason": "value was not found in enum",
      "consideredValue": "gold"
    }]
  }]
}
```

(Trimmed from `errInfo.details.schemaRulesNotSatisfied`.) Log or return those details; "Document failed validation" alone sends people hunting.

By default extra fields are allowed. Add `additionalProperties: false` to forbid them, but then you must list `_id` too.

## Levels and actions

`validationLevel` decides which writes are checked:

- `strict` (the default) checks every insert and every update.
- `moderate` checks inserts and updates to documents that are already valid, and lets updates to existing invalid documents through.
- `constraint` (new in MongoDB 9.0) also guarantees that every document already in the collection is valid.

`validationAction` decides what happens to a failing write: `error` (the default) rejects it, `warn` accepts it and writes the violation to the server log, and `errorAndLog` (new in 8.1) rejects it and logs it.

## Rolling out a validator

Adding one to a live collection does not touch existing documents. A careful sequence:

1. Find violators first: `db.customers.find({ $nor: [ { $jsonSchema: schema } ] })`, with the same schema object, lists documents that do not match.
2. Apply the validator with `collMod` and `validationAction: "warn"`, and watch the log for writers you did not know about.
3. Fix the data and the writers, then switch to `error`.

```js
db.runCommand({ collMod: "customers", validator: { $jsonSchema: { /* ... */ } }, validationAction: "warn" })
```

A validator checks one document at a time. It cannot check that a `customerId` exists in another collection or that a value is unique (that is a unique index's job).
