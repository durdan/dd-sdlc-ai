---
id: ios-push
title: Push notifications via APNs
summary: Device token, provider, payload, silent pushes
why: "Push is the only reliable way for your server to reach a phone that is not running your app, and it has rules about tokens, size and frequency."
requires: [ios-background]
lesson: none
points:
  - { title: Token is an address, text: "APNs gives each app on each device a token; your app sends it to your server, which sends it with every push." }
  - { title: Your server is the provider, text: "The provider sends an HTTP/2 POST to APNs, signed with a token key or a certificate." }
  - { title: Alert or silent, text: "An alert push shows something to the person; a background push only wakes your app, and is throttled." }
quiz:
  - q: "APNs answers your provider's request with status 410 and reason Unregistered. What should the server do?"
    options:
      - "Retry with exponential backoff"
      - "Stop sending to that token unless the app registers it again"
      - "Rotate the provider token"
    answer: 1
    explain: "410 means the token is no longer active for that topic, for example because the app was deleted. Retries with backoff are for 5xx responses; most other 4xx errors need a fix first."
  - q: "A background push is sent with content-available set to 1. Which statement is true?"
    options:
      - "It is guaranteed to wake the app within a second"
      - "It is low priority and may be delayed, coalesced or dropped, especially if you send many"
      - "It also shows a banner"
    answer: 1
    explain: "The system treats background pushes as low priority. Apple advises not sending more than two or three an hour; if several arrive while delivery is held, only the newest is kept, and a held one is discarded if the app is force-quit."
  - q: "What is the largest payload APNs accepts for a normal (non-VoIP) notification?"
    options:
      - "256 bytes"
      - "4 KB"
      - "1 MB"
    answer: 1
    explain: "Normal notifications are limited to 4096 bytes (VoIP to 5 KB). Send an ID and let the app fetch the details, or use a notification service extension to download media."
links:
  - { title: "Registering your app with APNs (Apple)", url: "https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns" }
  - { title: "Sending notification requests to APNs (Apple)", url: "https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns" }
  - { title: "Pushing background updates to your app (Apple)", url: "https://developer.apple.com/documentation/usernotifications/pushing-background-updates-to-your-app" }
  - { title: "Generating a remote notification (Apple)", url: "https://developer.apple.com/documentation/usernotifications/generating-a-remote-notification" }
---
A push notification travels through three parties: your **app**, which registers with Apple Push Notification service and gets a device token; your **provider** (your server), which stores tokens and decides what to send; and **APNs**, which keeps a persistent connection to every device and delivers. Your app never talks to APNs about delivery, and your server never talks to the phone directly.

## 1. The app registers

Enable the Push Notifications capability (it adds the `aps-environment` entitlement), ask permission to show alerts, and register on every launch:

```swift
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication,
                     didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        app.registerForRemoteNotifications()   // token arrives below; no prompt for this part
        return true
    }

    func application(_ app: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        let hex = token.map { String(format: "%02x", $0) }.joined()
        Task { try? await API.shared.upload(pushToken: hex) }
    }
}

// Separately, before showing alerts:
let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
```

The token identifies this app on this device. It changes when the app is reinstalled, the device is restored from backup or moved to a new phone, so Apple says not to cache it: ask for it on each launch and send it to your server when it changes. Getting a token doesn't need the user's permission; showing alerts does, and a background push works without it.

## 2. The provider sends

Your server opens an HTTP/2 connection to `api.push.apple.com` (or `api.sandbox.push.apple.com` for development builds) and POSTs JSON to `/3/device/<token>`. It authenticates either with a **token**: a JWT signed with ES256 using a `.p8` key from your developer account, renewed at least once an hour (but not more often than every 20 minutes), and one key can serve several of your apps; or with a per-app **certificate** that expires and must be replaced. Useful headers include `apns-push-type` (`alert`, `background` and others), `apns-priority`, `apns-expiration`, and `apns-collapse-id` to replace an earlier notification instead of stacking a new one.

```json
{
  "aps": {
    "alert": { "title": "Order shipped", "body": "Arriving Thursday" },
    "badge": 1,
    "sound": "default"
  },
  "orderID": "A1234"
}
```

Your own keys go next to `aps`, never inside it. The whole payload is limited to 4 KB, so send identifiers, not documents. Delivery is best effort: for an offline device APNs stores one notification per app, usually the latest (for up to 30 days, depending on `apns-expiration`), it may reorder notifications, and a 410 response means the token is dead and should be deleted.

## 3. The device handles it

- **Alert pushes** are shown by the system even if your app isn't running. `UNUserNotificationCenterDelegate` tells you when one arrives in the foreground or is tapped. Add `"mutable-content": 1` and a notification service extension to change the content before display, for example to decrypt it or attach an image.
- **Background pushes** have only `"content-available": 1` in `aps`, with push type `background` and priority 5. They wake the app in the background with about 30 seconds of runtime, but are low priority, may be delayed or coalesced, and are throttled if you send more than a few an hour.

On the server side, one domain event ("order shipped") usually fans out to many devices and channels; that is a publish/subscribe problem you solve before you ever call APNs.
