---
id: ios-arc
title: Memory with ARC
summary: Reference counts, cycles, weak and unowned
why: "Swift has no garbage collector to find cycles for you. Two objects that hold each other strongly stay in memory until the app dies."
lesson: none
points:
  - { title: "Counted, not collected", text: "Each class instance has a count of strong references; it is freed the moment the count reaches zero." }
  - { title: Cycles leak, text: "If A holds B and B holds A, neither count reaches zero, even when nothing else uses them." }
  - { title: Break one link, text: "Make one side weak (it may outlive you, becomes nil) or unowned (it never outlives you)." }
quiz:
  - q: "A view controller stores a closure in a property, and the closure calls self.reload(). What happens when the screen is dismissed?"
    options:
      - "The controller is freed as usual"
      - "Neither is freed: the controller holds the closure and the closure holds the controller"
      - "Swift detects the cycle and frees both at the next collection"
    answer: 1
    explain: "Closures capture self strongly by default. Since the controller keeps the closure alive, the two form a cycle. Capture [weak self] to break it."
  - q: "What happens if you access an unowned reference after its object was freed?"
    options:
      - "It returns nil"
      - "A runtime error: the app traps"
      - "It silently reads stale memory"
    answer: 1
    explain: "Safe unowned references are checked: using one after the object is gone stops the program. Only unowned(unsafe) skips the check and reads freed memory."
  - q: "Which of these does NOT create a retain cycle?"
    options:
      - "A delegate property declared as a strong reference back to its owner"
      - "A Timer with a closure capturing self strongly, stored on self"
      - "A non-escaping closure passed to map that uses self"
    answer: 2
    explain: "A non-escaping closure only lives for the duration of the call, so it can't keep self alive afterwards. The other two keep a strong path back to the owner."
links:
  - { title: "Automatic Reference Counting (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/" }
  - { title: "Gathering information about memory use (Apple)", url: "https://developer.apple.com/documentation/xcode/gathering-information-about-memory-use" }
---
Swift manages the memory of class instances (and actors and closures) with **automatic reference counting**. The compiler inserts the retain and release calls for you: every strong reference adds one to an object's count, and when the count drops to zero the object is deinitialised and freed immediately. Structs and enums are values and are copied rather than counted, which is one reason Swift code leans on them.

## When counting isn't enough

Reference counting is predictable (no pauses, `deinit` runs at a known moment), but it has one blind spot: a **strong reference cycle**. If two objects hold strong references to each other, both counts stay above zero after everyone else lets go, and the pair leaks.

```swift
final class Owner {
    var pet: Pet?
    deinit { print("Owner freed") }
}

final class Pet {
    weak var owner: Owner?      // weak: doesn't keep the owner alive
    deinit { print("Pet freed") }
}
```

Swift's two tools for breaking the cycle:

- **`weak`**: doesn't add to the count, must be an optional `var`, and is set to `nil` automatically when the object goes away. Use it when the other object can disappear first: delegates, parents seen from children, observers.
- **`unowned`**: doesn't add to the count and is not optional. Use it only when the other object always lives at least as long as this one, like a credit card pointing at its customer. Touching it after the object is gone is a runtime trap, not a `nil`.

## Closures capture

The most common leak in iOS code is a stored closure that uses `self`:

```swift
final class FeedViewModel {
    var onUpdate: (() -> Void)?
    private var timer: Timer?

    func start() {
        // Without [weak self], the timer keeps the closure, the closure keeps self,
        // and self keeps the timer: nothing is ever freed.
        timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.refresh()
        }
    }

    func refresh() { onUpdate?() }
    deinit { timer?.invalidate() }
}
```

A closure that escapes (is stored, or runs later) captures every reference it mentions strongly unless you write a **capture list** such as `[weak self]` or `[unowned self]`. Non-escaping closures (`map`, `filter`, `withAnimation`) are safe, because they finish before the call returns.

Tasks in Swift concurrency capture too. A `Task { await self.load() }` holds `self` until the task ends, which is usually fine for short work but keeps an object alive for the whole length of an endless `for await` loop. Keep a handle to such tasks and cancel them when the owner goes away.

## Finding leaks

Add a `deinit` with a print while developing: if dismissing a screen doesn't print, something still holds it. Xcode's **Memory Graph Debugger** shows every live object and the references that keep it alive, and Instruments' Leaks and Allocations templates track growth over time. SwiftUI views are structs, so cycles there usually live in the models and the closures they store.
