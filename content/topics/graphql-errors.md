---
id: graphql-errors
title: "Errors: partial data and the errors array"
summary: A 200 with half the data and a list of what failed
why: "A GraphQL response can succeed and fail at once. Clients that only check the HTTP status miss errors, and schemas with careless `!` turn one slow service into a blank page."
requires: [graphql-execution]
lesson: none
points:
  - title: Request errors stop everything
    text: "Syntax and validation problems are found before execution. The response has `errors` and no `data` key."
  - title: Execution errors are local
    text: "If a resolver throws, that field becomes null, an entry with a `message` and a `path` goes into `errors`, and the other fields still resolve."
  - title: Nulls climb past `!`
    text: "A non-null field can't hold null, so its error makes the parent null instead, and so on up to the first nullable position."
  - title: Expected failures can be data
    text: "\"Email already taken\" is part of your domain. Many schemas return it as a typed result (a union or a payload with `userErrors`) instead of an error."
quiz:
  - q: "A response contains both `data` and `errors`. What does that mean?"
    options: ["The server is misconfigured", "Execution ran; some fields failed and are null, and `errors` says which, by path", "Only the errors are valid"]
    answer: 1
    explain: "That is a partial response. Each error's `path` points to the field that failed, so a client can show the rest of the screen and handle the missing part."
  - q: "`viewCount: Int!` on `Post` throws, and `post` is nullable. What is `data.post`?"
    options: ["`{ title: ..., viewCount: null }`", "`null`: the error propagates from the non-null field to its nullable parent", "The request fails with no data"]
    answer: 1
    explain: "The non-null field can't be null, so the parent object takes the null. If `post` were also non-null, the null would continue upwards, possibly to `data` itself."
  - q: "What HTTP status does a GraphQL response with a resolver error usually have when served as `application/json`?"
    options: ["500", "200: the errors are in the body", "404"]
    answer: 1
    explain: "Partial results are successful HTTP responses, so clients must read the `errors` array. The GraphQL over HTTP draft adds the `application/graphql-response+json` type, with which a server can use non-200 codes when there is no data."
links:
  - { title: "Response (graphql.org)", url: "https://graphql.org/learn/response/" }
  - { title: "Error Handling (graphql.org)", url: "https://graphql.org/learn/error-handling/" }
  - { title: "Handling Execution Errors, GraphQL specification (September 2025)", url: "https://spec.graphql.org/September2025/#sec-Handling-Execution-Errors" }
  - { title: "Serving over HTTP (graphql.org)", url: "https://graphql.org/learn/serving-over-http/" }
---
A GraphQL response is a map with up to three keys: `data`, `errors` and `extensions`. If the request couldn't be parsed or failed validation, there is no `data` at all, only `errors`. If execution started, `data` is present, and any field whose resolver failed is set to null with an entry in `errors` describing it. The client therefore gets everything that worked plus a precise list of what didn't, which is very different from a REST call that returns either a body or an error status.

## The shape of an error

```json
{
  "data": { "post": { "title": "Hello", "viewCount": null } },
  "errors": [
    {
      "message": "stats service timed out",
      "locations": [{ "line": 4, "column": 5 }],
      "path": ["post", "viewCount"],
      "extensions": { "code": "UPSTREAM_TIMEOUT" }
    }
  ]
}
```

`path` names the response position that failed, including list indexes (`["posts", 3, "author"]`). `locations` point into the query document. `extensions` is free-form; servers put machine-readable codes there. Keep messages in production generic and log the details server-side: stack traces and internal names in `errors` tell an attacker a lot.

## How far a null travels

```js run
// How one failing field becomes null, and how far that null spreads.
// A field is [name, nonNull, children?]; resolving it may throw.
function execute(fields, source, path, errors) {
  const out = {}
  for (const [name, nonNull, children] of fields) {
    let value
    try {
      value = typeof source[name] === "function" ? source[name]() : source[name]
      if (children && value != null) value = execute(children, value, path.concat(name), errors)
    } catch (err) {
      if (err.propagate) value = null                     // a child already recorded the error
      else { errors.push({ message: err.message, path: path.concat(name) }); value = null }
    }
    if (value == null && nonNull) {                       // a non-null field can't hold null:
      const e = new Error("propagate"); e.propagate = true // hand the null to the parent
      throw e
    }
    out[name] = value
  }
  return out
}

function run(label, schema) {
  const errors = []
  let data
  try { data = execute(schema, root, [], errors) } catch { data = null }
  console.log(label, JSON.stringify(errors.length ? { data, errors } : { data }))
}

const root = {
  post: {
    title: "Hello",
    viewCount: () => { throw new Error("stats service timed out") },
  },
}

run("post: Post,  viewCount: Int   ->", [["post", false, [["title", true], ["viewCount", false]]]])
run("post: Post,  viewCount: Int!  ->", [["post", false, [["title", true], ["viewCount", true]]]])
run("post: Post!, viewCount: Int!  ->", [["post", true, [["title", true], ["viewCount", true]]]])
```

The error is recorded once, at the field that failed; what changes is how much of the response is lost. With `viewCount` nullable, only that number is missing. Marking it `Int!` costs the whole post, and marking `post` non-null too costs the entire response. Put `!` where a value is truly guaranteed, and leave fields that depend on other services nullable.

## Errors as data

Errors in `errors` are for things that went wrong. Outcomes the user can act on, such as a duplicate email, a declined card or a missing permission they could request, are usually better modelled in the schema:

```graphql
type Mutation { signUp(input: SignUpInput!): SignUpResult! }
union SignUpResult = SignUpSuccess | EmailTaken | InvalidInput
```

The client then handles each case with typed fields instead of parsing messages, and the schema documents every outcome.
