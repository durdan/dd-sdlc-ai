---
id: mobile
title: "Mobile engineer: iOS and Android, side by side"
promise: "The rules both mobile platforms impose on your app, learned in pairs: a life cycle you don't control, one thread that draws, structured concurrency, declarative UI, strict limits on background work, push through the platform's own service, and a store between you and your users."
kind: role
tags: [mobile]
level: intermediate
stages:
  - title: The app's life
    blurb: Launched, backgrounded, killed
    topics: [ios-lifecycle, android-processes, android-lifecycle]
  - title: One thread draws
    blurb: Main thread and concurrency
    topics: [ios-main-thread, android-main-thread, ios-concurrency, android-coroutines]
  - title: Screens and data
    blurb: Declarative UI and the network
    topics: [ios-swiftui-updates, android-compose, ios-networking, android-networking]
  - title: Beyond the screen
    blurb: Background, push, shipping
    topics: [ios-background, android-background, ios-push, android-fcm, ios-shipping, android-build]
bridges:
  - id: retry
    why: "Phones lose the network all the time. Retry with exponential backoff and jitter, so a million devices coming back online don't all call your API in the same second."
  - id: idempotency
    why: "A request retried after a dropped connection, a background job run twice, a push delivered twice: each must not create a second order. The server needs a key to recognise repeats."
  - id: bff
    why: "Both apps pay for every round trip over a slow radio, and old versions stay installed for months. A backend shaped for the apps keeps payloads small and moves change to the server."
  - id: feature-flags
    why: "A store release can take days to reach users and can't be rolled back. Ship features dark and turn them on, or off, from the server."
next: [apis-edge, resilience-101]
---
Each stage pairs the iOS topic with its Android counterpart where the platforms mirror each other: scene and activity life cycles, the main run loop and the Looper, Swift concurrency and coroutines, SwiftUI and Compose, background limits, APNs and FCM, and signing and release. Android's process topic has no single iOS twin, because iOS folds process death into the app life cycle. Progress is shared with the iOS and Android paths.
