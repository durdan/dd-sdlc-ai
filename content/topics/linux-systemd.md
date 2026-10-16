---
id: linux-systemd
title: "systemd services and journalctl"
summary: Describe a service once; systemd starts, restarts, stops and logs it
why: "On almost every Linux server your program runs as a systemd unit. Knowing the unit file, status and journal is how you deploy it and find out why it died."
requires: [linux-signals, linux-env]
lesson: none
points:
  - title: A unit file describes the service
    text: "What to run, as which user, with which environment, when to start it and whether to restart it. No shell scripts with PID files."
  - title: systemctl controls it
    text: "start, stop, restart, enable (start at boot) and status, which shows state, main PID, memory and the latest log lines."
  - title: The journal collects the output
    text: "Whatever the service writes to stdout and stderr goes to the journal, with time, unit and PID. journalctl -u reads it."
  - title: Every service gets its own cgroup
    text: "So systemd can track every child process, account for resources, apply limits and stop the whole group."
quiz:
  - q: "You edited /etc/systemd/system/app.service. What must you run before restarting the service?"
    options: ["Nothing", "systemctl daemon-reload, so systemd rereads unit files", "reboot"]
    answer: 1
    explain: "systemd keeps parsed units in memory. daemon-reload rereads them; systemctl will warn if a unit file changed on disk without one."
  - q: "What does systemctl stop do by default?"
    options: ["Sends SIGKILL at once", "Sends SIGTERM to the unit's processes, waits up to TimeoutStopSec (90 s by default), then sends SIGKILL", "Waits for the process to exit by itself"]
    answer: 1
    explain: "KillSignal defaults to SIGTERM and KillMode to control-group, so every process in the service's cgroup is asked to exit and then killed if it doesn't."
  - q: "Which command shows the last hour of logs for app.service and keeps following new lines?"
    options: ["tail -f /var/log/app.service", "journalctl -u app.service --since '1 hour ago' -f", "systemctl logs app"]
    answer: 1
    explain: "-u filters by unit, --since and --until limit the time range, -f follows. Add -p err to show only errors, or -o json for machine-readable output."
links:
  - { title: "systemd.service (freedesktop.org)", url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html" }
  - { title: "systemctl (freedesktop.org)", url: "https://www.freedesktop.org/software/systemd/man/latest/systemctl.html" }
  - { title: "journalctl (freedesktop.org)", url: "https://www.freedesktop.org/software/systemd/man/latest/journalctl.html" }
---
systemd is PID 1 on almost every mainstream Linux distribution. It starts everything after the kernel, in dependency order, and supervises it: a service is described by a unit file, started in its own cgroup with the user, environment and limits you declare, restarted if it crashes, stopped with SIGTERM then SIGKILL, and its stdout and stderr are captured in the journal. `systemctl` talks to it and `journalctl` reads the logs.

## A service in ten lines

These were run in an Ubuntu 24.04 container booted with systemd 255 as PID 1 (a privileged container with the cgroup tree mounted, which is not how you would normally run containers). The program is a Python loop that prints and handles SIGTERM:

```python
# /opt/hello/app.py
import signal, sys, time
def stop(signum, frame):
    print("SIGTERM received, closing connections", flush=True)
    sys.exit(0)
signal.signal(signal.SIGTERM, stop)
print("hello service started", flush=True)
while True:
    time.sleep(5)
    print("still working", flush=True)
```

```ini
# /etc/systemd/system/hello.service
[Unit]
Description=Hello demo service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/hello/app.py
Restart=on-failure
User=nobody

[Install]
WantedBy=multi-user.target
```

`ExecStart` is the command, run directly without a shell. `Restart=on-failure` restarts it after a crash, a kill by signal or a non-zero exit. `User=` drops root. `WantedBy=multi-user.target` is what `enable` hooks into so it starts at boot.

```sh
systemctl daemon-reload
systemctl enable --now hello.service
systemctl status hello.service --no-pager
```

```text
Created symlink /etc/systemd/system/multi-user.target.wants/hello.service → /etc/systemd/system/hello.service.
● hello.service - Hello demo service
     Loaded: loaded (/etc/systemd/system/hello.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-10-16 10:45:41 UTC; 6s ago
   Main PID: 172 (python3)
      Tasks: 1 (limit: 9395)
     Memory: 3.7M (peak: 3.7M)
        CPU: 22ms
     CGroup: /docker/9135673b6c71.../system.slice/hello.service
             └─172 /usr/bin/python3 /opt/hello/app.py
```

(The container ID in the cgroup path is shortened, and the log lines `status` prints at the end are left out.) `enable` creates the symlink that starts it at boot; `--now` also starts it. The `CGroup:` line is the service's own cgroup, which is how systemd finds every process the service starts and where `MemoryMax=`, `CPUQuota=` and `TasksMax=` limits apply.

## Stop, crash, read the journal

```sh
systemctl stop hello.service
journalctl -u hello.service --no-pager | tail -6
```

```text
Oct 16 10:45:41 9135673b6c71 python3[172]: hello service started
Oct 16 10:45:46 9135673b6c71 python3[172]: still working
Oct 16 10:45:47 9135673b6c71 python3[172]: SIGTERM received, closing connections
Oct 16 10:45:47 9135673b6c71 systemd[1]: Stopping hello.service - Hello demo service...
Oct 16 10:45:47 9135673b6c71 systemd[1]: hello.service: Deactivated successfully.
Oct 16 10:45:47 9135673b6c71 systemd[1]: Stopped hello.service - Hello demo service.
```

The program's `print` output and systemd's own messages are in one place, stamped with the unit and PID. `stop` sent SIGTERM; the handler ran and the process exited 0. Had it ignored the signal, systemd would have sent SIGKILL after `TimeoutStopSec` (`systemctl show -p TimeoutStopUSec hello` printed `1min 30s`). Now simulate a crash:

```sh
systemctl start hello
kill -9 "$(systemctl show -p MainPID --value hello)"
sleep 1
journalctl -u hello --no-pager | tail -3
```

```text
Oct 16 10:45:47 9135673b6c71 systemd[1]: hello.service: Scheduled restart job, restart counter is at 1.
Oct 16 10:45:47 9135673b6c71 systemd[1]: Started hello.service - Hello demo service.
Oct 16 10:45:47 9135673b6c71 python3[185]: hello service started
```

systemd noticed the main process died from a signal, logged `Failed with result 'signal'` (one line further up) and, because of `Restart=on-failure`, started a new process 100 ms later (`RestartSec=` defaults to 100 ms). `systemctl show -p NRestarts hello` counts restarts, and `StartLimitBurst=` stops a service that crashes in a tight loop.

## journalctl you will use every day

- `journalctl -u app -f` follows a unit's log; `-n 100` shows the last 100 lines.
- `--since "10 min ago"`, `--until`, `-b` (this boot), `-b -1` (previous boot, for "why did it reboot").
- `-p err` shows only priority error and worse; `-k` shows kernel messages such as OOM kills.
- `-o json` or `-o cat` for scripts; `--disk-usage` and `--vacuum-time=7d` to keep its size down.

Other parts worth knowing: `systemctl list-units --failed`, `systemctl cat app` (the effective unit), `systemctl edit app` (a drop-in override instead of editing the package's file), timers as a replacement for cron, and `Environment=` / `EnvironmentFile=` for configuration.

## On macOS

macOS uses launchd instead: services are property lists in `~/Library/LaunchAgents` or `/Library/LaunchDaemons`, controlled with `launchctl`, and logs go to the unified log (`/usr/bin/log show --predicate 'process == "app"' --last 1h` or `/usr/bin/log stream`; the full path matters because zsh has a builtin called `log`). The concepts (declarative service definitions, supervised restarts, central logs) map across directly.
