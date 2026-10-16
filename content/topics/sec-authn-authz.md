---
id: sec-authn-authz
title: Authentication vs authorisation
summary: Who are you, and what are you allowed to do?
why: "Mixing the two up is behind many serious breaches: an app checks that a user is logged in, but not that the record they asked for is theirs."
requires: [sec-threat-modelling]
lesson: none
points:
  - title: Authentication proves identity
    text: "Passwords, passkeys, one-time codes or a client certificate establish who is making the request. Failure is HTTP 401."
  - title: Authorisation grants actions
    text: "Given that identity, is this action on this resource allowed? Failure is HTTP 403 (or 404 if you don't want to reveal the resource exists)."
  - title: Check on every request, on the server
    text: "Hiding a button is not authorisation. Each API call must check permissions server side, against the specific object."
  - title: Deny by default
    text: "If no rule allows an action, it is refused. New endpoints start closed."
quiz:
  - q: "A logged-in user changes `/api/invoices/1041` to `/api/invoices/1042` and sees another customer's invoice. What failed?"
    options: ["Authentication", "Authorisation: the server didn't check that invoice 1042 belongs to this user", "TLS"]
    answer: 1
    explain: "The user was correctly identified; the server just never asked whether they may read that object. This is the most common form of broken access control."
  - q: Which HTTP status fits a request with a valid session that lacks permission?
    options: ["401 Unauthorized", "403 Forbidden", "500 Internal Server Error"]
    answer: 1
    explain: "Despite its name, 401 means 'not authenticated'. 403 means 'we know who you are, and the answer is no'. Some APIs return 404 to avoid revealing that the resource exists."
  - q: "The admin page is hidden from non-admins in the React app. Is that enough?"
    options: ["Yes, they can't see the button", "No: anyone can call the admin API directly, so the server must check the role on every admin endpoint", "Yes, if the code is minified"]
    answer: 1
    explain: "The client is under the user's control. UI hiding is a convenience; the API is the security boundary."
links:
  - { title: "Authentication Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" }
  - { title: "Authorization Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" }
  - { title: "RFC 9110: HTTP Semantics, 401 and 403", url: "https://datatracker.ietf.org/doc/html/rfc9110#name-401-unauthorized" }
---
**Authentication** answers "who is this?". **Authorisation** answers "is this identity allowed to do this, to this thing, right now?". They happen in that order, they fail in different ways, and many breaches come from doing the first carefully and the second not at all.

## Authentication

Authentication turns a request into an identity: a user ID, a service account, an API client. It uses one or more **factors**: something you know (a password), something you have (a phone, a security key, a device holding a passkey), something you are (a fingerprint, usually just unlocking a local key). After login, a session cookie or token carries the result, so later requests don't re-authenticate from scratch.

When it fails, respond with **401** and say as little as possible. "Invalid email or password" rather than "no account with that email" avoids helping attackers enumerate accounts.

## Authorisation

Authorisation takes the identity and the request and decides yes or no. Common models:

- **Role-based (RBAC):** users have roles (`admin`, `editor`), roles have permissions. Simple, coarse.
- **Attribute-based (ABAC):** rules over attributes of the user, the resource and the context ("managers may approve expenses under €5,000 in their own department").
- **Relationship-based (ReBAC):** permissions follow relationships ("can view a document if they are a member of a folder that contains it"), as in Google's Zanzibar and systems inspired by it.

Whatever the model, the decision has to include the **specific object**. "Is this user an editor?" is not enough; "is this user an editor *of this document*?" is.

## Rules that prevent most mistakes

- **Enforce on the server, for every request.** The browser, the mobile app and the URL are all under the user's control.
- **Deny by default.** A route without an explicit rule is refused. Many frameworks let you make this the global default.
- **Centralise the decision.** One policy function or service, called from everywhere, is easier to test than ownership checks copied into every handler.
- **Don't trust identifiers from the client for ownership.** Take the user ID from the authenticated session, not from a field in the request body.
- **Test it.** For each endpoint, a test that a second user gets 403 or 404 on the first user's objects catches the most common bug.

```js run
// A tiny policy check that always includes the object, and denies by default.
const invoices = { 1041: { owner: "alice" }, 1042: { owner: "bob" } }
const rules = {
  "invoice:read": (user, inv) => inv.owner === user.id || user.roles.includes("support"),
}
function can(user, action, obj) {
  const rule = rules[action]
  return Boolean(rule && obj && rule(user, obj)) // unknown action or object: no
}
const alice = { id: "alice", roles: [] }
console.log("alice reads 1041:", can(alice, "invoice:read", invoices[1041]))
console.log("alice reads 1042:", can(alice, "invoice:read", invoices[1042]))
console.log("alice deletes 1041:", can(alice, "invoice:delete", invoices[1041]))
```
