---
id: k8s-deployments
title: Deployments, rolling updates and rollbacks
summary: New ReplicaSet up, old one down, a few pods at a time
why: "Most production changes in Kubernetes are a Deployment rollout. Knowing how it swaps pods tells you why a bad readiness probe stalls it and how to get back fast."
requires: [k8s-pods]
lesson: none
points:
  - title: Deployment, ReplicaSet, Pods
    text: "A Deployment manages ReplicaSets; a ReplicaSet keeps N identical pods running. Each change to the pod template creates a new ReplicaSet."
  - title: Rolling by default
    text: "The RollingUpdate strategy scales the new ReplicaSet up and the old one down in steps, bounded by maxSurge and maxUnavailable (25% each by default)."
  - title: Readiness gates the rollout
    text: "Old pods are only removed as new ones become ready, so a version that never gets ready stalls the rollout instead of replacing everything."
  - title: Rollback is a re-rollout
    text: "kubectl rollout undo scales an earlier ReplicaSet back up; Kubernetes keeps 10 old ReplicaSets by default for this."
quiz_hint: Count how many pods may exist above and below the desired number at each step.
quiz:
  - q: "A Deployment has replicas: 4 and the default strategy. During a rollout, what are the bounds on the pod count?"
    options: ["Exactly 4 at all times", "At most 5 pods in total, and at least 3 available", "All 4 old pods are deleted first, then 4 new ones start"]
    answer: 1
    explain: "25% of 4 is 1. maxSurge allows one extra pod above the desired count (5) and maxUnavailable allows one fewer available (3)."
  - q: The new version's pods never pass their readiness probe. What happens with the default strategy?
    options: ["All old pods are replaced anyway", "The rollout stops making progress; old pods keep serving, and after progressDeadlineSeconds the Deployment reports it as stalled", "Kubernetes rolls back automatically"]
    answer: 1
    explain: "Old pods are only scaled down as new ones become available. Kubernetes marks the rollout as failed to progress but does not undo it; you or your pipeline run kubectl rollout undo."
  - q: What does a change to the replica count create?
    options: ["A new ReplicaSet and a rollout", "Nothing new: scaling only changes the current ReplicaSet's replicas", "A new revision in rollout history"]
    answer: 1
    explain: "Only changes to the pod template (image, env, resources, labels in the template) create a new ReplicaSet and revision. Scaling is not a rollout."
links:
  - { title: "Deployments (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" }
  - { title: "Disruptions and PodDisruptionBudgets (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/disruptions/" }
---
A Deployment describes a pod template and how many copies of it you want. It does not manage pods itself: it creates a ReplicaSet for the current template, and the ReplicaSet keeps the right number of pods alive. When you change the template (usually the image), the Deployment creates a second ReplicaSet and shifts pods from the old one to the new one in steps. The old ReplicaSet is kept, scaled to zero, as the record you roll back to.

## The manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 4
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%          # the defaults, written out
      maxUnavailable: 25%
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: app
          image: ghcr.io/acme/web:1.4.2
          ports:
            - containerPort: 3000
```

The `selector` must match the template's labels; it is how the Deployment finds its ReplicaSets and pods, and it cannot be changed later.

## A rolling update, step by step

```sh
kubectl set image deployment/web app=ghcr.io/acme/web:1.5.0
kubectl rollout status deployment/web
kubectl get rs -l app=web
# NAME             DESIRED   CURRENT   READY
# web-7c9d8f6b5d   0         0         0       <- 1.4.2, kept for rollback
# web-5f4b7d9c8e   4         4         4       <- 1.5.0
```

With 4 replicas, 25% rounds to one pod each way: the controller may run up to 5 pods and must keep at least 3 available. It starts a new pod, waits for it to become ready, removes an old one, and repeats. The word "ready" carries the whole rollout: a new pod counts only when its readiness probe passes (and it has been ready for `minReadySeconds`, if set). That is what stops a broken version from replacing every working pod.

If new pods never become ready, the rollout stops making progress. After `progressDeadlineSeconds` (600 by default) the Deployment's `Progressing` condition turns false with reason `ProgressDeadlineExceeded`, which `kubectl rollout status` reports as an error. Kubernetes does not roll back on its own.

## Rolling back

```sh
kubectl rollout history deployment/web
kubectl rollout undo deployment/web                  # back to the previous revision
kubectl rollout undo deployment/web --to-revision=3
```

Undo copies an old ReplicaSet's template back into the Deployment, and the same rolling process runs in reverse. It is fast because the old images are usually still cached on the nodes. If you manage manifests in git (or with Argo CD or Flux), revert the commit too, or the next sync will roll forward again.

## Other strategies and helpers

- `strategy: Recreate` stops all old pods before starting new ones: downtime, but never two versions at once (useful when versions cannot coexist).
- Set `maxUnavailable: 0` for zero lost capacity during rollouts, at the cost of needing room for surge pods.
- Canary and blue-green releases need traffic splitting (Gateway API weights, a service mesh, or tools such as Argo Rollouts).
- A **PodDisruptionBudget** limits how many pods voluntary disruptions, such as node drains, may take at once. Rollouts are governed by the strategy instead.
- Version tags are mutable; deploy by digest (or at least unique tags) so a rollback really returns to the old bits.
