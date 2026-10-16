---
id: android-permissions
title: The permissions model
summary: Ask at the moment of use, expect a no, and need less
why: "Users can deny, revoke or grant 'only this time', and Android keeps narrowing what an app can see. A feature that assumes a permission breaks; one that asks in context and degrades gracefully keeps working."
requires: [android-lifecycle]
lesson: none
points:
  - { title: "Install-time vs runtime", text: "Normal permissions (like INTERNET) are granted on install. Dangerous ones (camera, location, contacts, notifications) need a runtime prompt." }
  - { title: "Two denials mean never", text: "From Android 11, denying the same permission twice stops the dialog appearing; only Settings can grant it after that." }
  - { title: "Prefer no permission at all", text: "The photo picker, the document picker and scoped storage let you reach the user's files without broad storage permissions." }
quiz:
  - q: Your app targets Android 13 and wants to show notifications. What is needed?
    options:
      - Nothing; notifications are always allowed
      - Declare POST_NOTIFICATIONS and request it at runtime; until it is granted, notifications are not shown
      - Only a notification channel
    answer: 1
    explain: "Android 13 (API 33) made notifications a runtime permission. Apps targeting 13+ choose when to ask; foreground service notifications still appear in the task manager even if denied."
  - q: The user has tapped Deny twice for the camera permission. What happens when you call launch(Manifest.permission.CAMERA) again?
    options:
      - The dialog appears again
      - No dialog appears and the result is immediately 'denied'; you can only point the user to app settings
      - The app crashes
    answer: 1
    explain: "From Android 11, a second denial is treated as 'don't ask again'. Explain why the feature needs it and offer a button that opens your app's settings page."
  - q: The app lets users choose a profile picture. Which approach needs no storage permission?
    options:
      - READ_EXTERNAL_STORAGE and a custom gallery
      - The photo picker (PickVisualMedia)
      - MANAGE_EXTERNAL_STORAGE
    answer: 1
    explain: "The photo picker runs in a system UI and returns only what the user picked. It is available on Android 11+ and, via Google Play services, on older devices."
links:
  - { title: "Permissions on Android (Android Developers)", url: "https://developer.android.com/guide/topics/permissions/overview" }
  - { title: "Request runtime permissions (Android Developers)", url: "https://developer.android.com/training/permissions/requesting" }
  - { title: "Notification runtime permission (Android Developers)", url: "https://developer.android.com/develop/ui/compose/notifications/notification-permission" }
  - { title: "Photo picker (Android Developers)", url: "https://developer.android.com/training/data-storage/shared/photo-picker" }
---
Every permission you use is declared in the manifest, but declaring is only half of it. **Normal** permissions, which carry little risk (internet, vibration), are granted at install. **Dangerous** (runtime) permissions, which touch private data or hardware (camera, microphone, location, contacts, notifications), are granted by the user, at run time, one group at a time, and can be revoked whenever they like.

## The request flow

```kotlin
@Composable
fun ScanButton(onScan: () -> Unit) {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) onScan() else showWhyWeNeedTheCamera()
    }
    Button(onClick = {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            onScan()
        } else {
            launcher.launch(Manifest.permission.CAMERA)
        }
    }) { Text("Scan") }
}
```

Good practice, in short: ask when the user starts the feature that needs it (not on first launch), check first, show an explanation when `shouldShowRequestPermissionRationale()` returns true, and keep the rest of the app working if the answer is no.

Things that changed across versions:

- **Android 11 (API 30):** denying a permission twice counts as "don't ask again". Location, microphone and camera offer "Only this time". Unused apps have their runtime permissions reset after a few months.
- **Android 12 (API 31):** the user can grant approximate instead of precise location; request both and handle either.
- **Android 13 (API 33):** `POST_NOTIFICATIONS` is a runtime permission, and broad storage reads split into `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` and `READ_MEDIA_AUDIO`.
- **Android 14 (API 34):** for photos and videos, users can grant access to selected items only (`READ_MEDIA_VISUAL_USER_SELECTED`); your app must cope with seeing part of the library.

Background location is a separate, second request, and Play reviews apps that use it.

## Scoped storage

From Android 10, and enforced for apps targeting Android 11+, apps see their own app-specific directories without any permission, and reach shared storage only through `MediaStore` (their own media freely, others' media with a media permission) or the system pickers. `MANAGE_EXTERNAL_STORAGE` exists for file managers and backup apps and is restricted on Play.

```kotlin
val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
    uri?.let(onPicked)                     // no storage permission required
}
pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
```

## Notifications on Android 13+

For apps targeting 13 or higher, you decide when the notification prompt appears, so tie it to a moment that explains the value ("Tell me when my order ships"). If the app targets 12L or lower, the system asks on its own when the app creates its first notification channel. Check `NotificationManagerCompat.areNotificationsEnabled()` before relying on pushes being seen.
