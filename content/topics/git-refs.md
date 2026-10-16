---
id: git-refs
title: "Refs, branches and HEAD: a branch is a pointer"
summary: Names that point at commits, and the one that says where you are
why: "Once a branch is just a 41-byte pointer, creating, moving and deleting branches stops feeling risky, and detached HEAD stops being scary."
requires: [git-objects]
lesson: none
points:
  - title: A ref is a name for a hash
    text: "refs/heads/main holds one commit hash. That is the whole branch."
  - title: Committing moves the branch
    text: "A new commit's parent is the commit the branch pointed at; then the branch is moved to the new commit."
  - title: HEAD says which branch you are on
    text: "HEAD normally names a branch (ref: refs/heads/main). Detached HEAD holds a commit hash directly."
  - title: Commits don't belong to branches
    text: "A commit is on a branch only because it can be reached from the branch's tip by following parents."
quiz:
  - q: "You run git branch feature. What does Git write?"
    options: ["A copy of every commit on the current branch", "A small ref file (or packed-refs line) holding the current commit's hash", "A new tree object"]
    answer: 1
    explain: "Creating a branch writes one pointer. No commits, trees or blobs are copied, which is why branches in Git are instant and cheap."
  - q: "What does .git/HEAD contain while you are on the main branch?"
    options: ["The hash of the latest commit", "ref: refs/heads/main", "The name of the remote"]
    answer: 1
    explain: "HEAD is a symbolic ref that names the current branch. Git reads that branch to find the commit, and moves that branch when you commit."
  - q: "You make two commits in detached HEAD state and then switch to main. What happens to them?"
    options: ["They are merged into main", "They still exist but no ref points at them, so they become hard to find and are eventually garbage collected", "Git refuses to switch"]
    answer: 1
    explain: "Nothing deletes them straight away, and Git warns you as you leave. Create a branch on them (git switch -c name <hash>) or find them later in the reflog."
links:
  - { title: "Branches in a Nutshell (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell" }
  - { title: "Git Internals: Git References (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Internals-Git-References" }
  - { title: "git-switch (reference)", url: "https://git-scm.com/docs/git-switch" }
---
Commit hashes are hard to remember, so Git gives them names called refs. A branch is a ref under `refs/heads/` that holds the hash of one commit, its tip. A tag is a ref under `refs/tags/`. HEAD is a special ref that says what you have checked out: normally it names a branch, and that branch names a commit. Committing makes a new commit whose parent is the current tip, then moves the branch to it.

## See the pointers

Make two commits and a second branch:

```sh
git init -q -b main demo && cd demo
echo "hello" > greeting.txt && git add . && git commit -q -m "Add greeting"
echo "bye" > farewell.txt && git add . && git commit -q -m "Add farewell"
git branch feature
cat .git/HEAD
git rev-parse main feature
```

```text
ref: refs/heads/main
128af6f8019138b890d8453f93b6b40bdc3b0e51
128af6f8019138b890d8453f93b6b40bdc3b0e51
```

`git branch feature` wrote one pointer to the commit you are on. Both names now point at the same commit; nothing was copied. In a fresh repository a ref is a small file such as `.git/refs/heads/feature`; after `git gc`, many refs are packed into `.git/packed-refs`, and newer repositories can use the reftable format instead. Use `git rev-parse` or `git show-ref` rather than reading the files.

## Committing moves only the current branch

```sh
git switch -q feature
echo "more" >> greeting.txt && git commit -q -am "Extend greeting"
cat .git/HEAD
git log --oneline --graph --all
```

```text
ref: refs/heads/feature
* ee97a7b Extend greeting
* 128af6f Add farewell
* c15e99d Add greeting
```

HEAD names `feature`, so the commit moved `feature` and left `main` where it was. `git log --oneline --decorate` would show the labels; the graph shows one line because `main` is simply an ancestor of `feature`. Neither branch "owns" a commit: `128af6f` is on both, because both tips can reach it by following parents.

## Detached HEAD

Check out a commit instead of a branch and HEAD holds the hash itself:

```sh
git switch -q --detach main
cat .git/HEAD
git symbolic-ref -q HEAD || echo "detached"
git switch -q main
```

```text
128af6f8019138b890d8453f93b6b40bdc3b0e51
detached
```

Detached HEAD is useful for looking at an old version or running a bisect. Commits made there are real, but no branch moves to follow them. When you switch away, Git warns that you are leaving commits behind; `git switch -c rescue <hash>` keeps them.

## Names you can use

Anywhere Git wants a commit you can write a hash prefix, a branch or tag name, `HEAD`, or an expression: `HEAD~2` (two parents back), `main^2` (the second parent of a merge), `feature@{yesterday}` (where the branch pointed a day ago, from the reflog) or `main..feature` (commits reachable from `feature` but not `main`). Remote-tracking refs such as `origin/main` live under `refs/remotes/` and are covered in the remotes topic.

`git switch` (for branches) and `git restore` (for files) arrived in Git 2.23 to split up the overloaded `git checkout`, which still works.
