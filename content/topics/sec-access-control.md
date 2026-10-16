---
id: sec-access-control
title: Broken access control
summary: Check every request, against the specific object, on the server
why: "Broken access control is A01 in the OWASP Top 10:2025. It needs no clever exploit, just a changed ID or a direct API call, and scanners rarely find it because only you know who should see what."
requires: [sec-owasp-top10, sec-authn-authz]
lesson: none
points:
  - title: IDOR is the classic
    text: "An insecure direct object reference: the server fetches a record by the ID in the URL without checking that it belongs to the caller."
  - title: Function-level checks
    text: "Admin and internal endpoints must check roles themselves. Being unlinked from the UI is not protection."
  - title: Mass assignment
    text: "Binding a whole request body to a model lets users set fields like role or owner_id. Accept an explicit list of fields."
  - title: Test with two users
    text: "For every endpoint, a test that user B can't read or change user A's objects catches most of these bugs."
quiz:
  - q: Which handler is safe?
    code: |
      // A
      const doc = await db.docs.findById(req.params.id)
      // B
      const doc = await db.docs.findOne({ id: req.params.id, ownerId: req.user.id })
      // C
      const doc = await db.docs.findById(req.params.id); if (req.query.owner === "me") ...
    options: ["A", "B", "C"]
    answer: 1
    explain: "B scopes the lookup to the authenticated user, so another user's ID simply finds nothing. A checks nothing; C trusts a query parameter the client controls."
  - q: "A profile update endpoint does `Object.assign(user, req.body)`. What can a user do?"
    options: ["Only change their own name and email", "Send fields like role or isAdmin and promote themselves", "Nothing; the database validates it"]
    answer: 1
    explain: "This is mass assignment. Pick allowed fields explicitly, or validate the body against a schema that only includes what users may change."
  - q: Do random UUIDs instead of sequential IDs fix IDOR?
    options: ["Yes, they can't be guessed", "No: they make guessing harder, but IDs leak through links, logs and shared URLs, so the ownership check is still needed", "Only for admin pages"]
    answer: 1
    explain: "Unguessable IDs are a useful extra layer, not access control. Anyone who sees a UUID once can still use it if the server doesn't check."
links:
  - { title: "A01:2025 Broken Access Control (OWASP Top 10)", url: "https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/" }
  - { title: "Authorization Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" }
  - { title: "Mass Assignment Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html" }
---
Access control decides whether an authenticated user may do this action on this object. It breaks in mundane ways: a handler that loads a record by ID and returns it, an admin route that assumes only admins know its URL, an update endpoint that saves whatever fields arrive. None of these needs a sophisticated attacker, only one who changes a number in a URL.

## The common shapes

**Insecure direct object references (IDOR).** `GET /api/orders/7731` returns order 7731 to anyone logged in. The fix is to make the ownership condition part of the lookup, so the wrong user finds nothing:

```js run
const orders = [
  { id: 7731, ownerId: "ana", total: 42 },
  { id: 7732, ownerId: "ben", total: 99 },
]
// Unsafe: finds by ID only.
const getOrderUnsafe = (user, id) => orders.find((o) => o.id === id)
// Safe: the owner is part of the query, and a miss looks the same as "not found".
const getOrder = (user, id) => orders.find((o) => o.id === id && o.ownerId === user.id) ?? null

const ben = { id: "ben" }
console.log("unsafe, ben asks for 7731:", getOrderUnsafe(ben, 7731))
console.log("safe, ben asks for 7731:  ", getOrder(ben, 7731))
console.log("safe, ben asks for 7732:  ", getOrder(ben, 7732))
```

Returning 404 rather than 403 for someone else's object also avoids confirming that it exists.

**Missing function-level checks.** `/admin/export-users` isn't linked anywhere for normal users, but anyone who finds it in a JavaScript bundle can call it. Every privileged endpoint checks the role on the server, ideally through middleware applied to the whole admin router, so a new route can't forget.

**Mass assignment.** Frameworks that bind request bodies to models make it easy to save `{"name":"Ana","role":"admin"}`. Use explicit allow-lists of writable fields or separate input types per action.

**Path and method gaps.** The check is on `GET /items/:id` but not on `PUT` or `DELETE`, or on `/items/:id` but not `/items/:id/attachments`. Check per action, not per URL pattern.

**Trusting the client.** Prices, user IDs, roles or "isAdmin" flags taken from the request body, a hidden field, or an unsigned cookie.

**Server-side request forgery** (also in A01 since 2025). The server fetches a URL the user supplies and can reach internal services the user can't. Allow-list destinations, block private and metadata address ranges, and don't follow redirects blindly.

## Building it so it holds

- **Deny by default**, and enforce in one place: middleware or a policy function every handler calls.
- **Scope queries** by tenant and owner from the authenticated session, not from request fields. In multi-tenant systems, database row-level security adds a second layer.
- **Log denials** and alert on spikes; a burst of 403s and 404s across sequential IDs is someone scanning.
- **Test it**: two users, every endpoint, every method. These tests are cheap and catch the bugs scanners miss, because a scanner doesn't know which records belong to whom.
