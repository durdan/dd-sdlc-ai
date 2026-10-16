---
id: ios
title: "iOS: how an app really runs"
promise: "What iOS does with your app between launch and being killed: states, the main thread, how SwiftUI redraws, memory, Swift concurrency, and the rules for networking, storage, background work, push and shipping."
kind: skill
level: intermediate
stages:
  - title: The running app
    blurb: States, threads, views and memory
    topics: [ios-lifecycle, ios-main-thread, ios-swiftui-updates, ios-arc]
  - title: Doing the work
    blurb: Concurrency, network and storage
    topics: [ios-concurrency, ios-networking, ios-persistence]
  - title: Living with the system
    blurb: Background, push, privacy, release
    topics: [ios-background, ios-push, ios-privacy, ios-shipping]
bridges:
  - id: retry
    why: "Mobile networks drop requests all the time. Retrying with backoff and jitter keeps a million phones from hammering your API at the same moment."
  - id: bff
    why: "A backend shaped for the app: fewer round trips over a slow radio, and payloads that fit what the screen shows."
  - id: pub-sub
    why: "APNs delivers to one device. Sending one event to many devices and services is a publish/subscribe problem on your side of the provider."
next: [apis-edge]
---
The examples are Swift 6 and assume iOS 17 or later unless a topic says otherwise. Where something changed recently (Observation in iOS 17, Swift 6 strict concurrency, scene life cycle becoming required), the topic says so.
