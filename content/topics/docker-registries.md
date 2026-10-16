---
id: docker-registries
title: Registries, tags and digests
summary: Tags move; digests never do
why: "If you deploy by tag, the same YAML can run different code tomorrow. Pinning by digest is how a build or a rollback stays exactly reproducible."
requires: [docker-images]
lesson: none
points:
  - title: A registry stores content by digest
    text: "Registries implement the OCI distribution spec: blobs and manifests are stored by their SHA-256 digest, and tags are names that point to a manifest."
  - title: Tags are mutable pointers
    text: "Anyone with push rights can move node:22-alpine, or latest, to a new image at any time. latest is only the default tag name, not 'the newest'."
  - title: Digests are immutable
    text: "name@sha256:... always resolves to exactly the same bytes, or fails. That is what you want in production and in FROM lines."
  - title: Pin the index, automate the bumps
    text: "Pin a multi-platform image by its index digest, and let a bot such as Renovate or Dependabot open pull requests when the tag moves."
quiz_hint: Ask what would happen if someone pushed a new image under the same name tomorrow.
quiz:
  - q: "Your Dockerfile says FROM node:22-alpine. The maintainers push a new 22.x build under that tag. What does your next uncached build use?"
    options: ["The image you used last time", "The new image, because the tag now points to it", "The build fails"]
    answer: 1
    explain: "Tags are moved by whoever publishes them. Pinning FROM node:22-alpine@sha256:... keeps the base fixed until you change it on purpose."
  - q: "A multi-platform image has an index digest and one manifest digest per platform. Which should you pin in a Dockerfile used on arm64 Macs and amd64 CI runners?"
    options: ["The amd64 manifest digest", "The index digest, so each machine still picks its own platform", "Either; they are the same"]
    answer: 1
    explain: "A platform manifest digest names one architecture only. The index digest fixes the whole set and still lets the client choose the matching variant."
  - q: What does the tag latest mean?
    options: ["The most recently pushed image, always", "Just the default tag name used when none is given", "The most recent stable release"]
    answer: 1
    explain: "latest is applied when you build or push without a tag. Nothing keeps it current or stable, which is why it should not appear in production manifests."
links:
  - { title: "docker image pull: pull by digest (Docker docs)", url: "https://docs.docker.com/reference/cli/docker/image/pull/" }
  - { title: "OCI distribution specification", url: "https://github.com/opencontainers/distribution-spec/blob/main/spec.md" }
  - { title: "OCI image index (image spec)", url: "https://github.com/opencontainers/image-spec/blob/main/image-index.md" }
  - { title: "Open Container Initiative", url: "https://opencontainers.org/" }
---
A registry is a content store with names on top. Docker Hub, GitHub Container Registry, Amazon ECR, Google Artifact Registry and the open-source `registry` all implement the OCI distribution specification: layers and manifests are uploaded and fetched by their SHA-256 digest, and a tag is a human-friendly name that points to one manifest. The digest identifies content; the tag is only a label someone can move.

## Anatomy of an image name

```text
ghcr.io/acme/payments:1.4.2
└─ registry ─┘└ repository ┘└ tag ┘

node:22-alpine   is short for   docker.io/library/node:22-alpine
```

With no registry, Docker assumes Docker Hub; with no namespace on Hub, `library/` (the official images); with no tag, `latest`.

## Tags versus digests

Ask the registry what a tag currently points to:

```sh
docker buildx imagetools inspect alpine:3.22
# Name:      docker.io/library/alpine:3.22
# MediaType: application/vnd.oci.image.index.v1+json
# Digest:    sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8
# Manifests:
#   Name:      docker.io/library/alpine:3.22@sha256:3e9b4b68...
#   Platform:  linux/amd64
#   ...
```

The top-level digest is the image index (one entry per platform); each entry below has its own manifest digest. Tomorrow `alpine:3.22` may point to a rebuilt index with a different digest (a patched package, a new base). The digest above will always mean exactly these bytes.

Pin by digest where reproducibility matters, and keep the tag for humans:

```dockerfile
FROM alpine:3.22@sha256:5291449c3df73caf6ed85e649dec1b9e818b39a5d8c871e97afc13e9cd5e8fa8
```

```yaml
# Kubernetes: what runs is exactly what you tested
image: ghcr.io/acme/payments:1.4.2@sha256:<digest printed by your CI push>
```

When both are present, the digest wins and the tag is ignored for resolution. Pin the index digest, not a single platform's manifest, or you lose the other architectures.

## Living with pinned digests

Pinning only helps if the pins are updated: a base pinned for a year collects a year of vulnerabilities. Tools such as Renovate and Dependabot recognise `tag@sha256:` pins and open pull requests when the tag moves, so updates are deliberate, reviewed and revertible. For your own images, tag every build with something immutable by convention (the version or git SHA), never reuse a version tag, and have CI record the pushed digest for deployment.

## Other things registries do

- **Pull limits.** Docker Hub limits anonymous and free pulls; CI that pulls a lot should authenticate or use a mirror or pull-through cache.
- **Attestations and signatures.** BuildKit can attach provenance and SBOM attestations to an image, and tools such as cosign sign a digest. Both refer to the digest, which is another reason to deploy by digest.
- **Garbage.** Untagged manifests are kept until the registry's retention or garbage collection removes them, so set lifecycle rules on private registries.
