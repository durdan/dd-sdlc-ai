---
id: docker-desktop
title: Docker on a Mac is a Linux VM
summary: The engine and your containers live in a hidden VM
why: "Slow bind mounts, 'localhost' that is not your Mac, images that fail with 'exec format error': all of them follow from the VM that Docker Desktop runs for you."
requires: [docker-containers]
lesson: diagram
points:
  - title: A Linux kernel is required
    text: "macOS cannot run Linux containers itself, so Docker Desktop starts a small Linux VM and runs the Docker Engine inside it."
  - title: The CLI is a client
    text: The docker command on your Mac talks to the engine in the VM over a socket; images, containers and volumes live in the VM's disk.
  - title: Files and ports cross a boundary
    text: Bind mounts are shared into the VM, and published ports are forwarded back to the Mac, both at some cost.
  - title: The CPU architecture matters
    text: On Apple silicon the VM is arm64; amd64 images need an emulator, or a multi-platform image with an arm64 variant.
quiz_hint: Picture three places, your Mac, the Linux VM and the container, and ask which one each name or path refers to.
quiz:
  - q: On a Mac, what does uname -r print inside a container?
    code: |
      docker run --rm alpine:3.22 uname -r
    options: ["The macOS Darwin version", "The kernel of Docker Desktop's Linux VM (for example 6.12.54-linuxkit)", "Alpine's own kernel version"]
    answer: 1
    explain: "Containers share the kernel of the host they run on, and on a Mac that host is Docker Desktop's Linux VM. Images contain no kernel at all."
  - q: Your API runs on the Mac at port 5432 and a container must reach it. Which address works?
    options: ["localhost:5432", "host.docker.internal:5432", "127.0.0.1:5432"]
    answer: 1
    explain: "Inside a container, localhost is the container itself. Docker Desktop provides the DNS name host.docker.internal, which resolves to an address that reaches the host."
  - q: npm install in a bind-mounted project folder is far slower than on Linux. Why?
    options: ["Node is slower on arm64", "Every file operation crosses the file-sharing layer between macOS and the VM", "Bind mounts are encrypted"]
    answer: 1
    explain: "Bind mounts of Mac folders are shared into the VM (VirtioFS by default with the Apple Virtualization framework). Many small file operations pay that cost. Keeping node_modules in a named volume, which lives inside the VM, avoids it."
links:
  - { title: "Install Docker Desktop on Mac (Docker docs)", url: "https://docs.docker.com/desktop/setup/install/mac-install/" }
  - { title: "Virtual Machine Manager (Docker docs)", url: "https://docs.docker.com/desktop/features/vmm/" }
  - { title: "Networking how-tos for Docker Desktop", url: "https://docs.docker.com/desktop/features/networking/networking-how-tos/" }
  - { title: "Docker Desktop settings (Docker docs)", url: "https://docs.docker.com/desktop/settings-and-maintenance/settings/" }
---
Containers need a Linux kernel, and macOS does not have one. Docker Desktop solves this by running a small Linux virtual machine in the background, with the Docker Engine inside it. The `docker` command you type on the Mac is only a client: it sends API calls over a socket to the engine in the VM, and every image, container and volume lives on the VM's virtual disk.

## Seeing the VM

```sh
docker context ls
# NAME              DOCKER ENDPOINT
# desktop-linux *   unix:///Users/you/.docker/run/docker.sock

docker info --format '{{.OperatingSystem}} {{.KernelVersion}} {{.Architecture}}'
# Docker Desktop 6.12.54-linuxkit aarch64

docker run --rm alpine:3.22 uname -m
# aarch64
```

The kernel is the VM's (a LinuxKit build), not Darwin. The VM is managed by a virtual machine manager: on Apple silicon the default is Apple's Virtualization framework, and recent releases also offer Docker VMM, Docker's own container-optimised VMM (still beta). Settings such as CPUs, memory and disk size apply to this VM, so a container can never use more memory than the VM was given.

## Files: bind mounts cross a boundary

When you bind-mount a folder from your Mac (`-v "$PWD":/app`), Docker Desktop shares it into the VM, by default with VirtioFS. That works well for source code, but workloads that touch thousands of small files (installing `node_modules`, compiling, database files) are noticeably slower than on native Linux. Common fixes:

- put dependency folders and databases in named volumes, which live inside the VM's disk;
- use Compose `develop.watch` to sync changed files instead of mounting the whole tree.

## Networking: three different localhosts

The VM has its own network stack. Docker Desktop forwards each published port (`-p 8765:3000`) to the same port on the Mac, so `curl localhost:8765` works as on Linux. In the other direction, a container that needs a service on the Mac cannot use `localhost` (that is the container) and should use the special name `host.docker.internal`:

```sh
docker run --rm alpine:3.22 getent hosts host.docker.internal
# 192.168.65.254   host.docker.internal
```

Features that assume the container and host share one network, such as `--network host`, behave differently than on a Linux server, so test anything network-sensitive on Linux before shipping.

## CPU architecture

On Apple silicon the VM is arm64, so it runs `linux/arm64` images natively. An image that only exists for `linux/amd64` needs emulation (Rosetta or QEMU, if enabled in settings). Without it, it fails:

```sh
docker run --rm --platform linux/amd64 alpine:3.22 uname -m
# exec /bin/uname: exec format error    (on a Desktop without amd64 emulation)
```

Even with emulation, amd64 images are slower and occasionally behave differently. The fix is to build and pull multi-platform images (see BuildKit), so every machine, from your laptop to an amd64 server, gets a native variant.

## What carries over

Everything you learn here about images, layers, networks and volumes is the same on a Linux server; only the VM boundary is extra. When something works on your Mac but not in production (or the reverse), check the three usual suspects first: file sharing, networking through the VM, and CPU architecture.

```trace diagram
id: desktop-vm
title: The VM behind Docker Desktop
subtitle: On an Apple silicon Mac
direction: DOWN
groups:
  - { id: vm, label: Linux VM (LinuxKit kernel) }
elements:
  - { id: cli, label: docker CLI, sub: "on the Mac: context desktop-linux", kind: person, row: 0 }
  - { id: folder, label: Project folder, sub: "on the Mac: -v \"$PWD\":/app", row: 0, role: data }
  - { id: browser, label: Browser, sub: "on the Mac: localhost:8765", kind: person, row: 0 }
  - { id: backend, label: Desktop backend, sub: "on the Mac: listens on published ports", tone: external, row: 1, role: edge }
  - { id: svc, label: Service on the Mac, sub: "Postgres on :5432", row: 4 }
  - { id: engine, label: Docker Engine, sub: "images, volumes on the VM disk", kind: system, group: vm, row: 2, role: service }
  - { id: ctr, label: Container, sub: "linux/arm64, native", group: vm, row: 3 }
  - { id: emu, label: Emulation, sub: "Rosetta or QEMU, if enabled", tone: neutral, group: vm, row: 3 }
edges:
  - { id: api, from: cli, to: engine, label: API over a socket }
  - { id: run, from: engine, to: ctr }
  - { id: share, from: folder, to: ctr, label: VirtioFS }
  - { id: open, from: browser, to: backend }
  - { id: fwd, from: backend, to: ctr, label: into the VM }
  - { id: out, from: ctr, to: svc, label: host.docker.internal }
  - { id: amd, from: engine, to: emu, label: linux/amd64, style: dashed, flow: main }
steps:
  - caption: Containers need a Linux kernel and macOS does not have one. Docker Desktop runs a small Linux VM in the background, and the Docker Engine lives inside it.
    focus: [cli, engine, ctr]
  - caption: "The docker command on the Mac is only a client. It sends API calls over a socket to the engine in the VM, and every image, container and volume lives on the VM's disk."
    focus: [cli, engine]
    trace: [api]
  - caption: "A container shares the VM's kernel, not macOS's: uname -r prints a linuxkit kernel. CPUs and memory are whatever the VM was given in Settings."
    focus: [engine, ctr]
    trace: [run]
  - caption: "A bind mount of a Mac folder is shared into the VM, by default with VirtioFS. Fine for source code, slow for thousands of small files such as node_modules."
    focus: [folder, ctr]
    trace: [share]
  - caption: Keep dependency folders and databases in named volumes, which live on the VM's own disk, or sync with Compose watch instead of mounting the whole tree.
    focus: [engine, ctr]
  - caption: "Published ports come back the other way. Docker Desktop's backend listens on the Mac's port 8765 and forwards each connection into the VM, so curl localhost:8765 works as on Linux."
    focus: [browser, backend, ctr]
    trace: [open, fwd]
  - caption: "Inside the container, localhost is the container itself. To reach a service on the Mac, use the special name host.docker.internal."
    focus: [ctr, svc]
    trace: [out]
  - caption: "On Apple silicon the VM is arm64. An amd64-only image needs Rosetta or QEMU; without either it fails with exec format error. Multi-platform images avoid the question."
    focus: [engine, emu]
    trace: [amd]
  - caption: "When it works on your Mac but not in production, check the three crossings first: file sharing, networking through the VM, and CPU architecture."
    focus: [folder, backend, emu]
```
