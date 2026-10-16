---
id: android-lifecycle
title: The activity lifecycle and configuration changes
summary: Created, started, resumed, and recreated on rotation
why: "Rotating the phone, changing the language or resizing a window destroys and recreates the activity by default. Anything held only in the activity is lost each time."
requires: [android-processes]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - { title: "Six callbacks, three states that matter", text: "Created, started (visible) and resumed (in focus). Pair setup and teardown at the same level: start in onStart, stop in onStop." }
  - { title: "A config change is a new activity", text: "By default the old instance is destroyed and a new one is created with the new resources. Your process stays." }
  - { title: "Three places for state", text: "ViewModel survives the recreation, saved state survives process death too, and disk survives everything." }
quiz:
  - q: "The user rotates the phone. With default settings, what happens to the activity?"
    options:
      - It receives onConfigurationChanged() and keeps running
      - It is destroyed and a new instance is created with the new configuration
      - The whole process is restarted
    answer: 1
    explain: "Rotation is a configuration change. Unless the activity declares it handles that change itself (android:configChanges), Android finishes the old instance and builds a new one so it can load the right resources. The process and any ViewModel survive."
  - q: "Where should you start and stop listening for location updates that only matter while the screen is visible?"
    options:
      - onCreate and onDestroy
      - onStart and onStop
      - onResume and onDestroy
    answer: 1
    explain: "onStart/onStop bracket the time the activity is visible. Starting in onCreate and stopping in onDestroy keeps listening while the app is in the background, and onDestroy may never run if the process is killed."
  - q: "Your app declares android:configChanges=\"orientation|screenSize\". What do you now have to do?"
    options:
      - Nothing; Android handles the rest
      - Update everything that depends on the new configuration yourself, because the activity is not recreated
      - Call recreate() in onConfigurationChanged()
    answer: 1
    explain: "Opting out of recreation means resources are not reloaded for you. Compose reads LocalConfiguration and recomposes, but Views and anything you cached from resources must be refreshed by hand."
links:
  - { title: "The activity lifecycle (Android Developers)", url: "https://developer.android.com/guide/components/activities/activity-lifecycle" }
  - { title: "Handle configuration changes (Android Developers)", url: "https://developer.android.com/guide/topics/resources/runtime-changes" }
  - { title: "Lifecycle-aware components (Android Developers)", url: "https://developer.android.com/topic/libraries/architecture/lifecycle" }
---
An activity is one screen's entry point, and the system moves it through a fixed set of states as the user arrives, leaves and comes back. You don't call these callbacks; you react to them. The most surprising part for newcomers is configuration changes: rotate the screen and, by default, the activity you were in is thrown away and a new one is built.

## The states

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { // created: set up the UI once
        super.onCreate(savedInstanceState)
        setContent { App() }
    }
    override fun onStart() { super.onStart() }     // visible
    override fun onResume() { super.onResume() }   // in front, receiving input
    override fun onPause() { super.onPause() }     // losing focus (dialog, multi-window)
    override fun onStop() { super.onStop() }       // no longer visible
    override fun onDestroy() { super.onDestroy() } // finishing, or being recreated
}
```

Two rules of thumb. First, pair things at the same level: what you start in `onStart` you stop in `onStop`. Second, don't count on `onDestroy`: when the process is killed in the background, it never runs. After `onStop`, assume you may not get another callback.

You rarely override these by hand any more. Lifecycle-aware components observe them for you (`LifecycleObserver`, `repeatOnLifecycle`, `collectAsStateWithLifecycle`), and in Compose most per-screen setup lives in effects.

## Configuration changes

The `Configuration` object holds things resources depend on: orientation, screen size, locale, font scale, dark mode, keyboard. When one changes, the default is to destroy and recreate the activity so the right layouts, strings and dimensions are loaded. On foldables, tablets and desktop windows this happens far more often than on a phone held upright.

What survives the recreation:

| Where | Rotation | Process death |
| --- | --- | --- |
| Fields in the activity, plain `remember` | lost | lost |
| `ViewModel` | kept | lost |
| `rememberSaveable`, `SavedStateHandle` | kept | kept |
| Room, DataStore, files | kept | kept |

You can opt out with `android:configChanges` in the manifest, and then receive `onConfigurationChanged()` instead. That is reasonable for a Compose-only activity, where reading `LocalConfiguration.current` recomposes the affected UI, but you take over responsibility for everything that reads resources, including embedded Views.

**Version note:** starting with Android 17 (API 37) the system no longer recreates activities by default for a handful of changes that rarely need new resources (keyboard, navigation, touchscreen, color mode, and desk UI mode). Apps that relied on a restart for those can opt back in with `android:recreateOnConfigChanges`. Rotation, size and locale still recreate.

## Don't confuse this with process death

A rotation keeps the process; process death doesn't. A screen can pass every rotation test and still lose the user's input after a few minutes in the background. Test both.

```trace diagram
id: rotate-and-leave
title: A rotation, then the Home button
subtitle: Which state survives what
kind: sequence
elements:
  - { id: sys, label: System }
  - { id: act, label: Activity }
  - { id: vm, label: ViewModel }
  - { id: saved, label: Saved state }
edges:
  - { id: launch, from: sys, to: act, label: "onCreate, onStart, onResume" }
  - { id: create, from: act, to: vm, label: "by viewModels(): created" }
  - { id: rotate, from: sys, to: act, label: "rotation: onPause, onStop" }
  - { id: save, from: act, to: saved, label: onSaveInstanceState }
  - { id: destroy, from: sys, to: act, label: "onDestroy, changing configurations" }
  - { id: recreate, from: sys, to: act, label: "new instance: onCreate(bundle)" }
  - { id: reuse, from: vm, to: act, label: same ViewModel, style: dashed }
  - { id: restore, from: saved, to: act, label: state restored, style: dashed }
  - { id: home, from: sys, to: act, label: "Home: onPause, onStop" }
  - { id: save2, from: act, to: saved, label: onSaveInstanceState }
  - { id: kill, from: sys, to: act, label: "process killed: no onDestroy", style: dashed }
  - { id: back, from: saved, to: act, label: "return: new process, new ViewModel", style: dashed }
steps:
  - caption: "The activity is created, started and resumed. The screen asks for its ViewModel, which is created on first use and kept in the activity's ViewModelStore."
    trace: [launch, create]
  - caption: "The user rotates the phone. A rotation is a configuration change, so by default this activity instance is paused and stopped."
    trace: [rotate]
  - caption: "It saves its instance state into a Bundle: rememberSaveable values, SavedStateHandle entries, view state. On Android 9 and later this happens after onStop."
    trace: [save]
  - caption: "Then it is destroyed. isChangingConfigurations is true, so the ViewModel is not cleared. The process doesn't change at all."
    trace: [destroy]
  - caption: "The system immediately creates a new activity instance with the new configuration, so it loads the right layouts and resources."
    trace: [recreate]
  - caption: "The new instance gets the same ViewModel back, with its coroutines still running, and the saved state is restored. Fields of the old activity and plain remember are gone."
    trace: [reuse, restore]
  - caption: "Now the user presses Home. The activity is paused and stopped, not destroyed, and saves its state again. The ViewModel stays in memory."
    trace: [home, save2]
  - caption: "In the background the process may be killed. Neither onDestroy nor the ViewModel's onCleared runs; the ViewModel simply dies with the process."
    trace: [kill]
  - caption: "When the user returns, a new process builds a new activity and a new ViewModel. Only the saved state, and what is on disk, comes back."
    trace: [back]
note: "Rotation keeps the ViewModel; process death keeps only saved state and disk. Test both."
```
