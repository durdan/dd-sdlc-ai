---
id: aws-compute
title: "Compute choices: EC2, ECS, EKS and Fargate"
summary: How much of the machine you want to own
why: "Choosing between instances, containers and functions decides what you patch, how you scale, how you pay and what fails at 3 a.m."
requires: [aws-vpc, aws-iam]
lesson: none
points:
  - title: EC2 is a virtual machine
    text: "You choose the instance type, image and disks, and you own everything from the operating system up."
  - title: ECS and EKS schedule containers
    text: "ECS is AWS's own orchestrator; EKS runs upstream Kubernetes with a managed control plane. Both place tasks or pods on capacity you choose."
  - title: Fargate removes the hosts
    text: "With Fargate you ask for vCPU and memory per task or pod, and AWS runs it in an isolated environment with no instances to manage."
  - title: Auto Scaling groups replace what dies
    text: "Instances should be cattle: launched from a template by an Auto Scaling group that keeps the count right across zones."
quiz_hint: Ask what you would have to patch, scale and replace by hand with each option.
quiz:
  - q: Your team wants to run containers without managing or patching any EC2 instances. Which option fits?
    options: ["ECS on EC2 capacity", "ECS or EKS with Fargate", "A single large EC2 instance running Docker"]
    answer: 1
    explain: "Fargate provides the compute for each task or pod; there are no instances in your account to patch, scale or secure."
  - q: Why put even a single EC2 instance in an Auto Scaling group?
    options: ["It makes the instance faster", "If the instance fails its health check, the group replaces it, in another zone if needed", "Auto Scaling groups are free and instances are not"]
    answer: 1
    explain: "A group with min = max = 1 is a self-healing single instance. Combined with a launch template and no state on the instance, recovery needs no human."
  - q: Spot capacity is offered at a large discount. What is the catch?
    options: ["Spot instances are slower", "AWS can reclaim them with a two-minute warning, so workloads must tolerate interruption", "Spot instances cannot run in a VPC"]
    answer: 1
    explain: "Spot suits stateless, retryable work such as batch jobs, CI and spread-out web tiers. Mix it with on-demand capacity for anything that must stay up."
links:
  - { title: "Choosing an AWS compute service (AWS decision guide)", url: "https://docs.aws.amazon.com/decision-guides/latest/compute-on-aws-how-to-choose/choosing-aws-compute.html" }
  - { title: "AWS Fargate for Amazon ECS (AWS docs)", url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html" }
  - { title: "What is Amazon EKS? (AWS docs)", url: "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html" }
---
AWS offers a spectrum of compute, from raw virtual machines to functions that exist only while they run. The further along you go, the less you manage and the less you control. **EC2** gives you instances. **ECS** and **EKS** schedule containers onto capacity, which can be EC2 instances you manage or **Fargate**, where AWS provides an isolated environment per task or pod. **Lambda** (the next topic) runs functions per request or event.

## What you own

| | EC2 | ECS or EKS on EC2 | ECS or EKS on Fargate | Lambda |
| --- | --- | --- | --- | --- |
| OS patching | You | You (the nodes) | AWS | AWS |
| Scaling hosts | Auto Scaling group | Auto Scaling group or Karpenter | None | None |
| Unit you pay for | Instance-hours | Instance-hours | vCPU and memory per second | Requests and GB-seconds |
| Longest run | Unlimited | Unlimited | Unlimited | 15 minutes per invocation |
| Control | Everything (kernel, GPUs, disks) | Most | Less (no daemons on the host, fewer instance choices) | Least |

## EC2 done properly

An instance is a **launch template** (image, instance type, security groups, IAM instance profile, user data) brought to life by an **Auto Scaling group** that spans several zones. The group replaces instances that fail health checks, scales on metrics, and rolls out a new template gradually with instance refresh. Keep no important state on the instance itself, so replacing it is routine rather than an incident. Instance metadata (IMDS) should be set to require IMDSv2 tokens, which blocks a class of server-side request forgery attacks that stole role credentials from IMDSv1.

Pricing models matter as much as instance types: **on-demand** for flexibility, **Savings Plans** or reserved capacity for a steady baseline, and **Spot** for interruptible work at a deep discount, with a two-minute warning before AWS reclaims the capacity.

## Containers: ECS or EKS

- **ECS** is simpler and AWS-specific: task definitions, services, and deep integration with load balancers, IAM task roles and CloudWatch. There is no control plane to pay for or upgrade.
- **EKS** is Kubernetes. You get the portable API, its ecosystem (Helm, operators, Karpenter) and its complexity; AWS runs the control plane for an hourly fee, and you upgrade Kubernetes versions on its schedule.

Both run on EC2 nodes or on Fargate. Fargate removes node management and gives each task its own kernel boundary, at a higher price per vCPU and with some limits (no privileged containers or host daemons). A common mix is Fargate for most services and EC2 node groups for GPU, very large or cost-sensitive steady workloads.

## Failure modes to plan for

- **One zone, one instance**: put capacity in at least two zones and size so that losing one still leaves enough.
- **Capacity shortages**: a specific instance type can run out in a zone. Allow several types (instance type flexibility) in groups and node pools.
- **Image drift**: instances that were patched by hand differ from the template; bake images instead and replace instances.
