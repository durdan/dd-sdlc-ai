---
id: linux-syscalls
title: "System calls and strace"
summary: The narrow door between your program and the kernel
why: "When a program hangs, can't find a file or is mysteriously slow, watching its system calls usually shows why in seconds, without reading its code."
requires: [linux-processes, linux-fds]
lesson: none
points:
  - title: Programs can't touch hardware
    text: "Opening files, sending packets, allocating memory and starting processes all go through system calls into the kernel."
  - title: Libraries wrap them
    text: "fopen, print and HTTP clients end up as openat, write, connect and friends. There are a few hundred system calls in total."
  - title: Failures come back as errno
    text: "A failed call returns -1 and an error code such as ENOENT, EACCES or EMFILE, which is often the real cause behind a vague error."
  - title: strace shows them live
    text: "It prints every call, its arguments and result. -f follows children, -e filters, -c counts, -T times each call."
quiz:
  - q: "An app fails with a vague 'config error'. How can strace help without reading its code?"
    options: ["It decompiles the app", "strace -f -e trace=openat shows which paths it tries to open and which fail with ENOENT or EACCES", "It fixes the config"]
    answer: 1
    explain: "Seeing the exact path that failed, and why, usually explains the error: the app looks in a different directory than you think, or lacks permission."
  - q: "What does strace -c print?"
    options: ["Colourised output", "A summary table: how many times each system call was made, errors and time spent", "Only the calls that failed"]
    answer: 1
    explain: "-c counts instead of printing each call, which is a quick way to see whether a program is dominated by reads, polls, mmaps or something unexpected."
  - q: "Why is strace not suitable for leaving on in production?"
    options: ["It needs a kernel rebuild", "It stops the traced process on every system call, which can slow it down many times over", "It only works on root's processes"]
    answer: 1
    explain: "strace uses ptrace, which switches to the tracer at each call. For low-overhead tracing in production use eBPF tools such as bpftrace or perf trace."
links:
  - { title: "syscalls(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/syscalls.2.html" }
  - { title: "strace(1) (man7.org)", url: "https://man7.org/linux/man-pages/man1/strace.1.html" }
  - { title: "strace project", url: "https://strace.io/" }
---
User programs on Linux run without direct access to hardware or to other processes' memory. Whenever they need something only the kernel can do, such as opening a file, reading from a socket, mapping memory or starting a process, they make a system call: a controlled jump into the kernel with a call number and a few arguments, returning a result or an error code. Every library and runtime, from the C library to the JVM, is built on these few hundred calls, and `strace` lets you watch them.

## Watch cat read a file

```sh
echo hello > hi.txt
strace -e trace=openat,read,write,close cat hi.txt 2>&1 >/dev/null | tail -8
```

```text
openat(AT_FDCWD, "hi.txt", O_RDONLY)    = 3
read(3, "hello\n", 131072)              = 6
write(1, "hello\n", 6)                  = 6
read(3, "", 131072)                     = 0
close(3)                                = 0
close(1)                                = 0
close(2)                                = 0
+++ exited with 0 +++
```

(strace writes to stderr, so `2>&1 >/dev/null` sends the trace through the pipe and drops cat's own output.) The earlier lines, cut off by `tail`, are the dynamic loader opening the C library. Then `cat` opens the file and gets descriptor 3, reads up to 128 KiB and gets 6 bytes, writes them to descriptor 1, reads again and gets 0 (end of file), and closes. That is the whole program, as the kernel sees it.

## Find the file a program is looking for

```sh
strace -f -e trace=openat python3 -c 'open("/etc/app/config.yaml")' 2>&1 | grep config.yaml
```

```text
openat(AT_FDCWD, "/etc/app/config.yaml", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
FileNotFoundError: [Errno 2] No such file or directory: '/etc/app/config.yaml'
```

A failed call returns -1 and sets `errno`; strace prints its name. The ones you meet most: `ENOENT` (no such file), `EACCES` (permission denied), `EMFILE` (too many open files), `ECONNREFUSED` (nothing listening), `EAGAIN` (would block, try later) and `EINTR` (interrupted by a signal). Real applications often swallow these into a vague message; the trace shows the actual call and path.

## Count instead of print

```sh
strace -c -f ls /usr/bin > /dev/null 2> summary.txt; head -8 summary.txt
```

```text
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 33.69    0.000220         110         2           getdents64
 15.47    0.000101           6        15           mmap
  8.58    0.000056           7         8           mprotect
  7.81    0.000051           8         6           openat
  6.43    0.000042           5         8           close
  6.13    0.000040           5         7           munmap
```

`getdents64` reads directory entries; most of the rest is the loader mapping libraries. Other useful flags: `-p <pid>` attaches to a running process (a hung one is often sitting in `futex`, `epoll_wait`, `read` or `connect`), `-T` shows the time spent in each call, `-tt` adds timestamps, and `-e trace=%network` or `%file` selects groups of calls.

## Cost and alternatives

strace uses `ptrace`, which stops the traced process at every system call so the tracer can inspect it. That can slow a busy program down many times over, so use it briefly. For production, eBPF-based tools (`bpftrace`, `perf trace`, the BCC tools such as `opensnoop` and `execsnoop`) trace the same events inside the kernel with far lower overhead. In a container, tracing needs `CAP_SYS_PTRACE` (`docker run --cap-add SYS_PTRACE`).

## On macOS

macOS has a different kernel (XNU) with its own system calls. `dtruss` and `dtrace` can trace them, but only with System Integrity Protection partly disabled, so the practical way to learn Linux system calls on a Mac is strace inside a Linux container.
