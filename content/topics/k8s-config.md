---
id: k8s-config
title: ConfigMaps and Secrets
summary: Configuration outside the image, and how safe it is
why: "One image should run in every environment, so configuration has to come from outside. Secrets look protected, but by default they are only base64 in etcd, readable by anyone with the right API access."
requires: [k8s-pods]
lesson: diagram
points:
  - title: Same image, different config
    text: "ConfigMaps hold non-secret settings; pods consume them as environment variables or as files in a volume."
  - title: Secrets are base64, not encrypted
    text: "By default Secrets are stored unencrypted in etcd. base64 is an encoding for binary data, not protection."
  - title: Access is the real protection
    text: "Anyone who can read Secrets through the API, or create a pod in the namespace, can get their values. Lock that down with RBAC."
  - title: Files update, env vars do not
    text: "Mounted ConfigMaps and Secrets are refreshed eventually; environment variables are fixed until the pod restarts."
quiz_hint: Ask who can read the value and when the pod would notice a change.
quiz:
  - q: "A Secret's data field shows cG9zdGdyZXM6Ly8uLi4=. How protected is the value?"
    options: ["It is encrypted with the cluster key", "It is only base64-encoded; anyone who can read the Secret can decode it", "It can only be decoded by the pod"]
    answer: 1
    explain: "base64 is reversible by anyone (base64 -d). Protection comes from RBAC, encryption at rest configured on the API server, and limiting who can create pods."
  - q: You update a ConfigMap that a running pod consumes with envFrom. When does the app see the new values?
    options: ["Within a minute", "Only after the pod is restarted or replaced", "Immediately"]
    answer: 1
    explain: "Environment variables are set when the container starts. Mounted files are refreshed eventually (except subPath mounts). Many teams change the ConfigMap's name or a template annotation to trigger a rollout."
  - q: "Why can a developer with permission to create pods in a namespace read every Secret in it, even without 'get secrets'?"
    options: ["They cannot", "They can start a pod that mounts any Secret in the namespace and print it", "Secrets are public inside a namespace"]
    answer: 1
    explain: "The Kubernetes docs warn that anyone authorized to create a pod in a namespace can use that access to read any Secret in it. Treat create-pod as secret-read."
links:
  - { title: "ConfigMaps (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/configuration/configmap/" }
  - { title: "Secrets (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/configuration/secret/" }
  - { title: "Encrypting confidential data at rest (kubernetes.io)", url: "https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/" }
  - { title: "Good practices for Kubernetes Secrets (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/security/secrets-good-practices/" }
---
The same image should run in development, staging and production, which means settings must come from outside it. Kubernetes has two objects for that: ConfigMaps for ordinary configuration and Secrets for sensitive values. Both are key-value maps stored through the API server, and a pod can consume them as environment variables or as files in a mounted volume. The difference in protection between them is smaller than the names suggest.

## Consuming configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  LOG_LEVEL: info
  features.json: |
    { "newCheckout": false }
---
apiVersion: v1
kind: Secret
metadata:
  name: web-db
type: Opaque
stringData:                       # plain text in; stored base64-encoded
  DATABASE_URL: postgres://web:s3cret@db:5432/shop
---
apiVersion: v1
kind: Pod
metadata:
  name: web-config-demo
spec:
  containers:
    - name: app
      image: ghcr.io/acme/web:1.4.2
      envFrom:
        - configMapRef: { name: web-config }       # every key as an env var
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef: { name: web-db, key: DATABASE_URL }
      volumeMounts:
        - { name: config, mountPath: /etc/web, readOnly: true }
  volumes:
    - name: config
      configMap:
        name: web-config
        items:
          - { key: features.json, path: features.json }   # /etc/web/features.json
```

**Updates.** Environment variables are read once at container start, so changing the ConfigMap does nothing until the pod is replaced. Mounted files are refreshed by the kubelet after a delay (its sync period plus cache propagation), except for `subPath` mounts, which never update. A common pattern is to roll the Deployment when config changes, for example by putting a hash of the config in a pod-template annotation, which tools such as Helm and Kustomize can generate. Marking a ConfigMap or Secret `immutable: true` protects it from accidental edits and reduces load on the API server.

## What "Secret" does and does not mean

```sh
kubectl get secret web-db -o jsonpath='{.data.DATABASE_URL}' | base64 -d
# postgres://web:s3cret@db:5432/shop
```

The Kubernetes documentation is explicit: Secrets are by default stored unencrypted in etcd; anyone with API access to them can read or modify them, so can anyone with access to etcd, and anyone allowed to create a pod in a namespace can use it to read any Secret in that namespace. What Secrets do give you over ConfigMaps is separate RBAC, delivery to pods via tmpfs rather than node disk, and a type that tools know to redact.

To make them actually safe:

- **Enable encryption at rest** on the API server (an `EncryptionConfiguration`, ideally with a KMS provider). Managed clusters often do this for you; check.
- **Restrict RBAC**: few humans need `get` or `list` on Secrets, and `list` returns every value. Remember that create-pod implies secret-read in that namespace.
- **Keep them out of git** in plain form. Use an external secrets manager with the External Secrets Operator or the Secrets Store CSI driver, or encrypt them in git with Sealed Secrets or SOPS.
- **Prefer files to environment variables** for secrets: environment variables leak into crash dumps, child processes and debug output more easily.
- **Rotate**: a mounted Secret updates in place, so an app that rereads its credentials file can rotate without a restart.

```trace diagram
id: config-into-pod
title: How a ConfigMap and a Secret reach the app
subtitle: As environment variables or as files
elements:
  - { id: cm, label: ConfigMap web-config, sub: "LOG_LEVEL, features.json", row: 0 }
  - { id: secret, label: Secret web-db, sub: DATABASE_URL, tone: external, row: 0 }
  - { id: api, label: kube-apiserver, sub: RBAC on every read, kind: system, row: 1 }
  - { id: etcd, label: etcd, sub: "Secrets: base64, not encrypted by default", kind: store, row: 2 }
  - { id: kubelet, label: kubelet, sub: on the pod's node, row: 2 }
  - { id: env, label: Environment variables, sub: set once at start, tone: neutral, row: 3 }
  - { id: files, label: Mounted files, sub: "/etc/web, refreshed", tone: stream, row: 3 }
  - { id: app, label: app container, kind: person, row: 4 }
edges:
  - { id: cm-in, from: cm, to: api }
  - { id: sec-in, from: secret, to: api }
  - { id: store, from: api, to: etcd }
  - { id: fetch, from: api, to: kubelet, label: what the pod references }
  - { id: to-env, from: kubelet, to: env, label: "envFrom, secretKeyRef" }
  - { id: to-files, from: kubelet, to: files, label: volume }
  - { id: read-env, from: env, to: app }
  - { id: read-files, from: files, to: app }
steps:
  - caption: "One image should run in every environment, so settings come from outside it. ConfigMaps hold ordinary settings and Secrets hold sensitive ones."
  - caption: "Both are plain API objects stored in etcd. A Secret's values are only base64-encoded, and stored unencrypted unless the API server has encryption at rest configured."
    focus: [cm, secret, api, etcd]
    trace: [cm-in, sec-in, store]
  - caption: The kubelet fetches the ConfigMaps and Secrets that its pods reference.
    focus: [api, kubelet]
    trace: [fetch]
  - caption: "As environment variables, the values are read once, when the container starts. Changing the ConfigMap does nothing until the pod is replaced."
    focus: [kubelet, env, app]
    trace: [to-env, read-env]
  - caption: "As a volume, each key becomes a file such as /etc/web/features.json. Secret volumes live in tmpfs, in memory, not on the node's disk."
    focus: [kubelet, files, app]
    trace: [to-files, read-files]
  - caption: "Edit the ConfigMap and the mounted files are refreshed after a delay, except subPath mounts, which never update. The environment variables stay the same."
    focus: [cm, files, env]
  - caption: "So many teams roll the Deployment when config changes, for example with a hash of the config in a pod-template annotation. Helm and Kustomize can generate it."
    focus: [cm, app]
  - caption: "Anyone who can get the Secret through the API can decode it, and so can anyone allowed to create a pod in the namespace: the pod just mounts it. Lock both down with RBAC."
    focus: [secret, api]
  - caption: "Prefer files to environment variables for secrets, since env leaks into dumps and child processes more easily. Keep plain secrets out of git."
    focus: [files, env]
```
