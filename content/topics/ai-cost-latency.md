---
id: ai-cost-latency
title: Cost and latency
summary: Token budgets, caching, batching and smaller models
why: An LLM feature that works in a demo can be too slow or too expensive at real traffic. Both cost and latency are driven by tokens and model choice, so you can measure them per request and design them down.
requires: [ai-models]
lesson: none
points:
  - title: Measure per request
    text: Log input tokens, output tokens, cache hits, model and latency for every call. You cannot optimise what you do not record.
  - title: Output is the slow part
    text: Input is processed in parallel; output is produced one token at a time. Shorter answers cut latency the most.
  - title: Reuse the stable prefix
    text: Prompt caching makes repeated leading content (system prompt, tools, documents) cheaper and faster, if it stays byte-for-byte the same at the start.
  - title: Right-size each step
    text: Use smaller, faster models for easy steps, batch work that can wait, and keep the large model for what needs it.
quiz_hint: Ask which tokens are generated, which are re-read, and which could be skipped.
quiz:
  - q: You want prompt caching to work well. How should you order the prompt?
    options:
      - Put the user's question first so the model sees it early
      - Order doesn't matter for caching
      - Stable content first (tools, system prompt, reference documents), then the parts that change per request at the end
    answer: 2
    explain: "Caches match on the prompt prefix. Any change, even a timestamp in the system prompt, invalidates the cache from that point on. Keep everything that repeats at the front and identical across requests."
  - q: A summarisation job over 200,000 documents must finish by tomorrow morning. Users are not waiting on it. What fits best?
    options:
      - Send all requests at once from one script and hope rate limits allow it
      - Use the provider's batch API (asynchronous, typically discounted, results within a stated window) or a queue with controlled concurrency
      - Use the largest model available, one request at a time
    answer: 1
    explain: "Work nobody is waiting for does not need low latency. Batch interfaces trade turnaround time for lower price and higher throughput; a queue with backpressure is the alternative when no batch API is available."
  - q: Which change usually reduces time-to-complete-answer the most for a chat reply?
    options:
      - Asking for a shorter answer (and setting a sensible output limit), since output tokens are generated one after another
      - Shortening the system prompt by a few lines
      - Raising the temperature
    answer: 0
    explain: Input tokens are processed in parallel and are relatively quick, while every output token is a sequential step. Halving the answer length roughly halves the generation time; trimming a few input lines barely moves it.
links:
  - title: Prompt caching (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  - title: Prompt caching (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/prompt-caching
  - title: Batch API (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/batch
  - title: Batch processing (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/batch-processing
---
With hosted models you pay per token, separately for input and output, and the model you pick sets the rate. Latency follows the same drivers: how much the model must read, how much it must write, and how big it is. That makes both predictable. Log the token counts and timing of every call, and you can estimate what a feature costs per user and where the seconds go.

## Where the time goes

A response has two phases. Processing the input (often called prefill) happens largely in parallel and shows up as time to first token. Generating the output (decode) is sequential: one token after another. For most chat-style requests the output dominates, so the strongest levers are:

- ask for shorter answers and set an output token limit that fits the task,
- stream, so users read while the rest is generated,
- run independent calls in parallel rather than one after another,
- use a smaller model where quality allows.

## Token budgets

Decide a budget per feature: how many input tokens (system prompt, history, retrieved passages) and output tokens a request may use. Enforce it in code: trim or summarise old conversation turns, cap the number of retrieved chunks, and cap tool rounds in agent loops. Also limit per user and per tenant, since one script calling your endpoint in a loop can run up a large bill. Providers enforce their own rate limits in requests and tokens per minute; handle 429 responses with backoff.

## Prompt caching

When many requests start with the same content, such as a long system prompt, tool definitions or a reference document, providers can reuse the work done on that prefix. Cached input tokens are billed at a reduced rate and processed faster. The details differ: some providers cache automatically, others ask you to mark cache breakpoints; some charge a little extra for the request that writes the cache; entries expire after a period of disuse (at the time of writing, defaults range from a few minutes to about half an hour, with longer options on some APIs); and there is a minimum prompt length below which nothing is cached. Check your provider's page, and confirm hits in the usage numbers each response reports. What is common is the rule that the cache matches a **prefix**: put stable content first, and keep it identical. A timestamp or user name near the top of the system prompt defeats it.

Separately, you can cache whole answers in your own application (keyed by a hash of model, prompt and settings) when identical requests are common and the answer may be reused.

## Batching and model routing

Work that nobody is waiting for (nightly summaries, backfills, evaluation runs) can go through a provider's batch interface: you submit many requests and collect results later, typically at a discount and with a completion window measured in hours. Without one, use a queue with a fixed number of workers so you stay within rate limits.

Not every step needs the largest model. Classification, routing, extraction from short text and simple rewrites often work well on smaller, faster, cheaper models; keep the large model for hard reasoning or long, nuanced writing. Decide with your evaluation set, not by assumption: run each candidate model on it and compare quality, cost and latency together.

The calculator uses made-up relative prices (units per thousand tokens), not real ones. Change the numbers to your provider's current rates to see what caching and routing do to a feature's cost.

```js run
// Made-up relative prices, units per 1,000 tokens. Replace with your provider's current rates.
const PRICES = {
  large: { input: 3, cachedInput: 0.3, output: 15 },
  small: { input: 0.25, cachedInput: 0.025, output: 1.25 },
}

function cost({ model, inputTokens, cachedTokens = 0, outputTokens }) {
  const p = PRICES[model]
  const fresh = inputTokens - cachedTokens
  return (fresh * p.input + cachedTokens * p.cachedInput + outputTokens * p.output) / 1000
}

const perRequest = { inputTokens: 6000, outputTokens: 400 } // 5,000 of the input is a fixed system prompt + tools
const requestsPerDay = 20000
const scenarios = {
  "large model, no caching": { model: "large", ...perRequest },
  "large model, prefix cached": { model: "large", ...perRequest, cachedTokens: 5000 },
  "small model, prefix cached": { model: "small", ...perRequest, cachedTokens: 5000 },
}
for (const [name, s] of Object.entries(scenarios)) {
  const c = cost(s)
  console.log(`${name.padEnd(28)} ${c.toFixed(4)} units/request, ${(c * requestsPerDay).toFixed(0)} units/day`)
}
```

## Watch the totals, not just the averages

Track cost and latency per feature and per tenant, with percentiles (p50, p95, p99), not only averages: long answers, large documents and agent loops create a heavy tail. Alert on sudden changes, which often mean a prompt change made answers longer or a loop stopped terminating.
