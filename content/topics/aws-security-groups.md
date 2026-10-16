---
id: aws-security-groups
title: Security groups and network ACLs
summary: Stateful per-resource rules versus stateless subnet rules
why: "Security groups are the firewall you will use every day. Network ACLs are a blunter second layer, and mixing them up is a classic cause of connections that hang for no visible reason."
requires: [aws-vpc]
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: return-path
title: A request and its reply
subtitle: "Inbound HTTPS through a custom network ACL and a security group"
kind: sequence
elements:
  - { id: client, label: Client }
  - { id: nacl, label: Subnet NACL }
  - { id: sg, label: Security group }
  - { id: app, label: Instance }
edges:
  - { id: syn, from: client, to: nacl, label: "TCP to port 443, from port 50432" }
  - { id: nacl-in, from: nacl, to: nacl, label: "inbound rule 100: allow 443", flow: security }
  - { id: pass, from: nacl, to: sg, label: into the subnet }
  - { id: sg-in, from: sg, to: sg, label: "443 allowed: connection tracked", flow: security }
  - { id: deliver, from: sg, to: app, label: delivered to the ENI }
  - { id: reply, from: app, to: sg, label: "reply to port 50432", style: dashed }
  - { id: sg-out, from: sg, to: sg, label: "tracked reply: allowed", style: dashed, flow: security }
  - { id: leave, from: sg, to: nacl, label: out of the subnet, style: dashed }
  - { id: nacl-out, from: nacl, to: nacl, label: "outbound: needs 1024-65535", style: dashed, flow: security }
  - { id: back, from: nacl, to: client, label: reply delivered, style: dashed }
steps:
  - caption: "Two packet filters stand between a client and an instance. The network ACL guards the subnet edge; the security group is attached to the instance's network interface."
    focus: [client, nacl, sg, app]
  - caption: "A client opens an HTTPS connection. Its packets go to port 443 and come from a random high port on the client, here 50432."
    trace: [syn]
  - caption: "The network ACL checks its numbered rules, lowest number first, and the first match wins. Rule 100 allows inbound 443."
    trace: [nacl-in, pass]
  - caption: "The security group considers all its rules together. Inbound 443 is allowed, and it starts tracking the connection."
    trace: [sg-in, deliver]
  - caption: "The instance replies to port 50432 on the client."
    trace: [reply]
  - caption: "The security group remembers the connection, so the reply is allowed without any outbound rule. That is what stateful means."
    trace: [sg-out, leave]
  - caption: "The network ACL is stateless. It judges the reply as a new packet, so an outbound rule must allow ports 1024 to 65535."
    trace: [nacl-out]
  - caption: "With that rule the reply reaches the client. Without it, the connection opens and then hangs, which looks like an application problem."
    trace: [back]
note: "The default network ACL allows all traffic both ways, so this only bites once you write a custom one."
```

```trace diagram
id: sg-references
title: Tiers that admit each other by group
subtitle: "alb-sg, app-sg and db-sg"
elements:
  - { id: client, label: Clients, kind: person, row: 0 }
  - { id: alb, label: Load balancer, sub: "alb-sg: 443 from 0.0.0.0/0", row: 1 }
  - { id: app, label: App tasks, sub: "app-sg: 8080 from alb-sg", row: 2, role: service }
  - { id: other, label: Other instance, sub: "same VPC, no app-sg", kind: external, row: 2, role: service }
  - { id: db, label: Database, sub: "db-sg: 5432 from app-sg", kind: store, row: 3 }
edges:
  - { id: https, from: client, to: alb, label: "443" }
  - { id: fwd, from: alb, to: app, label: "8080" }
  - { id: query, from: app, to: db, label: "5432" }
  - { id: blocked, from: other, to: db, label: dropped, style: dotted, flow: security }
steps:
  - caption: "Each tier admits only the tier in front of it, and names that tier by its security group instead of by IP range."
  - caption: "Only the load balancer is open to the internet, on 443."
    focus: [client, alb]
    trace: [https]
  - caption: "app-sg allows 8080 from alb-sg. Anything with alb-sg attached may connect, whatever its address."
    trace: [fwd]
  - caption: "db-sg allows 5432 from app-sg. When the app scales from 3 tasks to 30 with new IPs, no rule changes."
    trace: [query]
  - caption: "An instance in the same VPC without app-sg matches no rule, so its packets are dropped. Security groups have no deny rules; nothing matching is enough."
    focus: [other, db]
    trace: [blocked]
  - caption: "To block one bad address, which an allow-only group can't do, use a network ACL deny rule or AWS WAF."
    focus: [alb]
```
