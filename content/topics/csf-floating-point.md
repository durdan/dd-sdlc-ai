---
id: csf-floating-point
title: "Floating point: why 0.1 + 0.2 isn't 0.3"
summary: Binary fractions, a fixed number of significant bits, and rounding on every step
why: "Floating-point surprises turn up in money calculations, equality checks, loop counters and aggregates. They are predictable once you know what a double actually stores."
requires: [csf-integers]
lesson: none
points:
  - title: Scientific notation in binary
    text: "IEEE 754 stores a sign, an exponent and a fraction. A double has 53 significant bits, about 15 to 17 decimal digits."
  - title: Most decimals can't be stored exactly
    text: "0.1 in binary repeats forever, like 1/3 in decimal, so it is rounded to the nearest double. Each operation rounds again."
  - title: Compare with tolerance
    text: "Test whether two results are close enough for your purpose, not whether they are identical."
  - title: Money is not a float
    text: "Store currency as an integer number of the smallest unit (cents) or use a decimal type."
quiz:
  - q: Why is `0.1 + 0.2 === 0.3` false in JavaScript (and in Python, Java, C and C#)?
    options:
      - "JavaScript has a bug in addition"
      - "Neither 0.1 nor 0.2 is exactly representable in binary; the rounded sum is the double just above the one nearest 0.3"
      - "=== compares types, not values"
    answer: 1
    explain: "0.1 is stored as 0.1000000000000000055…, and the sum rounds to 0.30000000000000004. Every language using IEEE 754 doubles gives the same answer."
  - q: What does `NaN === NaN` evaluate to?
    options: ["true", "false", "It throws"]
    answer: 1
    explain: "IEEE 754 defines NaN as unequal to everything, including itself. Use Number.isNaN(x) to test for it."
  - q: "Adding 0.1 ten times starting from 0 gives what in this topic's example?"
    options: ["1", "0.9999999999999999", "1.0000000000000002"]
    answer: 1
    explain: "Each addition rounds, and the errors accumulate. That is why loop counters and running totals should be integers where possible."
links:
  - { title: "David Goldberg: What Every Computer Scientist Should Know About Floating-Point Arithmetic", url: "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html" }
  - { title: "IEEE 754: the floating-point standard (Wikipedia overview)", url: "https://en.wikipedia.org/wiki/IEEE_754" }
  - { title: "Number.EPSILON (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON" }
  - { title: "The Floating-Point Guide", url: "https://floating-point-gui.de/" }
---
Almost every language stores non-integer numbers in the IEEE 754 binary floating-point format. It is scientific notation in base 2: a value is stored as a sign, an exponent, and a fixed number of significant binary digits. That gives an enormous range, from about 10⁻³⁰⁸ to 10³⁰⁸ for a 64-bit double, with about 15 to 17 significant decimal digits everywhere in it. The price is that most decimal fractions can't be stored exactly, and every operation rounds its result.

## What a double holds

A 64-bit double has 1 sign bit, 11 exponent bits and 52 fraction bits (plus an implicit leading 1, so 53 significant bits). The value is ±1.fraction × 2^exponent. A 32-bit float has 24 significant bits, about 7 decimal digits.

Fractions that are sums of powers of two (0.5, 0.25, 0.375) are exact. But 0.1 is 1/10, and 10 has a factor of 5, so in binary it repeats forever: 0.0001100110011… The double nearest to it is slightly more than 0.1:

```js run
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log((0.1).toFixed(20));
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
let total = 0;
for (let i = 0; i < 10; i++) total += 0.1;
console.log(total);
console.log(2 ** 53, 2 ** 53 + 1);
console.log(1 / 0, -1 / 0, 0 / 0, NaN === NaN);
console.log(Object.is(-0, 0), -0 === 0);
```

Node printed `0.30000000000000004`, `false`, `0.10000000000000000555`, `true`, `0.9999999999999999`, then `9007199254740992 9007199254740992` (above 2⁵³ the gap between doubles is 2, so the +1 is lost), `Infinity -Infinity NaN false`, and `false true`.

## Special values

IEEE 754 defines more than numbers. Dividing a non-zero number by zero gives **±Infinity** rather than an error. Invalid operations such as 0/0 or `Math.sqrt(-1)` give **NaN** (not a number), which is unequal to everything including itself, and which spreads through every calculation it touches. There are two zeros, +0 and −0, which compare equal but behave differently (1/−0 is −Infinity). Very small numbers near zero lose precision gradually ("subnormals") instead of dropping straight to zero.

## Living with rounding

- **Don't test for exact equality** of computed results. Check whether the difference is small relative to the magnitude, for example `Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b))`. `Number.EPSILON` (2⁻⁵², the gap between 1 and the next double) is only a sensible tolerance for values near 1.
- **Order matters.** Floating-point addition isn't associative: `(a + b) + c` can differ from `a + (b + c)`. Summing many values of mixed size is more accurate smallest first, or with compensated (Kahan) summation. Parallel sums can give slightly different answers from run to run because the order changes.
- **Use integers for counting.** Loop on an integer and compute `i * 0.1`, rather than adding 0.1 repeatedly.
- **Money needs exact decimals.** Store amounts as integer cents (or the currency's smallest unit), or use a decimal type: `decimal` in C#, `BigDecimal` in Java, `Decimal` in Python, `NUMERIC` in SQL. Decide rounding rules (for example banker's rounding) explicitly.
- **Display is not storage.** `toFixed(2)` and format strings round for display only; the stored value is unchanged.

These rules aren't JavaScript quirks. C, Java, Python, C# and Go give the same answers for the same operations on doubles, because they all use the same hardware format.
