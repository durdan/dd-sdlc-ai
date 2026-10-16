---
id: aws-load-balancing
title: "Load balancing: ALB, NLB and health checks"
summary: Spreading traffic and routing around bad targets
why: "The load balancer is where users meet your system. Its health checks decide which targets get traffic, and badly tuned ones turn a small fault into an outage."
requires: [aws-security-groups]
lesson: none
points:
  - title: ALB speaks HTTP
    text: "An Application Load Balancer works at layer 7: it routes by host, path and headers, terminates TLS and supports HTTP/2, gRPC and WebSockets."
  - title: NLB moves connections
    text: "A Network Load Balancer works at layer 4 with TCP, UDP and TLS, has a static IP per zone, and adds very little latency."
  - title: Health checks pick targets
    text: "Targets that fail UnhealthyThresholdCount checks in a row stop getting new requests until they pass HealthyThresholdCount checks."
  - title: All unhealthy means fail open
    text: "If every target fails its health checks, the load balancer sends traffic to all of them anyway, rather than to none."
quiz_hint: Think about what layer the balancer reads, and what happens when the check itself is wrong.
quiz:
  - q: You need path-based routing (/api to one service, /static to another) and TLS termination. Which load balancer?
    options: ["Network Load Balancer", "Application Load Balancer", "Either; they have the same features"]
    answer: 1
    explain: "Routing on paths, hosts and headers requires reading HTTP, which the ALB does. An NLB forwards connections without looking inside them."
  - q: Your ALB health check calls /health, which queries the database. The database slows down and every target fails. What does the ALB do?
    options: ["Returns 503 to every client", "Fails open: it routes requests to all targets as if they were healthy", "Shuts down the targets"]
    answer: 1
    explain: "When all targets in a target group are unhealthy, the ALB fails open. Better still, keep the health check about the target itself, so one slow dependency does not mark the whole fleet bad."
  - q: With ALB defaults for instance targets, roughly how long until a dead target stops getting traffic?
    options: ["About 1 minute: 2 failed checks 30 seconds apart", "About 5 seconds", "About 10 minutes"]
    answer: 0
    explain: "Defaults are a 30 second interval, a 5 second timeout and 2 consecutive failures to go unhealthy (5 successes to come back). Shorten the interval if a minute is too long."
links:
  - { title: "How Elastic Load Balancing works (AWS docs)", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html" }
  - { title: "Health checks for Application Load Balancer target groups (AWS docs)", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html" }
  - { title: "What is a Network Load Balancer? (AWS docs)", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html" }
---
Elastic Load Balancing puts one stable entry point in front of many targets (instances, containers, IP addresses or Lambda functions), spreads requests across them, and stops sending traffic to targets that fail **health checks**. It runs as nodes in each zone you enable, so the balancer itself survives the loss of a zone, provided your targets are also spread across zones.

## Which one

| | Application Load Balancer | Network Load Balancer |
| --- | --- | --- |
| Layer | 7 (HTTP, HTTPS, gRPC, WebSockets) | 4 (TCP, UDP, TLS) |
| Routing | Host, path, headers, query strings, methods | Port and protocol only |
| Addresses | DNS name; IPs can change | Static IP per zone, optional Elastic IP |
| Typical use | Web apps and APIs, several services behind one name | Non-HTTP protocols, very high connection rates, fixed IPs for allow-lists |

A Gateway Load Balancer also exists, for inserting third-party firewalls and appliances into traffic. Both ALB and NLB support security groups now, so the target's group can admit only the balancer's group.

## Health checks

The balancer probes each registered target on a port and path you choose:

```sh
HealthCheckPath            /healthz
HealthCheckIntervalSeconds 30   # default for instance and ip targets
HealthCheckTimeoutSeconds  5
UnhealthyThresholdCount    2    # consecutive failures before out of service
HealthyThresholdCount      5    # consecutive successes before back in service
Matcher                    200  # HTTP codes that count as healthy
```

With these defaults, a target that dies keeps receiving traffic for up to about a minute, and a recovered one waits about two and a half minutes before it gets traffic again. Tighter intervals react faster but generate more probe load.

What the health check should test matters more than its timing. A check that queries a shared database marks **every** target unhealthy when the database is slow. The ALB then **fails open** and sends traffic to all targets regardless, which is better than nothing, but you have lost the ability to route around a genuinely broken instance. Keep the check about the target itself (is the process up and able to serve), and handle dependency failures in the application, for example with timeouts and degraded responses.

## Other settings that matter

- **Deregistration delay** (default 300 seconds) keeps in-flight requests going while a target is removed. Lower it for short requests so deploys are not slowed for minutes; make sure your app drains on SIGTERM within it.
- **Cross-zone load balancing** is on for ALBs, off by default for NLBs; with it off, each zone's node only uses targets in its own zone, so uneven target counts give uneven load.
- **Slow start** ramps traffic to new targets gradually, useful for apps with cold caches or JIT warm-up.
- **Idle timeout** (60 seconds by default on ALB) closes quiet connections; keep your server's keep-alive timeout longer than it, or clients will see occasional 502s.
