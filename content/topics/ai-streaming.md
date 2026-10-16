---
id: ai-streaming
title: Streaming responses to users
summary: Show tokens as they are generated
why: A long answer can take many seconds to generate in full. Streaming shows the first words almost immediately, which changes how fast the feature feels, but it also changes how you handle errors, validation and cancellation.
requires: [ai-models]
lesson: none
points:
  - title: Time to first token
    text: Streaming does not make generation faster; it lets users start reading while the rest is produced.
  - title: Events, not one body
    text: The provider sends a sequence of small events (text deltas, tool-call fragments, usage, a final stop reason) over server-sent events or a similar protocol.
  - title: Errors arrive mid-stream
    text: A stream can fail after half the answer is shown. Plan what the user sees when that happens.
  - title: Cancel what nobody reads
    text: When the user navigates away or presses stop, abort the upstream request so you stop paying for tokens.
quiz_hint: Consider what is known at the first event versus the last.
quiz:
  - q: Your feature returns structured JSON that the UI renders as a form. Should you stream it?
    options:
      - Only if you can handle partial JSON (for example a partial-JSON parser or one object per line) and validate the final result before acting on it
      - Yes, always stream; it is always better
      - No, JSON cannot be sent over a stream
    answer: 0
    explain: "Partial JSON is not valid JSON until it is complete. Streaming can still help (showing fields as they fill in), but nothing should be saved or acted on until the full object has arrived and passed validation."
  - q: The stream breaks after 300 of an expected 800 tokens. What is a reasonable behaviour?
    options:
      - Leave the partial answer on screen as if it were complete
      - Mark the answer as interrupted, keep or discard the partial text deliberately, and offer a retry; log the failure with the request id
      - Silently restart the request and append the new answer to the old one
    answer: 1
    explain: "Users should be able to tell an interrupted answer from a finished one. Retrying from scratch is usually simpler than continuing, but the UI must replace, not append to, the partial text."
  - q: Where should the provider's API key live in a streaming chat feature for a web app?
    options:
      - In the browser, so it can stream directly from the provider
      - In a URL query parameter
      - On your server, which calls the provider and relays the stream to the browser
    answer: 2
    explain: Anything shipped to the browser can be read by users. Your backend holds the key, authenticates the user, applies limits, and relays the events, for example as server-sent events or over a WebSocket.
links:
  - title: Streaming messages (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/streaming
  - title: Streaming API responses (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/streaming-responses
  - title: Using server-sent events (MDN)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
---
Without streaming, your code waits for the model to finish the whole answer and then receives it in one response. With streaming, the provider sends the answer as it is generated, as a series of small events, most commonly over server-sent events (SSE). The total time is about the same. What changes is time to first token: users see words appear within a moment instead of staring at a spinner, which matters a lot for chat and long-form answers.

## What arrives

A stream is a sequence of typed events. Names differ by provider, but the shape is similar:

- a start event with ids and metadata,
- many small deltas: pieces of text, and for tool calls, fragments of the arguments' JSON,
- a final event with the stop reason and token usage,
- occasionally an error event, and sometimes keep-alive pings.

Official SDKs assemble these for you and can hand you either each delta or the finished message. If you parse events by hand, accumulate tool-call argument fragments and only parse them once that block is complete.

The fake stream below emits deltas on a timer, the way a real one does, and shows the two numbers that matter for perceived speed.

```js run
async function* fakeStream(text) {
  yield { type: "start" }
  for (const piece of text.match(/\S+\s*/g)) {
    await new Promise((r) => setTimeout(r, 60))
    yield { type: "delta", text: piece }
  }
  yield { type: "stop", reason: "end", usage: { output_tokens: text.split(" ").length } } // words stand in for tokens
}

async function main() {
  const t0 = Date.now()
  let firstAt = null
  let shown = ""
  for await (const ev of fakeStream("Streaming shows the first words quickly while the rest is still being written.")) {
    if (ev.type === "delta") {
      if (firstAt === null) firstAt = Date.now() - t0
      shown += ev.text
      console.log(`+${String(Date.now() - t0).padStart(4)} ms  ${shown}`)
    }
    if (ev.type === "stop") console.log("stop:", ev.reason, JSON.stringify(ev.usage))
  }
  console.log(`first token after ~${firstAt} ms, full answer after ~${Date.now() - t0} ms`)
}
main()
```

## Relaying a stream through your backend

Keep the provider key on your server. The browser calls your endpoint; your server authenticates the user, checks limits, calls the model with streaming on, and forwards text to the browser as it arrives. Propagate cancellation in both directions: if the browser disconnects, abort the upstream request.

```ts
// Placeholder client; a server route that relays model text as server-sent events.
export async function POST(req: Request) {
  const user = await requireUser(req)
  const { messages } = await req.json()
  const upstream = await llm.stream({ model: MODEL, messages, signal: req.signal })

  const body = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
      try {
        for await (const ev of upstream) {
          if (ev.type === "text_delta") send({ text: ev.text })
        }
        send({ done: true })
      } catch (err) {
        send({ error: "interrupted" }) // the UI marks the answer as incomplete
        log.error({ user: user.id, err })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } })
}
```

## Things streaming makes harder

- **Validation.** You cannot validate an answer you have not finished receiving. Stream to the screen if you like, but run output checks (schemas, content filters, link checks) before saving, acting or sending anything further.
- **Rendering.** Markdown arrives half-formed (an open code fence, half a link). Use a renderer that tolerates partial input, and sanitise as you would any untrusted HTML.
- **Errors after success.** HTTP status is sent before the body, so a 200 can still end in an error event or a dropped connection. Show the answer as interrupted and offer a retry.
- **Infrastructure.** Proxies and serverless platforms may buffer responses or close idle connections; check timeouts, disable buffering for the route, and send occasional keep-alives on long answers.
