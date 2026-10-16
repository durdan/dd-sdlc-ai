---
id: sec-owasp-top10
title: "The OWASP Top 10 (2025)"
summary: The ten most important web application risk categories, and what each means
why: "The Top 10 is the shared vocabulary of application security. Reviewers, auditors and scanners all speak it, and it is a good map of where real breaches come from."
requires: [sec-threat-modelling, web-security]
lesson: none
points:
  - title: An awareness document
    text: "It ranks broad risk categories from contributed data and a community survey. It is a starting point, not a complete checklist or a standard."
  - title: Access control is still first
    text: "Broken access control tops the 2025 list, and now also covers server-side request forgery."
  - title: New in 2025
    text: "Software supply chain failures (an expansion of vulnerable components) and mishandling of exceptional conditions join the list."
  - title: Map it to your design
    text: "Use the categories as prompts during threat modelling and code review, and as a structure for training."
quiz:
  - q: Which category is A01 in the OWASP Top 10:2025?
    options: ["Injection", "Broken Access Control", "Cryptographic Failures"]
    answer: 1
    explain: "Broken access control stayed at number one. Injection is now A05 and cryptographic failures A04."
  - q: "In the 2025 edition, where did server-side request forgery (SSRF) go?"
    options: ["It is still its own category", "It was folded into A01 Broken Access Control", "It was dropped entirely"]
    answer: 1
    explain: "2021 had SSRF as A10. In 2025 its CWE is mapped into Broken Access Control, and A10 is now Mishandling of Exceptional Conditions."
  - q: An error handler catches an exception during a permission check and lets the request continue. Which 2025 category does that 'fail open' bug fall under?
    options: ["A09 Security Logging and Alerting Failures", "A10 Mishandling of Exceptional Conditions", "A02 Security Misconfiguration"]
    answer: 1
    explain: "A10 is about errors and unusual conditions handled in ways that leave the system insecure: failing open, leaking details in errors, or inconsistent state after a failure."
links:
  - { title: "OWASP Top 10:2025", url: "https://top10.owasp.org/2025/" }
  - { title: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" }
  - { title: "OWASP Application Security Verification Standard", url: "https://owasp.org/www-project-application-security-verification-standard/" }
---
The OWASP Top 10 is a regularly updated list of the most critical categories of web application security risk, built from vulnerability data contributed by many organisations plus a community survey. The current edition is **2025**. It is an awareness document: a map of where things go wrong most often, not a full specification. For a testable checklist, OWASP's Application Security Verification Standard (ASVS) goes much further.

## The 2025 list

1. **A01 Broken Access Control.** Users acting outside their permissions: reading other users' records by changing an ID, calling admin APIs, missing checks on some HTTP methods. Server-side request forgery and CSRF now map here too.
2. **A02 Security Misconfiguration.** Default accounts, verbose errors, open cloud storage, unnecessary features switched on, missing security headers. Up from fifth in 2021.
3. **A03 Software Supply Chain Failures.** Vulnerable or malicious dependencies, compromised build systems and distribution channels. It broadens 2021's "vulnerable and outdated components".
4. **A04 Cryptographic Failures.** Sensitive data sent or stored without proper protection, weak or home-made crypto, poor key management, predictable randomness.
5. **A05 Injection.** Untrusted input interpreted as code or commands: SQL, OS commands, LDAP, template engines, and cross-site scripting.
6. **A06 Insecure Design.** Flaws that no amount of correct code fixes: missing rate limits on a password-reset flow, business logic that can be abused, no threat model.
7. **A07 Authentication Failures.** Credential stuffing, weak password rules, missing MFA, session IDs that don't rotate or expire.
8. **A08 Software or Data Integrity Failures.** Trusting code, updates or serialized data without checking integrity: unsigned updates, insecure deserialisation, CI pipelines that run unverified code.
9. **A09 Security Logging and Alerting Failures.** Attacks that aren't logged, logs nobody watches, alerts that never fire. The name now stresses alerting, not just monitoring.
10. **A10 Mishandling of Exceptional Conditions.** New in 2025. Errors and edge cases handled unsafely: failing open, leaking stack traces, leaving state half-changed after an exception.

## How to use it

- **In design reviews**: walk the categories as prompts alongside STRIDE. A06 is a reminder that some problems need design changes, not patches.
- **In code review**: most teams can catch A01, A05 and A10 patterns in a pull request if reviewers look for them: an object fetched by ID without an ownership check, string-built queries, a `catch` that swallows errors around a security decision.
- **In the pipeline**: dependency scanning and SBOMs for A03, configuration scanning for A02, secret scanning for A04.
- **In training**: the Top 10 is a sensible curriculum, which is why the next topics take its two most common categories, injection and access control, in more detail.

What it is not: a compliance standard, a complete list, or a ranking of every bug your app might have. A clean scan against "the Top 10" says little about A06 or A01, which need people who understand the application.
