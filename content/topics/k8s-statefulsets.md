---
id: k8s-statefulsets
title: StatefulSets and persistent volumes
summary: Stable names and their own disk for each replica
why: "Databases, queues and anything clustered need replicas that keep their identity and data across restarts. That is what StatefulSets add over Deployments, and also where the sharp edges are."
requires: [k8s-deployments, docker-volumes]
lesson: none
points:
  - title: Storage has its own lifecycle
    text: "A PersistentVolumeClaim asks for storage; a StorageClass provisions a PersistentVolume for it. Pods come and go; claims stay."
  - title: Sticky identity
    text: "StatefulSet pods are named db-0, db-1, db-2, keep those names when replaced, and get stable DNS names through a headless Service."
  - title: One claim per replica
    text: "volumeClaimTemplates create a separate PVC for each pod (data-db-0, ...), and a replaced pod reattaches to its own."
  - title: Ordered and careful
    text: "Pods are created in order and, by default, PVCs are kept when you scale down or delete the StatefulSet."
quiz_hint: Separate the pod (replaceable) from the claim and volume (kept), and remember that names are part of the identity.
quiz:
  - q: Pod db-1 of a StatefulSet is deleted. What comes back?
    options: ["A pod with a random name and a new empty volume", "A pod named db-1 that reattaches the PVC data-db-1", "Nothing until you scale the StatefulSet"]
    answer: 1
    explain: "The StatefulSet controller recreates the same ordinal, and the volume claim template maps it to the same claim, so it finds its old data."
  - q: You scale a StatefulSet from 3 to 2 replicas. What happens to the PVC data-db-2 by default?
    options: ["It is deleted with the pod", "It is retained, so scaling back up reattaches the data (and you pay for the disk meanwhile)", "It is attached to db-1"]
    answer: 1
    explain: "The default persistentVolumeClaimRetentionPolicy is Retain for both whenScaled and whenDeleted. Set it to Delete if you want claims cleaned up, knowing the data goes with them."
  - q: What does the headless Service (clusterIP None) give a StatefulSet?
    options: ["A load-balanced virtual IP", "DNS records for each pod, such as db-0.db.shop.svc.cluster.local", "Encryption between pods"]
    answer: 1
    explain: "Members of a database cluster need to address specific peers (the primary, a given replica). The headless Service publishes a stable DNS name per pod."
links:
  - { title: "StatefulSets (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/" }
  - { title: "Persistent volumes (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/storage/persistent-volumes/" }
  - { title: "Storage classes (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/storage/storage-classes/" }
---
Deployment pods are interchangeable: random names, no storage of their own, any of them can go. Stateful systems need the opposite. A StatefulSet gives each replica a stable ordinal name (`db-0`, `db-1`, ...), a stable DNS name, and its own persistent volume that follows it when the pod is replaced. Underneath sits Kubernetes' storage model, in which disks have a lifecycle independent of pods.

## Storage: claims, volumes and classes

- A **PersistentVolumeClaim** (PVC) is a request: "20 GiB of `fast-ssd`, mountable by one pod".
- A **StorageClass** describes how to provision such storage (a cloud disk type, a CSI driver, parameters, reclaim policy).
- A **PersistentVolume** (PV) is the actual disk, usually created on demand by the class's provisioner and bound to the claim.

A pod mounts the claim by name. If the pod is deleted, the claim and its data stay. Access modes matter: most block storage is `ReadWriteOnce` (one node at a time), and the Kubernetes docs recommend `ReadWriteOncePod` (one pod) for single-writer workloads.

## A StatefulSet

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None            # headless: DNS names for each pod, no virtual IP
  selector:
    app: db
  ports:
    - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db
  replicas: 3
  selector:
    matchLabels:
      app: db
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain
    whenScaled: Retain
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: postgres
          image: postgres:17
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOncePod"]
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 20Gi
```

This produces pods `db-0`, `db-1` and `db-2`, claims `data-db-0` to `data-db-2`, and DNS names such as `db-0.db.shop.svc.cluster.local`. By default pods are created one at a time in order (each must be ready before the next starts) and removed in reverse order; `podManagementPolicy: Parallel` relaxes that. Rolling updates also go from the highest ordinal down. The headless Service has to exist; you create it yourself.

## What StatefulSets do not do

A StatefulSet gives identity and storage, not database expertise. It does not know which replica is the primary, how to replicate data, how to fail over, or how to back up. Running Postgres with three StatefulSet replicas gives you three unrelated databases unless the software (or an operator, such as CloudNativePG for Postgres) sets up replication. For many teams a managed database is the better choice; for those running their own, use an operator.

## Sharp edges

- **Retained claims cost money.** By default PVCs survive scale-down and deletion (`Retain`), which protects data but leaves disks behind. `persistentVolumeClaimRetentionPolicy` (stable since 1.32) can set `Delete` per case.
- **Volumes live in one zone.** A pod bound to a zonal disk can only be rescheduled in that zone; use `volumeBindingMode: WaitForFirstConsumer` in the StorageClass so the disk is created where the pod is scheduled.
- **Stuck rollouts.** With the default `OrderedReady` policy, a broken pod blocks the update; after fixing the template you may have to delete that pod by hand.
- **Graceful shutdown matters more.** Give databases a `terminationGracePeriodSeconds` long enough to checkpoint, and PodDisruptionBudgets so node drains never take a quorum away.
