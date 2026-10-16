---
id: k8s-autoscaling
title: "Autoscaling: HPA and node autoscalers"
summary: More pods when busy, more nodes when pods do not fit
why: "Autoscaling only works when requests, metrics and start-up time cooperate. Set it up blindly and it scales too late, flaps, or scales into a wall of Pending pods."
requires: [k8s-resources, k8s-deployments]
lesson: none
points:
  - title: HPA changes the replica count
    text: "Every 15 seconds the HorizontalPodAutoscaler compares a metric with its target and sets replicas to ceil(current x currentValue / target)."
  - title: Utilization is relative to requests
    text: "averageUtilization: 70 means 70% of the CPU request, so wrong requests mean wrong scaling."
  - title: Scale down slowly
    text: "By default the HPA uses the highest recommendation of the last 5 minutes when scaling down, and ignores changes within a 10% tolerance."
  - title: Nodes follow pods
    text: "Cluster Autoscaler or Karpenter adds nodes when pods are Pending for lack of room and removes underused ones."
quiz_hint: The HPA scales pods, node autoscalers scale machines, and both rely on resource requests.
quiz:
  - q: 4 replicas average 90% CPU utilisation against a target of 60%. What does the HPA ask for?
    options: ["5", "6", "8"]
    answer: 1
    explain: "desiredReplicas = ceil(4 x 90 / 60) = ceil(6.0) = 6. The HPA then sets the Deployment's replicas, and the Deployment controller creates the pods."
  - q: The HPA scaled to 30 replicas but 12 are Pending. What is missing?
    options: ["A higher maxReplicas", "Node capacity: a node autoscaler (Cluster Autoscaler or Karpenter) has to add nodes for the Pending pods", "A restart of the HPA"]
    answer: 1
    explain: "The HPA only creates pod objects. If their requests do not fit on existing nodes, they stay Pending until a node autoscaler provisions nodes, which takes minutes."
  - q: Why does the HPA need resource requests on the target's containers to scale on CPU utilisation?
    options: ["It does not", "Utilisation is computed as usage divided by request; without a request there is nothing to divide by", "Requests are needed for metrics-server to run"]
    answer: 1
    explain: "For Utilization targets the HPA computes usage as a percentage of the container requests. Pods without requests make the metric undefined and the HPA cannot act."
links:
  - { title: "Horizontal Pod Autoscaling (kubernetes.io)", url: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/" }
  - { title: "Node autoscaling (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/cluster-administration/node-autoscaling/" }
  - { title: "Vertical Pod Autoscaling (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/autoscaling/vertical-pod-autoscale/" }
---
Kubernetes scales in two layers. The **HorizontalPodAutoscaler** (HPA) changes how many replicas a Deployment or StatefulSet has, based on metrics. A **node autoscaler** (Cluster Autoscaler or Karpenter) changes how many machines the cluster has, based on whether pods fit. Neither looks at the other directly; they meet through Pending pods and resource requests.

## The HPA loop

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70     # percent of the CPU *request*
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # the default, written out
```

The HPA controller runs every 15 seconds by default. For each metric it computes

```text
desiredReplicas = ceil( currentReplicas x currentMetricValue / desiredMetricValue )
```

and takes the largest result across metrics, clamped to `minReplicas` and `maxReplicas`. If the ratio is within the tolerance (10% by default), it does nothing, which prevents constant small adjustments. For scale-down it uses the highest recommendation from the stabilization window (300 seconds by default), so a short dip does not remove pods that a returning spike needs.

Resource metrics (CPU, memory) come from the `metrics.k8s.io` API, usually provided by the metrics-server add-on, which has to be installed. Custom or external metrics (requests per second, queue length) come from adapters such as the Prometheus Adapter or KEDA.

## Making HPA work well

- **Requests must be right.** Utilisation is usage divided by request. If the request is double the real need, 70% target means 35% of what the pod can do, and you over-provision; if too low, you scale late.
- **Choose a metric that leads.** CPU is fine for CPU-bound services. For queue workers, scale on queue depth or lag; for I/O-bound APIs, requests per second or concurrency per pod.
- **Start-up time is reaction time.** Scaling takes the metric delay, plus scheduling, plus image pull, plus application start and readiness. Keep a `minReplicas` floor that survives the first minutes of a spike.
- **Do not fight it.** Remove `replicas` from the Deployment manifest you apply (or ignore it in GitOps), or every deploy resets the count chosen by the HPA.
- **Memory is a poor scaling signal** for most runtimes, which keep memory after load drops; pods scale up and never come down.

## Adding nodes

When pods are Pending because no node has room for their requests, a node autoscaler provisions capacity:

- **Cluster Autoscaler** grows and shrinks predefined node groups (cloud auto-scaling groups).
- **Karpenter** chooses instance types per batch of pending pods and launches nodes directly.

Both, according to the Kubernetes docs, are sponsored by SIG Autoscaling and also remove or consolidate underused nodes by evicting their pods, which is where PodDisruptionBudgets and graceful shutdown matter again. A new node takes minutes, not seconds, so node scaling is for sustained growth; bursts are absorbed by headroom.

## Vertical scaling

The Vertical Pod Autoscaler recommends (or applies) requests based on observed usage. Do not let VPA and HPA act on the same CPU or memory metric for one workload; they will fight. With in-place pod resize stable since 1.35, VPA can apply new values with fewer pod restarts.
