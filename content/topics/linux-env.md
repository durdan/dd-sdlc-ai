---
id: linux-env
title: "Environment variables and $PATH"
summary: Strings a process inherits, and how a command name becomes a file
why: "Most 'works in my shell, fails in cron, CI or systemd' bugs are a different environment: a missing variable or a different PATH."
requires: [linux-processes]
lesson: none
points:
  - title: Each process has its own copy
    text: "The environment is a list of NAME=value strings passed through exec. A child gets a copy; changing it never affects the parent."
  - title: Only exported variables are passed on
    text: "A plain shell variable stays in the shell. export (or NAME=value before a command) puts it in children's environment."
  - title: PATH is searched left to right
    text: "A command without a slash is looked up in each PATH directory in order, and the first match wins."
  - title: Services get a minimal environment
    text: "cron, systemd and containers don't read your shell's startup files, so set what the program needs explicitly."
quiz:
  - q: "You run GREETING=hi on one line and bash -c 'echo $GREETING' on the next. What prints?"
    options: ["hi", "An empty line, because GREETING was never exported", "An error"]
    answer: 1
    explain: "Without export it is a shell variable, not part of the environment, so the child process never receives it."
  - q: "A script runs fine in your terminal but cron says 'command not found'. What is the likely cause?"
    options: ["cron runs a different kernel", "cron starts jobs with a minimal PATH that does not include the directory the command is in", "The script is not executable"]
    answer: 1
    explain: "cron does not read your shell profile, so tools installed in /usr/local/bin, ~/.local/bin or by a version manager may not be on its PATH. Use full paths or set PATH in the crontab."
  - q: "Two directories on PATH both contain a program called python3. Which one runs?"
    options: ["The newest", "The one in the directory listed first in PATH", "The shell asks"]
    answer: 1
    explain: "The search stops at the first match. type -a python3 shows every match in order; the first is the one that runs."
links:
  - { title: "environ(7) (man7.org)", url: "https://man7.org/linux/man-pages/man7/environ.7.html" }
  - { title: "exec(3): how execvp searches PATH (man7.org)", url: "https://man7.org/linux/man-pages/man3/exec.3.html" }
---
Every process carries an environment: a list of `NAME=value` strings it received when it was started with exec. Programs read it for configuration (`HOME`, `LANG`, `TZ`, `DATABASE_URL`) and pass it on to their own children, each of which gets an independent copy. `PATH` is the variable the shell and the C library's `execvp` use to turn a command name such as `ls` into a file such as `/usr/bin/ls`.

## Shell variables versus environment variables

```sh
GREETING=hi; bash -c 'echo "child sees: [$GREETING]"'
export GREETING; bash -c 'echo "child sees: [$GREETING]"'
GREETING=once bash -c 'echo "child sees: [$GREETING]"'
env -i /usr/bin/env
```

```text
child sees: []
child sees: [hi]
child sees: [once]
```

A plain assignment creates a shell variable that stays in the shell. `export` marks it for the environment of every later child. `NAME=value command` sets it for that one command only. `env -i` starts a program with an empty environment, so `env` prints nothing at all. A running process's environment, as it was at exec, is visible in `/proc/<pid>/environ` (NUL-separated, readable by the owner and root), which is one reason not to put secrets in environment variables on shared machines.

## How PATH lookup works

```sh
echo "$PATH"
type -a ls cd
mkdir -p /tmp/bin && printf '#!/bin/sh\necho fake ls\n' > /tmp/bin/ls && chmod +x /tmp/bin/ls
PATH=/tmp/bin:$PATH ls
```

```text
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ls is /usr/bin/ls
ls is /bin/ls
cd is a shell builtin
fake ls
```

When a command name has no slash, the shell first checks its own aliases, functions and builtins (`cd` must be a builtin because a child process can't change its parent's directory), then tries each PATH directory in order and runs the first executable it finds. `ls` appears twice because on Ubuntu `/bin` is a symlink to `/usr/bin`. Putting `/tmp/bin` first made our fake `ls` win, which is exactly why a writable directory early in PATH, or an empty entry (`::`, which means the current directory), is a security hole.

Bash remembers where it found each command (`hash` lists them). If you install a program earlier in PATH and the shell still runs the old one, `hash -r` clears that cache.

## Why the environment changes under services

Interactive shells build their environment from startup files (`/etc/profile`, `~/.bashrc`, `~/.zshrc`), which is where version managers and `export PATH=...` lines live. Non-interactive starters don't run them:

- **cron** uses a short default PATH (often just `/usr/bin:/bin`) and few other variables.
- **systemd** gives services a clean environment; set variables with `Environment=` or `EnvironmentFile=` in the unit.
- **Containers** get the image's `ENV` values plus whatever `docker run -e` or Kubernetes adds.
- **sudo** resets most of the environment by default (`env_reset`) and uses its own `secure_path`.

The fix is the same everywhere: use absolute paths in scripts, or set PATH and the variables the program needs where the service is defined.

## On macOS

The mechanics are identical. The default PATH comes from `/etc/paths` and `/etc/paths.d/` via `path_helper`, Homebrew adds `/opt/homebrew/bin` on Apple silicon, and the default shell is zsh, which reads `~/.zshrc` rather than `~/.bashrc`. GUI apps started by launchd do not see variables exported in your shell files.
