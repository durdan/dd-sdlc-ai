---
id: kubernetes
title: "Kubernetes: how the cluster keeps your app running"
promise: "How Kubernetes turns a few YAML objects into a running, self-healing service: the control loops behind it, how pods are placed, rolled out and reached, how probes and resource settings keep them healthy (or take them down), and how state, security and operators fit in."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: The cluster's brain
    blurb: Desired state, pods, placement
    topics: [k8s-control-loop, k8s-pods, k8s-scheduler]
  - title: Running and reaching your app
    blurb: Rollouts, Services, routing, config
    topics: [k8s-deployments, k8s-services, k8s-ingress, k8s-config]
  - title: Keeping it healthy
    blurb: Probes, resources, autoscaling
    topics: [k8s-probes, k8s-resources, k8s-autoscaling]
  - title: State, security and extension
    blurb: Storage, access, operators
    topics: [k8s-statefulsets, k8s-rbac, k8s-operators]
bridges:
  - id: service-mesh
    why: "Native sidecar containers are what a mesh's proxies run as. This is the pattern: TLS, retries and telemetry moved into a proxy beside each pod."
  - id: bulkhead
    why: "Requests, limits, quotas and separate node pools are bulkheads for compute. The pattern explains how to size and separate them so one workload cannot sink the rest."
  - id: graceful-degradation
    why: "A readiness probe that takes every pod out of the Service turns a slow dependency into a total outage. Serving a reduced answer is usually the better failure mode."
  - id: rate-limiting
    why: "Gateways and ingress controllers are where most clusters enforce per-client budgets. This is how those limits work and where to apply them."
  - id: leader-election
    why: "Controller managers and operators run several replicas but let only one act, using a Lease object in the API. This is the general technique."
next: [scaling-out, stay-up]
---
Written for Kubernetes 1.33 and later; the links point to the current kubernetes.io documentation. Recent changes are called out where they matter: native sidecar containers (stable in 1.33), in-place pod resize (stable in 1.35), the IPVS proxy mode deprecation (1.35), the Gateway API as the recommended successor to Ingress, and the retirement of the ingress-nginx controller (March 2026). The manifests are complete examples that pass strict schema validation for Kubernetes 1.34; the shell output is illustrative.
