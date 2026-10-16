---
id: java-classloading
title: Class loading and initialisation
summary: Classes arrive lazily, through a chain of loaders
why: "Slow start-up, a static block that runs at a surprising moment, and the baffling 'Foo cannot be cast to Foo' all come from here."
requires: [java-bytecode]
lesson: none
points:
  - title: Load, link, initialise
    text: The JVM finds the bytes, verifies and prepares them, resolves references, and only then runs the static initialisers.
  - title: Lazy by design
    text: A class is initialised on its first active use, such as new, a static method call, or reading a non-constant static field.
  - title: Loaders delegate to their parent
    text: The application loader asks the platform loader, which asks the bootstrap loader, before trying to find a class itself.
  - title: A class is its name plus its loader
    text: The same class file loaded by two different loaders gives two different, incompatible classes.
quiz:
  - q: What does this print?
    code: |
      class Config {
          static { System.out.println("init"); }
          static final String NAME = "app";
          static String region = "eu";
      }
      // in main:
      System.out.println(Config.NAME);
      System.out.println(Config.region);
    options:
      - "init, app, eu"
      - "app, init, eu"
      - "app, eu (init never prints)"
    answer: 1
    explain: "NAME is a compile-time constant, so javac copies \"app\" into the caller and Config isn't touched. Reading region is the first active use: the static block runs, then \"eu\" is printed."
  - q: What does String.class.getClassLoader() return?
    options:
      - The application class loader
      - "null, because String comes from the bootstrap loader"
      - The platform class loader
    answer: 1
    explain: The bootstrap loader is built into the JVM and has no Java object to represent it, so getClassLoader() returns null for the core classes in java.base.
  - q: "Two web apps in one server each load their own copy of com.acme.User. Passing a User from one to the other fails with \"User cannot be cast to User\". Why?"
    options:
      - The class files must differ
      - A class's identity is its name together with its defining loader, so these are two different classes
      - Casting between web apps is forbidden by the JLS
    answer: 1
    explain: "The JVMS identifies a class by its binary name and the loader that defined it. Same bytes, different loaders: different runtime classes, and a cast between them fails."
links:
  - title: "JVMS chapter 5: loading, linking and initializing"
    url: https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html
  - title: "JLS chapter 12: execution (class initialization)"
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html
  - title: ClassLoader (Java SE 21 API)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html
  - title: Class data sharing (JDK 21 guide)
    url: https://docs.oracle.com/en/java/javase/21/vm/class-data-sharing.html
---
A JVM does not read all your classes at start-up. It brings each one in when it is first needed, in three steps the JVM Specification spells out: loading (find the bytes and create the class), linking (verify it, set up its static fields, resolve its references to other classes) and initialisation (run its static initialisers). Which code finds the bytes is decided by a chain of class loaders.

## Three steps

- **Loading** asks a class loader for the bytes of a class by name and turns them into a class inside the JVM. Its superclass and interfaces are loaded too.
- **Linking** starts with verification, which checks that the bytecode is type-safe and well formed, so a hand-crafted class file cannot corrupt memory. Preparation allocates static fields and sets them to default values (`0`, `false`, `null`). Resolution turns symbolic references such as "method `println` of class `PrintStream`" into direct ones; the JVMS lets this happen lazily, the first time each instruction runs, and HotSpot does it that way.
- **Initialisation** runs the class's static initialiser: the static field assignments and `static {}` blocks, in source order.

## When initialisation happens

The JLS lists the triggers: creating an instance, calling a static method, assigning a static field, reading a static field that is not a constant, some reflective calls, initialising a subclass, and being the main class. The JVM runs the initialiser exactly once and holds a lock while it does, so other threads wait. That gives a thread-safe lazy singleton for free:

```java
public class Loaders {
    static class Config {
        static { System.out.println("Config initialised"); }
        static final String NAME = "app";       // a compile-time constant
        static String region = "eu";            // not a constant
    }

    public static void main(String[] args) {
        System.out.println(String.class.getClassLoader());                 // null: bootstrap
        System.out.println(java.sql.Connection.class.getClassLoader());    // platform loader
        System.out.println(Loaders.class.getClassLoader());                // app loader
        System.out.println(Config.NAME);    // copied in by javac: Config is not initialised
        System.out.println(Config.region);  // first active use: the static block runs now
    }
}
```

Run it with `java -Xlog:class+load Loaders` (a HotSpot logging option) and you can watch `Loaders$Config` being loaded only at the last line.

## The loader chain

Java 9 and later have three built-in loaders. The **bootstrap** loader is part of the JVM and loads core modules such as `java.base`; it has no Java object, so `getClassLoader()` returns `null`. The **platform** loader loads the rest of the Java SE and JDK modules, such as `java.sql`. The **application** (system) loader loads your class path and module path. Each loader asks its parent first and only searches itself if the parent can't find the class. That is why you can't replace `java.lang.String` by putting your own on the class path.

Frameworks and application servers create their own loaders, to load plugins or to keep two web apps apart. Then one rule matters: at run time a class is identified by its name **and** its defining loader. The same `User.class` loaded by two loaders gives two unrelated classes, and casting between them throws `ClassCastException` with the confusing message "User cannot be cast to User".

## Start-up cost

Loading and verifying thousands of classes takes time. HotSpot's class data sharing (CDS) keeps an archive of already-parsed JDK classes that is mapped into memory at start-up; you saw it above if your log lines said `source: shared objects file`. You can build an archive that includes your own classes too.
