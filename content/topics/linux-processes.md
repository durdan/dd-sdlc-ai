---
id: linux-processes
title: "Processes: fork, exec and wait"
summary: How every program on Linux is started, and what happens when it ends
why: "Shells, servers, containers and process managers all start programs the same way. Zombies, orphans and the PID 1 problem in containers make sense once you see it."
lesson: none
points:
  - title: fork copies, exec replaces
    text: "fork makes a near-identical child process; exec swaps the program running in a process for another, keeping its PID and open files."
  - title: The parent must wait
    text: "When a child exits, its exit status is kept until the parent collects it with wait. Until then it is a zombie."
  - title: Orphans go to PID 1
    text: "If a parent dies first, its children are re-parented to PID 1 (or a subreaper), which is expected to reap them."
  - title: Exit codes are the result
    text: "0 means success, 1 to 125 are the program's own errors, 128 + n means it was killed by signal n."
quiz:
  - q: "What does execve() do to the calling process?"
    options: ["Starts a new process next to it", "Replaces the program in the same process: same PID, same open file descriptors, new code and memory", "Pauses it until the new program ends"]
    answer: 1
    explain: "exec does not create a process. The PID stays, file descriptors without close-on-exec stay open, and the old program's memory is replaced by the new one. That is how redirections set up by a shell reach the program."
  - q: "ps shows a process in state Z (defunct). What is it?"
    options: ["A process using too much CPU", "A process that has exited but whose parent has not yet called wait() to collect its status", "A process in swap"]
    answer: 1
    explain: "A zombie uses no memory or CPU, only a slot in the process table. It disappears when its parent reaps it, or when the parent exits and PID 1 reaps it."
  - q: "In a container whose PID 1 is your app, child processes keep piling up as zombies. Why?"
    options: ["Containers cannot reap processes", "Orphans are re-parented to PID 1, and your app never calls wait() on children it didn't start", "The kernel is out of PIDs"]
    answer: 1
    explain: "PID 1 has the job of reaping orphans. A normal app doesn't do that, so use a tiny init (docker run --init, tini, dumb-init) as PID 1."
links:
  - { title: "fork(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/fork.2.html" }
  - { title: "execve(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/execve.2.html" }
  - { title: "wait(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/wait.2.html" }
---
A process is a running program: memory, open files, a user ID and at least one thread, identified by a PID. Every process except the first one was created by another. The parent calls fork() to make a copy of itself, the child calls execve() to replace its program with a different one, and the parent calls wait() to collect the child's exit status when it ends. Your shell does exactly this for every command you type.

## Watch a shell start a program

The examples run in an Ubuntu 24.04 container with `procps` and `strace` installed (see the note under the path map). `strace -f` follows children and prints the system calls named with `-e`:

```sh
strace -f -qq -e trace=clone,execve,wait4 bash -c "ls /etc/hostname; echo done"
```

```text
execve("/usr/bin/bash", ["bash", "-c", "ls /etc/hostname; echo done"], 0x... /* 6 vars */) = 0
clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x...) = 3539
[pid  3538] wait4(-1,  <unfinished ...>
[pid  3539] execve("/usr/bin/ls", ["ls", "/etc/hostname"], 0x... /* 6 vars */) = 0
/etc/hostname
<... wait4 resumed>[{WIFEXITED(s) && WEXITSTATUS(s) == 0}], 0, NULL) = 3539
--- SIGCHLD {si_signo=SIGCHLD, si_code=CLD_EXITED, si_pid=3539, si_uid=0, si_status=0, si_utime=0, si_stime=0} ---
wait4(-1, 0x..., WNOHANG, NULL) = -1 ECHILD (No child processes)
done
```

(Memory addresses are replaced with `0x...`; PIDs will differ.) Bash (PID 3538) forks; on Linux the C library implements `fork()` with the `clone` system call. The child, 3539, calls `execve` to become `ls`, while the parent blocks in `wait4`. When `ls` exits, the kernel sends the parent `SIGCHLD` and `wait4` returns the exit status. Bash runs `echo` itself because it is a builtin. With a single command, `bash -c "ls"` skips the fork and simply execs `ls`.

## Copy-on-write makes fork cheap

The child starts with a copy of the parent's memory, but Linux shares the pages and copies one only when either side writes to it. Since the child usually calls exec at once, almost nothing is copied. What the child keeps through exec matters more: its PID, its parent, its current directory, its environment (if passed on) and every open file descriptor not marked close-on-exec. That is how `ls > out.txt` works: the shell opens the file in the child, then execs `ls`, which simply writes to descriptor 1.

## Zombies and orphans

A child that has exited keeps a small entry (PID and exit status) until its parent calls wait(). In that state `ps` shows it as `Z`:

```text
  PID  PPID STAT CMD
 3526  3514 Z    [python3] <defunct>
```

A few short-lived zombies are normal. Many that never go away mean the parent has a bug. If the parent itself dies, its children are re-parented to PID 1 (or to a process marked as a "child subreaper"), whose job is to reap them. On a normal system PID 1 is systemd. In a container, PID 1 is whatever you started, and most applications never reap children they didn't create. Our lab container ran `sleep infinity` as PID 1, and after a few minutes of experiments `top` showed `5 zombie`. `docker run --init` puts a tiny init in front of your program to fix this; the Docker path covers it.

## Exit status

`$?` in the shell holds the last exit status. By convention 0 is success and anything else is an error the program chose. When a process is killed by a signal, shells report 128 plus the signal number: 137 is SIGKILL (9), often the OOM killer, and 143 is SIGTERM (15).

## On macOS

macOS has the same fork, exec and wait model (it is POSIX), and `ps -o pid,ppid,stat,command` works. There is no `strace`; `dtruss` exists but needs System Integrity Protection relaxed, so use a Linux container to trace system calls.
