---
id: cicd-secrets-oidc
title: "Secrets in CI, and OIDC instead of cloud keys"
summary: Short-lived tokens the cloud trusts, not keys you have to guard
why: "A long-lived cloud key stored in CI is one leaked log line, one malicious action or one ex-employee away from your production account. OIDC removes the key altogether."
requires: [cicd-github-actions]
lesson: none
points:
  - title: Secrets are masked, not safe
    text: "CI redacts known secret values from logs, but any step that can read a secret can also send it somewhere. Limit which jobs get which secrets."
  - title: OIDC swaps identity for a token
    text: "The job asks GitHub for a signed ID token describing itself (repository, branch, environment). The cloud checks it and returns credentials that expire within hours."
  - title: The trust policy is the lock
    text: "On the cloud side, a role trusts only tokens whose claims match, for example repo:my-org/my-app:environment:production."
  - title: Environments add gates
    text: "Jobs that use a deployment environment can require approval and get only that environment's secrets."
quiz:
  - q: "What does the `id-token: write` permission allow a job to do?"
    options: ["Write to the repository", "Request an OIDC ID token from GitHub, which it can exchange with a cloud provider for short-lived credentials", "Create new repository secrets"]
    answer: 1
    explain: "Without it the job can't ask GitHub's OIDC provider for a token. It grants nothing in the cloud by itself; the cloud's trust policy decides what the token is worth."
  - q: "An AWS role trusts any token with `sub` matching `repo:my-org/*`. What is the problem?"
    options: ["Nothing; it is your organisation", "Any workflow in any repository of the organisation, on any branch, can assume the production role", "AWS rejects wildcards"]
    answer: 1
    explain: "Scope the trust to one repository and, for production, to the environment or branch that is allowed to deploy, such as repo:my-org/my-app:environment:production."
  - q: A secret value appears in a build log on a public repository. What should you do first?
    options: ["Delete the log", "Revoke or rotate the secret at its source, then clean up and investigate", "Make the repository private"]
    answer: 1
    explain: "Assume it was copied the moment it was visible. Revoking it is the only step that actually removes the risk; deleting the log comes after."
links:
  - { title: "OpenID Connect (GitHub Actions)", url: "https://docs.github.com/en/actions/concepts/security/openid-connect" }
  - { title: "Configuring OpenID Connect in AWS (GitHub Actions)", url: "https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws" }
  - { title: "Secure use reference (GitHub Actions)", url: "https://docs.github.com/en/actions/reference/security/secure-use" }
---
A deploy job needs to talk to your cloud account. The old way was to create a cloud access key, paste it into the CI system as a secret and hope nobody leaks it. With **OpenID Connect (OIDC)**, the job proves who it is with a short-lived signed token, and the cloud hands back short-lived credentials (one hour by default on AWS). There is no long-lived key to steal or rotate.

## How secrets behave in CI

Repository, organisation and environment secrets are encrypted at rest and injected into jobs that ask for them. Known values are masked in logs. That is useful, but it is not a security boundary: any step in the job, including a third-party action, can read the value and send it anywhere. So give secrets only to the jobs that need them, and never to workflows that run untrusted code, such as builds of pull requests from forks.

## How OIDC works

1. The job has `permissions: id-token: write`.
2. It asks GitHub's OIDC provider for a token. The token is a signed JWT whose claims describe the run, for example `sub: repo:my-org/my-app:environment:production`, plus `repository`, `ref`, `environment` and `aud`.
3. The job sends that token to the cloud (AWS STS, Azure, Google Cloud workload identity federation, HashiCorp Vault and others).
4. The cloud verifies the signature against GitHub's published keys and checks the claims against the role's **trust policy**.
5. If they match, it returns temporary credentials for that role.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production        # approval rules and environment secrets apply
    permissions:
      contents: read
      id-token: write              # allow this job to request an OIDC token
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: arn:aws:iam::123456789012:role/my-app-deploy-production
          aws-region: eu-west-1
      - run: ./scripts/deploy.sh   # uses the temporary credentials
```

## Writing the trust policy

The trust policy is where the security lives. Match the audience (`sts.amazonaws.com` on AWS) and match `sub` as narrowly as you can: one repository, and for production one environment or branch. A wildcard over the whole organisation lets any repository, including a forgotten experiment, assume your production role. Give the role itself only the permissions the deploy needs.

## Environments

A job that names an `environment` picks up that environment's secrets and protection rules: required reviewers, a wait timer, or a rule that only `main` may deploy. Because the environment name appears in the OIDC `sub` claim, the cloud role can require it, so a job that skipped the approval can't get production credentials.

## When a secret leaks anyway

Revoke or rotate it at the source first, then remove it from logs and history, then check the provider's audit logs for use. More on that in the security path.
