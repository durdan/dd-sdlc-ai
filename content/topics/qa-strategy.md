---
id: qa-strategy
title: "What to automate: the pyramid and the trophy"
summary: Spend test effort where the bugs are
why: "A suite aimed at the wrong layer ends up slow, brittle and ignored. People stop reading red builds, and real bugs get through."
lesson: none
points:
  - title: Cost against confidence
    text: "Every test gives you some confidence and costs you something: time to write, time to run, and time to fix when it breaks for no good reason."
  - title: The pyramid
    text: "Lots of fast unit tests at the bottom, fewer integration tests in the middle, and only a handful of slow end-to-end tests at the top."
  - title: The trophy
    text: "Static checks at the base and most of the effort in integration tests, because those exercise the code the way it is really used and still run quickly."
  - title: Push each check down
    text: "Whichever shape you pick, test each risk at the cheapest layer that can still catch it."
quiz_hint: Think about which layer is the cheapest that could still see the bug.
quiz:
  - q: "A discount is calculated wrongly when the cart has zero items. Where is the cheapest place to catch that?"
    options:
      - An end-to-end test that fills a cart in the browser
      - A unit test of the discount function
      - A load test
    answer: 1
    explain: "This is pure logic with one input that matters. A unit test pins it down in milliseconds, and when it fails it points straight at the function."
  - q: "A team has hundreds of UI tests, a few unit tests and a lot of manual regression testing. What is the usual problem with this \"ice cream cone\" shape?"
    options:
      - It finds too many bugs
      - Feedback is slow and flaky, and a failure rarely tells you where the bug is
      - Unit tests cannot run in CI
    answer: 1
    explain: "Broad tests are slow, have many moving parts that can break, and fail far away from the cause. The cone flips the pyramid: most of the checking happens at the most expensive layer."
  - q: Which layer does the testing trophy put the most effort into?
    options: [Static analysis, Unit tests, Integration tests, End-to-end tests]
    answer: 2
    explain: "Kent C. Dodds' trophy is widest at integration. Those tests run several units together the way users rely on them, but they skip the cost of a full browser and a deployed system."
links:
  - { title: "TestPyramid (Martin Fowler)", url: "https://martinfowler.com/bliki/TestPyramid.html" }
  - { title: "The Practical Test Pyramid (Ham Vocke, martinfowler.com)", url: "https://martinfowler.com/articles/practical-test-pyramid.html" }
  - { title: "The Testing Trophy and Testing Classifications (Kent C. Dodds)", url: "https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications" }
---
Automated tests are a bet: you spend time now so you don't ship bugs later. A good strategy puts each check at the cheapest layer that can still catch the bug, automates what you would otherwise check by hand again and again, and leaves to people the exploring that scripts cannot do.

## What is worth automating

Automate a check when it will run many times and a human would get bored or careless repeating it:

- **Regressions**: anything that has broken before. Write the test that would have caught it before you fix it.
- **Critical paths**: sign-in, payment, anything that loses data or money when it fails.
- **Logic with many cases**: pricing rules, permissions, date handling, parsers.
- **Contracts between teams**: the API shapes other services depend on.

Some things are not worth scripting: a one-off migration you will check once, a layout that changes every week, or anything the type checker or linter already catches. Exploratory testing, where a person tries to break things in ways nobody planned for, stays a human job. Automation frees time for it.

## Two shapes

The **test pyramid** (popularised by Mike Cohn in *Succeeding with Agile*) says to write many small, fast unit tests, fewer integration tests, and very few end-to-end tests, because the higher you go the slower, more brittle and harder to debug the tests get. Its failure mode is the **ice cream cone**: mostly UI tests and manual checks, with a thin layer of unit tests underneath.

The **testing trophy** (Kent C. Dodds) adds static analysis (types, lint) as the base and makes integration tests the widest part. The reasoning is that a test that uses your code the way real callers do gives more confidence per test, and modern tools make those tests fast enough to run all the time.

The two shapes agree more than they argue. Both say end-to-end tests should be few, and both say a check belongs at the lowest layer that can see the bug. They disagree mainly about what counts as a "unit" and how much to isolate it.

## Matching the bug to the layer

| Risk | Cheapest layer that sees it |
| --- | --- |
| Rounding error in a price rule | Unit test |
| Wrong column name in a SQL query | Integration test with a real database |
| Another team renamed a JSON field | Contract test |
| Button hidden behind a cookie banner | End-to-end test |
| Query fine alone, slow under 200 users | Load test |
| Bad config in one region only | Canary and synthetic checks in production |

When a bug escapes, ask which layer should have caught it, and add the test there, not one layer higher just because that is easier to write.
