---
id: aws-iam-evaluation
title: How IAM evaluates a request
summary: Deny wins, then every gate must allow
why: "When access is unexpectedly denied, or worse, unexpectedly allowed, the answer is always in the evaluation order. Knowing it turns hours of guessing into a few minutes."
requires: [aws-iam]
lesson: none
points:
  - title: Default deny
    text: "A request starts as denied. Only an explicit Allow in an applicable policy can change that."
  - title: Explicit deny always wins
    text: "A Deny that matches, in any policy type, overrides every Allow. There is no way to allow around it."
  - title: Guard rails intersect
    text: "SCPs, resource control policies, permissions boundaries and session policies only limit. The action must be allowed by each one that applies."
  - title: Grants combine
    text: "Within one account, an Allow in either the identity-based policy or the resource-based policy is enough."
quiz_hint: "Walk the order: any matching Deny? Does every guard rail allow it? Then does an identity or resource policy allow it?"
quiz:
  - q: "A role's policy allows s3:* on a bucket. The account's SCP allows only s3:Get*. Can the role delete objects?"
    options: ["Yes, the identity policy allows it", "No; the SCP does not allow s3:DeleteObject, and SCPs cap every principal in the account", "Only if the bucket policy also allows it"]
    answer: 1
    explain: "SCPs grant nothing by themselves, but whatever they do not allow is denied for every principal in the account, administrators included."
  - q: A user's identity policy allows s3:GetObject on a bucket. The bucket policy explicitly denies everyone without a specific tag. The user lacks the tag. Result?
    options: ["Allowed, because identity policies take priority", "Denied: an explicit deny in any policy overrides the allow", "Allowed only from the console"]
    answer: 1
    explain: "Explicit deny is checked first and ends the evaluation. Which policy type the deny is in makes no difference."
  - q: Within the same account, a bucket policy allows a role to read the bucket, and the role's own policies say nothing about S3. Is the read allowed?
    options: ["Yes; within one account an allow in the resource-based policy is enough when nothing denies it", "No; identity policies must always allow it too", "Only if the role has a permissions boundary"]
    answer: 0
    explain: "In a single account, identity-based and resource-based allows are a union. Across accounts it is stricter: both sides must allow the request."
links:
  - { title: "Policy evaluation logic (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html" }
  - { title: "Explicit and implicit denies (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html" }
  - { title: "Policies and permissions in IAM (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html" }
---
For each request, IAM collects every policy that applies (the principal's identity-based policies, the resource's policy, any SCPs and resource control policies from AWS Organizations, a permissions boundary on the principal, and a session policy if one was passed) and runs the same decision. The request begins **implicitly denied**. Any matching **explicit Deny** ends it. Then each guard-rail policy that applies must allow the action. Finally, an Allow in an identity-based or resource-based policy grants it.

## The order, simplified

1. Is there a matching `"Effect": "Deny"` in any applicable policy? Then **deny**. Nothing can override it.
2. Is the account in an organization with SCPs or resource control policies? The action must be allowed by them; if not, **deny**.
3. Does the principal have a permissions boundary, or the session a session policy? The action must be inside it; if not, **deny**.
4. Does an identity-based or resource-based policy allow it? Then **allow**.
5. Otherwise, **deny** (the implicit deny from the start).

Guard rails never grant anything; they only cut the maximum. An SCP that allows `s3:*` does not let anyone use S3 until an identity or resource policy also does. Real IAM has more detail (cross-account requests need an allow on both sides, a few resource policies that name a principal directly behave differently with boundaries, and conditions can make any statement not apply), but this order explains nearly every surprise.

## Try it

A toy evaluator for single-account requests with an SCP. Wildcards (`*`) match any characters, as in IAM. Change the policies and see which step decides.

```js run
const match = (pattern, value) =>
  new RegExp("^" + pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$").test(value)

const matches = (stmt, req) =>
  [].concat(stmt.Action).some((a) => match(a, req.action)) &&
  [].concat(stmt.Resource).some((r) => match(r, req.resource))

const has = (policies, effect, req) =>
  policies.some((p) => p.Statement.some((s) => s.Effect === effect && matches(s, req)))

function evaluate(req, { scp, boundary, identity = [], resource = [] }) {
  const all = [scp, boundary, identity, resource].flat().filter(Boolean)
  if (has(all, "Deny", req)) return "DENY (explicit deny)"
  if (scp && !has(scp, "Allow", req)) return "DENY (not allowed by the SCP)"
  if (boundary && !has(boundary, "Allow", req)) return "DENY (outside the permissions boundary)"
  if (has(identity, "Allow", req) || has(resource, "Allow", req)) return "ALLOW"
  return "DENY (implicit: nothing allowed it)"
}

const identity = [{ Statement: [
  { Effect: "Allow", Action: "s3:*", Resource: "arn:aws:s3:::reports/*" },
  { Effect: "Deny", Action: "s3:DeleteObject", Resource: "arn:aws:s3:::reports/2025/*" },
] }]
const scp = [{ Statement: [{ Effect: "Allow", Action: ["s3:Get*", "s3:Put*", "s3:DeleteObject"], Resource: "*" }] }]

const requests = [
  { action: "s3:GetObject", resource: "arn:aws:s3:::reports/2026/q1.csv" },
  { action: "s3:DeleteObject", resource: "arn:aws:s3:::reports/2025/q4.csv" },
  { action: "s3:ListBucket", resource: "arn:aws:s3:::reports/x" },
  { action: "s3:GetObject", resource: "arn:aws:s3:::payroll/jan.csv" },
]
for (const r of requests) console.log(`${r.action} ${r.resource.split(":::")[1]} -> ${evaluate(r, { scp, identity })}`)
```

Run with Node, it prints:

```sh
s3:GetObject reports/2026/q1.csv -> ALLOW
s3:DeleteObject reports/2025/q4.csv -> DENY (explicit deny)
s3:ListBucket reports/x -> DENY (not allowed by the SCP)
s3:GetObject payroll/jan.csv -> DENY (implicit: nothing allowed it)
```

The third request is the one people trip over: the role's own policy says `s3:*`, but the organization's SCP never allowed listing.

## Debugging a denial

- The error message often says which policy type denied the request ("with an explicit deny in a service control policy", "because no identity-based policy allows").
- The IAM policy simulator and `aws iam simulate-principal-policy` evaluate a request without making it.
- CloudTrail records the denied call, the principal and the error code.
- Check the resource side too: bucket policies, KMS key policies and queue policies are frequent sources of explicit denies, and a KMS key policy must allow use of the key even when the bucket allows the read.
