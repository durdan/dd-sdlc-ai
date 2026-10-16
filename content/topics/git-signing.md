---
id: git-signing
title: "Signing commits and tags"
summary: Prove a commit came from a key you control
why: "Anyone can set user.name and user.email to anything. A signature is the only part of a commit that shows who actually made it."
requires: [git-tags]
lesson: none
points:
  - title: Author fields are just text
    text: "Git records whatever name and email are configured. Nothing checks them."
  - title: A signature covers the whole object
    text: "It signs the commit's content, which includes its tree and parents, so the signed history can't be changed without breaking it."
  - title: SSH keys work since Git 2.34
    text: "Besides GPG (OpenPGP) and X.509, you can sign with the same kind of SSH key you already use to push."
  - title: Verifying needs trust
    text: "Locally that is an allowed signers file or a GPG keyring; hosts show Verified when the key is registered to the account."
quiz:
  - q: "Why is a commit's author line not proof of who wrote it?"
    options: ["It is encrypted", "It is copied from local configuration that anyone can set to any value", "It is added by the server"]
    answer: 1
    explain: "git config user.email ceo@example.com works for anyone. Only a signature made with a private key, checked against a known public key, ties a commit to a person."
  - q: "Where is a commit signature stored?"
    options: ["In a separate file in .git", "In a gpgsig header inside the commit object itself", "On the hosting service only"]
    answer: 1
    explain: "The signature becomes part of the commit's content (and so its hash). That is also why rebasing or amending a signed commit drops the signature unless you sign again."
  - q: "Which Git setting tells Git to sign with an SSH key instead of GPG?"
    options: ["gpg.format ssh", "commit.ssh true", "user.ssh yes"]
    answer: 0
    explain: "gpg.format chooses openpgp (the default), x509 or ssh. user.signingkey then names the key, and commit.gpgsign true signs every commit."
links:
  - { title: "Signing Your Work (Pro Git)", url: "https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work" }
  - { title: "git-verify-commit (reference)", url: "https://git-scm.com/docs/git-verify-commit" }
  - { title: "About commit signature verification (GitHub Docs)", url: "https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification" }
---
A commit's author and committer lines are whatever the person committing had configured, so they prove nothing. Signing adds a cryptographic signature, made with a private key, to the commit or tag object itself. Anyone holding the matching public key can check that the object was signed by that key and has not changed since. Git can sign with GPG (OpenPGP), X.509 certificates or, since Git 2.34, SSH keys, which are the easiest to set up.

## Sign with an SSH key

In real use you would point at your existing key, such as `~/.ssh/id_ed25519.pub`, and set these with `--global`. Here a throwaway key keeps the example self-contained.

```sh
git init -q -b main demo && cd demo
ssh-keygen -q -t ed25519 -N "" -C "ada@example.com" -f ../demo_key
git config gpg.format ssh
git config user.signingkey ../demo_key.pub
git config commit.gpgsign true
echo hi > a.txt && git add a.txt && git commit -q -m "Signed change"
git cat-file -p HEAD | head -5
```

```text
tree 0d8a474fc67971fb3dd7616e26323d3066442555
author Ada <ada@example.com> 1767607200 +0000
committer Ada <ada@example.com> 1767607200 +0000
gpgsig -----BEGIN SSH SIGNATURE-----
 U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAg...
```

(The signature lines are shortened here; yours will differ because your key differs.) The signature sits in a `gpgsig` header inside the commit object, so it is part of the commit's hash. Rebasing or amending creates a new commit without it, so with `commit.gpgsign` on, Git signs the replacement automatically.

## Verify

Git needs to know which keys to trust for which identities. For SSH that is an allowed signers file, one line per person:

```sh
echo "ada@example.com $(cat ../demo_key.pub)" > ../allowed_signers
git config gpg.ssh.allowedSignersFile ../allowed_signers
git verify-commit HEAD
```

```text
Good "git" signature for ada@example.com with ED25519 key SHA256:...
```

`git log --show-signature` prints the same check for each commit, and `git verify-tag v1.0.0` checks a tag signed with `git tag -s`. Teams can keep a shared allowed signers file in the repository so everyone verifies against the same list.

## On hosting services

GitHub, GitLab and Bitbucket verify signatures against keys uploaded to the user's account. On GitHub you add the SSH key a second time as a signing key (an authentication key is not enough), and signed commits then show a Verified badge. Branch protection rules can require signed commits on `main`.

## What signing does and doesn't do

- **It proves a key signed this exact object.** If the commit changes in any way, verification fails.
- **It doesn't prove the code is good,** or that the person is who the email says unless you trust how the key was registered.
- **Losing a key matters.** Protect the private key with a passphrase or a hardware key (`ssh-keygen -t ed25519-sk` for FIDO keys), and remove it from your account if it leaks.
- **Merges made on the server** are signed by the host's key, not yours.
- **Sign releases at least.** Signing every commit is common in security-sensitive projects; signing release tags is the minimum worth doing, because a tag is what people build and install from.
