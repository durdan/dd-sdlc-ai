---
id: ai-models
title: What a model actually does
summary: Tokens in, one likely next token out, repeated
why: Almost every surprise in an LLM feature (cut-off answers, forgotten instructions, confident wrong facts, bills that grow with conversation length) follows from this one mechanism.
lesson: none
points:
  - title: Text becomes tokens
    text: The model never sees characters or words, only token ids from a fixed vocabulary of word pieces.
  - title: One token at a time
    text: Given every token so far, the model outputs a probability for each possible next token. One is picked, appended, and the loop runs again.
  - title: The context window is all it knows
    text: Instructions, history, documents and the answer being written must all fit in one window. Anything outside it does not exist for that request.
  - title: Plausible is not the same as true
    text: Training rewards likely continuations. A fluent, confident answer can still be wrong, so facts that matter need a source.
quiz_hint: Think about what the model receives on each request, and what it is trained to produce.
quiz:
  - q: A chat feature remembers what the user said ten messages ago. Where does that memory live?
    options:
      - In the model's weights, which update after each message
      - In your request, because your code resends the earlier messages every turn
      - In a hidden session the model keeps on the provider's servers
    answer: 1
    explain: "A model call is stateless: it sees only the tokens in that request. Chat apps resend the conversation (or a summary of it) each turn, which is also why long chats cost more and eventually hit the context limit. Some providers offer server-side conversation storage, but it still feeds the history back in as tokens."
  - q: A request has 2,000 tokens of input and asks for at most 500 output tokens. The model's context window is 2,048 tokens. What is the likely result?
    options:
      - The request is rejected or the answer is cut off, because input and output share the window
      - It works, because only the input counts against the context window
      - The model compresses the input automatically to make room
    answer: 0
    explain: "Input and generated output both occupy the context window. Depending on the provider you get an error up front or an answer that stops early with a 'length' or 'max tokens' stop reason. Your code should check the stop reason rather than assume the answer is complete."
  - q: Why does the same sentence cost a different number of tokens in English and in, say, Thai or Greek?
    options:
      - Providers charge more for some languages on purpose
      - Tokens are always one character, and some languages have longer words
      - The tokenizer's vocabulary was built from training text, so frequent English words are single tokens while rarer scripts split into more pieces
    answer: 2
    explain: Subword vocabularies (such as byte pair encoding) are learned from data. Text that resembles the training data compresses into fewer, longer tokens; other scripts, rare words and long numbers split into more. Count tokens with the provider's tokenizer rather than guessing from characters.
links:
  - title: Attention Is All You Need (Vaswani et al., 2017)
    url: https://arxiv.org/abs/1706.03762
  - title: Neural Machine Translation of Rare Words with Subword Units (Sennrich et al., the BPE paper)
    url: https://arxiv.org/abs/1508.07909
  - title: Summary of the tokenizers (Hugging Face)
    url: https://huggingface.co/docs/transformers/en/tokenizer_summary
  - title: Context windows (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/context-windows
---
A large language model is a function that takes a sequence of tokens and returns a probability for every token that could come next. Generation is that function in a loop: pick a next token, append it, call the function again, and stop at a special end token or a length limit. Everything else (chat, tool calls, JSON output, "reasoning") is built on top of this loop by choosing what goes into the sequence and what you do with what comes out.

## Tokens, not words

Before the model sees your text, a tokenizer splits it into pieces from a fixed vocabulary, usually tens of thousands to a few hundred thousand entries. Common words are often one token; rare words, names, code identifiers and long numbers split into several. The vocabulary is learned from training text (byte pair encoding and its relatives), which is why the same meaning can cost noticeably more tokens in some languages than others.

Tokens matter to you because they are the unit of everything practical: context limits, output limits, latency and price are all counted in tokens. A rough rule for English prose is a few characters per token, but treat that as a guess and use the provider's token-counting tool when a budget matters.

The toy tokenizer below uses greedy longest match against a tiny vocabulary and falls back to single characters. Real tokenizers are trained rather than hand-written, but the effect is the same: familiar text packs into few tokens, unfamiliar text into many.

```js run
const vocab = ["the", "token", "iz", "er", "s", " ", "un", "believ", "able", "ing", "model"]

function tokenize(text) {
  const out = []
  let i = 0
  while (i < text.length) {
    // take the longest vocabulary entry that matches here, else one character
    let match = text[i]
    for (const piece of vocab) {
      if (text.startsWith(piece, i) && piece.length > match.length) match = piece
    }
    out.push(match)
    i += match.length
  }
  return out
}

for (const s of ["the tokenizers", "unbelievable modeling", "zxqv 12345"]) {
  const t = tokenize(s)
  console.log(JSON.stringify(s), "->", t.length, "tokens:", t.join("|"))
}
```

## The context window

Each request has a context window: the maximum number of tokens the model can consider at once, counting your instructions, the conversation so far, any documents you paste in, and the tokens it generates. The model has no memory between requests. If your chat feature "remembers" earlier turns, it is because your code sends them again.

Two consequences follow. First, long conversations get slower and more expensive every turn, and eventually need trimming or summarising. Second, a bigger window is not a perfect memory: research such as *Lost in the Middle* (Liu et al., 2023) found that models often use information at the start or end of a long input better than information buried in the middle. Put the most important instructions and evidence where they are hard to miss, and do not paste in more than the task needs.

## What training does and does not give you

A base model is trained to predict the next token on a large amount of text. Assistant models are then tuned further on examples and human or automated feedback so that they follow instructions and hold a conversation. Neither step teaches the model to check facts. It produces what is likely given its training and your prompt, which is often right and sometimes a confident invention (usually called a hallucination). Its knowledge also stops at a training cutoff.

So design as if the model were a very fast, very well-read colleague who never says "I'm not sure" unless asked: give it the facts it needs (see retrieval), ask it to say when the context does not contain the answer, and verify anything your product presents as true.

## Reading a response

A typical response carries more than text. Look for:

- **Stop reason**: did it finish naturally, hit your output limit, or stop to call a tool? An answer that stopped at the limit is incomplete.
- **Usage**: input and output token counts for that call. Log them; they are your cost and latency data.
- **Content blocks**: modern APIs return a list of typed parts (text, tool calls, sometimes reasoning), not one string.

```ts
// Placeholder client; real SDKs differ in names but return similar fields.
const res = await llm.generate({ model: MODEL, maxOutputTokens: 500, messages })
if (res.stopReason === "max_tokens") {
  // incomplete: raise the limit, ask for less, or continue in a follow-up call
}
log.info({ inputTokens: res.usage.inputTokens, outputTokens: res.usage.outputTokens })
```
