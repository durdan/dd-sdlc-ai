---
id: java-jit
title: "JIT compilation: interpreter, C1, C2"
summary: Slow at first, then compiled for how it is really used
why: "Why a Java service is slow for its first minute, why a naive benchmark lies, and why code that looks expensive often isn't."
requires: [java-bytecode]
lesson: none
points:
  - title: Interpret and count
    text: HotSpot starts every method in the interpreter and counts how often it is called and how often its loops go round.
  - title: Two compilers in tiers
    text: Warm methods are compiled quickly by C1, which also records a profile; hot ones are recompiled by C2 using that profile.
  - title: Speculate, then back out
    text: C2 optimises for what it has seen so far. If an assumption stops holding, the code is deoptimised and runs in the interpreter again.
  - title: Warm-up is real
    text: Measure after the JIT has settled, with a harness such as JMH, never with one timed loop.
quiz:
  - q: In HotSpot's default tiered mode, how does a hot method normally progress?
    options:
      - Straight to C2 the first time it is called
      - Interpreter, then C1 with profiling, then C2 using that profile
      - C2 first, then C1 if C2 fails
    answer: 1
    explain: "Tiered compilation (on by default) uses C1 to get fast, profiling machine code early, and C2 to produce the best code once the profile shows where the time goes."
  - q: "-XX:+PrintCompilation shows a line ending in \"made not entrant\". What happened?"
    options:
      - The method threw an exception
      - Compiled code was retired, for example because a better version replaced it or an assumption it relied on was broken
      - The method was removed from the class
    answer: 1
    explain: "New calls stop entering that compiled version. Either a higher tier replaced it, or the JIT deoptimised it because the code it was speculating on changed, such as a new subclass being loaded."
  - q: You time one loop of 1,000 calls right after start-up and conclude a method is slow. What is wrong with that measurement?
    options:
      - Nothing, if you use System.nanoTime
      - It mostly measures the interpreter and the JIT compiling; the steady state may be many times faster
      - Java methods can't be timed accurately
    answer: 1
    explain: Early calls run interpreted while compilation happens in the background. A harness such as JMH runs warm-up iterations, forks fresh JVMs and guards against dead-code elimination.
links:
  - title: "HotSpot performance enhancements: tiered compilation, compressed oops, escape analysis (JDK 21)"
    url: https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html
  - title: Java Virtual Machine technology overview (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/vm/java-virtual-machine-technology-overview.html
  - title: The java command, including -XX options (JDK 21)
    url: https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html
---
The JVM Specification says what bytecode means, not how to run it fast. HotSpot's answer is adaptive compilation: start every method in an interpreter, watch which methods and loops actually get used, and compile those to machine code while the program keeps running. Everything in this topic is HotSpot behaviour, not part of Java itself; other JVMs make different choices.

## Tiers

With tiered compilation, which is on by default, a method can run at five levels:

- **Tier 0**, the interpreter: starts immediately, collects counts, runs slowly.
- **Tiers 1 to 3**, the C1 (client) compiler: compiles fast with simpler optimisations. At tier 3 the generated code also records a profile: which branches are taken, which classes really appear at each call site.
- **Tier 4**, the C2 (server) compiler: slower to compile, but uses the profile for aggressive optimisation.

A typical hot method goes 0, then 3, then 4. The switch points are counters with thresholds (in JDK 21, a method is queued for tier 3 after a couple of hundred calls and for tier 4 after several thousand), adjusted for how busy the compiler threads are. Compilation runs on background threads, so your code keeps running in the interpreter meanwhile.

## Watching it

```java
public class Hot {
    static long square(long x) { return x * x; }

    public static void main(String[] args) {
        long sum = 0;
        for (int i = 0; i < 50_000_000; i++) sum += square(i);
        System.out.println(sum);
    }
}
```

`java -XX:+PrintCompilation Hot` prints one line per compilation. You will see `Hot::square` compiled at tier 3 and then 4, the tier 3 version "made not entrant" once tier 4 is ready, and lines marked `%` for `Hot::main`. Those are on-stack replacement (OSR) compilations: `main` is only called once, so HotSpot compiles the loop and swaps it in while it is still running.

## What C2 does with the profile

- **Inlining**: copying small, hot callees into the caller. This is the optimisation that unlocks the others, and it is why small methods and getters cost nothing in hot code.
- **Speculation**: if a call site on an interface has only ever seen one class, C2 can call that class's method directly, guarded by a cheap type check. Branches that never ran can be left out entirely.
- **Escape analysis**: if an object never leaves the compiled method, C2 can skip allocating it and keep its fields in registers (scalar replacement).

Speculation needs a way back. When a guard fails, a new subclass is loaded, or a never-taken branch is finally taken, HotSpot deoptimises: it rebuilds the interpreter's frames from the compiled ones, continues in the interpreter, and may compile again later with the new profile.

## Warm-up

All of this means a JVM is slowest just after start-up. A service may need thousands of requests before its hot paths reach C2, so load balancers sometimes ramp traffic to new instances slowly. It also means a hand-written benchmark is easy to get wrong: the first iterations measure the interpreter, and a result you never use may be removed as dead code. Use JMH, the OpenJDK benchmark harness, which handles warm-up, forking and dead-code elimination for you.
