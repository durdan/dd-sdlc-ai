---
id: docker-networking
title: "Networking: bridges, ports and DNS"
summary: Each container gets its own network stack
why: "'Connection refused', 'bad address' and ports that are open to the whole internet all come from the same few rules about bridges, publishing and Docker's DNS."
requires: [docker-containers]
lesson: diagram
points:
  - title: Its own network namespace
    text: Each container has its own interfaces, IP address, routing table and localhost, connected to a virtual bridge on the host.
  - title: Publishing opens a door
    text: "-p 8080:3000 forwards a host port to the container. Without an address it listens on all host interfaces, not just localhost."
  - title: User-defined networks have DNS
    text: Containers on a network you create resolve each other by name through Docker's embedded DNS server; on the default bridge they do not.
  - title: EXPOSE publishes nothing
    text: EXPOSE in a Dockerfile only documents a port; only -p (or Compose ports) makes it reachable from the host.
quiz_hint: "Ask which network namespace each address lives in: the host's, or a container's."
quiz:
  - q: "Two containers run on the default bridge. One calls http://api:3000 and gets 'bad address'. Why?"
    options: ["The api container is down", "The default bridge has no name-based DNS; create a network and attach both containers", "Port 3000 is not exposed"]
    answer: 1
    explain: "User-defined bridge networks provide automatic DNS between containers. On the default bridge, containers can only reach each other by IP (or with the legacy --link)."
  - q: "On a cloud VM you run docker run -p 5432:5432 postgres. Who can connect?"
    options: ["Only processes on the VM", "Anything that can reach the VM's public interface, unless a firewall outside the VM blocks it", "Only other containers"]
    answer: 1
    explain: "Without an address, publishing listens on all host interfaces, and on Linux Docker's own firewall rules can bypass ufw. Bind to 127.0.0.1 (-p 127.0.0.1:5432:5432) for local-only access."
  - q: Inside a container, what does localhost refer to?
    options: ["The host machine", "The container's own network namespace", "The Docker daemon"]
    answer: 1
    explain: "Each container has its own loopback interface. To reach another container use its name on a shared network; to reach the host on Docker Desktop use host.docker.internal."
links:
  - { title: "Networking overview (Docker docs)", url: "https://docs.docker.com/engine/network/" }
  - { title: "Bridge network driver (Docker docs)", url: "https://docs.docker.com/engine/network/drivers/bridge/" }
  - { title: "Port publishing and mapping (Docker docs)", url: "https://docs.docker.com/engine/network/port-publishing/" }
  - { title: "Packet filtering and firewalls (Docker docs)", url: "https://docs.docker.com/engine/network/packet-filtering-firewalls/" }
---
Every container gets its own network namespace: its own interfaces, IP address, routing table, and its own `localhost`. By default Docker plugs it into a virtual bridge on the host with a veth pair, gives it a private address, and translates its outgoing traffic to the host's address (NAT). Nothing can connect in from outside until you publish a port, and containers find each other by name only on networks you create.

## Containers talking to containers

```sh
docker network create appnet
docker run -d --name api --network appnet hello:1

docker run --rm --network appnet alpine:3.22 wget -qO- http://api:3000/
# hello from 46eeb327545b

docker run --rm alpine:3.22 wget -qO- -T 2 http://api:3000/      # default bridge
# wget: bad address 'api:3000'

docker run --rm --network appnet alpine:3.22 cat /etc/resolv.conf
# nameserver 127.0.0.11
```

On a user-defined bridge, Docker runs an embedded DNS server (reached at `127.0.0.11` inside the container) that answers with the IPs of containers on the same network, by container name or network alias. The default `bridge` network has no such DNS. Compose creates a network per project for you, which is why services there can use each other's names.

Note that the container talks to `api:3000`, the port the app listens on inside its own namespace. Publishing is not needed for container-to-container traffic.

## Publishing ports to the host

```sh
docker run -d -p 8080:3000 hello:1             # all host interfaces, port 8080 -> container 3000
docker run -d -p 127.0.0.1:8080:3000 hello:1   # only the host itself
```

Without an address, a published port listens on every interface of the host, so a database published on a cloud VM is open to anyone who can reach that VM. On Linux, Docker inserts its own firewall rules for published ports, and Docker's documentation warns that they are incompatible with ufw: traffic to published ports can bypass ufw's rules. Bind internal services to `127.0.0.1`, or do not publish them at all and reach them over a Docker network.

A related hardening arrived in Engine 28.0: older releases let hosts on the same LAN segment reach ports published only to localhost, and even reach unpublished container ports directly; 28.0 blocks that by default.

`EXPOSE 3000` in a Dockerfile publishes nothing. It records the intended port as metadata, which `docker run -P` (publish all exposed ports on random host ports) and humans read.

## Other network modes

- `--network host` (Linux): the container shares the host's network namespace; no isolation and no port mapping.
- `--network none`: only a loopback interface, for jobs that must not talk to anything.
- `macvlan` / `ipvlan`: give containers addresses on the physical network.
- `overlay`: spans several hosts (Swarm); Kubernetes uses its own CNI plugins instead.

When something cannot connect, check in order: is it on the same network, does the name resolve (`getent hosts api`), is the app listening on `0.0.0.0` rather than `127.0.0.1` inside its container, and, from the host, is the port published on the address you are using.

```trace diagram
id: bridges-and-ports
title: Who can reach the api container
subtitle: "docker run -d --name api --network appnet -p 8080:3000 hello:1"
direction: DOWN
groups:
  - { id: appnet, label: "appnet (user-defined bridge)" }
  - { id: dflt, label: default bridge }
elements:
  - { id: outside, label: Browser or LAN host, sub: "anything that reaches the host", kind: person, row: 0 }
  - { id: port, label: Published port, sub: "host :8080 → container :3000", tone: external, row: 1, role: edge }
  - { id: peer, label: alpine, sub: "wget http://api:3000/", group: appnet, row: 1 }
  - { id: lone, label: alpine, sub: "wget http://api:3000/", group: dflt, row: 1 }
  - { id: dns, label: Embedded DNS, sub: "127.0.0.11", tone: stream, group: appnet, row: 2 }
  - { id: api, label: api, sub: "hello:1 listening on :3000", kind: system, group: appnet, row: 3 }
edges:
  - { id: in, from: outside, to: port, label: ":8080" }
  - { id: fwd, from: port, to: api }
  - { id: ask, from: peer, to: dns, label: api? }
  - { id: call, from: peer, to: api, label: "api:3000" }
  - { id: fail, from: lone, to: api, label: bad address, style: dotted, flow: blocked }
steps:
  - caption: Every container has its own network namespace, with its own interfaces, IP address and its own localhost. Docker connects it to a virtual bridge on the host.
    focus: [api]
  - caption: api runs on appnet, a network created with docker network create. A second container on appnet calls http://api:3000/.
    focus: [peer, api]
  - caption: "On a user-defined bridge, Docker runs an embedded DNS server at 127.0.0.11. It answers with the IP of the container named api on the same network."
    focus: [peer, dns]
    trace: [ask]
  - caption: "The call goes straight to port 3000, where the app listens inside its own namespace. Container-to-container traffic needs no publishing."
    focus: [peer, api]
    trace: [call]
  - caption: The same wget from a container on the default bridge fails with bad address. The default bridge has no name-based DNS, so it could only use an IP.
    focus: [lone, api]
    trace: [fail]
  - caption: "From outside, only a published port gets in. -p 8080:3000 forwards host port 8080 to the container's port 3000."
    focus: [outside, port, api]
    trace: [in, fwd]
  - caption: "Without an address, a published port listens on every host interface, so on a cloud VM it is open to anyone who can reach it, and on Linux it can bypass ufw. -p 127.0.0.1:8080:3000 keeps it to the host."
    focus: [outside, port]
  - caption: "EXPOSE 3000 in the Dockerfile publishes nothing; it is only metadata. --network host skips all of this and shares the host's stack, with no isolation and no mapping."
    focus: [port, api]
  - caption: "When something cannot connect, check in order: same network, does the name resolve, is the app listening on 0.0.0.0, and is the port published on the address you use."
note: "Compose creates a network per project, which is why Compose services can call each other by name."
```
