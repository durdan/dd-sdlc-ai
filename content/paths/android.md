---
id: android
title: "Android: how an app really runs"
promise: "What the system does with your app once it is installed: the process it may kill at any time, the one thread that draws, how Compose redraws, where state survives, and how work, data, pushes and builds fit around that."
kind: skill
level: intermediate
stages:
  - title: The process
    blurb: Who starts it, who kills it
    topics: [android-processes, android-lifecycle, android-main-thread, android-coroutines]
  - title: The screen and its data
    blurb: Compose, state, storage, network
    topics: [android-compose, android-viewmodel, android-room, android-networking]
  - title: Beyond the screen
    blurb: Background, permissions, push, release
    topics: [android-background, android-permissions, android-fcm, android-build]
bridges:
  - id: retry
    why: "WorkManager's backoff policy and every flaky mobile request need the same rule: wait longer each time, and add jitter so a million phones don't retry together."
  - id: idempotency
    why: "A worker that is retried, or a push that arrives twice, must not create two orders. Give each operation a key the server can recognise."
  - id: bff
    why: "Mobile clients pay for every round trip and can't be updated on demand. A backend shaped for the app keeps payloads small and changes on the server."
next: [apis-edge]
---
Written for current Android (API 34 and 35) and Kotlin 2.x. Where behaviour depends on the Android version or on a library version, the topic says so.
