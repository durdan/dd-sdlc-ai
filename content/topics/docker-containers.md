---
id: docker-containers
title: "Containers vs VMs: namespaces, cgroups, one kernel"
summary: A container is a process with a fenced-in view
why: "Almost every surprise with containers (slow stops, odd PIDs, memory kills, security limits) makes sense once you see that a container is an ordinary Linux process, not a small computer."
lesson: none
points:
  - title: Namespaces limit what it sees
    text: The process gets its own view of process IDs, network interfaces, mounts, hostname and IPC, so it looks alone on the machine.
  - title: cgroups limit what it uses
    text: A control group caps memory, CPU time and other resources, and counts what the process and its children consume.
  - title: One kernel for everyone
    text: Every container on a host shares the host's kernel. A VM boots its own kernel on virtual hardware; a container never does.
  - title: Docker is the tooling around it
    text: The engine builds images, sets up networks and storage, and asks containerd and runc to start the fenced-in process.
quiz_hint: Ask yourself whether something is a feature of the Linux kernel or of a virtual machine.
quiz:
  - q: You run this. What does ps report as PID 1?
    code: |
      docker run --rm alpine:3.22 ps
    options: ["The host's init process (systemd)", "ps itself", "dockerd"]
    answer: 1
    explain: "The container has its own PID namespace, and the first process started in it is numbered 1. Here that is ps, so ps sees only itself."
  - q: What makes /sys/fs/cgroup/memory.max read 67108864 inside a container started with --memory 64m?
    options: ["A virtual machine with 64 MB of RAM", "A cgroup limit the kernel enforces on the container's processes", "Docker trimming /proc output"]
    answer: 1
    explain: "Docker puts the container in a cgroup with memory.max set to 64 MiB. The kernel counts every page the processes use and reclaims or OOM-kills when they exceed it. No extra RAM or VM is involved."
  - q: Why is a kernel vulnerability more serious for containers than for VMs on the same host?
    options: ["Containers run older kernels", "All containers share the host kernel, so one exploit can reach every container and the host", "VMs do not use kernels"]
    answer: 1
    explain: "A VM attacker must first escape its own guest kernel and then the hypervisor. A container talks to the shared host kernel directly, so the kernel itself is the isolation boundary."
links:
  - { title: "What is a container? (Docker docs)", url: "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" }
  - { title: "namespaces(7) (Linux man page)", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html" }
  - { title: "Control Group v2 (Linux kernel docs)", url: "https://docs.kernel.org/admin-guide/cgroup-v2.html" }
  - { title: "OCI runtime specification", url: "https://github.com/opencontainers/runtime-spec/blob/main/spec.md" }
---
A container is not a lightweight virtual machine. It is a normal process on a Linux host that the kernel has fenced in: namespaces control what it can see, cgroups control how much it can use, and a separate root filesystem (the image) gives it its own files. There is no second kernel and no boot; starting a container costs about as much as starting the process inside it.

## What a namespace hides

Each namespace type wraps one kind of global resource. Docker gives every container its own mount, PID, network, UTS (hostname) and IPC namespaces, and on cgroup v2 hosts its own cgroup namespace. User namespaces, which map root in the container to an unprivileged user outside, are only used if you enable rootless mode or `userns-remap`.

```sh
docker run --rm alpine:3.22 ps
# PID   USER     TIME  COMMAND
#     1 root      0:00 ps

docker run --rm alpine:3.22 hostname
# e758c8d8a3db          (the container ID, not your machine's name)
```

The process really is PID 1 inside its namespace, while the host sees it under an ordinary, larger PID. The same trick gives the container its own `eth0`, its own routing table and its own view of mounted filesystems.

## What a cgroup limits

Namespaces do nothing about resources. A process in its own namespaces can still eat all the memory on the host. Control groups fix that: the kernel tracks every page and CPU slice used by a group of processes and enforces limits.

```sh
docker run --rm --memory 64m --cpus 0.5 alpine:3.22 \
  sh -c 'cat /sys/fs/cgroup/memory.max /sys/fs/cgroup/cpu.max'
# 67108864
# 50000 100000
```

`64m` became a hard memory ceiling of 67,108,864 bytes; `--cpus 0.5` became a quota of 50 ms of CPU time per 100 ms period. Go over the memory limit and the kernel's OOM killer ends a process; go over the CPU quota and the process is simply paused until the next period (throttled). Kubernetes resource limits use exactly the same cgroup files.

## Versus a virtual machine

A VM emulates hardware, boots its own kernel and runs a full OS on top. That gives strong isolation and lets you run Windows next to Linux, at the cost of seconds to boot and hundreds of megabytes of overhead. A container shares the host kernel, starts in milliseconds and adds almost nothing, but:

- it can only run software for the host's kernel (Linux containers need a Linux kernel, which is why Docker Desktop runs a VM on macOS);
- the kernel is the security boundary, so a kernel bug or an over-privileged container affects everyone on the host.

Many platforms combine the two: containers for packaging and density, inside VMs (or micro-VMs such as Firecracker) for isolation between tenants.

## Where Docker fits

`docker run` asks the Docker daemon (`dockerd`) to create a container. The daemon prepares the image, network and mounts, then hands off to containerd, which uses runc to create the namespaces and cgroups and start your process. runc implements the OCI runtime specification, an open standard, which is why images built with Docker run unchanged under containerd, CRI-O or Podman.
