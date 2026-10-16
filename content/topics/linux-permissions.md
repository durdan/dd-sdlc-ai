---
id: linux-permissions
title: "Users, groups and permissions"
summary: Who a process runs as, and what the nine bits on a file allow
why: "'Permission denied' in production, a world-readable secret, a container running as root: all come down to user IDs and mode bits."
requires: [linux-filesystem]
lesson: none
points:
  - title: Processes have user and group IDs
    text: "The kernel checks numbers, not names. A process acts with the UID and groups it was started with."
  - title: Three classes, three bits
    text: "Each file has an owner and a group, and read, write and execute bits for owner, group and everyone else."
  - title: x means different things
    text: "On a file it allows running it. On a directory it allows entering it and reaching files inside by name."
  - title: Root is special, and divisible
    text: "UID 0 bypasses most checks. Capabilities split that power into pieces, so a process can bind port 80 without being root."
quiz:
  - q: "A file is -rw-r----- owned by alice:devs. Who can read it?"
    options: ["Everyone", "alice and members of the devs group (and root)", "Only alice"]
    answer: 1
    explain: "rw- for the owner, r-- for the group, --- for others. The kernel checks owner first, then group, then others, and uses the first class that matches."
  - q: "You can list a directory's names with ls but cannot open any file in it. Which bit is missing on the directory?"
    options: ["r", "x (search)", "w"]
    answer: 1
    explain: "r on a directory lets you read its list of names; x lets you look up and reach the entries. Without x, you see names but can't stat or open them."
  - q: "What is the safest way to let a web server bind port 443 without running it as root?"
    options: ["chmod 777 the binary", "Give it the CAP_NET_BIND_SERVICE capability (or let systemd or a proxy hold the port)", "Add the user to the root group"]
    answer: 1
    explain: "Ports below 1024 need CAP_NET_BIND_SERVICE, one small piece of root's power. systemd's AmbientCapabilities= or setcap can grant just that."
links:
  - { title: "credentials(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/credentials.7.html" }
  - { title: "inode(7): file type and mode (man7.org)", url: "https://man7.org/linux/man-pages/man7/inode.7.html" }
  - { title: "capabilities(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/capabilities.7.html" }
---
Linux decides what a process may do by its credentials: a numeric user ID (UID), a primary group ID and a list of supplementary groups, inherited from the process that started it. Every file has an owning UID and GID and a mode: read, write and execute bits for the owner, the group and everyone else. When a process opens a file, the kernel picks the first class that matches it (owner, then group, then others) and checks only those bits. UID 0, root, skips most of these checks.

## Two users and a shared folder

```sh
useradd -m alice; useradd -m bob; groupadd devs; usermod -aG devs alice
id alice; id bob
mkdir /tmp/shared && echo secret > /tmp/shared/plan.txt
chown -R alice:devs /tmp/shared
chmod 750 /tmp/shared; chmod 640 /tmp/shared/plan.txt
ls -ld /tmp/shared /tmp/shared/plan.txt
su alice -c "cat /tmp/shared/plan.txt"
su bob -c "cat /tmp/shared/plan.txt"
```

```text
uid=1001(alice) gid=1001(alice) groups=1001(alice),1003(devs)
uid=1002(bob) gid=1002(bob) groups=1002(bob)
drwxr-x--- 2 alice devs 4096 Oct 16 10:23 /tmp/shared
-rw-r----- 1 alice devs    7 Oct 16 10:23 /tmp/shared/plan.txt
secret
cat: /tmp/shared/plan.txt: Permission denied
```

The octal form packs each class into one digit: read 4, write 2, execute 1. `750` is `rwxr-x---`, `640` is `rw-r-----`. Bob is neither the owner nor in `devs`, so he falls into "others", which has no bits at all. (UID 1000 is taken by the `ubuntu` user in the image, so Alice got 1001.) Names are only labels from `/etc/passwd` and `/etc/group`; the kernel stores and compares numbers, which is why files created in a container can show up with a strange owner on the host.

## Directories, umask and special bits

On a directory, `r` lists names, `w` creates, deletes and renames entries (deleting a file needs write on the directory, not on the file), and `x` lets you enter it and reach entries by name.

New files get the mode the program asks for (usually 666 for files, 777 for directories) minus the bits in the umask. A umask of `022` gives `rw-r--r--`; `002`, which Ubuntu gives regular users, gives group write too:

```sh
umask
su alice -c "cd /tmp/shared && umask && touch new && ls -l new"
```

```text
0022
0002
-rw-rw-r-- 1 alice alice 0 Oct 16 10:23 new
```

Three more bits appear in `ls -l` as `s` or `t`:

- **setuid** on a program runs it with the file owner's UID. `/usr/bin/passwd` is `-rwsr-xr-x root`, so any user can update the root-owned password file through it.
- **setgid** on a directory makes new files inherit the directory's group, handy for shared folders.
- **sticky** on a directory lets only a file's owner delete it. `/tmp` is `drwxrwxrwt`.

## Least privilege

- **Run services as their own user,** not root. systemd's `User=` or `DynamicUser=yes`, and `USER` in a Dockerfile.
- **Use capabilities instead of root.** Root's power is split into about 40 capabilities: `CAP_NET_BIND_SERVICE` for ports below 1024, `CAP_SYS_PTRACE` for tracing others' processes. Grant just the one you need.
- **Keep secrets 600 or 640** and owned by the service's user. `chmod 777` fixes "Permission denied" by removing all protection; find out which UID needs access instead.
- **ACLs and MAC.** `setfacl` adds per-user entries beyond the nine bits, and SELinux or AppArmor can deny access even when the bits allow it.

## On macOS

The same UIDs, groups and mode bits apply (regular users start at UID 501 with `staff` as their primary group). macOS adds ACLs (`ls -le`), file flags and System Integrity Protection, which stops even root from changing system files. There is no `useradd`; users are managed with `sysadminctl` or `dscl`.
