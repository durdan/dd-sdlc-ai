---
id: swift-property-wrappers
title: "Property wrappers"
summary: "@State and friends: a struct that owns the storage"
why: "Half of SwiftUI's attributes (@State, @Binding, @Environment, @AppStorage) are property wrappers. Writing one yourself shows what the @ actually does and where the $ comes from."
requires: [swift-generics]
lesson: none
points:
  - { title: A wrapper is a type, text: "A @propertyWrapper struct or class with a wrappedValue property; the compiler stores the wrapper and routes reads and writes through it." }
  - { title: "$ is the projected value", text: "If the wrapper has a projectedValue, $name gives access to it: SwiftUI's @State projects a Binding." }
  - { title: "_name is the wrapper itself", text: "The compiler names the hidden stored property _name, which you can use inside the type, for example in init." }
quiz:
  - q: "struct Form { @Clamped(0...10) var rating = 5 }. What does form.rating = 42 store?"
    options:
      - "42"
      - "Whatever Clamped's wrappedValue setter does with 42, for example 10"
      - "It doesn't compile"
    answer: 1
    explain: "Assignments to a wrapped property call the wrapper's wrappedValue setter. The wrapper decides what to store."
  - q: In SwiftUI, what is $isOn when isOn is declared @State var isOn = false?
    options:
      - "A Bool"
      - "A Binding<Bool>: State's projected value"
      - "The State<Bool> wrapper itself"
    answer: 1
    explain: "$ gives the projectedValue, and for State that is a Binding that reads and writes the same storage. The wrapper itself is _isOn."
  - q: "Why is @Observable (Swift 5.9) a macro and not a property wrapper?"
    options:
      - "Macros are faster"
      - "It has to change a whole class: rewrite every stored property and add conformance, which a wrapper on one property can't do"
      - "Property wrappers can't be used on classes"
    answer: 1
    explain: "A property wrapper sees one property. Observation needs to instrument all of them and add members to the type, which needs an attached macro."
links:
  - { title: "Properties: property wrappers (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/properties/" }
  - { title: "SE-0258: Property wrappers (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0258-property-wrappers.md" }
---
A **property wrapper** (Swift 5.1) moves the logic of a stored property, such as validation, storage in `UserDefaults` or change tracking, into a reusable type. You write `@Clamped(0...10) var rating = 5`, and the compiler turns it into a hidden stored property of type `Clamped` plus a computed `rating` that reads and writes through it. There is no runtime magic: it is a source transformation done by the compiler.

## Writing one

```swift
@propertyWrapper
struct Clamped<Value: Comparable> {
    private var value: Value
    let range: ClosedRange<Value>

    init(wrappedValue: Value, _ range: ClosedRange<Value>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }

    var wrappedValue: Value {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }

    var projectedValue: Clamped<Value> { self }     // exposed as $name
}

struct Review {
    @Clamped(1...5) var stars = 3
}

var r = Review()
r.stars = 9
print(r.stars)            // 5
print(r.$stars.range)     // 1...5
```

The compiler expands `@Clamped(1...5) var stars = 3` to roughly:

```swift
private var _stars = Clamped(wrappedValue: 3, 1...5)
var stars: Int {
    get { _stars.wrappedValue }
    set { _stars.wrappedValue = newValue }
}
var $stars: Clamped<Int> { _stars.projectedValue }
```

- **`wrappedValue`** is required. The initial value after `=` is passed as `init(wrappedValue:)`.
- **`projectedValue`** is optional, and is what `$stars` returns. It can be any type.
- **`_stars`** is the wrapper instance, private to the enclosing type.

Wrappers also work on local variables and function parameters (Swift 5.5), not only properties.

## How SwiftUI uses them

SwiftUI views are structs that are recreated constantly, so they can't hold state in ordinary stored properties. `@State` is a property wrapper whose storage lives outside the struct, in SwiftUI's graph, keyed by the view's identity. The wrapper in the struct is a handle to it, and reading `wrappedValue` during `body` is how SwiftUI learns that the view depends on it.

- `@State var isOn = false`: `isOn` is the `Bool`; `$isOn` is the projected `Binding<Bool>`.
- `@Binding var isOn: Bool`: a wrapper around a `Binding` passed in from a parent.
- `@Environment(\.colorScheme) var scheme`: reads a value from the environment.
- `@AppStorage("key")`: reads and writes `UserDefaults`.

## Where wrappers stop and macros start

A wrapper sees only its own property. It can't add members to the enclosing type or look at other properties, and a wrapper on a class property can't easily tell the class that something changed. `@Published` worked around that with a special hook into `ObservableObject`. **Observation** (`@Observable`, SE-0395) took the other route: it is an attached macro that rewrites every stored property of a class and adds the tracking code, which a property wrapper couldn't do. That's the subject of the macros topic.

Property wrappers can't be combined with `lazy`, `weak` or `unowned`, but `willSet` and `didSet` still work on a wrapped property. Stacking several (`@A @B var x`) is allowed: the first one listed is the outermost wrapper.
