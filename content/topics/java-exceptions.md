---
id: java-exceptions
title: Exceptions and what they cost
summary: A try is free; building the stack trace is not
why: "Exceptions used for ordinary control flow, such as 'not found', can quietly dominate a hot path's CPU time."
requires: [java-jit]
lesson: none
points:
  - title: Checked or unchecked
    text: The compiler forces you to handle or declare checked exceptions. RuntimeException, Error and their subclasses are unchecked.
  - title: try costs nothing until something is thrown
    text: A catch is an entry in the method's exception table, not extra instructions on the normal path.
  - title: The stack trace is the expensive part
    text: Creating a Throwable walks the thread's stack to record it. Deep stacks make that slower.
  - title: Exceptional means rare
    text: For expected outcomes, return a value such as Optional or a result type, and keep exceptions for real failures.
quiz:
  - q: Which of these is a checked exception?
    options:
      - IllegalArgumentException
      - IOException
      - OutOfMemoryError
    answer: 1
    explain: "IOException extends Exception but not RuntimeException, so it is checked. IllegalArgumentException is a RuntimeException and OutOfMemoryError is an Error: both unchecked."
  - q: Where does most of the cost of a typical exception come from?
    options:
      - Entering the try block
      - Filling in the stack trace when the Throwable is constructed
      - The catch clause's type check
    answer: 1
    explain: "The Throwable constructor calls fillInStackTrace, which walks every frame of the current thread. The try block itself adds no instructions; it is only a row in the exception table."
  - q: "Two resources in a try-with-resources both throw from close() after the body threw. What does the caller see?"
    options:
      - The last close() exception; the others are lost
      - The body's exception, with the two close() exceptions attached as suppressed exceptions
      - All three wrapped in a new exception
    answer: 1
    explain: "The first exception wins. Exceptions from closing are added to it with addSuppressed, and getSuppressed() returns them, so nothing is silently lost."
links:
  - title: "JLS chapter 11: exceptions"
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-11.html
  - title: Throwable (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html
  - title: "JEP 358: helpful NullPointerExceptions"
    url: https://openjdk.org/jeps/358
  - title: Exceptions (dev.java)
    url: https://dev.java/learn/language/annotations-exceptions/exceptions/
---
An exception in Java is an object, a subclass of `Throwable`, that unwinds the stack until some frame catches it. The language splits them into checked exceptions, which the compiler makes you catch or declare, and unchecked ones. Their run-time cost is uneven: a `try` block costs nothing on the normal path, while creating and throwing an exception can be one of the most expensive things an ordinary method does.

## Checked and unchecked

The JLS rule is simple: `RuntimeException`, `Error` and their subclasses are unchecked; every other `Throwable` is checked. Checked exceptions (`IOException`, `SQLException`) are for failures a caller can reasonably plan for. Unchecked ones signal bugs (`NullPointerException`, `IllegalArgumentException`) or conditions you can't usually recover from (`OutOfMemoryError`). The distinction exists only in the compiler: the JVM treats all throwables the same way, which is why Kotlin and Scala can ignore it.

## How a catch works

`javac` turns each `catch` into a row in the method's exception table: a range of bytecode, a handler address and an exception class. You can see it with `javap -c`. Nothing runs on entry to a `try`. When something is thrown, the JVM looks for a matching row in the current method, and if there is none it pops the frame and tries the caller.

## Where the time goes

Most of the cost is paid in the constructor. `Throwable` calls `fillInStackTrace()`, which walks every frame of the current thread and records it. A framework call stack 200 frames deep makes every `new SomethingException()` correspondingly slower. Unwinding through many frames costs a little more, and turning the trace into `StackTraceElement` objects (when you call `getStackTrace()` or print it) more again.

When you really do need an exception on a hot path, and you don't need its stack trace, the protected four-argument constructor can turn the trace off:

```java
static final class NotFound extends RuntimeException {
    NotFound(String msg) {
        super(msg, null, false, false);   // no suppression, no stack trace
    }
}
```

The better fix is usually not to use an exception at all. "No user with that id" is an expected outcome; return an `Optional<User>` or a small result type and keep exceptions for things that are actually exceptional.

Two HotSpot details, not language rules: if the JIT inlines both the `throw` and its `catch` into one compiled method, the throw can become a plain jump. And for exceptions the JVM throws itself in hot compiled code, such as a repeated `NullPointerException`, HotSpot may reuse a preallocated exception without a stack trace (`-XX:+OmitStackTraceInFastThrow`, on by default). If your logs show an NPE with no trace, that is why.

## try-with-resources

```java
try (var in = Files.newInputStream(path); var out = Files.newOutputStream(copy)) {
    in.transferTo(out);
}   // out is closed, then in, even if transferTo throws
```

Resources are closed in reverse order. If the body throws and a `close()` throws too, the body's exception is the one that propagates and the other is attached to it with `addSuppressed`, so `getSuppressed()` still shows it. Since Java 15 a `NullPointerException` also says, by default, which expression was null, for example `Cannot invoke "String.length()" because the return value of "User.name()" is null`.
