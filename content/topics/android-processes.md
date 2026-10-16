---
id: android-processes
title: Processes and why your app is killed
summary: One Linux process, ranked and reclaimed by the system
why: "Android kills app processes routinely to free memory, without asking. An app that assumes it keeps running loses the user's work; one that expects to die restores it."
lesson: diagram   # the flow diagram block at the end is the lesson
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

```trace diagram
id: process-death
title: Killed in the background, restored on return
subtitle: The importance ranking and process death
direction: DOWN
elements:
  - { id: fg, label: Your app in use, sub: "foreground: the resumed activity", kind: system, row: 0 }
  - { id: saved, label: Saved state, sub: "Bundle, SavedStateHandle", kind: store, tone: data, row: 1 }
  - { id: cached, label: "Your app, cached", sub: only stopped activities, tone: neutral, row: 1 }
  - { id: pressure, label: Memory needed, sub: lowest importance goes first, kind: system, tone: external, row: 2 }
  - { id: killed, label: Process killed, sub: "a signal, no callback", kind: external, row: 3 }
  - { id: service, label: Service process, sub: "startService(), still running", row: 3 }
  - { id: visible, label: Visible process, sub: "on screen, not in focus", row: 3 }
  - { id: lost, label: Lost, sub: "statics, singletons, ViewModels", kind: external, row: 4 }
  - { id: newproc, label: New process, sub: user taps it in Recents, kind: person, row: 4 }
  - { id: recreate, label: Activity recreated, sub: from the saved Bundle, row: 5 }
edges:
  - { id: leave, from: fg, to: cached, label: user leaves }
  - { id: save, from: fg, to: saved, label: "onStop: save", style: dashed, flow: data }
  - { id: rank, from: cached, to: pressure }
  - { id: kill, from: pressure, to: killed, label: first }
  - { id: next, from: pressure, to: service, label: next, style: dashed, flow: main }
  - { id: rarely, from: pressure, to: visible, label: rarely, style: dotted, flow: main }
  - { id: gone, from: killed, to: lost, style: dashed, flow: main }
  - { id: back, from: killed, to: newproc, label: user returns }
  - { id: create, from: newproc, to: recreate }
  - { id: restore, from: saved, to: recreate, label: restore, style: dotted, flow: data }
steps:
  - caption: "Android starts your app's Linux process when one of its components is needed. While the user is in your app, the process is foreground, and it is killed only as a last resort."
    focus: [fg]
  - caption: "The user presses Home. Your activity is stopped and saves its instance state. With nothing else running, your process is now cached."
    trace: [leave, save]
  - caption: "Later another app needs memory. The system frees it by killing processes, ranked by how much the user would miss them."
    trace: [rank]
  - caption: "Cached processes go first. Service processes come next, though one that has run for 30 minutes or more may be demoted to cached. Visible ones are killed only to keep the foreground running."
    focus: [pressure, killed, service, visible]
    trace: [next, rarely]
  - caption: "So your cached process is killed. It is a plain signal to the process: no onDestroy, no other callback."
    trace: [kill]
  - caption: "Everything that lived only in memory goes with it: static fields, singletons, ViewModels, running coroutines."
    trace: [gone]
  - caption: "Your app is still in Recents, so the user taps it. Android starts a fresh process and creates your Application again."
    trace: [back]
  - caption: "Then it recreates the top activity and hands it the saved Bundle. Done right, the user never notices the process died."
    trace: [create, restore]
note: "Simulate it: background the app, run adb shell am kill <package>, then reopen it from Recents."
```
