---
id: sec-least-privilege
title: "Least privilege and zero trust"
summary: Grant only what's needed, and never trust a request just because of where it comes from
why: "Every system eventually has a compromised account or a buggy service. Least privilege and zero trust decide whether that becomes a contained incident or full access to everything."
requires: [sec-access-control]
lesson: none
points:
  - title: Least privilege
    text: "Every user, service and job gets the minimum permissions it needs, for as long as it needs them, and no more."
  - title: No trusted network
    text: "Zero trust drops the idea that being inside the network makes a request safe. Every request is authenticated and authorised on its own."
  - title: Identity, device and context
    text: "Access decisions use who is asking, from what device and in what context, and are made per resource, close to it."
  - title: Assume breach
    text: "Design so one stolen credential or one compromised service has a small blast radius, and is visible quickly."
quiz:
  - q: A CI job that deploys one service has an admin role on the whole cloud account. What principle does that break?
    options: ["Defence in depth", "Least privilege: it should be able to deploy that one service and nothing else", "Separation of duties"]
    answer: 1
    explain: "If that job or anything it runs is compromised, the attacker gets the whole account. Scope the role to the resources and actions the deploy needs."
  - q: What is the core idea of zero trust architecture (NIST SP 800-207)?
    options: ["Trust nobody on the internet; trust everyone on the VPN", "No implicit trust from network location: each access request is authenticated, authorised and evaluated per resource", "Encrypt everything twice"]
    answer: 1
    explain: "The VPN-as-castle model trusts anything inside. Zero trust moves the checks to every request, based on identity, device and context."
  - q: "An engineer needs production database access to fix an incident. What is the least-privilege way?"
    options: ["Give their account permanent admin", "Just-in-time access: an approved, time-limited grant scoped to what is needed, with the session logged", "Share the admin password in chat"]
    answer: 1
    explain: "Standing access is a permanent target. Short-lived, approved and audited access gives what is needed when needed."
links:
  - { title: "NIST SP 800-207: Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" }
  - { title: "BeyondCorp (Google)", url: "https://cloud.google.com/beyondcorp" }
  - { title: "Authorization Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" }
---
**Least privilege** says every identity, human or machine, should have only the access it needs for its job, for only as long as it needs it. **Zero trust** applies the same thinking to networks: being "inside" grants nothing. Every request is authenticated, authorised and checked against policy for the specific resource, whether it comes from the internet, the office or the next pod over. Together they limit what an attacker gets from any single compromise.

## Least privilege in practice

- **Humans**: role-based access matched to real job needs; no shared accounts; admin rights through separate, MFA-protected accounts or elevation; **just-in-time** access for production, approved and time-limited, with the session logged.
- **Services**: one identity per service (not a shared "app" user), scoped to the tables, queues and buckets it uses. Read-only where it only reads.
- **CI and automation**: job tokens with minimal scopes, cloud roles limited to the resources a pipeline deploys, and OIDC instead of stored keys.
- **Containers and processes**: run as non-root, drop capabilities, read-only filesystems where possible.

Permissions grow over time as people add "just one more" grant. Review them: most cloud providers can report which granted permissions were actually used in the last 90 days, which makes trimming practical.

## Zero trust

The traditional model was a castle: a strong perimeter (firewall, VPN) and broad trust inside it. Once an attacker got in through phishing, a VPN flaw or a compromised laptop, they could move freely. NIST SP 800-207 and Google's BeyondCorp describe the alternative:

- **No implicit trust from location.** An internal IP address is not a credential.
- **Strong identity for users and services**: SSO with phishing-resistant MFA for people, workload identities and mutual TLS for services.
- **Device posture** as an input: is the laptop managed, patched and encrypted?
- **Per-request, per-resource decisions** made by a policy engine and enforced close to the resource, at an identity-aware proxy, an API gateway or a sidecar.
- **Continuous evaluation**: sessions are re-checked, and access can be withdrawn when risk changes.

Zero trust is a direction, not a product. Most organisations move there step by step: SSO and MFA everywhere, then an identity-aware proxy in front of internal tools in place of the VPN, then service-to-service authentication with mTLS and network policies that deny by default.

## Assume breach

Both ideas follow from one assumption: something will be compromised. Design for it:

- **Segment**: separate environments, accounts and networks, so a foothold in one doesn't reach the others.
- **Limit blast radius**: per-tenant keys and data partitions, scoped tokens, short credential lifetimes.
- **Make misuse visible**: log access decisions and alert on unusual use of privileges.
- **Separate duties** for the most dangerous actions: the person who requests a production change isn't the only one who approves it.

The question to ask of any design is: if this one credential leaked today, what could someone do with it, and how fast would we know?
