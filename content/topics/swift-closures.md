---
id: swift-closures
title: "Closures and capture lists"
summary: "Escaping or not, captured by reference or by value"
why: "Closures are everywhere in Swift APIs. What they capture, and when, decides what values they see later and what objects they keep alive."
requires: [swift-values]
lesson: none
points:
  - { title: Closures capture variables, text: "A closure captures the variables it uses by reference: it sees later changes, and changes it makes are seen outside." }
  - { title: Capture lists copy at creation, text: "[x] copies the current value of x when the closure is created; [weak self] captures a weak reference instead of a strong one." }
  - { title: Non-escaping by default, text: "A closure parameter can't outlive the call unless it is marked @escaping, which is when capture and lifetime start to matter." }
quiz:
  - q: "var n = 1; let f = { print(n) }; n = 2; f(). What is printed?"
    options:
      - "1"
      - "2"
      - "It doesn't compile"
    answer: 1
    explain: "The closure captures the variable n, not its value at creation. It reads n when it runs, and by then n is 2."
  - q: "var n = 1; let f = { [n] in print(n) }; n = 2; f(). What is printed?"
    options:
      - "1"
      - "2"
      - "nil"
    answer: 0
    explain: "A capture list entry evaluates n when the closure is created and stores that value as an immutable constant inside the closure."
  - q: Why must a completion-handler parameter be marked @escaping?
    options:
      - "Because it is async"
      - "Because it is stored or called after the function returns, so the compiler has to keep it and what it captures alive"
      - "To make it run on the main thread"
    answer: 1
    explain: "Closure parameters are non-escaping by default, which lets the compiler skip heap allocation and makes self captures harmless. Storing one requires @escaping."
links:
  - { title: "Closures (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/closures/" }
  - { title: "Expressions: capture lists (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/expressions/" }
---
A closure is a function value that can use variables from the scope where it was written. Swift functions, nested functions and closure expressions (`{ x in x * 2 }`) are all closures, and all of them are reference types: passing one around shares the same closure and the same captured state. The rules that matter are what gets captured, how, and for how long.

## Capturing variables

```swift
func makeCounter() -> () -> Int {
    var count = 0
    return {                 // captures the variable count, which now outlives makeCounter
        count += 1
        return count
    }
}

let next = makeCounter()
_ = next(); _ = next()
print(next())                // 3

var n = 1
let byReference = { print("by reference:", n) }
let byValue = { [n] in print("by value:", n) }     // capture list: copy n now
n = 2
byReference()                // by reference: 2
byValue()                    // by value: 1
```

By default a closure captures **variables**, not values: it sees later changes to `n`, and if it changes a captured `var`, the outside sees that too. The compiler moves such variables to the heap when a closure escapes with them. A **capture list** `[n]` evaluates `n` when the closure is created and stores that value as a constant inside it.

## Escaping and non-escaping

A closure passed as a parameter is **non-escaping** unless the parameter is marked `@escaping`. A non-escaping closure can only be called during the function call (think `map`, `filter`, `sorted(by:)`, `withAnimation`). The compiler can then keep it and its captures on the stack, and capturing `self` in it can't create a lasting cycle.

```swift
final class Downloader {
    private var handlers: [(String) -> Void] = []
    func onFinish(_ handler: @escaping (String) -> Void) { handlers.append(handler) }   // stored: must escape
    func finish() { handlers.forEach { $0("done") } }                                  // forEach: non-escaping
}
```

An `@escaping` closure lives as long as whoever stores it, along with everything it captured strongly. In a class, using a property or method inside an escaping closure needs an explicit `self.` (or `[self]` in the capture list), so the capture is visible; for a struct, `self` is captured as a copy and implicit `self` is allowed.

## Capture lists and references

For reference types, a capture list chooses the kind of reference: `[weak self]` (optional, becomes `nil` when the object is freed), `[unowned self]` (non-optional, traps if used after), or `[self]` (strong, but written out). Breaking reference cycles with these is covered in the iOS path's ARC topic. From the language side the key points are:

- A capture list entry is evaluated **once**, at creation. `[weak delegate = self.delegate]` captures whatever the delegate was then.
- `[weak self]` only helps if no other strong path leads back: a captured property that itself holds `self` still keeps it alive.
- Values in a capture list are copied: a captured struct is a snapshot.

## Closures and concurrency

In Swift 6, a closure that may run concurrently is `@Sendable` (or passed as `sending`): it may only capture values that are safe to share, and can't capture mutable local variables by reference. `Task { }` takes such a closure, which is why mutating a local `var` from inside a `Task` is a compile error rather than a data race. Closures also inherit the actor isolation of where they were written, which the concurrency topic explains.

Trailing closure syntax (`items.sorted { $0 < $1 }`, and several labelled trailing closures since Swift 5.3) is pure syntax: the closure is still a normal argument.
