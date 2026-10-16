---
id: git-undo
title: "Undo: restore, reset and revert"
summary: Which of the three places each command changes
why: "Picking the wrong undo command is how people lose work. Each one changes a different combination of working tree, index and branch."
requires: [git-index, git-refs]
lesson: none
points:
  - title: restore changes files
    text: "git restore discards working-tree edits; with --staged it unstages. The branch does not move."
  - title: reset moves the branch
    text: "--soft moves only the branch, --mixed (default) also resets the index, --hard also overwrites the working tree."
  - title: revert adds a commit
    text: "It makes a new commit that does the opposite of an old one. History is kept, so it is safe on shared branches."
  - title: Hard means unrecoverable edits
    text: "Uncommitted changes thrown away by reset --hard or restore were never in a commit. The reflog cannot bring them back."
quiz:
  - q: "A bad commit is already on the shared main branch. How do you undo it?"
    options: ["git reset --hard HEAD~1 and force-push", "git revert <commit>, then push the new commit", "git restore ."]
    answer: 1
    explain: "revert adds a commit that undoes the change without rewriting history, so nobody who already pulled main is affected."
  - q: "You want to redo the last commit's message and contents, keeping all its changes staged. Which command?"
    options: ["git reset --soft HEAD~1", "git reset --hard HEAD~1", "git revert HEAD"]
    answer: 0
    explain: "--soft moves the branch back one commit and leaves both the index and working tree alone, so the changes are staged, ready to commit again. git commit --amend does the same job in one step."
  - q: "Which command can destroy work that was never committed?"
    options: ["git reset --soft", "git reset --hard", "git revert"]
    answer: 1
    explain: "--hard overwrites the index and working tree with the target commit. Edits that were never committed are not stored anywhere else, so they are gone."
links:
  - { title: "Reset Demystified (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified" }
  - { title: "git-restore (reference)", url: "https://git-scm.com/docs/git-restore" }
  - { title: "git-reset (reference)", url: "https://git-scm.com/docs/git-reset" }
  - { title: "git-revert (reference)", url: "https://git-scm.com/docs/git-revert" }
---
Git has three undo commands, and each changes a different set of the three places from the index topic. `git restore` copies file contents into the working tree or the index and never moves a branch. `git reset` moves the current branch to another commit and, depending on the mode, also resets the index and the working tree. `git revert` changes nothing that exists: it adds a new commit that reverses an old one.

## restore: throw away or unstage edits

```sh
git init -q -b main demo && cd demo
for n in 1 2 3; do echo "v$n" > notes.txt; git add notes.txt; git commit -q -m "Notes v$n"; done
echo "oops" > notes.txt
git restore notes.txt
cat notes.txt
echo "draft" > notes.txt && git add notes.txt
git restore --staged notes.txt
git status --short
```

```text
v3
 M notes.txt
```

`git restore <path>` copies the index version over the working tree, so `oops` is gone for good. `--staged` copies HEAD's version into the index; the `draft` edit stays on disk, now unstaged. `--source=<commit>` restores from any commit instead.

## reset: move the branch

```sh
git restore notes.txt
git log --oneline
git reset --soft HEAD~1
git status --short
git log --oneline
```

```text
a8c64d8 Notes v3
d4cbec6 Notes v2
46f1e57 Notes v1
M  notes.txt
d4cbec6 Notes v2
46f1e57 Notes v1
```

`--soft` moved `main` back to v2. The v3 content is still in the index and on disk, staged (`M` in the first column), ready to be committed again, perhaps with a better message. Recommit, then try the other two modes:

```sh
git commit -q -m "Notes v3 again"
git reset -q HEAD~1
git status --short
git commit -q -am "Notes v3 once more"
git reset --hard HEAD~1
cat notes.txt
```

```text
 M notes.txt
HEAD is now at d4cbec6 Notes v2
v2
```

| Mode | Branch | Index | Working tree |
| --- | --- | --- | --- |
| `--soft` | moved | kept | kept |
| `--mixed` (default) | moved | reset to target | kept |
| `--hard` | moved | reset to target | reset to target |

After `--mixed` the change is still on disk but unstaged (` M`). After `--hard` both are back at v2. The commits that were dropped are not deleted; the reflog topic shows how to get them back. Uncommitted edits overwritten by `--hard` cannot be recovered.

## revert: undo in public

```sh
git revert --no-edit HEAD > /dev/null
git log --oneline
cat notes.txt
```

```text
55df303 Revert "Notes v2"
d4cbec6 Notes v2
46f1e57 Notes v1
v1
```

The new commit reverses v2's change and history shows both. Use revert on any branch others have pulled. Reverting a merge needs `-m 1` to say which parent's side to keep.

## Which one?

- Edited a file and want the committed version back: `git restore <path>`.
- Staged something by mistake: `git restore --staged <path>`.
- Last commit not pushed and you want to redo it: `git commit --amend`, or `git reset --soft HEAD~1`.
- Local commits you want to throw away entirely: `git reset --hard <commit>` (stash first if anything is uncommitted).
- A pushed commit is wrong: `git revert <commit>`.
