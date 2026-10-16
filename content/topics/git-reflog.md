---
id: git-reflog
title: "The reflog: Git's safety net"
summary: A local diary of where every branch and HEAD have pointed
why: "Almost every 'I destroyed my work' moment after a bad reset, rebase or branch delete can be undone in one command, if you know the reflog is there."
requires: [git-undo]
lesson: none
points:
  - title: Every move is written down
    text: "Each time HEAD or a branch changes (commit, reset, rebase, switch, merge), Git appends the old and new hash to a log."
  - title: Commits outlive their branches
    text: "A reset or rebase only moves pointers. The old commits stay in the database and the reflog still names them."
  - title: It is local and it expires
    text: "Reflogs are never pushed or cloned. By default entries for unreachable commits expire after 30 days, others after 90."
  - title: Only commits are covered
    text: "Changes you never committed (or stashed) are not in any object, so the reflog cannot help with them."
quiz:
  - q: "You ran git reset --hard HEAD~3 by mistake. How do you get the three commits back?"
    options: ["They are gone", "Find the previous position in git reflog and reset back to it, for example git reset --hard 'HEAD@{1}'", "git revert HEAD~3"]
    answer: 1
    explain: "The reset moved the branch, but the commits still exist. HEAD@{1} is where HEAD was one move ago, which is the tip before the reset."
  - q: "You deleted a branch with git branch -D. What's the quickest way to find its tip?"
    options: ["Ask a teammate to push it", "Look in git reflog for the last commit you made or checked out on it, then git branch <name> <hash>", "Run git fsck --full"]
    answer: 1
    explain: "Deleting a branch removes its own reflog too, but HEAD's reflog still lists the commits you were on. Git also prints the old hash when it deletes a branch (\"was 1a2b3c4\")."
  - q: "Can a fresh clone see your reflog?"
    options: ["Yes, it is pushed with the branch", "No, the reflog exists only in your local repository", "Only for tags"]
    answer: 1
    explain: "The reflog is a record of your local ref updates. The server has its own (if enabled), and a clone starts with an empty one."
links:
  - { title: "git-reflog (reference)", url: "https://git-scm.com/docs/git-reflog" }
  - { title: "Maintenance and Data Recovery (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery" }
  - { title: "git-gc: gc.reflogExpire (reference)", url: "https://git-scm.com/docs/git-gc" }
---
Every time HEAD or a branch moves, Git appends a line to a log under `.git/logs/`: the old hash, the new hash and what caused the move. That is the reflog. Because resets, rebases and amends only move pointers and never delete commits straight away, the reflog almost always still names the commit you thought you lost, and getting it back is one `reset` or `branch` command.

## Lose three commits, then find them

```sh
git init -q -b main demo && cd demo
for n in 1 2 3; do echo "v$n" > notes.txt; git add notes.txt; git commit -q -m "Notes v$n"; done
git reset --hard HEAD~2
git log --oneline
```

```text
HEAD is now at 46f1e57 Notes v1
46f1e57 Notes v1
```

`git log` follows parents from the branch tip, so v2 and v3 have disappeared from view. The reflog has not forgotten:

```sh
git reflog
```

```text
46f1e57 HEAD@{0}: reset: moving to HEAD~2
a8c64d8 HEAD@{1}: commit: Notes v3
d4cbec6 HEAD@{2}: commit: Notes v2
46f1e57 HEAD@{3}: commit (initial): Notes v1
```

`HEAD@{n}` means "where HEAD was n moves ago". One move ago it was at v3, so reset back to that:

```sh
git reset --hard 'HEAD@{1}'
git log --oneline
```

```text
HEAD is now at a8c64d8 Notes v3
a8c64d8 Notes v3
d4cbec6 Notes v2
46f1e57 Notes v1
```

The quotes keep shells such as PowerShell from treating the braces specially. If you are not sure which entry you want, look first with `git show 'HEAD@{2}'` or `git log -3 'HEAD@{2}'`, or create a branch on it (`git branch rescue 'HEAD@{2}'`) instead of resetting.

## Other ways to read it

- **Per branch.** `git reflog show feature` lists moves of one branch; `feature@{1}` is its previous tip. After a bad rebase, `git reset --hard 'feature@{1}'` puts the branch back as it was before.
- **By time.** `main@{yesterday}` or `main@{2.hours.ago}` resolve through the reflog to where the branch pointed then.
- **Rebase leaves a marker.** Rebase also saves the old tip as `ORIG_HEAD`, so `git reset --hard ORIG_HEAD` right after a rebase undoes it.
- **Deleted branch.** `git branch -D` prints the hash it was at (`Deleted branch tmp (was a8c64d8).`), and HEAD's reflog lists the commits you had checked out.

## Limits

- **Local only.** The reflog is never pushed or cloned. It shows what happened in this repository on this machine.
- **It expires.** `git gc` prunes old entries: by default after 90 days (`gc.reflogExpire`), or 30 days for entries whose commits are no longer reachable from any ref (`gc.reflogExpireUnreachable`). After that, unreachable commits can be removed for good.
- **Commits only.** Edits that were never committed or stashed exist only in the working tree; `reset --hard` overwrites them and nothing records them. Commit or `git stash` before anything risky. As a last resort, `git fsck --lost-found` can find blobs you once staged with `git add`.
