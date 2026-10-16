---
id: ai-evals
title: Evaluating LLM features
summary: Golden sets, graders and regression tests
why: Without evaluations every prompt or model change is a guess checked by eye on three examples. With them, you can change things quickly and know what got better and what broke.
requires: [ai-prompting, ai-sampling]
lesson: none
points:
  - title: A golden set of real cases
    text: Collect realistic inputs, including edge cases and past failures, each with the expected answer or the criteria a good answer meets.
  - title: Cheapest reliable grader first
    text: Exact match, schema checks and code-based rules where possible; a rubric-guided model grader where judgement is needed; humans to calibrate both.
  - title: Compare, don't just score
    text: Run old and new versions on the same set and look at which cases flipped, not only the average.
  - title: LLM judges have biases
    text: Model graders can favour longer answers, the first option shown, or their own style. Check them against human labels.
quiz_hint: Ask what would convince a sceptical colleague that the change is an improvement.
quiz:
  - q: Your new prompt raises the average score from 82% to 85%, but four cases that used to pass now fail. What should you do?
    options:
      - Ship it; the average went up
      - Revert immediately; any regression is unacceptable
      - Look at the four regressions; decide whether they matter (some cases are critical), fix them or accept them knowingly, and add them to the set if they reveal a gap
    answer: 2
    explain: "Averages hide flips. Comparing per case shows exactly what changed. Some regressions are acceptable trade-offs, others (a safety case, a key customer's workflow) are not, and that is a decision a person should make with the evidence in front of them."
  - q: You use a model to compare two answers and pick the better one. Which precaution addresses a known bias of LLM judges?
    options:
      - Always put your preferred answer first
      - Run each comparison twice with the order swapped and count it only if both runs agree
      - Use a higher temperature for the judge
    answer: 1
    explain: "Research on LLM-as-a-judge (Zheng et al., 2023) reports position bias (favouring one slot), verbosity bias (favouring longer answers) and self-enhancement bias (favouring answers in their own style). Swapping order, using clear rubrics, and checking agreement with human labels reduce the risk."
  - q: Why run each eval case more than once?
    options:
      - Because outputs vary between runs, so one run can pass or fail by chance
      - Because the first run is always slower
      - To use up the rate limit
    answer: 0
    explain: "Sampling and provider-side non-determinism mean the same input can give different outputs. Running a few times and reporting pass rates (or the share of runs that pass) separates real changes from noise, especially for small sets."
links:
  - title: Define success criteria and build evaluations (Anthropic docs)
    url: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
  - title: Evaluation best practices (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/evaluation-best-practices
  - title: Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., 2023)
    url: https://arxiv.org/abs/2306.05685
---
An evaluation (eval) is a test suite for behaviour that has no single correct string: a fixed set of inputs, a way to grade each output, and a score you can compare between versions. It is what lets you change a prompt, a retrieval setting or a model and say with evidence whether things improved. Teams that ship LLM features reliably usually have evals before they have clever prompts.

## Build the golden set

Start small and real: 20 to 50 cases drawn from actual or realistic usage, then grow it. For each case store the input, and either the expected output or the criteria a good output must meet. Deliberately include:

- typical requests, in proportion to real traffic,
- edge cases: empty input, very long input, other languages, ambiguous questions, questions your system should decline,
- every bug you fix: a production failure becomes a permanent test case.

Keep the set in version control. When you change the expected answers, review the change like code.

## Choose graders

Use the simplest grader that is reliable for each criterion:

- **Code-based checks**: exact match for labels, schema validation, "contains the order id", "under 120 words", "every cited passage id was supplied", "no forbidden phrases". Fast, cheap, deterministic.
- **Model-based grading (LLM-as-judge)**: a model scores the output against a written rubric ("Does the reply answer the customer's question using only the policy? Score 1 to 5 and give a one-line reason"). Useful for tone, faithfulness and completeness, where code cannot judge.
- **Human review**: slow and expensive, so use it to build the golden answers, to calibrate model graders, and to spot-check.

Model graders need care. Studies of LLM judges report position bias, verbosity bias and a tendency to prefer answers resembling their own. Ask for one criterion at a time, give an explicit rubric with examples of each score, swap the order in pairwise comparisons, and measure how often the grader agrees with human labels before trusting it.

## Compare versions case by case

The run below grades two versions of a ticket classifier (fake functions standing in for prompts) on the same golden set, then lists the cases that flipped. The average alone would hide the regression.

```js run
const golden = [
  { input: "I was charged twice", expected: "billing" },
  { input: "App crashes when I log in", expected: "bug" },
  { input: "Please add dark mode", expected: "feature" },
  { input: "Refund my last invoice", expected: "billing" },
  { input: "Error 500 on checkout", expected: "bug" },
  { input: "Can you support SSO?", expected: "feature" },
  { input: "My payment failed", expected: "billing" },
]

// Stand-ins for two prompt versions.
const v1 = (t) => (/charg|refund|invoice/i.test(t) ? "billing" : /crash|error/i.test(t) ? "bug" : "feature")
const v2 = (t) => (/charg|refund|invoice|pay|checkout/i.test(t) ? "billing" : /crash|error/i.test(t) ? "bug" : "feature")

function run(version) {
  return golden.map((c) => ({ ...c, got: version(c.input), pass: version(c.input) === c.expected }))
}
const a = run(v1)
const b = run(v2)
const rate = (rs) => `${rs.filter((r) => r.pass).length}/${rs.length}`
console.log("v1 passes", rate(a), "| v2 passes", rate(b))

a.forEach((r, i) => {
  if (r.pass && !b[i].pass) console.log("REGRESSION:", JSON.stringify(r.input), "expected", r.expected, "v2 said", b[i].got)
  if (!r.pass && b[i].pass) console.log("fixed:", JSON.stringify(r.input))
})
```

## Make it part of the workflow

- **Run evals on every change** to prompts, retrieval settings, tools or model version, in CI if the set is small enough, nightly if not. Treat a drop below a threshold, or a regression on a case marked critical, as a failing build.
- **Run each case more than once** when outputs vary, and report pass rates; with a small set, a one-case difference may be noise.
- **Evaluate stages separately** in pipelines: retrieval recall, then answer quality given correct context, then the end-to-end result. It tells you where to fix.
- **Watch production too.** Offline sets drift away from real usage. Sample live traffic (with appropriate consent and privacy controls), collect user feedback such as thumbs down and corrections, and feed representative cases back into the golden set.
