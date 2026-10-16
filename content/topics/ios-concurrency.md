---
id: ios-concurrency
title: "Swift concurrency: tasks, actors, Sendable"
summary: async/await, structured tasks, isolation
why: "Swift 6 turns data races into compile errors. Knowing what isolation means is the difference between fixing those errors and fighting them."
requires: [ios-main-thread, ios-arc]
lesson: none
points:
  - { title: await is a pause point, text: "An async function can suspend at each await and free its thread; between awaits it runs without interruption." }
  - { title: Tasks form a tree, text: "Child tasks from async let and task groups are cancelled with their parent and must finish before it does." }
  - { title: Actors guard state, text: "An actor runs one piece of its code at a time; @MainActor is the actor for the UI." }
  - { title: Sendable crosses borders, text: "Only values that are safe to share may be passed between isolation domains; Swift 6 checks this." }
quiz:
  - q: "An actor method reads a balance, awaits a network call, then writes the balance. What can happen during the await?"
    options:
      - "Nothing; actors block until the method returns"
      - "Other calls on the same actor may run, so the balance may have changed when it resumes"
      - "The actor is deallocated"
    answer: 1
    explain: "Actors are re-entrant: while a method is suspended, the actor can run other work. Re-read or re-check state after every await inside an actor."
  - q: "What happens to the child tasks created with async let when the parent task is cancelled?"
    options:
      - "They keep running until they finish"
      - "They are marked cancelled too, and must check for it to stop early"
      - "They are killed immediately"
    answer: 1
    explain: "Cancellation is cooperative and flows down the task tree. Children are marked cancelled; code that calls Task.checkCancellation() or awaits cancellable APIs (like URLSession) stops early."
  - q: "Which type can safely be sent from a background task to the main actor without extra work?"
    options:
      - "A struct whose stored properties are all Sendable"
      - "A non-final class with var properties"
      - "Any type, as long as you await"
    answer: 0
    explain: "Value types made of Sendable parts are Sendable implicitly (for non-public types). A mutable class has shared state that two actors could touch at once, so the compiler refuses."
links:
  - { title: "Concurrency (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/" }
  - { title: "Migrating to Swift 6 (swift.org)", url: "https://www.swift.org/migration/documentation/migrationguide/" }
  - { title: "Protect mutable state with Swift actors (WWDC21)", url: "https://developer.apple.com/videos/play/wwdc2021/10133/" }
  - { title: "Embracing Swift concurrency (WWDC25)", url: "https://developer.apple.com/videos/play/wwdc2025/268/" }
---
Swift's concurrency model, available since Swift 5.5, has three parts that fit together: **async functions** that can pause without blocking a thread, **tasks** that run them and form a tree, and **actors** that protect mutable state by letting only one piece of code touch it at a time. The Swift 6 language mode adds the compiler checks that make data races a build error instead of a crash in production.

## async and await

```swift
func loadProfile(id: User.ID) async throws -> Profile {
    let (data, _) = try await URLSession.shared.data(from: Profile.url(for: id))
    return try JSONDecoder().decode(Profile.self, from: data)
}
```

Each `await` marks a point where the function may suspend. While it waits, its thread goes back to the pool to run other work; nothing is blocked. Code between two `await`s runs straight through. The function may resume on a different thread than it started on, which is why isolation, not threads, is what you reason about.

## Tasks: structured first

```swift
func loadDashboard() async throws -> Dashboard {
    async let profile = loadProfile(id: me)    // child task 1
    async let feed = loadFeed()                // child task 2, runs in parallel
    return try await Dashboard(profile: profile, feed: feed)
}
```

`async let` and `withTaskGroup` create **child tasks**: they can't outlive the function, if the function exits with an error the children still running are cancelled, and cancelling the parent cancels them all. Cancellation is cooperative: a task is only marked, and your code (or the API it awaits) decides when to stop.

`Task { ... }` starts an unstructured task that inherits the current actor and priority; `Task.detached` inherits neither. In SwiftUI, prefer `.task { }` on a view, which is cancelled automatically when the view goes away.

## Actors and the main actor

```swift
actor ImageCache {
    private var images: [URL: UIImage] = [:]
    func image(for url: URL) -> UIImage? { images[url] }
    func insert(_ image: UIImage, for url: URL) { images[url] = image }
}

let cached = await cache.image(for: url)       // outside callers must await
```

An actor serialises access to its state, so callers from outside must `await`. Actors are **re-entrant**: while one of its methods is suspended at an `await`, the actor can run other calls, so don't assume state is unchanged after an `await`.

`@MainActor` is a global actor tied to the main thread. SwiftUI's `View` is declared `@MainActor`, so your views and their `body` are too, and marking a view model `@MainActor` makes the compiler check that UI state is only touched there.

## Sendable and Swift 6

A value is `Sendable` when it is safe to share across isolation domains: value types made of `Sendable` parts, immutable final classes, actors, and classes that guard their own state. In the Swift 6 language mode (opt-in per target, introduced with Swift 6 in 2024), passing a non-`Sendable` value between actors is a compile error, where Swift 5 mode only warned, if you turned the checks on.

Swift 6.2 (2025) made this easier to adopt. A target can choose to be **main-actor isolated by default**, which suits app code that is mostly UI, and an upcoming-feature setting makes nonisolated async functions run on the caller's actor instead of always hopping to the thread pool. You then mark code that should run in parallel with `@concurrent`. Check your target's build settings: the same code can be isolated differently depending on these options.
