---
id: k8s-services
title: "Services, kube-proxy and DNS"
summary: A stable name and IP in front of changing pods
why: "Pods come and go with new IPs on every restart. Services are how anything finds them, and most 'it cannot connect' incidents are a selector, a port or readiness."
requires: [k8s-deployments, docker-networking]
lesson: diagram
points:
  - title: A Service selects pods by label
    text: "Its selector picks the pods; the control plane keeps the list of ready pod IPs in EndpointSlices."
  - title: A virtual IP that never changes
    text: "A ClusterIP Service gets one stable virtual IP. kube-proxy (iptables mode by default; nftables and IPVS are alternatives) programs every node to spread connections to it across the endpoints."
  - title: DNS names for free
    text: "CoreDNS answers web.shop.svc.cluster.local, or just web from the same namespace, with the Service's IP."
  - title: Only ready pods receive traffic
    text: "A pod whose readiness probe fails is removed from the endpoints, while it keeps running."
quiz_hint: "Trace the path: name, then virtual IP, then one ready pod."
quiz:
  - q: "A Service has port: 80 and targetPort: 3000. A client in the cluster calls http://web. Where does the connection arrive?"
    options: ["Port 80 on a pod", "Port 3000 on one of the ready pods selected by the Service", "Port 3000 on the node"]
    answer: 1
    explain: "Clients use the Service port (80). kube-proxy's rules translate the virtual IP and port to one endpoint's pod IP and the targetPort."
  - q: A Service exists, the pods are running, but the Service has no endpoints. What is the most likely cause?
    options: ["DNS is down", "The selector does not match the pods' labels, or the pods are not ready", "kube-proxy needs a restart"]
    answer: 1
    explain: "Endpoints are the ready pods matching the selector. Compare kubectl get endpointslices -l kubernetes.io/service-name=web with kubectl get pods --show-labels and check readiness."
  - q: From namespace shop, how do you reach the Service db in namespace data?
    options: ["db", "db.data (or db.data.svc.cluster.local)", "Only by IP"]
    answer: 1
    explain: "The DNS search path inside a pod includes its own namespace first, so bare names resolve only there. Other namespaces need at least service.namespace."
links:
  - { title: "Service (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/services-networking/service/" }
  - { title: "Virtual IPs and service proxies (kubernetes.io)", url: "https://kubernetes.io/docs/reference/networking/virtual-ips/" }
  - { title: "DNS for Services and Pods (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/" }
---
Pods are replaced all the time, and each replacement gets a new IP. A Service gives a set of pods one stable identity: a name in DNS and, for the usual ClusterIP type, a virtual IP address that never changes while the Service exists. The Service selects pods by label; the control plane continuously records which of those pods are ready in EndpointSlice objects, and a proxy on every node sends connections for the virtual IP to one of them.

## The manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web              # the pods from the Deployment's template
  ports:
    - name: http
      port: 80            # what clients use
      targetPort: 3000    # what the container listens on
```

```sh
kubectl get svc web
# NAME   TYPE        CLUSTER-IP     PORT(S)
# web    ClusterIP   10.96.41.120   80/TCP
kubectl get endpointslices -l kubernetes.io/service-name=web
# the ready pod IPs on port 3000
```

## How a connection reaches a pod

1. The client resolves `web`. Each pod's `/etc/resolv.conf` points at the cluster DNS (CoreDNS) with search domains such as `shop.svc.cluster.local`, so `web` expands to `web.shop.svc.cluster.local` and resolves to the ClusterIP.
2. The client connects to `10.96.41.120:80`. No process listens on that address.
3. On the client's node, rules written by kube-proxy match the virtual IP and rewrite the destination to one endpoint, for example `10.244.2.17:3000`.
4. The pod network delivers the packet to that pod, on whatever node it runs.

kube-proxy watches Services and EndpointSlices and rewrites those rules whenever pods come, go, or change readiness. Its default mode on Linux is still iptables; an nftables mode is available and is planned to become the default, and IPVS mode was deprecated in 1.35. Some network plugins (for example Cilium with eBPF) replace kube-proxy entirely. Load balancing happens per connection, so long-lived connections such as HTTP/2 or gRPC stick to one pod; balance those at layer 7 with a proxy or mesh.

## Service types

- **ClusterIP** (default): reachable inside the cluster only.
- **NodePort**: also opens a port (30000-32767 by default) on every node.
- **LoadBalancer**: also asks the cloud provider for an external load balancer pointing at the nodes.
- **Headless** (`clusterIP: None`): no virtual IP; DNS returns the pod IPs directly. StatefulSets use this to give each pod its own name.
- **ExternalName**: a DNS alias (CNAME) for something outside the cluster.

## When it does not connect

Check in this order:

- **Endpoints empty?** The selector does not match the pod labels, or no pod is ready.
- **Wrong port?** `targetPort` must be the port the container listens on (a named port is safest).
- **App bound to 127.0.0.1?** It must listen on `0.0.0.0` to accept traffic from outside its own pod.
- **Wrong namespace?** Bare names resolve only in the caller's namespace; use `name.namespace`.
- **NetworkPolicy?** A default-deny policy drops traffic that is not explicitly allowed.

Because only ready pods are endpoints, readiness probes are also how a pod takes itself out of traffic during start-up, overload or shutdown.

```trace diagram
id: service-path
title: How http://web reaches a pod
subtitle: "Service web: port 80 → targetPort 3000"
elements:
  - { id: client, label: Client pod, sub: "namespace shop", kind: person, row: 0 }
  - { id: svc, label: Service web, sub: "ClusterIP 10.96.41.120, selector app=web", kind: system, row: 0 }
  - { id: lb, label: Cloud load balancer, sub: type LoadBalancer, kind: external, row: 0 }
  - { id: dns, label: CoreDNS, sub: web.shop.svc.cluster.local, tone: neutral, row: 1 }
  - { id: slice, label: EndpointSlice, sub: "pod IPs:3000 + ready flag", tone: data, row: 1 }
  - { id: proxy, label: kube-proxy rules, sub: "iptables, on every node", tone: stream, row: 2 }
  - { id: p1, label: web pod 1, sub: "10.244.2.17, ready", row: 3 }
  - { id: p2, label: web pod 2, sub: ready, row: 3 }
  - { id: p3, label: web pod 3, sub: not ready, tone: neutral, row: 3 }
edges:
  - { id: lookup, from: client, to: dns, label: resolve web }
  - { id: connect, from: client, to: proxy, label: "10.96.41.120:80" }
  - { id: select, from: svc, to: slice, label: selector }
  - { id: watch, from: slice, to: proxy, label: watched }
  - { id: to-p1, from: proxy, to: p1 }
  - { id: to-p2, from: proxy, to: p2 }
  - { id: to-p3, from: proxy, to: p3, style: dotted }
  - { id: external, from: lb, to: proxy, label: NodePort on each node }
steps:
  - caption: "Pods are replaced all the time, each time with a new IP. A Service gives them one stable name and one virtual IP that never changes."
  - caption: "The Service selects pods by label. The EndpointSlice controller keeps their IPs in EndpointSlices, each marked ready or not."
    focus: [svc, slice, p1, p2, p3]
    trace: [select]
  - caption: "The client asks for http://web. Its DNS search path expands web to web.shop.svc.cluster.local, and CoreDNS answers with the ClusterIP."
    focus: [client, dns]
    trace: [lookup]
  - caption: "The client connects to 10.96.41.120:80. No process listens there. Rules on the client's own node catch the packet."
    focus: [client, proxy]
    trace: [connect]
  - caption: kube-proxy watches Services and EndpointSlices and rewrites those rules on every node whenever pods come, go or change readiness.
    focus: [slice, proxy]
    trace: [watch]
  - caption: "The rules pick one ready endpoint and rewrite the destination to its pod IP and targetPort 3000. The choice is per connection, so a long gRPC connection sticks to one pod."
    focus: [proxy, p1]
    trace: [to-p1]
  - caption: "Pod 3 fails its readiness probe. It is marked not ready, so the rules skip it, but it keeps running and comes back when the probe passes."
    focus: [proxy, p3, slice]
    trace: [to-p3]
  - caption: "NodePort opens a port, 30000 to 32767 by default, on every node, and LoadBalancer adds a cloud load balancer in front. Both end in the same rules."
    focus: [lb, proxy, p2]
    trace: [external, to-p2]
  - caption: "When nothing connects, check the endpoints first. Empty means the selector does not match the pod labels, or no pod is ready."
    focus: [svc, slice]
```
