---
id: ios-background
title: Background execution limits
summary: What iOS lets you run when off screen
why: "There is no way to keep an ordinary app running in the background. Designs that assume one, like polling a server every minute, don't work on iOS."
requires: [ios-lifecycle, ios-networking]
lesson: none
points:
  - { title: The system decides, text: "You request background time; iOS grants it based on battery, network, usage patterns and how you behaved last time." }
  - { title: Pick the right tool, text: "Finish a task, refresh content, do heavy maintenance, transfer files, or get woken by a push: each has its own API." }
  - { title: Always have an exit, text: "Every grant has an expiration handler. Stop cleanly and mark the task complete, or the system ends your app." }
quiz:
  - q: "Your app needs to finish saving a large draft when the user leaves it. What should you use?"
    options:
      - "BGProcessingTask"
      - "beginBackgroundTask(withName:expirationHandler:), started before the save, ended when done"
      - "A loop that keeps the main thread busy"
    answer: 1
    explain: "A background task assertion gives a short, limited extension to finish work already in progress. Start it before the app leaves the foreground and always call endBackgroundTask(_:), or the system ends the app."
  - q: "You schedule a BGAppRefreshTaskRequest with earliestBeginDate set to 15 minutes from now. When does it run?"
    options:
      - "In exactly 15 minutes"
      - "Not before 15 minutes, at a time the system chooses, possibly much later or not at all"
      - "Every 15 minutes from then on"
    answer: 1
    explain: "earliestBeginDate is a lower bound. iOS weighs battery, network and how often the person uses your app. Refreshes are one-off, so schedule the next one from the handler."
  - q: "What happens to a running BGProcessingTask when the person picks up the phone and starts using it?"
    options:
      - "It keeps running at lower priority"
      - "The system ends it; processing tasks run only while the device is idle"
      - "It moves into the foreground"
    answer: 1
    explain: "Processing tasks are for idle periods, often overnight while charging. The system terminates them when the device is in use, so make the work resumable."
links:
  - { title: "Choosing background strategies for your app (Apple)", url: "https://developer.apple.com/documentation/backgroundtasks/choosing-background-strategies-for-your-app" }
  - { title: "Background Tasks framework (Apple)", url: "https://developer.apple.com/documentation/backgroundtasks" }
  - { title: "Performing long-running tasks on iOS and iPadOS (Apple)", url: "https://developer.apple.com/documentation/backgroundtasks/performing-long-running-tasks-on-ios-and-ipados" }
  - { title: "Finish tasks in the background (WWDC25)", url: "https://developer.apple.com/videos/play/wwdc2025/227/" }
---
Once an app leaves the screen, iOS suspends it within moments. That is deliberate: battery life and memory belong to whatever the person is using now. Instead of letting apps run freely, iOS offers a set of narrow, system-scheduled ways to get time in the background, and it decides when (and whether) each request is honoured.

## The menu

- **Finish what you started**: `beginBackgroundTask(withName:expirationHandler:)` buys a short extension to complete work in progress, such as saving a file or sending a message. Call it before leaving the foreground and balance it with `endBackgroundTask(_:)`.
- **Refresh content**: `BGAppRefreshTask` runs briefly (Apple documents up to 30 seconds) at a time iOS predicts is useful, often shortly before the person usually opens your app.
- **Heavy maintenance**: `BGProcessingTask` can run for minutes, but only while the device is idle, and can require power or network. Good for database clean-up, ML training, large syncs.
- **Long jobs the user started**: `BGContinuedProcessingTask` (new in iOS 26) starts from a user action, such as an export, and may continue after the app is backgrounded, with progress shown by the system so the person can cancel it.
- **Transfers**: background `URLSession` uploads and downloads (see networking).
- **Woken by your server**: background push notifications (see push).
- **Declared modes**: audio playback, navigation, VoIP and Bluetooth accessories keep running under their own `UIBackgroundModes`, and are reviewed for real use.

## Scheduling a refresh

Each task identifier must be listed under `BGTaskSchedulerPermittedIdentifiers` in `Info.plist`, with the matching background mode (`fetch` for refresh, `processing` for processing). In SwiftUI the handler is a scene modifier:

```swift
@main
struct NewsApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .backgroundTask(.appRefresh("com.example.news.refresh")) {
                scheduleRefresh()                   // one-off: book the next one
                await Headlines.shared.refresh()    // cancelled if time runs out
            }
    }
}

func scheduleRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.example.news.refresh")
    request.earliestBeginDate = .now.addingTimeInterval(30 * 60)  // not before; maybe much later
    try? BGTaskScheduler.shared.submit(request)
}
```

In UIKit you register a launch handler with `BGTaskScheduler.shared.register(forTaskWithIdentifier:using:launchHandler:)` before launch finishes, set the task's `expirationHandler`, and call `setTaskCompleted(success:)` when done. In SwiftUI the task completes when your closure returns, and running out of time cancels it.

## Why it is this strict, and what to do about it

Background time is a budget the system spreads across all apps. Apps the person rarely opens get less; apps that finish quickly and report completion are treated better; a force-quit app gets nothing until it is opened again. Treat every background grant as a bonus:

- Make work resumable and idempotent, so being cut off halfway is harmless.
- Do the essential part first (save, then upload; fetch headlines, then images).
- When the server knows something changed, send a push instead of polling.
- Test with Xcode's debugger commands for simulating task launch; on a real device, background tasks almost never run on the schedule you expect.
