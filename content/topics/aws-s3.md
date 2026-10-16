---
id: aws-s3
title: "S3: objects, consistency and storage classes"
summary: Durable key-value storage for files of any size
why: "S3 holds backups, data lakes, uploads, static sites and Terraform state. Its consistency model, cost model and access controls decide how safely you can build on it."
requires: [aws-iam]
lesson: diagram
points:
  - title: Buckets hold objects by key
    text: "An object is bytes plus metadata under a key such as invoices/2026/03.pdf. The slashes are just characters; there are no real folders."
  - title: Strongly consistent since 2020
    text: "After a successful PUT or DELETE, every following read and list sees it, in all Regions, at no extra cost."
  - title: Storage classes trade access for price
    text: "Standard, Intelligent-Tiering, the Infrequent Access classes and the Glacier classes differ in price, retrieval cost, minimum duration and speed."
  - title: Private by default
    text: "New buckets block public access and encrypt every new object with SSE-S3. Keep it that way unless you mean otherwise."
quiz_hint: Separate what S3 guarantees (consistency, durability) from what it does not (locking between writers).
quiz:
  - q: A service writes report.json and immediately reads it back from another machine. What does it get?
    options: ["Possibly the old version for a few seconds", "The new version; S3 has strong read-after-write consistency", "An error until replication finishes"]
    answer: 1
    explain: "Since December 2020 S3 is strongly consistent for PUTs and DELETEs, including overwrites and list operations, in every Region."
  - q: Two writers PUT the same key at the same moment, without conditions. What happens?
    options: ["S3 merges them", "The last write to be processed wins; S3 does not lock objects", "Both writes fail"]
    answer: 1
    explain: "S3 has no object locking for concurrent writers. Use conditional writes (If-None-Match or If-Match) or coordinate in your application."
  - q: You store 1 million 10 KB thumbnails in Standard-IA to save money. Why might it cost more?
    options: ["Standard-IA charges each object as at least 128 KB, and adds retrieval fees per GB read", "Standard-IA cannot store small files", "It costs exactly the same as Standard"]
    answer: 0
    explain: "Infrequent Access classes have a 128 KB minimum billable size, a 30-day minimum duration and retrieval charges. They pay off for larger, rarely read objects."
links:
  - { title: "What is Amazon S3? including the data consistency model (AWS docs)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" }
  - { title: "Understanding and managing Amazon S3 storage classes (AWS docs)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html" }
  - { title: "Blocking public access to your Amazon S3 storage (AWS docs)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html" }
---
Amazon S3 stores **objects** (any bytes, up to 5 TB each, plus metadata) under **keys** in **buckets**. It is a regional service designed for eleven nines of durability: in most storage classes your data is stored redundantly across several Availability Zones before the write returns. You reach it over HTTPS through the API, not as a mounted file system, which shapes everything about how you use it.

## Consistency, exactly

S3 provides **strong read-after-write consistency** for PUT and DELETE requests in all Regions, for new objects and overwrites alike, and for list operations. A successful write is immediately visible to every reader. This replaced the old eventual-consistency model in December 2020; older advice about waiting before reading, or using a separate index because listings lag, no longer applies.

What S3 does **not** give you is coordination between writers. Concurrent PUTs to one key resolve to whichever S3 processes last. When that matters, use **conditional writes**: `If-None-Match: *` makes a PUT fail if the key already exists (create-once semantics), and `If-Match: <etag>` fails if someone changed the object since you read it (optimistic concurrency).

```sh
aws s3api put-object --bucket example-locks --key jobs/42 --body owner.txt --if-none-match '*'
# a second caller with the same key gets 412 Precondition Failed
```

## Storage classes

| Class | Good for | Watch out for |
| --- | --- | --- |
| Standard | Frequently read data | Highest storage price |
| Intelligent-Tiering | Unknown or changing access | Small monthly monitoring fee per object; objects under 128 KB are never moved |
| Standard-IA, One Zone-IA | Read rarely, needed fast | 128 KB minimum size, 30-day minimum, retrieval fee; One Zone-IA lives in a single zone |
| Glacier Instant, Flexible, Deep Archive | Archives and backups | Longer minimums (90 to 180 days), retrieval fees, minutes to hours for the colder two |
| Express One Zone | Very low latency next to compute | Single zone, different bucket type |

**Lifecycle rules** move objects between classes by age and delete old versions, which is how most savings are made in practice. Turn on **versioning** for anything important: an overwrite or delete then keeps the previous version, which protects against bugs and ransomware, and lifecycle rules can expire old versions later.

## Access and safety

New buckets have **Block Public Access** on and **object ownership** set so ACLs are disabled; access is decided by IAM policies and the bucket policy. Every new object is encrypted with SSE-S3 by default since January 2023; use SSE-KMS when you need key-level access control and audit. Common failure modes:

- Turning off Block Public Access for one public file and exposing the whole bucket. Serve public content through CloudFront with origin access control instead.
- Treating S3 as a file system: renames are copy plus delete, and there are no appends.
- Hot prefixes: S3 scales per prefix (at least 3,500 writes and 5,500 reads per second each), so spread very high request rates over several prefixes.

```trace diagram
id: s3-upload
title: A browser upload, stored and aged
subtitle: Presigned PUT, three zones, lifecycle
groups:
  - { id: region, label: "S3 in one Region" }
elements:
  - { id: browser, label: Browser, kind: person, row: 0 }
  - { id: app, label: Your backend, sub: holds IAM credentials, row: 1 }
  - { id: url, label: Presigned URL, sub: "PUT, expires in 15 min", kind: component, row: 2 }
  - { id: reader, label: Any reader, sub: GET or LIST, row: 2 }
  - { id: bpa, label: Block Public Access, sub: on for new buckets, kind: component, tone: neutral, row: 2 }
  - { id: s3, label: Bucket, sub: "key → object", kind: system, group: region, row: 3 }
  - { id: az1, label: Zone a, kind: store, group: region, row: 4 }
  - { id: az2, label: Zone b, kind: store, group: region, row: 4 }
  - { id: az3, label: Zone c, kind: store, group: region, row: 4 }
  - { id: ia, label: Standard-IA, sub: after 30 days, kind: store, tone: data, row: 4 }
  - { id: deep, label: Deep Archive, sub: after a year, kind: store, tone: data, row: 5 }
edges:
  - { id: ask, from: browser, to: app }
  - { id: sign, from: app, to: url }
  - { id: put, from: url, to: s3, label: PUT }
  - { id: read, from: reader, to: s3 }
  - { id: guard, from: bpa, to: s3, style: dashed }
  - { id: z1, from: s3, to: az1 }
  - { id: z2, from: s3, to: az2 }
  - { id: z3, from: s3, to: az3 }
  - { id: to-ia, from: s3, to: ia, style: dashed }
  - { id: to-deep, from: ia, to: deep, style: dashed }
steps:
  - caption: "A browser uploads a file straight to S3, so your servers never carry the bytes. Then lifecycle rules make the stored file cheaper as it ages."
  - caption: "The browser asks your backend if it may upload invoices/2026/03.pdf. That key is just a string. The slashes are characters, not folders."
    focus: [browser, app]
    trace: [ask]
  - caption: "The backend signs a URL with its own IAM credentials. The URL fixes the bucket, the key, the PUT method and an expiry time. Anyone holding it can use it until then, so keep it short."
    trace: [sign]
    note: "With an IAM user and SigV4 the limit is 7 days. A URL signed with role credentials expires when the session does."
  - caption: "The browser PUTs the bytes to S3 with that URL. S3 checks the signature and whether the signer may write the object. It needs no AWS credentials of its own."
    trace: [put]
  - caption: "In most storage classes, S3 stores the object redundantly across several Availability Zones before the PUT returns. That is how it is designed for eleven nines of durability."
    trace: [z1, z2, z3]
  - caption: "Every GET or LIST after a successful PUT sees the new object. S3 has been strongly consistent since 2020. But writers are not coordinated: when two write the same key, the last one S3 processes wins."
    trace: [read]
  - caption: "Block Public Access is on for new buckets and ACLs are disabled. The presigned URL works without making anything public, so leave it on."
    focus: [bpa, s3]
    trace: [guard]
  - caption: "A lifecycle rule moves objects to Standard-IA once they are 30 days old. Storage is cheaper there, but each read pays a retrieval fee, and small objects are billed as 128 KB."
    trace: [to-ia]
  - caption: "A second rule archives them to S3 Glacier Deep Archive after a year. Reading one back first needs a restore that takes hours, so use it for data you hope never to read."
    trace: [to-deep]
```
