---
id: sec-tls
title: "TLS, certificates and HSTS"
summary: What the padlock guarantees, and what it doesn't
why: "TLS is what stops anyone on the network path from reading or changing your traffic. It only works if certificates are checked, renewed on time, and HTTPS can't be quietly downgraded."
requires: [sec-threat-modelling]
lesson: none
points:
  - title: Three guarantees
    text: "Confidentiality (eavesdroppers see ciphertext), integrity (changes are detected) and server authentication (you are talking to the holder of the name's certificate)."
  - title: Certificates bind names to keys
    text: "A certificate authority vouches that a public key belongs to a domain. Clients check the chain, the name and the dates."
  - title: Automate renewal
    text: "Maximum certificate lifetimes are shrinking in steps from 398 days to 47 days by 2029. Use ACME (for example Let's Encrypt) and monitor expiry."
  - title: HSTS prevents downgrade
    text: "Strict-Transport-Security tells browsers to use only HTTPS for your domain, so an attacker can't strip a user's first plain-HTTP request."
quiz:
  - q: A site has a valid TLS certificate. What does that prove?
    options: ["The site is trustworthy and safe", "The connection is encrypted to a server that controls that domain name; it says nothing about whether the site is honest", "The site has no vulnerabilities"]
    answer: 1
    explain: "Phishing sites get valid certificates for their own look-alike domains too. TLS protects the channel and authenticates the name, nothing more."
  - q: "A service calls an internal API with certificate verification turned off (`verify=False`, `rejectUnauthorized: false`). What is lost?"
    options: ["Nothing; the traffic is still encrypted", "Server authentication: anyone who can intercept the connection can present their own certificate and read or alter everything", "Only performance"]
    answer: 1
    explain: "Encryption to an unauthenticated party is encryption to whoever got in the middle. Fix the trust store or use a private CA instead."
  - q: "What does `Strict-Transport-Security: max-age=31536000; includeSubDomains` do?"
    options: ["Encrypts cookies", "Tells the browser to use only HTTPS for this host and its subdomains for a year, refusing to click through certificate errors", "Redirects HTTP to HTTPS on the server"]
    answer: 1
    explain: "After the first HTTPS visit, the browser upgrades every request itself. Preloading the domain into browsers covers even the very first visit."
links:
  - { title: "RFC 8446: TLS 1.3", url: "https://datatracker.ietf.org/doc/html/rfc8446" }
  - { title: "RFC 6797: HTTP Strict Transport Security (HSTS)", url: "https://datatracker.ietf.org/doc/html/rfc6797" }
  - { title: "Transport Layer Security Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html" }
  - { title: "Ballot SC-081v3: reducing certificate validity (CA/Browser Forum)", url: "https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/" }
---
Transport Layer Security (TLS) protects data while it travels between two programs. When it is set up properly, someone who controls the network in between (a café Wi-Fi, a compromised router, a cloud neighbour) can't read the traffic, can't change it without being detected, and can't impersonate the server. It does nothing for data once it arrives, and it doesn't tell you whether the server is honest.

## The handshake, briefly

In TLS 1.3 (RFC 8446), client and server agree on keys with an ephemeral Diffie-Hellman exchange, so recorded traffic can't be decrypted later even if the server's long-term key leaks (forward secrecy). The server proves its identity by signing the handshake with the private key matching its **certificate**. The client then checks:

1. the certificate chains to a root CA it trusts;
2. the name it asked for is in the certificate;
3. the certificate is within its validity dates (and not revoked, where checked).

If any check fails, a correctly written client refuses to continue. TLS 1.0 and 1.1 are deprecated (RFC 8996); support TLS 1.2 and 1.3.

## What the padlock does and doesn't mean

TLS says "you have a private channel to whoever controls `example.com`". It doesn't say `example.com` is the site the user meant, that its code is safe, or that the data is protected at rest on the server. A phishing site at a look-alike domain can have a perfectly valid certificate.

## Certificates in practice

- **Automate issuance and renewal** with ACME (Let's Encrypt, other ACME CAs, or your cloud's certificate manager). The CA/Browser Forum has voted to reduce the maximum lifetime of public TLS certificates in steps from 398 days, starting in March 2026, to 47 days by March 2029. Manual renewal won't keep up.
- **Monitor expiry** and certificate transparency logs for your domains, so you notice both expiring certificates and ones issued without your knowledge.
- **Protect private keys**: readable only by the server process, ideally kept in a key management service or HSM for high-value domains.
- **Inside your network**, use TLS too (often mutual TLS between services, where both sides present certificates), with a private CA and automated rotation. A service mesh can handle this for you.
- **Never disable verification** to "fix" an error in production code. Add the right CA to the trust store instead.

## HSTS

A user typing `example.com` makes a plain HTTP request first, which an attacker on the path can intercept and keep on HTTP. HTTP Strict Transport Security (RFC 6797) fixes this after the first secure visit:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

The browser remembers, for `max-age` seconds, to use only HTTPS for the host (and subdomains), and won't let users click through certificate errors. Adding `preload` and submitting the domain to the browsers' preload list protects even the first visit. Roll it out with a short `max-age` first: once set, any subdomain still on HTTP becomes unreachable.

Also set cookies with `Secure` so they are never sent over plain HTTP.
