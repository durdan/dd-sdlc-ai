---
id: git-conflicts
title: "Resolving merge conflicts"
summary: When both sides changed the same lines, you decide
why: "Conflicts are routine, not emergencies. Knowing what Git has already done and what it is waiting for turns them into a two-minute job."
requires: [git-merge-rebase, git-index]
lesson: none
points:
  - title: Only overlapping changes conflict
    text: "Git merges line changes from both sides automatically unless both changed the same region relative to the common ancestor."
  - title: Three versions are in the index
    text: "Stage 1 is the common ancestor, 2 is yours (HEAD), 3 is theirs. The file on disk has markers around the disagreement."
  - title: Resolve, add, continue
    text: "Edit the file to the right result, git add it to mark it resolved, then commit (or rebase --continue)."
  - title: You can always back out
    text: "git merge --abort or git rebase --abort puts everything back as it was before you started."
quiz:
  - q: "How do you tell Git that a conflicted file is resolved?"
    options: ["Delete the .orig file", "git add the file after editing it", "git commit --force"]
    answer: 1
    explain: "Adding the file replaces the three conflict stages in the index with one normal entry. When no entries are left in conflict, you can commit."
  - q: "What does the zdiff3 conflict style add to the markers?"
    options: ["Line numbers", "The common ancestor's version between ||||||| and =======", "The author of each side"]
    answer: 1
    explain: "Seeing the original text tells you what each side changed. Without it you only see two results and have to guess which one moved away from the original."
  - q: "During a rebase, which side is \"ours\"?"
    options: ["Your feature branch commits", "The branch you are rebasing onto, because rebase replays your commits on top of it", "Whichever was committed last"]
    answer: 1
    explain: "A rebase checks out the new base and applies your commits to it, so HEAD (ours) is the base and the commit being replayed is theirs. It is the reverse of what most people expect."
links:
  - { title: "Basic Branching and Merging: merge conflicts (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging" }
  - { title: "git-merge: how conflicts are presented (reference)", url: "https://git-scm.com/docs/git-merge" }
  - { title: "git-rerere (reference)", url: "https://git-scm.com/docs/git-rerere" }
---
A merge compares both sides with their common ancestor (the merge base). A change made on only one side is taken automatically. When both sides changed the same lines differently, Git cannot know which result you want, so it stops: it writes both versions into the file between conflict markers, keeps all three versions in the index, and waits for you to decide.

## Make a conflict

```sh
git init -q -b main demo && cd demo
printf 'port = 8080\n' > app.conf && git add app.conf && git commit -q -m "Add config"
git switch -q -c feature
printf 'port = 9090\n' > app.conf && git commit -q -am "Use 9090"
git switch -q main
printf 'port = 8000\n' > app.conf && git commit -q -am "Use 8000"
git merge feature
```

```text
Auto-merging app.conf
CONFLICT (content): Merge conflict in app.conf
Automatic merge failed; fix conflicts and then commit the result.
```

The merge is paused, not failed. Look at what Git left you:

```sh
cat app.conf
git status --short
git ls-files --stage
```

```text
<<<<<<< HEAD
port = 8000
=======
port = 9090
>>>>>>> feature
UU app.conf
100644 2bc054ac1ac9ba969571a07977ba7b834faa7f81 1	app.conf
100644 fc6e07056afbbfe74c1514428e320de0312467f1 2	app.conf
100644 3792a7b6aed34427e6bf21b15a1d8005b9f16375 3	app.conf
```

`UU` means unmerged on both sides. The index holds the base (stage 1), ours (stage 2, HEAD) and theirs (stage 3, `feature`). `git show :1:app.conf` prints any of them, and `git checkout --ours app.conf` or `--theirs` takes one side whole.

## See the original too

The default markers don't show what the line was before either change. The `zdiff3` style adds the base, which usually makes the right answer obvious:

```sh
git merge --abort
git -c merge.conflictStyle=zdiff3 merge feature > /dev/null
cat app.conf
```

```text
<<<<<<< HEAD
port = 8000
||||||| 3221dfc
port = 8080
=======
port = 9090
>>>>>>> feature
```

Both sides changed `8080`, so this is a real disagreement that needs a person. Set it for good with `git config --global merge.conflictStyle zdiff3`.

## Resolve and finish

Write the result you want, remove every marker, stage it and commit:

```sh
printf 'port = 9090\n' > app.conf
git add app.conf
git commit -q --no-edit
git log --oneline --graph
```

```text
*   5f7f472 Merge branch 'feature'
|\  
| * 32c5fbc Use 9090
* | 4a59ec3 Use 8000
|/  
* 3221dfc Add config
```

## Habits that help

- **Read both commits first.** `git log --merge -p app.conf` shows the commits on each side that touched the file, so you resolve by intent, not by guessing.
- **Use a merge tool if you like one.** `git mergetool` opens a configured tool (VS Code, IntelliJ, vimdiff) with all three versions.
- **Build and test before committing.** Git only checks markers are gone. Code can merge without conflicts and still be broken, for example when one side renames a function the other side calls.
- **In a rebase, "ours" is the base.** Rebase replays your commits on top of the other branch, so `--ours` is the branch you are rebasing onto. Resolve, `git add`, then `git rebase --continue`; the same conflict may come back for each replayed commit.
- **Let Git remember.** `git config --global rerere.enabled true` records how you resolved a conflict and reapplies it when the same conflict appears again, handy for long rebases.
- **Keep branches short.** The longer two branches stay apart, the more their changes overlap.
