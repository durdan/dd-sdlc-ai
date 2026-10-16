---
id: linux-signals
title: "Signals and graceful shutdown"
summary: SIGTERM asks, SIGKILL doesn't, and your program should listen
why: "Every deploy, autoscale and Ctrl+C stops processes with signals. Handling SIGTERM is the difference between finishing in-flight requests and dropping them."
requires: [linux-processes]
lesson: none
points:
  - title: A signal is a small notification
    text: "The kernel interrupts a process to tell it something: stop, hang up, a child exited, you wrote to a closed pipe."
  - title: SIGTERM can be handled
    text: "It is the polite request to exit. A program can catch it, finish its work, close connections and exit 0."
  - title: SIGKILL and SIGSTOP cannot
    text: "They can't be caught, blocked or ignored. SIGKILL ends the process at once, with no cleanup."
  - title: Managers escalate
    text: "systemd, Docker and Kubernetes send SIGTERM, wait a grace period, then send SIGKILL."
quiz:
  - q: "Why should a service handle SIGTERM rather than rely on being killed?"
    options: ["SIGTERM is faster", "So it can stop accepting work, finish in-flight requests, flush data and exit cleanly before the grace period ends", "SIGKILL is not allowed in production"]
    answer: 1
    explain: "SIGTERM gives the program a chance to clean up. If it ignores the signal or takes too long, the manager sends SIGKILL and anything in flight is lost."
  - q: "A process exits with status 137. What happened?"
    options: ["It returned 137 from main", "It was killed by signal 9 (SIGKILL), since 128 + 9 = 137", "It ran out of file descriptors"]
    answer: 1
    explain: "Shells and container runtimes report death by signal n as 128 + n. 137 often means the OOM killer or a manager's SIGKILL after a timeout."
  - q: "Which signals can a program never catch?"
    options: ["SIGTERM and SIGINT", "SIGKILL and SIGSTOP", "SIGHUP and SIGUSR1"]
    answer: 1
    explain: "The kernel handles SIGKILL and SIGSTOP itself so that an administrator can always stop or pause a process."
links:
  - { title: "signal(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/signal.7.html" }
  - { title: "systemd.kill: KillMode and KillSignal (freedesktop.org)", url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.kill.html" }
---
A signal is a small asynchronous message the kernel delivers to a process: a number with a meaning, such as SIGINT (Ctrl+C), SIGTERM (please exit), SIGKILL (exit now), SIGHUP (terminal closed, often reused as "reload config"), SIGCHLD (a child exited) or SIGPIPE (the reader of your pipe is gone). For most signals a process can install a handler, ignore it, or accept the default action, which is often to terminate. SIGKILL and SIGSTOP are the exceptions: they cannot be caught, blocked or ignored.

## TERM versus KILL

```sh
sleep 100 & kill -TERM $!; wait $!; echo "exit=$?"
sleep 100 & kill -KILL $!; wait $!; echo "exit=$?"
```

```text
exit=143
bash: line 3:   197 Killed                  sleep 100
exit=137
```

(Both blocks were fed to `bash` as one script, which is where the `bash: line N` messages come from; an interactive shell prints job notices such as `[1]+  Killed` instead, and PIDs will differ.) `sleep` has no handler, so both signals kill it, and the shell reports 128 plus the signal number: 143 for SIGTERM (15), 137 for SIGKILL (9). `kill -l` lists all signals and their numbers. `kill` with no option sends SIGTERM.

## Handle SIGTERM

A script that cleans up when asked:

```sh
cat > graceful.sh <<'EOF'
#!/bin/bash
trap 'echo "got SIGTERM, finishing up"; exit 0' TERM
echo "working (pid $$)"
while true; do sleep 1; done
EOF
chmod +x graceful.sh
./graceful.sh & sleep 1.5; kill $!; wait $!; echo "exit=$?"
./graceful.sh & sleep 1.5; kill -9 $!; wait $!; echo "exit=$?"
```

```text
working (pid 200)
got SIGTERM, finishing up
exit=0
working (pid 204)
bash: line 14:   204 Killed                  ./graceful.sh
exit=137
```

With SIGTERM the handler runs and the script exits 0. With SIGKILL it never gets the chance. (Bash runs a trap only after the current foreground command returns, so this one reacts within a second, when `sleep 1` ends.)

## What graceful shutdown means for a service

On SIGTERM a server should:

1. Stop accepting new work (close the listening socket, fail readiness checks).
2. Finish or hand back in-flight requests and jobs.
3. Flush buffers, commit offsets, close database connections.
4. Exit with status 0 before the grace period runs out.

Process managers all escalate the same way. systemd sends `KillSignal=` (SIGTERM by default) to every process in the unit, waits `TimeoutStopSec=` (90 seconds by default) and then sends SIGKILL. `docker stop` waits 10 seconds by default; Kubernetes gives a pod 30 seconds (`terminationGracePeriodSeconds`). If shutdown regularly takes longer, raise the grace period rather than letting work be killed halfway.

## Common traps

- **PID 1 ignores signals it has no handler for.** The kernel does not apply default actions to a namespace's init process, so an app running as PID 1 in a container that doesn't handle SIGTERM ignores it until SIGKILL arrives. Handle the signal, or run under a small init.
- **Shell wrappers swallow signals.** If an entrypoint script starts your server as a child, the signal goes to the shell, not the server. End the script with `exec your-server` so the server replaces the shell.
- **SIGPIPE.** Writing to a closed pipe or socket raises SIGPIPE, which kills the process by default. Network servers usually ignore it and handle the `EPIPE` error instead.

## On macOS

Signals are POSIX and behave the same; `kill -l` prints names without numbers in zsh. macOS has no systemd; launchd stops jobs with SIGTERM and sends SIGKILL after the job's `ExitTimeOut` (the default is system-defined).
