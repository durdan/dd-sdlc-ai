---
id: k8s-probes
title: "Probes: liveness, readiness and startup"
summary: Restart it, route around it, or wait for it
why: "Probes are how Kubernetes decides to restart a container or stop sending it traffic. Configured badly, they turn a slow database into a cluster-wide restart storm."
requires: [k8s-deployments, k8s-services]
lesson: none
points:
  - title: Liveness restarts
    text: "If the liveness probe fails failureThreshold times in a row, the kubelet kills and restarts the container."
  - title: Readiness routes
    text: "A failing readiness probe removes the pod from Service endpoints. The container keeps running, and returns to traffic when the probe passes."
  - title: Startup waits
    text: "A startup probe holds off liveness and readiness until it succeeds once, giving slow starters time without weakening liveness."
  - title: Liveness must be local
    text: "Never make liveness depend on a database or another service: when that dependency is slow, every replica is restarted at once."
quiz_hint: For each probe, ask what Kubernetes does when it fails, and what that action would achieve.
quiz:
  - q: "Your liveness probe calls /health, which checks the database. The database is slow for two minutes. What happens?"
    options: ["Nothing; Kubernetes waits for the database", "Every replica fails liveness and is restarted, adding cold starts and reconnection storms to the original problem", "Only one replica restarts"]
    answer: 1
    explain: "Restarting the app does not fix the database. Liveness should check only whether this process is stuck. Report dependency trouble through readiness, or better, handle it in the app."
  - q: A Java service needs up to 3 minutes to start. What is the right fix for liveness restarts during start-up?
    options: ["Set liveness initialDelaySeconds to 300", "Add a startup probe whose failureThreshold x periodSeconds covers 3 minutes", "Remove the liveness probe"]
    answer: 1
    explain: "A startup probe disables the other probes until it succeeds once, so liveness can stay strict afterwards. A long initial delay also delays detection of real hangs on every start."
  - q: What are the default probe timing values?
    options: ["periodSeconds 10, timeoutSeconds 1, failureThreshold 3", "periodSeconds 1, timeoutSeconds 10, failureThreshold 1", "periodSeconds 30, timeoutSeconds 5, failureThreshold 5"]
    answer: 0
    explain: "By default a probe runs every 10 seconds, times out after 1 second and needs 3 consecutive failures. A 1-second timeout is tight for an endpoint that does real work."
links:
  - { title: "Liveness, readiness and startup probes (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/" }
  - { title: "Configure liveness, readiness and startup probes (kubernetes.io)", url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/" }
  - { title: "Pod lifecycle: container probes and termination (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/" }
---
The kubelet can check each container in three ways, and each check has a different consequence. A **liveness** probe that keeps failing gets the container killed and restarted. A **readiness** probe that fails takes the pod out of Service endpoints, so it gets no new traffic, without touching the container. A **startup** probe suspends the other two until the application has started. Getting these right is the difference between self-healing and self-harm.

## A sensible configuration

```yaml
containers:
  - name: app
    image: ghcr.io/acme/web:1.4.2
    ports:
      - { name: http, containerPort: 3000 }
    startupProbe:              # up to 30 x 5 s = 150 s to start; the others wait for it
      httpGet: { path: /healthz, port: http }
      periodSeconds: 5
      failureThreshold: 30
    readinessProbe:            # failing = taken out of the Service, not restarted
      httpGet: { path: /ready, port: http }
      periodSeconds: 5
      failureThreshold: 2
    livenessProbe:             # failing = container restarted; keep it cheap and local
      httpGet: { path: /healthz, port: http }
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3
```

Probes can be `httpGet` (any 2xx or 3xx status passes), `tcpSocket`, `grpc` or `exec`. The defaults are `periodSeconds: 10`, `timeoutSeconds: 1`, `failureThreshold: 3`, `successThreshold: 1` and `initialDelaySeconds: 0`. Without a readiness probe, a container counts as ready as soon as it starts.

## What each endpoint should check

- **`/healthz` (liveness)**: "is this process able to make progress?" Return 200 if the event loop or request threads respond. Do not check the database, the cache or other services. If the database is down, restarting your app will not bring it back, and if all replicas share the dependency, all of them restart together.
- **`/ready` (readiness)**: "should I get traffic right now?" False while warming caches, during shutdown, or when the pod is overloaded. Be careful here too with shared dependencies: if every pod reports not-ready because the database is slow, the Service has no endpoints and every request fails fast with nothing behind it. Often it is better to stay ready and return errors or degraded responses.
- **Startup**: the same check as liveness, with a budget (`failureThreshold x periodSeconds`) that covers the slowest realistic start.

## How bad probes cause outages

- **Liveness checks a dependency**: a database blip becomes a fleet-wide restart, followed by a reconnection storm that keeps the database down.
- **Timeout too tight**: under load, a probe that usually takes 50 ms takes 1.2 s, fails three times, and the busiest pods are restarted exactly when they are needed, pushing their load onto the others, which then fail too.
- **No startup probe for a slow starter**: liveness kills the container before it finishes starting, forever (`CrashLoopBackOff`).
- **Expensive probes**: a probe that runs a query every few seconds on every pod is load you created yourself.

## Probes and shutdown

When a pod is deleted, it is removed from endpoints and its containers receive SIGTERM at about the same time, and proxies on other nodes may take a moment to notice. Keep serving while you drain: fail readiness, keep handling in-flight and late-arriving requests for a few seconds, then exit. A short `preStop` hook (for example the built-in `sleep` action) is a common way to delay SIGTERM until endpoints have updated.
