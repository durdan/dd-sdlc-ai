---
id: docker-images
title: Images and layers
summary: Stacked, content-addressed filesystem snapshots
why: "Image size, build speed, pull time and disk use all come down to layers: what is in each one, and which ones two images share."
requires: [docker-containers]
lesson: none
points:
  - title: An image is a stack of layers
    text: Each layer is a tarball of file changes. A small JSON manifest lists the layers in order, plus a config with the default command, user and environment.
  - title: Addressed by content
    text: Every layer and manifest is named by the SHA-256 digest of its bytes, so identical layers are stored and downloaded once.
  - title: Merged into one view
    text: A union filesystem stacks the read-only layers and adds a thin writable layer per container on top (copy-on-write).
  - title: An open format
    text: The OCI image specification defines the layout, so any compliant registry and runtime can use the same image.
quiz_hint: Layers only ever add on top; nothing in a later layer can change what an earlier one stored.
quiz:
  - q: "One RUN step downloads a 200 MB archive; the next RUN step deletes it. How does that affect the image size?"
    options: ["It shrinks back, the file is gone", "The 200 MB stays, because it is stored in the earlier layer", "Docker detects it and merges the layers"]
    answer: 1
    explain: "The delete adds a whiteout entry in the new layer that hides the file, but the earlier layer still contains it and is still shipped. Download and delete in the same RUN step, or use a multi-stage build."
  - q: Ten images on your machine all start FROM the same base. How many copies of the base layers are stored?
    options: ["Ten", "One, because layers are identified by digest and shared", "None until a container runs"]
    answer: 1
    explain: "Layers are content-addressed. Identical bytes have an identical digest, so the store keeps one copy and every image refers to it. Registries share them the same way."
  - q: A container writes a log file under /var/log and you then run docker rm. What happens to the file?
    options: ["It is saved into the image", "It is deleted with the container's writable layer", "It moves to a volume automatically"]
    answer: 1
    explain: "Writes go to the container's own writable layer, which is removed with the container. Data that should survive goes in a volume or bind mount."
links:
  - { title: "Understanding image layers (Docker docs)", url: "https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/" }
  - { title: "Storage drivers and copy-on-write (Docker docs)", url: "https://docs.docker.com/engine/storage/drivers/" }
  - { title: "containerd image store (Docker docs)", url: "https://docs.docker.com/engine/storage/containerd/" }
  - { title: "OCI image format specification", url: "https://github.com/opencontainers/image-spec/blob/main/spec.md" }
---
An image is a read-only stack of filesystem layers plus a little metadata. Each Dockerfile instruction that changes files (`RUN`, `COPY`, `ADD`) produces one layer: a tarball of what was added, changed or deleted compared to the layer below. When a container starts, the layers are stacked into one directory tree and a fresh, empty writable layer goes on top for that container alone.

## Looking inside

```sh
docker history hello:1 --format '{{.Size}}\t{{.CreatedBy}}'
# 0B      CMD ["node" "server.js"]
# 0B      USER node
# 12.3kB  COPY . . # buildkit
# 2.72MB  RUN /bin/sh -c npm ci --omit=dev # buildkit
# 16.4kB  COPY package.json package-lock.json ./ # buildkit
# 8.19kB  WORKDIR /app
# 0B      CMD ["node"]
# ...     (the node:22-alpine base layers)
```

Instructions such as `CMD`, `USER` and `ENV` only change the image config, so they add no file layer. `docker image inspect --format '{{json .RootFS.Layers}}'` lists the layer digests (`sha256:1b34...`) that make up the filesystem.

## Content addressing

Every piece of an image is named by the SHA-256 hash of its bytes: each layer, the config, and the manifest that lists them. Because the name is derived from the content:

- two images that share a base share those layers on disk and in the registry, and a pull downloads only the layers you do not already have;
- a digest can be verified after download, so tampering is detectable;
- the manifest's own digest identifies the whole image exactly, which is what pinning by digest relies on.

The OCI image specification standardises this layout: an image index (one entry per platform), manifests, configs and layers. Docker, containerd, Podman, and all major registries speak it.

## The union filesystem and copy-on-write

At run time the storage layer (overlayfs on most Linux hosts) presents the layers as one merged tree. Reads fall through to the highest layer that has the file. The first write to a file from a lower layer copies it up into the container's writable layer, and the change happens there; the image itself is never modified. That is why a hundred containers from one image start instantly and use almost no extra disk.

Two consequences catch people out:

1. **Deleting does not shrink.** Removing a file in a later layer only records a whiteout that hides it. The bytes are still in the earlier layer and still shipped.
2. **Container writes are temporary.** Everything in the writable layer disappears with `docker rm`. Writing heavily there is also slower than writing to a volume.

## A recent change: the containerd image store

Docker Engine 29.0 made the containerd image store the default for fresh installations (upgraded daemons keep the classic `overlay2` driver until you switch); Docker Desktop already used it. Images are now kept by containerd's content store and unpacked by snapshotters. Day to day the commands are the same, but the store can hold multi-platform images and attestations, and `docker image ls` reports both disk usage and content (download) size:

```sh
docker image ls --tree
# IMAGE              ID             DISK USAGE   CONTENT SIZE
# hello:1            ba5bcd6124ac        237MB         61.6MB
```
