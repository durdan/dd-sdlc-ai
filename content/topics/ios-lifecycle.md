---
id: ios-lifecycle
title: App and scene lifecycle
summary: Active, inactive, background, suspended, gone
why: "iOS freezes and kills apps without asking. If you save state only when the app terminates, users lose their work."
lesson: none
points:
  - { title: Scenes have states, text: "Each window (scene) moves between active, inactive and background on its own; the process launches and dies separately." }
  - { title: Suspended means frozen, text: "A few seconds after going to the background your code stops running, though the app stays in memory." }
  - { title: Killed means no warning, text: "The system can end a suspended app at any time without calling any of your code." }
quiz_hint: Think about which transitions run your code and which happen while your app is frozen.
quiz:
  - q: Your app is suspended in the background and the system needs memory. What does your code get to run?
    options:
      - "applicationWillTerminate(_:), with about five seconds to save"
      - "Nothing; a suspended app is removed without being woken"
      - "sceneDidEnterBackground(_:) a second time"
    answer: 1
    explain: "A suspended app isn't running, so there is nothing to call. applicationWillTerminate(_:) is only called if the app is still running in the background (not suspended) when the system ends it. Save state when you go inactive or into the background."
  - q: "In SwiftUI, what does reading scenePhase from inside a view tell you?"
    options:
      - "The phase of the scene that contains the view"
      - "Whether any scene of the app is active"
      - "Whether the process is about to be killed"
    answer: 0
    explain: "Read in a view, scenePhase is that view's scene. Read in the App struct it is an aggregate: active if any scene is active."
  - q: "Why should you hide sensitive data when the scene goes to the background?"
    options:
      - "The system takes a snapshot of the screen for the app switcher"
      - "Background apps are not allowed to keep strings in memory"
      - "Otherwise the app is rejected in review"
    answer: 0
    explain: "After the background transition the system snapshots your UI and shows it in the app switcher and while the app comes back. Whatever was on screen appears in that image."
links:
  - { title: "Managing your app's life cycle (Apple)", url: "https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle" }
  - { title: "Preparing your UI to run in the background (Apple)", url: "https://developer.apple.com/documentation/uikit/preparing-your-ui-to-run-in-the-background" }
  - { title: "ScenePhase (SwiftUI)", url: "https://developer.apple.com/documentation/swiftui/scenephase" }
  - { title: "TN3187: Migrating to the UIKit scene-based life cycle", url: "https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle" }
---
An iOS app does not decide when it runs. The system launches the process, gives each of its windows (a scene) a state, and freezes or ends the process when the person moves on or memory gets tight. Your job is to react to each transition: get ready when you become active, quiet down and save when you are about to lose the screen, and expect that you may never get another chance.

## Two lifecycles: the process and its scenes

Since iOS 13, UIKit splits the lifecycle in two. The **app delegate** hears about the process: launch, push registration, memory warnings. Each **scene** (one instance of your UI, of which an iPad may show several) has its own states and its own delegate:

- **Unattached**: created by the system but not yet connected to UI.
- **Foreground active**: on screen and receiving touches.
- **Foreground inactive**: on screen but interrupted, for example by a system alert, Control Center or the app switcher.
- **Background**: off screen, still running code, briefly.
- **Suspended**: still in memory, but no code runs at all.

A scene can be disconnected while in the background to free memory, which sends it back to unattached; the process may live on. Apple's TN3187 says that iOS 18.4 began logging a warning for UIKit apps that haven't adopted scenes, and that in the next major release after iOS 26, apps built with the latest SDK must use the scene life cycle or they won't launch. SwiftUI apps already do.

## What a transition gives you

```swift
@main
struct NotesApp: App {
    @Environment(\.scenePhase) private var phase
    @State private var store = NoteStore()

    var body: some Scene {
        WindowGroup { NotesView(store: store) }
            .onChange(of: phase) { _, newPhase in
                if newPhase == .inactive || newPhase == .background {
                    store.saveDraft()      // cheap, synchronous, safe to repeat
                }
            }
    }
}
```

When a scene leaves the screen, Apple's guidance is to save user data, pause timers and pause games on deactivation, then release big caches, shared hardware such as the camera, and anything secret on screen once in the background. After your background callback returns, the system takes the **snapshot** shown in the app switcher, so hide sensitive views before then.

## Suspended, then gone

A few seconds after reaching the background, the app is normally suspended: its memory is kept but its threads are frozen. From there, the system can end the process at any time to reclaim memory, and it does not wake you to say goodbye. `applicationWillTerminate(_:)` only runs if the app is still executing in the background when it is ended, so treat it as a bonus, never as your save point.

The next launch is a cold start. To make it feel as if nothing happened, restore what the person was looking at: `@SceneStorage` keeps small per-scene values such as the selected tab or a draft's ID, and your own store holds the data itself.

```swift
struct NotesView: View {
    @SceneStorage("selectedNote") private var selectedID: String?
    var store: NoteStore
    var body: some View { /* ... */ }
}
```

If you need a few more seconds to finish something important while moving to the background, ask for them before you get there (see the background execution topic).
