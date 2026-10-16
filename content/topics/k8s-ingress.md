---
id: k8s-ingress
title: Ingress and the Gateway API
summary: HTTP routing from the outside world to Services
why: "Ingress is frozen, and the most widely used Ingress controller has been retired. New clusters should route traffic with the Gateway API, and existing ones need a migration plan."
requires: [k8s-services]
lesson: none
points:
  - title: An API needs a controller
    text: "Ingress and Gateway objects are only configuration. A controller (a cloud load balancer, Envoy Gateway, NGINX Gateway Fabric, Istio, Cilium and others) does the routing."
  - title: Ingress is frozen
    text: "Ingress is stable and will not be removed, but it gets no new features; the Kubernetes docs recommend Gateway instead."
  - title: Gateway API splits the roles
    text: "GatewayClass (the implementation), Gateway (listeners, ports, certificates, owned by the platform team) and HTTPRoute (paths and backends, owned by app teams)."
  - title: Ingress NGINX is retired
    text: "Kubernetes announced the retirement of the community ingress-nginx controller; best-effort maintenance ended in March 2026, with no further fixes, even for security issues."
quiz_hint: Separate the API objects (what you write) from the controller (what actually handles traffic).
quiz:
  - q: You apply an Ingress to a cluster with no Ingress controller installed. What happens?
    options: ["Kubernetes creates a load balancer automatically", "Nothing routes traffic; the object is stored but no controller acts on it", "The API server rejects it"]
    answer: 1
    explain: "Kubernetes does not ship an Ingress or Gateway implementation. A controller has to watch these objects and configure a proxy or load balancer."
  - q: In the Gateway API, which object do app teams normally own?
    options: ["GatewayClass", "Gateway", "HTTPRoute"]
    answer: 2
    explain: "Infrastructure providers define GatewayClasses, platform teams run Gateways (ports, TLS, which namespaces may attach), and app teams attach HTTPRoutes for their hostnames and paths."
  - q: How do you send 10% of traffic to a canary Service with an HTTPRoute?
    options: ["It is not possible without annotations", "Two backendRefs with weight: 90 and weight: 10", "Scale the canary to 10% of the replicas"]
    answer: 1
    explain: "Weighted backends are part of the HTTPRoute spec. With Ingress the same thing needed controller-specific annotations."
links:
  - { title: "Gateway API (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/services-networking/gateway/" }
  - { title: "Gateway API introduction (gateway-api.sigs.k8s.io)", url: "https://gateway-api.sigs.k8s.io/docs/introduction/" }
  - { title: "Ingress (kubernetes.io)", url: "https://kubernetes.io/docs/concepts/services-networking/ingress/" }
  - { title: "Ingress NGINX retirement (Kubernetes blog)", url: "https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/" }
---
A Service gives pods a stable address inside the cluster. To accept HTTP traffic from outside, with hostnames, paths and TLS, you need a layer-7 entry point. Kubernetes defines APIs for describing that routing, Ingress (the original) and the Gateway API (its successor), but ships no implementation: a controller you install, or one your cloud provides, watches those objects and configures the actual proxy or load balancer.

## Ingress: simple and frozen

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  ingressClassName: example     # which controller handles it
  tls:
    - hosts: [shop.example.com]
      secretName: shop-tls
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
```

Ingress covers hosts, paths and TLS. Everything else (timeouts, header rewrites, traffic splitting, rate limits) was added through controller-specific annotations, so Ingress manifests are rarely portable. The API is now frozen: generally available and staying, but not getting new features.

Two recent changes matter here. The Kubernetes docs now recommend Gateway over Ingress. And in November 2025 SIG Network and the Security Response Committee announced the retirement of the community **ingress-nginx** controller, long the default choice: best-effort maintenance continued until March 2026, after which there are no new releases or security fixes. Existing installs keep working, but they should be migrated to a maintained controller, ideally a Gateway API implementation.

## Gateway API: roles and routes

Gateway API v1.0 went GA in October 2023 and is developed outside the core release as CRDs (`gateway.networking.k8s.io`) that you install, often bundled with the implementation. It splits one Ingress into objects owned by different people:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway                       # platform team: the entry point
metadata:
  name: public
  namespace: infra
spec:
  gatewayClassName: example         # which implementation
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "*.example.com"
      tls:
        mode: Terminate
        certificateRefs:
          - name: wildcard-tls
      allowedRoutes:
        namespaces:
          from: All
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute                     # app team: their hostname and backends
metadata:
  name: web
  namespace: shop
spec:
  parentRefs:
    - name: public
      namespace: infra
  hostnames: ["shop.example.com"]
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      backendRefs:
        - name: web
          port: 80
          weight: 90
        - name: web-canary
          port: 80
          weight: 10
```

- **GatewayClass** names an implementation, like `ingressClassName`.
- **Gateway** declares listeners: ports, protocols, hostnames, certificates, and which namespaces may attach routes.
- **HTTPRoute** (and GRPCRoute, plus TLS, TCP and UDP routes in various channels) attaches to a Gateway and maps matches (paths, headers, methods) to backends, with weights, redirects, rewrites and header changes as portable fields instead of annotations.

The split lets a platform team control TLS and exposure while app teams change their own routes in their own namespaces, and the same route can usually move between implementations unchanged.

## Choosing

- New clusters: pick a conformant Gateway API implementation (check the project's implementations page) and use HTTPRoute.
- Existing Ingress: inventory annotations, which are the hard part to translate; the `ingress2gateway` tool converts the common cases.
- Either way, the controller is critical production software: run several replicas, give it resource requests, and watch its error and latency metrics.
