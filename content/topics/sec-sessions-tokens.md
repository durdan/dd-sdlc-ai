---
id: sec-sessions-tokens
title: "Sessions vs tokens, and JWT pitfalls"
summary: A random ID the server looks up, or a signed claim the server trusts
why: "After login, every request is authenticated by whatever the client sends back. Get that wrong and an attacker doesn't need the password at all."
requires: [sec-authn-authz, web-security]
lesson: none
points:
  - title: Server-side sessions
    text: "The client holds a long random ID in a cookie; the server keeps the session data. Easy to revoke: delete the row."
  - title: Self-contained tokens
    text: "A JWT carries claims signed by the issuer, so any service with the key can check it without a lookup. Hard to revoke before it expires."
  - title: Signed is not secret
    text: "A JWT's header and payload are just base64url-encoded JSON. Anyone holding the token can read them, so never put secrets in a JWT."
  - title: Verify strictly
    text: "Pin the expected algorithm, check signature, issuer, audience and expiry, and reject `alg: none`."
quiz:
  - q: What does decoding a JWT's payload require?
    options: ["The signing key", "Nothing: it's base64url-encoded JSON, readable by anyone who has the token", "The user's password"]
    answer: 1
    explain: "The signature protects integrity, not confidentiality. Put only what you'd be fine for the token holder (and anyone who steals it) to read."
  - q: "A user's account is compromised. Their access JWTs are valid for 24 hours. What can you do immediately?"
    options: ["Delete the JWT from the server", "Not much without extra machinery: keep access tokens short-lived, revoke the refresh token, or keep a deny-list checked on each request", "Change the user's password, which invalidates the JWT"]
    answer: 1
    explain: "A self-contained token is valid until it expires unless every verifier checks something extra. That is why access tokens usually last minutes and refresh tokens are revocable."
  - q: "A verifier reads the `alg` field from the token header and uses whatever it says. Why is that dangerous?"
    options: ["It is slower", "An attacker can choose the algorithm, for example 'none' or HS256 with your public key as the secret, and forge tokens", "It isn't; the header is signed"]
    answer: 1
    explain: "RFC 8725 says to pin the algorithms you accept. The header is attacker-controlled input until the signature has been checked with the algorithm you expect."
links:
  - { title: "RFC 8725: JSON Web Token Best Current Practices", url: "https://datatracker.ietf.org/doc/html/rfc8725" }
  - { title: "RFC 7519: JSON Web Token (JWT)", url: "https://datatracker.ietf.org/doc/html/rfc7519" }
  - { title: "Session Management Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" }
---
Once a user has logged in, the client needs a way to prove it on every later request. There are two broad designs. A **server-side session** gives the client an opaque random ID and keeps the state on the server. A **self-contained token**, usually a JSON Web Token (JWT), puts signed claims in the client's hands so servers can check them without a lookup. Each has its place; the trouble usually comes from using JWTs where a session would have been simpler.

## Server-side sessions

The server creates a long random ID (at least 128 bits from a secure random generator), stores the session data against it, and sends it as a cookie with `HttpOnly`, `Secure` and `SameSite`. Each request looks the session up. Logging out, or kicking a stolen session, is deleting it. Issue a new ID at login and on privilege changes, so an ID planted before login (session fixation) is worthless afterwards, and expire sessions after idle time and an absolute maximum.

For a classic web app with one backend, this is usually the best choice.

## JWTs

A JWT is three base64url-encoded parts joined by dots: header, payload (the claims), signature. Any service holding the issuer's key can verify it locally, which is useful across many services or between organisations. That is also its main weakness: a valid token stays valid until `exp`, unless every verifier also checks a revocation list.

It is easy to forget that the payload is readable by anyone:

```js run
// A made-up token: header and payload are real base64url, the signature is a placeholder.
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwicm9sZSI6InVzZXIiLCJlbWFpbCI6ImFuYUBleGFtcGxlLmNvbSIsImV4cCI6MTc2MDYyMDQwMH0.placeholder-signature"

function decodePart(part) {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=")
  return JSON.parse(atob(b64))
}
const [header, payload] = token.split(".")
console.log("header: ", decodePart(header))
console.log("payload:", decodePart(payload))
console.log("No key was needed. Signing protects integrity, not secrecy.")
```

## JWT pitfalls (RFC 8725)

- **Trusting the header's `alg`.** Pin the algorithm (or small set) you accept. Reject `none`. Never let a token switch from an asymmetric algorithm to HS256, where an attacker could sign with your *public* key as the HMAC secret.
- **Skipping claim checks.** Verify `exp`, `nbf`, `iss` and `aud`. A token issued for another service (`aud`) must not work on yours.
- **Weak HMAC secrets.** HS256 secrets must be long and random; short ones can be brute-forced offline from a single token.
- **Secrets in the payload.** Don't put personal data you wouldn't show the user, and never passwords or keys.
- **Long lifetimes.** Keep access tokens short (minutes), and use a refresh token that the server can revoke.
- **Storing tokens in `localStorage`.** Any XSS on your page can read them. An `HttpOnly` cookie can't be read by script, though cookies bring CSRF considerations instead.

## Choosing

Use server-side sessions for a browser talking to its own backend. Use short-lived signed tokens when many independent services must verify identity without a shared session store, or across organisations, which is the case OAuth and OpenID Connect handle in the next topic.
