---
id: git-index
title: "The index: what your next commit will be"
summary: Three copies of every file, and the one in the middle
why: "Most confusion about add, diff, reset and restore comes from not seeing that there are three versions of each file, not two."
requires: [git-objects]
lesson: none
points:
  - title: Three places
    text: "HEAD (the last commit), the index (the next commit as it stands) and the working tree (the files you edit)."
  - title: git add copies into the index
    text: "It writes a blob for the file's current bytes and points the index entry at it. Later edits are not included."
  - title: Two diffs, not one
    text: "git diff compares the working tree with the index; git diff --staged compares the index with HEAD."
  - title: Commit writes the index
    text: "git commit turns the index into a tree, so a commit contains exactly what was staged."
quiz:
  - q: "You edit a file, run git add, edit it again and commit. What is in the commit?"
    options: [Both edits, "Only the first edit, the version that was in the index", "Nothing, because the file changed after add"]
    answer: 1
    explain: "git add stores the file's bytes at that moment as a blob in the index. The second edit exists only in the working tree until you add it too."
  - q: "git status --short shows MM next to a file. What does it mean?"
    options: ["The file has merge conflicts", "It has staged changes (first M) and further unstaged changes (second M)", "It was modified on two branches"]
    answer: 1
    explain: "The first column compares the index with HEAD, the second compares the working tree with the index. MM means both differ."
  - q: "You run git diff and see nothing, but git commit still records changes. Why?"
    options: ["git diff is broken", "The changes are already staged; git diff only shows changes not yet added", "The commit has no changes"]
    answer: 1
    explain: "Plain git diff shows working tree against index. Once everything is added they match, so use git diff --staged to see what the commit will contain."
links:
  - { title: "Reset Demystified: the three trees (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified" }
  - { title: "git-add (reference)", url: "https://git-scm.com/docs/git-add" }
---
Git keeps three versions of every tracked file. HEAD is the last commit. The working tree is the files on disk that you edit. Between them sits the index (also called the staging area, stored in `.git/index`): a full list of paths, modes and blob hashes that describes the next commit. `git add` copies a file from the working tree into the index; `git commit` turns the index into a tree and a commit.

## Watch a file in all three places

```sh
git init -q -b main demo && cd demo
echo "hello" > greeting.txt
git add greeting.txt && git commit -q -m "Add greeting"
echo "hello, world" > greeting.txt
git add greeting.txt
echo "hello, world!" > greeting.txt
git status --short
```

```text
MM greeting.txt
```

The two letters are two comparisons. The first column is index against HEAD (staged), the second is working tree against index (not staged). Here both differ, so there are three versions of `greeting.txt`. The two diffs show each step:

```sh
git diff --staged
git diff
```

```text
diff --git a/greeting.txt b/greeting.txt
index ce01362..4b5fa63 100644
--- a/greeting.txt
+++ b/greeting.txt
@@ -1 +1 @@
-hello
+hello, world
diff --git a/greeting.txt b/greeting.txt
index 4b5fa63..270c611 100644
--- a/greeting.txt
+++ b/greeting.txt
@@ -1 +1 @@
-hello, world
+hello, world!
```

The `index` lines in each diff header show the blob hashes: `ce01362` is in HEAD, `4b5fa63` is in the index, `270c611` is the working-tree version, which has no object yet. That middle blob was written by `git add` before any commit:

```sh
git ls-files --stage
git cat-file -t 4b5fa63
```

```text
100644 4b5fa63702dd96796042e92787f464e28f09f17d 0	greeting.txt
blob
```

`git ls-files --stage` lists the index: mode, blob, stage number (0 normally; 1 to 3 during a merge conflict) and path. A commit now would record `hello, world` without the `!`.

## Why have a middle step

The index lets you build a commit deliberately rather than committing whatever happens to be on disk:

- **Split work into clean commits.** `git add -p` shows each change hunk by hunk and stages only the ones you choose, so a bug fix and an unrelated rename go into separate commits.
- **Review before committing.** `git diff --staged` is exactly the change the commit will contain.
- **Merges use it.** During a conflicted merge the index holds several versions of a file at once; resolving means writing one version back at stage 0 (see the conflicts topic).
- **It makes status fast.** The index caches file sizes and timestamps, so Git can tell which files might have changed without hashing every one of them.

`git commit -a` stages changes to files Git already tracks and commits in one step; new files still need `git add`. To take something out of the index without touching your edits, use `git restore --staged <path>` (covered with the other undo commands).
