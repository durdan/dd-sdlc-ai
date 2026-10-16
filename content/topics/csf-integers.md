---
id: csf-integers
title: Binary, integers and overflow
summary: Fixed-width numbers wrap around, and that is a feature of the hardware
why: "Overflow bugs have crashed rockets, frozen games and broken binary searches. They come from forgetting that most integers have a fixed number of bits."
lesson: none
points:
  - title: Bits and place value
    text: "Binary is base 2: each bit is worth twice the one to its right. n bits can hold 2ⁿ different values."
  - title: "Two's complement"
    text: "Signed integers use the top bit as a large negative weight, so an 8-bit value runs from −128 to 127 and adding works the same for signed and unsigned."
  - title: Overflow wraps or traps
    text: "In hardware, the result is kept modulo 2ⁿ. Languages either wrap (Java, Go, C# by default), trap (Rust in debug, Swift), or call it undefined (signed ints in C)."
  - title: "JavaScript numbers are doubles"
    text: "Integers are exact only up to 2⁵³ − 1. Bitwise operators work on 32-bit integers, and BigInt gives arbitrary precision."
quiz:
  - q: "An Int8Array holds 127. What is it after adding 1?"
    options: ["128", "−128", "0"]
    answer: 1
    explain: "127 is 0111 1111. Adding 1 gives 1000 0000, which in two's complement is −128. This topic's example printed exactly that."
  - q: "What is the classic overflow bug in `mid = (low + high) / 2` with 32-bit ints?"
    options:
      - "Division by zero when low equals high"
      - "low + high can exceed 2³¹ − 1 and wrap to a negative number for very large arrays"
      - "It rounds the wrong way"
    answer: 1
    explain: "Java's own Arrays.binarySearch had this bug for years. low + (high − low) / 2 avoids it."
  - q: "In JavaScript, what is 2 ** 53 + 1?"
    options: ["9007199254740993", "9007199254740992", "Infinity"]
    answer: 1
    explain: "Above Number.MAX_SAFE_INTEGER (2⁵³ − 1) doubles can't represent every integer; 2⁵³ + 1 rounds to 2⁵³. Use BigInt (2n ** 53n + 1n) for exact large integers."
links:
  - { title: "Typed arrays (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays" }
  - { title: "Number.MAX_SAFE_INTEGER (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER" }
  - { title: "BigInt (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt" }
  - { title: "CMU 15-213 lecture notes: bits, bytes and integers", url: "https://www.cs.cmu.edu/~213/schedule.html" }
---
Computers store numbers in binary, base 2, using a fixed number of bits chosen by the type: 8 for a byte, 32 for an `int` in most languages, 64 for a `long`. A fixed width means a fixed range. When arithmetic produces a result outside that range, the hardware keeps only the low bits, so the value "wraps around". Whether your language lets that happen silently, raises an error, or treats it as undefined is one of the most important things to know about its integers.

## Binary and two's complement

Each bit is worth twice the bit to its right: `0000 0101` is 4 + 1 = 5. Eight bits give 2⁸ = 256 patterns, so an unsigned byte holds 0 to 255.

For negative numbers, almost every CPU uses **two's complement**: the top bit counts as −2⁷ (−128) instead of +128. So `1000 0000` is −128, `1111 1111` is −1, and the signed range is −128 to 127. To negate a number, flip every bit and add one. The big advantage is that the same adder circuit works for signed and unsigned values; only the interpretation differs.

Typed arrays let you see this directly from JavaScript:

```js run
const u8 = new Uint8Array(1);
u8[0] = 255; u8[0] += 1;
console.log("uint8 255 + 1 =", u8[0]);
const i8 = new Int8Array(1);
i8[0] = 127; i8[0] += 1;
console.log("int8 127 + 1 =", i8[0]);
const i32 = new Int32Array(1);
i32[0] = 2147483647; i32[0] += 1;
console.log("int32 max + 1 =", i32[0]);
console.log("-1 >>> 0 =", -1 >>> 0, (-1 >>> 0).toString(2));
console.log((5).toString(2), (-5 >>> 0).toString(2));
const bytes = new Uint8Array(new Uint32Array([0x01020304]).buffer);
console.log("bytes of 0x01020304:", [...bytes].join(","));
```

This prints 0, −128 and −2147483648 for the three overflows, then shows −1 as thirty-two 1 bits, and −5 as `…11111011`. The last line prints `4,3,2,1` on x86 and Arm machines: they are **little-endian**, storing the least significant byte first. Network protocols traditionally use big-endian ("network byte order"), which is why binary parsers must say which one they expect.

## What languages do on overflow

- **Wrap silently**: Java, Go, C# (unless you use `checked`), and unsigned integers in C and C++.
- **Trap**: Swift always; Rust in debug builds (release builds wrap unless you enable checks, and `checked_add` and friends are always available).
- **Undefined behaviour**: signed overflow in C and C++. The compiler may assume it never happens and optimise accordingly, so the program can do anything.
- **Grow**: Python's `int` and JavaScript's `BigInt` have no fixed width, so they never overflow, at the cost of speed.

## JavaScript's special case

A JavaScript `number` is a 64-bit floating-point value (next topic). It represents every integer exactly only up to `Number.MAX_SAFE_INTEGER`, 2⁵³ − 1 = 9,007,199,254,740,991. Beyond that, `2 ** 53 + 1` evaluates to 9007199254740992. That bites when a 64-bit database id or a Twitter-style snowflake id is parsed from JSON as a number, so such ids are usually sent as strings. Bitwise operators convert to 32-bit integers first, which is why `(2 ** 31) | 0` is −2147483648.

## Real bugs

The Ariane 5 rocket's first flight in 1996 failed when a 64-bit floating-point value was converted to a 16-bit signed integer that couldn't hold it. Many binary searches, including the one in Java's standard library until 2006, computed `(low + high) / 2`, which overflows for arrays of over a billion elements. Unix time stored in a signed 32-bit integer runs out on 19 January 2038, a topic in the time chapter.
