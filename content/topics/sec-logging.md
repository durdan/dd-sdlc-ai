---
id: sec-logging
title: "Security logging and detection, without leaking PII"
summary: Record who did what, alert on it, and keep secrets and personal data out
why: "Breaches often go unnoticed for months because nothing was logged, or the logs were never looked at. Meanwhile, logs full of tokens and personal data become a breach of their own."
requires: [sec-authn-authz]
lesson: none
points:
  - title: Log security events
    text: "Logins and failures, MFA changes, permission changes, access denials, admin actions, data exports. Who, what, when, from where, and the outcome."
  - title: Alert, don't just store
    text: "Logs nobody reads detect nothing. Define alerts for patterns that matter and route them to someone who will act."
  - title: Keep secrets and PII out
    text: "Never log passwords, tokens, session IDs, keys or full card numbers; minimise and mask personal data. Logs are copied widely and kept a long time."
  - title: Protect the logs
    text: "Send them off the host, restrict who can read them, and make them hard to alter, so an intruder can't erase their tracks."
quiz:
  - q: Which of these belongs in a security log entry for a failed login?
    options: ["The password the user typed", "Timestamp, the account identifier, source IP, user agent and the outcome", "The full request body"]
    answer: 1
    explain: "A typed password is often a real password with a typo, or the password for another site. Log enough to investigate, never the secret itself."
  - q: "A user name contains a newline followed by text formatted like a log line. What should the logger do?"
    options: ["Write it as is", "Encode or escape control characters (or use structured JSON logging) so input can't forge log entries", "Drop the request"]
    answer: 1
    explain: "Log injection (CWE-117) can fake entries and mislead investigators. Structured logging with proper encoding keeps each field a field."
  - q: "Which 2025 OWASP Top 10 category covers missing or useless security logs?"
    options: ["A02 Security Misconfiguration", "A09 Security Logging and Alerting Failures", "A10 Mishandling of Exceptional Conditions"]
    answer: 1
    explain: "A09 was renamed in 2025 to stress alerting: logs only help if they lead to action."
links:
  - { title: "Logging Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html" }
  - { title: "A09:2025 Security Logging and Alerting Failures (OWASP Top 10)", url: "https://top10.owasp.org/2025/A09_2025-Security_Logging_and_Alerting_Failures/" }
  - { title: "Logging Vocabulary Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html" }
---
Security logging has two jobs that pull in opposite directions. It must record enough about security-relevant events to detect attacks and reconstruct what happened. And it must not become a store of passwords, tokens and personal data that is copied to every log tool, kept for years, and readable by far more people than the production database.

## What to log

Focus on events that change or test trust:

- authentication: logins, failures, lockouts, password resets, MFA enrolment and removal, new passkeys;
- authorisation: access denied (403/404 on objects), privilege and role changes;
- administration: config changes, user impersonation, feature flags on security controls;
- data: bulk exports, downloads of sensitive records, deletions;
- input that failed validation in suspicious ways, and errors from security controls.

For each: a timestamp in UTC, the actor (user or service ID, not their name), the action, the target, the result, source IP and user agent, and a request or trace ID to link it to other logs. Use structured logs (JSON) with consistent field names; the OWASP Logging Vocabulary offers a standard set of event names.

## What never to log

Passwords (even wrong ones), session IDs, access and refresh tokens, API keys, private keys, full card numbers, and full personal records. Minimise personal data: log an internal user ID rather than an email address, and mask what you must keep. Redact at the logger, before anything leaves the process:

```js run
const SECRET_KEYS = new Set(["password", "token", "access_token", "refresh_token", "authorization", "cookie", "apikey", "secret"])
const maskEmail = (e) => e.replace(/^(.).*(@.*)$/, "$1***$2")
function redact(value, key = "") {
  if (SECRET_KEYS.has(key.toLowerCase())) return "[REDACTED]"
  if (typeof value === "string") {
    if (key === "email") return maskEmail(value)
    return value.replace(/[\r\n]/g, "\\n") // no forged log lines
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v, k)]))
  }
  return value
}
const event = {
  event: "authn_login_fail",
  user: { id: "u-381", email: "ana.lopez@example.com" },
  request: { ip: "203.0.113.7", headers: { Authorization: "Bearer eyJhbGciOi...", "User-Agent": "Mozilla/5.0" } },
  body: { username: "ana\nINFO admin login ok", password: "hunter2-typo" },
}
console.log(JSON.stringify(redact(event), null, 2))
```

Deny-lists like this are a safety net. The stronger habit is to log chosen fields explicitly rather than dumping whole request objects.

## From logs to detection

Ship logs off the host to a central system quickly, so an attacker on the machine can't delete them. Then decide what should wake someone up:

- many failed logins across many accounts from one source (credential stuffing), or many sources against one account;
- a successful login right after many failures, or from an unusual country plus an MFA change;
- bursts of 403 or 404 responses across sequential object IDs;
- a new admin, a disabled audit setting, or a large export outside normal hours.

Test that alerts fire, keep the number low enough that each is investigated, and write a short runbook for each.

## Protecting the logs

Restrict read access, especially to anything containing personal data. Use append-only or write-once storage for audit trails. Set retention to what investigations and law require, and no longer.
