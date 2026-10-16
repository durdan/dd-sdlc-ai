---
id: docker-buildkit
title: BuildKit and multi-arch builds
summary: A parallel, cache-aware builder for any CPU
why: "BuildKit features (cache mounts, secret mounts, multi-platform output) turn slow, leaky, single-architecture builds into fast, safe ones that run on laptops and servers alike."
requires: [docker-dockerfile]
lesson: none
points:
  - title: A graph, not a script
    text: BuildKit turns the Dockerfile into a dependency graph, runs independent stages in parallel and skips stages the target does not need.
  - title: Mounts that leave no trace
    text: "RUN --mount gives a step a cache directory, a secret or an SSH agent for the duration of that step only; none of it lands in a layer."
  - title: One tag, many platforms
    text: A multi-platform image is an index that points to one manifest per OS and CPU; each machine pulls the variant that matches it.
  - title: Cross-compile when you can
    text: "Run the compiler on the build machine's own platform and target the others, instead of emulating a foreign CPU."
quiz_hint: Think about what ends up stored in a layer, and which CPU is actually running each step.
quiz:
  - q: You pass an npm token with ARG NPM_TOKEN and use it in RUN npm ci. What is the risk?
    options: ["None, ARG values are encrypted", "Build arguments and environment variables persist in the image, so the token can be read later", "The build fails on CI"]
    answer: 1
    explain: "Docker's docs say build arguments and environment variables are inappropriate for secrets because they persist in the final image. Use RUN --mount=type=secret,id=npm and docker build --secret id=npm,src=... instead."
  - q: "What does FROM --platform=$BUILDPLATFORM golang:1.27-alpine AS build achieve in a multi-platform build?"
    options: ["It forces every variant to be built for the build machine's CPU", "The compiler stage runs natively on the build machine; GOOS and GOARCH from TARGETOS and TARGETARCH choose the output", "It disables BuildKit caching"]
    answer: 1
    explain: "Without it, the amd64 variant's build stage would run the Go compiler under emulation. Running it natively and cross-compiling is much faster and needs no QEMU."
  - q: What does a multi-platform image tag point to in the registry?
    options: ["A single manifest for the most common CPU", "An image index listing one manifest per platform", "A zip of all architectures"]
    answer: 1
    explain: "The tag resolves to an OCI image index (manifest list). The client picks the entry matching its OS and architecture, so the same name works on arm64 Macs and amd64 servers."
links:
  - { title: "BuildKit (Docker docs)", url: "https://docs.docker.com/build/buildkit/" }
  - { title: "Multi-platform builds (Docker docs)", url: "https://docs.docker.com/build/building/multi-platform/" }
  - { title: "Build secrets (Docker docs)", url: "https://docs.docker.com/build/building/secrets/" }
  - { title: "Optimize cache usage: cache mounts (Docker docs)", url: "https://docs.docker.com/build/cache/optimize/" }
---
BuildKit is the build engine behind `docker build` and `docker buildx build`; it is the default builder in Docker Desktop and Docker Engine for Linux images. Instead of running Dockerfile lines one after another, it parses them into a graph of steps, runs what it can in parallel, caches each step by its inputs, and can produce images for several CPU architectures in one build.

## Mounts for a single step

A `RUN --mount` attaches something to one step without storing it in the layer. The first line, `# syntax=docker/dockerfile:1`, opts into the current Dockerfile frontend, which supports all of these.

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# A persistent npm cache, a throwaway /tmp, and a secret: none of them land in the layer
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=tmpfs,target=/tmp \
    --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]
```

```sh
docker build --secret id=npmrc,src=$HOME/.npmrc -t hello:1 .
```

- **Cache mounts** keep package-manager or compiler caches between builds, so a changed lockfile reinstalls from a warm cache instead of the network, and the cache stays out of the image.
- **tmpfs mounts** give a step a scratch directory that vanishes afterwards. Check what your steps leave behind: in the plain Dockerfile from the Dockerfile topic, the `npm ci` layer is 2.72 MB for a 28 kB `node_modules`, because npm (Node 22) writes about 2.6 MB of compile cache to `/tmp/node-compile-cache`. With the mounts above, the same layer is 36.9 kB.
- **Secret mounts** expose a file (or an environment variable) only while that step runs. Never use `ARG` or `ENV` for tokens: they persist in the image and its history.
- **SSH mounts** (`--mount=type=ssh`) forward your SSH agent to clone private repositories without copying keys.

## Multi-platform images

An image name can point to an image index with one manifest per platform. To build one, list the platforms. Docker Desktop and Engine 29+ with the containerd image store can hold the result locally; older setups need a `docker-container` builder or `--push`.

There are three ways to produce the foreign variants: emulation with QEMU (simple but slow, and it must be installed), several native builder nodes, or cross-compilation. Cross-compiling is fastest where the toolchain supports it:

```dockerfile
# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM golang:1.27-alpine AS build
ARG TARGETOS TARGETARCH
WORKDIR /src
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /out/hello .

FROM gcr.io/distroless/static-debian13:nonroot
COPY --from=build /out/hello /hello
ENTRYPOINT ["/hello"]
```

```sh
docker buildx build --platform linux/amd64,linux/arm64 -t hello-go:multi .
docker image ls --tree
# IMAGE              DISK USAGE   CONTENT SIZE
# hello-go:multi         17.8MB         6.53MB
# ├─ linux/amd64          3.38MB         3.38MB
# └─ linux/arm64          14.4MB         3.15MB
```

`BUILDPLATFORM`, `TARGETOS` and `TARGETARCH` are filled in automatically. The Go compiler runs natively on the arm64 Mac for both variants; only the final stages, which just copy a file, are per platform. Without `--platform=$BUILDPLATFORM`, this same build failed on a Desktop with no amd64 emulation, because the amd64 build stage could not execute the Go toolchain at all.

## Builds in CI

Every CI runner starts with an empty cache. Export it and import it on the next run, for example to the registry (`--cache-to type=registry,ref=...,mode=max` and `--cache-from`) or to the GitHub Actions cache (`type=gha`). `mode=max` stores the intermediate stages too, which is what makes multi-stage builds fast in CI.
