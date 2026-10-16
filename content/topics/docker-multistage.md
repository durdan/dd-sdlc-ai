---
id: docker-multistage
title: Multi-stage builds and small images
summary: Build with a toolchain, ship without it
why: "Every compiler, package manager and shell you ship is more to download, more to scan and more for an attacker to use. Multi-stage builds leave them behind."
requires: [docker-dockerfile]
lesson: none
points:
  - title: Several FROMs, one image
    text: "Each FROM starts a new stage. Only the last stage (or the one you --target) becomes the image; earlier stages are scaffolding."
  - title: Copy just the result
    text: "COPY --from=build takes the compiled binary or bundle out of the build stage and nothing else."
  - title: Pick the runtime base on purpose
    text: "Debian slim, Alpine, distroless and scratch trade size against libc compatibility, debuggability and tooling."
  - title: Smaller means safer
    text: "Fewer packages mean fewer CVEs to triage and no shell or package manager for an intruder to use."
quiz_hint: Only the final stage is shipped; think about what is and is not copied into it.
quiz:
  - q: What ends up in the image built from this Dockerfile?
    code: |
      FROM golang:1.27-alpine AS build
      WORKDIR /src
      COPY . .
      RUN CGO_ENABLED=0 go build -o /out/hello .

      FROM gcr.io/distroless/static-debian13:nonroot
      COPY --from=build /out/hello /hello
      ENTRYPOINT ["/hello"]
    options: ["The Go toolchain, the source and the binary", "The distroless base and the one binary", "Only the source code"]
    answer: 1
    explain: "The final stage starts from distroless and copies a single file from the build stage. The 381 MB build stage is used during the build and then discarded."
  - q: "docker exec -it app sh fails with 'executable file not found' on a distroless image. Why?"
    options: ["The container is not running", "Distroless images contain no shell, by design", "exec is disabled for non-root users"]
    answer: 1
    explain: "Distroless images contain the app's runtime dependencies only. To debug, use the :debug variant (which adds a busybox shell), docker debug, or in Kubernetes an ephemeral debug container."
  - q: A Python wheel with C extensions works on python:3.13-slim but crashes on Alpine. What is the likely cause?
    options: ["Alpine uses musl libc, not glibc, so binaries built for glibc do not match", "Alpine has no Python", "Alpine images are always amd64"]
    answer: 0
    explain: "Alpine is small partly because it uses musl and BusyBox. Prebuilt binaries that expect glibc may not load or may behave differently. Use musl-built wheels or a Debian-based slim image."
links:
  - { title: "Multi-stage builds (Docker docs)", url: "https://docs.docker.com/build/building/multi-stage/" }
  - { title: "Building best practices (Docker docs)", url: "https://docs.docker.com/build/building/best-practices/" }
  - { title: "Distroless container images (GoogleContainerTools)", url: "https://github.com/GoogleContainerTools/distroless" }
---
Building software needs compilers, package managers, headers and caches. Running it usually needs only the result. A multi-stage Dockerfile uses one stage with the full toolchain to build, then starts a fresh, minimal stage and copies in just the artefact. The image you ship never contains the build tools.

## A Go service, two stages

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/hello .

FROM gcr.io/distroless/static-debian13:nonroot
COPY --from=build /out/hello /hello
EXPOSE 8080
ENTRYPOINT ["/hello"]
```

```sh
docker build -t hello-go:1 .
docker build --target build -t hello-go:build .   # stop after the first stage, for comparison
docker image ls --tree
# IMAGE             DISK USAGE   CONTENT SIZE
# hello-go:1            14.4MB         3.15MB
# hello-go:build         381MB         74.4MB
```

The shipped image is about 3 MB to download instead of 74 MB, and it contains one binary plus the CA certificates, timezone data and `/etc/passwd` entries that distroless provides. With BuildKit, stages that the target does not depend on are skipped, and independent stages build in parallel.

The same pattern works for any language: build a frontend bundle with Node and copy `dist/` into an nginx or static-server stage; run `mvn package` in a JDK stage and copy the jar into a JRE-only stage; install Python wheels in a builder and copy the virtual environment into a slim runtime.

## Choosing the runtime base

| Base | Size | Has a shell? | Notes |
| --- | --- | --- | --- |
| `debian:*-slim`, `python:*-slim` | tens of MB | yes | glibc, apt; the most compatible choice |
| `alpine` | a few MB | yes (BusyBox) | musl libc: some prebuilt binaries and DNS edge cases differ |
| distroless | a few MB and up | no (`:debug` tags add BusyBox) | runtime files only; `:nonroot` tags run as UID 65532 |
| `scratch` | empty | no | only for fully static binaries; you add certificates yourself |

There is no single right answer. Alpine is small but its musl libc is a different C library from the glibc most software is tested against. Distroless removes the shell and package manager, which shrinks the attack surface and the CVE list, but you debug from outside the container. Slim Debian images are larger and boring, which is often what you want for interpreted languages with native extensions.

## What to check

- `docker run --rm --entrypoint sh hello-go:1` fails with `exec: "sh": executable file not found in $PATH`: no shell, as intended.
- `docker image inspect hello-go:1 --format '{{.Config.User}}'` prints `65532`: the `:nonroot` base already sets a non-root user.
- Dev dependencies stay out: for Node, run `npm ci --omit=dev` (or prune) in the stage you copy `node_modules` from.
- Keep the build stage's base pinned too; a new compiler version is a change like any other.
