---
id: git-force-push
title: "Rewriting history and force-pushing safely"
summary: Replace pushed commits without deleting a teammate's work
why: "A careless git push --force can silently erase commits someone else pushed a minute ago. Two flags and one habit make it safe."
requires: [git-remotes, git-reflog]
lesson: none
points:
  - title: Rewriting makes new commits
    text: "amend, rebase, squash and filter tools replace commits with new ones, so the remote branch is no longer an ancestor of yours."
  - title: --force overwrites blindly
    text: "It sets the remote branch to your commit, whatever is there now, including commits you've never seen."
  - title: --force-with-lease checks first
    text: "It only overwrites if the remote branch is still where your origin/<branch> says it is."
  - title: --force-if-includes closes the gap
    text: "It also refuses if you fetched new commits but never looked at them, which a background fetch can cause."
quiz:
  - q: "Why does a normal git push fail after you amend a commit you already pushed?"
    options: ["Amended commits cannot be pushed", "The remote's commit is no longer an ancestor of yours, so the push isn't a fast-forward", "The server is down"]
    answer: 1
    explain: "A normal push only moves a remote branch forward. Your amended commit replaced the old one instead of building on it, so Git asks you to force."
  - q: "What does --force-with-lease compare before overwriting?"
    options: ["Your local branch with the remote branch", "The remote branch with your remote-tracking ref (origin/<branch>), which records what you last saw", "Commit timestamps"]
    answer: 1
    explain: "If someone pushed since your last fetch, the remote branch no longer matches origin/<branch>, and the push is rejected as stale info."
  - q: "Your editor fetches in the background, so origin/topic already includes a teammate's commit you never looked at. What protects you?"
    options: ["--force-with-lease alone", "Adding --force-if-includes, which checks that origin/topic's tip was part of your local branch at some point", "Nothing can"]
    answer: 1
    explain: "After a fetch the lease matches again, so --force-with-lease alone would overwrite the commit. --force-if-includes also checks your branch's reflog and rejects the push."
links:
  - { title: "git-push: --force-with-lease and --force-if-includes (reference)", url: "https://git-scm.com/docs/git-push" }
  - { title: "Rewriting History (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History" }
---
Rewriting history means replacing commits: `git commit --amend`, `git rebase`, an interactive rebase that squashes fixups, or tools like `git filter-repo` that strip a leaked secret. Locally that is harmless. Once the old commits are on a server, a normal push is rejected because it is not a fast-forward, and you have to force it. `--force` replaces the remote branch whatever it holds; `--force-with-lease` replaces it only if it still holds what you last saw.

## Set up a shared branch

Alice pushes `topic`. Bob adds a fix on top and pushes. Alice, who has not fetched since, amends her commit.

```sh
cd /tmp && mkdir demo && cd demo
git init -q --bare -b main origin.git
git clone -q origin.git alice 2>/dev/null && cd alice
git commit -q --allow-empty -m "First" && git push -q -u origin main
git switch -q -c topic
git commit -q --allow-empty -m "Topic work" && git push -q -u origin topic
cd .. && git clone -q -b topic origin.git bob && cd bob
git commit -q --allow-empty -m "Bob's fix" && git push -q
cd ../alice
git commit -q --amend --allow-empty -m "Topic work, reworded"
git push
```

```text
To /tmp/demo/origin.git
 ! [rejected]        topic -> topic (fetch first)
error: failed to push some refs to '/tmp/demo/origin.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

`git push --force` here would succeed, and Bob's fix would vanish from the server without a word. Use the lease instead:

```sh
git push --force-with-lease
```

```text
To /tmp/demo/origin.git
 ! [rejected]        topic -> topic (stale info)
error: failed to push some refs to '/tmp/demo/origin.git'
```

Alice's `origin/topic` still points at the commit she pushed. The server's `topic` has moved on, so the lease fails and nothing is lost.

## The gap the lease leaves

The lease is only as good as your `origin/topic`. If anything fetches (you, a script, or an editor that fetches in the background), `origin/topic` catches up with the server and the lease passes, even though you have never looked at Bob's commit. `--force-if-includes` (Git 2.30 and later) adds a second check: the remote-tracking tip must appear somewhere in your local branch's reflog, meaning you actually integrated it.

```sh
git fetch -q
git push --force-with-lease --force-if-includes
```

```text
To /tmp/demo/origin.git
 ! [rejected]        topic -> topic (remote ref updated since checkout)
error: failed to push some refs to '/tmp/demo/origin.git'
hint: Updates were rejected because the tip of the remote-tracking branch has
hint: been updated since the last checkout. If you want to integrate the
hint: remote changes, use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Now Alice knows to look at `git log topic..origin/topic`, bring Bob's commit into her rewritten branch (for example with `git rebase origin/topic` or a cherry-pick), and push again.

## Habits

- **Never force without a lease.** An alias makes it the easy path: `git config --global alias.pushf "push --force-with-lease --force-if-includes"`.
- **Rewrite only your own branches.** Rebasing a feature branch only you push to is routine. Rewriting `main` or a release branch breaks every clone that has it.
- **Protect shared branches on the server.** GitHub, GitLab and Bitbucket can block force-pushes and deletion on `main` regardless of what anyone types.
- **Rewriting does not unleak a secret.** Removing a committed password with `git filter-repo` and force-pushing does not remove it from clones, forks, caches or CI logs. Rotate the secret first.
- **The old commits are recoverable for a while.** The reflog on the machine that pushed them still names them, as long as nothing has expired.
