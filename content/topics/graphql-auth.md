---
id: graphql-auth
title: "Authorisation at the field level"
summary: Authenticate once per request; authorise wherever data is reached
why: "In a graph, the same object can be reached by many paths. A check on one entry point protects that path only; the rule has to travel with the data, or someone will find another way in."
requires: [graphql-execution]
lesson: none
points:
  - title: Authentication before execution
    text: "Verify the token or session in the HTTP layer and put the resulting user in `context`. Resolvers should never parse credentials themselves."
  - title: Many paths, one rule
    text: "`me.email`, `post.author.email` and `search` results all reach `User.email`. Enforce the rule where that data is loaded, not on one root field."
  - title: Put rules in the business layer
    text: "Resolvers call functions such as `users.getEmail(viewer, user)`; the same functions serve REST endpoints and jobs, so every entry point agrees."
  - title: Deny without leaking
    text: "A hidden field can return null with an error, or the object can look as if it doesn't exist. Pick per field, and be consistent."
quiz:
  - q: "`Query.adminStats` checks for the admin role. `User.salary` has no check, and is reachable via `team.members`. Is salary protected?"
    options: ["Yes: only admins see admin stats", "No: any user who can query a team can select `members { salary }`", "Yes: introspection hides it"]
    answer: 1
    explain: "Authorisation on one root doesn't follow the data. Put the rule on `User.salary`, or better, in the function that loads salary data."
  - q: "Where should the server read the bearer token?"
    options: ["In each resolver from `info`", "Once, before execution; the verified user goes into `context`", "From a `token` argument on every field"]
    answer: 1
    explain: "Authentication is per request and belongs in the transport layer. Resolvers see only the result, so they can't forget it or do it differently."
  - q: "A user asks for `post(id: \"p9\")`, a draft they may not see. A common, safe answer is:"
    options: ["The draft with its body removed", "`null`, as if the post didn't exist (optionally with an error)", "A 403 status for the whole response"]
    answer: 1
    explain: "Returning null for objects the viewer can't see avoids confirming that they exist. Failing the whole HTTP response would also hide every other field the client asked for."
links:
  - { title: "Authorization (graphql.org)", url: "https://graphql.org/learn/authorization/" }
  - { title: "Security (graphql.org)", url: "https://graphql.org/learn/security/" }
---
GraphQL separates the two halves of access control more sharply than most APIs. **Authentication** (who is this?) happens once per request, before execution, usually in HTTP middleware that checks a session or token and puts the verified user into the request's `context`. **Authorisation** (may they see this field of this object?) has to happen wherever data is reached, because a graph has many paths to the same data. The guidance from graphql.org is to keep those rules in the business logic layer that resolvers call, so the same rule applies whether the data is reached through GraphQL, a REST endpoint or a background job.

## Many paths, one field

```graphql
type Query {
  me: User
  post(id: ID!): Post
  search(text: String!): [SearchResult!]!
}
type Post { author: User! }
type User { id: ID! name: String! email: String }
```

Three different routes lead to `User.email`. A check on `Query.me` protects only the first:

```js run
// Two paths to the same private field: me.email and post.author.email.
const users = { u1: { id: "u1", name: "Ada", email: "ada@example.com" }, u2: { id: "u2", name: "Linus", email: "linus@example.com" } }
const posts = { p1: { id: "p1", authorId: "u1" } }

// Version 1: the check sits on one root field only.
const rootOnly = {
  me: (ctx) => users[ctx.userId],
  post: (ctx, id) => posts[id],
  author: (ctx, post) => users[post.authorId],
  email: (ctx, user) => user.email,                          // no check here
}

// Version 2: the rule lives with the data, so every path that reaches it applies it.
const canSeeEmail = (ctx, user) => ctx.userId === user.id || ctx.role === "admin"
const fieldLevel = {
  ...rootOnly,
  email: (ctx, user) => (canSeeEmail(ctx, user) ? user.email : null),
}

const viewer = { userId: "u2", role: "reader" }               // Linus is logged in
for (const [label, r] of [["root-only check", rootOnly], ["field-level check", fieldLevel]]) {
  const mine = r.email(viewer, r.me(viewer))
  const viaPost = r.email(viewer, r.author(viewer, r.post(viewer, "p1")))
  console.log(`${label}: me.email=${mine}  post(p1).author.email=${viaPost}`)
}
```

## Where the rule lives

```js
// users.js: the business layer, shared by every entry point
export async function getEmail(viewer, user) {
  if (!viewer) return null
  if (viewer.id === user.id || viewer.roles.includes("support")) return user.email
  return null
}

// resolvers.js
const resolvers = {
  User: { email: (user, _args, ctx) => users.getEmail(ctx.viewer, user) },
}
```

Pass the business layer a fully loaded user, not a raw token, so it can decide on roles and ownership. Some servers offer schema directives such as `@auth(requires: ADMIN)`; they are a convenient way to attach rules to fields, but they still need to call the same business logic, and they can't express ownership rules ("authors see their own drafts") without it.

## Patterns that help

- **Filter lists at the source.** A resolver that loads 100 posts and then hides 60 has paged wrongly; ask the data layer for "posts this viewer may see".
- **Mind batching.** A DataLoader keyed only by id returns whatever it loaded first; since loaders are per request and per viewer, that is fine, but never share one between users.
- **Mutations need checks too**, on the object being changed, not only on the operation: `updatePost(id)` must confirm this viewer owns that post.
- **Don't confirm existence.** For objects the viewer can't see, returning null is often safer than an error that says "forbidden".
