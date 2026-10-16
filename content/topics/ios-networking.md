---
id: ios-networking
title: Networking with URLSession
summary: Sessions, caching, background transfers
why: "Phones change networks, lose signal and get suspended mid-request. The session you choose decides what survives that."
requires: [ios-concurrency]
lesson: none
points:
  - { title: Session per purpose, text: "A session's configuration (timeouts, cache, cookies, cellular) applies to every task in it; make one per kind of traffic." }
  - { title: HTTP caching is built in, text: "URLCache follows the server's cache headers by default, in memory and on disk." }
  - { title: Background sessions outlive you, text: "Uploads and downloads in a background session run in a system process, even while your app is suspended." }
quiz:
  - q: "What is special about a session created with URLSessionConfiguration.background(withIdentifier:)?"
    options:
      - "Its requests run on a background thread of your app"
      - "A system process performs the transfers, so they continue while your app is suspended or after the system ends it"
      - "It ignores App Transport Security"
    answer: 1
    explain: "Background sessions hand transfers to the system. When they finish, iOS relaunches or resumes your app and calls application(_:handleEventsForBackgroundURLSession:completionHandler:) with the session identifier."
  - q: "The user force-quits your app from the app switcher during a background download. What happens?"
    options:
      - "The download continues and the app is relaunched when it ends"
      - "The system cancels the session's transfers and won't relaunch the app until the user opens it"
      - "The download pauses and resumes automatically at the next unlock"
    answer: 1
    explain: "Force-quitting is taken as a clear signal. Background transfers are cancelled and the app isn't relaunched automatically; the user must open it again."
  - q: "Which session configuration keeps no caches, cookies or credentials on disk?"
    options:
      - "default"
      - "ephemeral"
      - "background"
    answer: 1
    explain: "An ephemeral session keeps its data in memory only, which suits private browsing or sensitive one-off calls."
links:
  - { title: "URLSession (Foundation)", url: "https://developer.apple.com/documentation/foundation/urlsession" }
  - { title: "Downloading files in the background (Apple)", url: "https://developer.apple.com/documentation/foundation/downloading-files-in-the-background" }
  - { title: "Accessing cached data (Apple)", url: "https://developer.apple.com/documentation/foundation/accessing-cached-data" }
  - { title: "Use async/await with URLSession (WWDC21)", url: "https://developer.apple.com/videos/play/wwdc2021/10095/" }
---
`URLSession` is the system's HTTP client. You create a **session** from a configuration, and each request you make is a **task** in that session: a data task for ordinary requests, upload and download tasks for files, and WebSocket tasks. Since iOS 15 each kind also has an `async` method, so a request is one `await`.

## A session per kind of traffic

```swift
let api: URLSession = {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 15
    config.waitsForConnectivity = true          // wait for a network instead of failing at once
    config.httpAdditionalHeaders = ["Accept": "application/json"]
    return URLSession(configuration: config)
}()

func fetchOrders() async throws -> [Order] {
    let (data, response) = try await api.data(from: Order.listURL)
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        throw APIError.badStatus
    }
    return try JSONDecoder().decode([Order].self, from: data)
}
```

`URLSession.shared` is fine for simple calls but can't be configured. Create your own sessions for anything else and keep them for the life of the app: each session owns a connection pool, and making one per request throws away connection reuse. The three configurations are **default** (disk cache, cookies, credentials), **ephemeral** (nothing written to disk) and **background** (below).

Two things that catch people out. A 404 or 500 is not an error to `URLSession`: you get a response and must check the status code yourself. And cancelling the Swift task that is awaiting `data(from:)` cancels the request, which is what you want when a SwiftUI `.task` is torn down.

All of this goes over HTTPS by default: **App Transport Security** blocks plain HTTP and weak TLS unless you add exceptions in `Info.plist`.

## Caching you get for free

Responses are stored in `URLCache` (memory and disk) and reused according to the server's `Cache-Control`, `ETag` and `Last-Modified` headers; that is what the default policy, `useProtocolCachePolicy`, means. You can override it per request, for example `.returnCacheDataElseLoad` to show something offline. Apple's docs point out that the default policy also writes HTTPS responses to disk, which you may not want for personal data; use an ephemeral session or veto caching in the session delegate.

## Transfers that survive suspension

A normal session stops when your app is suspended. For uploads and downloads that must finish anyway, use a background session: the transfer is done by a system process, which can wait for Wi-Fi or power when you set `isDiscretionary`.

```swift
let config = URLSessionConfiguration.background(withIdentifier: "com.example.sync")
config.sessionSendsLaunchEvents = true
let session = URLSession(configuration: config, delegate: syncDelegate, delegateQueue: nil)
session.downloadTask(with: exportURL).resume()
```

Background sessions only support upload and download tasks, report through a delegate rather than `async` returns, and wake the app when they finish: the app delegate receives `application(_:handleEventsForBackgroundURLSession:completionHandler:)`, you recreate the session with the same identifier, handle the delegate events, then call the completion handler. If the user force-quits the app, its background transfers are cancelled.

For retries, remember the phone's network is the least reliable part of the system: retry idempotent requests with backoff and jitter, and send an idempotency key with the rest.
