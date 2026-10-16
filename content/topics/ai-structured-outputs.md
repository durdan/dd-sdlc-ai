---
id: ai-structured-outputs
title: Structured outputs your code can trust
summary: JSON schemas, validation and retries
why: As soon as code, not a person, reads the model's answer, "usually the right shape" becomes a production incident. Schemas and validation turn free text into a typed value or a clear error.
requires: [ai-prompting]
lesson: diagram
points:
  - title: Ask for a schema, not "JSON please"
    text: Describe the exact shape with a JSON Schema. Where the provider supports it, let it enforce the schema while generating.
  - title: Validate anyway
    text: A schema guarantees shape, not truth. Check types, ranges, enums and business rules in your own code.
  - title: Retry with the error
    text: When validation fails, send the specific error back and ask for a corrected answer, a bounded number of times.
  - title: Fail closed
    text: After the last retry, return a typed failure your code handles, never a half-parsed guess.
quiz_hint: Separate "is it valid JSON", "does it match the schema" and "is it correct".
quiz:
  - q: "A provider's structured output mode guarantees the response matches your schema. Which check do you still need?"
    options:
      - Whether the values are right, e.g. the extracted total matches the invoice and the date is not in the future
      - None; the guarantee covers everything
      - Whether the JSON has balanced braces
    answer: 0
    explain: "Constrained decoding makes the output parse and fit the schema, but the model can still put a wrong number in a correctly typed field. Business rules and cross-checks against the source stay your job. Also handle refusals and truncated answers, which some APIs report separately."
  - q: Validation failed on the second retry as well. What should the code do?
    options:
      - Keep retrying until it succeeds
      - Return the last output and let the caller deal with it
      - Stop, log the input and errors, and return an explicit failure the caller handles (fallback, human review, or an error message)
    answer: 2
    explain: "Unbounded retries burn money and time on inputs that may never succeed. A fixed retry budget followed by a typed failure keeps the system predictable, and the logged failures become new evaluation cases."
  - q: What is the difference between a JSON mode and schema-enforced structured outputs?
    options:
      - There is none
      - JSON mode only promises syntactically valid JSON; schema enforcement also promises the required fields and types
      - JSON mode is faster because it skips tokenization
    answer: 1
    explain: "Provider docs draw exactly this line: JSON mode yields parseable JSON, but fields can be missing or wrongly typed. Schema-enforced output (often via constrained decoding) adds adherence to your schema. Supported schema features vary by provider, so check the limits."
links:
  - title: Structured outputs (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/structured-outputs
  - title: Structured outputs (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
  - title: Understanding JSON Schema
    url: https://json-schema.org/understanding-json-schema/about
---
When a model's answer feeds into code (an extraction pipeline, a routing decision, a form pre-fill), you need a value with a known shape, not prose. There are three layers to getting one: ask for a precise structure, let the provider enforce it where it can, and validate the result yourself before anything else touches it.

## Layer 1: describe the shape

JSON Schema is the common language. Name every field, give it a type, list allowed values with `enum`, mark what is required, and forbid extra properties. Field descriptions are part of the prompt: the model reads them, so say what each field means and what to put there when the information is absent (often `null` rather than a made-up value).

```json
{
  "type": "object",
  "properties": {
    "category": { "type": "string", "enum": ["billing", "bug", "feature", "other"] },
    "priority": { "type": "integer", "minimum": 1, "maximum": 4 },
    "order_id": { "type": ["string", "null"], "description": "As written in the ticket, or null if none is given" }
  },
  "required": ["category", "priority", "order_id"],
  "additionalProperties": false
}
```

## Layer 2: let the provider enforce it

Several APIs now accept a schema and use constrained decoding: at each step, tokens that would break the schema are not allowed, so the output always parses and fits. Older "JSON mode" options only promise valid JSON, not your fields. Tool or function calling is another route: the arguments of a tool call follow the tool's schema (see the next topic).

Check the provider's list of supported schema keywords; some features (certain formats, recursive schemas, very large enums) may be unsupported or limited. Also handle the cases that are not schema output at all: a refusal, or an answer cut off by the token limit.

## Layer 3: validate and retry

Schema-valid is not the same as correct. Validate with a real validator (Zod, Pydantic, Ajv or similar), then apply business rules: totals add up, dates are plausible, ids exist in your database. When something fails and you have retries left, send the error back so the model can fix that specific problem.

The example uses a fake model that gets it wrong twice before producing a valid answer, so you can watch the loop.

```js run
// A fake model: returns a canned reply per attempt, ignoring the prompt.
const replies = [
  'Sure! Here is the JSON: {"category": "billing", "priority": 2}',
  '{"category": "payments", "priority": 2, "order_id": "A-1001"}',
  '{"category": "billing", "priority": 2, "order_id": "A-1001"}',
]
let calls = 0
async function fakeModel(messages) {
  return replies[Math.min(calls++, replies.length - 1)]
}

const CATEGORIES = ["billing", "bug", "feature", "other"]
function validate(text) {
  let v
  try { v = JSON.parse(text) } catch { return { ok: false, error: "Reply was not valid JSON. Reply with JSON only." } }
  const errors = []
  if (!CATEGORIES.includes(v.category)) errors.push(`category must be one of ${CATEGORIES.join(", ")}`)
  if (!Number.isInteger(v.priority) || v.priority < 1 || v.priority > 4) errors.push("priority must be an integer 1-4")
  if (!("order_id" in v)) errors.push("order_id is required (use null if absent)")
  return errors.length ? { ok: false, error: errors.join("; ") } : { ok: true, value: v }
}

async function classify(ticket, maxAttempts = 3) {
  const messages = [{ role: "user", content: `Classify this ticket as JSON: ${ticket}` }]
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const reply = await fakeModel(messages)
    const result = validate(reply)
    console.log(`attempt ${attempt}:`, result.ok ? "valid" : `invalid (${result.error})`)
    if (result.ok) return { ok: true, value: result.value }
    messages.push({ role: "assistant", content: reply }, { role: "user", content: `Fix this: ${result.error}` })
  }
  return { ok: false, error: "no valid answer after retries" } // fail closed
}

classify("I was charged twice for order A-1001").then((r) => console.log(JSON.stringify(r)))
```

A few practical rules:

- Keep the retry budget small (one or two). If an input fails repeatedly, the prompt or schema needs fixing, and the failure belongs in your evaluation set.
- Do not regex JSON out of prose as a long-term solution. It hides problems that schema enforcement or a better prompt would remove.
- Version your schemas with your prompts. Adding a required field is a breaking change for every stored example and test.
- Keep schemas small and flat where you can. Deeply nested, many-field schemas are harder for models to fill correctly; split one big extraction into a few focused calls if accuracy suffers.

```trace diagram
id: validate-retry
title: From a ticket to a typed value
subtitle: Schema in, validate, retry with the error, fail closed
kind: sequence
elements:
  - { id: caller, label: Caller }
  - { id: code, label: classify() }
  - { id: model, label: Model API }
  - { id: validator, label: Validator }
edges:
  - { id: ask, from: caller, to: code, label: "classify(ticket)" }
  - { id: prompt, from: code, to: model, label: "prompt + JSON Schema" }
  - { id: reply1, from: model, to: code, label: reply text, style: dashed }
  - { id: check1, from: code, to: validator, label: "parse, schema, business rules" }
  - { id: error1, from: validator, to: code, label: "invalid: category must be one of ...", style: dashed }
  - { id: retry, from: code, to: model, label: "the same messages + reply + \"Fix this: ...\"" }
  - { id: reply2, from: model, to: code, label: corrected JSON, style: dashed }
  - { id: check2, from: code, to: validator, label: "parse, schema, business rules" }
  - { id: valid, from: validator, to: code, label: "valid: typed value", style: dashed }
  - { id: ok, from: code, to: caller, label: "{ ok: true, value }", style: dashed }
  - { id: failed, from: code, to: caller, label: "or, after the last retry: { ok: false, error }", style: dotted, flow: reply }
steps:
  - caption: The caller hands over a support ticket and expects a value with a known shape back, not prose.
    trace: [ask]
  - caption: "The request carries a JSON Schema: every field, its type, the allowed categories, what is required, no extra properties. The field descriptions are read by the model too."
    trace: [prompt]
  - caption: Where the provider supports it, constrained decoding blocks any token that would break the schema. Plain JSON mode only promises parseable JSON. Either way, a refusal or an answer cut off by the token limit is not schema output.
    trace: [reply1]
  - caption: So the code always validates. It parses, checks the schema with a real validator, then applies business rules, because a schema guarantees shape, not truth.
    trace: [check1]
  - caption: This reply fails with one specific error. The category is not one of the allowed values.
    trace: [error1]
  - caption: With retries left, the code sends the conversation back with that exact error and asks for a fix. A vague "try again" gives the model nothing to correct.
    trace: [retry, reply2]
  - caption: The corrected reply goes through exactly the same checks. This time it passes and becomes a typed value.
    trace: [check2, valid]
  - caption: The caller gets an explicit success with the value. Nothing downstream ever sees a half-parsed guess.
    trace: [ok]
  - caption: If the last of one or two retries also fails, the code stops, logs the input and the errors, and returns a typed failure the caller handles. Those logged failures become new evaluation cases.
    trace: [failed]
```
