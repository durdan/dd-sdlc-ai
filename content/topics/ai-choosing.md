---
id: ai-choosing
title: RAG, fine-tuning or long context?
summary: Matching the technique to the problem
why: Teams often reach for fine-tuning when the real gap is missing knowledge, or build a retrieval pipeline when the documents would simply fit in the prompt. Each choice has a different cost to build, run and keep up to date.
requires: [ai-rag, ai-evals]
lesson: none
points:
  - title: Missing knowledge points to the context
    text: If the model lacks facts (your docs, today's data), put them in the prompt, either directly or through retrieval.
  - title: Wrong behaviour points to examples
    text: If it knows enough but answers in the wrong format, style or decision pattern, improve prompts and examples first; fine-tune only when that plateaus.
  - title: Long context is the simple baseline
    text: If the material fits comfortably and requests are not too frequent, sending it whole avoids building a retrieval system, especially with prompt caching.
  - title: Let the evals decide
    text: Try the cheapest option first and measure; move to the next only when the eval shows a gap it would close.
quiz_hint: Ask whether the model is missing facts or missing a way of behaving.
quiz:
  - q: An assistant must answer questions about a 3,000-page product manual that changes weekly. What is the usual first choice?
    options:
      - Fine-tune a model on the manual every week
      - Retrieval-augmented generation over the manual, re-indexing the pages that change
      - Paste the whole manual into every request
    answer: 1
    explain: "The manual is too big to send on every request at reasonable cost and latency, and fine-tuning is a poor way to store changing facts (it is slow to update and gives no citations). Retrieval fetches just the relevant pages, can cite them, and updates when the index does."
  - q: Your extraction prompt works, but needs a very long list of examples and still misses your house format 10% of the time on thousands of daily requests. What is a reasonable next step?
    options:
      - Consider fine-tuning (or a provider's equivalent) on a few hundred to thousands of good input-output pairs, then compare it on your eval set against the prompt-only version
      - Add retrieval over the format guide
      - Increase the temperature
    answer: 0
    explain: "Format and style consistency at high volume is where fine-tuning tends to help: it bakes the pattern in, which can also let you drop long few-shot examples and use a smaller model. It still needs a held-out eval to prove it beats the prompt."
  - q: Why is fine-tuning usually a poor way to teach a model new facts?
    options:
      - Fine-tuning is not allowed for facts
      - Fine-tuned models cannot read prompts
      - Learned facts are hard to update or remove, cannot be cited, and may still be mixed up with what the model already believed; retrieval keeps facts editable and traceable
    answer: 2
    explain: "Fine-tuning shifts behaviour well but is an unreliable, opaque store of specific facts. Keeping facts in documents you retrieve means you can fix one by editing a page, delete one when required, and show users the source."
links:
  - title: Optimizing LLM accuracy (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy
  - title: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)
    url: https://arxiv.org/abs/2005.11401
  - title: "LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)"
    url: https://arxiv.org/abs/2106.09685
  - title: Context windows (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/context-windows
---
When an LLM feature falls short, there are three broad ways to improve it beyond rewriting the prompt: give the model more of the right information at request time (long context or retrieval), or change the model itself (fine-tuning). They solve different problems. A helpful first question is whether the model is missing **knowledge** (facts it cannot know) or missing **behaviour** (it knows enough but responds in the wrong way).

## The options

**Better prompts and examples.** Always first. Clear instructions, a few good examples and structured output solve more problems than people expect, cost nothing to build and change in minutes.

**Long context.** Put the whole document, codebase section or conversation into the prompt. Simple, no index to maintain, and the model sees everything at once, which helps tasks that need the whole picture (summarising a contract, comparing two reports). The costs: every request pays for all those tokens, latency grows with input size, the window has a hard limit, and models may use details in the middle of very long inputs less reliably. Prompt caching softens the cost when the same material is reused across many requests.

**Retrieval (RAG).** Index a large or changing body of documents and fetch only the relevant passages per request. Scales to far more material than any window, keeps facts current by re-indexing, supports per-user permissions and citations. The costs: a pipeline to build and evaluate (chunking, embeddings, search, re-ranking), and answers can only be as good as what retrieval finds.

**Fine-tuning.** Train a model further on your examples so that a behaviour becomes the default: a house format, a classification scheme, a tone, a domain's way of reasoning, or a smaller model imitating a larger one on one narrow task. Parameter-efficient methods such as LoRA make this cheaper by training a small set of added weights. The costs: you need a good dataset (often hundreds to thousands of high-quality examples), a training and evaluation process, and retraining when the base model or the target behaviour changes. It is a poor store for facts: hard to update or delete, no citations.

## A comparison

| Need | Long context | Retrieval | Fine-tuning |
| --- | --- | --- | --- |
| Facts from your documents | Good if they fit | Good at any size | Poor |
| Facts that change often | Good | Good (re-index) | Poor (retrain) |
| Citations to sources | Possible | Good | No |
| Consistent format or style at volume | Some help via examples | No | Good |
| Shorter prompts, smaller model | No | Partly | Often |
| Effort to build and maintain | Low | Medium to high | Medium to high |

These combine. A common production setup is retrieval for knowledge, a well-tested prompt for behaviour, and, at high volume, a fine-tuned smaller model for a narrow step such as classification or extraction.

## Deciding in practice

1. Write the eval set first, so each option is measured on the same cases.
2. Try prompt improvements, then long context if the material fits. Measure quality, cost per request and latency.
3. If the material does not fit, is too costly to send every time, changes often, or needs per-user permissions, build retrieval and evaluate retrieval and answers separately.
4. If quality plateaus on format, style or a narrow decision, and you have the volume to justify it, try fine-tuning against the same eval, and keep the prompt-only version as the baseline.

Re-run the comparison when models change. Context windows, caching prices and base-model quality have moved quickly, so a choice that was right a year ago may not be the cheapest or best today.
