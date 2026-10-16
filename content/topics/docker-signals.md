---
id: docker-signals
title: "PID 1, signals and graceful shutdown"
summary: SIGTERM first, SIGKILL after the grace period
why: "Every deploy stops containers. If your process ignores SIGTERM, each stop waits out the whole grace period and then kills it mid-request."
requires: [docker-containers]
lesson: diagram
points:
  - title: docker stop is a two-step
    text: "It sends the stop signal (SIGTERM unless STOPSIGNAL says otherwise), waits the timeout (10 s by default on Linux), then sends SIGKILL."
  - title: PID 1 is special
    text: "The kernel does not apply default signal actions to PID 1, so a process with no SIGTERM handler simply ignores it."
  - title: Exec form, not shell form
    text: "CMD node server.js runs under /bin/sh -c; CMD [\"node\", \"server.js\"] runs node directly, so it receives the signal."
  - title: An init helps
    text: "--init runs docker-init (tini) as PID 1; it forwards signals to your process and reaps zombie child processes."
quiz_hint: Exit code 128 + N means the process died from signal N.
quiz:
  - q: A container takes exactly the stop timeout to stop and exits with code 137. What happened?
    options: ["It exited cleanly", "It ignored SIGTERM and was killed by SIGKILL (128 + 9)", "It ran out of memory"]
    answer: 1
    explain: "137 is 128 + 9, SIGKILL. Taking the full timeout means SIGTERM had no effect, typically a PID 1 without a handler or a shell that did not forward it. (An OOM kill also shows 137, but then the container's state reports OOMKilled.)"
  - q: Why does a Node server with no SIGTERM handler stop immediately on your laptop but not in a container?
    options: ["Node behaves differently on Linux", "In the container it is PID 1, and PID 1 gets no default action for signals it does not handle", "Docker blocks SIGTERM"]
    answer: 1
    explain: "Normally the default action of SIGTERM kills the process. For PID 1 in a PID namespace the kernel ignores signals that have no handler. Add a handler or run with --init."
  - q: What does docker run --init change?
    options: ["It runs your entrypoint twice", "A tiny init (docker-init, backed by tini) becomes PID 1, forwards signals to your process and reaps zombies", "It sets the stop timeout to 0"]
    answer: 1
    explain: "With an init as PID 1, your process is an ordinary child, so default signal actions apply again and orphaned children are cleaned up."
links:
  - { title: "docker container stop (Docker docs)", url: "https://docs.docker.com/reference/cli/docker/container/stop/" }
  - { title: "docker run: specify an init process (Docker docs)", url: "https://docs.docker.com/reference/cli/docker/container/run/" }
  - { title: "Dockerfile reference: ENTRYPOINT, CMD, STOPSIGNAL", url: "https://docs.docker.com/reference/dockerfile/" }
  - { title: "tini (GitHub)", url: "https://github.com/krallin/tini" }
---
Stopping a container is a negotiation. `docker stop` sends the container's main process a signal (SIGTERM unless the image sets `STOPSIGNAL`), waits for the stop timeout, which the daemon sets to 10 seconds for Linux containers unless you change it, and then sends SIGKILL, which cannot be caught. A well-behaved process uses those seconds to stop accepting work, finish what is in flight and exit. Kubernetes does the same, with a 30-second default.

## The PID 1 trap

The first process in a PID namespace is PID 1, and the kernel treats it like an init system: signals for which it has not installed a handler are ignored, instead of getting their default action (for SIGTERM, terminate). Many runtimes install no SIGTERM handler, so as PID 1 they just keep running.

```js
// nohandler.js: no SIGTERM handler
require("node:http").createServer((q, s) => s.end("hi")).listen(3000)
```

```sh
docker run -d --name s1 nohandler
time docker stop -t 10 s1
# real 10.13           <- waited out the whole timeout
docker inspect s1 --format '{{.State.ExitCode}}'
# 137                  <- 128 + 9: SIGKILL

docker run -d --init --name s2 nohandler
docker exec s2 ps
# PID   USER     COMMAND
#   1   root     /sbin/docker-init -- docker-entrypoint.sh node /nohandler.js
#   7   root     node /nohandler.js
time docker stop s2
# real 0.13
docker inspect s2 --format '{{.State.ExitCode}}'
# 143                  <- 128 + 15: SIGTERM, default action
```

With `--init`, Docker's `docker-init` (backed by tini) is PID 1. It passes the signal on to node, which, no longer PID 1, gets the normal default action and exits at once. An init also reaps zombie processes: children whose parent died are re-parented to PID 1, and something must collect their exit status.

## Shell form hides your process

```dockerfile
CMD node server.js            # shell form: runs as /bin/sh -c "node server.js"
CMD ["node", "server.js"]     # exec form: node itself is the main process
```

With the shell form the main process may be a shell, which does not forward SIGTERM to its child, so your app never hears about the stop. Use the exec form for `CMD` and `ENTRYPOINT`. Wrapper scripts should end with `exec "$@"` (or `exec node server.js`) so the app replaces the shell. Launchers such as `npm start` add another process in between; run the runtime directly in production images.

## Handling the signal

```js
process.on("SIGTERM", () => {
  console.log("SIGTERM: closing")
  server.close(() => process.exit(0))   // stop accepting, finish open requests, exit
})
```

```sh
docker run -d --name s3 hello:1        # the server from the Dockerfile topic, with this handler
time docker stop s3
# real 0.11
docker logs s3
# listening on 3000
# SIGTERM: closing
docker inspect s3 --format '{{.State.ExitCode}}'
# 0
```

Graceful shutdown means: stop taking new work, let in-flight requests or jobs finish (or hand them back to a queue), close database connections, flush logs, and exit 0 well before the timeout. If shutdown legitimately takes longer, raise the timeout (`docker stop -t`, `--stop-timeout`, Compose `stop_grace_period`, or Kubernetes `terminationGracePeriodSeconds`) rather than letting the kill arrive mid-write.

```trace diagram
id: pid1-stop
title: node as PID 1
subtitle: "docker stop s1, then the same with a SIGTERM handler"
kind: sequence
elements:
  - { id: you, label: docker stop, role: client }
  - { id: dockerd, label: dockerd }
  - { id: node, label: "node (PID 1)" }
edges:
  - { id: stop, from: you, to: dockerd, label: stop s1 }
  - { id: term, from: dockerd, to: node, label: SIGTERM }
  - { id: ignored, from: node, to: node, label: "no handler: ignored" }
  - { id: wait, from: dockerd, to: dockerd, label: waits 10 s }
  - { id: kill, from: dockerd, to: node, label: SIGKILL }
  - { id: died, from: node, to: dockerd, label: "killed: exit code 137", style: dashed }
  - { id: slow, from: dockerd, to: you, label: "returns after 10.13 s", style: dashed }
  - { id: term2, from: dockerd, to: node, label: "SIGTERM (now with a handler)" }
  - { id: close, from: node, to: node, label: "server.close(): finish in-flight" }
  - { id: clean, from: node, to: dockerd, label: "exit 0", style: dashed }
  - { id: fast, from: dockerd, to: you, label: "returns after 0.11 s", style: dashed }
steps:
  - caption: "docker stop is a two-step. It sends the stop signal, SIGTERM unless the image sets STOPSIGNAL, waits the stop timeout, 10 seconds for Linux containers, and then sends SIGKILL."
    focus: [you, dockerd, node]
  - caption: Here node, with no SIGTERM handler, is the container's main process, so it is PID 1 in the container's PID namespace.
    trace: [stop, term]
  - caption: Outside a container SIGTERM's default action would end node. But the kernel gives PID 1 no default actions, so a signal without a handler is simply ignored.
    trace: [ignored]
  - caption: Docker waits out the whole timeout. Nothing happens, and every deploy that stops this container pays those 10 seconds.
    trace: [wait]
  - caption: "Then SIGKILL, which no process can catch. node dies mid-request with exit code 137, which is 128 + 9."
    trace: [kill, died, slow]
  - caption: "The fix in the app: handle SIGTERM. process.on(\"SIGTERM\") calls server.close(), which stops accepting connections and lets open requests finish."
    trace: [term2, close]
  - caption: "It exits 0 in about a tenth of a second. Graceful shutdown means finishing well inside the timeout: close connections, flush logs, exit."
    trace: [clean, fast]
```

```trace diagram
id: with-init
title: "With --init"
subtitle: "docker run --init: docker-init (tini) is PID 1"
kind: sequence
elements:
  - { id: you, label: docker stop, role: client }
  - { id: dockerd, label: dockerd }
  - { id: init, label: "init (PID 1)" }
  - { id: node, label: node }
edges:
  - { id: stop, from: you, to: dockerd, label: stop s2 }
  - { id: term, from: dockerd, to: init, label: SIGTERM }
  - { id: fwd, from: init, to: node, label: forwards SIGTERM }
  - { id: dflt, from: node, to: node, label: "not PID 1: default action, exit" }
  - { id: reap, from: init, to: init, label: "reaps node, then exits" }
  - { id: code, from: init, to: dockerd, label: "exit code 143", style: dashed }
  - { id: fast, from: dockerd, to: you, label: "returns after 0.13 s", style: dashed }
steps:
  - caption: "The same handler-less node, started with --init. Docker puts its tiny init, docker-init (backed by tini), in front, so PID 1 is the init and node is an ordinary child."
    focus: [init, node]
  - caption: docker stop sends SIGTERM to PID 1 as before. This time PID 1 is a program written to pass it on.
    trace: [stop, term, fwd]
  - caption: node is PID 7 now, not PID 1, so the normal default action applies and SIGTERM ends it at once.
    trace: [dflt]
  - caption: "The init collects node's exit status, which is also its other job: reaping zombie processes re-parented to it. It exits with 143, 128 + 15."
    trace: [reap, code, fast]
  - caption: "One more trap. The shell form, CMD node server.js, runs under /bin/sh -c, and a shell may not forward the signal at all. Use the exec form, CMD [\"node\", \"server.js\"], and end wrapper scripts with exec."
    focus: [init, node]
note: "Exit code 128 + N means the process died from signal N: 137 is SIGKILL, 143 is SIGTERM."
```
