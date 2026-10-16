---
id: git
title: "Git: how it really stores your work"
promise: "See the objects and pointers under every Git command, so merging, rebasing, undoing and force-pushing become deliberate choices instead of guesses, alone or on a team."
kind: skill
level: intermediate
tags: [devops]
stages:
  - title: The data model
    blurb: Objects, refs and the index
    topics: [git-objects, git-refs, git-index]
  - title: Combining work
    blurb: Merge, rebase, conflicts
    topics: [git-merge-rebase, git-conflicts]
  - title: Undoing safely
    blurb: Restore, reset, revert, reflog
    topics: [git-undo, git-reflog]
  - title: Working with others
    blurb: Remotes, force-push, tags, workflows
    topics: [git-remotes, git-force-push, git-tags, git-workflows]
  - title: Scale and trust
    blurb: Big repositories, signatures
    topics: [git-large-repos, git-signing]
bridges:
  - id: feature-flags
    why: "Trunk-based development merges unfinished work into main every day. Feature flags are what keep it switched off until it is ready."
  - id: dropbox
    why: "Dropbox names file blocks by their hash, the same content addressing Git uses for blobs, to store each block once and sync only what changed."
next: [evolve-safely]
---
Every example was run with Git 2.50 in a throwaway repository. Commit hashes include the author and the time, so yours will differ; blob hashes depend only on content and will match.
