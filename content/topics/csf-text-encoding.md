---
id: csf-text-encoding
title: "Text: Unicode, UTF-8 and graphemes"
summary: Characters are numbers, bytes are an encoding, and 'length' has three answers
why: "Mojibake, truncated emoji, broken string comparisons and wrong length limits all come from mixing up code points, code units, bytes and what a user sees as one character."
requires: [csf-integers]
lesson: none
points:
  - title: Unicode assigns numbers
    text: "Every character gets a code point, written U+0041 for A. There is room for 1,114,112 of them, and well over 150,000 are assigned, with more in each yearly release."
  - title: UTF-8 turns them into bytes
    text: "1 byte for ASCII, 2 to 4 bytes for everything else. It is the default encoding of the web, JSON and most files."
  - title: JavaScript strings are UTF-16
    text: "length counts 16-bit code units, so characters outside the Basic Multilingual Plane, like most emoji, count as 2."
  - title: Users see graphemes
    text: "One visible character can be several code points: a base letter plus accents, or emoji joined with zero-width joiners."
quiz:
  - q: "How many bytes does € (U+20AC) take in UTF-8?"
    options: ["1", "2", "3"]
    answer: 2
    explain: "Code points from U+0800 to U+FFFF take three bytes in UTF-8. This topic's example printed e2 82 ac."
  - q: "A page shows Ã© where it should show é. What most likely happened?"
    options:
      - "The font is missing é"
      - "UTF-8 bytes (c3 a9) were decoded as Latin-1, which maps each byte to its own character"
      - "The text was compressed"
    answer: 1
    explain: "This is mojibake: the right bytes read with the wrong encoding. Declare and use UTF-8 end to end: files, HTTP Content-Type, database connections."
  - q: "For the family emoji 👨‍👩‍👧, the example printed 8, 5 and 1. What do those count?"
    options:
      - "Bytes, words and lines"
      - "UTF-16 code units (length), code points (spread), and grapheme clusters (Intl.Segmenter)"
      - "Three different emoji versions"
    answer: 1
    explain: "Three person emoji (two code units each) joined by two zero-width joiners make 8 units and 5 code points, but users see one character."
links:
  - { title: "RFC 3629: UTF-8, a transformation format of ISO 10646", url: "https://datatracker.ietf.org/doc/html/rfc3629" }
  - { title: "Unicode Standard Annex #29: Unicode Text Segmentation", url: "https://www.unicode.org/reports/tr29/" }
  - { title: "Unicode Standard Annex #15: Normalization Forms", url: "https://www.unicode.org/reports/tr15/" }
  - { title: "Intl.Segmenter (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter" }
---
Text in a computer is a sequence of numbers. Unicode decides which number each character gets (its code point); an encoding such as UTF-8 decides which bytes represent those numbers in memory, in a file or on the wire. Most text bugs come from losing track of which layer you are at: bytes, code units, code points, or the characters a person actually sees.

## Code points and UTF-8

Unicode code points range from U+0000 to U+10FFFF. The first 128 are ASCII. UTF-8, defined in RFC 3629, encodes each code point in 1 to 4 bytes:

| Code points | Bytes | Example |
| --- | --- | --- |
| U+0000 to U+007F | 1 | A = 41 |
| U+0080 to U+07FF | 2 | é = c3 a9 |
| U+0800 to U+FFFF | 3 | € = e2 82 ac |
| U+10000 to U+10FFFF | 4 | 😀 = f0 9f 98 80 |

ASCII text is valid UTF-8 unchanged, no byte of a multi-byte sequence looks like an ASCII character (so searching for `/` or `"` in UTF-8 bytes is safe), and you can find the start of a character from anywhere in a stream. That is why UTF-8 won: it is the required encoding for JSON exchanged between systems (RFC 8259) and the dominant one on the web.

```js run
const enc = new TextEncoder();
for (const s of ["A", "é", "€", "😀"]) {
  const bytes = enc.encode(s);
  console.log(s, "U+" + s.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    "UTF-8:", [...bytes].map(b => b.toString(16).padStart(2, "0")).join(" "),
    "length:", s.length);
}
const family = "👨‍👩‍👧";
console.log(family.length, [...family].length, [...new Intl.Segmenter().segment(family)].length);
const e1 = "é", e2 = "é";
console.log(e1 === e2, e1.normalize("NFC") === e2.normalize("NFC"));
console.log(new TextDecoder("latin1").decode(new Uint8Array([0xc3, 0xa9])));
```

Node printed the byte sequences in the table, and `length: 2` for 😀. Then `8 5 1` for the family emoji, `false true`, and `Ã©`.

## Three kinds of length

JavaScript, Java and C# strings are sequences of **UTF-16 code units**. Code points above U+FFFF need two units (a surrogate pair), so `"😀".length` is 2, and slicing a string by index can cut an emoji in half. Spreading a string (`[...s]`) iterates by **code point**. What a reader perceives as one character is a **grapheme cluster**, defined by Unicode Annex #29: the family emoji is three person emoji joined by two zero-width joiners, so 8 code units, 5 code points, and 1 grapheme. Use `Intl.Segmenter` (or your platform's equivalent) when limiting input to "20 characters" or moving a text cursor, and byte length when a database column or protocol limit is in bytes.

## Normalisation

"é" can be one code point (U+00E9) or two: "e" followed by a combining acute accent (U+0301). They look identical but compare unequal. Unicode normalisation (Annex #15) defines canonical forms; NFC, the composed form, is the usual choice for storage. Normalise user input before comparing or using it as a key, for example usernames and file names. macOS file systems have historically stored names in a decomposed form, a common source of "file not found" bugs when syncing with other systems.

## Mojibake

When UTF-8 bytes are decoded with the wrong encoding, each byte of a multi-byte character becomes a separate character: `c3 a9` read as Latin-1 is "Ã©". The cure is to be explicit at every boundary: save files as UTF-8, send `Content-Type: text/html; charset=utf-8`, configure database connections and columns for UTF-8 (in MySQL that means `utf8mb4`; the older `utf8` stops at 3 bytes and can't store emoji), and never guess an encoding from bytes when you can be told.
