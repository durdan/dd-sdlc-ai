---
id: java-memory
title: Stack, heap and object layout
summary: Where values live, and what an object really weighs
why: "A List<Integer> of a million numbers can take several times the memory of an int[]. Knowing the layout explains why."
requires: [java-bytecode]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: One stack per thread, one shared heap
    text: Local variables live in the current thread's stack frame; every object and array lives on the heap that all threads share.
  - title: References are passed by value
    text: A method gets a copy of the reference, so it can change the object but can't make the caller's variable point somewhere else.
  - title: Objects carry a header
    text: In 64-bit HotSpot an object starts with a 12-byte header and is padded to a multiple of 8 bytes.
  - title: Boxes cost
    text: An Integer is a whole object; a reference to it is 4 more bytes. Primitive arrays avoid both.
quiz:
  - q: What does this print?
    code: |
      static void move(Point p, int n) {
          p.x = 10;
          p = new Point();
          n = 99;
      }
      // in main:
      Point p = new Point();   // x starts at 0
      int n = 1;
      move(p, n);
      System.out.println(p.x + " " + n);
    options:
      - "0 1"
      - "10 1"
      - "0 99"
    answer: 1
    explain: "The method gets copies of the reference and of the int. Writing p.x changes the shared object; reassigning p and n only changes the method's own copies."
  - q: In 64-bit HotSpot with default settings, roughly how large is an object with two int fields?
    options:
      - 8 bytes
      - 24 bytes
      - 64 bytes
    answer: 1
    explain: "12 bytes of header plus 8 bytes of fields is 20, padded up to the next multiple of 8: 24. This layout is HotSpot's choice; the JVMS doesn't specify one."
  - q: A deep recursion with no base case fails. With what?
    options:
      - OutOfMemoryError, because the heap is full
      - StackOverflowError, because the thread's stack has no room for another frame
      - NullPointerException
    answer: 1
    explain: "Each call pushes a frame on the thread's own stack, which has a fixed maximum size (HotSpot's -Xss). Running out of it throws StackOverflowError; the heap is a separate area."
links:
  - title: "JVMS 2.5: run-time data areas"
    url: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html
  - title: "HotSpot performance enhancements: compressed oops (JDK 21)"
    url: https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html
  - title: "JOL: Java Object Layout (OpenJDK code tools)"
    url: https://openjdk.org/projects/code-tools/jol/
  - title: "JEP 450: compact object headers"
    url: https://openjdk.org/jeps/450
---
The JVM Specification describes a few run-time memory areas. Each thread has its own stack of frames, one per method call in progress, holding local variables and the operand stack. All objects and arrays live on one heap shared by every thread, and the garbage collector manages it. Per-class data such as method code and the run-time constant pool lives in the method area. How big an object is in memory is not specified; it is a choice of the JVM, and the numbers below are HotSpot's.

## Stack and heap

A local variable of a primitive type (`int`, `double`, `boolean`) holds the value itself in the frame. A local of a reference type holds only a reference; the object is on the heap. When the method returns, its frame is discarded at once, with no garbage collection involved. If a thread nests too many calls its stack runs out and the JVM throws `StackOverflowError`; if the heap can't fit a new object even after collecting, it throws `OutOfMemoryError`.

Java passes every argument by value. For objects, the value is the reference:

```java
public class Refs {
    static class Point { int x, y; }

    static void move(Point p, int n) {
        p.x = 10;          // changes the shared object on the heap
        p = new Point();   // only changes this frame's copy of the reference
        n = 99;            // only changes this frame's copy of the int
    }

    public static void main(String[] args) {
        Point p = new Point();
        int n = 1;
        move(p, n);
        System.out.println(p.x + " " + n);   // 10 1
    }
}
```

The JIT can blur the picture. If escape analysis proves an object never leaves a compiled method, HotSpot may not allocate it on the heap at all and keep its fields in registers. Your code can't tell the difference.

## What an object looks like

On a 64-bit HotSpot JVM, every object starts with a header:

- a **mark word** (8 bytes) used for the identity hash code, locking and the GC's age bits;
- a **class pointer** (4 bytes with compressed class pointers, the default) saying what class it is.

Fields follow, arranged by the JVM rather than in source order, and the whole object is padded to a multiple of 8 bytes. Arrays add a 4-byte length. Some sizes this gives:

| Value | Size |
| --- | --- |
| `new Object()` | 16 bytes |
| `class Point { int x, y; }` | 12 + 8 = 20, padded to 24 |
| `Integer` | 16 bytes, plus a 4-byte reference to it |
| `int[1000]` | 16 + 4000 bytes |
| `Integer[1000]` full of distinct values | 16 + 4000 for the array, plus 16,000 for the boxes |

References are 4 bytes because of **compressed oops**: HotSpot stores a reference as a 32-bit offset in units of 8 bytes from the start of the heap, which reaches about 32 GB. Set `-Xmx` above that and references become 8 bytes, so a 33 GB heap can hold less than a 31 GB one.

To see real layouts instead of estimates, use JOL (Java Object Layout) from OpenJDK. And watch JEP 450: in JDK 24 and later, an experimental mode shrinks the header to 8 bytes.

## Allocation is cheap

HotSpot gives each thread a private chunk of the young generation, a TLAB (thread-local allocation buffer). Allocating an object is usually a pointer bump inside it, with no lock. The real cost of an object comes later, if it survives long enough for the collector to copy it.

```trace diagram
id: method-call
title: One method call, in memory
subtitle: "main calls move(p, n): frames, references and objects"
groups:
  - { id: stack, label: "Thread main's stack" }
  - { id: heap, label: Heap (shared by all threads) }
elements:
  - { id: mainframe, label: main() frame, sub: "n = 1, p = a reference", group: stack }
  - { id: moveframe, label: move() frame, sub: "its own copies of p and n", group: stack }
  - { id: point, label: Point object, sub: "header 12 B + x, y = 24 B", group: heap, tone: data }
  - { id: newpoint, label: Second Point, sub: "bumped into this thread's TLAB", group: heap, tone: data }
  - { id: classdata, label: Method area, sub: "Point's class data and code", kind: store }
  - { id: console, label: Console, sub: prints 10 1, kind: person }
edges:
  - { id: ref, from: mainframe, to: point, label: p }
  - { id: call, from: mainframe, to: moveframe, label: "move(p, n)" }
  - { id: copy, from: moveframe, to: point, label: copy of p }
  - { id: alloc, from: moveframe, to: newpoint, label: p = new Point() }
  - { id: klass, from: point, to: classdata, label: class pointer, style: dotted, flow: main }
  - { id: print, from: mainframe, to: console, label: println, style: dashed, flow: main }
steps:
  - caption: "main starts with a frame on its thread's stack. The int n holds the value 1 right there in the frame; p holds only a reference, and the Point it refers to lives on the heap that every thread shares."
    focus: [mainframe, point]
    trace: [ref]
  - caption: "On 64-bit HotSpot the Point starts with a 12-byte header: an 8-byte mark word for hashing, locking and GC age, and a 4-byte compressed class pointer to its class data. Two ints make 20 bytes, padded to 24."
    focus: [point, classdata]
    trace: [klass]
  - caption: "main calls move(p, n). The JVM pushes a new frame on the same stack and copies both arguments into it. The copied reference points at the very same Point."
    focus: [mainframe, moveframe, point]
    trace: [call, copy]
  - caption: "p.x = 10 follows that copy to the shared object and changes it. main will see the change, because there is only one Point."
    focus: [moveframe, point]
    trace: [copy]
  - caption: "p = new Point() allocates a second object, usually by bumping a pointer in the thread's own TLAB, with no lock. Only move's copy of p now points at it; main's p is untouched."
    focus: [moveframe, newpoint]
    trace: [alloc]
  - caption: "n = 99 changes move's copy of the int, nothing else. Java passes every argument by value, and for objects the value is the reference."
    focus: [moveframe]
  - caption: "move returns and its frame is thrown away at once, with no garbage collection involved. Nothing refers to the second Point any more, so it is unreachable, and the collector will reclaim it later."
    focus: [mainframe, newpoint]
  - caption: "Back in main, p.x is 10 and n is still 1, so it prints 10 1."
    focus: [mainframe, point, console]
    trace: [print]
  - caption: "Once the JIT compiles move, escape analysis may see that the second Point never leaves the method and skip the heap allocation entirely, keeping its fields in registers. The program can't tell."
    focus: [moveframe, newpoint]
note: "Call too deep and the stack runs out (StackOverflowError); fill the heap and allocation fails (OutOfMemoryError). They are separate areas."
```
