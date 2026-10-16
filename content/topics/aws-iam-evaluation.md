---
id: aws-iam-evaluation
title: How IAM evaluates a request
summary: Deny wins, then every gate must allow
why: "When access is unexpectedly denied, or worse, unexpectedly allowed, the answer is always in the evaluation order. Knowing it turns hours of guessing into a few minutes."
requires: [aws-iam]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: decision
title: One request, every policy that applies
subtitle: "Single account, in the order the AWS enforcement code checks them"
elements:
  - { id: req, label: Request, sub: "principal, action, resource, context", kind: person, row: 0 }
  - { id: any-deny, label: Any explicit Deny?, sub: searched in every policy type, kind: system, row: 1 }
  - { id: org, label: SCPs and RCPs, sub: AWS Organizations guard rails, tone: neutral, row: 2 }
  - { id: res, label: Resource policy, sub: "bucket, key or queue", row: 3 }
  - { id: ident, label: Identity policies, sub: on the user or role, row: 4 }
  - { id: pb, label: Permissions boundary, sub: a cap on the principal, tone: neutral, row: 5 }
  - { id: sess, label: Session policy, sub: passed when assuming a role, tone: neutral, row: 6 }
  - { id: allow, label: Allow, tone: data, row: 7, role: security }
  - { id: deny, label: Deny, kind: external, row: 7, role: security }
edges:
  - { id: in, from: req, to: any-deny }
  - { id: no-deny, from: any-deny, to: org }
  - { id: org-ok, from: org, to: res }
  - { id: res-next, from: res, to: ident }
  - { id: id-ok, from: ident, to: pb }
  - { id: pb-ok, from: pb, to: sess }
  - { id: sess-ok, from: sess, to: allow }
  - { id: res-allow, from: res, to: allow, style: dashed, flow: security }
  - { id: explicit, from: any-deny, to: deny, style: dashed, flow: security }
  - { id: org-deny, from: org, to: deny, style: dashed, flow: security }
  - { id: id-deny, from: ident, to: deny, style: dashed, flow: security }
  - { id: pb-deny, from: pb, to: deny, style: dashed, flow: security }
  - { id: sess-deny, from: sess, to: deny, style: dashed, flow: security }
steps:
  - caption: "For each request, IAM collects every policy that applies and runs the same decision, top to bottom. The request begins implicitly denied."
  - caption: "The request carries its context: who signed it, the action such as s3:DeleteObject, the resource ARN, and details such as the source IP, tags and whether MFA was used."
    focus: [req]
    trace: [in]
  - caption: "First, every applicable policy of every type is searched for a matching Deny. Finding even one ends it: no Allow anywhere can override it."
    focus: [any-deny, deny]
    trace: [explicit]
  - caption: "Next the Organizations guard rails. RCPs cap what can be done to the account's resources, SCPs what its principals can do. If they don't allow the action, it is denied, even for an administrator."
    focus: [org, deny]
    trace: [no-deny, org-deny]
  - caption: "In the same account, a resource policy that allows the user or role session making the call can grant access on its own, without anything in the identity policies."
    focus: [res, allow]
    trace: [org-ok, res-allow]
  - caption: "Otherwise the principal's identity policies must allow the action. If none of them does, the result is the implicit deny from the start."
    focus: [ident, deny]
    trace: [res-next, id-deny]
  - caption: "A permissions boundary never grants anything. The action must also be inside it, so the effective permissions are the overlap of the two."
    focus: [pb, deny]
    trace: [id-ok, pb-deny]
  - caption: "For a role session that was given a session policy, the action must be inside that too. With nothing left blocking it, the request is allowed."
    focus: [sess, allow, deny]
    trace: [pb-ok, sess-deny, sess-ok]
  - caption: "So: any Deny wins, every guard rail must allow, and in one account an Allow in the identity or the resource policy is enough. Across accounts, both sides must allow it."
note: "Simplified. Which principal a resource policy names changes how boundaries and session policies apply to it; the AWS evaluation logic page has the details."
```
