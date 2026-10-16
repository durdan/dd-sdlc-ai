---
id: ios-shipping
title: Building, signing and shipping
summary: Certificates, profiles, TestFlight, App Review
why: "An iOS binary only runs if Apple's chain of trust says it may. Knowing the pieces turns 'signing failed' from a mystery into a checklist."
requires: [ios-privacy]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: Signed or it doesn't run, text: "A certificate proves who built the app; a provisioning profile says which app, which entitlements and where it may run." }
  - { title: "Archive, upload, test, review", text: "Every release goes through App Store Connect: TestFlight for testers, then App Review for the store." }
  - { title: Rules change yearly, text: "Apple sets minimum Xcode and SDK versions for uploads; since April 28, 2026 that is Xcode 26 and the iOS 26 SDK." }
quiz:
  - q: "A teammate's iPhone can't install your development build, but yours can. What is the most likely cause?"
    options:
      - "Their phone runs a newer iOS"
      - "Their device isn't registered in the development provisioning profile"
      - "The app isn't on TestFlight yet"
    answer: 1
    explain: "Development and ad hoc profiles list the devices that may run the app. Register the device's UDID in your account and regenerate the profile (Xcode's automatic signing does this for you)."
  - q: "What do you need before external testers can install a TestFlight build?"
    options:
      - "Nothing; any uploaded build is available"
      - "The build, or an earlier one in that group, must pass TestFlight App Review, and beta description and review information must be filled in"
      - "A separate ad hoc provisioning profile per tester"
    answer: 1
    explain: "Internal testers (members of your App Store Connect team) can test right away. External testers, up to 10,000, need the first build approved by App Review for TestFlight, plus beta app description and review details."
  - q: "How long can testers use a TestFlight build?"
    options:
      - "7 days"
      - "Up to 90 days after upload"
      - "Until the app is released"
    answer: 1
    explain: "A build is available for testing for up to 90 days, after which it expires for testers. You can expire it earlier yourself."
links:
  - { title: "Distributing your app for beta testing and releases (Apple)", url: "https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases" }
  - { title: "TestFlight overview (App Store Connect Help)", url: "https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview" }
  - { title: "Certificates overview (Account Help)", url: "https://developer.apple.com/help/account/certificates/certificates-overview" }
  - { title: "App Review Guidelines (Apple)", url: "https://developer.apple.com/app-store/review/guidelines/" }
---
iOS only runs code that Apple's chain of trust allows. Before an app can launch on a device, it must be **code signed** with a certificate Apple issued to your team, and carry a **provisioning profile** that ties together the app ID, the certificate, the entitlements (push, iCloud, App Groups and so on) and, for development builds, the list of allowed devices. Shipping is then a pipeline: archive, upload to App Store Connect, test through TestFlight, and pass App Review.

## The signing pieces

- **Team and App ID**: your developer account's team, and the bundle identifier (`com.example.notes`) registered with the capabilities the app uses.
- **Certificates**: an *Apple Development* certificate per developer for running on devices while building, and an *Apple Distribution* certificate, owned by the team, for TestFlight and the App Store. The private key is what proves you hold the certificate; Xcode can now use cloud-managed certificates so the key never sits on one laptop.
- **Provisioning profiles**: *development* (your devices, debugging allowed), *ad hoc* (a fixed list of registered devices, no store), and *App Store Connect* (for upload; no device list, because Apple re-signs what it distributes).
- **Entitlements**: the capabilities baked into the signature. A push entitlement in the app that isn't in the profile is one of the most common signing errors.

For most teams, Xcode's **automatic signing** creates and renews all of this. CI systems usually use an App Store Connect API key with `xcodebuild`, or a tool that does the same, so builds don't depend on someone's keychain.

```sh
xcodebuild -scheme Notes -configuration Release \
  -archivePath build/Notes.xcarchive archive
xcodebuild -exportArchive -archivePath build/Notes.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/export
```

## From archive to testers

An **archive** is a release build plus its debug symbols. From the Organizer (or the commands above) you validate it, then upload it to App Store Connect, where it is processed and becomes a build of a version. Bump the build number on every upload: App Store Connect rejects a duplicate.

**TestFlight** distributes builds before release:

- *Internal testers*, people on your App Store Connect team, get builds right away.
- *External testers*, up to 10,000 by email or public link, need the first build of a group approved by App Review for TestFlight, and a beta description.
- A build stays testable for up to 90 days.

## App Review and release

Submitting a version sends the build, metadata, screenshots, privacy answers and age rating to **App Review**, which checks it against the App Review Guidelines. Apple says it reviews at least half of submissions within 24 hours and 90% within 48. Most rejections come from guideline 2.1 (app completeness): crashes, placeholder content, broken links, or demo accounts that don't work. Privacy issues are close behind: purpose strings that don't explain, data collection that doesn't match the privacy label, or a missing privacy manifest reason.

Apple also raises the floor every year. Since April 28, 2026, uploads must be built with Xcode 26 or later against the iOS 26 SDK, so the newest SDK's behaviour changes reach your app whether or not you planned for them. After approval you choose manual, automatic or phased release; a phased release rolls an update out over seven days to automatic-update users and can be paused if crash reports climb.

```trace diagram
id: ios-release
title: From Xcode to the App Store
subtitle: Archive, sign, upload, test, review, release
direction: DOWN
groups:
  - { id: build, label: Your Mac or CI }
  - { id: asc, label: App Store Connect }
elements:
  - { id: archive, label: Archive, sub: release build + debug symbols, group: build, row: 0 }
  - { id: cert, label: Distribution certificate, sub: the team's private key, kind: store, group: build, row: 0, role: security }
  - { id: profile, label: Provisioning profile, sub: "App ID, entitlements", kind: store, group: build, row: 0, role: security }
  - { id: signed, label: Signed build, sub: ready to upload, group: build, row: 1 }
  - { id: processing, label: Processing, sub: build number must be new, group: asc, row: 2, role: external }
  - { id: internal, label: Internal testers, sub: "your team, right away", kind: person, group: asc, row: 3 }
  - { id: betareview, label: TestFlight review, sub: first build of a group, group: asc, row: 3, role: security }
  - { id: external, label: External testers, sub: "up to 10,000, 90 days", kind: person, group: asc, row: 4 }
  - { id: review, label: App Review, sub: most within 24 to 48 h, group: asc, row: 3, role: security }
  - { id: release, label: Release, sub: "manual, automatic or phased", kind: person, row: 4 }
edges:
  - { id: sign, from: archive, to: signed }
  - { id: who, from: cert, to: signed}
  - { id: what, from: profile, to: signed}
  - { id: upload, from: signed, to: processing, label: upload }
  - { id: team, from: processing, to: internal }
  - { id: beta, from: processing, to: betareview }
  - { id: testers, from: betareview, to: external }
  - { id: submit, from: processing, to: review}
  - { id: ship, from: review, to: release }
steps:
  - caption: An iOS binary runs only if Apple's chain of trust allows it. Every release takes the same route, from a signed archive through App Store Connect, TestFlight and App Review.
  - caption: Xcode, or xcodebuild on CI, builds an archive, a release build plus its debug symbols. Since April 28, 2026, uploads must be built with Xcode 26 against the iOS 26 SDK.
    focus: [archive]
  - caption: Signing joins two pieces. The distribution certificate proves your team built it. The provisioning profile ties the App ID to its entitlements, and an entitlement missing from the profile is a classic signing error.
    focus: [archive, cert, profile, signed]
    trace: [sign, who, what]
  - caption: The signed build is uploaded and App Store Connect processes it into a build of a version. Bump the build number every time, because a duplicate is rejected.
    focus: [signed, processing]
    trace: [upload]
  - caption: Internal testers, people on your App Store Connect team, can install it from TestFlight straight away.
    focus: [processing, internal]
    trace: [team]
  - caption: External testers, up to 10,000 by email or public link, wait until the group's first build passes App Review for TestFlight. Every build stays testable for up to 90 days.
    focus: [processing, betareview, external]
    trace: [beta, testers]
  - caption: Submitting the version sends the build, metadata, screenshots and privacy answers to App Review. Apple reviews at least half of submissions within 24 hours. Crashes, placeholder content and broken demo accounts, guideline 2.1, are the most common rejection.
    focus: [processing, review]
    trace: [submit]
  - caption: After approval you release by hand, automatically, or in phases. A phased release reaches automatic-update users over seven days and can be paused if crash reports climb.
    focus: [review, release]
    trace: [ship]
note: Xcode's automatic signing creates and renews certificates and profiles; CI usually signs in with an App Store Connect API key.
```
