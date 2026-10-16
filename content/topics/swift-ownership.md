---
id: swift-ownership
title: "Ownership: copies, inout, borrowing and ~Copyable"
summary: "What ARC and the compiler do with values you pass around"
why: "Swift copies values and counts references for you, but the rules (exclusive access, when a copy really happens, types that can't be copied) affect correctness and speed. Swift 5.9 and 6 let you spell them out."
requires: [swift-values, swift-closures, ios-arc]
lesson: none
points:
  - { title: The compiler owns the bookkeeping, text: "Every copy of a value that contains references retains them; the optimiser removes most of those retains and releases." }
  - { title: Exclusive access, text: "A variable can't be modified through two paths at once: overlapping inout access is a compile error or a runtime trap." }
  - { title: borrowing and consuming, text: "Parameter modifiers say whether a function only reads a value or takes it over, which decides where copies are needed." }
  - { title: Noncopyable types, text: "A ~Copyable struct or enum has exactly one owner at a time; using it after it has been consumed is a compile error." }
quiz:
  - q: "var x = 1; func addTwice(_ a: inout Int, _ b: inout Int) { a += 1; b += 1 }. What happens with addTwice(&x, &x)?"
    options:
      - "x becomes 3"
      - "A compile error: overlapping accesses to x"
      - "x becomes 2"
    answer: 1
    explain: "inout gives the function exclusive write access for the whole call. Passing the same variable twice would be two simultaneous writes, which the law of exclusivity forbids."
  - q: "struct FileHandle: ~Copyable { ... }. What does let b = a do when a is a FileHandle?"
    options:
      - "Copies the handle"
      - "Moves it: a can't be used afterwards"
      - "It doesn't compile at all"
    answer: 1
    explain: "A noncopyable value has a single owner. Assigning it transfers ownership, and the compiler rejects any later use of a."
  - q: "When does a consuming parameter help?"
    options:
      - "When the function only reads the value"
      - "When the function stores the value or passes it on, so the caller can hand over its copy instead of the function making another"
      - "It never matters"
    answer: 1
    explain: "Initialisers and setters store their arguments, so they consume by default. For other functions that keep the argument, consuming avoids a retain and release, and it is required to take ownership of a noncopyable value."
links:
  - { title: "Memory safety (The Swift Programming Language)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/memorysafety/" }
  - { title: "SE-0390: Noncopyable structs and enums (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0390-noncopyable-structs-and-enums.md" }
  - { title: "SE-0377: borrowing and consuming parameter modifiers (swift-evolution)", url: "https://github.com/swiftlang/swift-evolution/blob/main/proposals/0377-parameter-ownership-modifiers.md" }
---
The iOS path's ARC topic covers how class instances are counted and how cycles leak. This topic looks at the same machinery from the language side: what happens when you copy or pass a value, the rule that keeps two writes from overlapping, and the ownership features (Swift 5.9 and 6) that let you say "this value has one owner" instead of hoping the optimiser figures it out.

## Copies and retains

Copying a struct copies its stored properties. If those include class references, `String`s or arrays, each copy is a retain, and each copy going away is a release. The compiler's ownership analysis removes most of them: passing an argument is a **borrow** by default (the caller keeps ownership, the callee just reads), and the last use of a variable can **move** it instead of copying. That's why a `let` value handed to a function usually costs nothing, and why ARC traffic is mostly a problem in hot loops over values full of references.

## Exclusive access

Swift enforces a **law of exclusivity**: while a variable is being modified (an `inout` argument, a `mutating` method, a write through a setter), nothing else may read or write it.

```swift
func demo() {
    var stepSize = 1
    func increment(_ number: inout Int) { number += stepSize }   // reads stepSize while number is being written

    var other = 10
    increment(&other)          // fine: different variables
    print(other)               // 11
    increment(&stepSize)       // runtime trap: "Simultaneous accesses", overlapping access to stepSize
}
demo()
```

Overlaps the compiler can see (`swap(&a, &a)`, two `inout` arguments that are the same variable) are compile errors. Others, through class properties or escaping closures, are checked at runtime and trap. This rule is what lets the compiler treat `inout` as a fast in-place write instead of a copy in and out.

## Noncopyable types

Some values should never be duplicated: a file descriptor, a lock, a one-time token. Since Swift 5.9 a struct or enum can be declared `~Copyable` (read: "not Copyable"):

```swift
struct FileDescriptor: ~Copyable {
    let fd: Int32
    init(fd: Int32) { self.fd = fd; print("open \(fd)") }
    consuming func close() { print("close \(fd)"); discard self }   // ends the value without running deinit
    deinit { print("deinit closes \(fd)") }
}

func inspect(_ f: borrowing FileDescriptor) { print("reading \(f.fd)") }

func run() {
    let file = FileDescriptor(fd: 3)
    inspect(file)                   // borrowed: file is still ours
    let moved = file                // ownership moves to moved
    // inspect(file)                // error: 'file' used after consume
    moved.close()                   // consumed: moved is gone too
}
run()
```

- A noncopyable value has exactly **one owner**. Assignment and `consuming` parameters move it; using the old name afterwards is a compile error.
- It can have a `deinit`, like a class, but without reference counting or heap allocation.
- `borrowing` parameters read without taking ownership; `consuming` ones take it. For copyable types they are optional performance hints; for `~Copyable` types they are required.
- Since Swift 6.0, generics and protocols can accept noncopyable types (`<T: ~Copyable>`, SE-0427), and `Optional` can wrap them.

## Where this is heading

The standard library builds on these features: `InlineArray` (Swift 6.2) is a fixed-size array stored inline, `Span` (Swift 6.2) gives safe, non-escaping access to contiguous memory without copying, and Swift 6.4 adds array types for noncopyable elements. Most app code never writes `~Copyable`, but knowing it exists explains new APIs, and the exclusivity rule applies to everyone.
