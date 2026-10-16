---
id: linux-performance
title: "Performance triage with the USE method"
summary: For each resource, check utilization, saturation and errors
why: "When a server is slow, guessing wastes the first hour. A short checklist over CPU, memory, disk and network finds the bottleneck, or rules the machine out, in minutes."
requires: [linux-memory, linux-isolation]
lesson: none
points:
  - title: Utilization
    text: "How busy the resource was over an interval, as a percentage: CPU 90% busy, disk 100% busy."
  - title: Saturation
    text: "Work that is waiting because the resource is full, usually a queue: runnable threads, disk queue length, swapping."
  - title: Errors
    text: "Failed operations, often retried silently: disk errors, dropped packets, OOM kills."
  - title: Averages hide bursts
    text: "A five-minute average of 60% CPU can hide seconds at 100%. Look at one-second samples when hunting latency."
quiz:
  - q: "vmstat 1 shows the r column steadily at 12 on a 4-CPU machine. What does it mean?"
    options: ["12 processes are sleeping", "The CPUs are saturated: about 12 threads are runnable or running for 4 CPUs, so many are waiting their turn", "12% CPU use"]
    answer: 1
    explain: "r counts threads running or waiting for a CPU. Consistently more than the number of CPUs is CPU saturation, which shows up as latency even if utilization looks merely high."
  - q: "On Linux, the load average is high but CPU use is low. What could it be?"
    options: ["Nothing; load average is CPU only", "Threads in uninterruptible sleep (state D), usually waiting on disk or network storage, which Linux counts in the load average", "Too much free memory"]
    answer: 1
    explain: "Linux load averages include threads waiting for I/O in state D, unlike most other Unix systems. Check iostat and ps for D-state threads."
  - q: "Which tool answers 'is a disk the bottleneck?' most directly?"
    options: ["free -m", "iostat -xz 1: %util, the queue size (aqu-sz) and r_await/w_await per device", "uptime"]
    answer: 1
    explain: "%util is utilization, aqu-sz is saturation, and await times show how long each I/O takes including queueing. Rising await with a high queue means the device can't keep up."
links:
  - { title: "The USE Method (Brendan Gregg)", url: "https://www.brendangregg.com/usemethod.html" }
  - { title: "vmstat(8) (man7.org)", url: "https://man7.org/linux/man-pages/man8/vmstat.8.html" }
  - { title: "top(1) (man7.org)", url: "https://man7.org/linux/man-pages/man1/top.1.html" }
  - { title: "proc_loadavg(5) (man7.org)", url: "https://man7.org/linux/man-pages/man5/proc_loadavg.5.html" }
---
The USE method, from Brendan Gregg, is a checklist for the first minutes of a performance problem: for every resource, check its utilization, its saturation and its errors. Resources are the physical parts (CPUs, memory, disks, network interfaces) plus software limits such as file descriptors, thread pools and cgroup quotas. Working through the list either finds a resource that is busy, queued or failing, or tells you the bottleneck is elsewhere, usually in the application or a dependency.

## The first five commands

```sh
uptime
vmstat 1 5
mpstat -P ALL 1 1
iostat -xz 1 2
free -m
```

`uptime` gives load averages over 1, 5 and 15 minutes: the number of threads running, waiting for a CPU or (on Linux) in uninterruptible sleep, usually disk I/O. Compare them with the number of CPUs (`nproc`); rising numbers mean a growing queue. Here is `vmstat` on a quiet 16-CPU machine, and then while two `yes > /dev/null` loops burn CPU:

```text
procs -----------memory---------- ---swap-- -----io---- -system-- -------cpu-------
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 0  0      0 5723904 163852 1425284    0    0   184   548 5414 7995  1  1 99  0  0  0

 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st gu
 3  0      0 5377040 169760 1673156    0    0    48 14572 22363 31193  8 11 80  1  0  0
```

(One line from each run; the first line of any vmstat run is an average since boot and should be skipped.) The columns that matter most: `r` runnable threads (CPU saturation when it stays above the CPU count), `b` blocked on I/O, `si`/`so` swapping in and out (memory saturation: any steady non-zero value is bad), and `us sy id wa st`, the CPU split into user, system, idle, I/O wait and stolen by the hypervisor. Two busy loops on 16 CPUs moved `id` from 99 to 80, utilization without saturation.

`mpstat -P ALL` breaks CPU down per core, which catches one hot single-threaded process hidden in an average. `iostat -xz` shows per-disk `%util`, the average queue `aqu-sz` and `r_await`/`w_await` in milliseconds. (`mpstat` and `iostat` are in the `sysstat` package.)

## The checklist

| Resource | Utilization | Saturation | Errors |
| --- | --- | --- | --- |
| CPU | `mpstat` %usr + %sys, `top` | `vmstat` r > CPUs, load average, `/proc/pressure/cpu` | rare; check `dmesg` |
| Memory | `free -m` (used vs available) | `vmstat` si/so, `/proc/pressure/memory` | OOM kills in `journalctl -k` |
| Disk | `iostat -xz` %util | `iostat` aqu-sz, rising await | `dmesg` I/O errors, `smartctl` |
| Network | `sar -n DEV 1` throughput vs link speed | `ss -s`, `nstat` retransmits, drops | `ip -s link` errors and drops |
| Software limits | open fds vs `ulimit -n`, pool sizes | requests queued in the app | `EMFILE`, timeouts, rejected tasks |
| cgroups | `memory.current`, `cpu.stat` usage | `cpu.stat` nr_throttled, `memory.events` high | `memory.events` oom_kill |

Pressure stall information (`/proc/pressure/*`, kernel 4.20 and later) directly reports the share of time tasks waited for CPU, memory or I/O, which is saturation in one number.

## Then look at processes

`top` (or `htop`) sorted by CPU (`P`) or memory (`M`) names the process behind a busy resource. Check the `S` column too: `D` means waiting on I/O, `Z` zombies. In `top`'s header, `wa` is I/O wait and `st` is steal, CPU your virtual machine wanted but the host gave to someone else, a sign of a noisy neighbour or an undersized instance. In containers, check CPU throttling (`nr_throttled` in the cgroup's `cpu.stat`) before blaming the code.

If every resource looks healthy, the machine is not the bottleneck: move on to the application (profilers, slow query logs) and its dependencies.

## On macOS

`top`, `uptime` and `iostat` exist with different columns, `vm_stat` replaces `vmstat` and `free`, Activity Monitor shows memory pressure. The USE questions are the same; for Linux numbers, run the tools in a Linux VM or container, keeping in mind that it shares the VM's CPUs and memory, not the Mac's directly.
