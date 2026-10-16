---
id: docker-dockerfile
title: Dockerfiles that build fast
summary: Order instructions by how often they change
why: "A well-ordered Dockerfile rebuilds in a second after a code change; a badly ordered one reinstalls every dependency on every commit, locally and in CI."
requires: [docker-images]
lesson: diagram
points:
  - title: Each step has a cache key
    text: "A step is reused if its instruction and inputs are unchanged. For COPY the inputs are the files' contents; for RUN it is only the command text."
  - title: A miss invalidates everything below
    text: Once one step has to rerun, every later step reruns too, even if it did not change.
  - title: Stable things first
    text: "Base image, system packages, then the dependency manifest and install, and only then your source code."
  - title: A small build context
    text: ".dockerignore keeps node_modules, .git, secrets and build output out of the context, so they neither slow the build nor bust the cache."
quiz_hint: Find the first step whose inputs changed; that step and everything after it run again.
quiz:
  - q: You edit one line in server.js and rebuild. Which steps run again?
    code: |
      FROM node:22-alpine
      WORKDIR /app
      COPY . .
      RUN npm ci --omit=dev
      CMD ["node", "server.js"]
    options: ["Only COPY . .", "COPY . . and npm ci, because the COPY layer changed", "Nothing; CMD did not change"]
    answer: 1
    explain: "COPY . . includes server.js, so its cache key changed. Every step after a miss reruns, including npm ci. Copy package.json and the lockfile first, install, then copy the source."
  - q: "RUN apt-get update && apt-get install -y curl was cached three months ago. What does a rebuild do?"
    options: ["Fetches the latest package lists automatically", "Reuses the cached layer with the old packages, because the command text is unchanged", "Fails because the cache expired"]
    answer: 1
    explain: "RUN steps are cached by their command string, not by what the network would return today. Rebuild with --no-cache or --pull, or change the line (for example a pinned version), to refresh it."
  - q: What is the main job of .dockerignore?
    options: ["Choosing which files appear in docker ps", "Excluding files from the build context sent to the builder", "Hiding layers from docker history"]
    answer: 1
    explain: "The context is everything the builder can COPY. Excluding node_modules, .git and .env makes it smaller, stops local files from busting the cache and keeps secrets out of images."
links:
  - { title: "Build cache invalidation (Docker docs)", url: "https://docs.docker.com/build/cache/invalidation/" }
  - { title: "Optimize cache usage in builds (Docker docs)", url: "https://docs.docker.com/build/cache/optimize/" }
  - { title: "Build context and .dockerignore (Docker docs)", url: "https://docs.docker.com/build/concepts/context/" }
  - { title: "Building best practices (Docker docs)", url: "https://docs.docker.com/build/building/best-practices/" }
---
Docker caches every build step. Before running an instruction it checks whether it has already built that exact step on top of that exact parent; if so it reuses the stored layer and moves on. Fast Dockerfiles are written so that the slow steps (installing dependencies) sit above the parts that change often (your code), and so that only the files a step really needs can affect it.

## How the cache decides

- `FROM` is keyed by the base image digest.
- `COPY` and `ADD` are keyed by a checksum of the copied files' contents and metadata. Changing a file that is copied invalidates the step; modification times alone do not.
- `RUN` is keyed by the command text only. Docker does not know that `apt-get update` would return something different today.
- When one step misses, every step after it is rebuilt.

## An ordering that caches well

```dockerfile
FROM node:22-alpine
WORKDIR /app
# 1. Only the dependency manifests: this layer changes when dependencies change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# 2. The source code: changes on every commit, so it comes last
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

After editing `server.js`, a rebuild reuses everything up to the final `COPY`:

```sh
docker build --progress=plain -t hello:1 .
# #6 [3/5] COPY package.json package-lock.json ./
# #6 CACHED
# #8 [4/5] RUN npm ci --omit=dev
# #8 CACHED
# #9 [5/5] COPY . .
# #9 DONE 0.0s
```

With `COPY . .` placed before `npm ci`, the same one-line edit shows `RUN npm ci` running again (`added 1 package ... in 439ms` here, minutes in a real project).

## Keep the context small

`docker build .` sends the directory (the build context) to the builder. Anything in it can be copied, and anything copied can change a cache key. A `.dockerignore` next to the Dockerfile keeps it lean:

```text
node_modules
.git
*.log
.env
Dockerfile
.dockerignore
```

Without it, `COPY . .` would copy your local `node_modules` (built for macOS, perhaps) over the ones just installed, any edit under `.git` would bust the cache, and `.env` would end up inside the image for anyone who pulls it.

## Habits that help

- Combine `apt-get update` and `apt-get install` in one `RUN`, so the package list is never older than the install, and clean the package cache in the same step.
- Pin the base image (`node:22-alpine`, or better a digest) rather than `latest`, so the first layer does not change under you.
- Use the lockfile and the clean-install command (`npm ci`, `pip install -r` with hashes, `go mod download`), so the install step is reproducible.
- Copy only what a step needs. A tool that only needs `go.mod` should not see the whole tree.
- In CI, where every runner starts empty, export the cache to the registry or the CI cache (`--cache-to` / `--cache-from`), or every build starts from zero.

```trace diagram
id: cache-cascade
title: One edit, two Dockerfiles
subtitle: "server.js changed: what reruns?"
direction: DOWN
groups:
  - { id: good, label: Manifests first }
  - { id: bad, label: "COPY . . first" }
elements:
  - { id: ctx, label: Build context, sub: "the folder minus .dockerignore", kind: person, row: 0 }
  - { id: gfrom, label: "FROM node:22-alpine", sub: CACHED, group: good, row: 1 }
  - { id: gpkg, label: COPY package files, sub: "package.json + lockfile: CACHED", group: good, row: 2 }
  - { id: gnpm, label: RUN npm ci, sub: CACHED, group: good, row: 3 }
  - { id: gsrc, label: "COPY . .", sub: reruns in 0.0 s, tone: stream, group: good, row: 4 }
  - { id: bfrom, label: "FROM node:22-alpine", sub: CACHED, group: bad, row: 1 }
  - { id: ball, label: "COPY . .", sub: reruns, tone: stream, group: bad, row: 2 }
  - { id: bnpm, label: RUN npm ci, sub: "reruns: minutes", tone: stream, group: bad, row: 3 }
edges:
  - { id: g1, from: gfrom, to: gpkg }
  - { id: g2, from: gpkg, to: gnpm }
  - { id: g3, from: gnpm, to: gsrc }
  - { id: b1, from: bfrom, to: ball }
  - { id: b2, from: ball, to: bnpm }
  - { id: cpkg, from: ctx, to: gpkg, style: dotted }
  - { id: csrc, from: ctx, to: gsrc, label: server.js }
  - { id: call, from: ctx, to: ball, label: server.js }
steps:
  - caption: Two Dockerfiles for the same Node app. The only difference is the order of the COPY lines. You edit one line of server.js and rebuild both.
  - caption: docker build first sends the build context, the project folder minus what .dockerignore excludes. Anything in it can be copied, and anything copied can change a cache key.
    focus: [ctx]
  - caption: "Each step has a key. FROM is keyed by the base image digest, COPY by a checksum of the copied files, RUN by its command text only. Same key on the same parent: the stored layer is reused."
    focus: [gfrom, gpkg, gnpm]
    trace: [g1, g2]
  - caption: "On the left, the first COPY takes only package.json and the lockfile. They did not change, so that step and npm ci are CACHED."
    focus: [ctx, gpkg, gnpm]
    trace: [cpkg]
  - caption: Only the last COPY sees server.js, so only it reruns. The rebuild takes about a second.
    focus: [ctx, gnpm, gsrc]
    trace: [csrc, g3]
  - caption: On the right, COPY . . comes before the install, and server.js is among the files it copies. Its checksum changed, so the step misses.
    focus: [ctx, bfrom, ball]
    trace: [b1, call]
  - caption: "A miss invalidates everything below it. npm ci reruns even though package.json is untouched: minutes in a real project, on every commit."
    focus: [ball, bnpm]
    trace: [b2]
  - caption: "The rule: put what changes least at the top. Base image, system packages, dependency manifests and install, and your source code last."
    focus: [gfrom, gpkg, gnpm, gsrc]
  - caption: "Because RUN is keyed by its text, a cached apt-get update keeps its old package lists until the line changes or you build with --no-cache or --pull. In CI, export the cache with --cache-to, or every runner starts cold."
    focus: [gnpm, bnpm]
```
