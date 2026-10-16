---
id: android-fcm
title: Push with Firebase Cloud Messaging
summary: A token per install, two kinds of message, and limits on waking up
why: "Push is how a server reaches an app that isn't running. What arrives, whether your code runs, and whether the user sees anything depends on the message type, its priority and the app's state."
requires: [android-background, android-permissions]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "Tokens identify an install", text: "Each app install gets a registration token. Send it to your server, update it in onNewToken, and drop tokens that go stale." }
  - { title: "Notification vs data messages", text: "Notification messages are shown by the system when the app is in the background; data messages always go to your onMessageReceived." }
  - { title: "High priority is for the user", text: "High priority can wake a dozing device, but messages that don't lead to a visible notification get deprioritised." }
quiz:
  - q: The app is in the background and receives a message with both notification and data payloads. What happens?
    options:
      - onMessageReceived() is called with both
      - The system shows the notification; the data arrives in the extras of the launcher activity's intent if the user taps it
      - The message is dropped
    answer: 1
    explain: "In the background, the notification part goes straight to the system tray and onMessageReceived() isn't called. In the foreground, onMessageReceived() gets everything. Send data-only messages if your code must always run."
  - q: Your server sends high-priority data messages that the app processes silently, without showing a notification. What does FCM do over time?
    options:
      - Nothing; high priority is always honoured
      - It may deprioritise them to normal priority, so they wait for Doze maintenance windows
      - It converts them into notification messages
    answer: 1
    explain: "High priority is meant for time-sensitive, user-visible content. FCM looks at recent behaviour per app instance and downgrades messages that don't produce notifications."
  - q: How long should onMessageReceived() take?
    options:
      - As long as it needs; the process stays alive
      - A few seconds at most; schedule anything longer (about 10 seconds or more) with WorkManager
      - Exactly 60 seconds
    answer: 1
    explain: "The message handler runs with a short window. Firebase's own sample hands work that takes 10 seconds or more to WorkManager, which survives the process going away."
links:
  - { title: "Firebase Cloud Messaging (Firebase)", url: "https://firebase.google.com/docs/cloud-messaging" }
  - { title: "Receive messages in an Android app (Firebase)", url: "https://firebase.google.com/docs/cloud-messaging/android/receive-messages" }
  - { title: "Android message priority (Firebase)", url: "https://firebase.google.com/docs/cloud-messaging/android-message-priority" }
  - { title: "Best practices for FCM registration token management (Firebase)", url: "https://firebase.google.com/docs/cloud-messaging/manage-tokens" }
---
Your server can't open a connection to a phone. Firebase Cloud Messaging keeps one shared, battery-friendly connection per device (through Google Play services), and your server sends to it through the FCM HTTP v1 API, addressed to a **registration token** that identifies one install of your app. FCM delivers the message, and the device decides whether your code runs, the system shows a notification, or both.

## Tokens

```kotlin
class PushService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        // A new install, a restored backup, or a token rotation: tell your server.
        enqueueTokenUpload(token)            // via WorkManager, so it survives being offline
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val orderId = message.data["orderId"] ?: return
        if (message.data["kind"] == "sync") {
            enqueueSync(orderId)             // anything slow goes to WorkManager
        } else {
            showOrderNotification(orderId, message.data["title"].orEmpty())
        }
    }
}
```

Tokens change: on reinstall, when app data is cleared, when restored to a new device, and occasionally on their own. Store them with a timestamp, refresh from the app now and then (`FirebaseMessaging.getInstance().token`), and remove tokens your sends report as unregistered. Firebase treats devices that haven't connected for over a month as stale; sending to them wastes quota and distorts delivery numbers.

## Two message types

- **Notification messages** have a `notification` block (title, body, image). When the app is in the background, the FCM SDK posts the notification itself, and tapping it opens your launcher activity. When the app is in the foreground, `onMessageReceived()` gets it and you decide what to show.
- **Data messages** carry only your key-value pairs and always go to `onMessageReceived()` (subject to delivery and priority rules). They give you full control, and full responsibility: you build the notification.

Payloads are limited to 4096 bytes. Send ids, not documents, and fetch the rest.

| App state | Notification | Data | Both |
| --- | --- | --- | --- |
| Foreground | `onMessageReceived` | `onMessageReceived` | `onMessageReceived` |
| Background | System tray | `onMessageReceived` | Tray, data in the launch intent's extras |

## Priority and Doze

**Normal** priority (the default) is delivered straight away when the device is awake, and may wait for a maintenance window in Doze. **High** priority wakes the device, gives the app a short window of processing with limited network access, and allows it to start a foreground service from the background. FCM watches the last 7 days of behaviour per app instance: if high-priority messages don't result in user-visible notifications, later ones may be downgraded to normal. Use high priority for chats and calls, normal for "sync your inbox".

A force-stopped app (from Settings) receives nothing until the user opens it again.

## The user's side

On Android 13+, notifications need the `POST_NOTIFICATIONS` runtime permission; a push that arrives without it is received but not shown. Create notification channels for each kind of message (orders, chat, marketing) so users can mute one without losing the others, and include an idempotency key in the data: messages can be delivered more than once.

```trace diagram
id: fcm-delivery
title: From your server to the notification tray
subtitle: Register, send, deliver
kind: sequence
elements:
  - { id: app, label: App }
  - { id: android, label: Android }
  - { id: fcm, label: FCM, role: external }
  - { id: server, label: Server }
edges:
  - { id: register, from: app, to: android, label: FCM SDK starts }
  - { id: ask, from: android, to: fcm, label: register this install }
  - { id: token, from: fcm, to: app, label: "onNewToken(token)", style: dashed }
  - { id: upload, from: app, to: server, label: store the token }
  - { id: send, from: server, to: fcm, label: "POST messages:send (HTTP v1)" }
  - { id: deliver, from: fcm, to: android, label: "notification, app in background", flow: async }
  - { id: tray, from: android, to: android, label: shown in the system tray }
  - { id: data, from: server, to: fcm, label: "data message, high priority" }
  - { id: wake, from: fcm, to: android, label: wakes a dozing device, flow: async }
  - { id: receive, from: android, to: app, label: "onMessageReceived()", style: dashed, flow: async }
  - { id: gone, from: fcm, to: server, label: 404 UNREGISTERED, style: dashed }
steps:
  - caption: The same three parties as on iOS. Your app gets an address, your server decides what to send, and FCM keeps one shared connection per device through Google Play services.
  - caption: When the app starts, the FCM SDK registers this install with FCM.
    trace: [register, ask]
  - caption: FCM issues a registration token and calls onNewToken, and the app sends it to your server. Tokens change on reinstall, cleared data, restore to a new device and sometimes on their own.
    trace: [token, upload]
  - caption: To push, your server POSTs to the FCM HTTP v1 API, addressed to that token. The payload is at most 4096 bytes, so send ids rather than documents.
    trace: [send]
  - caption: A notification message for an app in the background never reaches your code. The system shows it in the tray, and a tap opens your launcher activity. From Android 13 that needs POST_NOTIFICATIONS.
    trace: [deliver, tray]
  - caption: A data message carries only your key-value pairs. At high priority, FCM delivers it right away and can wake a dozing device; at normal priority it may wait for a Doze maintenance window.
    trace: [data, wake]
  - caption: Data messages always go to onMessageReceived, and so does everything when the app is in the foreground. The window is short, so hand anything over a few seconds to WorkManager.
    trace: [receive]
  - caption: High priority is meant for messages the user sees. Using the last 7 days per app instance, FCM may downgrade high-priority messages that don't lead to a notification.
    focus: [fcm]
  - caption: When a token is no longer valid, the send fails with 404 UNREGISTERED. Delete the token on your server rather than retrying.
    trace: [gone]
note: A force-stopped app receives nothing until the user opens it again.
```
