---
id: linux
title: "Linux: what happens under your program"
promise: "Follow your program from the shell that starts it through system calls, files, memory and sockets to the service manager, limits and namespaces that run it in production, and know which tool answers which question when something goes wrong."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: Processes
    blurb: Start, wire up, signal, configure
    topics: [linux-processes, linux-fds, linux-signals, linux-env]
  - title: Files and users
    blurb: One tree, and who may touch it
    topics: [linux-filesystem, linux-permissions]
  - title: The kernel boundary
    blurb: System calls, memory, sockets
    topics: [linux-syscalls, linux-memory, linux-networking]
  - title: Running in production
    blurb: Services, isolation, triage
    topics: [linux-systemd, linux-isolation, linux-performance]
bridges:
  - id: backpressure
    why: "A full pipe blocks its writer until the reader catches up. The backpressure pattern applies the same rule between services."
  - id: bulkhead
    why: "cgroups put a hard wall around each service's CPU, memory and process count, which is the bulkhead pattern enforced by the kernel."
next: [stay-up]
---
The examples ran in an Ubuntu 24.04 container (kernel 6.12 under Docker Desktop on a Mac) after `apt-get install procps strace iproute2 sysstat dnsutils python3 curl`. To follow along, start one with `docker run --rm -it --cap-add SYS_PTRACE ubuntu:24.04`. PIDs, addresses and timings will differ on your machine. Each topic ends with what is different on macOS.
