---
id: cicd-reproducible-builds
title: Reproducible builds
summary: Same source and same tools give the same bytes
why: "If two builds of one commit produce different files, you can't tell a harmless difference from a tampered build, and you can't rebuild an old release with confidence."
requires: [cicd-pipeline-design, docker-registries]
lesson: none
points:
  - title: Pin every input
    text: "Lockfiles for dependencies, exact versions for compilers and tools, base images by digest. A floating input makes a floating output."
  - title: Remove the noise
    text: "Timestamps, file ordering, absolute paths, usernames and random IDs leak into archives and binaries. Fix them or strip them."
  - title: Identity by hash
    text: "A reproducible artifact is named by the digest of its bytes. Anyone can rebuild it and check they get the same digest."
quiz:
  - q: "A Dockerfile starts with `FROM node:24`. Why can the same commit build different images next month?"
    options: ["Docker adds randomness", "The `node:24` tag moves to newer images; pin the base image by digest for a repeatable build", "It can't; Docker builds are deterministic"]
    answer: 1
    explain: "Tags are pointers that maintainers move with each patch release. `FROM node:24@sha256:...` always resolves to the same image."
  - q: Two builds of the same commit produce tarballs with different hashes. The files inside are identical. What is the most likely cause?
    options: ["A compiler bug", "Archive metadata such as modification times or the order files were added in", "Network errors"]
    answer: 1
    explain: "Archives store each file's mtime and order. Setting a fixed time (SOURCE_DATE_EPOCH) and sorting entries usually makes them byte-identical."
  - q: What does `npm ci` do that `npm install` does not?
    options: ["Runs faster on every machine", "Installs exactly what the lockfile says and fails if package.json and the lockfile disagree", "Skips dev dependencies"]
    answer: 1
    explain: "`npm ci` never rewrites the lockfile, so CI gets the exact tree that was reviewed. `npm install` may resolve ranges to newer versions."
links:
  - { title: "Reproducible Builds: definition", url: "https://reproducible-builds.org/docs/definition/" }
  - { title: "SOURCE_DATE_EPOCH (Reproducible Builds)", url: "https://reproducible-builds.org/docs/source-date-epoch/" }
  - { title: "npm ci (npm Docs)", url: "https://docs.npmjs.com/cli/commands/npm-ci" }
---
A build is **reproducible** when anyone who takes the same source, the same build instructions and the same tool versions gets bit-for-bit the same output. It sounds academic, but it is what makes "build once, promote everywhere" safe, lets you rebuild a two-year-old release for a hotfix, and lets a second, independent build check that the first one wasn't tampered with.

## Where differences come from

Most non-reproducibility comes from two places.

**Floating inputs.** A version range in `package.json`, a `FROM node:24` tag, `apt-get install` without versions, or a "latest" compiler on the build machine. Each can resolve to something new without any change in your repository. Fix them with lockfiles (`package-lock.json`, `go.sum`, `poetry.lock`), installers that respect them (`npm ci`, `pip install --require-hashes`), base images pinned by digest, and toolchains pinned in the repository (`.nvmrc`, `go.mod`'s `toolchain`, a pinned builder image).

**Noise in the output.** Build timestamps baked into binaries or archive entries, files added in whatever order the filesystem returns them, absolute paths of the build directory, the username, random identifiers. The Reproducible Builds project's convention is the `SOURCE_DATE_EPOCH` environment variable: tools that support it use that fixed time, usually the commit time, instead of "now".

## Seeing it

This toy build packs two files into an "archive" and hashes it. With the current time and filesystem order in the archive, every build gets a new digest. With a fixed time and sorted entries, the digest is stable:

```js run
// A toy 32-bit FNV-1a hash standing in for sha256. Not for real use.
function toyHash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, "0")
}

const sources = { "index.js": "console.log('hi')", "util.js": "export const x = 1" }

function build({ time, order }) {
  const entries = order.map((name) => `${name}|mtime=${time}|${sources[name]}`)
  return toyHash(entries.join("\n"))
}

// Noisy: build time and filesystem order end up in the archive.
console.log("noisy 1:", build({ time: 1760000000, order: ["util.js", "index.js"] }))
console.log("noisy 2:", build({ time: 1760000042, order: ["index.js", "util.js"] }))

// Reproducible: a fixed time (like SOURCE_DATE_EPOCH) and sorted entries.
const SOURCE_DATE_EPOCH = 1759900000
const sorted = Object.keys(sources).sort()
console.log("fixed 1:", build({ time: SOURCE_DATE_EPOCH, order: sorted }))
console.log("fixed 2:", build({ time: SOURCE_DATE_EPOCH, order: sorted }))
```

## In a pipeline

- Build in a pinned, clean environment: a container image by digest or a hosted runner, never a long-lived machine with leftovers.
- Install from the lockfile only and fail if it would change.
- Set `SOURCE_DATE_EPOCH` from the commit time (`git log -1 --format=%ct`).
- Record the artifact's digest and deploy by digest.

## How far to go

Perfect reproducibility can take real effort, especially for native code. Even partway helps: pinned inputs alone remove most "it built differently in production" surprises. Full reproducibility is what lets independent builders verify each other, the strongest check against a compromised build machine.
