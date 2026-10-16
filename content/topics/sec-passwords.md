---
id: sec-passwords
title: "Passwords done right: hash, never encrypt"
summary: Slow, salted, memory-hard hashes, and sensible rules for users
why: "Password databases leak. Whether that leak exposes your users' passwords, which they reuse elsewhere, depends almost entirely on how you stored them."
requires: [sec-authn-authz]
lesson: none
points:
  - title: Hash, don't encrypt
    text: "Encryption can be reversed by whoever holds the key. A password hash can only be checked, by hashing the guess and comparing."
  - title: Salted and slow
    text: "A unique random salt per password stops precomputed tables and identical hashes. A deliberately slow algorithm makes each guess expensive."
  - title: Argon2id first
    text: "OWASP recommends Argon2id (at least 19 MiB of memory, 2 iterations, parallelism 1), then scrypt; bcrypt for legacy systems; PBKDF2 where FIPS-140 is required."
  - title: Humane rules
    text: "NIST SP 800-63B: at least 15 characters for passwords used alone (8 with MFA), no composition rules, no forced periodic changes, and check against known-breached lists."
quiz:
  - q: Why is encrypting passwords with AES worse than hashing them with Argon2id?
    options: ["AES is slower", "Anyone who gets the key, often from the same server, can decrypt every password at once", "AES output is longer"]
    answer: 1
    explain: "The application needs the key to check logins, so it lives near the data. A breach that takes both reveals every password. A hash has no key to steal."
  - q: Two users have the password "correct horse". With per-user salts, what do their stored hashes look like?
    options: ["Identical", "Different, because each hash includes a different random salt", "Empty"]
    answer: 1
    explain: "Salts make every hash unique, so an attacker can't spot shared passwords or use one precomputed table for all users."
  - q: "According to NIST SP 800-63B (revision 4), what should a verifier do about periodic password changes?"
    options: ["Require a change every 90 days", "Not require periodic changes, but force a change if there is evidence of compromise", "Require a change after each login"]
    answer: 1
    explain: "Forced rotation leads to predictable patterns (Summer2025!, Autumn2025!). Change passwords when there is a reason, such as a breach."
links:
  - { title: "Password Storage Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" }
  - { title: "NIST SP 800-63B: Authentication and Authenticator Management", url: "https://pages.nist.gov/800-63-4/sp800-63b.html" }
  - { title: "RFC 9106: Argon2", url: "https://datatracker.ietf.org/doc/html/rfc9106" }
---
Store passwords so that even a full copy of your database doesn't reveal them. That means a **password hash**: a one-way function that is salted per user and deliberately slow, so checking one login costs milliseconds but testing billions of guesses costs years. Never store passwords in plain text, never encrypt them, and never use a fast hash like SHA-256 on its own.

## Why "hash" and why "slow"

To check a login you don't need the password back; you hash the attempt and compare. So there is no reason to keep anything reversible. Encryption would mean a key the server must hold, and a breach that takes the key takes every password.

General-purpose hashes such as SHA-256 are built to be fast: a GPU computes billions per second, so a stolen table of SHA-256 password hashes falls quickly. Password hashing algorithms are tuned to be expensive, and the memory-hard ones (Argon2id, scrypt) also need lots of memory per guess, which is what makes GPUs and custom hardware struggle.

## Salt

A **salt** is a random value generated for each password and stored next to the hash. It means the same password gives different hashes for different users, and an attacker can't use a precomputed table (a "rainbow table") or crack everyone at once. This toy shows the idea, with a deliberately weak hash:

```js run
// TOY ONLY: FNV-1a is a fast, 32-bit, non-cryptographic hash. Never use it for passwords.
// Real systems use Argon2id, scrypt or bcrypt from a vetted library.
function toyHash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, "0")
}
// Fixed "random" salts so the output is the same every run; real salts come from a CSPRNG.
const users = [
  { name: "ana", password: "correct horse", salt: "9f2c41d0" },
  { name: "ben", password: "correct horse", salt: "03ab77e5" },
]
for (const u of users) {
  console.log(u.name, "unsalted:", toyHash(u.password), " salted:", u.salt + "$" + toyHash(u.salt + u.password))
}
// Checking a login: recompute with the stored salt and compare.
const stored = users[0].salt + "$" + toyHash(users[0].salt + users[0].password)
const [salt, hash] = stored.split("$")
console.log("login 'correct horse':", toyHash(salt + "correct horse") === hash)
console.log("login 'wrong':", toyHash(salt + "wrong") === hash)
```

With no salt, both users' hashes are identical, so cracking one cracks both. With salts they differ.

## Which algorithm and settings

OWASP's Password Storage Cheat Sheet currently recommends:

- **Argon2id** with at least 19 MiB of memory, 2 iterations and parallelism 1 (or an equivalent trade-off from its table).
- If Argon2id isn't available, **scrypt** (N = 2^17, r = 8, p = 1).
- For legacy systems, **bcrypt** with a work factor of 10 or more. bcrypt only uses the first 72 bytes of input, so limit length or pre-hash carefully.
- Where FIPS-140 compliance is required, **PBKDF2-HMAC-SHA-256** with 600,000 iterations or more.

Use your platform's well-maintained library; it stores the algorithm, parameters and salt in the hash string, so you can raise the cost later and rehash on the user's next login.

## Rules for users

NIST SP 800-63B revision 4 reflects what breach data shows: require at least **15 characters** when the password is the only factor (8 if it's part of MFA), allow at least 64, accept spaces and Unicode, **don't** impose composition rules (one digit, one symbol), **don't** force periodic changes, and **do** reject passwords found on blocklists of common or breached passwords. Rate-limit login attempts, and allow paste so password managers work.
