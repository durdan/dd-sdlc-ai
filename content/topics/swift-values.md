---
id: swift-values
title: "Value and reference types"
summary: "struct copies, class shares, copy-on-write in between"
why: "Whether a type is a struct or a class decides what assignment means. Most surprising Swift bugs (a change that didn't stick, or one that showed up somewhere else) come from mixing the two up."
lesson: none
points:
  - { title: Structs and enums are values, text: "Assigning or passing a value gives the receiver its own copy; changing one copy never changes another." }
  - { title: Classes are references, text: "Assigning a class instance copies the reference: both names point at the same object, which is counted by ARC." }
  - { title: Copy-on-write makes copies cheap, text: "Array, Dictionary, Set and String share storage until one copy is changed, so copying is O(1) until a write." }
  - { title: let means different things, text: "A let struct can't change at all; a let class reference can't be reassigned, but the object's var properties can." }
quiz:
  - q: "struct Point { var x = 0 }. var a = Point(); var b = a; b.x = 5. What is a.x?"
    options:
      - "5"
      - "0"
      - "It doesn't compile"
    answer: 1
    explain: "b = a copies the value, so b is independent. With class Point instead, both names would refer to one object and a.x would be 5."
  - q: "var a = [1, 2, 3]; var b = a. When is the array's storage actually copied?"
    options:
      - "On the assignment b = a"
      - "When a or b is first mutated while the storage is still shared"
      - "Never; both always share it"
    answer: 1
    explain: "Standard library collections use copy-on-write: the assignment shares the buffer and bumps a reference count; the first write to a shared buffer copies it."
  - q: "A struct has a property of a class type. What does copying the struct do to that object?"
    options:
      - "Copies the object too"
      - "Copies only the reference, so both struct copies share the same object"
      - "It is not allowed"
    answer: 1
    explain: "Value semantics are only as deep as the stored properties. A class inside a struct is still shared, unless you implement copy-on-write for it yourself."
links:
  - { title: "Structures and classes (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/" }
  - { title: "Optimization tips: copy-on-write for large values (swiftlang/swift)", url: "https://github.com/swiftlang/swift/blob/main/docs/OptimizationTips.rst" }
---
Swift has two kinds of types. **Value types** (`struct`, `enum`, tuples, and almost the whole standard library: `Int`, `String`, `Array`, `Dictionary`) are copied when assigned or passed. **Reference types** (`class`, `actor`, closures) are shared: assignment copies a pointer to one object, managed by reference counting. Swift's style leans heavily on values, because a value can't be changed behind your back.

## The difference in four lines

```swift
struct PointValue { var x = 0 }
final class PointObject { var x = 0 }

var v1 = PointValue(); var v2 = v1; v2.x = 5
let o1 = PointObject(); let o2 = o1; o2.x = 5

print(v1.x, v2.x)   // 0 5: two independent values
print(o1.x, o2.x)   // 5 5: one shared object
print(o1 === o2)    // true: identity exists only for references
```

Note `let o1` and `o2.x = 5`: `let` on a class reference only fixes which object it points at. On a struct, `let` freezes every stored property, and methods that change a struct must be marked `mutating`.

## Copy-on-write

Copying a 10,000-element array on every assignment would be slow, so the standard library collections and `String` use **copy-on-write**: the value holds a reference to a heap buffer, a copy shares that buffer, and the first mutation of a shared buffer makes a private copy.

```swift
var a = Array(repeating: 0, count: 10_000)
var b = a            // O(1): same buffer, reference count is now 2
b[0] = 1             // the buffer is shared, so b copies it first, then writes
print(a[0], b[0])    // 0 1
```

Your own structs don't get this automatically. A struct holding a class instance copies the reference, so two struct copies share one object. To give such a type value semantics, implement copy-on-write yourself: keep the class private, and before each mutation check `isKnownUniquelyReferenced(&storage)`, copying the storage if it returns `false`.

## Choosing

- Use a **struct** by default: models, configuration, view state, anything that is data. Equality means "same contents", which you get for free with `Equatable`.
- Use a **class** when identity matters (one shared cache, a connection, a view controller), when you need inheritance or `deinit`, or when interoperating with Objective-C APIs that expect objects.
- Use an **actor** when a reference type has mutable state that several tasks will touch (see the concurrency topic).

## Costs to know

Values are not automatically on the stack: a struct inside an array, an existential, or a closure capture lives on the heap. Large structs are copied in pieces, and every `String`, `Array` or class inside one adds reference-counting traffic. In return the compiler can often skip copies (passing a value as a parameter is a borrow, not a copy) and has no shared mutable state to worry about, which is also what makes value types easy to send between threads in Swift 6.
