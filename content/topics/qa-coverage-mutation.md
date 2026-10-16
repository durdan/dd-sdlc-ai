---
id: qa-coverage-mutation
title: Coverage, its limits, and mutation testing
summary: Code that ran is not code that was checked
why: "A coverage number is easy to raise without catching a single extra bug. Mutation testing measures what coverage can't: whether your tests notice when the code is wrong."
requires: [qa-unit-tests]
lesson: none
points:
  - title: Coverage finds gaps
    text: "A line no test runs is definitely untested. That is the useful part of a coverage report."
  - title: It can't judge quality
    text: "A line that ran may have been checked by nothing. A test with no assertions still adds coverage."
  - title: Mutants
    text: "Mutation testing makes small changes to the code, such as >= to >, and reruns the tests. If every test still passes, the mutant survived, and you have found a gap."
  - title: Use it where it matters
    text: "Mutation runs are slow, so aim them at critical modules or at the files a change touches."
quiz:
  - q: "A test calls parseInvoice(sample) and asserts nothing. What does the coverage report show?"
    options:
      - The lines as uncovered
      - The lines as covered, although the test can't catch any bug in them
      - An error
    answer: 1
    explain: "Coverage counts code that ran, not code that was checked. This is the main reason a coverage percentage says little about how good the tests are."
  - q: "Stryker reports that the mutant changing a > b to a >= b survived. What does that mean?"
    options:
      - The mutant crashed the tests
      - "No test failed when the code changed, so nothing checks the case a == b (or the change makes no difference: an equivalent mutant)"
      - The code is correct
    answer: 1
    explain: "A surviving mutant is a change your suite didn't notice. Usually the fix is a boundary test. Sometimes the mutant behaves the same as the original, and you can mark it as ignored."
  - q: "Management sets a hard 100% line-coverage gate. What usually happens?"
    options:
      - Bugs disappear
      - People write low-value tests to hit the number, and coverage stops telling you anything
      - The build gets faster
    answer: 1
    explain: "Once a measure becomes a target, people work to the number. Fowler suggests reading coverage to find untested code, and not treating it as a score."
links:
  - { title: "TestCoverage (Martin Fowler)", url: "https://martinfowler.com/bliki/TestCoverage.html" }
  - { title: "Stryker Mutator: introduction", url: "https://stryker-mutator.io/docs/" }
---
Coverage tells you which lines and branches ran during the tests. It is good at finding code that no test touches. It can't tell you whether the code that ran was actually checked. Mutation testing goes further: it plants small bugs in the code and counts how many of them your tests catch.

## 100% coverage that misses a bug

Take `isAdult(age)`, implemented as `age >= 18`. Two tests, ages 30 and 10, run every line and both outcomes, so coverage is 100%. Now run them against a few mutants, the same kind of changes a mutation tool makes:

```js run
const original = (age) => age >= 18
const mutants = {
  "age > 18": (age) => age > 18,
  "age < 18": (age) => age < 18,
  "always true": () => true,
  "always false": () => false,
}

// 100% line and branch coverage of the original
const weakSuite = (isAdult) => isAdult(30) === true && isAdult(10) === false
// The same tests plus the boundary: 18 and 17
const strongSuite = (isAdult) => weakSuite(isAdult) && isAdult(18) === true && isAdult(17) === false

for (const [name, suite] of [["weak", weakSuite], ["strong", strongSuite]]) {
  console.log(`${name} suite passes on the original:`, suite(original))
  for (const [m, fn] of Object.entries(mutants)) {
    console.log(`  mutant ${m}:`, suite(fn) ? "survived" : "killed")
  }
}
```

The weak suite lets `age > 18` survive. It can't tell an 18-year-old from a 17-year-old, which is exactly the kind of off-by-one bug that reaches production. Two boundary tests kill it. The coverage number was 100% both times.

## Reading coverage well

- Prefer **branch** coverage to line coverage. A one-line `a && b ? x : y` counts as covered after one run, whichever path that run took.
- Look at what is uncovered and ask whether it worries you: error handling, rarely used options, the retry path. That conversation is worth more than the percentage.
- Expect thoughtful testing to land high (Fowler mentions the upper 80s or 90s), but be wary of a hard 100% gate. It rewards tests written for the number.
- Ratchet rather than gate: fail the build if coverage on *changed* files drops, not if the whole repo misses a target.

## Mutation testing in practice

For JavaScript and TypeScript, [Stryker](https://stryker-mutator.io/docs/) runs your existing test command once per mutant. It changes operators, flips conditions, empties blocks and replaces return values, then reports each mutant as **killed** (some test failed), **survived** (all passed), or not covered (no test reached it). The mutation score is the share of mutants your tests detect.

```sh
npm install --save-dev @stryker-mutator/core
npx stryker init   # asks about your test runner and writes a config file
npx stryker run    # HTML report with each surviving mutant in place
```

Because the suite runs once per mutant, a full run on a large codebase can take a long time. Scope it to the modules where a wrong answer is expensive (pricing, permissions, money) and run it nightly or on changed files. Some survivors are **equivalent mutants**: changes that behave the same as the original. Ignore those; the others usually point to a missing boundary test or a missing assertion.
