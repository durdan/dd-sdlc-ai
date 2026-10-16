---
id: android-processes
title: Processes and why your app is killed
summary: One Linux process, ranked and reclaimed by the system
why: "Android kills app processes routinely to free memory, without asking. An app that assumes it keeps running loses the user's work; one that expects to die restores it."
lesson: none
points:
  - { title: "The system owns the process", text: "Android starts your process when one of its components is needed and may end it whenever memory is short, with no callback." }
  - { title: "Importance decides who goes first", text: "Foreground beats visible, visible beats a started service, and cached processes are killed first and often." }
  - { title: "Plan for coming back", text: "When the user returns, Android starts a new process and recreates the screen; anything that only lived in memory is gone." }
quiz_hint: Think about which process the user would notice losing.
quiz:
  - q: The user is watching a video in another app. Your app is in the background with no running services. How is your process ranked?
    options:
      - Foreground, because it was used a minute ago
      - Cached, so it is among the first to be killed when memory is needed
      - Visible, because it still appears in Recents
    answer: 1
    explain: "A process holding only stopped activities is cached. Appearing in Recents doesn't protect it; the system kills cached processes routinely and recreates the screen if the user comes back."
  - q: Which callback reliably runs just before the system kills your process for memory?
    options:
      - onDestroy()
      - onTrimMemory()
      - None. The process can be killed without any further callback
    answer: 2
    explain: "A low-memory kill is a signal to the Linux process; no code of yours runs. That is why state must be saved when the app goes to the background (onStop and saved instance state), not at death."
  - q: Why does a long-running started service (without startForeground) not keep your app alive for good?
    options:
      - Services that run for a long time (around 30 minutes or more) can be demoted towards the cached list
      - Started services are always killed after 60 seconds
      - Services run in a separate process that is never ranked
    answer: 0
    explain: "The process lifecycle guide notes that long-running services may lose importance so a leaking service can't hold memory forever. Work the user cares about belongs in WorkManager or a foreground service."
links:
  - { title: "Processes and app lifecycle (Android Developers)", url: "https://developer.android.com/guide/components/activities/process-lifecycle" }
  - { title: "Processes and threads overview (Android Developers)", url: "https://developer.android.com/guide/components/processes-and-threads" }
  - { title: "Manage your app's memory (Android Developers)", url: "https://developer.android.com/topic/performance/memory-management" }
---
Every Android app runs in its own Linux process with its own runtime (ART). You never start or stop that process yourself: the system creates it when one of your components (an activity, a service, a broadcast receiver, a content provider) is needed, and it ends it when it wants the memory back. The process's lifetime is decided by what the user is doing, not by your code.

## The importance ladder

When memory runs low the system picks victims by importance, roughly in this order from safest to most at risk:

1. **Foreground**: an activity the user is interacting with (resumed), a broadcast receiver running `onReceive()`, a service in the middle of a lifecycle callback, or a foreground service.
2. **Visible**: an activity on screen but not in focus (behind a dialog, or in multi-window), or a service the system uses for a feature the user sees, such as a live wallpaper or keyboard.
3. **Service**: a service started with `startService()`. Kept unless memory is needed for the two levels above, but a service that has run for a long time can be demoted.
4. **Cached**: nothing the user needs right now, typically only stopped activities. The system keeps several around for quick switching and kills them freely.

The kill is a plain signal to the process. `onDestroy()` is not called, and neither is anything else.

## What a kill looks like to your code

From the user's side nothing happened: your app is still in Recents. When they tap it, Android starts a fresh process, creates your `Application`, and recreates the top activity with the `Bundle` it saved earlier. Static fields, singletons, in-memory caches and running coroutines are all gone.

```kotlin
object Session {
    // Lost on process death: the user returns to a screen that expects this to be set.
    var currentCart: Cart? = null
}
```

The fix is not to fight the system but to keep state somewhere that survives: small UI state in saved state (`rememberSaveable`, `SavedStateHandle`), real data on disk (Room, DataStore), and pending work in WorkManager.

## Testing it

Rotating the device does not test process death; the process survives a rotation. To simulate the real thing, put the app in the background and run:

```sh
adb shell am kill com.example.app   # only kills a process that is in the background
```

Then reopen it from Recents. Developer options also has "Don't keep activities", which destroys activities on leaving them (not quite the same as a process kill, but it exercises the restore path).

## Listening for pressure

`ComponentCallbacks2.onTrimMemory()` tells you when the system is under pressure or your UI has been hidden (`TRIM_MEMORY_UI_HIDDEN`), which is a good moment to drop caches. It is a hint, not a promise: a process can be killed without seeing any level first.
