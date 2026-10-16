---
id: git-objects
title: "Blobs, trees and commits: Git's object model"
summary: Content-addressed files, folders and snapshots
why: "Every other Git command reads or writes these three kinds of object. Once you can picture them, branches, merges and undo stop being magic."
lesson: none
points:
  - title: Named by their content
    text: "Every object is stored under the hash of its type, size and bytes. Same content, same name, stored once."
  - title: Three kinds do the work
    text: "A blob is a file's bytes, a tree is a directory listing, a commit is a tree plus parents, author and message."
  - title: A commit is a snapshot
    text: "A commit points at a whole tree, not at a diff. Diffs are computed when you ask for them."
  - title: Objects never change
    text: "Changing anything, even one byte of a message, makes a new object with a new hash."
quiz:
  - q: "Two files in different folders have exactly the same contents. How many blob objects does Git store for them?"
    options: [Two, "One, because the blob's name is the hash of its contents", "None until you push"]
    answer: 1
    explain: "Blobs are named by a hash of their bytes, so identical contents produce the same name and are stored once. The file names live in the trees that point at the blob."
  - q: "Where does Git keep a file's name?"
    options: [In the blob, In the tree that lists it, In the commit message]
    answer: 1
    explain: "A blob is only bytes. A tree entry pairs a name and a mode with the hash of a blob or a subtree, which is why renaming a file creates a new tree but reuses the blob."
  - q: "You change only the message of the latest commit with git commit --amend. What happens to its hash?"
    options: [It stays the same, "It changes, because the message is part of the commit object's content", It changes only after a push]
    answer: 1
    explain: "The commit object's bytes include the message, author, committer, dates, tree and parents. Change any of them and the hash changes; the old commit still exists until it is garbage collected."
links:
  - { title: "Git Internals: Git Objects (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects" }
  - { title: "git-cat-file (reference)", url: "https://git-scm.com/docs/git-cat-file" }
---
Under every Git repository is a small database of objects, stored in `.git/objects` and each named by a hash of its contents. There are only three kinds you meet every day: a blob holds a file's bytes, a tree lists the names in one directory and points at blobs and other trees, and a commit points at one tree (the whole project at that moment) plus its parent commits, author and message. Branches, merges and history are all built from these.

## Look inside a commit

Make a repository with one file and ask Git what it stored. The commands below were run with Git 2.50; your commit hash will differ because it includes your name and the time, but the blob hash will match exactly.

```sh
git init -q -b main demo && cd demo
echo "hello" > greeting.txt
git hash-object greeting.txt
git add greeting.txt
git commit -q -m "Add greeting"
git cat-file -p HEAD
```

```text
ce013625030ba8dba906f756967f9e9ca394464a
tree 57e9529754dc514a3ec10db2ff882018fbe1fcbf
author Ada <ada@example.com> 1767607200 +0000
committer Ada <ada@example.com> 1767607200 +0000

Add greeting
```

`git cat-file -p` prints any object. The commit is just text: a tree hash, author and committer lines with Unix timestamps, a blank line and the message. This first commit has no `parent` line. Follow the tree:

```sh
git cat-file -p 'HEAD^{tree}'
git cat-file -p ce01362
```

```text
100644 blob ce013625030ba8dba906f756967f9e9ca394464a	greeting.txt
hello
```

The tree holds the name and the file mode (`100644` is a normal file, `100755` executable, `040000` a subdirectory). The blob holds only the bytes.

## What the hash is a hash of

A blob's name is the SHA-1 of a short header (`blob`, a space, the size in bytes, a NUL byte) followed by the content. You can reproduce it without Git (`shasum` on macOS, `sha1sum` on Linux):

```sh
printf 'blob 6\0hello\n' | shasum
```

```text
ce013625030ba8dba906f756967f9e9ca394464a  -
```

This is content addressing: the name is derived from the data, so the same content always gets the same name and any corruption is detectable. Copy the file into a new folder and commit; Git writes a new tree for the folder and a new root tree and commit, but reuses the blob.

```sh
mkdir docs && cp greeting.txt docs/copy.txt
git add docs && git commit -q -m "Copy greeting into docs"
git cat-file -p 'HEAD:docs'
git count-objects
```

```text
100644 blob ce013625030ba8dba906f756967f9e9ca394464a	copy.txt
6 objects, 24 kilobytes
```

Six objects: one blob, three trees (two root trees and `docs`) and two commits. The second commit's text has a `parent` line naming the first, and that chain of parents is the history.

## Why this matters

- **Snapshots, not diffs.** Each commit names a complete tree. Unchanged files and folders are shared by hash, so snapshots are cheap. `git diff` and `git log -p` compute changes on demand.
- **Immutable.** An object never changes. Amending, rebasing and cherry-picking all make new commits; the old ones stay in the database until garbage collection removes unreachable ones.
- **Integrity.** A commit hash covers its tree, which covers every blob, and its parent, which covers all earlier history. If any byte changes, every hash above it changes.
- **Packs.** Loose objects are zlib-compressed files under `.git/objects/xx/`. `git gc` and pushes and fetches bundle them into packfiles that store similar objects as deltas. That is a storage detail; the model is still snapshots.

New repositories still use SHA-1 by default (with collision detection built in). `git init --object-format=sha256` creates a SHA-256 repository, but hosting support for it is still limited, so most teams stay on the default for now.
