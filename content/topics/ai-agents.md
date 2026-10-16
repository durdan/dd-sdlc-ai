---
id: ai-agents
title: "Agents: loops, plans and stopping"
summary: A model choosing its own next step, within limits
why: Agents can handle open-ended tasks that no fixed pipeline could, at the price of more cost, more latency and more ways to fail. Knowing when not to build one matters as much as knowing how.
requires: [ai-tool-use, ai-evals]
lesson: none
points:
  - title: An agent is a tool loop that decides its own path
    text: The model looks at results so far, picks the next action, and repeats until it judges the task done.
  - title: Prefer a workflow when the steps are known
    text: If you can write the steps down in advance, a fixed chain of model calls is cheaper, faster and easier to test.
  - title: Stopping conditions are not optional
    text: Cap steps, tokens, time and cost; detect repeated actions; stop when the goal check passes or a human is needed.
  - title: Make it observable and resumable
    text: Log every step, persist state, and require approval before irreversible actions.
quiz_hint: Ask who decides the next step, the code or the model, and what stops it.
quiz:
  - q: Every support email must be classified, then answered from the policy, then checked for tone. Agent or workflow?
    options:
      - An agent, because it uses several model calls
      - A workflow (a fixed chain of steps), because the steps and their order are known in advance
      - Neither; one prompt must do everything
    answer: 1
    explain: "When you can list the steps, hard-code them. Each step gets its own prompt and its own eval, and the cost and latency are predictable. Agents earn their overhead when the number and kind of steps depend on what is discovered along the way."
  - q: An agent has called the same search tool with the same query five times in a row. What should a well-built loop do?
    options:
      - Keep going until the step limit, it might work next time
      - Restart the agent from the beginning with the same prompt
      - Detect the repetition and stop or change course (for example, tell the model it is repeating itself, or end with a clear "could not complete" result)
    answer: 2
    explain: "Loops that make no progress are a common agent failure. A step cap stops them eventually; detecting repeated actions or a lack of new information stops them sooner and cheaper, and the trace becomes an eval case."
  - q: Your agent can send emails on the user's behalf. Which control matters most?
    options:
      - A human confirmation step before any email is sent, plus limits on recipients and volume enforced in code
      - A strongly worded instruction not to send bad emails
      - A higher step limit so it can double-check
    answer: 0
    explain: "Irreversible or external actions need a checkpoint the model cannot talk its way past. OWASP lists excessive agency (more permissions or autonomy than the task needs) as a top risk for LLM applications."
links:
  - title: Building effective agents (Anthropic engineering)
    url: https://www.anthropic.com/engineering/building-effective-agents
  - title: "ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al.)"
    url: https://arxiv.org/abs/2210.03629
  - title: "LLM06:2025 Excessive Agency (OWASP GenAI Security Project)"
    url: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
---
"Agent" is used loosely. A useful distinction, drawn for example in Anthropic's guide to building agents, is between **workflows**, where your code fixes the sequence of model calls and tools, and **agents**, where the model decides at each step what to do next, which tool to use and when it is finished. Mechanically an agent is the tool-use loop from the previous topics, run with more freedom and more steps: observe results, choose an action, act, repeat.

## Start without one

The same guide recommends finding the simplest solution that works and adding complexity only when it clearly helps, which often means no agent at all. In order of increasing complexity:

1. **One well-prompted call**, maybe with retrieval.
2. **A workflow**: a fixed chain (classify, then draft, then check), routing (a cheap classifier picks which prompt handles the request), or parallel calls whose results are combined. Each step can be tested on its own.
3. **An agent**: when you cannot know in advance how many steps a task needs or which tools, such as investigating a bug across a codebase or researching a question across many sources.

Agents trade cost and latency for flexibility, and their failures compound: a small mistake in step two can send steps three to twenty in the wrong direction.

## Planning and the loop

Many agents interleave reasoning and acting (the ReAct pattern): the model states what it is trying to find out, calls a tool, reads the result, updates its plan. Some write an explicit plan or to-do list first and revise it as they go; keeping that plan in the context helps on long tasks. Either way, your code owns the loop and the budget.

## Stopping conditions

The model deciding it is done is one way to stop, and not the only one you need. The example runs a fake agent that gets stuck repeating itself and shows the guards that end the run.

```js run
// A fake planner: makes progress, then gets stuck repeating the same search.
const script = [
  { tool: "search", args: "refund policy EU" },
  { tool: "read", args: "policy.md#refunds" },
  { tool: "search", args: "refund policy EU digital goods" },
  { tool: "search", args: "refund policy EU digital goods" },
  { tool: "search", args: "refund policy EU digital goods" },
]
const planner = (step) => script[step] || { tool: "finish", args: "" }

const limits = { maxSteps: 8, maxTokens: 5000, maxRepeats: 2 }

function runAgent() {
  let tokens = 0
  const seen = new Map()
  for (let step = 0; step < limits.maxSteps; step++) {
    const action = planner(step)
    if (action.tool === "finish") return { status: "done", step }

    const key = `${action.tool}:${action.args}`
    seen.set(key, (seen.get(key) || 0) + 1)
    if (seen.get(key) > limits.maxRepeats) return { status: "stopped: repeating", step, action: key }

    tokens += 900 // pretend each step costs this many tokens
    if (tokens > limits.maxTokens) return { status: "stopped: token budget", step, tokens }

    console.log(`step ${step}: ${key} (tokens so far ${tokens})`)
  }
  return { status: "stopped: step limit" }
}
console.log(JSON.stringify(runAgent()))
```

A practical set of limits:

- **Step, token, time and cost caps** per run, enforced by your code.
- **No-progress detection**: repeated identical calls, or several steps without new information.
- **A goal check** where one exists, such as tests passing, the form validating, or every required field being filled.
- **Human checkpoints**: before irreversible or external actions (payments, emails, deletes, deploys), and when the agent is stuck or unsure.
- **A clean failure**: when a limit is hit, return what was found and why it stopped, rather than a made-up final answer.

## Running agents in production

- **Least privilege.** Give the agent only the tools and permissions the task needs, scoped to the current user. Prefer read-only tools; gate writes.
- **Trace everything.** Store each step's input, the model's decision, tool calls and results. Agent bugs are only debuggable from traces, and good traces become eval cases.
- **Persist state.** A long run is a workflow with slow, failure-prone steps; checkpoint after each step so a crash or a provider outage resumes instead of starting over.
- **Evaluate the whole task and the steps.** Measure task success on a set of realistic tasks, and also cost, number of steps and how often it needed a human.
- **Manage the context.** Long runs fill the context window with tool results. Summarise or drop old results, and keep the goal and plan visible.
