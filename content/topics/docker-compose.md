---
id: docker-compose
title: docker compose for local stacks
summary: One file for the whole local stack
why: "A new teammate should get the app, its database and its cache running with one command, the same way every time, and Compose is the standard way to write that down."
requires: [docker-networking, docker-volumes]
lesson: diagram
points:
  - title: Services, networks, volumes
    text: "compose.yaml declares containers as services; Compose creates a network for the project and the named volumes for you."
  - title: Names are hostnames
    text: "Every service can reach every other by its service name, through the project network's DNS."
  - title: Start order needs health
    text: "depends_on only waits for a container to start. With condition: service_healthy it waits for the dependency's healthcheck to pass."
  - title: A development tool
    text: "Compose is ideal on laptops and in CI. Production orchestration (rescheduling, rolling updates, many machines) is what Kubernetes is for."
quiz_hint: Compose builds on the same networks and volumes you have already seen; it just names and creates them for you.
quiz:
  - q: In compose.yaml, the web service needs Redis from the service named cache. Which address does it use?
    options: ["localhost:6379", "cache:6379", "host.docker.internal:6379"]
    answer: 1
    explain: "Compose puts all services on a project network with DNS, so the service name resolves to the cache container. localhost would be the web container itself."
  - q: "web has depends_on: [db] in short form. When does web start?"
    options: ["When Postgres accepts connections", "As soon as the db container has started, ready or not", "After db's healthcheck passes"]
    answer: 1
    explain: "The short form only orders container start-up. Use the long form with condition: service_healthy and a healthcheck on db to wait for real readiness, and still let the app retry."
  - q: What does docker compose down -v remove that docker compose down keeps?
    options: ["The images", "The named volumes declared in the file, and their data", "The compose.yaml file"]
    answer: 1
    explain: "down removes containers and the project network. -v also removes the named volumes, which is how you reset a local database, and how you lose it by accident."
links:
  - { title: "Docker Compose overview (Docker docs)", url: "https://docs.docker.com/compose/" }
  - { title: "Control startup order (Docker docs)", url: "https://docs.docker.com/compose/how-tos/startup-order/" }
  - { title: "Compose file reference (Docker docs)", url: "https://docs.docker.com/reference/compose-file/" }
  - { title: "Use Compose Watch (Docker docs)", url: "https://docs.docker.com/compose/how-tos/file-watch/" }
---
Docker Compose turns a pile of `docker run` commands into one declarative file. You describe the services (containers), the ports they publish, the volumes they need and how they depend on each other in `compose.yaml`; `docker compose up` creates a network for the project, the volumes, and the containers in a sensible order. Compose v2 is a plugin of the Docker CLI (`docker compose`); the old Python `docker-compose` command is retired.

## A web service with a cache

```yaml
# compose.yaml
services:
  web:
    build: ./node
    ports:
      - "127.0.0.1:8765:3000"
    environment:
      REDIS_URL: redis://cache:6379
    depends_on:
      cache:
        condition: service_healthy
  cache:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    volumes:
      - cache-data:/data
volumes:
  cache-data:
```

```sh
docker compose up -d --wait
#  Container demo-cache-1  Healthy
#  Container demo-web-1    Healthy
docker compose ps --format '{{.Service}} {{.Status}}'
# cache Up 6 seconds (healthy)
# web Up Less than a second
curl -s localhost:8765
# hello from d9eb232cfb16
docker compose exec cache redis-cli -h cache ping
# PONG
docker compose down -v      # containers, network, and the cache-data volume
```

What happened: Compose built `web` from `./node`, created the network `demo_default` (the project name defaults to the directory name), created the volume, started `cache`, waited until its healthcheck passed, then started `web`. `--wait` returns once the services are running or healthy, which is handy in CI before running tests.

## Details that matter

- **No `version:` line.** The top-level `version` key is obsolete; current Compose prints `the attribute 'version' is obsolete, it will be ignored` and uses the Compose Specification regardless.
- **Readiness, not just order.** `depends_on` in short form waits only for the container to start. Give dependencies a `healthcheck` and use `condition: service_healthy`. Your app should still retry connections; dependencies restart in real life too.
- **Ports for humans, names for services.** Publish only what you open in a browser or a local tool, bound to `127.0.0.1`. Services talk to each other over the project network by name, on the container port.
- **Overrides.** Compose automatically merges `compose.override.yaml`, which is a good place for developer-only settings such as bind mounts and debug ports. `profiles:` keep optional services (an admin UI, a load generator) off unless asked for.
- **Live code.** `develop.watch` with `docker compose watch` syncs changed files into the container or rebuilds the image when dependency files change, often faster than bind-mounting the whole tree on Docker Desktop.
- **Secrets.** Do not commit real secrets to `environment:`. Use an untracked `.env` file for local values, or Compose `secrets:` to mount them as files.

## Where Compose stops

Compose runs containers on one Docker engine. It restarts a crashed container if you set `restart:`, but it does not move work to another machine, roll out new versions gradually, or scale on load. Those are the jobs of an orchestrator, which is where Kubernetes takes over, built on the same images, networking and volume ideas.

```trace diagram
id: compose-up
title: What docker compose up does
subtitle: "The web + cache stack from compose.yaml, project demo"
direction: DOWN
groups:
  - { id: net, label: "demo_default network" }
elements:
  - { id: file, label: compose.yaml, sub: "services, volumes", kind: person, row: 0 }
  - { id: dev, label: You, sub: "curl localhost:8765", kind: person, row: 0 }
  - { id: port, label: Published port, sub: "127.0.0.1:8765 → 3000", tone: external, row: 1 }
  - { id: web, label: web, sub: "image built from ./node", kind: system, group: net, row: 2 }
  - { id: health, label: Healthcheck, sub: "redis-cli ping, every 5 s", tone: stream, group: net, row: 4 }
  - { id: cache, label: cache, sub: "redis:7-alpine", group: net, row: 3 }
  - { id: vol, label: cache-data, sub: named volume, kind: store, tone: data, row: 4 }
edges:
  - { id: create, from: file, to: web, label: up }
  - { id: wait, from: web, to: health, label: service_healthy, style: dashed }
  - { id: probe, from: cache, to: health, style: dotted }
  - { id: call, from: web, to: cache, label: "redis://cache:6379" }
  - { id: mount, from: cache, to: vol, label: /data }
  - { id: open, from: dev, to: port }
  - { id: fwd, from: port, to: web }
steps:
  - caption: One file declares the whole local stack. docker compose up -d --wait turns it into a network, a volume and two running containers.
    focus: [file]
  - caption: Compose first creates the project network, demo_default, named after the directory, and the named volume cache-data.
    focus: [file, net, vol]
  - caption: "web declares depends_on cache with condition: service_healthy, so Compose starts cache first, with its volume mounted at /data."
    focus: [file, cache, vol]
    trace: [mount]
  - caption: "Started is not ready. Docker runs cache's healthcheck, redis-cli ping, every 5 seconds until it passes."
    focus: [health, cache]
    trace: [probe]
  - caption: Only when cache reports healthy does Compose start web, from the image it built from ./node. The short form of depends_on would only have waited for the container to start.
    focus: [file, web, health]
    trace: [create, wait]
  - caption: "web reaches Redis at redis://cache:6379. The service name is a hostname on the project network, and the port is the container's own."
    focus: [web, cache]
    trace: [call]
  - caption: "Only web publishes a port, bound to 127.0.0.1, because only you need to open it. --wait returns once both are running or healthy, handy before tests in CI."
    focus: [dev, port, web]
    trace: [open, fwd]
  - caption: docker compose down removes the containers and the network but keeps cache-data. down -v deletes the volume too, which resets the data, or loses it by accident.
    focus: [vol, web, cache]
  - caption: Compose runs everything on one Docker engine. Moving work between machines, rolling updates and scaling on load are jobs for an orchestrator such as Kubernetes.
note: Your app should still retry its connections. Dependencies restart in real life too.
```
