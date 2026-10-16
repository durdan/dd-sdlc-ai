---
id: docker-security
title: Running as non-root and other basics
summary: Root in a container is still root to the kernel
why: "Containers share the host kernel, so a process running as root with broad privileges is one bug away from the host. A few defaults close most of that gap."
requires: [docker-containers, docker-multistage]
lesson: none
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
