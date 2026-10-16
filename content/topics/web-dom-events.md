---
id: web-dom-events
title: The DOM and its events
summary: Capture, target, bubble, delegate
why: "Every click handler you write runs inside this model. It explains why a listener on a list fires for its buttons, and why some events never reach the parent."
requires: [event-loop, web-rendering-path]
lesson: diagram   # the flow diagram block at the end is the lesson
points:
  - title: The DOM is a live tree
    text: "Each tag becomes a node object. Changing a node changes the page, and the browser picks the change up at its next rendering step."
  - title: Three phases
    text: "An event travels down from the window to its target (capture), fires on the target, then travels back up through every ancestor (bubble)."
  - title: target vs currentTarget
    text: "event.target is the element the event happened on; event.currentTarget is the element whose listener is running now."
  - title: Delegate
    text: "One listener on a container can handle events from all of its children, including ones added later, by checking event.target."
quiz_hint: Follow the event's route through the tree, and ask which element each listener is attached to.
quiz:
  - q: "A click listener is on a <ul>. The user clicks a <span> inside a <button> inside an <li>. Inside the listener, what are event.target and event.currentTarget?"
    options: ["Both are the <ul>", "target is the <span>, currentTarget is the <ul>", "target is the <button>, currentTarget is the <li>"]
    answer: 1
    explain: "target is the deepest element the click hit, here the <span>. currentTarget is whoever owns the running listener. That is why delegation code uses event.target.closest(\"button\") to find the element it cares about."
  - q: "Delegation works for click. Why does a focus listener on a form never fire when its inputs get focus?"
    options: ["focus does not bubble; listen for focusin, or use capture", "Forms can't have listeners", "focus only fires on window"]
    answer: 0
    explain: "focus and blur don't bubble (focusin and focusout do). A listener registered with { capture: true } would still see them on the way down."
  - q: What does this print when the button is clicked?
    code: |
      outer.addEventListener("click", () => console.log("outer"))
      button.addEventListener("click", (e) => {
        console.log("button")
        e.stopPropagation()
      })
      outer.addEventListener("click", () => console.log("outer capture"), { capture: true })
    options: ["button", "outer capture, button", "button, outer, outer capture"]
    answer: 1
    explain: "The capture listener on outer runs on the way down, before the target. stopPropagation() on the button then stops the bubble phase, so the plain outer listener never runs."
links:
  - { title: "Event bubbling (MDN)", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling" }
  - { title: "EventTarget.addEventListener() (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" }
  - { title: "Events (DOM Standard)", url: "https://dom.spec.whatwg.org/#events" }
---
The DOM is the page as a tree of objects your script can read and change. When something happens, such as a click, a key press or a form submit, the browser creates an event object and sends it along a path through that tree: down from the window to the target, then back up. Any listener on that path can react, which is what makes event delegation possible.

## The route of one event

The path is fixed when the event is dispatched: the window, the document, and every ancestor of the target. The event then runs in three phases:

1. **Capture**: from the window down to the target's parent. Only listeners added with `{ capture: true }` run here.
2. **Target**: listeners on the target itself.
3. **Bubble**: from the target's parent back up to the window. Ordinary listeners run here.

Not every event bubbles. `focus`, `blur`, `mouseenter` and `mouseleave` don't, while `focusin`, `focusout`, `click`, `input` and `keydown` do. `stopPropagation()` ends the journey after the current element; `preventDefault()` is separate and only cancels the browser's default action, such as following a link or submitting a form.

## Delegation

Instead of one listener per button, put one on the container and find out which child was hit. It uses less memory, and it keeps working for rows added after the listener was attached. This runs in the Try it frame, which has its own document:

```js run
const list = document.createElement("ul")
document.body.append(list)
for (const name of ["apples", "pears"]) {
  const li = document.createElement("li")
  li.innerHTML = `<button data-item="${name}"><span>Remove</span> ${name}</button>`
  list.append(li)
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-item]")
  if (!button || !list.contains(button)) return
  console.log("target:", event.target.tagName, "| currentTarget:", event.currentTarget.tagName)
  console.log("remove", button.dataset.item)
  button.closest("li").remove()
})

// Simulate a user clicking the <span> inside the first button.
list.querySelector("span").dispatchEvent(new MouseEvent("click", { bubbles: true }))
console.log("items left:", list.children.length)
```

`closest()` walks up from the element that was actually hit (here the `<span>`) to the nearest matching ancestor, so it doesn't matter how deep the markup inside the button goes.

## Listeners and the main thread

Listeners run on the main thread as tasks of the event loop, so a slow handler delays the next frame and every other event. For `touchstart`, `touchmove` and `wheel`, pass `{ passive: true }` when you never call `preventDefault()`: the browser can then scroll straight away instead of waiting for your code. Remove listeners you no longer need, or pass an `AbortSignal` with `{ signal }` and abort it to remove a group at once.

```trace diagram
id: click-route
title: The route of one click
subtitle: "A click on a <button> in a list, with one delegated listener on the <ul>"
kind: sequence
elements:
  - { id: window, label: window }
  - { id: document, label: document }
  - { id: ul, label: "<ul>" }
  - { id: li, label: "<li>" }
  - { id: button, label: "<button>" }
edges:
  - { id: cap1, from: window, to: document, label: capture }
  - { id: cap2, from: document, to: ul, label: capture }
  - { id: caplistener, from: ul, to: ul, label: "{ capture: true } listeners" }
  - { id: cap3, from: ul, to: li, label: capture }
  - { id: cap4, from: li, to: button, label: reaches the target }
  - { id: target, from: button, to: button, label: the button's own listeners }
  - { id: bub1, from: button, to: li, label: bubble, style: dashed, flow: main }
  - { id: bub2, from: li, to: ul, label: bubble, style: dashed, flow: main }
  - { id: delegated, from: ul, to: ul, label: "delegated listener: target.closest(\"button\")" }
  - { id: bub3, from: ul, to: document, label: bubble, style: dashed, flow: main }
  - { id: bub4, from: document, to: window, label: bubble, style: dashed, flow: main }
steps:
  - caption: "The user clicks a button inside a list. Before anything runs, the browser fixes the event's path: the window, the document and every ancestor of the target."
    focus: [window, document, ul, li, button]
  - caption: The capture phase goes down that path from the window towards the target. Ordinary listeners don't run on the way down.
    trace: [cap1, cap2]
  - caption: "Only listeners added with { capture: true } run here, so a capture listener on the list fires before the button knows anything happened."
    trace: [caplistener]
  - caption: Capture carries on through the list item and arrives at the button, the target.
    trace: [cap3, cap4]
  - caption: "In the target phase, the button's own listeners run. If one calls preventDefault(), only the browser's default action is cancelled; the event still travels."
    trace: [target]
  - caption: "Then the event bubbles back up through every ancestor, and ordinary listeners run on the way."
    trace: [bub1, bub2]
  - caption: "The list's one listener handles every button. event.target is the element that was hit, event.currentTarget is the <ul>, and closest() finds the button even if a <span> inside it was hit."
    trace: [delegated]
  - caption: The event keeps bubbling to the document and the window, so listeners there see it last.
    trace: [bub3, bub4]
  - caption: "Had the button's listener called stopPropagation(), the bubble would have ended at the button, and the list's delegated listener would never have run."
    focus: [button, ul]
  - caption: "Not every event bubbles. focus and blur stop at the target, so delegate with focusin and focusout, or listen in the capture phase."
    focus: [ul, button]
```
