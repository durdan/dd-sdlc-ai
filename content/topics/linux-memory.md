---
id: linux-memory
title: "Virtual memory, the page cache and the OOM killer"
summary: Why 'used' memory is misleading, and what happens when it runs out
why: "Reading free, top and container memory graphs correctly is the difference between a real leak and a healthy cache, and between a crash and an OOM kill."
requires: [linux-processes, linux-filesystem]
lesson: none
points:
  - title: Every process has its own address space
    text: "Addresses are virtual. The kernel maps pages of them to physical memory only when they are first touched."
  - title: VSZ is promised, RSS is resident
    text: "Virtual size counts everything mapped; resident set size counts what is actually in RAM right now."
  - title: Free memory becomes cache
    text: "The kernel keeps recently read and written file data in the page cache and gives it back when programs need it. Watch 'available', not 'free'."
  - title: The OOM killer is the last resort
    text: "When memory (or a cgroup's limit) runs out and nothing can be reclaimed, the kernel kills a process with SIGKILL."
quiz:
  - q: "free shows very little 'free' memory but a large 'available' figure. Is the machine short of memory?"
    options: ["Yes, add RAM now", "No: most memory is page cache, which the kernel reclaims as soon as programs need it", "It means swap is full"]
    answer: 1
    explain: "Unused RAM is wasted, so Linux fills it with cached file data. available estimates how much could be handed to programs without swapping."
  - q: "A process maps 1 GiB but touches only 200 MiB. Roughly what are its VSZ and RSS?"
    options: ["Both 1 GiB", "VSZ about 1 GiB, RSS about 200 MiB", "Both 200 MiB"]
    answer: 1
    explain: "Pages are allocated on first touch. The mapping counts towards virtual size at once; only touched pages become resident."
  - q: "A container exits with code 137 and docker inspect says OOMKilled true. What happened?"
    options: ["The app called exit(137)", "The container's memory cgroup hit its limit and the kernel's OOM killer sent SIGKILL", "Docker ran out of disk"]
    answer: 1
    explain: "137 is 128 + 9 (SIGKILL). With a memory limit, the OOM killer works per cgroup: the container dies even if the host has memory to spare."
links:
  - { title: "Memory management concepts (kernel.org)", url: "https://docs.kernel.org/admin-guide/mm/concepts.html" }
  - { title: "proc_meminfo(5) (man7.org)", url: "https://man7.org/linux/man-pages/man5/proc_meminfo.5.html" }
  - { title: "mmap(2) (man7.org)", url: "https://man7.org/linux/man-pages/man2/mmap.2.html" }
  - { title: "Documentation for /proc/sys/vm (kernel.org)", url: "https://docs.kernel.org/admin-guide/sysctl/vm.html" }
---
Each process sees its own virtual address space. The kernel splits it into pages (4 KiB on most systems; some ARM64 kernels use 16 or 64 KiB; `getconf PAGESIZE` tells you) and maps each page to physical RAM only when the process first touches it. That is why a process can reserve far more than it uses, why "used memory" means several different things, and why Linux can fill spare RAM with cached file data. When memory truly runs out, the out-of-memory (OOM) killer picks a process and kills it.

## Reserved is not resident

```sh
python3 - <<'EOF'
import mmap, os, subprocess
def show(label):
    out = subprocess.run(["ps", "-o", "vsz=,rss=", "-p", str(os.getpid())], capture_output=True, text=True)
    print(label, out.stdout.strip())
m = mmap.mmap(-1, 1 << 30)            # map 1 GiB, touch nothing
show("after mmap 1GiB:")
for i in range(0, 200 << 20, 4096):   # touch 200 MiB, one byte per page
    m[i] = 1
show("after touching 200MiB:")
EOF
```

```text
after mmap 1GiB: 1064824 10592
after touching 200MiB: 1064824 215396
```

Both columns are in KiB. VSZ (virtual size) jumped by 1 GiB at once; RSS (resident set size) grew only when pages were written. The same thing happens when the JVM reserves its maximum heap or Go maps arenas: big VSZ is normal, RSS is what costs RAM. Even RSS overstates things a bit, because shared libraries are counted in every process that maps them; `PSS` in `/proc/<pid>/smaps_rollup` shares them out fairly.

## The page cache

```sh
free -m
dd if=/dev/urandom of=/tmp/big bs=1M count=300 status=none
free -m | head -2
```

```text
               total        used        free      shared  buff/cache   available
Mem:            7835         838        6463          24         729        6997
Swap:           1023           0        1023
               total        used        free      shared  buff/cache   available
Mem:            7835         837        6160          24        1037        6997
```

Writing a 300 MB file moved about 300 MB from `free` to `buff/cache`, while `available` barely changed. File data you read or write stays in RAM so the next read is fast, and writes are collected as dirty pages and flushed to disk in the background (`Dirty:` in `/proc/meminfo`, or call `fsync` when it must be on disk now). When a program needs memory, the kernel drops clean cached pages first. So on a busy server low `free` is healthy; low `available` combined with swapping or OOM kills is the problem.

## When memory runs out

If programs need more than RAM plus swap, and the kernel can't reclaim enough cache, it invokes the OOM killer. It scores processes mostly by how much memory they use, adjusted by `/proc/<pid>/oom_score_adj` (-1000 exempts a process, +1000 makes it the first choice), kills the winner with SIGKILL and logs it to the kernel log (`dmesg` or `journalctl -k` shows `Out of memory: Killed process ...`).

Containers make this local. A memory limit is a cgroup limit, and hitting it triggers the OOM killer inside that cgroup only. This was run on the Mac host against Docker Desktop:

```sh
docker run --name oomtest -m 64m --memory-swap 64m ubuntu:24.04 \
  bash -c 'head -c 200m /dev/zero | tail > /dev/null'; echo "exit=$?"
docker inspect -f '{{.State.OOMKilled}} {{.State.ExitCode}}' oomtest; docker rm oomtest
```

```text
bash: line 1:     8 Broken pipe             head -c 200m /dev/zero
         9 Killed                  | tail > /dev/null
exit=137
true 137
oomtest
```

`tail` buffers its input looking for the last lines of a 200 MB stream with no newlines, passes the 64 MiB limit and is killed. Exit code 137 plus `OOMKilled: true` is the signature to look for in Kubernetes too (`Reason: OOMKilled`). The fix is a higher limit or less memory use, not a retry.

## On macOS

macOS also uses virtual memory and a file cache, but reports it differently: `vm_stat` and Activity Monitor show wired, active, inactive and compressed memory (macOS compresses pages before swapping), and there is no OOM killer in the Linux sense; the system asks apps to free memory and may terminate them under pressure. `free` doesn't exist on macOS.
