---
id: git-large-repos
title: "Large repositories: shallow, partial and sparse clones, and LFS"
summary: Download less history, fewer files, or keep big files out of Git
why: "A monorepo or a repository full of assets can take many minutes to clone in full. Most jobs need a fraction of it."
requires: [git-remotes]
lesson: none
points:
  - title: Shallow clones cut history
    text: "--depth 1 fetches only the latest commit. Fast for CI builds, but log, blame and merge-base don't see older history."
  - title: Partial clones fetch file contents on demand
    text: "--filter=blob:none gets all commits and trees but only the blobs you check out; the rest arrive when needed."
  - title: Sparse checkout limits the working tree
    text: "Only the directories you list are written to disk, which keeps status and builds fast in a monorepo."
  - title: LFS keeps big binaries out of the object database
    text: "Git stores a small pointer file; the real content sits on an LFS server and is downloaded at checkout."
quiz:
  - q: "A CI job only builds the latest commit. Which clone is the usual choice?"
    options: ["A full clone", "A shallow clone with --depth 1", "A mirror clone"]
    answer: 1
    explain: "It downloads one commit's worth of objects. If the job later needs history (for git describe or a diff against main), fetch more with git fetch --deepen or --unshallow."
  - q: "What does a blob:none partial clone leave out?"
    options: ["Commits", "File contents (blobs) that are not needed for the current checkout, fetched later on demand", "Tags"]
    answer: 1
    explain: "You keep complete history (commits and trees), so log and blame work, and Git fetches missing blobs from the remote when a command needs them."
  - q: "Why is committing a 2 GB video directly into Git a problem even after you delete it in a later commit?"
    options: ["It isn't; deleted files are removed", "Every clone still downloads it, because it stays in history", "Git refuses files over 1 GB"]
    answer: 1
    explain: "History is immutable: the blob is reachable from the old commit forever unless history is rewritten. That is why big binaries belong in LFS or an artefact store from the start."
links:
  - { title: "Partial clone (Git documentation)", url: "https://git-scm.com/docs/partial-clone" }
  - { title: "git-sparse-checkout (reference)", url: "https://git-scm.com/docs/git-sparse-checkout" }
  - { title: "git-clone: --depth and --filter (reference)", url: "https://git-scm.com/docs/git-clone" }
  - { title: "Git Large File Storage", url: "https://git-lfs.com/" }
---
By default `git clone` downloads every object in the history of every branch and writes every file to disk. For a large monorepo or a repository with years of binary assets that can mean gigabytes and many minutes. Git has three built-in ways to take less: a shallow clone cuts history, a partial clone skips file contents until they are needed, and sparse checkout writes only some directories. Git LFS takes a different approach and keeps large binaries out of the object database altogether.

## Try all three on a small repository

A local repository with five services stands in for a big one. Partial clone needs the server to allow filters, which hosting services do; locally you switch it on with `uploadpack.allowFilter`.

```sh
mkdir big-demo && cd big-demo
git init -q -b main src
for n in 1 2 3 4 5; do mkdir src/svc$n; echo "code $n" > src/svc$n/main.txt; git -C src add .; git -C src commit -q -m "Commit $n"; done
git -C src config uploadpack.allowFilter true
git clone -q --depth 1 "file://$PWD/src" shallow
git -C shallow log --oneline
git -C shallow rev-parse --is-shallow-repository
```

```text
b2ac409 Commit 5
true
```

The shallow clone has only the tip commit. That is ideal for CI that builds once and throws the clone away, and it is what many CI systems do by default. The cost: `git log`, `git blame` and finding a merge base stop at the cut. `git fetch --deepen=50` or `git fetch --unshallow` brings history back.

```sh
git clone -q --filter=blob:none "file://$PWD/src" partial
git -C partial log --oneline | wc -l
git -C partial config remote.origin.partialclonefilter
```

```text
       5
blob:none
```

The partial clone has all five commits and every tree, but only the blobs needed for the files checked out. When you check out an old commit or run a diff that needs an old version, Git fetches the missing blobs from the remote (the "promisor") on demand. For day-to-day development in a big repository this is usually the best default. `--filter=tree:0` also skips trees and suits throwaway builds; it is slower if you later need history.

```sh
git clone -q --filter=blob:none --sparse "file://$PWD/src" sparse
ls sparse
git -C sparse sparse-checkout set svc2
ls sparse
```

```text
svc2
```

With `--sparse`, the clone starts with only top-level files (there are none here), and `sparse-checkout set` adds the directories you work on. Cone mode, the default, matches whole directories, which keeps it fast. Combined with a partial clone, Git downloads only the blobs for those directories. `wc -l` pads its count with spaces on macOS; on Linux it prints just `5`.

## Git LFS for large binaries

Git stores every version of every file, and binary files such as videos, models and design files don't delta-compress well. Once a big file is committed, every future clone downloads it, even if a later commit deletes it. Git Large File Storage, a separate extension, replaces tracked files in the repository with small text pointers and stores the real content on an LFS server (GitHub, GitLab and Bitbucket provide one).

```sh
git init -q -b main lfs-demo && cd lfs-demo
head -c 100000 /dev/urandom > design.psd
git lfs install
git lfs track "*.psd"
git add .gitattributes design.psd
git commit -q -m "Add design file via LFS"
cat .gitattributes
git cat-file -p HEAD:design.psd
```

```text
Updated Git hooks.
Git LFS initialized.
Tracking "*.psd"
*.psd filter=lfs diff=lfs merge=lfs -text
version https://git-lfs.github.com/spec/v1
oid sha256:3bc10117a15eedb0de1bbf832527122ba5724febe85bcf29cf32600f646887ac
size 100000
```

`git lfs track` writes a rule to `.gitattributes`. The blob Git committed for `design.psd` is the three-line pointer: the SHA-256 of the real content (random here, so yours will differ) and its size. The 100 kB of real content sits in `.git/lfs/objects` and is uploaded to the LFS server on push; clones download it only for the commits they check out. LFS is a separate program, not part of Git: this was run with git-lfs 3.4.1 in an Ubuntu container, since it is not installed on the Mac used for the other examples. Moving files that are already committed into LFS means rewriting history with `git lfs migrate`.

Other levers for very large repositories: `git maintenance start` schedules background repacking and prefetching, and `scalar` (shipped with Git) clones with partial clone, sparse checkout and maintenance already set up.
