---
id: k8s-services
title: "Services, kube-proxy and DNS"
summary: A stable name and IP in front of changing pods
why: "Pods come and go with new IPs on every restart. Services are how anything finds them, and most 'it cannot connect' incidents are a selector, a port or readiness."
requires: [k8s-deployments, docker-networking]
lesson: none
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
