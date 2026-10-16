---
id: k8s-scheduler
title: The scheduler, nodes and the kubelet
summary: Filter the nodes, score the rest, bind the pod
why: "Pods stuck in Pending, hot spots on one node and replicas that all die with one zone are scheduling problems, and the fixes are a few fields in the pod spec."
requires: [k8s-pods]
lesson: none
points:
  - title: Placement happens once
    text: "The scheduler picks a node for each new pod and writes it into the pod (binding). After that the pod stays there until it ends."
  - title: Filter, then score
    text: "Nodes that cannot run the pod (not enough requested CPU or memory, taints, selectors) are filtered out; the rest are scored and the best one wins."
  - title: Requests, not usage
    text: "The scheduler adds up resource requests, not actual consumption. A node can look idle and still be full."
  - title: The kubelet does the work
    text: "The kubelet on the chosen node pulls images, starts containers through the container runtime, runs probes and reports status."
quiz_hint: The scheduler only looks at declared requests and constraints, never at live usage.
quiz:
  - q: "A pod stays Pending with the event '0/5 nodes are available: 5 Insufficient memory', yet node dashboards show only 40% memory used. Why?"
    options: ["The dashboards are wrong", "The scheduler counts memory requests of pods already placed, which can add up to the node's allocatable even when actual use is low", "Pending always means an image pull problem"]
    answer: 1
    explain: "Scheduling is based on requests. Over-generous requests make nodes full on paper; right-size them, or add nodes (which a cluster autoscaler does for exactly these Pending pods)."
  - q: A node has the taint dedicated=gpu:NoSchedule. Which pods can be scheduled there?
    options: ["Any pod", "Only pods with a matching toleration", "Only pods in the kube-system namespace"]
    answer: 1
    explain: "A taint repels pods that do not tolerate it. Note a toleration only allows placement; to attract pods to those nodes as well, add a nodeSelector or node affinity."
  - q: You want the three replicas of a Deployment spread across availability zones. What do you add?
    options: ["replicas: 3 is enough", "A topologySpreadConstraint on topology.kubernetes.io/zone (or pod anti-affinity)", "A separate Deployment per zone is the only way"]
    answer: 1
    explain: "Without a constraint, the scheduler may place all replicas in one zone. Topology spread constraints keep the skew between zones within maxSkew."
links:
  - { title: "kube-scheduler (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/" }
  - { title: "Assigning pods to nodes (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/" }
  - { title: "Taints and tolerations (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/" }
---
A new pod has no node. The scheduler watches for such pods, chooses the best node for each, and records the choice in the pod object. The kubelet on that node sees a pod assigned to it and makes it real: it pulls the images, asks the container runtime to create the containers, mounts volumes, runs probes and reports status. The scheduler decides where; the kubelet decides nothing and does everything.

## Filtering and scoring

The scheduler works in two steps for each pod:

1. **Filtering** removes nodes where the pod cannot run: not enough unrequested CPU or memory for the pod's requests, a `nodeSelector` or required affinity that does not match, a taint the pod does not tolerate, a volume in another zone, a port already used on the host.
2. **Scoring** ranks the remaining nodes: spreading pods of the same app, preferred affinities, image already present, balanced resource use.

The pod is bound to the highest-scoring node. If no node passes filtering, the pod stays `Pending`, and `kubectl describe pod` shows the reason in its events, for example `0/5 nodes are available: 5 Insufficient memory`.

## Telling the scheduler what you need

```yaml
spec:
  nodeSelector:
    kubernetes.io/arch: arm64          # only arm64 nodes
  tolerations:
    - key: dedicated                   # allowed onto nodes tainted dedicated=gpu:NoSchedule
      operator: Equal
      value: gpu
      effect: NoSchedule
  topologySpreadConstraints:
    - maxSkew: 1                       # keep zones within one pod of each other
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app: trainer
  containers:
    - name: trainer
      image: ghcr.io/acme/trainer:2.0.0
      resources:
        requests:
          cpu: "2"
          memory: 4Gi
```

- **Requests** are the most important input: the scheduler only places a pod where the sum of requests fits the node's allocatable capacity. It never looks at live usage.
- **nodeSelector / node affinity** attract pods to labelled nodes (architecture, instance type, zone).
- **Taints and tolerations** work the other way: a tainted node repels pods unless they tolerate the taint. Dedicated or special nodes (GPUs, system pools) are tainted so ordinary pods stay off.
- **Topology spread and pod anti-affinity** keep replicas apart, so one node or one zone failing does not take them all.

## Nodes and the kubelet

Each node runs a kubelet and a container runtime (containerd or CRI-O, through the Container Runtime Interface; Docker Engine itself has not been a built-in runtime since dockershim was removed in 1.24, though images built with Docker run unchanged). The kubelet reports the node's capacity and conditions. If it stops reporting, the node becomes `NotReady`, and after a timeout its pods are evicted and replaced elsewhere by their controllers.

Useful views:

```sh
kubectl get nodes -o wide
kubectl describe node <name>     # allocatable, requests already placed, conditions, taints
kubectl get pods -o wide         # which node each pod landed on
```

When a node must be emptied for maintenance, `kubectl drain` evicts its pods (respecting PodDisruptionBudgets) and marks it unschedulable, so the scheduler places the replacements elsewhere.
