---
id: swift-generics
title: "Generics, associated types, some and any"
summary: "Opaque types fix one type; existentials box any"
why: "SwiftUI's some View, any Shape in an array and <T: Shape> look alike but compile to different things. Knowing which is which explains both compiler errors and performance."
requires: [swift-protocols]
lesson: none
points:
  - { title: Generics are resolved per call, text: "func f<T: Shape>(_ x: T) works with one concrete T per call, known to the compiler, often specialised away." }
  - { title: Associated types, text: "A protocol can leave a type open (Collection's Element), filled in by each conforming type." }
  - { title: "some is one hidden type", text: "An opaque type means a specific type the compiler knows but the caller doesn't see; it stays the same type every time." }
  - { title: "any is a box", text: "An existential any Shape can hold a different conforming type each time, at the cost of a box and dynamic dispatch." }
quiz:
  - q: "func makeShape(flag: Bool) -> some Shape { if flag { return Circle() } else { return Square() } }. Does it compile?"
    options:
      - "Yes"
      - "No: an opaque return type must be one concrete type on every path"
      - "Only in Swift 5 mode"
    answer: 1
    explain: "some Shape stands for a single hidden type. To return different types, return any Shape (a box), or wrap them in an enum or a type-erasing struct."
  - q: "What is the difference between func area(_ s: some Shape) and func area(_ s: any Shape)?"
    options:
      - "None"
      - "The some version is generic (one concrete type per call, statically known); the any version takes a box that can hold any conforming type"
      - "The any version is faster"
    answer: 1
    explain: "some in parameter position (Swift 5.7) is shorthand for <T: Shape>. any Shape is an existential container, unboxed at runtime, with dynamic dispatch."
  - q: Why can [any Shape] hold a Circle and a Square while [some Shape] can't?
    options:
      - "Arrays only support existentials"
      - "some means one fixed concrete type for the whole array, while any lets each element have its own type"
      - "It can; they are the same"
    answer: 1
    explain: "A heterogeneous collection needs boxes. some fixes a single underlying type, which is what makes it efficient and why it can't mix types."
links:
  - { title: "Generics (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics/" }
  - { title: "Opaque and boxed protocol types (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/opaquetypes/" }
  - { title: "SE-0335: Introduce existential any (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0335-existential-any.md" }
  - { title: "SE-0346: Primary associated types (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0346-light-weight-same-type-syntax.md" }
---
Swift has three ways to write "something that conforms to `Shape`", and they mean different things. A **generic parameter** `<T: Shape>` is one concrete type chosen by the caller. An **opaque type** `some Shape` is one concrete type that is hidden from whoever reads the signature. An **existential** `any Shape` is a box that can hold a value of any conforming type, and a different one each time.

## Generics and associated types

```swift
protocol Shape { var area: Double { get } }
struct Square: Shape { var side: Double; var area: Double { side * side } }
struct Circle: Shape { var r: Double; var area: Double { 3.14159 * r * r } }

func largest<T: Shape>(_ items: [T]) -> T? { items.max { $0.area < $1.area } }

protocol Store {
    associatedtype Item                      // each conforming type decides
    func load() -> [Item]
}
struct NumberStore: Store { func load() -> [Int] { [3, 1, 2] } }   // Item is inferred as Int

func first<S: Store>(of store: S) -> S.Item? { store.load().first }

print(largest([Square(side: 1), Square(side: 3)])?.side ?? 0)   // 3.0
print(first(of: NumberStore()) ?? 0)                             // 3
```

The compiler type-checks generic code once, and can **specialise** it for concrete types, so a generic function is usually as fast as a hand-written one. An `associatedtype` is a placeholder in a protocol, like `Element` in `Collection` or `Body` in SwiftUI's `View`. Since Swift 5.7, protocols can declare **primary associated types**, which allows `some Collection<Int>` and `any Store<String>`-style constraints in angle brackets.

## some: opaque types

```swift
func makeShape() -> some Shape { Circle(r: 1) }      // caller sees "some Shape", compiler knows Circle

func describe(_ s: some Shape) -> String {           // Swift 5.7: same as <T: Shape>
    "area \(s.area)"
}
print(describe(makeShape()))
```

In **return position**, `some Shape` lets a function hide its concrete type while keeping it fixed: every path must return the same type, and the compiler keeps full type information, so there is no box. This is what `var body: some View` is: a deeply nested generic type that nobody wants to write out. In **parameter position**, `some Shape` is just shorter syntax for a generic parameter.

## any: existentials

```swift
let mixed: [any Shape] = [Square(side: 2), Circle(r: 1)]   // different types in one array
let total = mixed.reduce(0) { $0 + $1.area }
print(total)
```

`any Shape` is an **existential container**: room for a small value inline (larger ones go to the heap), plus pointers to the type's metadata and witness table. Calls go through the table at runtime. That's the price of heterogeneity. The `any` keyword (Swift 5.6) makes the cost visible; it is required for protocols with associated types or `Self` requirements, and the stricter rule for all protocols is available as the upcoming feature `ExistentialAny` (still opt-in in the Swift 6 language mode). Since Swift 5.7 you can pass an `any Shape` to a function taking `some Shape`: the compiler opens the box for the call.

## Choosing

- Start with **`some`** or generics: one type per call, statically known, fastest.
- Use **`any`** when you really need different types side by side: a heterogeneous array, a stored property that can change type, a plugin list.
- When `some` won't do because paths return different types, consider an enum with one case per type before reaching for `any`.

Swift 6.4 also allows `some Shape?` instead of `(some Shape)?` (SE-0521), a small change that makes optional opaque and existential types easier to write.
