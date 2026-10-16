---
id: android-viewmodel
title: ViewModel and state that survives
summary: Outlive rotation in memory, outlive death in saved state
why: "A ViewModel keeps screen state through configuration changes but not through process death. SavedStateHandle and disk cover the rest, and choosing the right one per value is most of the job."
requires: [android-lifecycle, android-coroutines]
lesson: none
points:
  - { title: "Scoped to a screen", text: "A ViewModel lives as long as its owner (activity, fragment or navigation entry) is not finished, across any number of recreations." }
  - { title: "Not across process death", text: "When the process is killed the ViewModel is gone. Only saved state and disk come back." }
  - { title: "SavedStateHandle for the small stuff", text: "Ids, queries and filters go in SavedStateHandle; the ViewModel reloads the rest from them." }
quiz:
  - q: The user fills in half a form, switches apps, and the process is killed. Which survives?
    options:
      - Values in the ViewModel's fields
      - Values written to SavedStateHandle (and anything already saved to disk)
      - Values held in remember {}
    answer: 1
    explain: "SavedStateHandle is written into the saved-state Bundle when the app goes to the background and handed back to the new ViewModel after the process restarts. Plain fields and remember are memory only."
  - q: Why shouldn't a ViewModel hold a reference to an Activity or a View?
    options:
      - It makes the ViewModel slower
      - The ViewModel outlives them across recreation, so it would leak the old, destroyed activity
      - ViewModels can't take constructor parameters
    answer: 1
    explain: "After a rotation the ViewModel is handed to the new activity. A reference to the old one keeps its whole view tree in memory. Expose state and let the UI observe it."
  - q: What should go into SavedStateHandle for a search screen showing 200 results?
    options:
      - The 200 results
      - The query (and maybe the selected item id), so the results can be fetched again
      - Nothing; saved state is only for Fragments
    answer: 1
    explain: "Saved state is serialised into a Bundle that passes through the system and should stay small. Store what you need to rebuild the screen and reload the data from the repository."
links:
  - { title: "ViewModel overview (Android Developers)", url: "https://developer.android.com/topic/libraries/architecture/viewmodel" }
  - { title: "Saved State module for ViewModel (Android Developers)", url: "https://developer.android.com/topic/libraries/architecture/viewmodel/viewmodel-savedstate" }
  - { title: "Save UI states (Android Developers)", url: "https://developer.android.com/topic/libraries/architecture/saving-states" }
---
A `ViewModel` is a state holder for one screen that is kept in a store owned by the activity, fragment or navigation back-stack entry. When the activity is recreated for a configuration change, the new instance gets the same ViewModel back, with its state and running coroutines intact. When the owner is finished for good (the user navigates back), the ViewModel is cleared and `viewModelScope` is cancelled.

## What it is for

```kotlin
class OrdersViewModel(
    private val repo: OrdersRepository,
    private val saved: SavedStateHandle,
) : ViewModel() {
    val filter: StateFlow<String> = saved.getStateFlow("filter", "all")

    val orders: StateFlow<List<Order>> = filter
        .flatMapLatest { repo.observe(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun setFilter(value: String) { saved["filter"] = value }
}

@Composable
fun OrdersScreen(vm: OrdersViewModel = viewModel()) {
    val orders by vm.orders.collectAsStateWithLifecycle()
    OrderList(orders)
}
```

The ViewModel exposes state as `StateFlow`, receives events as function calls, and talks to repositories. It must not hold an `Activity`, `View` or composable `Context`: it outlives them, so it would leak them. If it needs resources, inject what it needs or use `AndroidViewModel` with the application context.

With Hilt, `@HiltViewModel` and `hiltViewModel()` supply the constructor arguments; without DI, a `ViewModelProvider.Factory` (or the `viewModelFactory { initializer { ... } }` DSL) does, and `createSavedStateHandle()` gives you the handle.

## The limit: process death

A ViewModel lives in memory. Once the system kills the process in the background, it is gone, and the user coming back gets a brand-new one. That is what `SavedStateHandle` is for: a key-value map that is written into the activity's saved state and given back to the new ViewModel after the process restarts.

```kotlin
val selectedId: String? get() = saved["selectedId"]
fun select(id: String) { saved["selectedId"] = id }
```

Values must be types a `Bundle` can hold (primitives, strings, `Parcelable`s). Recent versions of the lifecycle library also offer a `saved` property delegate that stores `@Serializable` classes via KotlinX Serialization; check that your lifecycle version has it before relying on it.

## Choosing where a value lives

| Value | Put it in |
| --- | --- |
| Scroll position, expanded/collapsed, text field being typed (UI element state) | `rememberSaveable` in the composable |
| Screen inputs: query, filter, selected id | `SavedStateHandle` |
| Loaded data: lists, details | Repository (Room, network), observed by the ViewModel |
| Drafts the user would hate to lose | Disk, saved as they type |

Saved state is a small, serialised snapshot that travels through the system; large `Bundle`s can fail with `TransactionTooLargeException`. Store ids and reload the data.

## Testing the full path

Rotation shows that the ViewModel works. To check saved state, background the app, kill the process (`adb shell am kill <package>`) and reopen it from Recents. `SavedStateHandle` can also be created directly in unit tests with a map of initial values.
