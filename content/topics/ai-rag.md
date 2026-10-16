---
id: ai-rag
title: Retrieval-augmented generation
summary: Find the right passages, then answer from them
why: A model knows only its training data and your prompt. Retrieval brings in your own, current documents at question time, and lets the answer point to where each claim came from.
requires: [ai-prompting]
lesson: none
points:
  - title: Chunk, embed, store
    text: Split documents into passages, turn each into an embedding vector, and keep vectors with their text and source.
  - title: Search by meaning
    text: Embed the question and find the passages whose vectors are closest, often combined with keyword search.
  - title: Re-rank and trim
    text: A second, more careful scorer reorders the candidates; only the best few go into the prompt.
  - title: Answer with citations
    text: Tell the model to use only the supplied passages, cite them, and say when they do not contain the answer.
quiz_hint: Think about which step decides what the model can possibly see.
quiz:
  - q: Users report wrong answers. You find the right passage was never in the prompt. Which part do you work on?
    options:
      - The generation prompt, telling the model to try harder
      - The sampling temperature
      - Retrieval (chunking, embeddings, hybrid search, re-ranking), measured with its own test set of questions and the passages that should come back
    answer: 2
    explain: "If the evidence is not retrieved, no prompt can recover it. Evaluate retrieval separately (did the right chunk appear in the top k?) from generation (given the right chunk, was the answer right?), so you fix the stage that is actually failing."
  - q: What does cosine similarity between two embedding vectors measure?
    options:
      - The angle between the vectors, used as a proxy for how similar the texts' meanings are
      - How many words the two texts share
      - Which text is longer
    answer: 0
    explain: "Cosine similarity is the dot product of the vectors divided by their lengths, so it ignores magnitude and compares direction. Embedding models are trained so that texts with related meaning point in similar directions. Many providers return normalised vectors, in which case the dot product gives the same ranking."
  - q: Why store the source (document, section, URL) with every chunk?
    options:
      - Vector databases require it
      - So answers can cite where claims came from, users can check them, and you can filter by permissions or freshness
      - It makes embeddings more accurate
    answer: 1
    explain: Provenance is one of RAG's main advantages over relying on what the model memorised. It enables citations, per-user access filters (never retrieve what this user may not read), and deleting or refreshing a document's chunks when it changes.
links:
  - title: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)
    url: https://arxiv.org/abs/2005.11401
  - title: Embeddings (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/embeddings
  - title: Embeddings (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/embeddings
  - title: "Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)"
    url: https://arxiv.org/abs/2307.03172
---
Retrieval-augmented generation (RAG) answers a question in two steps: first search your own documents for the passages most likely to contain the answer, then give those passages to the model with the question and ask it to answer from them. The term comes from a 2020 paper by Lewis et al., which combined a model's built-in ("parametric") knowledge with a searchable index of documents ("non-parametric" memory). Today it usually means a search step wired in front of a general-purpose model.

## Indexing: chunk, embed, store

- **Chunk.** Split documents into passages small enough to be specific and large enough to make sense alone; a few hundred tokens is a common starting point. Split on structure (headings, paragraphs) rather than at fixed character counts, overlap neighbours slightly, and keep the title or heading path with each chunk so it has context.
- **Embed.** An embedding model turns text into a vector of numbers such that texts with related meanings end up close together. Use the same embedding model for documents and questions.
- **Store.** Keep each vector with its text, source, and metadata (owner, permissions, date) in a vector index: a dedicated vector database or a vector extension of a database you already run.

## Retrieval: search, re-rank, trim

At question time, embed the question and find the nearest chunks, usually by cosine similarity. Pure vector search can miss exact terms (product codes, error numbers, names), so many systems run keyword search (such as BM25) alongside and merge the results ("hybrid search"). A **re-ranker**, a slower model that reads the question and each candidate together, then reorders the top few dozen so only the best handful go into the prompt.

The toy below uses word-count vectors instead of a real embedding model, which is enough to show chunking, cosine similarity, top-k and citing sources.

```js run
const docs = [
  { source: "refunds.md", text: "Refunds are issued within 14 days. Refunds go back to the original card. Gift cards cannot be refunded." },
  { source: "shipping.md", text: "Standard shipping takes 3 to 5 days. Express shipping arrives next day. We ship to the EU and UK." },
]

// 1. Chunk: one sentence per chunk here; real chunkers split on structure and size.
const chunks = docs.flatMap((d) =>
  d.text.split(/(?<=\.)\s+/).map((text, i) => ({ id: `${d.source}#${i + 1}`, text })),
)

// 2. "Embed": a bag-of-words count vector. Real embeddings capture meaning, not just shared words.
const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) || []
const embed = (s) => words(s).reduce((v, w) => ((v[w] = (v[w] || 0) + 1), v), {})

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (const k in a) { na += a[k] ** 2; if (k in b) dot += a[k] * b[k] }
  for (const k in b) nb += b[k] ** 2
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

// 3. Retrieve the top k chunks for a question.
function retrieve(question, k = 2) {
  const q = embed(question)
  return chunks
    .map((c) => ({ ...c, score: cosine(q, embed(c.text)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

const question = "How long do refunds take?"
const hits = retrieve(question)
hits.forEach((h) => console.log(h.score.toFixed(3), h.id, "-", h.text))

// 4. Build the prompt with ids the model can cite.
const context = hits.map((h) => `<passage id="${h.id}">${h.text}</passage>`).join("\n")
console.log(`\nAnswer using only these passages and cite their ids. If they do not answer, say so.\n${context}\nQuestion: ${question}`)
```

## Generation: answer from the evidence

Put the passages in clearly delimited, labelled blocks and instruct the model to use only them, to cite passage ids for each claim, and to say when the passages do not contain the answer. Some APIs have built-in citation features that return the exact quoted spans. Your code can then check that every cited id was actually supplied, and show users links to the sources.

## Where RAG goes wrong

- **Retrieval misses.** The answer exists but was not retrieved: chunks too large or too small, missing keyword search, no re-ranking, or the question phrased very differently from the document. Build a retrieval test set of questions with the chunk ids that should come back, and track recall at k.
- **Too much context.** Stuffing in fifty passages raises cost and latency and can make answers worse; models tend to use the beginning and end of long inputs more reliably than the middle.
- **Stale or forbidden data.** Re-index when documents change, delete chunks when documents are deleted, and filter by the user's permissions at query time, before anything reaches the prompt.
- **Poisoned documents.** Retrieved text is untrusted input. A document can contain instructions aimed at the model (indirect prompt injection); see the security topic.
