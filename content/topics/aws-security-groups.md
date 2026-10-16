---
id: aws-security-groups
title: Security groups and network ACLs
summary: Stateful per-resource rules versus stateless subnet rules
why: "Security groups are the firewall you will use every day. Network ACLs are a blunter second layer, and mixing them up is a classic cause of connections that hang for no visible reason."
requires: [aws-vpc]
lesson: none
points:
  - title: Security groups are stateful
    text: "If inbound traffic is allowed, the reply is allowed automatically. You only write rules for who may start a connection."
  - title: They only allow
    text: "A security group has no deny rules. Traffic matching no rule is dropped."
  - title: Reference groups, not addresses
    text: "Allow the database's port from the app's security group, and any instance in that group can connect, whatever its IP."
  - title: NACLs are stateless and ordered
    text: "A network ACL is checked at the subnet boundary in rule-number order, both ways, so return traffic needs its own rule."
quiz_hint: Ask whether the rule set remembers the connection (stateful) or judges each packet alone (stateless).
quiz:
  - q: A security group allows inbound TCP 443 from anywhere and has no outbound rules. Can clients get responses?
    options: ["No, outbound must allow the replies", "Yes; security groups are stateful, so replies to allowed inbound connections are allowed", "Only for IPv6"]
    answer: 1
    explain: "Return traffic for a tracked connection is allowed regardless of outbound rules. Outbound rules only matter for connections the instance starts."
  - q: "You add a NACL rule allowing inbound 443, but HTTPS connections now hang. A likely cause?"
    options: ["NACLs do not support port 443", "The NACL's outbound rules do not allow the ephemeral ports used by the replies", "The security group is now ignored"]
    answer: 1
    explain: "NACLs are stateless. Replies go to the client's ephemeral port (typically 1024-65535), and an outbound rule must allow them."
  - q: How should a database's security group admit the application servers?
    options: ["Allow the port from the VPC's whole address range", "Allow the port from the application's security group ID", "Allow all traffic from 0.0.0.0/0 and rely on the private subnet"]
    answer: 1
    explain: "A security-group reference follows instances as they scale and change IPs, and admits nothing else in the VPC."
links:
  - { title: "Infrastructure security: security groups compared with network ACLs (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html" }
  - { title: "Security groups (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" }
  - { title: "Network ACLs (AWS docs)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" }
---
AWS gives you two packet filters in a VPC. A **security group** is attached to network interfaces (instances, tasks, load balancers, databases) and is stateful: it tracks connections, so you write rules only for who may start them. A **network ACL** is attached to subnets, is stateless, evaluates numbered allow and deny rules in order, and judges every packet in both directions on its own.

## Side by side

| | Security group | Network ACL |
| --- | --- | --- |
| Attached to | Network interfaces (per resource) | Subnets |
| Rules | Allow only | Allow and deny, numbered |
| Evaluation | All rules considered together | Lowest number first; the first match wins |
| Return traffic | Allowed automatically (stateful) | Needs its own rule (stateless) |
| Default | New groups: no inbound, all outbound | Default NACL: allow everything both ways |

## Security groups, in practice

```sh
alb-sg   inbound  443 from 0.0.0.0/0, ::/0
app-sg   inbound  8080 from alb-sg
db-sg    inbound  5432 from app-sg
```

Each tier only admits the tier in front of it, by **security group reference** rather than by IP range. When the app scales from 3 to 30 tasks, nothing changes: anything with `app-sg` attached may reach the database, and nothing else may. A resource can have several groups; their rules add up.

Things that catch people out:

- Because groups only allow, you cannot block a single bad address with one. That is a job for a NACL or AWS WAF.
- Changing rules affects existing connections differently depending on tracking; the safest assumption is that removing a rule may not cut a connection that is already open.
- Groups are per VPC. A default group exists in every VPC; avoid using it, so permissions stay explicit.
- Opening `0.0.0.0/0` on SSH, RDP or a database port is the most common finding in any security review. Use Systems Manager Session Manager instead of open SSH.

## Network ACLs, when you need them

The default NACL allows all traffic, and many teams never change it. Custom NACLs are useful as a coarse, subnet-wide backstop: deny a range at the edge of a data subnet, or meet a rule that requires explicit deny lists. Because they are stateless, an inbound allow for port 443 also needs an outbound allow for the ephemeral ports the replies go to, and an outbound call to an API needs an inbound allow for its replies. Forgetting that produces connections that open and then hang, which looks like an application problem.

The AWS guidance is to rely on security groups for fine-grained control and use NACLs sparingly for stateless, coarse rules.
