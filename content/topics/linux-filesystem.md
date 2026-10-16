---
id: linux-filesystem
title: "The filesystem tree, and everything is a file"
summary: One tree for disks, devices and the kernel's own state
why: "Knowing where things live, and that /proc and /sys are the kernel answering questions, turns debugging a process into reading a few files."
requires: [linux-fds]
lesson: none
points:
  - title: One tree from /
    text: "Disks, partitions, network shares and in-memory filesystems are all mounted somewhere under a single root."
  - title: Same calls for everything
    text: "Files, devices, pipes and sockets are all used through open, read, write and close on a descriptor."
  - title: /proc is the kernel talking
    text: "Its files are generated when you read them: each process's state, memory maps, open files and limits, plus system-wide counters."
  - title: /sys is the device and driver model
    text: "Devices, drivers, network interfaces and cgroups appear as directories with one value per file."
quiz:
  - q: "ls -l /proc/meminfo shows a size of 0, yet cat prints many lines. Why?"
    options: ["The file is compressed", "It is a virtual file the kernel generates when you read it; there is nothing stored on disk", "ls is wrong about all files"]
    answer: 1
    explain: "procfs and sysfs live in memory. Their contents are produced on each read, so the size reported for most of them is 0."
  - q: "Where would you look to see which files a running process (PID 4242) has open?"
    options: ["/var/log/4242", "/proc/4242/fd", "/etc/4242"]
    answer: 1
    explain: "/proc/<pid>/fd has one symlink per open descriptor, pointing at the file, pipe or socket. lsof reads the same information."
  - q: "Which directory is the conventional place for a service's changing data such as logs, caches and databases?"
    options: ["/etc", "/var", "/usr"]
    answer: 1
    explain: "/etc holds configuration, /usr holds installed programs and read-only data, and /var holds variable data: /var/log, /var/lib, /var/cache."
links:
  - { title: "proc(5) (man7.org)", url: "https://man7.org/linux/man-pages/man5/proc.5.html" }
  - { title: "The /proc filesystem (kernel.org)", url: "https://docs.kernel.org/filesystems/proc.html" }
  - { title: "sysfs(5) (man7.org)", url: "https://man7.org/linux/man-pages/man5/sysfs.5.html" }
  - { title: "hier(7): filesystem hierarchy (man7.org)", url: "https://man7.org/linux/man-pages/man7/hier.7.html" }
---
Linux has one directory tree starting at `/`. Each disk partition, network share or in-memory filesystem is mounted onto a directory in that tree, so paths never start with a drive letter. "Everything is a file" means that regular files, directories, devices, pipes and sockets are all reached through the same few calls (open, read, write, close) on a file descriptor. The kernel uses the same idea to show its own state: `/proc` and `/sys` are filesystems whose files are generated on demand.

## Where things live

| Path | What is there |
| --- | --- |
| `/etc` | Configuration, mostly plain text |
| `/usr/bin`, `/usr/lib` | Installed programs and libraries (`/bin` and `/lib` are symlinks to them on modern distributions) |
| `/var` | Data that changes: `/var/log`, `/var/lib` (databases, package state), `/var/cache` |
| `/home`, `/root` | Users' home directories |
| `/tmp`, `/run` | Temporary files; `/run` holds runtime state such as PID files and sockets, emptied at boot |
| `/dev` | Device files: `/dev/null`, `/dev/sda`, `/dev/pts/0` |
| `/proc`, `/sys` | The kernel's view of processes, devices and settings |

`mount` or `findmnt` lists what is mounted where; `df -h` shows how full each filesystem is.

## /proc: ask the kernel about a process

```sh
sleep 300 &
tr '\0' ' ' < /proc/$!/cmdline; echo
grep -E '^(Name|State|PPid|VmRSS|Threads)' /proc/$!/status
readlink /proc/$!/exe /proc/$!/cwd
```

```text
sleep 300 
Name:	sleep
State:	S (sleeping)
PPid:	3631
VmRSS:	    1284 kB
Threads:	1
/usr/bin/sleep
/
```

Each PID has a directory with dozens of entries: `cmdline` (arguments, NUL-separated), `environ`, `status`, `fd/` (open descriptors), `maps` (memory mappings), `limits`, `cgroup`, `ns/` (namespaces) and more. This is where `ps`, `top`, `lsof` and `free` get their numbers. `/proc/self` is always the process doing the reading.

There are system-wide files too: `/proc/meminfo`, `/proc/loadavg`, `/proc/cpuinfo`, and `/proc/sys/`, where kernel settings live (`sysctl vm.swappiness` reads `/proc/sys/vm/swappiness`). None of it is stored anywhere:

```sh
stat -c '%s bytes' /proc/meminfo; wc -c < /proc/meminfo
```

```text
0 bytes
1392
```

## /sys: devices and drivers

`/sys` (sysfs) exposes the kernel's device model as one value per file, which is easy for scripts to read:

```sh
ls /sys/class/net
cat /sys/class/net/eth0/mtu
cat /sys/fs/cgroup/cgroup.controllers
```

```text
bonding_masters
erspan0
eth0
gre0
gretap0
ip6_vti0
ip6gre0
ip6tnl0
ip_vti0
lo
sit0
tunl0
65535
cpuset cpu io memory hugetlb pids rdma
```

Besides `eth0` and loopback `lo`, Docker Desktop's kernel shows a set of tunnel devices that are never configured. `/sys/class/net` lists network interfaces, `/sys/block` disks, and `/sys/fs/cgroup` is the cgroup tree that resource limits and containers are built on. Some files are writable by root to change settings, and inside a container `/sys` is usually mounted read-only.

## Device files

`ls -l /dev/null` shows `crw-rw-rw-` and `1, 3` where a size would be: `c` is a character device and 1, 3 are the major and minor numbers that select the driver. Reading `/dev/urandom` gives random bytes, writing to `/dev/null` discards data, and the terminal you type in is `/dev/pts/N`.

## On macOS

macOS has a single tree from `/` as well, but no `/proc` or `/sys`. The same questions are answered by commands: `ps`, `lsof -p <pid>`, `vm_stat`, `sysctl -a` and `ioreg`. Its layout also differs: user homes are in `/Users`, and `/tmp` and `/var` are symlinks into `/private`.
