---
id: docker-security
title: Running as non-root and other basics
summary: Root in a container is still root to the kernel
why: "Containers share the host kernel, so a process running as root with broad privileges is one bug away from the host. A few defaults close most of that gap."
requires: [docker-containers, docker-multistage]
lesson: diagram
points:
  - title: Do not run as root
    text: "Set USER in the image. Without user namespaces, UID 0 in a container is UID 0 on the host kernel, only with fewer capabilities."
  - title: Drop what you do not need
    text: "Docker already removes many capabilities. --cap-drop ALL, no-new-privileges and a read-only root filesystem shrink it further."
  - title: The Docker API is root
    text: "Anyone who can talk to the daemon (the docker group, a mounted docker.sock) can start a privileged container and own the host."
  - title: Less in the image, less to exploit
    text: "Minimal bases, no secrets in layers, and regular rebuilds and scans keep known vulnerabilities out."
quiz_hint: Think about what the kernel sees, not what the container pretends.
quiz:
  - q: A CI job mounts /var/run/docker.sock into a build container. What can code in that container do?
    options: ["Only read image lists", "Start any container, including a privileged one that mounts the host's root filesystem", "Nothing; the socket is read-only"]
    answer: 1
    explain: "The socket is the full Docker API, and the daemon runs as root. Docker's security docs say only trusted users should control the daemon for exactly this reason."
  - q: What does USER node in a Dockerfile change?
    options: ["The default user for later RUN steps and for the running container", "Only the owner of copied files", "It creates a user namespace"]
    answer: 0
    explain: "USER sets the user for the following RUN, CMD and ENTRYPOINT instructions and for the container's main process. COPY still creates root-owned files unless you use --chown."
  - q: "You add --read-only to docker run and the app fails writing /tmp/upload. What is the usual fix?"
    options: ["Drop --read-only", "Mount a tmpfs or a volume at the paths the app must write", "Run as root"]
    answer: 1
    explain: "A read-only root filesystem stops anyone from changing the app's files. Give the app writable space only where it needs it, with --tmpfs /tmp or a volume."
links:
  - { title: "Docker Engine security (Docker docs)", url: "https://docs.docker.com/engine/security/" }
  - { title: "Rootless mode (Docker docs)", url: "https://docs.docker.com/engine/security/rootless/" }
  - { title: "Isolate containers with a user namespace (Docker docs)", url: "https://docs.docker.com/engine/security/userns-remap/" }
  - { title: "docker container run reference (Docker docs)", url: "https://docs.docker.com/reference/cli/docker/container/run/" }
---
A container is only as isolated as the kernel features around it, and by default its process runs as root. Docker removes many dangerous capabilities and applies seccomp and AppArmor or SELinux profiles, but root inside a container is still user 0 to the host kernel unless you use user namespaces. Running as an unprivileged user, dropping the remaining privileges and keeping the image small are cheap and stop a large class of attacks.

## Who the process is

```sh
docker run --rm alpine:3.22 id
# uid=0(root) gid=0(root) groups=0(root),1(bin),2(daemon),...

docker run --rm hello:1 id        # image with USER node
# uid=1000(node) gid=1000(node) groups=1000(node)
```

Set the user in the image so every runtime uses it:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node . .
USER node
CMD ["node", "server.js"]
```

The official `node` images ship a `node` user (UID 1000); distroless `:nonroot` tags run as UID 65532. Ports below 1024 traditionally need privileges, so let the app listen on 3000 or 8080 and publish whatever port you like on the host.

## Capabilities and other switches

Root's power is split into capabilities. Docker's default set is much smaller than the full list, and you can drop the rest:

```sh
docker run --rm alpine:3.22 grep CapEff /proc/self/status
# CapEff: 00000000a80425fb      (Docker's default set)
docker run --rm --cap-drop ALL alpine:3.22 grep CapEff /proc/self/status
# CapEff: 0000000000000000

docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges \
  --user 10001:10001 alpine:3.22 sh -c 'id; touch /x'
# uid=10001 gid=10001 groups=10001
# touch: /x: Read-only file system
```

- `--cap-drop ALL`, then `--cap-add` only what is needed (for example `NET_BIND_SERVICE`).
- `--security-opt no-new-privileges` stops setuid binaries from raising privileges.
- `--read-only` with `--tmpfs /tmp` keeps the app's files unchangeable.
- Never use `--privileged` for ordinary workloads: it gives the container all capabilities and access to host devices.

## The daemon is root

The Docker daemon runs as root (unless you run it in rootless mode), and its API can mount any host path into a new container. Being in the `docker` group, or having `/var/run/docker.sock` mounted into a container, is therefore equivalent to root on that host. Treat CI jobs and tools that ask for the socket accordingly, or use rootless builders.

Two ways to make root in the container less powerful:

- **User namespaces** (`userns-remap`) map container UID 0 to an unprivileged range on the host.
- **Rootless mode** runs the daemon and containers as an ordinary user, at the cost of some features.

## What goes into the image

- Start from a minimal, pinned base, and rebuild regularly so patched packages arrive.
- Scan images in CI (Docker Scout, Trivy or Grype) and fail on fixable critical issues.
- Keep secrets out of layers and build arguments; use BuildKit secret mounts at build time and runtime secrets (files or a secrets manager) at run time.
- Publish only the ports you need, and on servers bind internal ones to `127.0.0.1`.

```trace diagram
id: guard-rails
title: Between a container and the kernel
subtitle: "What stands in the way of root, and what goes around it"
direction: DOWN
groups:
  - { id: rails, label: Guard rails }
elements:
  - { id: image, label: Image, sub: "minimal, pinned, scanned", kind: store, tone: data, row: 0 }
  - { id: ci, label: CI job, sub: with docker.sock mounted, kind: person, row: 0 }
  - { id: proc, label: Your process, sub: "USER node: uid 1000", kind: system, row: 1 }
  - { id: sock, label: docker.sock, sub: the full Docker API, tone: external, row: 1 }
  - { id: caps, label: Capabilities, sub: "--cap-drop ALL, no-new-privileges", group: rails, tone: stream, row: 2 }
  - { id: ro, label: Read-only rootfs, sub: "--read-only + --tmpfs /tmp", group: rails, tone: stream, row: 2 }
  - { id: profiles, label: seccomp + LSM, sub: "AppArmor or SELinux", group: rails, tone: stream, row: 2 }
  - { id: userns, label: User namespace, sub: "rootless or userns-remap", group: rails, tone: stream, row: 2 }
  - { id: daemon, label: dockerd, sub: runs as root, kind: system, tone: external, row: 2 }
  - { id: kernel, label: Host Linux kernel, sub: shared by every container, kind: system, tone: neutral, row: 3 }
edges:
  - { id: runs, from: image, to: proc, label: runs as }
  - { id: pc, from: proc, to: caps }
  - { id: pr, from: proc, to: ro }
  - { id: pp, from: proc, to: profiles }
  - { id: pu, from: proc, to: userns }
  - { id: ck, from: caps, to: kernel }
  - { id: rk, from: ro, to: kernel }
  - { id: sk, from: profiles, to: kernel }
  - { id: uk, from: userns, to: kernel }
  - { id: api, from: ci, to: sock }
  - { id: ask, from: sock, to: daemon }
  - { id: host, from: daemon, to: kernel, label: "--privileged, mount /", style: dashed }
steps:
  - caption: A container talks to the same kernel as the host. Whatever user and privileges its process has, the kernel sees directly. A few guard rails sit in between.
    focus: [proc, caps, ro, profiles, userns, kernel]
  - caption: "By default that process is root, uid 0, and without user namespaces it is uid 0 to the host kernel too. Set USER in the image, as the node image's node user (uid 1000) or distroless :nonroot (65532)."
    focus: [image, proc]
    trace: [runs]
  - caption: "Root's power is split into capabilities. Docker already drops many; --cap-drop ALL drops the rest, and no-new-privileges stops setuid binaries from raising privileges."
    focus: [proc, caps, kernel]
    trace: [pc, ck]
  - caption: "--read-only makes the app's own files unchangeable. Give it --tmpfs /tmp or a volume where it really must write."
    focus: [proc, ro, kernel]
    trace: [pr, rk]
  - caption: Docker also applies seccomp and an AppArmor or SELinux profile by default. --privileged switches all of this off and opens the host's devices.
    focus: [proc, profiles, kernel]
    trace: [pp, sk]
  - caption: User namespaces go further. With userns-remap or rootless mode, root in the container maps to an unprivileged user on the host.
    focus: [proc, userns, kernel]
    trace: [pu, uk]
  - caption: Now the way around every rail. A CI job with /var/run/docker.sock mounted is talking to the full Docker API.
    focus: [ci, sock, daemon]
    trace: [api, ask]
  - caption: "The daemon runs as root. Through the socket the job can start a privileged container that mounts the host's root filesystem. Socket access, or the docker group, is root on that host."
    focus: [sock, daemon, kernel]
    trace: [host]
  - caption: "Less in the image is less to exploit. Use a minimal pinned base, rebuild and scan in CI with Docker Scout, Trivy or Grype, and keep secrets out of layers."
    focus: [image]
```
