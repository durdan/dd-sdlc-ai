---
id: sec-oauth-oidc
title: "OAuth 2 and OpenID Connect"
summary: Delegated access, and login on top of it, with the code flow and PKCE
why: "\"Sign in with...\" and \"Allow this app to read your calendar\" are both OAuth. Using the wrong flow, or skipping one check, hands tokens to whoever asks for them."
requires: [sec-sessions-tokens]
lesson: none
points:
  - title: OAuth is about access
    text: "A user lets a client app act on a resource (an API) without giving it their password. The result is an access token with limited scope."
  - title: OIDC is about identity
    text: "OpenID Connect adds an ID token, a signed JWT that tells the client who the user is. Use it for login; use access tokens for APIs."
  - title: Authorization code + PKCE
    text: "The browser carries only a short-lived code; the client swaps it for tokens. PKCE proves the swapper is the app that started the flow."
  - title: Retired flows
    text: "The implicit grant should not be used, and the resource owner password grant must not be (RFC 9700)."
quiz:
  - q: What problem does PKCE solve?
    options: ["It encrypts the access token", "An intercepted authorization code is useless without the code_verifier that only the original client knows", "It replaces client secrets for servers"]
    answer: 1
    explain: "The client sends a hash (code_challenge) at the start and the original random value (code_verifier) when exchanging the code. An attacker who steals the code can't produce the verifier."
  - q: An API receives an ID token as a bearer token and accepts it. What's wrong?
    options: ["Nothing; both are JWTs", "ID tokens are for the client to learn who logged in; APIs should accept access tokens issued for them (checked by audience)", "ID tokens are encrypted"]
    answer: 1
    explain: "The ID token's audience is the client app, not your API. Accepting it lets any app that received a user's ID token call your API as that user."
  - q: "According to RFC 9700, which grant MUST NOT be used?"
    options: ["Authorization code", "Resource owner password credentials", "Client credentials"]
    answer: 1
    explain: "Handing the user's password to the client defeats the purpose of OAuth and can't support MFA or passkeys well. Client credentials remain fine for service-to-service calls."
links:
  - { title: "RFC 9700: Best Current Practice for OAuth 2.0 Security", url: "https://datatracker.ietf.org/doc/html/rfc9700" }
  - { title: "RFC 7636: Proof Key for Code Exchange (PKCE)", url: "https://datatracker.ietf.org/doc/html/rfc7636" }
  - { title: "OpenID Connect Core 1.0", url: "https://openid.net/specs/openid-connect-core-1_0.html" }
  - { title: "OAuth 2.0 Protocol Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html" }
---
**OAuth 2.0** lets a user give an application limited access to their data on another service without handing over their password: "let this app read my calendar". **OpenID Connect (OIDC)** is a thin layer on top that adds identity: "this is the user who just signed in". Almost every "Sign in with…" button is OIDC, and almost every API integration between companies is OAuth.

## The cast

- **Resource owner**: the user.
- **Client**: the app that wants access (a web app, a mobile app, a backend job).
- **Authorization server**: issues tokens after the user logs in and consents (Google, Microsoft Entra ID, Okta, Auth0, Keycloak, your own).
- **Resource server**: the API that accepts access tokens.

## The authorization code flow with PKCE

This is the flow to use for web apps, single-page apps and mobile apps:

```text
1. Client creates a random code_verifier and its SHA-256 hash, the code_challenge.
2. Client redirects the browser to the authorization server:
     /authorize?response_type=code&client_id=...&redirect_uri=...
                &scope=openid profile&state=...&code_challenge=...&code_challenge_method=S256
3. User logs in (password, passkey, MFA) and consents.
4. Authorization server redirects back: redirect_uri?code=...&state=...
5. Client checks that state matches, then POSTs to /token with
     code, redirect_uri, client_id and the original code_verifier.
6. Authorization server checks the verifier against the challenge and returns
     an access token, often a refresh token, and (with OIDC) an ID token.
```

The browser only ever sees a short-lived, single-use **code**. **PKCE** (RFC 7636) means a stolen code is useless: whoever redeems it must present the verifier that matches the challenge from step 1. RFC 9700 requires PKCE for public clients (apps that can't keep a secret, like SPAs and mobile apps) and recommends it for everyone else. **`state`** (or the OIDC `nonce`) ties the response to the request and blocks cross-site request forgery on the redirect.

## Tokens and what they're for

- **Access token**: sent to the resource server. Its audience is the API. The client shouldn't depend on its contents; it may be opaque.
- **Refresh token**: lets the client get new access tokens without the user. Keep it on the server where possible; for public clients use rotation (each refresh returns a new refresh token and invalidates the old one) or sender-constrained tokens.
- **ID token** (OIDC): a signed JWT for the *client*, with `sub` (a stable user ID), `iss`, `aud` (the client's ID), `exp`, `nonce`. The client validates it to log the user in. It is not an API credential.

Identify users by `iss` plus `sub`, not by email: emails change and can be reassigned.

## Retired and special-purpose flows

- **Implicit grant** (tokens directly in the redirect URL): RFC 9700 says clients should not use it. Use code + PKCE.
- **Resource owner password credentials** (the app collects the password): must not be used.
- **Client credentials**: fine for service-to-service calls with no user.
- **Device authorization**: for TVs and CLIs that can't show a browser easily.

## Practical rules

Use a certified library or your provider's SDK; don't write the flow by hand. Register exact redirect URIs (no wildcards). Request the smallest scopes you need. Validate every ID token's signature, `iss`, `aud`, `exp` and `nonce`. On APIs, accept only access tokens issued for that API.
