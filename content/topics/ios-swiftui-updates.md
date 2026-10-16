---
id: ios-swiftui-updates
title: How SwiftUI updates views
summary: State, identity and what triggers a redraw
why: "Most SwiftUI bugs (lost state, views that don't refresh, slow lists) come from misunderstanding identity and dependencies, not from the layout code."
requires: [ios-main-thread]
lesson: none
points:
  - { title: Views are values, text: "A View struct is a cheap description; SwiftUI keeps the real, long-lived state elsewhere and calls body again when it needs a new description." }
  - { title: Identity decides lifetime, text: "State lives as long as the view's identity: its place in the hierarchy, or the id you give it." }
  - { title: Reads are dependencies, text: "Since iOS 17, a view depends on exactly the @Observable properties its body reads, and nothing else." }
quiz_hint: Ask what body actually read, and whether the view kept its identity.
quiz:
  - q: "With an @Observable model, a view's body shows only book.title. Another view changes book.isAvailable. Does the first view's body run again?"
    options:
      - "Yes, any change to the object invalidates every view holding it"
      - "No, it depends only on the properties its body read"
      - "Only if the view stores the book with @State"
    answer: 1
    explain: "Observation tracks property reads during body. Only title was read, so only a change to title invalidates this view. With the older ObservableObject, any @Published change would have."
  - q: "A screen shows `if loggedIn { ProfileView() } else { LoginView() }`. What happens to ProfileView's @State when loggedIn flips to false and back?"
    options:
      - "It is kept, because the type is the same"
      - "It is reset, because the view was removed and a new one with a new identity was inserted"
      - "SwiftUI asks which one to keep"
    answer: 1
    explain: "Each branch of the if has its own structural identity. When the branch goes away, its view and its state are destroyed; coming back creates fresh state."
  - q: "A child view must edit a property of an @Observable model it receives. What do you write in the child?"
    options:
      - "@State var model: Model"
      - "@Bindable var model: Model, then pass $model.name to the control"
      - "@Binding var model: Model"
    answer: 1
    explain: "@Bindable (iOS 17) creates bindings to the properties of an observable object you were given. @State would make the child the owner of a new source of truth; @Binding is for a value owned elsewhere."
links:
  - { title: "Managing model data in your app (Apple)", url: "https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app" }
  - { title: "Migrating from ObservableObject to the Observable macro (Apple)", url: "https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro" }
  - { title: "Demystify SwiftUI (WWDC21)", url: "https://developer.apple.com/videos/play/wwdc2021/10022/" }
  - { title: "Discover Observation in SwiftUI (WWDC23)", url: "https://developer.apple.com/videos/play/wwdc2023/10149/" }
---
A SwiftUI `View` is a small struct that describes what should be on screen. SwiftUI creates and throws these structs away constantly; the things that last are the **identity** it assigns to each view, the **state** it stores for that identity, and the **dependencies** it records while `body` runs. When a dependency changes, SwiftUI marks the view invalid, calls its `body` again on the main thread, compares the result with the last one and updates only what differs.

## Identity: which view is "the same" view

SwiftUI gives every view an identity in one of two ways:

- **Structural**: its position and type in the view tree. The two branches of an `if` are different views, even if both show a `Text`.
- **Explicit**: an `id`, as in `ForEach(items, id: \.id)` or `.id(value)`.

State is tied to identity. As long as the identity stays, `@State` keeps its value however often the struct is recreated. When the identity ends (the branch disappears, or the `.id` changes), the state is destroyed and any `.task` attached to the view is cancelled. Give list rows stable ids taken from your data, not array indices or fresh `UUID()`s, or every reload throws the row state away.

## Where truth lives

```swift
@Observable final class Library {          // iOS 17+: the Observation framework
    var books: [Book] = []
    var filter = ""
}

struct LibraryScreen: View {
    @State private var library = Library()  // this view owns it
    var body: some View {
        BookList(library: library)          // plain property: read-only use
        FilterField(library: library)
    }
}

struct FilterField: View {
    @Bindable var library: Library           // to make bindings to its properties
    var body: some View { TextField("Filter", text: $library.filter) }
}

struct PlusOneButton: View {
    @Binding var count: Int                  // a value owned by someone else
    var body: some View { Button("+1") { count += 1 } }
}
```

- `@State`: storage this view owns, for values or (since iOS 17) an `@Observable` object. Keep it `private`. Note that the default value is created each time the view struct is initialised, even though SwiftUI keeps only the first one; avoid expensive work there and defer it to `.task`.
- `@Binding`: read and write access to a value owned by an ancestor.
- `@Bindable`: bindings to the properties of an `@Observable` object you were handed.
- `@Environment`: values and objects passed down the tree without threading them through every initialiser, for example `.environment(library)` and `@Environment(Library.self)`.

## Invalidation: what triggers body

Before iOS 17, models adopted `ObservableObject` with `@Published` properties, and a view holding one (`@StateObject`, `@ObservedObject`) was invalidated when **any** published property changed. The `@Observable` macro, introduced with iOS 17, changed the rule: SwiftUI records which properties `body` actually reads and invalidates the view only when one of those changes. A list row that reads `book.title` doesn't redraw when `book.isAvailable` changes. Observation also tracks optionals and collections of objects, which `ObservableObject` couldn't.

Two practical consequences:

- Small views are cheaper. Splitting a big `body` into subviews narrows what each one depends on, so fewer of them run on each change.
- `body` must be fast and free of side effects. It can run often and at times you don't choose; start work in `.task` or in response to events instead.

Both systems work side by side, so existing `ObservableObject` code can migrate one type at a time.
