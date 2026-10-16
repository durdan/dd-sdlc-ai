---
id: aws-iam
title: "IAM: principals, policies and roles"
summary: Who may do what to which resource
why: "Every AWS API call is checked by IAM. Getting it right is most of AWS security; getting it wrong is how keys leak and buckets go public."
requires: [aws-shared-responsibility]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: A principal makes the call
    text: "A principal is whoever signs the request: a user, a role session or an AWS service acting for you."
  - title: Policies are JSON statements
    text: "Each statement has an Effect (Allow or Deny), Actions, Resources and optional Conditions. Without an Allow, the answer is no."
  - title: Roles hand out temporary credentials
    text: "A role has no password or long-lived key. Someone trusted assumes it and gets credentials that expire, which is what workloads should use."
  - title: Least privilege is a process
    text: "Start narrow, grant what the logs show is needed, and remove what is unused. Wildcards are where breaches widen."
quiz_hint: Separate who is calling (the principal) from what they are allowed (the policies) and who may become them (the trust policy).
quiz:
  - q: An application on EC2 needs to read one S3 bucket. What is the right way to give it credentials?
    options: ["Create an IAM user and put its access key in an environment variable", "Attach an IAM role with a policy for that bucket to the instance through an instance profile", "Make the bucket public and restrict it by IP address"]
    answer: 1
    explain: "The instance gets temporary credentials for the role from the instance metadata service, and the SDK rotates them. Nothing long-lived is stored on the machine."
  - q: Which part of a role decides who is allowed to assume it?
    options: ["Its permissions policy", "Its trust policy", "The permissions boundary"]
    answer: 1
    explain: "The trust policy is a resource-based policy on the role naming the principals that may call sts:AssumeRole. The permissions policies decide what the role can do once assumed."
  - q: What does this statement allow?
    code: |
      { "Effect": "Allow", "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::invoices/*",
        "Condition": { "Bool": { "aws:SecureTransport": "true" } } }
    options: ["Reading and listing every object in the invoices bucket", "Reading objects in the invoices bucket, only over TLS", "Writing objects to the invoices bucket over TLS"]
    answer: 1
    explain: "GetObject reads objects; it does not list the bucket (that is s3:ListBucket on the bucket ARN). The condition rejects requests that did not use HTTPS."
links:
  - { title: "Policies and permissions in IAM (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html" }
  - { title: "IAM roles (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html" }
  - { title: "Security best practices in IAM (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" }
---
Identity and Access Management (IAM) answers one question for every AWS API request: is this **principal** allowed to perform this **action** on this **resource**, under these **conditions**? The principal is whoever signed the request. The answer comes from **policies**, JSON documents attached to principals (identity-based policies) or to resources such as buckets, queues and keys (resource-based policies). Nothing is allowed unless a policy allows it.

## Principals

- **IAM users** have long-lived credentials (a password, access keys). AWS recommends using them as little as possible: people should sign in through IAM Identity Center or another identity provider, and workloads should use roles.
- **Roles** have permissions but no credentials of their own. A trusted principal calls `sts:AssumeRole` and receives temporary credentials that expire, typically after an hour. EC2 instances, ECS tasks and Lambda functions all get role credentials automatically.
- **AWS services** act as principals when, for example, SNS delivers to your SQS queue or EventBridge invokes your function.
- The **root user** of each account can do anything and is not limited by IAM policies in that account. Protect it with MFA and do not use it day to day.

## A policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOrders",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:eu-west-1:111122223333:table/orders"
    }
  ]
}
```

Actions are `service:Operation`. Resources are ARNs, which include the partition, service, Region, account and resource path. Conditions add context checks: source VPC, tags, whether MFA was used, whether the request used TLS. `"Version": "2012-10-17"` is the current policy language version, not a date you should change.

## Roles have two policies

A role carries a **trust policy** (who may assume it) and **permissions policies** (what it may do once assumed). An ECS task role trusts `ecs-tasks.amazonaws.com`; a CI role might trust your CI provider through OpenID Connect, so no AWS keys are stored in the CI system at all. Cross-account access is the same mechanism: account B's role trusts account A, and A's principals assume it.

## Least privilege in practice

- Scope actions and resources. `s3:*` on `*` is almost never what an application needs.
- Use one role per workload, so a compromised service only has its own permissions.
- Use the tools: IAM Access Analyzer can generate a policy from CloudTrail activity and report unused permissions and resources shared outside your account.
- Put guard rails above accounts with AWS Organizations: service control policies (SCPs) cap what any principal in an account can do, even an administrator.

How several policies combine for one request, and why a single Deny beats any number of Allows, is the next topic.

```trace diagram
id: role-call
title: A workload calls S3 with a role
subtitle: "Trust policy, temporary credentials, a signed request, a policy check"
kind: sequence
elements:
  - { id: app, label: App }
  - { id: sts, label: STS }
  - { id: s3, label: S3 }
  - { id: iam, label: IAM check }
edges:
  - { id: assume, from: app, to: sts, label: "AssumeRole(orders-reader)" }
  - { id: trust, from: sts, to: sts, label: "trust policy: may this caller assume it?", flow: security }
  - { id: creds, from: sts, to: app, label: "key ID, secret, session token (1 h)", style: dashed }
  - { id: sign, from: app, to: app, label: "sign the request with the secret" }
  - { id: get, from: app, to: s3, label: "GetObject + signature + token" }
  - { id: check, from: s3, to: iam, label: "who signed it, and is it allowed?", flow: security }
  - { id: eval, from: iam, to: iam, label: "role policies + bucket policy", flow: security }
  - { id: allow, from: iam, to: s3, label: Allow, style: dashed, flow: security }
  - { id: object, from: s3, to: app, label: "200 + the object", style: dashed }
  - { id: refresh, from: app, to: sts, label: "new credentials before expiry" }
steps:
  - caption: "Every AWS API call is checked by IAM: may this principal do this action on this resource? Here an application reads a file from S3 using a role, not a stored key."
    focus: [app, sts, s3, iam]
  - caption: "The application asks AWS STS to assume the orders-reader role. A role has permissions but no password or long-lived key of its own."
    trace: [assume]
  - caption: "STS checks the role's trust policy, which names who may assume it. An ECS task role trusts ecs-tasks.amazonaws.com; a CI role might trust your CI provider through OpenID Connect."
    trace: [trust]
  - caption: "STS returns temporary credentials: an access key ID, a secret access key and a session token. By default they last an hour."
    trace: [creds]
  - caption: "The SDK signs the request with the secret key. The secret itself never travels; S3 receives the signature, the key ID and the token."
    trace: [sign, get]
  - caption: "S3 hands the request to IAM's check. The principal is the role session, and the action is s3:GetObject on one object's ARN."
    trace: [check]
  - caption: "IAM evaluates the role's permissions policies together with the bucket's policy. Nothing is allowed unless a policy allows it."
    trace: [eval]
  - caption: "The role's policy allows s3:GetObject on that bucket, so the answer is Allow and S3 returns the object."
    trace: [allow, object]
  - caption: "Before the credentials expire, the SDK fetches new ones. On EC2, ECS and Lambda this happens for you, so nothing long-lived is ever stored on the machine."
    trace: [refresh]
note: "The permissions policy decides what the role can do; the trust policy decides who may become it. How several policies combine is the next topic."
```
