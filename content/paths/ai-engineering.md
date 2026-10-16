---
id: ai-engineering
title: "AI engineering: building with large language models"
promise: "How to put a language model inside real software: what it actually computes, how to ask for output your code can trust, how to give it tools and documents, how to test it, and how to keep it fast, affordable and safe."
kind: skill
level: intermediate
stages:
  - title: How models behave
    blurb: Tokens, sampling, prompts, shapes
    topics: [ai-models, ai-sampling, ai-prompting, ai-structured-outputs]
  - title: Models in your system
    blurb: Tools, documents, streams, budgets
    topics: [ai-tool-use, ai-rag, ai-streaming, ai-cost-latency]
  - title: Shipping with confidence
    blurb: Tests, agents, attacks, trade-offs
    topics: [ai-evals, ai-agents, ai-security, ai-choosing]
bridges:
  - id: retry
    why: "Model APIs fail in ordinary ways: rate limits, overloads, timeouts. Retry them with backoff and jitter, and only when the request is safe to repeat."
  - id: circuit-breaker
    why: When a model provider is down or slow, stop sending it traffic for a while and fall back to a smaller model, a cached answer or a plain message.
  - id: rate-limiting
    why: "Providers limit you by requests and tokens per minute, and you should limit your own users too: one runaway loop can spend a month's budget."
  - id: durable-workflows
    why: "A long agent run is a workflow with many slow, failing steps. Persist each step so a crash resumes instead of starting over."
next: [resilience-101]
---
The examples are vendor-neutral: API code uses placeholder names (`llm`, `MODEL`) rather than a real SDK, and the Try it blocks use small fake models so they run in your browser with no network. Provider documentation is linked where a detail differs between vendors.
