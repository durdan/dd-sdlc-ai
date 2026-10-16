---
id: sec-encryption
title: "Encryption at rest, in transit, and key management"
summary: Encryption moves the problem to the keys
why: "\"It's encrypted\" is only reassuring if you know against whom: a stolen disk, a curious cloud operator, or an attacker with your app's credentials. Most of the real work is in who can use the keys."
requires: [sec-tls]
lesson: none
points:
  - title: In transit
    text: "TLS between every pair of systems, including inside your network. Protects against anyone on the path."
  - title: At rest
    text: "Disk, database and object-storage encryption protect against lost hardware and raw storage access, not against someone who can query the app."
  - title: Envelope encryption
    text: "Data is encrypted with a data key; the data key is encrypted with a master key held in a KMS or HSM that never releases it."
  - title: Use vetted primitives
    text: "Authenticated encryption (AES-GCM, ChaCha20-Poly1305) from a standard library. Never invent a scheme or reuse a nonce."
quiz:
  - q: "The database volume is encrypted at rest. An attacker steals the app's database credentials. What does at-rest encryption protect?"
    options: ["Everything; the data is encrypted", "Nothing in this case: the database decrypts transparently for any authenticated query", "Only the indexes"]
    answer: 1
    explain: "Storage encryption protects against stolen disks and snapshots. Against someone with valid access you need access control, and for the most sensitive fields, application-level encryption with separately controlled keys."
  - q: What is envelope encryption?
    options: ["Encrypting the same data twice", "Encrypting data with a data key, then encrypting that data key with a master key kept in a KMS", "Sending keys by post"]
    answer: 1
    explain: "Bulk data is encrypted locally and fast; only the small data keys go to the KMS. Rotating or revoking the master key controls access to all of it."
  - q: Why does AES-GCM forbid reusing a nonce with the same key?
    options: ["It makes encryption slower", "Reuse can reveal the relationship between messages and let an attacker forge authenticated ciphertexts", "It doesn't matter"]
    answer: 1
    explain: "GCM's security depends on unique nonces per key. Let the library generate them, or use a nonce-misuse-resistant mode where reuse is a risk."
links:
  - { title: "Cryptographic Storage Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html" }
  - { title: "Key Management Cheat Sheet (OWASP)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html" }
  - { title: "NIST SP 800-57 Part 1: Recommendation for Key Management", url: "https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final" }
---
Encryption turns data into something useless without a key. That moves the question from "who can read the data?" to "who can use the key?". To reason about it, always ask which attacker a given layer of encryption stops. Encryption **in transit** stops people on the network. Encryption **at rest** stops people who get the raw storage. Neither stops someone who can ask your application, or the database, for the data.

## In transit

Use TLS everywhere: browser to edge, edge to service, service to database, service to service. "It's on our private network" is not a reason to skip it; flat internal networks are exactly where attackers move after the first foothold. Mutual TLS adds authentication of the client service as well.

## At rest: layers and what they stop

- **Full-disk and volume encryption** (cloud disks, laptops): protects lost or decommissioned hardware and raw snapshots. Transparent to anything running on the machine.
- **Database or storage-service encryption** (transparent data encryption, encrypted buckets): protects the files and backups; the service decrypts for any authorised query.
- **Application-level (field-level) encryption**: the app encrypts specific fields (a national ID, card data, health notes) before storing them, with keys the database never sees. A SQL injection or a stolen database dump then yields ciphertext. It costs you: you can't search or index those fields normally.

Turn on the first two by default; they are nearly free in the cloud. Use the third for the data whose leak would hurt most.

## Envelope encryption and a KMS

Keeping keys in a config file next to the data defeats the point. The usual design is **envelope encryption**:

1. A **key management service** (AWS KMS, Google Cloud KMS, Azure Key Vault, HashiCorp Vault Transit) holds a master key that never leaves it.
2. To encrypt, you ask the KMS for a fresh **data key**. It returns the key in plain form and wrapped (encrypted under the master key).
3. You encrypt the data locally with the plain data key, store the wrapped key next to the ciphertext, and discard the plain key.
4. To decrypt, you send the wrapped key to the KMS, which unwraps it if your identity is allowed to.

Access to the master key is now an IAM policy you can audit, every use is logged, and rotating the master key doesn't mean re-encrypting all the data.

## Using cryptography safely

- Use **authenticated encryption**: AES-256-GCM or ChaCha20-Poly1305. It detects tampering as well as hiding content.
- Use a high-level library (libsodium, Tink, your platform's standard crypto with recommended defaults). Never design your own scheme.
- Never reuse a **nonce** with the same key in GCM; let the library generate them.
- Get randomness from the OS's secure generator (`crypto.getRandomValues`, `secrets` in Python), never `Math.random`.
- Plan **rotation** and record which key version encrypted what.
- Remember passwords are **hashed**, not encrypted (see the passwords topic).
