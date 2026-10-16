---
id: k8s-resources
title: "Requests, limits, QoS, throttling and OOMKills"
summary: What you reserve, what you may use, what happens over it
why: "Requests decide where pods fit and limits decide how they fail. Most latency spikes and surprise restarts in Kubernetes trace back to these four numbers."
requires: [k8s-scheduler, docker-containers]
lesson: none
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
