---
id: web-accessibility
title: Accessibility essentials
summary: Semantics, names, focus, contrast, WCAG 2.2
why: "A page that works with a keyboard and a screen reader works for more people, ranks and tests better, and is a legal requirement in many places."
requires: [web-dom-events]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: Native elements first
    text: "A <button> is focusable, clickable with Enter and Space, and announced as a button. A <div> with a click handler is none of these until you rebuild them all."
  - title: Every control needs a name
    text: "Assistive technology announces a role and an accessible name: the label, the button text, or aria-label when there is no visible text."
  - title: Focus is the keyboard's cursor
    text: "Everything clickable must be reachable with Tab, in a sensible order, with a visible focus indicator that isn't hidden behind sticky headers."
  - title: AA is the usual target
    text: "WCAG 2.2 has three levels, A, AA and AAA. Laws and contracts usually ask for AA, which includes 4.5:1 contrast for normal text."
quiz_hint: Ask what a keyboard user, or a screen reader user, would actually get from the markup.
quiz:
  - q: What is missing from this control for a keyboard user?
    code: |
      <div class="btn" onclick="save()">Save</div>
    options: ["Nothing; screen readers read the text", "It can't be focused with Tab or pressed with Enter or Space, and isn't announced as a button", "Only an aria-label"]
    answer: 1
    explain: "A div has no role, isn't in the tab order and ignores Enter and Space. Use <button type=\"button\" onclick=\"save()\">Save</button> and all of that comes for free."
  - q: "Grey text #777777 on white has a contrast ratio of about 4.48:1. Does it meet WCAG 2.2 AA for body text?"
    options: ["Yes, it rounds to 4.5:1", "No: the threshold is 4.5:1 and ratios are not rounded", "Yes, AA only asks for 3:1"]
    answer: 1
    explain: "AA needs at least 4.5:1 for normal text and 3:1 for large text (18pt, or 14pt bold). WCAG says not to round, so 4.48 fails for body text. #767676 (4.54:1) is the lightest plain grey that passes."
  - q: "Which of these is new in WCAG 2.2 at level AA?"
    options: ["Pointer targets of at least 24 by 24 CSS pixels, or enough spacing around them", "All images need alt text", "Pages must have a title"]
    answer: 0
    explain: "2.5.8 Target Size (Minimum) is one of nine success criteria added in 2.2, alongside Focus Not Obscured, Dragging Movements and Accessible Authentication. Alt text and page titles date back to WCAG 2.0."
links:
  - { title: "WCAG 2.2 (W3C Recommendation)", url: "https://www.w3.org/TR/WCAG22/" }
  - { title: "What's new in WCAG 2.2 (W3C WAI)", url: "https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/" }
  - { title: "ARIA Authoring Practices Guide (W3C WAI)", url: "https://www.w3.org/WAI/ARIA/apg/" }
  - { title: "Accessibility (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" }
---
Assistive technology doesn't see your pixels. It reads the accessibility tree the browser builds from your HTML: for each element a role (button, link, heading), a name, and a state (checked, expanded, disabled). Good semantics fill that tree in for free; a keyboard, a visible focus ring and enough contrast cover most of the rest. WCAG 2.2 is the standard that turns this into testable rules.

## Semantic HTML does most of the work

Use the element that means what you want: `<button>` for actions, `<a href>` for navigation, `<h1>` to `<h6>` in order for structure, `<nav>`, `<main>` and `<footer>` as landmarks that screen reader users jump between, `<label for>` tied to every input, and `<table>` with `<th>` for tabular data. Native controls bring their keyboard behaviour, focusability and role with them.

ARIA is for the gaps: widgets HTML has no element for (tabs, a combobox), or state that changes (`aria-expanded`, `aria-live` for status messages). The first rule of ARIA is not to use it when a native element will do, because `role="button"` only changes the announcement; you still have to add `tabindex="0"` and the key handling yourself. The ARIA Authoring Practices Guide shows the expected keyboard pattern for each widget.

## Names, images and forms

Every interactive element needs an accessible name. A button's text is its name; an icon-only button needs `aria-label` or visually hidden text. Informative images need `alt` text that says what the image tells you; decorative ones get `alt=""` so they are skipped. Errors in forms should be in text, linked to the field with `aria-describedby`, not only shown in red.

## Focus

Tab order follows the DOM order, so keep the DOM in reading order and avoid positive `tabindex` values. Never remove the focus outline without replacing it; `:focus-visible` lets you show it for keyboard users only. When a dialog opens, move focus into it and return it to the trigger when it closes (the `<dialog>` element's `showModal()` handles much of this).

## Contrast and WCAG levels

WCAG success criteria are graded A (the minimum), AA and AAA. AA is what most laws and policies reference, and WCAG 2.2, first published as a W3C Recommendation in October 2023, is the current version. It added nine criteria, including visible focus not hidden by sticky content, minimum target sizes and logins that don't depend on memorising or solving something. It also made 4.1.1 Parsing obsolete.

Contrast is computed from the relative luminance of the two colours. This is the formula from the WCAG 2.2 definitions:

```js run
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

for (const fg of ["#000000", "#767676", "#777777", "#949494"]) {
  const ratio = contrast(fg, "#ffffff") // compared unrounded, as WCAG requires
  const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA for large text only" : "fails"
  console.log(fg, "on white:", ratio.toFixed(2) + ":1", level)
}
```

Automated checkers catch only part of the real problems. Also try the page with only a keyboard, at 200% zoom, and with a screen reader (VoiceOver on macOS and iOS, NVDA on Windows, TalkBack on Android).

```trace diagram
id: tab-through
title: Tabbing through a checkout form
subtitle: What a screen reader user gets from four pieces of markup
groups:
  - { id: markup, label: Your HTML }
  - { id: tree, label: Accessibility tree }
elements:
  - { id: h1, label: "<h1>Checkout</h1>", group: markup, kind: component, row: 1 }
  - { id: input, label: "<label> + <input>", sub: "label for=email", group: markup, kind: component, row: 1 }
  - { id: button, label: "<button>Pay</button>", group: markup, kind: component, row: 1 }
  - { id: div, label: "<div onclick>Cancel</div>", group: markup, kind: component, tone: neutral, row: 1 }
  - { id: axh1, label: heading, sub: "level 1, \"Checkout\"", group: tree, tone: data, row: 2 }
  - { id: axinput, label: textbox, sub: "name \"Email\", required", group: tree, tone: data, row: 2 }
  - { id: axbutton, label: button, sub: "name \"Pay\"", group: tree, tone: data, row: 2 }
  - { id: axdiv, label: plain text, sub: "\"Cancel\", no role", group: tree, tone: neutral, row: 2 }
  - { id: tab, label: Tab key, sub: focusable elements in DOM order, kind: person, row: 0 }
  - { id: speech, label: Screen reader, sub: "announces name, role, state", kind: person, row: 3 }
edges:
  - { id: m-h1, from: h1, to: axh1 }
  - { id: m-input, from: input, to: axinput }
  - { id: m-button, from: button, to: axbutton }
  - { id: m-div, from: div, to: axdiv }
  - { id: tab1, from: tab, to: axinput, label: Tab }
  - { id: tab2, from: tab, to: axbutton, label: Tab again }
  - { id: say-input, from: axinput, to: speech }
  - { id: say-button, from: axbutton, to: speech }
steps:
  - caption: "A screen reader never sees your pixels. It reads the accessibility tree the browser builds from your HTML: a role, a name and a state for each element."
    focus: [markup, tree]
  - caption: "An <h1> becomes a heading of level 1. Screen reader users jump from heading to heading, and between landmarks such as <nav> and <main>, to find their way around."
    focus: [h1, axh1]
    trace: [m-h1]
  - caption: "A <label> tied to its input gives the textbox its name, \"Email\". States such as required or invalid come with it."
    focus: [input, axinput]
    trace: [m-input]
  - caption: "A <button> gets the role button, and its text becomes its name. It is focusable and responds to Enter and Space, all for free."
    focus: [button, axbutton]
    trace: [m-button]
  - caption: "A <div> with a click handler gets no role at all. In the tree it is just the text \"Cancel\"."
    focus: [div, axdiv]
    trace: [m-div]
  - caption: "The user presses Tab. Focus moves through the focusable elements in DOM order, so it lands on the email field, and the screen reader announces its name, role and state."
    focus: [tab, axinput, speech]
    trace: [tab1, say-input]
  - caption: "Tab again reaches the Pay button, announced as \"Pay, button\". Enter or Space presses it."
    focus: [tab, axbutton, speech]
    trace: [tab2, say-button]
  - caption: "The next Tab skips Cancel entirely. The div isn't focusable, ignores Enter and Space, and is never announced as a button, so a keyboard user can't cancel."
    focus: [div, axdiv, tab]
  - caption: "The fix is a real <button>. role=\"button\" on the div would only change the announcement; you would still need tabindex=\"0\" and your own key handling."
    focus: [div, button]
  - caption: "Sighted keyboard users need to see where focus is. Keep a visible focus ring, with :focus-visible if you like, and don't let a sticky header cover it."
    focus: [tab]
```
