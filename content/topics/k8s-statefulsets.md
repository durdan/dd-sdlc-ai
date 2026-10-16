---
id: k8s-statefulsets
title: StatefulSets and persistent volumes
summary: Stable names and their own disk for each replica
why: "Databases, queues and anything clustered need replicas that keep their identity and data across restarts. That is what StatefulSets add over Deployments, and also where the sharp edges are."
requires: [k8s-deployments, docker-volumes]
lesson: diagram
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

```trace diagram
id: sticky-identity
title: "StatefulSet db: names, DNS and a disk each"
subtitle: "replicas: 3, volumeClaimTemplates: data"
elements:
  - { id: sts, label: StatefulSet db, sub: "replicas: 3", kind: system, row: 0, role: service }
  - { id: hsvc, label: Service db, sub: "headless: clusterIP None", tone: neutral, row: 0, role: edge }
  - { id: p0, label: db-0, sub: db-0.db.shop.svc, row: 1 }
  - { id: p1, label: db-1, sub: db-1.db.shop.svc, row: 1 }
  - { id: p2, label: db-2, sub: db-2.db.shop.svc, row: 1 }
  - { id: c0, label: PVC data-db-0, sub: 20Gi, kind: store, row: 2 }
  - { id: c1, label: PVC data-db-1, sub: 20Gi, kind: store, row: 2 }
  - { id: c2, label: PVC data-db-2, sub: 20Gi, kind: store, row: 2 }
  - { id: sc, label: StorageClass fast-ssd, sub: provisions a disk per claim, tone: data, row: 3, role: service }
edges:
  - { id: make0, from: sts, to: p0, label: "1st" }
  - { id: make1, from: sts, to: p1, label: "2nd" }
  - { id: make2, from: sts, to: p2, label: "3rd" }
  - { id: dns0, from: hsvc, to: p0, style: dotted, flow: main }
  - { id: dns1, from: hsvc, to: p1, style: dotted, flow: main }
  - { id: dns2, from: hsvc, to: p2, style: dotted, flow: main }
  - { id: mount0, from: p0, to: c0 }
  - { id: mount1, from: p1, to: c1 }
  - { id: mount2, from: p2, to: c2 }
  - { id: pv0, from: c0, to: sc, style: dashed, flow: main }
  - { id: pv1, from: c1, to: sc, style: dashed, flow: main }
  - { id: pv2, from: c2, to: sc, style: dashed, flow: main }
steps:
  - caption: "Deployment pods are interchangeable. A StatefulSet gives each replica a stable name, a stable DNS name and its own disk, which outlive any one pod."
  - caption: "Pods are created in order. db-0 must be running and ready before db-1 starts, and db-1 before db-2."
    focus: [sts, p0, p1, p2]
    trace: [make0, make1, make2]
  - caption: "volumeClaimTemplates give each pod its own PersistentVolumeClaim, named after it: data-db-0 for db-0."
    focus: [p0, p1, p2, c0, c1, c2]
    trace: [mount0, mount1, mount2]
  - caption: "The StorageClass provisions a PersistentVolume for each claim. With WaitForFirstConsumer, the disk is created in the zone where the pod was scheduled."
    focus: [c0, c1, c2, sc]
    trace: [pv0, pv1, pv2]
  - caption: "The headless Service, which you create yourself, has no virtual IP. It publishes one DNS name per pod, so a member can reach a specific peer such as db-0."
    focus: [hsvc, p0, p1, p2]
    trace: [dns0, dns1, dns2]
  - caption: "Delete db-1 and the controller recreates a pod with the same name. It mounts the same claim, data-db-1, and finds its old data."
    focus: [sts, p1, c1]
    trace: [make1, mount1]
  - caption: "Scale to 2 and db-2 goes first, in reverse order. By default its claim data-db-2 is retained, so scaling back up gets the data back, and you keep paying for the disk."
    focus: [p2, c2]
  - caption: "Rolling updates also go from the highest ordinal down. With the default OrderedReady policy, one broken pod blocks the rest."
    focus: [p2, p1, p0]
  - caption: "A StatefulSet gives identity and storage, not replication or failover. Three Postgres pods are three separate databases unless the software or an operator joins them."
    focus: [p0, p1, p2]
```
