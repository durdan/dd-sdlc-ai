---
id: git-tags
title: "Tags and releases"
summary: Fixed names for the commits you ship
why: "A release needs a name that will point at the same code forever, so you can rebuild it, diff against it and know what is running."
requires: [git-objects, git-remotes]
lesson: none
points:
  - title: A tag is a ref that doesn't move
    text: "Branches advance with each commit; a tag stays on the commit it was given."
  - title: Lightweight or annotated
    text: "A lightweight tag is just a ref. An annotated tag is an object with tagger, date, message and an optional signature."
  - title: Tags aren't pushed by default
    text: "Push them explicitly with git push origin v1.2.0, or with --follow-tags for annotated tags on pushed commits."
  - title: Don't move a published tag
    text: "Other clones keep the old one. Release a new version number instead."
quiz:
  - q: "What is stored for an annotated tag that is not stored for a lightweight one?"
    options: ["Nothing; they are the same", "A tag object with the tagger, date and message (and optionally a signature)", "A copy of the tagged commit"]
    answer: 1
    explain: "git tag -a writes a tag object and points refs/tags/<name> at it. A lightweight tag points the ref straight at the commit."
  - q: "You run git push after creating tag v2.0.0. Is the tag on the server?"
    options: ["Yes, tags always go with the branch", "No, a plain push sends branches only; push the tag by name or use --follow-tags", "Only if it is annotated"]
    answer: 1
    explain: "Tags are pushed explicitly so that local experiment tags don't leak. --follow-tags pushes annotated tags that point at commits you are pushing."
  - q: "git describe prints v1.0.0-1-g9bd4269. What does it mean?"
    options: ["Version 1.0.0, patch 1", "One commit after the tag v1.0.0, at commit 9bd4269", "Tag v1.0.0 was edited once"]
    answer: 1
    explain: "describe names a commit relative to the nearest annotated tag: the tag, the number of commits since it, and g plus the abbreviated hash."
links:
  - { title: "Tagging (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Basics-Tagging" }
  - { title: "git-tag (reference)", url: "https://git-scm.com/docs/git-tag" }
  - { title: "git-describe (reference)", url: "https://git-scm.com/docs/git-describe" }
---
A tag is a ref under `refs/tags/` that names one commit and, unlike a branch, does not move when you commit. That makes it the natural name for a release. Git has two kinds: a lightweight tag is only the ref, while an annotated tag is a real object in the database that records who tagged, when, a message and optionally a signature. Use annotated tags for anything you publish.

## Both kinds side by side

```sh
git init -q -b main demo && cd demo
for n in 1 2 3; do echo "v$n" > app.txt; git add app.txt; git commit -q -m "Change $n"; done
git tag before-cleanup HEAD~1
git tag -a v1.0.0 -m "First stable release"
git cat-file -t before-cleanup
git cat-file -t v1.0.0
git cat-file -p v1.0.0
```

```text
commit
tag
object 9e15937b1e10978746a883d43a16c594f985c2b2
type commit
tag v1.0.0
tagger Ada <ada@example.com> 1767607200 +0000

First stable release
```

`before-cleanup` resolves straight to a commit. `v1.0.0` is a tag object of its own that points at the commit, which is the fourth kind of object after blobs, trees and commits. `git tag -s` (or `git config tag.gpgSign true`) adds a signature, as described in the signing topic.

## Name builds after tags

```sh
echo "v4" > app.txt && git commit -q -am "Change 4"
git describe
git describe --abbrev=0
```

```text
v1.0.0-1-g9bd4269
v1.0.0
```

`git describe` finds the nearest annotated tag and says how far you are from it: one commit past `v1.0.0`, at commit `9bd4269` (the `g` stands for git). Build scripts often stamp this into a binary so you can tell exactly what is running. It ignores lightweight tags unless you add `--tags`.

## Publishing tags

A plain `git push` sends branches, not tags. Push a release tag by name, or let annotated tags travel with the commits they point at:

```sh
git push origin v1.0.0
git push --follow-tags
git config --global push.followTags true
```

Hosting services build on tags. A GitHub or GitLab release is a tag plus notes and attached build artefacts, and CI pipelines often run a release job when a tag matching `v*` is pushed.

## Rules of thumb

- **Version numbers.** Most projects use semantic versioning (`MAJOR.MINOR.PATCH`, with a `v` prefix by convention), so the tag tells users whether an upgrade can break them.
- **Never move a published tag.** `git tag -f` and a forced push replace the tag on the server, but clones that already fetched it keep the old one, and fetching refuses to replace it (`would clobber existing tag`). Tag a new version instead.
- **Tags are not branches.** To fix an old release, create a branch from its tag (`git switch -c release-1.0 v1.0.0`), commit the fix and tag `v1.0.1`.
- **Fetching.** `git fetch` brings tags that point into the history it downloads; `git fetch --tags` fetches all of them.
