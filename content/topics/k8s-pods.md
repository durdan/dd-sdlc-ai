---
id: k8s-pods
title: "Pods: why not just containers"
summary: The smallest unit Kubernetes schedules
why: "Pods explain why sidecars can talk over localhost, why containers in a pod live and die together, and why you almost never create a pod by hand."
requires: [k8s-control-loop, docker-networking]
lesson: diagram
points:
  - title: A pod is a shared context
    text: "One or more containers that always run on the same node and share a network namespace (one IP, one localhost) and volumes."
  - title: One app, maybe helpers
    text: "Usually one main container, plus init containers that run first and sidecars that run alongside, such as a log shipper or proxy."
  - title: Native sidecars are stable
    text: "Since Kubernetes 1.33, an init container with restartPolicy: Always is a sidecar: it starts before the app, keeps running and stops after it."
  - title: Pods are disposable
    text: A pod is never moved or repaired; it is replaced. Controllers such as Deployments create pods for you.
quiz_hint: Think about what the containers in one pod have in common, and what replaces a pod when it goes away.
quiz:
  - q: An app container listens on port 3000. How does a sidecar in the same pod reach it?
    options: ["Through a Service", "localhost:3000, because containers in a pod share one network namespace", "The pod's DNS name only"]
    answer: 1
    explain: "All containers in a pod share an IP address and port space and can reach each other via localhost. That also means two containers in one pod cannot both listen on the same port."
  - q: How do you declare a native sidecar (Kubernetes 1.33 and later)?
    options: ["A second entry under containers with sidecar: true", "An entry under initContainers with restartPolicy: Always", "An annotation on the pod"]
    answer: 1
    explain: "A restartable init container starts before the main containers, is restarted if it exits, does not block the pod from finishing (for Jobs), and is stopped after the main containers during shutdown."
  - q: The node running your hand-made pod (no Deployment) fails. What happens to the pod?
    options: ["The scheduler moves it to another node", "Nothing recreates it; a bare pod is not replaced", "The kubelet restarts it on the same node later"]
    answer: 1
    explain: "Pods are not moved or resurrected. Only a controller (Deployment, StatefulSet, Job, DaemonSet) notices the loss and creates a replacement pod elsewhere."
links:
  - { title: "Pods (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/" }
  - { title: "Sidecar containers (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/" }
  - { title: "Pod lifecycle (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" }
---
Kubernetes does not schedule containers; it schedules pods. A pod is a group of one or more containers that always run together on one node and share a network namespace (one IP address, one `localhost`, one port space) and any volumes the pod declares. Most pods contain one application container. The pod wrapper exists for the cases where a few tightly coupled processes must share a host, such as a proxy, a log shipper or a file syncer beside the app.

## One pod, three kinds of container

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    app: web
spec:
  initContainers:
    - name: migrate                 # runs to completion before the app starts
      image: ghcr.io/acme/web:1.4.2
      command: ["./migrate", "up"]
    - name: log-shipper             # a native sidecar: an init container that keeps running
      image: fluent/fluent-bit:4.0
      restartPolicy: Always
      volumeMounts:
        - { name: logs, mountPath: /var/log/app }
  containers:
    - name: app
      image: ghcr.io/acme/web:1.4.2
      ports:
        - containerPort: 3000
      volumeMounts:
        - { name: logs, mountPath: /var/log/app }
  volumes:
    - name: logs
      emptyDir: {}
```

- **Init containers** run one after another, each to completion, before the app starts: migrations, waiting for a dependency, fetching config.
- **Sidecars** (an init container with `restartPolicy: Always`) start in order with the init containers but keep running. They are ready before the app starts and are stopped after it, so a proxy or log shipper sees the app's last requests and log lines. This became stable in Kubernetes 1.33 (first available in 1.28). Before that, sidecars were ordinary containers with no ordering guarantees, which caused classic bugs such as Jobs that never finished because the proxy kept running.
- **App containers** are the workload. The `emptyDir` volume is shared scratch space that lives as long as the pod.

## Life of a pod

A pod is created, scheduled to a node once, runs, and ends. Its phase moves through `Pending` (not yet scheduled, or pulling images), `Running`, and `Succeeded` or `Failed`. Inside a running pod the kubelet restarts crashed containers according to `restartPolicy` (Always by default), with growing back-off delays, which shows up as `CrashLoopBackOff`.

What a pod never does is move. If its node dies, is drained or runs out of memory, the pod is gone. Its replacement is a new pod, with a new name and a new IP, created by whatever controller owns it. So:

- create pods through Deployments, StatefulSets, Jobs or DaemonSets, not by hand;
- never rely on a pod's IP or name staying the same; use a Service;
- keep state in volumes or external stores, not in the container filesystem.

## Stopping a pod

Deleting a pod starts graceful termination: the pod is marked terminating, removed from Service endpoints, any `preStop` hook runs, and the kubelet asks the runtime to send each container SIGTERM. After `terminationGracePeriodSeconds` (30 by default), anything still running gets SIGKILL. This is the same PID 1 and signal handling as with `docker stop`, so the same rules apply: exec-form entrypoints, a SIGTERM handler, and shutdown work that finishes inside the grace period.

```trace diagram
id: one-pod
title: Inside one pod
subtitle: Three kinds of container, one network, one shared volume
groups:
  - { id: pod, label: "Pod web: one IP, one localhost" }
elements:
  - { id: kubelet, label: kubelet, sub: on the pod's node, kind: system, row: 0 }
  - { id: owner, label: ReplicaSet, sub: the pod's owner, kind: external, row: 0 }
  - { id: migrate, label: migrate, sub: init container, group: pod, tone: neutral, row: 1 }
  - { id: shipper, label: log-shipper, sub: "sidecar: restartPolicy Always", group: pod, tone: stream, row: 2 }
  - { id: app, label: app, sub: listens on 3000, group: pod, row: 2 }
  - { id: logs, label: emptyDir logs, sub: lives as long as the pod, kind: store, group: pod, row: 3 }
  - { id: replacement, label: New pod, sub: "new name, new IP", kind: external, row: 1 }
edges:
  - { id: run-init, from: kubelet, to: migrate }
  - { id: run-sidecar, from: kubelet, to: shipper }
  - { id: run-app, from: kubelet, to: app }
  - { id: localhost, from: shipper, to: app, label: "localhost:3000", style: dashed }
  - { id: write, from: app, to: logs }
  - { id: read, from: shipper, to: logs }
  - { id: replace, from: owner, to: replacement, style: dashed }
steps:
  - caption: "A pod is one or more containers that always run on the same node and share a network namespace and volumes. Kubernetes schedules pods, not containers."
  - caption: "The kubelet runs init containers first, one after another, each to completion. The pod's phase is Pending while it waits for a node, pulls images and runs these."
    focus: [kubelet, migrate]
    trace: [run-init]
  - caption: "A native sidecar is an init container with restartPolicy: Always. It starts in order with the init containers but keeps running, and is ready before the app starts."
    focus: [kubelet, shipper]
    trace: [run-sidecar]
  - caption: Then the app container starts and the pod is Running. Most pods have only this one container.
    focus: [kubelet, app]
    trace: [run-app]
  - caption: "All containers in the pod share one IP and one port space, so the sidecar reaches the app on localhost:3000. Two containers in one pod cannot both listen on the same port."
    focus: [shipper, app]
    trace: [localhost]
  - caption: "The emptyDir volume is mounted in both containers. The app writes log files and the shipper reads them. It lives exactly as long as the pod."
    focus: [app, shipper, logs]
    trace: [write, read]
  - caption: "If the app crashes, the kubelet restarts that container in the same pod, with growing back-off delays. That is what CrashLoopBackOff means."
    focus: [kubelet, app]
  - caption: "On deletion each container gets SIGTERM, then SIGKILL after the grace period, 30 seconds by default. The sidecar is stopped after the app, so it sees the last log lines."
    focus: [app, shipper]
  - caption: "A pod never moves. If its node dies the pod is gone, and its owner creates a new pod with a new name and IP. That is why you use Deployments and Services."
    focus: [owner, replacement]
    trace: [replace]
```
