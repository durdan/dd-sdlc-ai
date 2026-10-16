---
id: java-generics
title: Generics and type erasure
summary: Checked by the compiler, gone at run time
why: "Erasure explains the rules that look arbitrary: no new T(), no List<int>, no instanceof List<String>, and casts that fail far from the bug."
requires: [java-bytecode]
lesson: none
points:
  - title: Erased after checking
    text: javac checks generic types, then replaces each type variable with its bound (usually Object) and inserts casts where values come out.
  - title: One class for all
    text: "List<String> and List<Integer> are the same class at run time, so the JVM can't tell them apart."
  - title: What erasure rules out
    text: "No new T(), no T.class, no primitives as type arguments, no runtime check of a parameterised type."
  - title: Wildcards for flexibility
    text: "Use ? extends T when you only read Ts from something, and ? super T when you only put Ts into it."
quiz:
  - q: What does this print?
    code: |
      List<String> names = new ArrayList<>();
      List<Integer> counts = new ArrayList<>();
      System.out.println(names.getClass() == counts.getClass());
    options:
      - "false"
      - "true"
      - It doesn't compile
    answer: 1
    explain: "After erasure both are plain ArrayList objects. The type arguments exist only for the compiler, so there is one ArrayList class."
  - q: "Through a raw List, someone adds 42 to a List<String>. Where does the ClassCastException happen?"
    options:
      - At the add, as the list rejects the Integer
      - Later, where the element is read into a String, at the cast javac inserted
      - Never, since the JVM converts it to "42"
    answer: 1
    explain: "The list holds Objects and accepts anything. javac inserted a checkcast where the String comes out, so the failure appears at the read, possibly far from the code that caused it. This is heap pollution."
  - q: "Which signature lets you add Integers to a List<Integer>, a List<Number> or a List<Object>?"
    options:
      - "void fill(List<? extends Integer> list)"
      - "void fill(List<? super Integer> list)"
      - "void fill(List<Integer> list)"
    answer: 1
    explain: "? super Integer accepts a list of Integer or any supertype of it, and any of those can safely hold an Integer. With ? extends you could read Integers, but not add them."
links:
  - title: "JLS 4.6: type erasure"
    url: https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html
  - title: Type erasure (dev.java)
    url: https://dev.java/learn/language/fp/generics/type-erasure/
  - title: Generics (dev.java)
    url: https://dev.java/learn/language/fp/generics/
---
Generics were added in Java 5 in a way that kept every existing class file working: by erasure. The compiler checks your type arguments, then removes them. Each type variable becomes its bound (`Object` unless you wrote `T extends Something`), and javac inserts a cast wherever a value of type `T` comes back out. The JVM itself knows almost nothing about generics.

## What the bytecode sees

```java
List<String> names = new ArrayList<>();
names.add("Ada");
String first = names.get(0);
```

compiles to roughly what you would have written before Java 5:

```java
List names = new ArrayList();
names.add("Ada");
String first = (String) names.get(0);   // checkcast inserted by javac
```

So `List<String>` and `List<Integer>` share one runtime class, `ArrayList`. Type arguments do survive in the class file as metadata (the `Signature` attribute), so reflection can tell you a field was declared `List<String>`. But a `List` object at run time doesn't know what it was created for.

## When erasure leaks

The compiler warns about raw types and unchecked casts because they let the wrong type in without stopping it:

```java
import java.util.*;

public class Erasure {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();
        System.out.println(names.getClass() == counts.getClass()); // true

        List raw = names;          // raw type: a warning, not an error
        raw.add(42);               // heap pollution: an Integer in a List<String>
        try {
            String first = names.get(0);   // the hidden cast fails here
        } catch (ClassCastException e) {
            System.out.println("ClassCastException at the read, not at the add");
        }
    }
}
```

The failure appears where the value is read, which may be in another module, long after the bad `add`. Treat unchecked warnings as bugs until proven otherwise; `@SuppressWarnings("unchecked")` should come with a reason.

Erasure also explains these rules:

- **No `new T()` or `T.class`**: there is no `T` at run time. Pass a `Class<T>` or a `Supplier<T>` instead.
- **No `List<int>`**: type variables erase to `Object`, and an `int` isn't one. You get `List<Integer>` and pay for boxing.
- **No generic arrays**: `new T[10]` is illegal, because arrays check their element type at run time and would need to know `T`.
- **No overloading on type arguments**: `void f(List<String>)` and `void f(List<Integer>)` erase to the same signature and won't compile together.

When a generic class is subclassed with a concrete type, for example `class Name implements Comparable<Name>`, javac also generates a **bridge method** `compareTo(Object)` that casts and calls your `compareTo(Name)`, so callers that only know the erased interface still reach your code. You can see it with `javap -p`.

## Wildcards

Generic types are invariant: a `List<Integer>` is not a `List<Number>`, or you could add a `Double` to it. Wildcards give the flexibility back:

```java
static double sum(Collection<? extends Number> xs) {   // read Numbers out
    double total = 0;
    for (Number x : xs) total += x.doubleValue();
    return total;
}

static void fill(List<? super Integer> xs) {           // put Integers in
    for (int i = 0; i < 3; i++) xs.add(i);
}
```

The rule of thumb: `extends` when the collection produces values for you, `super` when it consumes them. `Collections.copy(List<? super T> dest, List<? extends T> src)` uses both.
