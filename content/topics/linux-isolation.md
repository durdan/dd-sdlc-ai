---
id: linux-isolation
title: "Resource limits, cgroups and namespaces"
summary: The kernel features that containers are made of
why: "A container is not a virtual machine. It is ordinary processes with limits (cgroups) and a private view of the system (namespaces), and debugging one needs both ideas."
requires: [linux-processes, linux-memory, linux-permissions]
lesson: none
points:
  - title: rlimits cap one process
    text: "ulimit sets per-process ceilings such as open files, stack size and core dumps. Children inherit them."
  - title: cgroups cap a group
    text: "Control groups v2 limit and account CPU, memory, I/O and process count for a whole tree of processes."
  - title: Namespaces change what a process sees
    text: "PID, mount, network, UTS, IPC, user, cgroup and time namespaces each give a private copy of one kind of system resource."
  - title: Container = namespaces + cgroups + an image
    text: "Docker and Kubernetes set these up, then exec your program inside them. The kernel is shared with the host."
quiz:
  - q: "A server fails with 'Too many open files' under load. Which limit is it hitting?"
    options: ["The cgroup memory limit", "The per-process RLIMIT_NOFILE (ulimit -n)", "The disk size"]
    answer: 1
    explain: "Each process may hold only so many descriptors. Raise it (LimitNOFILE= in systemd, --ulimit nofile= in Docker) and check for leaked sockets or files."
  - q: "Inside a container, ps shows your app as PID 1. On the host, the same process has PID 48213. How?"
    options: ["The container runs its own kernel", "It is in a separate PID namespace, which numbers processes from 1; the host sees its real PID", "ps is faked by Docker"]
    answer: 1
    explain: "A PID namespace gives a process tree its own numbering. The host (the parent namespace) still sees and can signal the process under its host PID."
  - q: "Which mechanism enforces docker run --memory 128m?"
    options: ["A namespace", "The memory controller of the container's cgroup (memory.max)", "ulimit -v"]
    answer: 1
    explain: "Namespaces control visibility, cgroups control amounts. Docker writes 134217728 to memory.max in the container's cgroup, and the kernel enforces it."
links:
  - { title: "namespaces(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html" }
  - { title: "Control Group v2 (kernel.org)", url: "https://docs.kernel.org/admin-guide/cgroup-v2.html" }
  - { title: "cgroups(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/cgroups.7.html" }
  - { title: "getrlimit(2): resource limits (man7.org)", url: "https://man7.org/linux/man-pages/man2/getrlimit.2.html" }
---
Linux has three layers of isolation that build on each other. Resource limits (rlimits) cap what a single process may use, such as how many files it can open. Control groups (cgroups) put a set of processes in a group and limit and measure CPU, memory, I/O and process count for the group as a whole. Namespaces give processes a private view of one kind of resource: their own process IDs, mounts, network stack, hostname or user IDs. A container is ordinary processes started inside a set of namespaces and a cgroup, with an image mounted as their root filesystem.

## Per-process limits

```sh
ulimit -Sn; ulimit -Hn
(ulimit -n 20; python3 -c '
files = []
try:
    while True: files.append(open("/etc/hostname"))
except OSError as e: print(len(files), "files open, then:", e)
')
```

```text
1048576
1048576
17 files open, then: [Errno 24] Too many open files: '/etc/hostname'
```

Each limit has a soft value (what is enforced) and a hard ceiling (how far an unprivileged process may raise the soft value). With a limit of 20, Python could open 17 more files, because stdin, stdout and stderr were already open. `cat /proc/<pid>/limits` shows any process's limits. Set them where the service starts: `LimitNOFILE=` in a systemd unit, `--ulimit` for Docker, `/etc/security/limits.conf` for login sessions.

## cgroups: limits for a group

Every process belongs to one cgroup in the single cgroup v2 tree mounted at `/sys/fs/cgroup`. A cgroup's files set and report its limits:

```sh
docker run --rm --cpus 0.5 -m 128m --pids-limit 50 ubuntu:24.04 bash -c '
  cd /sys/fs/cgroup
  cat memory.max cpu.max pids.max memory.current'
```

```text
134217728
50000 100000
50
1662976
```

Docker turned its flags into cgroup settings: `memory.max` is 128 MiB in bytes, `cpu.max` allows 50 ms of CPU per 100 ms period (half a core), and `pids.max` caps processes and threads at 50, which stops a fork bomb. `memory.current` is what the group uses now, page cache included. When the group goes over `memory.max` and can't reclaim, the OOM killer acts inside the group only. systemd uses the same mechanism for every service (`MemoryMax=`, `CPUQuota=`, `TasksMax=`), and Kubernetes requests and limits become cgroup settings too.

## Namespaces: a private view

`unshare` starts a program in new namespaces. This needs privileges, so it ran in a `--privileged` container:

```sh
unshare --uts --pid --fork --mount-proc bash -c 'hostname sandbox; hostname; ps -e; true'
hostname
```

```text
sandbox
    PID TTY          TIME CMD
      1 ?        00:00:00 bash
      4 ?        00:00:00 ps
d77f310c8b72
```

In the new UTS namespace the hostname change stayed inside; in the new PID namespace bash is PID 1 and sees only its own children. `--mount-proc` mounted a fresh `/proc` so `ps` shows that view. Afterwards the outer hostname is unchanged: the container's ID, as Docker sets it. The kinds of namespace are mount, PID, network, UTS (hostname), IPC, user (UID mapping, so root inside can be an ordinary user outside), cgroup and time. `ls -l /proc/self/ns` shows which ones a process is in; two processes in the same namespace show the same inode number.

## Putting it together

A container runtime such as runc creates the namespaces, creates a cgroup and writes the limits, mounts the image's layers as the new root, drops capabilities, applies a seccomp filter, and finally execs your program. There is no guest kernel: the processes are visible on the host with `ps`, and a kernel bug or a misconfigured privileged container affects the host. The Docker path builds on this to explain images, layers and container networking.

## On macOS

None of these exist on macOS: no cgroups, no Linux namespaces, and `ulimit` is the only one of the three. Docker Desktop, OrbStack and similar tools run a small Linux VM and create containers inside it, which is why every example here ran in Docker. The isolation is real Linux; it is just one layer further away.
