---
id: csf-os
title: "How the OS runs programs: processes, threads, virtual memory"
summary: Every program believes it has the machine to itself; the kernel keeps up the illusion
why: "Memory limits, CPU throttling, 'too many threads', slow forks and page faults are all the operating system's abstractions showing through."
requires: [csf-cpu, csf-memory-hierarchy]
lesson: none
points:
  - title: A process is an isolated program
    text: "It has its own virtual address space, open files and at least one thread. One process can't read another's memory unless they arrange to share it."
  - title: Threads share a process
    text: "Threads in a process share its memory and files but each has its own stack and registers. That makes sharing cheap and mistakes easy."
  - title: The scheduler time-slices
    text: "With more runnable threads than cores, the kernel switches between them, saving and restoring their state: a context switch."
  - title: Virtual memory maps pages
    text: "Each process sees addresses that the CPU's MMU translates, page by page (usually 4 KB), into physical memory, loading pages on demand."
quiz:
  - q: What is the main difference between two threads and two processes running the same code?
    options:
      - "Threads are always faster"
      - "Threads share one address space, so they can read each other's data directly; processes have separate address spaces"
      - "Processes can't run at the same time"
    answer: 1
    explain: "Sharing is what makes threads cheap to communicate and also what makes data races possible, the subject of the next topic."
  - q: A process allocates 1 GB but its resident memory (RSS) grows only to 50 MB. Why?
    options:
      - "The allocation failed silently"
      - "The kernel maps pages lazily; physical memory is assigned only when a page is first touched"
      - "The memory was compressed to 50 MB"
    answer: 1
    explain: "Reserving virtual address space is cheap. A page fault on first access is what assigns a physical page, which is why RSS grows as memory is used, not when it is allocated."
  - q: Why does a context switch cost more than the few hundred instructions it takes?
    options:
      - "The kernel has to reboot the core"
      - "The new thread usually finds its data no longer in the caches and TLB, so it runs slowly for a while"
      - "Context switches write to disk"
    answer: 1
    explain: "Saving registers is quick. Refilling caches and the translation lookaside buffer for a different working set is the larger, hidden cost."
links:
  - { title: "Operating Systems: Three Easy Pieces (Arpaci-Dusseau, free online)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" }
  - { title: "MIT 6.1810: Operating System Engineering", url: "https://pdos.csail.mit.edu/6.1810/" }
  - { title: "proc(5): process information pseudo-filesystem (Linux man page)", url: "https://man7.org/linux/man-pages/man5/proc.5.html" }
---
An operating system kernel lets many programs share one machine while each behaves as if it had the CPU and memory to itself. It does this with a few abstractions: the **process** (a running program with its own memory), the **thread** (a sequence of instructions the scheduler can run on a core), and **virtual memory** (private address spaces mapped onto shared physical RAM). The Linux path shows these from the command line; this topic is the model behind them.

## Processes

A process is a running program plus everything the kernel tracks for it: an address space holding its code, data, heap and stacks; a table of open files and sockets; its user and permissions; and one or more threads. Processes are isolated: a crash or a wild pointer in one can't corrupt another. They talk only through channels the kernel provides, such as pipes, sockets, files, signals and explicitly shared memory.

On Unix, a new process is created by `fork` (copy the current process) followed by `exec` (replace its program). Copy-on-write makes `fork` cheap: parent and child share pages until one of them writes.

## Threads and scheduling

A thread is the unit the kernel schedules. Threads in the same process share its memory and files, and each has its own stack, registers and program counter. A machine with 8 cores can run 8 threads at the same instant; everything else waits in a run queue.

The **scheduler** decides who runs. When a thread blocks (waiting for disk, a socket or a lock), or uses up its time slice (a few milliseconds), the kernel performs a **context switch**: it saves the thread's registers, picks another thread, and restores its registers. Switching itself takes on the order of microseconds, but the incoming thread often finds the caches and the TLB filled with someone else's data. Thousands of busy threads therefore spend real time just being switched, which is one reason servers use thread pools and event loops instead of a thread per connection.

## Virtual memory

Every address a program uses is virtual. The CPU's memory management unit (MMU) translates it through **page tables**, maintained by the kernel per process, into a physical address, one page (usually 4 KB) at a time. A small cache of recent translations, the **TLB**, keeps this fast.

Consequences you meet in practice:

- **Isolation**: the same virtual address in two processes maps to different physical pages.
- **Lazy allocation**: `malloc` of 1 GB only reserves address space. The first touch of each page causes a **page fault**, and the kernel then assigns a physical page. Resident set size (RSS) is the memory actually backed by RAM.
- **Memory-mapped files**: a file can be mapped into the address space, and pages are read from disk only when touched.
- **Swapping and the OOM killer**: when RAM runs out, the kernel can write rarely used pages to disk (much slower) or, on Linux, kill a process to free memory. In containers the limit is the cgroup's, not the machine's.

## User mode and kernel mode

Programs run in user mode and can't touch hardware or other processes' memory. To read a file, send a packet or create a thread, they make a **system call**, a controlled switch into kernel mode. Each costs roughly hundreds of nanoseconds or more, which is why buffered I/O, batching and APIs such as `io_uring` exist.
