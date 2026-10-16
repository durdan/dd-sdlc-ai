---
id: java-bytecode
title: Bytecode and the JVM
summary: javac targets a virtual machine, not your CPU
why: "Bytecode is what actually runs. Reading it with javap settles arguments about what a line of Java really does."
lesson: none
points:
  - title: Compile once, for a machine that doesn't exist
    text: javac writes class files full of bytecode for the abstract machine described in the JVM Specification.
  - title: A stack machine
    text: Each method call gets a frame with an array of local variables and an operand stack; instructions push and pop values on that stack.
  - title: Spec versus implementation
    text: The JVMS fixes the class file format and what each instruction means. How it is executed, compiled and collected is up to the JVM, usually HotSpot.
quiz:
  - q: What does javac put in a .class file?
    options:
      - Machine code for the CPU it was compiled on
      - Bytecode for the JVM, plus a constant pool and metadata about fields and methods
      - The Java source, compressed
    answer: 1
    explain: A class file is CPU-independent. It holds bytecode, a constant pool of names and literals, and descriptions of the class's fields and methods. Machine code only appears later, inside a running JVM.
  - q: What does the iadd instruction do?
    code: |
      static int add(int, int);
        Code:
           0: iload_0
           1: iload_1
           2: iadd
           3: ireturn
    options:
      - Adds local variable 1 into local variable 0
      - Pops two ints off the operand stack and pushes their sum
      - Calls a method named add
    answer: 1
    explain: "iload_0 and iload_1 push the two arguments onto the operand stack; iadd pops both and pushes the result; ireturn returns the int on top of the stack."
  - q: Which of these does the JVM Specification define, rather than leave to the implementation?
    options:
      - Which methods get compiled to machine code, and when
      - The class file format and the meaning of each instruction
      - Which garbage collector runs
    answer: 1
    explain: "The JVMS describes the class file, the instruction set, verification and loading. JIT compilation and the choice of collector are implementation details; in HotSpot they are controlled by -XX options."
links:
  - title: The Java Virtual Machine Specification, Java SE 21
    url: https://docs.oracle.com/javase/specs/jvms/se21/html/index.html
  - title: "JVMS chapter 2: the structure of the JVM"
    url: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html
  - title: The javap command (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html
  - title: "javap: the class file disassembler (dev.java)"
    url: https://dev.java/learn/jvm/core-tools/javap/
---
`javac` does not produce a program for your processor. It writes `.class` files containing bytecode: instructions for the abstract machine defined by the Java Virtual Machine Specification (JVMS). The `java` launcher starts a JVM, which loads those classes, checks them, and runs them, first in an interpreter and later as machine code it compiles itself. The same class file runs on any operating system and CPU that has a JVM.

## What a class file holds

A class file is a binary format fixed by the JVMS. It starts with a magic number and a version (Java 21 writes major version 65), then a constant pool that holds every name, type descriptor and literal the class uses, then the fields and methods. Each method body is a `Code` attribute: the bytecode itself, the maximum depth of its operand stack, the number of local variable slots, and an exception table saying which instructions each `catch` covers.

## A stack machine

Take a tiny method:

```java
public class Add {
    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
    }
}
```

Compile it and disassemble it with `javac Add.java && javap -c Add`:

```java
static int add(int, int);
  Code:
     0: iload_0      // push local 0 (a)
     1: iload_1      // push local 1 (b)
     2: iadd         // pop two ints, push the sum
     3: ireturn      // return the int on top of the stack
```

Every method call gets a frame with two parts: an array of local variables (arguments first, `this` in slot 0 for instance methods) and an operand stack. Instructions are typed (`iadd` for ints, `ladd` for longs, `aload` for references), which lets the verifier prove before the code runs that no instruction gets a value of the wrong type. In `main` you will also see `invokestatic` and `invokevirtual`, two of the five call instructions; the others are `invokespecial` (constructors, private and `super` calls), `invokeinterface` and `invokedynamic`.

## invokedynamic

`invokedynamic` lets the first call at a site ask a bootstrap method what to link it to. `javac` uses it for lambdas and, since Java 9, for string concatenation: `"hi " + name` compiles to a call to `makeConcatWithConstants`, so the JDK can improve how strings are joined without anyone recompiling.

## Specified versus implemented

The JVMS defines the class file format, the instruction set, verification, and the rules for loading, linking and initialising classes. It deliberately says nothing about how fast any of that happens. Interpreting, compiling to machine code, the object layout in memory and the garbage collector are all choices of the implementation. In practice that implementation is almost always HotSpot, the JVM in OpenJDK and Oracle's JDK; Eclipse OpenJ9 and GraalVM are others. When later topics mention `-XX:` flags, they are HotSpot's, not Java's.

Because the contract is the class file, other languages target the JVM too: Kotlin, Scala and Clojure all produce class files that run alongside Java's.
