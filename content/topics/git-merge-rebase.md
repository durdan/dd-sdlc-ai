---
id: git-merge-rebase
title: "Merge, rebase and fast-forward: what each one rewrites"
summary: Join histories with a new commit, or replay commits as new ones
why: "Choosing between merge and rebase is mostly about one question: are you willing to replace commits that other people may already have?"
requires: [git-refs]
lesson: none
points:
  - title: Fast-forward just moves the pointer
    text: "If the target is an ancestor of the other branch, merging only moves the branch forward. No new commit."
  - title: A merge adds a commit with two parents
    text: "Nothing existing changes. History shows that two lines of work were joined."
  - title: Rebase makes new commits
    text: "Each of your commits is replayed onto the new base as a new commit with a new hash; the branch moves to the copies."
  - title: Don't rebase what others have
    text: "Rebasing shared commits forces everyone who has the old ones to sort out the difference."
quiz:
  - q: "main has not moved since you branched feature off it. What does git merge feature do on main?"
    options: [Creates a merge commit, "Fast-forwards: moves main to feature's tip, no new commit", Rebases feature]
    answer: 1
    explain: "main is an ancestor of feature, so there is nothing to join. Git moves the pointer forward. Use --no-ff if you want a merge commit anyway."
  - q: "After git rebase main on your feature branch, your three commits have new hashes. Why?"
    options: ["Rebase compresses them", "Each was re-created with a different parent, and the parent is part of a commit's content", "The hashes are random"]
    answer: 1
    explain: "A commit's hash covers its parent. Replaying it on a new base gives it a new parent, a new tree and so a new hash. The old commits still exist until garbage collection."
  - q: "Which is safe to do to a branch that teammates have already pulled?"
    options: ["Rebase it onto main and force-push", "Merge main into it", "Amend its oldest commit"]
    answer: 1
    explain: "Merging only adds a commit. Rebasing and amending replace existing commits, so anyone who built on the old ones has to reconcile."
links:
  - { title: "Rebasing (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Branching-Rebasing" }
  - { title: "git-merge (reference)", url: "https://git-scm.com/docs/git-merge" }
  - { title: "git-rebase (reference)", url: "https://git-scm.com/docs/git-rebase" }
---
When two branches have both moved on from a common commit, you can bring them together in two ways. A merge creates one new commit with two parents and changes nothing that already exists. A rebase replays your commits one by one on top of the other branch, creating new commits with new hashes, and moves your branch to the copies. And if only one side has moved, there is nothing to join: Git can fast-forward by moving the pointer.

## Fast-forward

Each commit below adds one file named after it. `c` is a small helper so the examples stay short.

```sh
git init -q -b main demo && cd demo
c() { echo "$1" > "$1.txt"; git add "$1.txt"; git commit -q -m "$1"; }
c A; c B
git switch -q -c feature; c C
git switch -q main
git merge feature
```

```text
Updating 6a57305..0605270
Fast-forward
 C.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 C.txt
```

`main` was an ancestor of `feature`, so Git moved `main` to `C`. Many teams merge pull requests with `--no-ff` so each feature leaves a merge commit, or set `git merge --ff-only` to refuse anything but a fast-forward.

## A true merge

Now let both branches move on:

```sh
git switch -q feature; c D
git switch -q main; c E
git merge -q --no-edit feature
git log --oneline --graph
git cat-file -p HEAD | head -3
```

```text
*   d01cd76 Merge branch 'feature'
|\  
| * ae76f44 D
* | 142af93 E
|/  
* 0605270 C
* 6a57305 B
* 74bbda3 A
tree 1bfd30eae5765ed9ea8d9cf2b38535fc1cdf1bb5
parent 142af93c96d4bec1b8f29853a9b3dc30d99a1a67
parent ae76f440ec825afc3e8b597e5ba34ea9a776ea9c
```

The merge commit has two `parent` lines. `D` and `E` keep their hashes; history shows exactly what happened, including that work went on in parallel.

## Rebase instead

Undo that merge and rebase `feature` onto `main` instead:

```sh
git reset -q --hard HEAD~1
git switch -q feature
git rev-parse --short HEAD
git rebase main
git log --oneline --graph
```

```text
ae76f44
Successfully rebased and updated refs/heads/feature.
* c1e1e0c D
* 142af93 E
* 0605270 C
* 6a57305 B
* 74bbda3 A
```

`D` was `ae76f44`; now it is a different commit with `E` as its parent. The history is a straight line, and `main` can fast-forward to it. The original `D` still exists, reachable through the reflog, until garbage collection.

## Choosing

| | Merge | Rebase |
| --- | --- | --- |
| Existing commits | Untouched | Replaced by copies |
| History | Shows parallel work and when it was joined | Linear, as if done in sequence |
| Conflicts | Resolved once, in the merge commit | Possibly once per replayed commit |
| Safe on shared branches | Yes | No, unless everyone agrees |

A common rule: rebase your own unpublished work to keep it tidy (`git pull --rebase`, `git rebase -i` to squash fixups), and merge when combining branches other people use. `git rebase --update-refs` also moves any branches stacked on top of the one you rebase.
