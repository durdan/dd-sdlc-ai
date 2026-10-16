---
id: docker-volumes
title: Volumes and bind mounts
summary: State lives outside the container
why: "Containers are meant to be thrown away and recreated. Anything that must survive that (databases, uploads, caches) has to live in storage mounted from outside."
requires: [docker-images]
lesson: none
points:
  - title: The writable layer is disposable
    text: "Files a container writes into its own filesystem vanish with docker rm, and writing there is slower than writing to a mount."
  - title: Volumes are managed by Docker
    text: "A named volume lives in Docker's storage area, survives containers, and is the preferred home for databases and other app data."
  - title: Bind mounts map a host path
    text: "-v \"$PWD\":/app shows a host directory inside the container. Ideal for source code in development, fragile for production data."
  - title: tmpfs stays in memory
    text: "A tmpfs mount is never written to disk and disappears when the container stops: good for scratch files and secrets."
quiz_hint: Ask where the bytes physically live, and what deletes them.
quiz:
  - q: You stop and docker rm a Postgres container that used -v pgdata:/var/lib/postgresql/data. What happens to the data?
    options: ["It is deleted with the container", "It stays in the pgdata volume until you remove the volume", "It is copied into the image"]
    answer: 1
    explain: "Named volumes have their own lifecycle. Removing the container leaves the volume; docker volume rm, docker volume prune or docker compose down -v removes it."
  - q: You mount a non-empty volume at /app/config in a container whose image already has files there. What does the app see?
    options: ["Both sets of files merged", "Only the volume's files; the image's files are hidden under the mount", "Only the image's files"]
    answer: 1
    explain: "A mount covers the directory beneath it, like mounting a USB drive over /mnt. An empty new volume is the exception: Docker first copies the image's files into it."
  - q: Which kind of mount suits live-reloading source code on a developer laptop?
    options: ["A named volume", "A bind mount of the project directory", "A tmpfs mount"]
    answer: 1
    explain: "A bind mount shows the host files directly, so edits appear in the container at once. For production data prefer volumes, which do not depend on the host's directory layout."
links:
  - { title: "Storage overview (Docker docs)", url: "https://docs.docker.com/engine/storage/" }
  - { title: "Volumes (Docker docs)", url: "https://docs.docker.com/engine/storage/volumes/" }
  - { title: "Bind mounts (Docker docs)", url: "https://docs.docker.com/engine/storage/bind-mounts/" }
  - { title: "tmpfs mounts (Docker docs)", url: "https://docs.docker.com/engine/storage/tmpfs/" }
---
A container's own filesystem is the image plus a thin writable layer, and that layer is deleted with the container. That is a feature: you can replace a container at any time with a fresh one from a new image. The price is that anything worth keeping must be written to a mount, a piece of storage that exists independently of the container and is attached at a path inside it.

## Three kinds of mount

| Type | Where the data lives | Typical use |
| --- | --- | --- |
| Volume | Docker's storage area (`/var/lib/docker/volumes/<name>/_data` on Linux, inside the VM on Docker Desktop) | Databases, uploads, anything the app owns |
| Bind mount | A path you choose on the host | Source code and config in development, host files a tool must read |
| tmpfs | Memory only | Scratch space, files that must never touch disk |

## Volumes survive containers

```sh
docker volume create appdata
docker run --rm -v appdata:/data alpine:3.22 sh -c 'echo first > /data/note.txt'
docker run --rm -v appdata:/data alpine:3.22 cat /data/note.txt
# first

docker volume inspect appdata --format '{{.Mountpoint}}'
# /var/lib/docker/volumes/appdata/_data
```

Both containers were removed (`--rm`), and the file outlived them. The longer form `--mount type=volume,src=appdata,dst=/data` says the same thing more explicitly and fails loudly on typos; `-v` silently creates a new volume if the name is misspelt.

When a new, empty volume is mounted over a directory that has files in the image, Docker copies those files into the volume first. A volume that already has content simply hides what the image had at that path, and so does a bind mount, always.

## Bind mounts are for development

```sh
docker run --rm -it -v "$PWD":/app -w /app -p 127.0.0.1:8765:3000 node:22-alpine node server.js
```

Edits on the host show up in the container immediately, which is what live reload needs. The downsides: the container depends on the host's directory layout, file ownership is the host's numeric UID (a non-root container user may not be able to write), the container can modify host files, and on Docker Desktop every access crosses the VM's file sharing. Add `:ro` when the container only needs to read.

## Habits for state

- **One owner per volume.** Two database containers writing to one volume will corrupt it; shared filesystems need software designed for them.
- **Declare volumes in Compose** so they are created and named predictably; `docker compose down` keeps them, `down -v` deletes them.
- **Back up through a container.** Mount the volume and a host directory into a short-lived container and run `tar`, or better, use the database's own dump tool.
- **Know the `VOLUME` instruction.** A `VOLUME /data` line in an image makes Docker create an anonymous volume there for every container that does not mount one; these pile up unnoticed (`docker volume ls`).
- **Watch permissions.** Pre-create directories with the right owner in the Dockerfile (`RUN mkdir /data && chown node:node /data`) so a non-root user can write to a fresh volume.

In Kubernetes the same idea becomes PersistentVolumes and PersistentVolumeClaims: storage with its own lifecycle, attached to whichever pod needs it.
