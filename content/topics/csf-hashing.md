---
id: csf-hashing
title: Hashing and checksums
summary: Turn any data into a short fingerprint, for speed, for integrity or for security
why: "Hash tables, sharding, caches, deduplication, download checks and password storage all use hash functions, but they need very different kinds."
requires: [csf-integers]
lesson: none
points:
  - title: Fixed-size fingerprints
    text: "A hash function maps input of any length to a fixed-size value. Equal inputs always give equal hashes; different inputs usually give different ones."
  - title: Checksums catch accidents
    text: "CRC-32 and the Internet checksum detect bit flips and truncation cheaply, but anyone can forge a matching value on purpose."
  - title: Cryptographic hashes resist attackers
    text: "SHA-256 is designed so that finding two inputs with the same hash, or an input for a given hash, is infeasible."
  - title: Passwords need slow hashes
    text: "Store passwords with a deliberately slow, salted function such as Argon2, scrypt or bcrypt, never with a bare fast hash."
quiz:
  - q: "A download page lists a SHA-256 hash next to the file. What does matching it prove?"
    options:
      - "That the file is free of malware"
      - "That the bytes you received are the bytes the publisher hashed, provided you got the hash from a trusted source"
      - "That the download was fast"
    answer: 1
    explain: "A cryptographic hash detects any change, accidental or deliberate. If an attacker can change the page that shows the hash, they can change both, which is why signed releases exist."
  - q: Why are CRC-32 checksums not used to protect against tampering?
    options:
      - "They are too slow"
      - "They are linear and easy to forge: an attacker can modify data and adjust a few bytes so the CRC still matches"
      - "They only work on text"
    answer: 1
    explain: "CRCs are designed to catch random errors (burst errors on a wire or disk) cheaply. Integrity against an adversary needs a cryptographic hash or a MAC."
  - q: "Why is SHA-256 alone a poor choice for storing passwords?"
    options:
      - "It produces collisions for short inputs"
      - "It is fast, so an attacker with a GPU can try billions of guesses per second against a stolen hash"
      - "It can't hash Unicode"
    answer: 1
    explain: "Password hashing needs to be slow and salted so each guess is expensive and identical passwords hash differently. Use Argon2id, scrypt or bcrypt with recommended parameters."
links:
  - { title: "FIPS 180-4: Secure Hash Standard (NIST)", url: "https://csrc.nist.gov/pubs/fips/180-4/upd1/final" }
  - { title: "RFC 1071: Computing the Internet Checksum", url: "https://datatracker.ietf.org/doc/html/rfc1071" }
  - { title: "OWASP Password Storage Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" }
  - { title: "SubtleCrypto.digest() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest" }
---
A hash function takes input of any size and returns a fixed-size value, its hash or digest. The same input always gives the same output, and a good hash spreads different inputs evenly over all possible outputs. Beyond that, hash functions are built for very different jobs, and using one built for the wrong job is a classic mistake: a fast table hash where you need security, or a slow cryptographic hash in a hot loop.

## Three jobs, three kinds of hash

| Job | Examples | What it must do |
| --- | --- | --- |
| Hash tables, sharding, Bloom filters | FNV, MurmurHash, xxHash, SipHash | Very fast; spread keys evenly |
| Detect accidental corruption | CRC-32, CRC-32C, the Internet checksum, Adler-32 | Cheap; catch bit flips and bursts |
| Integrity and identity against attackers | SHA-256, SHA-3, BLAKE3 | Infeasible to find collisions or preimages |

Plus a fourth, special case: **password hashing** (Argon2id, scrypt, bcrypt, PBKDF2), deliberately slow and salted.

## Fast hashes and checksums in a few lines

```js run
function fnv1a(str) {                       // 32-bit FNV-1a: a simple table hash
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(str)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
console.log(fnv1a("hello").toString(16), fnv1a("hellp").toString(16));

const buckets = new Array(10).fill(0);      // spread 10,000 keys over 10 buckets
for (let i = 0; i < 10000; i++) buckets[fnv1a("user:" + i) % 10]++;
console.log(buckets.join(" "));

function crc32(bytes) {                     // CRC-32 as used by zip, PNG and Ethernet
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}
console.log(crc32(new TextEncoder().encode("123456789")));
```

Node printed `4f9f2cab 5c9f4122`: changing one letter changed most of the bits. The buckets came out between 985 and 1,010 keys each, close to the ideal 1,000. And the CRC-32 of "123456789" is `cbf43926`, the standard check value every correct implementation must produce.

A table hash only needs to be fast and well spread, but if attackers choose the keys (HTTP parameters, JSON field names) they can pick ones that all collide and turn O(1) lookups into O(n). Languages defend against this "hash flooding" with randomly seeded hashes such as SipHash, which is why Python's and Rust's string hashes differ between runs.

## Checksums

Networks and disks flip bits. A **checksum** stored or sent with the data lets the receiver recompute it and detect most corruption. TCP, UDP and IPv4 use the 16-bit Internet checksum (RFC 1071), Ethernet and zip use CRC-32, and storage systems such as databases, ZFS and Kafka checksum their blocks and records, often with CRC-32C, which modern CPUs compute in hardware. Checksums are not security: CRCs are linear, so an attacker can change data and fix up the CRC in a few operations.

## Cryptographic hashes

A cryptographic hash such as SHA-256 (FIPS 180-4) is designed so that nobody can feasibly find two inputs with the same digest (collision resistance) or an input that produces a given digest (preimage resistance). That makes the digest a trustworthy identifier: Git commits, package lock files, container image digests and content-addressed storage all name data by its hash. MD5 and SHA-1 are broken for collision resistance and shouldn't be used for new security purposes. In browsers and Node, `crypto.subtle.digest("SHA-256", bytes)` computes one.

To prove that a message came from someone holding a key, not just that it is unchanged, use a MAC such as HMAC-SHA-256 or a digital signature.
