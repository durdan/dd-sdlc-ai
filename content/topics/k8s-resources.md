---
id: k8s-resources
title: "Requests, limits, QoS, throttling and OOMKills"
summary: What you reserve, what you may use, what happens over it
why: "Requests decide where pods fit and limits decide how they fail. Most latency spikes and surprise restarts in Kubernetes trace back to these four numbers."
requires: [k8s-scheduler, docker-containers]
lesson: diagram
points:
  - title: Requests reserve
    text: "The scheduler places pods by their requests, and under contention CPU is shared in proportion to them."
  - title: Limits cap
    text: "Over the CPU limit the container is throttled (paused until the next period); over the memory limit it is OOM-killed."
  - title: QoS decides who goes first
    text: "Guaranteed (requests equal limits), Burstable (some requests) and BestEffort (none). Under node pressure, BestEffort pods are evicted first."
  - title: Resize without restarting
    text: "In-place pod resize, stable since Kubernetes 1.35, changes a running container's CPU and memory without recreating the pod."
quiz_hint: CPU is compressible (you can slow it down); memory is not (you can only take it away).
quiz:
  - q: A container with limits.memory 256Mi allocates 300 MiB. What happens?
    options: ["It is throttled", "The kernel's OOM killer ends it; the container restarts with reason OOMKilled", "Kubernetes raises the limit"]
    answer: 1
    explain: "Memory cannot be slowed down, only reclaimed. Above the cgroup limit the kernel kills a process in the container; kubectl describe pod shows Last State: Terminated, Reason: OOMKilled, exit code 137."
  - q: "A service has limits.cpu: 500m and average CPU use of 30%, yet its p99 latency is bad. What is a likely cause?"
    options: ["The CPU request is too high", "CFS throttling: bursts use the 50 ms quota early in each 100 ms period and the container is paused for the rest", "Memory pressure"]
    answer: 1
    explain: "Averages hide bursts. A CPU limit is enforced per scheduling period, so a burst can be paused mid-request. Check the container_cpu_cfs_throttled metrics, and consider dropping CPU limits while keeping requests."
  - q: Which pod gets the Guaranteed QoS class?
    options: ["One with no requests or limits", "One where every container has CPU and memory requests equal to their limits", "One with only memory limits"]
    answer: 1
    explain: "Guaranteed needs requests and limits for both CPU and memory on every container, with request equal to limit. Such pods are the last to be evicted under node pressure."
links:
  - { title: "Resource management for pods and containers (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/" }
  - { title: "Pod quality of service classes (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/" }
  - { title: "Resize CPU and memory resources assigned to containers (kubernetes.io)", url: "https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/" }
---
Each container can declare **requests**, what it needs reserved, and **limits**, the most it may use, for CPU and memory. Requests drive scheduling: a pod only lands on a node with enough unrequested capacity. Limits are enforced by the kernel through the same cgroup files you saw with `docker run --memory --cpus`. CPU and memory behave very differently at the limit, and that difference explains most resource incidents.

## Writing them down

```yaml
containers:
  - name: app
    image: ghcr.io/acme/web:1.4.2
    resources:
      requests:
        cpu: 250m          # what the scheduler reserves: a quarter of a core
        memory: 256Mi
      limits:
        memory: 256Mi      # above this the container is OOM-killed
        # no CPU limit: use spare CPU instead of being throttled
```

`cpu: 250m` means 250 millicores, a quarter of one core. Memory uses binary units (`Mi`, `Gi`).

## CPU: shared by requests, throttled by limits

When the node is busy, CPU time is divided between containers in proportion to their requests. A CPU limit is a hard quota per scheduling period (by default 100 ms). With `limits.cpu: 500m`, the container gets 50 ms of CPU time per 100 ms, across all its threads. A request that needs 80 ms of CPU in a burst uses the 50 ms, is paused for the rest of the period, and finishes in the next one. Average utilisation can look low while p99 latency suffers. Multi-threaded runtimes (JVM, Go, Node worker pools) burn through a quota quickly.

Many teams therefore set CPU requests on everything but leave CPU limits off for latency-sensitive services, so they can use idle CPU, and rely on requests for fairness. If you do set CPU limits, watch the throttling metrics (`container_cpu_cfs_throttled_periods_total`).

## Memory: no slowing down, only killing

Memory cannot be throttled. When a container goes over its memory limit, the kernel's OOM killer terminates a process in it, and the kubelet restarts the container:

```sh
kubectl describe pod web-6d4c...
#   Last State:  Terminated
#     Reason:    OOMKilled
#     Exit Code: 137
```

Set memory requests equal to limits for predictable services; a memory request lower than the limit lets the pod overcommit the node, and if the node runs short, the kubelet evicts pods to protect itself. Make sure the runtime knows its limit: modern JVMs and Go (`GOMEMLIMIT`) read or accept it; Node's heap size may need `--max-old-space-size`.

## QoS classes and eviction

Kubernetes derives a QoS class from these settings:

| Class | Rule | Evicted under node pressure |
| --- | --- | --- |
| Guaranteed | Every container has CPU and memory requests equal to limits | Last |
| Burstable | At least one request or limit, not Guaranteed | Middle, roughly by how far over their requests they are |
| BestEffort | No requests or limits at all | First |

Production workloads should never be BestEffort: they are scheduled without any reservation and are the first to go.

## Getting the numbers right, and changing them live

Start from measured usage (for example the p95 of memory and CPU over a week, plus headroom), not guesses; Vertical Pod Autoscaler in recommendation mode can suggest values. Namespace `ResourceQuota` and `LimitRange` objects enforce totals and defaults per team.

Changing resources used to mean replacing pods. **In-place pod resize** is stable since Kubernetes 1.35: you patch a running pod's `resize` subresource and the kubelet adjusts the cgroups, with a per-resource `resizePolicy` saying whether that resource can change without restarting the container. Controllers such as VPA can use it to right-size workloads with less disruption.

```trace diagram
id: requests-and-limits
title: Where requests and limits act
subtitle: "requests cpu 250m, memory 256Mi; limits memory 256Mi"
elements:
  - { id: spec, label: Container resources, sub: requests and limits, kind: system, row: 0, role: data }
  - { id: resize, label: In-place resize, sub: "stable since 1.35", tone: neutral, row: 0 }
  - { id: sched, label: kube-scheduler, sub: adds up requests, row: 1 }
  - { id: cgroup, label: kubelet + cgroups, sub: enforces limits, row: 1 }
  - { id: qos, label: QoS class, sub: "Guaranteed, Burstable, BestEffort", tone: data, row: 1 }
  - { id: node, label: Node, sub: allocatable capacity, kind: store, row: 2, role: service }
  - { id: cpu, label: CPU over limit, sub: throttled, tone: stream, row: 2, role: service }
  - { id: mem, label: Memory over limit, sub: "OOMKilled, exit 137", tone: external, row: 2, role: service }
  - { id: evict, label: Node pressure, sub: eviction order, tone: external, row: 2, role: service }
edges:
  - { id: requests, from: spec, to: sched, label: requests }
  - { id: fits, from: sched, to: node }
  - { id: limits, from: spec, to: cgroup, label: limits }
  - { id: throttle, from: cgroup, to: cpu }
  - { id: kill, from: cgroup, to: mem }
  - { id: classify, from: spec, to: qos }
  - { id: order, from: qos, to: evict }
  - { id: patch, from: resize, to: cgroup, style: dashed, flow: main }
steps:
  - caption: "Each container declares requests, what it needs reserved, and limits, the most it may use. They act in different places."
  - caption: "Requests drive scheduling. A pod lands only on a node whose unrequested capacity fits its requests. The scheduler never looks at live usage."
    focus: [spec, sched, node]
    trace: [requests, fits]
  - caption: "When the node's CPU is busy, CPU time is shared in proportion to requests. So requests also buy a fair share at run time."
    focus: [spec, node]
  - caption: "Limits are enforced by the kernel through cgroups, which the kubelet sets up. These are the same controls as docker run --memory --cpus."
    focus: [spec, cgroup]
    trace: [limits]
  - caption: "A CPU limit of 500m allows 50 ms of CPU per 100 ms period. A burst that needs 80 ms is paused for the rest of the period, so p99 latency suffers even at low average use."
    focus: [cgroup, cpu]
    trace: [throttle]
  - caption: "Memory cannot be slowed down. Over the limit, the kernel's OOM killer ends a process and the container restarts with reason OOMKilled, exit code 137."
    focus: [cgroup, mem]
    trace: [kill]
  - caption: "The settings also give the pod a QoS class. Requests equal to limits for CPU and memory on every container is Guaranteed; none at all is BestEffort; anything else is Burstable."
    focus: [spec, qos]
    trace: [classify]
  - caption: "When a node runs short, the kubelet evicts pods: BestEffort first, then Burstable pods furthest over their requests, Guaranteed last."
    focus: [qos, evict]
    trace: [order]
  - caption: "Since Kubernetes 1.35, in-place resize changes a running container's CPU and memory through the pod's resize subresource, without recreating the pod."
    focus: [resize, cgroup]
    trace: [patch]
```
