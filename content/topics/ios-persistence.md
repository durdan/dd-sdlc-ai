---
id: ios-persistence
title: "Persistence: defaults, files, SwiftData"
summary: Where each kind of data belongs
why: "Put secrets in UserDefaults or big files in the wrong folder and you get leaks, bloated backups, or data the system deletes when space runs low."
requires: [ios-lifecycle]
lesson: none
points:
  - { title: UserDefaults for settings, text: "Small, non-sensitive preferences; stored unencrypted in a property list." }
  - { title: Keychain for secrets, text: "Tokens and passwords go in the Keychain, which is encrypted and survives reinstall." }
  - { title: Folders mean something, text: "Documents and Application Support are backed up; Caches and tmp may be purged." }
  - { title: SwiftData for object graphs, text: "Models you query, relate and change belong in SwiftData (iOS 17+) or Core Data." }
quiz:
  - q: "Where should your app keep the user's OAuth refresh token?"
    options:
      - "UserDefaults"
      - "The Keychain"
      - "A JSON file in Documents"
    answer: 1
    explain: "Apple's UserDefaults docs say it stores data unencrypted and tell you to put sensitive information in the Keychain. Files in Documents are backed up and may be shared through the Files app."
  - q: "Your app generates thumbnails it can rebuild from the originals. Where should they go?"
    options:
      - "Library/Caches"
      - "Documents"
      - "Library/Application Support"
    answer: 0
    explain: "Caches is excluded from backup and the system may empty it when storage is low, which is fine for data you can re-create. Documents and Application Support are backed up."
  - q: "When does a SwiftData model context save changes for you?"
    options:
      - "Never; you must always call save()"
      - "The container's mainContext autosaves; contexts you create don't unless you enable it"
      - "Every context saves after every change"
    answer: 1
    explain: "autosaveEnabled is false by default, but SwiftData turns it on for the mainContext, which saves at various points in the lifecycle of scenes and views. Contexts you create yourself, for example in a ModelActor, need save() unless you turn autosave on."
links:
  - { title: "UserDefaults (Foundation)", url: "https://developer.apple.com/documentation/foundation/userdefaults" }
  - { title: "SwiftData (Apple)", url: "https://developer.apple.com/documentation/swiftdata" }
  - { title: "Optimizing your app's data for iCloud Backup (Apple)", url: "https://developer.apple.com/documentation/foundation/optimizing-your-app-s-data-for-icloud-backup" }
  - { title: "Keychain services (Apple)", url: "https://developer.apple.com/documentation/security/keychain-services" }
---
An iOS app can only write inside its own container, but within it you have several stores, each with different rules about size, security, backup and lifetime. Choosing the right one is mostly about the data: is it a setting, a secret, a file, or a set of related records you need to query?

## Settings: UserDefaults

```swift
UserDefaults.standard.set(true, forKey: "hasSeenOnboarding")
let seen = UserDefaults.standard.bool(forKey: "hasSeenOnboarding")

// In SwiftUI, @AppStorage reads and writes the same store and refreshes the view.
@AppStorage("sortOrder") private var sortOrder = "date"
```

UserDefaults is a key-value store of property-list types (strings, numbers, dates, data, arrays and dictionaries of them). Writes update memory at once and reach disk asynchronously. It is loaded as a whole, so keep it small, and it is not encrypted: Apple's own documentation says to keep personal or sensitive data out of it. Using it also means declaring a reason in your privacy manifest (see the privacy topic).

## Secrets: the Keychain

Passwords, tokens and keys belong in the **Keychain** (Security framework, `SecItemAdd` and friends). Items are encrypted, can require the device to be unlocked or biometrics, and can be shared between your apps through an access group. Unlike your container, Keychain items can survive deleting and reinstalling the app, so don't rely on reinstall to clear them.

## Files: pick the folder on purpose

| Folder | Backed up | Purged by system | Use for |
| --- | --- | --- | --- |
| `Documents` | Yes | No | Files the user creates; can be shown in the Files app |
| `Library/Application Support` | Yes | No | Your app's own data files and databases |
| `Library/Caches` | No | Yes, when space is low | Anything you can download or rebuild |
| `tmp` | No | Yes | Scratch files you delete when done |

```swift
let support = try FileManager.default.url(for: .applicationSupportDirectory,
                                          in: .userDomainMask, appropriateFor: nil, create: true)
try data.write(to: support.appending(path: "drafts.json"), options: [.atomic, .completeFileProtection])
```

Write atomically so a crash or kill mid-write can't leave half a file. Files get **data protection** from the passcode: by default a file is unreadable until the first unlock after a reboot, and `.completeFileProtection` locks it whenever the device is locked (which also means you can't read it from a background task while locked). Large re-downloadable files outside Caches can be marked with `isExcludedFromBackup`.

## Records: SwiftData or Core Data

For many related objects that you filter, sort and change, use a database. **SwiftData** (iOS 17) describes the schema in Swift and is built on Core Data's storage:

```swift
@Model final class Trip {
    var name: String
    var start: Date
    @Relationship(deleteRule: .cascade) var stops: [Stop] = []
    init(name: String, start: Date) { self.name = name; self.start = start }
}

struct TripsView: View {
    @Query(sort: \Trip.start) private var trips: [Trip]   // refreshes the view on change
    @Environment(\.modelContext) private var context
    var body: some View { List(trips) { Text($0.name) } }
}
```

`@Model` classes are observable, so SwiftUI updates as they change. The container's `mainContext` is bound to the main actor and autosaves; heavy imports belong in a `ModelActor` with its own context, passing `PersistentIdentifier`s between actors rather than model objects. **Core Data** remains the choice when you need to support iOS 16 and earlier, or features SwiftData doesn't have yet. Neither replaces your server: treat a local database as a cache plus offline edits, and plan how changes sync.
