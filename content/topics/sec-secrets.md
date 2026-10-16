---
id: sec-secrets
title: "Secrets management, and what to do when one leaks"
summary: Never in git, short-lived where possible, rotated, and revoked fast
why: "Leaked credentials are one of the most common ways attackers get in, and keys pushed to public repositories are found by scanners within minutes."
requires: [sec-encryption]
lesson: none
points:
  - title: Not in code, not in git
    text: "Secrets come from a secret store or the platform at runtime. Committed secrets live on in history, forks and clones even after you delete them."
  - title: Prefer no secret at all
    text: "Workload identity (cloud IAM roles, OIDC federation) gives short-lived credentials without a stored key."
  - title: Rotate on a schedule and on demand
    text: "If rotating a secret is scary, it will not happen in an emergency. Make it routine and automated."
  - title: Leak response starts with revoke
    text: "Revoke or rotate first, then check logs for use, then clean up history. Deleting the commit alone fixes nothing."
quiz:
  - q: "You pushed an API key to a public repository, noticed a minute later and force-pushed it away. Is it safe now?"
    options: ["Yes, it's gone from history", "No: assume it was copied; automated scanners watch public pushes. Revoke and rotate it now", "Only if nobody starred the repo"]
    answer: 1
    explain: "Public pushes are scanned within minutes, and the old commit may still be reachable via forks, caches or its SHA. Rotation is the only real fix."
  - q: Why compare webhook signatures with a constant-time function?
    options: ["It is faster", "A comparison that stops at the first wrong byte takes measurably different time, which can help an attacker guess the value byte by byte", "It produces a shorter output"]
    answer: 1
    explain: "Use crypto.timingSafeEqual, hmac.compare_digest or your platform's equivalent for secrets, MACs and tokens."
  - q: Which is the best way for a service on a cloud VM or Kubernetes pod to get database credentials?
    options: ["An environment variable set in the image", "Workload identity: the platform gives the workload a short-lived identity, which it uses to fetch credentials or get a database token", "A shared credentials file on a network drive"]
    answer: 1
    explain: "No long-lived secret is stored anywhere. Vaults can go further and issue a unique, expiring database user per instance."
links:
  - { title: "Secrets Management Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" }
  - { title: "About push protection (GitHub)", url: "https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection" }
  - { title: "Removing sensitive data from a repository (GitHub)", url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository" }
---
A secret is anything that grants access: API keys, database passwords, signing keys, OAuth client secrets, webhook signing secrets, private keys. Managing them well means keeping them out of code, giving each workload only the ones it needs, preferring short-lived credentials over stored ones, being able to rotate any of them quickly, and knowing exactly what to do when one escapes.

## Where secrets should live

- **Not in source code or git.** Not in `.env` files that get committed, not in Dockerfiles, not in client-side JavaScript or mobile apps (anything shipped to users is public).
- **In a secret store**: a cloud secret manager, HashiCorp Vault, or your platform's secrets (Kubernetes Secrets with encryption at rest and tight RBAC, or synced from an external store). The app reads them at start-up or on demand.
- **Better still, nowhere**: with **workload identity** the platform vouches for the running service (a cloud IAM role, a Kubernetes service account federated to the cloud, GitHub Actions OIDC), and the service exchanges that for short-lived credentials. Vaults can also mint **dynamic secrets**: a unique database user per instance that expires on its own.

Give each service its own secrets, per environment. A staging key that also works in production turns a minor leak into a major one.

## Rotation

Every secret should have an owner, a way to rotate it without downtime (support two valid versions during the switch), and ideally automation that does it on a schedule. Teams that never rotate discover in the middle of an incident that nobody knows which systems use the key.

## Handling secrets in code

Compare secrets, MACs and tokens in **constant time**. A naive comparison stops at the first differing character, so the time it takes leaks how much of a guess was right. This toy counts the steps instead of timing them:

```js run
function naiveEqual(a, b) {
  let steps = 0
  if (a.length !== b.length) return { equal: false, steps }
  for (let i = 0; i < a.length; i++) { steps++; if (a[i] !== b[i]) return { equal: false, steps } }
  return { equal: true, steps }
}
function constantTimeEqual(a, b) {
  let steps = 0
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length; i++) { steps++; diff |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0) }
  return { equal: diff === 0, steps }
}
const secret = "9f86d081884c7d65"
for (const guess of ["0000000000000000", "9f00000000000000", "9f86d00000000000"]) {
  console.log(guess, "naive steps:", naiveEqual(secret, guess).steps, " constant-time steps:", constantTimeEqual(secret, guess).steps)
}
```

The naive version takes longer the more leading characters are right, which is a signal; the constant-time version always does the same work. This is only an illustration: JavaScript engines don't promise constant timing, so in real code use the platform function (`crypto.timingSafeEqual` in Node, `hmac.compare_digest` in Python, `MessageDigest.isEqual` in Java) rather than writing your own.

Also keep secrets out of logs, error messages, URLs (they end up in access logs and browser history) and crash reports.

## Catching leaks early

Turn on secret scanning with **push protection** (GitHub, GitLab and others), which blocks a push containing a recognised secret, and run a scanner such as gitleaks or trufflehog in pre-commit hooks and CI.

## When a secret leaks

1. **Revoke or rotate it at the source**, immediately. This is the only step that removes the risk.
2. **Check for use**: the provider's audit logs, unusual API calls, new resources, data access, since the earliest possible exposure.
3. **Find every place it was used** and deploy the new value.
4. **Clean up**: remove it from code, and rewrite history if needed (`git filter-repo`), though by now that is housekeeping, not protection.
5. **Learn**: why was a long-lived secret there at all? Could it have been workload identity?
