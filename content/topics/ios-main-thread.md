---
id: ios-main-thread
title: The main thread and run loop
summary: One thread draws the UI; keep it free
why: "Anything slow on the main thread freezes touches and animations. Past about 100 ms, people notice; long enough, and the system ends the app."
lesson: none
points:
  - { title: One loop, text: "The main thread runs a run loop that sleeps until an event arrives, handles it, then lets the frame be drawn." }
  - { title: UI only there, text: "UIKit and SwiftUI state must be touched on the main thread (the main actor in Swift concurrency)." }
  - { title: Budget per frame, text: "At 60 Hz a frame lasts 16.7 ms and at 120 Hz just 8.3 ms, shared with everything else the main thread does." }
quiz:
  - q: "A button handler reads and decodes a 20 MB JSON file before updating a label. What does the user see?"
    options:
      - "Nothing unusual; the system moves file reads to another thread"
      - "The app freezes until the work is done, because the run loop can't handle touches or draw"
      - "The label updates first, then the file is read"
    answer: 1
    explain: "The handler runs on the main thread inside one turn of the run loop. Until it returns, no other event is processed and no frame is committed, so the app hangs."
  - q: Which tool tells you at runtime that a UIKit API was called off the main thread?
    options:
      - "Address Sanitizer"
      - "Main Thread Checker"
      - "Instruments' Leaks template"
    answer: 1
    explain: "Main Thread Checker, enabled in the scheme's Diagnostics settings, flags system APIs that must run on the main thread but were called elsewhere."
  - q: "What is the relationship between the main actor and the main thread?"
    options:
      - "They are unrelated"
      - "Code isolated to the main actor runs on the main thread"
      - "The main actor is a second UI thread"
    answer: 1
    explain: "The main actor is how Swift concurrency names the main thread's serial context. Code isolated to @MainActor is executed on the main thread."
links:
  - { title: "Improving app responsiveness (Apple)", url: "https://developer.apple.com/documentation/xcode/improving-app-responsiveness" }
  - { title: "Run loops (Threading Programming Guide)", url: "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Multithreading/RunLoopManagement/RunLoopManagement.html" }
  - { title: "Diagnosing memory, thread, and crash issues early (Apple)", url: "https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early" }
  - { title: "RunLoop (Foundation)", url: "https://developer.apple.com/documentation/foundation/runloop" }
---
Every iOS app starts with one thread, the main thread, and the frameworks set up a **run loop** on it before your first line of code runs. The loop waits for something to happen (a touch, a timer, a message from another thread), runs the handler for it, and then gives the rendering system a chance to commit the changes you made. UIKit and SwiftUI are built on the assumption that they only ever run on this thread.

## One turn of the loop

You can picture the main thread doing this, forever:

1. Sleep until an input source or timer fires.
2. Call your code: a gesture handler, a `body` evaluation, a timer callback, a block queued with `DispatchQueue.main.async`, a main-actor task resuming.
3. Lay out and commit any UI changes, so the next frame can show them.

While step 2 runs, steps 1 and 3 can't. A slow handler doesn't just delay itself: it delays every touch and every frame after it. Apple's responsiveness guide puts a discrete delay above 100 ms in "hang" territory, and suggests keeping the main thread's work for a frame under about 5 ms, since a 120 Hz display gives you 8.3 ms in total.

## Keep the UI on main, the rest off it

UI objects aren't thread-safe. Changing a view or a value SwiftUI observes from a background thread can corrupt state or crash, and Xcode's **Main Thread Checker** reports such calls while you debug. The pattern is: do heavy work elsewhere, then come back to the main thread to show the result.

```swift
@MainActor
final class PhotoViewModel {
    var thumbnail: UIImage?

    func load(file: URL) async {
        let image = await Self.makeThumbnail(file)   // runs on the thread pool
        thumbnail = image                            // back on the main actor
    }

    // @concurrent (Swift 6.2) means "run on the thread pool, not on the caller's actor".
    // In Swift 6.0 and 6.1, write nonisolated instead: that already ran async code off the actor.
    @concurrent static func makeThumbnail(_ file: URL) async -> UIImage? {
        guard let data = try? Data(contentsOf: file) else { return nil }
        return UIImage(data: data)?.preparingThumbnail(of: CGSize(width: 200, height: 200))
    }
}
```

With Swift concurrency, "the main thread" is spelled `@MainActor`, and the compiler checks it for you; with Grand Central Dispatch it is `DispatchQueue.main`. The idea is the same. One caution from Apple's guide: hopping back to the main thread costs something too, so don't schedule work there that doesn't need to be there, not even asynchronously.

## Run loop modes

A run loop runs in a **mode** that decides which sources it listens to. While a scroll view is tracking a finger, the main run loop switches to a tracking mode, and a `Timer` scheduled in the default mode stops firing until the scroll ends. Adding the timer to the common modes keeps it running:

```swift
let timer = Timer(timeInterval: 1, repeats: true) { _ in updateClock() }
RunLoop.main.add(timer, forMode: .common)
```

You rarely manage run loops yourself (secondary threads only have one if you run it), but knowing the main thread is a loop explains most "why didn't my UI update" and "why did it freeze" questions.
