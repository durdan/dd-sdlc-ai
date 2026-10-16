---
id: k8s-control-loop
title: "Desired state: the API server, etcd and controllers"
summary: You declare what you want; loops make it so
why: "Every Kubernetes behaviour, from restarts to rollouts to autoscaling, is a controller comparing desired state with actual state. See that once and the rest of the system reads the same way."
requires: [docker-containers]
lesson: diagram
points:
  - title: Declare, do not command
    text: "You store objects that describe the desired state (three replicas of this image). Nothing in them says how to get there."
  - title: The API server is the front door
    text: "Every component and every kubectl call goes through kube-apiserver, which authenticates, authorises, validates and stores objects in etcd."
  - title: Controllers close the gap
    text: Each controller watches some kinds of object, compares spec (desired) with status (observed) and acts to make them match, forever.
  - title: Level-triggered, not event-triggered
    text: "Controllers react to the current state, not to a missed event, so the system heals after crashes, restarts and network splits."
quiz_hint: Look for who stores the desired state and who acts on it.
quiz:
  - q: You delete one pod of a Deployment with three replicas. What brings a new one back?
    options: ["kubectl, which remembers the replica count", "The ReplicaSet controller, which sees two pods where three are wanted and creates one", "etcd, which restores the deleted record"]
    answer: 1
    explain: "The ReplicaSet's spec still says three. Its controller notices the observed count is two and creates a pod. Nobody replays your original command."
  - q: Which component reads and writes etcd directly?
    options: ["Every kubelet", "Only kube-apiserver; everything else goes through the API", "The scheduler and the controllers"]
    answer: 1
    explain: "etcd is the API server's backing store. Kubelets, the scheduler, controllers and kubectl all talk to the API server, which is where authentication, authorisation and admission happen."
  - q: "What is the difference between an object's spec and its status?"
    options: ["They are two names for the same thing", "spec is what you want (written by you); status is what is observed (written by the controllers)", "status is the previous spec"]
    answer: 1
    explain: "You own spec. Controllers and kubelets report status. A gap between them is a controller's to-do list."
links:
  - { title: "Kubernetes components (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/overview/components/" }
  - { title: "Controllers (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/architecture/controller/" }
  - { title: "Cluster architecture (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/architecture/" }
---
Kubernetes is a database of desired state with a crowd of control loops around it. You do not tell it to start three containers; you store an object that says "there should be three replicas of this pod". The object is saved through the API server into etcd, and controllers, each watching their own kinds of object, keep comparing what should exist with what does exist and act to close the gap. They never stop checking, which is why the cluster repairs itself.

## The pieces

**Control plane** (often managed for you by EKS, GKE or AKS):

- **kube-apiserver**: the only entry point. It authenticates the caller, checks RBAC, runs admission (defaults, validation, policy) and persists objects. It also serves watches, so components learn about changes as they happen.
- **etcd**: a consistent, replicated key-value store holding every object. Only the API server talks to it.
- **kube-scheduler**: picks a node for each pod that does not have one yet.
- **kube-controller-manager**: runs the built-in controllers (Deployments, ReplicaSets, Jobs, nodes, endpoints, service accounts and more). Cloud integrations live in the cloud-controller-manager.

**Every node** runs:

- **kubelet**: watches for pods assigned to its node and asks the container runtime (containerd or CRI-O, through the CRI) to run them, then reports status back.
- **kube-proxy** (or a CNI plugin that replaces it): programs the node so Service addresses reach pods.

## A loop in action

```sh
kubectl apply -f deploy.yaml          # store the desired state
kubectl get deploy web -o jsonpath='{.spec.replicas} wanted, {.status.readyReplicas} ready{"\n"}'
# 4 wanted, 4 ready

kubectl delete pod -l app=web --wait=false   # break the actual state
kubectl get pods -l app=web --watch          # watch controllers repair it
```

What happens after the `apply`: the Deployment controller sees a new Deployment and creates a ReplicaSet; the ReplicaSet controller sees zero pods where four are wanted and creates four pod objects; the scheduler sees four unscheduled pods and assigns each a node; each kubelet sees a pod for its node and starts the containers; their status flows back up. Each step is a separate loop that only reads and writes objects through the API. None calls another directly.

## Why this design

- **Self-healing.** A crashed node, a killed pod or a lost event does not matter; the next pass of the loop sees the difference and fixes it.
- **Declarative changes.** You change the spec (a new image tag) and the controllers work out the steps. The same file applied twice changes nothing.
- **Extensible.** Anyone can add a new object type and a controller for it. Operators are exactly that.

## Consequences for you

- Changes are **eventually** applied. `kubectl apply` returns when the object is stored, not when pods are running; use `kubectl rollout status` or `kubectl wait` to wait for the outcome.
- **Fight the loop and you lose.** Edit a pod owned by a ReplicaSet, or scale a Deployment that an autoscaler manages, and a controller will put it back. Change the owner instead.
- **Keep manifests in git** and apply them from CI or a GitOps tool such as Argo CD or Flux, so the desired state is reviewed and reproducible.

```trace diagram
id: apply-to-running
title: From kubectl apply to running containers
subtitle: Every loop talks only to the API server
groups:
  - { id: cp, label: Control plane }
  - { id: node, label: "Worker node" }
elements:
  - { id: you, label: kubectl apply, sub: "Deployment web, replicas: 4", kind: person, row: 0 }
  - { id: api, label: kube-apiserver, sub: "authn, authz, admission", kind: system, group: cp, row: 1 }
  - { id: etcd, label: etcd, sub: every object, kind: store, group: cp, row: 2 }
  - { id: depctl, label: Deployment controller, group: cp, row: 2 }
  - { id: rsctl, label: ReplicaSet controller, group: cp, row: 2 }
  - { id: sched, label: kube-scheduler, group: cp, row: 2 }
  - { id: kubelet, label: kubelet, sub: one per node, group: node, row: 3 }
  - { id: runtime, label: containerd, sub: through the CRI, group: node, tone: neutral, row: 4 }
edges:
  - { id: apply, from: you, to: api, label: desired state }
  - { id: store, from: api, to: etcd }
  - { id: dep, from: depctl, to: api }
  - { id: rs, from: rsctl, to: api }
  - { id: bind, from: sched, to: api }
  - { id: watch, from: kubelet, to: api }
  - { id: cri, from: kubelet, to: runtime, label: start containers }
steps:
  - caption: "Kubernetes is a store of desired state with control loops around it. Every arrow here goes to the API server: no component calls another directly."
  - caption: "kubectl apply sends the Deployment to kube-apiserver. It authenticates you, checks RBAC, runs admission and saves the object in etcd."
    focus: [you, api, etcd]
    trace: [apply, store]
  - caption: "The command returns once the object is stored. Nothing is running yet. Only the API server ever reads or writes etcd."
    focus: [api, etcd]
  - caption: The Deployment controller watches Deployments. It sees one with no ReplicaSet and creates a ReplicaSet for its pod template, through the API.
    focus: [depctl, api]
    trace: [dep]
  - caption: The ReplicaSet controller sees zero pods where four are wanted and creates four pod objects. They have no node yet.
    focus: [rsctl, api]
    trace: [rs]
  - caption: The scheduler watches for pods without a node, picks one for each and records the choice in the pod.
    focus: [sched, api]
    trace: [bind]
  - caption: "Each kubelet watches for pods assigned to its node and asks containerd to start the containers. It reports their status back, so status catches up with spec."
    focus: [kubelet, runtime, api]
    trace: [watch, cri]
  - caption: "Now delete a pod. Nobody replays your command: the ReplicaSet controller sees three where four are wanted and creates one more."
    focus: [rsctl, api]
    trace: [rs]
  - caption: "Controllers are level-triggered: they act on the state now, not on events they might have missed. That is why the cluster heals after crashes and restarts."
    focus: [depctl, rsctl, sched, kubelet]
```
