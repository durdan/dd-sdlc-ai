---
id: linux-fds
title: "File descriptors, redirection and pipes"
summary: Numbered handles to open files, and how the shell wires them up
why: "Logs that vanish, 2>&1 in the wrong place, a pipeline that hangs: all of it is about which descriptor points where."
requires: [linux-processes]
lesson: none
points:
  - title: A descriptor is a small number
    text: "Each process has a table: 0 is stdin, 1 is stdout, 2 is stderr, and every file, pipe or socket it opens gets the next free number."
  - title: The shell sets them up before exec
    text: "Redirection (>, 2>, <) opens files and puts them at the right numbers in the child; the program just reads 0 and writes 1 and 2."
  - title: Order matters
    text: "Redirections are applied left to right, so > file 2>&1 sends both to the file, while 2>&1 > file does not."
  - title: A pipe is a kernel buffer
    text: "It connects one process's stdout to the next one's stdin. A full pipe blocks the writer; a pipe with no reader kills it with SIGPIPE."
quiz:
  - q: "Which command sends both stdout and stderr of ls to all.txt?"
    options: ["ls 2>&1 > all.txt", "ls > all.txt 2>&1", "ls 2> all.txt 1>&1"]
    answer: 1
    explain: "First 1 is pointed at the file, then 2 is made a copy of 1, so both go to the file. In the other order, 2 is copied from 1 while 1 still points at the terminal."
  - q: "Why does a program's error message still appear on screen in ls /nope | grep x?"
    options: ["grep prints it", "A pipe connects only stdout (1); stderr (2) still points at the terminal", "The kernel copies errors to the terminal"]
    answer: 1
    explain: "The shell replaces only descriptor 1 with the pipe. Use 2>&1 | (or |& in bash) to send stderr through the pipe too."
  - q: "What happens to a process writing into a pipe when the pipe's buffer is full?"
    options: ["The data is dropped", "The write blocks until the reader takes data out", "The pipe grows without limit"]
    answer: 1
    explain: "A Linux pipe holds 64 KiB by default. A blocked writer is backpressure: the fast side waits for the slow side."
links:
  - { title: "pipe(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/pipe.7.html" }
  - { title: "Redirections (Bash manual)", url: "https://www.gnu.org/software/bash/manual/html_node/Redirections.html" }
  - { title: "open(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/open.2.html" }
---
When a process opens a file, the kernel gives it back a file descriptor: a small integer that indexes the process's table of open files. The same table holds pipes, sockets, terminals and devices, so reading and writing look the same for all of them. By convention a program starts with three already open: 0 (standard input), 1 (standard output) and 2 (standard error). The shell's redirections and pipes simply decide what those three numbers point at before it execs the program.

## See a process's descriptors

`/proc/self/fd` lists the descriptors of whichever process reads it, here `ls`:

```sh
ls -l /proc/self/fd
ls -l /proc/self/fd | cat
ls -l /proc/self/fd 2>/dev/null
```

```text
lrwx------ 1 root root 64 Oct 16 10:23 0 -> /dev/pts/0
lrwx------ 1 root root 64 Oct 16 10:23 1 -> /dev/pts/0
lrwx------ 1 root root 64 Oct 16 10:23 2 -> /dev/pts/0
lr-x------ 1 root root 64 Oct 16 10:23 3 -> /proc/3557/fd

lrwx------ 1 root root 64 Oct 16 10:23 0 -> /dev/pts/0
l-wx------ 1 root root 64 Oct 16 10:23 1 -> pipe:[17960]
lrwx------ 1 root root 64 Oct 16 10:23 2 -> /dev/pts/0
lr-x------ 1 root root 64 Oct 16 10:23 3 -> /proc/3558/fd

lrwx------ 1 root root 64 Oct 16 10:23 0 -> /dev/pts/0
lrwx------ 1 root root 64 Oct 16 10:23 1 -> /dev/pts/0
l-wx------ 1 root root 64 Oct 16 10:23 2 -> /dev/null
lr-x------ 1 root root 64 Oct 16 10:23 3 -> /proc/3560/fd
```

(The `total 0` lines are left out and blank lines added between runs.) At a terminal all three point at the terminal device. Piping into `cat` replaces only 1 with a pipe; `2>/dev/null` replaces only 2. Descriptor 3 is the directory `ls` opened to read the listing. `ls` itself has no idea any of this happened.

## Redirection, left to right

```sh
ls /etc/hostname /nope > out.txt 2> err.txt; echo "exit=$?"
cat out.txt err.txt
ls /etc/hostname /nope > all.txt 2>&1; cat all.txt
ls /etc/hostname /nope 2>&1 > only-out.txt
```

```text
exit=2
/etc/hostname
ls: cannot access '/nope': No such file or directory
ls: cannot access '/nope': No such file or directory
/etc/hostname
ls: cannot access '/nope': No such file or directory
```

`2>&1` means "make descriptor 2 a copy of whatever 1 is right now" (the shell calls `dup2`). In the last line 2 copies the terminal before 1 is pointed at the file, so the error still reaches the screen and only the listing goes to `only-out.txt`. `>>` appends instead of truncating, `<` feeds a file to stdin, and `&>` is bash shorthand for "both".

## Pipes

`a | b` asks the kernel for a pipe, a buffer with a write end and a read end, then forks both processes with `a`'s descriptor 1 on the write end and `b`'s descriptor 0 on the read end. Both run at the same time. On Linux a pipe holds 64 KiB by default; when it is full the writer blocks until the reader catches up, which keeps a fast producer from flooding memory. If the reader exits, the next write gets `SIGPIPE` (or the error `EPIPE`), which is why `yes | head -1` ends straight away instead of running forever. A pipeline's exit status is the last command's; `set -o pipefail` makes a failure anywhere count.

## Leaks and limits

Every open descriptor counts against a per-process limit (`ulimit -n`, covered with resource limits). A server that opens files or sockets and forgets to close them eventually fails with `EMFILE: Too many open files`. `ls /proc/<pid>/fd | wc -l` or `lsof -p <pid>` shows how many it holds.

## On macOS

Descriptors, redirection and pipes work the same way in zsh and bash on macOS. There is no `/proc`; use `lsof -p <pid>` to list a process's open files, or `ls /dev/fd` to see the current process's descriptors.
