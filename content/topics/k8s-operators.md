---
id: k8s-operators
title: "Operators and custom resources"
summary: Your own object types, with a controller that runs them
why: "Databases, certificates, message queues and GitOps tools all arrive in clusters as operators. Knowing they are just CRDs plus a control loop tells you how to use, debug and judge them."
requires: [k8s-control-loop, k8s-statefulsets]
lesson: diagram
points:
  - title: A CRD adds a new kind
    text: "A CustomResourceDefinition teaches the API server a new type, with a schema; kubectl, RBAC and watches then work on it like any built-in object."
  - title: A controller gives it meaning
    text: "Without a controller a custom resource is only stored data. The controller watches it and reconciles the world to match its spec."
  - title: An operator encodes operations
    text: "An operator is a controller with domain knowledge: provisioning, failover, backups, upgrades for one kind of software."
  - title: It runs with power
    text: "Operators often hold broad RBAC rights across the cluster; choose maintained ones and review what they can do."
quiz_hint: Split the idea into the API part (what is stored) and the loop part (what acts on it).
quiz:
  - q: You install only the CRD for backups.example.com, not its controller, and create a Backup object. What happens?
    options: ["The backup runs on schedule", "The object is validated and stored, and nothing else happens", "The API server rejects the object"]
    answer: 1
    explain: "A CRD extends the API, so the object is accepted and can be read and watched. Behaviour comes only from a controller that watches Backups."
  - q: What does a controller do on each reconcile?
    options: ["Replays every event since the object was created", "Reads the current spec and the actual state, makes changes to close the gap, and writes status", "Deletes and recreates the object"]
    answer: 1
    explain: "Reconcilers are level-triggered: they look at the state now, so they recover from missed events and restarts. Writing status lets kubectl get show progress."
  - q: Why prefer an operator such as CloudNativePG over a bare StatefulSet for Postgres?
    options: ["StatefulSets cannot mount volumes", "The operator handles replication, failover, backups and upgrades, which a StatefulSet knows nothing about", "Operators do not need storage"]
    answer: 1
    explain: "A StatefulSet provides identity and storage. Running a database also needs the procedures a DBA would follow, and an operator automates those."
links:
  - { title: "Operator pattern (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/" }
  - { title: "Custom resources (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/" }
  - { title: "Controllers (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/architecture/controller/" }
---
Everything built into Kubernetes follows one pattern: an API type that stores desired state, and a controller that reconciles reality to match it. Custom resources let you add your own types to the API, and an operator is a controller for such a type that encodes how to run a particular piece of software: creating a database cluster, failing over, taking backups, rotating certificates, upgrading safely. It is the same control loop as a Deployment, applied to your domain.

## Step 1: a new type

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: backups.example.com
spec:
  group: example.com
  scope: Namespaced
  names:
    kind: Backup
    plural: backups
    singular: backup
  versions:
    - name: v1
      served: true
      storage: true
      subresources:
        status: {}
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              required: [database, schedule]
              properties:
                database: { type: string }
                schedule: { type: string }
                keep: { type: integer, minimum: 1 }
            status:
              type: object
              properties:
                lastSuccess: { type: string, format: date-time }
```

Once the CRD is applied, the API server serves `/apis/example.com/v1/namespaces/*/backups`. Objects are validated against the schema, stored in etcd, can be listed and watched, and are covered by RBAC like everything else:

```yaml
apiVersion: example.com/v1
kind: Backup
metadata:
  name: shop-nightly
spec:
  database: db
  schedule: "0 2 * * *"
  keep: 7
```

```sh
kubectl get backups
```

## Step 2: a controller

So far nothing happens: a custom resource is just data. The behaviour lives in a controller, usually a Deployment in the cluster built with a framework such as Kubebuilder or controller-runtime (Go), the Operator SDK, or kopf (Python). Its core is a reconcile function, called whenever a watched object changes and periodically:

```text
reconcile(backup):
  desired = backup.spec                         # what the user asked for
  actual  = look at the CronJob, the bucket, recent runs
  if the CronJob is missing or differs: create or update it
  delete backups beyond spec.keep
  write backup.status.lastSuccess               # report what was observed
```

Good reconcilers are idempotent (running twice changes nothing more), level-triggered (they act on the current state, not on a sequence of events), and set owner references on what they create, so deleting the Backup garbage-collects its CronJob. Finalizers let a controller clean up external resources, such as a cloud bucket, before the object disappears.

## Operators you will meet

- **cert-manager**: `Certificate` objects become TLS secrets that renew themselves.
- **Database operators** such as CloudNativePG or the operators for MySQL, Kafka (Strimzi) and Redis: a `Cluster` object becomes StatefulSets, Services, replication, failover and backups.
- **Argo CD and Flux**: `Application` or `Kustomization` objects keep the cluster in sync with git.
- **Prometheus Operator**: `ServiceMonitor` objects become scrape configuration.
- Gateway API itself ships as CRDs with controllers from each implementation.

## Judging an operator

An operator is privileged automation running inside your cluster, often with cluster-wide rights. Before adopting one, check that it is maintained and widely used, what RBAC it requests, how it upgrades its own CRDs, and what happens to your data if you uninstall it. When writing one, keep the scope small: if a Helm chart or a CronJob does the job, you may not need a controller at all.

```trace diagram
id: backup-operator
title: A Backup resource and its controller
subtitle: The API part stores it; the loop part acts on it
elements:
  - { id: crd, label: CustomResourceDefinition, sub: backups.example.com, tone: neutral, row: 0 }
  - { id: you, label: kubectl apply, sub: "Backup shop-nightly, keep: 7", kind: person, row: 0 }
  - { id: api, label: kube-apiserver, sub: "schema, RBAC, watches", kind: system, row: 1 }
  - { id: etcd, label: etcd, kind: store, row: 2 }
  - { id: ctrl, label: Backup controller, sub: runs as a Deployment, tone: stream, row: 2 }
  - { id: cron, label: CronJob, sub: owned by the Backup, row: 3 }
  - { id: bucket, label: Backup bucket, sub: outside the cluster, kind: external, row: 3 }
edges:
  - { id: teach, from: crd, to: api }
  - { id: create, from: you, to: api }
  - { id: store, from: api, to: etcd }
  - { id: watch, from: api, to: ctrl }
  - { id: ensure, from: ctrl, to: cron, label: create or update }
  - { id: prune, from: ctrl, to: bucket, label: delete beyond keep }
steps:
  - caption: "Built-in Kubernetes is API types that store desired state plus controllers that reconcile reality. An operator applies the same pattern to your own types."
  - caption: "A CustomResourceDefinition teaches the API server a new kind, Backup, with a schema. The server now serves /apis/example.com/v1 for it."
    focus: [crd, api]
    trace: [teach]
  - caption: "You apply a Backup like any object. It is validated against the schema, stored in etcd and covered by RBAC, and kubectl get backups lists it."
    focus: [you, api, etcd]
    trace: [create, store]
  - caption: "With only the CRD installed, nothing else happens. A custom resource is just stored data until a controller acts on it."
    focus: [api, etcd]
  - caption: "The controller watches Backups. Its reconcile function runs whenever one changes, and periodically too."
    focus: [api, ctrl]
    trace: [watch]
  - caption: "Reconcile compares spec with what exists. If the CronJob is missing or differs, it creates or updates it, with an owner reference so deleting the Backup removes it."
    focus: [ctrl, cron]
    trace: [ensure]
  - caption: "It also deletes backups beyond keep. A finalizer lets it clean up the bucket before a deleted Backup disappears."
    focus: [ctrl, bucket]
    trace: [prune]
  - caption: "Finally it writes status.lastSuccess. Good reconcilers are idempotent and level-triggered, so a missed event or a restart changes nothing."
    focus: [ctrl, api]
  - caption: "Real operators encode a whole job. CloudNativePG turns a Cluster object into pods, Services, replication, failover and backups. Check what RBAC an operator asks for before you install it."
    focus: [crd, ctrl]
```
