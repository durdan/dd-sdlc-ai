---
id: ai-tool-use
title: "Tool use: the model asks, your code runs"
summary: Function calling as a request-and-reply loop
why: Tools are how a model reads live data and takes actions. The model never runs anything itself; your code decides what executes, which is where both the power and the safety controls live.
requires: [ai-structured-outputs]
lesson: none
points:
  - title: You describe tools
    text: Each tool has a name, a description and a JSON Schema for its arguments. Descriptions are prompts; write them carefully.
  - title: The model only asks
    text: Instead of text, the model can return a tool call with arguments. Your code validates them and decides whether to run it.
  - title: Results go back as messages
    text: You append the call and its result to the conversation and call the model again, until it answers in plain text.
  - title: Bound the loop
    text: Cap the number of rounds, time out slow tools, and return errors as results so the model can recover.
quiz_hint: Follow one request through each message that goes back and forth.
quiz:
  - q: "The model returns a tool call: get_order({ order_id: \"A-1001\" }). What happens next?"
    options:
      - The provider calls your database directly
      - The model waits on the open connection until the tool finishes
      - Your code validates the arguments, checks the user may see that order, runs the lookup, and sends the result back in a new request
    answer: 2
    explain: "For tools you define, the model only produces a request. Your application executes it (or refuses), then sends the result as a tool-result message tied to the call's id, and the model continues from there. Some providers also run built-in server-side tools, such as web search, for you."
  - q: A tool throws because the order does not exist. What is usually the best thing to send back?
    options:
      - Nothing; end the conversation with an error page
      - A tool result marked as an error with a short, safe message like "No order A-1001 for this customer", so the model can tell the user or try something else
      - The full stack trace, so the model can debug it
    answer: 1
    explain: "Errors are information. A clear, non-sensitive error result lets the model ask for a corrected id or explain the problem. Stack traces waste tokens and can leak internals."
  - q: Why put the user's permissions check in your tool code rather than in the prompt?
    options:
      - The model's choice of arguments can be influenced by user input or injected text, so only code can reliably enforce who may do what
      - Prompts are slower to process
      - Models cannot read permission rules
    answer: 0
    explain: "Treat tool arguments like any input from an untrusted client. The prompt can describe the rules, but the tool must enforce them with the real user's identity, exactly as an API endpoint would."
links:
  - title: Tool use overview (Anthropic docs)
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
  - title: Function calling (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/function-calling
  - title: "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al.)"
    url: https://arxiv.org/abs/2210.03629
---
Tool use (also called function calling) lets a model do more than write text. You list the tools it may use, each with a name, a description and a JSON Schema for its arguments. When the model decides a tool would help, its response contains a tool call instead of (or as well as) text. Your code runs the tool, sends the result back, and the model carries on. The model proposes; your application disposes.

## The loop

1. Send the conversation plus tool definitions.
2. If the response asks for one or more tool calls (providers mark this with a stop reason such as `tool_use` or a `tool_calls` field), validate the arguments, run each tool, and append a result message that references the call's id.
3. Call the model again with the extended conversation.
4. Repeat until the model replies with a final answer, or until your own limit stops it.

The Try it block plays this loop with a scripted fake model, so you can see exactly which messages travel each way.

```js run
const tools = {
  get_order: ({ order_id }) => {
    const orders = { "A-1001": { status: "shipped", eta: "Thursday" } }
    if (!orders[order_id]) throw new Error(`No order ${order_id}`)
    return orders[order_id]
  },
}

// Scripted model: first asks for a tool, then answers using the result it was sent.
function fakeModel(messages) {
  const last = messages[messages.length - 1]
  if (last.role === "user") {
    return { stop: "tool_use", calls: [{ id: "call_1", name: "get_order", args: { order_id: "A-1001" } }] }
  }
  const result = JSON.parse(last.content)
  return { stop: "end", text: `Your order has ${result.status} and should arrive ${result.eta}.` }
}

function runTool(call) {
  if (!(call.name in tools)) return { is_error: true, content: `Unknown tool ${call.name}` }
  try {
    return { is_error: false, content: JSON.stringify(tools[call.name](call.args)) }
  } catch (e) {
    return { is_error: true, content: e.message }
  }
}

const messages = [{ role: "user", content: "Where is my order A-1001?" }]
for (let round = 1; round <= 5; round++) {
  const res = fakeModel(messages)
  if (res.stop !== "tool_use") {
    console.log("final answer:", res.text)
    break
  }
  messages.push({ role: "assistant", tool_calls: res.calls })
  for (const call of res.calls) {
    console.log(`round ${round}: model asks ${call.name}(${JSON.stringify(call.args)})`)
    const out = runTool(call)
    console.log(`round ${round}: we send back`, out.content)
    messages.push({ role: "tool", tool_call_id: call.id, ...out })
  }
}
console.log("messages exchanged:", messages.length)
```

## Designing tools

- **Descriptions are prompts.** Say what the tool does, when to use it and when not to, and what each argument means, with formats ("ISO 8601 date", "order id like A-1234").
- **Few, clear tools beat many overlapping ones.** If two tools could both answer a question, the model will sometimes choose the wrong one. Merge or rename them.
- **Return what the model needs, not everything you have.** Trim large responses; tool results count as input tokens on the next call.
- **Make side effects explicit.** Separate read tools from write tools. For writes that matter (payments, emails, deletions), require confirmation from the user or a human, and make them idempotent so a repeated call does no harm.
- **Several calls at once.** Many APIs let the model request several independent tool calls in one turn. Run them concurrently if they are independent, and return every result.

## Your code is the security boundary

The arguments come from a model whose input may include user text and retrieved documents, so treat them exactly like a request from an untrusted client: validate against the schema, check the current user's permissions, apply rate limits, and log what ran. Never let the model choose which credentials to use; give tools only the access they need. A prompt can describe rules, but only code enforces them.

```ts
// Placeholder client and types; the shape is common across providers.
let messages: Message[] = [{ role: "user", content: question }]
for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
  const res = await llm.generate({ model: MODEL, system: SYSTEM, tools: TOOL_DEFINITIONS, messages })
  if (res.stopReason !== "tool_use") return res.text
  messages = [...messages, res.asAssistantMessage()]
  const results = await Promise.all(res.toolCalls.map((call) => runToolSafely(call, currentUser)))
  messages = [...messages, toolResultMessage(results)]
}
throw new Error("Tool loop did not finish")
```
