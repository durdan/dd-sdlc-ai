---
id: ai-sampling
title: "Sampling: temperature, top-p and determinism"
summary: How one token is chosen from many
why: The same prompt can give different answers on every call. Knowing why tells you when to turn the randomness down, when to leave it, and why you can never rely on it being zero.
requires: [ai-models]
lesson: none
points:
  - title: The model gives odds, not an answer
    text: Each step produces a probability for every token. A sampler then picks one.
  - title: Temperature reshapes the odds
    text: Low temperature sharpens the distribution towards the top choice; high temperature flattens it so unlikely tokens get picked more often.
  - title: Top-p cuts off the tail
    text: Nucleus sampling keeps only the smallest set of tokens whose probabilities add up to p, then samples from those.
  - title: Zero is not a guarantee
    text: Even at temperature 0, providers do not promise identical output for identical input. Design and test for variation.
quiz_hint: Picture the probability bars for the next token, and what each setting does to them.
quiz:
  - q: You classify support tickets into five fixed labels. Which sampling setup fits best?
    options:
      - High temperature, so the model considers more labels
      - Low temperature (or the provider's default for deterministic tasks), plus structured output limited to the five labels
      - Top-p of 1.0 and temperature 2.0, for maximum coverage
    answer: 1
    explain: "For a task with one right answer you want the most likely label, so reduce randomness. Constraining the output to the allowed labels removes a whole class of errors. High temperature only adds noise here."
  - q: You set temperature to 0 and send the same prompt twice. The answers differ slightly. What is the most likely explanation?
    options:
      - Providers do not guarantee bit-for-bit determinism; batching, hardware and floating-point effects can change which token wins a near-tie
      - The API ignored your setting
      - Temperature 0 means maximum randomness
    answer: 0
    explain: "Temperature 0 approximates greedy decoding, but provider documentation says results will still not be fully deterministic. When two tokens are almost equally likely, tiny numerical differences can flip the choice, and everything after it diverges. Tests should check properties of the answer, not exact strings."
  - q: With top-p = 0.9, which tokens can be sampled?
    options:
      - The 90% of the vocabulary with the highest probability
      - Only tokens whose individual probability is above 0.9
      - The smallest set of most likely tokens whose probabilities sum to at least 0.9
    answer: 2
    explain: Top-p (nucleus) sampling sorts tokens by probability and keeps adding them until the running total reaches p. When the model is confident that set may be one or two tokens; when it is unsure, the set is larger.
links:
  - title: The Curious Case of Neural Text Degeneration (Holtzman et al., nucleus sampling)
    url: https://arxiv.org/abs/1904.09751
  - title: Generation strategies (Hugging Face Transformers)
    url: https://huggingface.co/docs/transformers/main/en/generation_strategies
  - title: Messages API reference, temperature and top_p (Anthropic docs)
    url: https://platform.claude.com/docs/en/api/messages/create
---
At every step the model returns a score (a logit) for every token in its vocabulary. A softmax turns those scores into probabilities, and a sampler picks one token. Sampling settings change only that last step: the model's knowledge and the prompt are untouched, but which of the likely continuations you get, and how adventurous it is, depends on them.

## Temperature

Temperature divides the scores before the softmax. Below 1 it exaggerates the gaps, so the top token wins more often; above 1 it shrinks them, so less likely tokens get a real chance. As temperature approaches 0, sampling becomes greedy decoding: always take the single most likely token.

## Top-p and top-k

Top-k keeps the k most likely tokens and discards the rest. Top-p (nucleus sampling, from Holtzman et al.) keeps the smallest set of tokens whose probabilities add up to p. Both exist to cut off the long tail of unlikely tokens that produce nonsense when sampled; top-p adapts to how confident the model is at each step. A common recommendation is to adjust temperature or top-p, not both at once.

Run this to see both on a made-up distribution for the word after "The capital of France is". The random generator is seeded so the counts are repeatable.

```js run
const logits = { Paris: 6.0, paris: 3.5, Lyon: 2.0, a: 1.5, the: 1.2, banana: -1 }

function softmax(scores, temperature) {
  const entries = Object.entries(scores).map(([t, s]) => [t, s / temperature])
  const max = Math.max(...entries.map(([, s]) => s))
  const exps = entries.map(([t, s]) => [t, Math.exp(s - max)])
  const sum = exps.reduce((a, [, e]) => a + e, 0)
  return exps.map(([t, e]) => [t, e / sum]).sort((a, b) => b[1] - a[1])
}

function topP(probs, p) {
  const kept = []
  let total = 0
  for (const [t, pr] of probs) {
    kept.push([t, pr])
    total += pr
    if (total >= p) break
  }
  return kept.map(([t, pr]) => [t, pr / total]) // renormalise
}

let seed = 42
const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32

function sample(probs, n) {
  const counts = {}
  for (let i = 0; i < n; i++) {
    let r = rand()
    for (const [t, pr] of probs) {
      if ((r -= pr) <= 0) { counts[t] = (counts[t] || 0) + 1; break }
    }
  }
  return counts
}

const fmt = (ps) => ps.map(([t, p]) => `${t} ${(p * 100).toFixed(1)}%`).join(", ")
for (const temp of [0.3, 1, 2]) {
  console.log(`T=${temp}:`, fmt(softmax(logits, temp)))
}
const nucleus = topP(softmax(logits, 1.5), 0.9)
console.log("T=1.5, top-p 0.9 keeps:", fmt(nucleus))
console.log("1000 samples:", JSON.stringify(sample(nucleus, 1000)))
```

## Choosing settings

- **One right answer** (classification, extraction, routing, code that must compile): low temperature, or the provider's recommended default, plus structured output.
- **Many good answers** (brainstorming, varied copy, test data): higher temperature, and generate several candidates if you then pick the best.
- **Defaults are reasonable.** Many teams never touch these knobs and get good results by improving the prompt instead.

At the time of writing, some providers have stopped accepting custom temperature or top-p values on their newest models, especially those that reason before answering. Check the API reference for the model you use instead of assuming every knob exists.

## Determinism is a property you build, not a setting

Even at temperature 0, providers say results will not be fully deterministic: requests are batched with others on shared hardware, and floating-point arithmetic is not associative, so near-ties between tokens can resolve differently. One flipped token early on changes everything after it.

If you need repeatable behaviour:

- Store the output the first time and reuse it (cache by a hash of model, prompt and settings) when the same input must give the same answer.
- Constrain the output (fixed labels, a JSON schema) so variation cannot change the meaning.
- Write tests and evaluations that check properties ("contains the order id", "label is one of five", "grader score at least 4") rather than exact strings, and run them several times.
- Pin the model version where the provider allows it, and re-run your evaluations before switching.
