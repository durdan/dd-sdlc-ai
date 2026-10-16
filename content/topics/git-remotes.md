---
id: git-remotes
title: "Remotes, fetch and pull: tracking branches"
summary: Your copy of someone else's refs, and how they get updated
why: "Knowing that origin/main is a local, possibly stale snapshot explains most 'but it works on my machine' and 'why is my branch behind' moments."
requires: [git-refs, git-merge-rebase]
lesson: none
points:
  - title: A remote is a URL with a name
    text: "origin is just the default name clone gives the repository you cloned from."
  - title: origin/main is a local ref
    text: "Remote-tracking refs record where the remote's branches were the last time you fetched. They only change when you fetch."
  - title: fetch downloads, pull also integrates
    text: "git fetch updates origin/* and touches nothing else. git pull is fetch followed by a merge, rebase or fast-forward."
  - title: Upstream links a branch to its remote
    text: "Your main tracks origin/main, so status can say ahead or behind and plain pull and push know where to go."
quiz:
  - q: "git status says 'Your branch is up to date with origin/main', but a teammate pushed an hour ago. Why?"
    options: ["Their push failed", "status compares with your local origin/main, which only changes when you fetch", "status ignores remote changes"]
    answer: 1
    explain: "Git does not talk to the server for status. Run git fetch first and the comparison is against the remote's current state."
  - q: "What does git fetch change in your repository?"
    options: ["Your current branch and working tree", "Only remote-tracking refs (and the objects they need); your branches and files are untouched", "Nothing until you run git merge"]
    answer: 1
    explain: "fetch is always safe: it downloads objects and moves refs/remotes/origin/*. Integrating them into your branch is a separate step."
  - q: "Your local main and origin/main have both gained commits, and pull.rebase is not set. What does a recent Git do on git pull?"
    options: ["Creates a merge commit silently", "Stops and asks you to choose merge, rebase or fast-forward only", "Discards your local commits"]
    answer: 1
    explain: "Current Git refuses to guess when histories have diverged and prints a hint about pull.rebase and pull.ff. Fast-forwards still happen without asking."
links:
  - { title: "Remote Branches (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches" }
  - { title: "git-fetch (reference)", url: "https://git-scm.com/docs/git-fetch" }
  - { title: "git-pull (reference)", url: "https://git-scm.com/docs/git-pull" }
---
A remote is a named URL for another copy of the repository; `git clone` names the one you cloned from `origin`. When you fetch, Git downloads the objects you don't have and records where each of the remote's branches points as a remote-tracking ref, such as `origin/main` under `refs/remotes/`. Those refs are local snapshots that change only when you fetch. Your own `main` is a separate branch that tracks `origin/main`, its upstream.

## Two clones and a server

A bare repository (no working tree) plays the server. Alice pushes twice; Bob has only the first commit.

```sh
cd /tmp && mkdir demo && cd demo
git init -q --bare -b main origin.git
git clone -q origin.git alice 2>/dev/null
git -C alice commit -q --allow-empty -m "First"
git -C alice push -q -u origin main
git clone -q origin.git bob
git -C alice commit -q --allow-empty -m "Second"
git -C alice push -q
cd bob
git status -sb
```

```text
## main...origin/main
```

Bob's status says he is level with `origin/main`. That is true of his local snapshot, which is an hour old in real life. Fetch updates it:

```sh
git fetch
git status -sb
git branch -vv
git log --oneline main..origin/main
```

```text
From /tmp/demo/origin
   dd0b14a..fb15038  main       -> origin/main
## main...origin/main [behind 1]
* main dd0b14a [origin/main: behind 1] First
fb15038 Second
```

The fetch line shows `origin/main` moving. Bob's `main` and his files did not change. `main..origin/main` lists commits on the remote that he doesn't have yet. He can integrate them whenever he wants:

```sh
git merge --ff-only origin/main
```

```text
Updating dd0b14a..fb15038
Fast-forward
```

## The configuration behind it

```sh
git config --get-regexp '^(remote\.origin|branch\.main)\.'
```

```text
remote.origin.url /tmp/demo/origin.git
remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
branch.main.remote origin
branch.main.merge refs/heads/main
```

The fetch refspec says "copy every branch under `refs/heads/` on the remote to `refs/remotes/origin/` here". The `branch.main.*` lines are the upstream: they are what make `git status` report ahead and behind, and what plain `git pull` and `git push` use. `git push -u origin feature` or `git branch --set-upstream-to=origin/feature` sets them for a new branch.

## Pull is fetch plus integrate

`git pull` runs `git fetch`, then integrates the upstream into your current branch. If you have no local commits, that is a fast-forward. If both sides have new commits, current Git refuses to guess and asks you to choose with `--rebase`, `--no-rebase` (merge) or `--ff-only`, or with the `pull.rebase` and `pull.ff` settings. Many developers set `git config --global pull.rebase true` so their unpublished commits are replayed on top instead of producing a merge commit every time they pull.

Some useful extras: `git fetch --prune` (or `fetch.prune=true`) deletes remote-tracking refs for branches deleted on the server, `git remote -v` lists remotes, and you can add more, such as `upstream` for the original project when you work on a fork.
