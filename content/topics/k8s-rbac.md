---
id: k8s-rbac
title: "Namespaces, RBAC and network policies"
summary: Who may do what, and which pods may talk to which
why: "Out of the box every pod can talk to every other pod, and broad roles are easy to hand out. Namespaces, RBAC and NetworkPolicies are how one team's mistake, or one compromised pod, stays contained."
requires: [k8s-control-loop, k8s-services]
lesson: diagram
points:
  - title: Namespaces scope names and policy
    text: "A namespace is a scope for names, RBAC, quotas and network policies. It is not by itself a security boundary."
  - title: RBAC only allows
    text: "Roles list allowed verbs on resources; bindings grant them to users, groups or service accounts. There are no deny rules."
  - title: Pods have identities too
    text: "Each pod runs as a ServiceAccount; give it only the API access it needs, and none if it needs none."
  - title: The network is open by default
    text: "Until a NetworkPolicy selects a pod, all traffic to and from it is allowed. Policies only work if the network plugin enforces them."
quiz_hint: Both RBAC and NetworkPolicies start from a default and only ever add permissions.
quiz:
  - q: A user has a ClusterRole that allows deleting pods. Can you add a Role that denies it in one namespace?
    options: ["Yes, with a deny rule", "No: RBAC permissions are purely additive, so you have to narrow the original binding", "Yes, by binding an empty Role"]
    answer: 1
    explain: "RBAC has no deny rules; the effective permission is the union of all bindings. Use namespaced RoleBindings instead of cluster-wide ones, and admission policies for finer rules."
  - q: You apply a NetworkPolicy that allows only app=web to reach app=db on 5432, but other pods can still connect. What is the likely cause?
    options: ["NetworkPolicies need a restart", "The cluster's network plugin does not enforce NetworkPolicy", "Ports cannot be restricted"]
    answer: 1
    explain: "The Kubernetes docs say your cluster must use a network plugin that supports NetworkPolicy enforcement. Without one, the objects are accepted and silently do nothing."
  - q: "What does a NetworkPolicy with podSelector: {} and policyTypes: [Ingress] and no ingress rules do?"
    options: ["Allows everything", "Denies all incoming traffic to every pod in its namespace, unless another policy allows it", "Deletes pods without labels"]
    answer: 1
    explain: "An empty selector selects every pod, and an Ingress policy with no rules allows nothing, so all inbound traffic is denied. Policies are additive, so later ones open specific paths."
links:
  - { title: "Namespaces (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/" }
  - { title: "Using RBAC authorization (kubernetes.io)", url: "https://kubernetes.io/docs/reference/access-authn-authz/rbac/" }
  - { title: "Network policies (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/" }
---
A fresh cluster is permissive in two ways. On the network, every pod can reach every other pod in every namespace. In the API, whoever holds a powerful credential can change anything. Namespaces give you units to divide the cluster into, RBAC decides which identities may perform which API actions in them, and NetworkPolicies decide which pods may open connections to which. All three default to open and work by adding allowances, so the usual approach is to deny broadly and then allow narrowly.

## Namespaces

A namespace scopes object names (two teams can each have a `web` Deployment) and is the unit for RoleBindings, ResourceQuotas, LimitRanges, NetworkPolicies and Pod Security admission labels. Nodes, PersistentVolumes, StorageClasses and ClusterRoles are cluster-wide. A namespace alone isolates nothing; the policies attached to it do.

## RBAC: allow lists for the API

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: deployer
  namespace: shop
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deploy-web
  namespace: shop
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "patch"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-deploy-web
  namespace: shop
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: shop
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deploy-web
```

```sh
kubectl auth can-i patch deployments -n shop --as system:serviceaccount:shop:deployer
# yes
kubectl auth can-i get secrets -n shop --as system:serviceaccount:shop:deployer
# no
```

A **Role** is namespaced; a **ClusterRole** is cluster-wide or reusable across namespaces. Permissions are purely additive; there are no deny rules. Habits that matter:

- Grant to groups and service accounts through namespaced RoleBindings, not ClusterRoleBindings.
- Be careful with `secrets` (`list` returns the values), `pods/exec`, and the ability to create pods or workloads, which implies reading the namespace's Secrets and running code as any of its service accounts.
- Give each workload its own ServiceAccount. If it does not call the API, set `automountServiceAccountToken: false`.

## NetworkPolicies: allow lists for traffic

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: shop
spec:
  podSelector: {}            # every pod in the namespace
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-from-web
  namespace: shop
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: web
      ports:
        - port: 5432
```

A pod is isolated for ingress (or egress) as soon as any policy selects it for that direction; then only traffic some policy allows gets through. The first policy above denies all inbound traffic in `shop`; the second lets `web` pods reach `db` on 5432. If you add egress policies, remember to allow DNS to the cluster DNS service, or every name lookup fails.

Enforcement is done by the network plugin (Calico, Cilium and most managed-cluster defaults support it). If the plugin does not support NetworkPolicy, the objects are accepted and ignored, so test that a blocked connection is really blocked.

## Beyond these three

Pod Security admission (labels such as `pod-security.kubernetes.io/enforce: restricted` on a namespace) rejects privileged or root pods. Policy engines (Kyverno, Gatekeeper, or the built-in ValidatingAdmissionPolicy) add rules RBAC cannot express. Separate namespaces still share nodes and a kernel; tenants that must not trust each other need separate node pools or clusters.

```trace diagram
id: api-request
title: Can the deployer patch this Deployment?
subtitle: One API request through authentication, RBAC and admission
elements:
  - { id: caller, label: ServiceAccount deployer, sub: "namespace shop, bearer token", kind: person, row: 0 }
  - { id: authn, label: Authentication, sub: fails with 401, row: 1, role: security }
  - { id: authz, label: "Authorization (RBAC)", sub: fails with 403, kind: system, row: 2, role: security }
  - { id: binding, label: RoleBinding, sub: deployer-deploy-web, tone: data, row: 2 }
  - { id: role, label: Role deploy-web, sub: "get, list, watch, patch deployments", tone: data, row: 3, role: security }
  - { id: admission, label: Admission, sub: "mutating, then validating", row: 3 }
  - { id: etcd, label: etcd, sub: validated and stored, kind: store, row: 4 }
edges:
  - { id: send, from: caller, to: authn, label: PATCH deployment web }
  - { id: who, from: authn, to: authz }
  - { id: lookup, from: authz, to: binding, flow: security }
  - { id: ref, from: binding, to: role, flow: security }
  - { id: allowed, from: authz, to: admission }
  - { id: persist, from: admission, to: etcd }
steps:
  - caption: "Every API call, from kubectl or from a pod, passes the same three gates in kube-apiserver before anything is stored."
  - caption: "A pod runs as a ServiceAccount, and its token is mounted into the pod. Here the deployer sends it as a bearer token with a PATCH to the Deployment web."
    focus: [caller, authn]
    trace: [send]
  - caption: "Authentication checks the token and turns it into a user, system:serviceaccount:shop:deployer, plus groups. A bad token is rejected with 401."
    focus: [authn, authz]
    trace: [who]
  - caption: "RBAC then looks for bindings to that subject. The RoleBinding in shop grants it the Role deploy-web."
    focus: [authz, binding, role]
    trace: [lookup, ref]
  - caption: "The Role lists verbs on resources. patch on deployments is there, so the request is allowed. get on secrets is not, so that would be a 403."
    focus: [role, authz]
  - caption: "RBAC only allows; there are no deny rules. Effective rights are the union of all bindings, so narrow a binding rather than trying to subtract from it."
    focus: [binding, role]
  - caption: "Admission comes next. Mutating controllers can fill in defaults, then validating ones such as Pod Security admission can still reject the request."
    focus: [authz, admission]
    trace: [allowed]
  - caption: Only then is the object validated against its schema and written to etcd.
    focus: [admission, etcd]
    trace: [persist]
  - caption: "Give each workload its own ServiceAccount and set automountServiceAccountToken: false if it never calls the API. Creating pods implies reading the namespace's Secrets."
    focus: [caller]
```

```trace diagram
id: network-policy
title: Which pods may reach the database
subtitle: "Namespace shop: default deny, then one allowance"
elements:
  - { id: web, label: web pod, sub: app=web, row: 0 }
  - { id: other, label: other pod, sub: app=report, tone: neutral, row: 0 }
  - { id: dns, label: CoreDNS, sub: kube-system, tone: neutral, row: 0, role: edge }
  - { id: db, label: db pod, sub: "app=db, port 5432", kind: store, row: 1 }
  - { id: deny, label: default-deny-ingress, sub: "podSelector: {}", tone: external, row: 2, role: security }
  - { id: allow, label: db-from-web, sub: "from app=web, port 5432", tone: stream, row: 2, role: security }
edges:
  - { id: web-db, from: web, to: db, label: allowed }
  - { id: other-db, from: other, to: db, label: dropped, style: dotted, flow: blocked }
  - { id: lookup, from: web, to: dns, label: "port 53", style: dashed, flow: main }
  - { id: isolate, from: deny, to: db, style: dashed, flow: security }
  - { id: permit, from: allow, to: db, style: dashed, flow: security }
steps:
  - caption: "Until a NetworkPolicy selects a pod, all traffic to and from it is allowed. Any pod in any namespace can reach the database."
    focus: [web, other, db]
    trace: [web-db]
  - caption: "default-deny-ingress selects every pod in shop with an empty podSelector and has no rules. All inbound traffic to them is now denied."
    focus: [deny, db]
    trace: [isolate]
  - caption: "Policies add up. db-from-web lets pods labelled app=web reach app=db on port 5432, and nothing else."
    focus: [allow, web, db]
    trace: [permit, web-db]
  - caption: "Connections from the report pod are dropped, but only if the network plugin enforces NetworkPolicy, as Calico and Cilium do. Test that blocked really means blocked."
    focus: [other, db]
    trace: [other-db]
  - caption: "If you also restrict egress, allow DNS to the cluster DNS service, or every name lookup fails."
    focus: [web, dns]
    trace: [lookup]
```
