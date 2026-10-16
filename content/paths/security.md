---
id: security
title: "Security basics every engineer needs"
promise: "Spot the threats in a design before you build it, handle passwords, sessions, tokens, secrets and keys the way current guidance says, recognise the OWASP Top 10 flaws in your own code, and know what to do when a secret leaks or a vulnerability is reported."
kind: skill
level: beginner
tags: [security]
stages:
  - title: Think like a defender
    blurb: Threat modelling in half an hour
    topics: [sec-threat-modelling]
  - title: Identity
    blurb: Who you are, what you may do
    topics: [sec-authn-authz, sec-passwords, sec-mfa-passkeys, sec-sessions-tokens, sec-oauth-oidc]
  - title: Application flaws
    blurb: OWASP Top 10, injection, access control
    topics: [sec-owasp-top10, sec-injection, sec-access-control]
  - title: Protecting data
    blurb: TLS, encryption, secrets
    topics: [sec-tls, sec-encryption, sec-secrets]
  - title: Operating securely
    blurb: Dependencies, logs, privilege, disclosure
    topics: [sec-supply-chain, sec-logging, sec-least-privilege, sec-disclosure]
bridges:
  - id: rate-limiting
    why: "Login endpoints, password resets and one-time codes all need limits on attempts. Here is how rate limiters work and where they fail."
  - id: api-gateway
    why: "Many teams check tokens and enforce coarse access rules at a gateway in front of their services. See what belongs there and what still has to happen in each service."
  - id: service-mesh
    why: "Mutual TLS between services is a core step towards zero trust. A mesh moves it into sidecar proxies so every service gets it without code changes."
next: [cicd, apis-edge]
---
Everything here is defensive. The JavaScript examples run in the page and are toys that show an idea (a decoded JWT, a salted hash, a constant-time comparison, log redaction); the toy hash is deliberately weak and must never be used for real passwords.
