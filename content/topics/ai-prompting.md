---
id: ai-prompting
title: Writing prompts that work
summary: Clear roles, examples and a definition of done
why: Most poor LLM output comes from an underspecified request, not a weak model. A prompt is a spec; write it like one and keep it in version control.
requires: [ai-models]
lesson: none
points:
  - title: Decide what good looks like first
    text: Write down the success criteria and a handful of test inputs before you write the prompt. Otherwise you cannot tell whether a change helped.
  - title: System for rules, user for the task
    text: Put the stable role, rules and format in the system prompt; put the per-request input in the user message, clearly marked as data.
  - title: Show, don't only tell
    text: Two or three varied input-output examples often fix format and tone faster than paragraphs of instructions.
  - title: Leave a way out
    text: Tell the model what to do when the input is missing, ambiguous or off-topic, so it does not invent an answer.
quiz_hint: Ask what the model can and cannot know from the prompt alone.
quiz:
  - q: Your summariser sometimes invents details that are not in the source text. Which change is most likely to help?
    options:
      - Tell it to use only the text inside the document tags, quote the sentence each claim comes from, and say "not stated" when the text does not cover something
      - Add "be accurate" to the end of the prompt
      - Raise the temperature so it explores more options
    answer: 0
    explain: "A specific rule with a fallback gives the model an acceptable alternative to guessing, and quoting makes unsupported claims easy to spot in review or in an automated check. Vague exhortations change little; more randomness makes invention more likely, not less."
  - q: Where should untrusted user input go?
    options:
      - Inside the system prompt, so the model treats it as important
      - It doesn't matter; the model treats all text the same
      - In the user message, wrapped in clear delimiters and described as data to process, not instructions to follow
    answer: 2
    explain: "Keeping your rules in the system prompt and the user's content in a clearly marked block makes the intended roles clearer to the model. It is not a security boundary (prompt injection can still work), but mixing the two makes both quality and safety worse."
  - q: You change one sentence of a prompt and three spot-checked answers look better. What should you do before shipping?
    options:
      - Ship it; three better answers is a clear improvement
      - Run the change against your saved test set and compare scores with the old prompt, since one fix can quietly break other cases
      - Increase max tokens to be safe
    answer: 1
    explain: "Prompts behave like code with very wide side effects. A fixed evaluation set, run before and after, is how you notice that a fix for one case broke five others. Treat prompts as versioned artifacts with tests."
links:
  - title: Prompt engineering overview (Anthropic docs)
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
  - title: Prompt engineering guide (OpenAI docs)
    url: https://developers.openai.com/api/docs/guides/prompt-engineering
---
A prompt is the whole input you send: a system message with standing instructions, the conversation so far, and the current request. The model has nothing else to go on. Writing a good one is less about magic phrases and more about the things you would give a capable new colleague: who they are working for, what the task is, what a good result looks like, an example or two, and what to do when something is unclear.

## Start from success criteria

Before writing the prompt, write down how you will judge the output. "Summaries are good" is not a criterion; "summary is under 80 words, mentions every action item, invents nothing, and uses the customer's name" is. Collect 10 to 30 realistic inputs, including awkward ones (empty, very long, wrong language, hostile). These become your first evaluation set, and every prompt change is measured against them.

## System and user messages

Most chat APIs separate a **system** prompt (sometimes called developer or instructions) from **user** and **assistant** turns.

- The system prompt holds what stays the same: the role, the audience, rules, tone, output format, and refusal or fallback behaviour.
- The user message holds this request's input. Wrap documents and user-supplied text in clear delimiters (XML-style tags work well with several providers) and say in the instructions that the content inside them is data.
- Previous assistant turns are part of the input too. If an earlier answer was wrong, the model may repeat it; you can edit or drop history your code sends.

```text
SYSTEM
You write replies for Acme's support team. Audience: customers, plain English.
Rules:
- Use only facts from <ticket> and <policy>. If they do not answer the question,
  say you will pass it to a colleague. Never promise refunds.
- Under 120 words. No headings. Sign off as "Acme Support".

USER
<policy>...refund policy text...</policy>
<ticket>...the customer's message...</ticket>
Write the reply.
```

## Examples beat adjectives

Telling a model "concise, friendly, professional" leaves a lot open. Showing it two or three short examples of input and ideal output (few-shot prompting) pins down format, length and tone. Make examples varied, so it does not copy one surface pattern, and make sure they obey your own rules, because the model will imitate them closely, including their mistakes.

## Give it room to work, then a clean answer

For tasks that need several steps (comparisons, maths, multi-part decisions), results often improve if the model works through the problem before committing to an answer. Many current models do this internally when you enable a reasoning or "thinking" option; with others you can ask for the working in a separate tagged section and show users only the final part. Either way, parse the answer from a predictable place rather than from free text.

## Prompts are code

- Keep prompts in version control next to the code that uses them, not pasted into a dashboard nobody reviews.
- Change one thing at a time and re-run the evaluation set; prompt changes often have side effects on cases you did not look at.
- Template carefully: build prompts from parts with clear boundaries instead of string-concatenating user input into your instructions.
- Re-test when you change model or model version. A prompt tuned for one model is not guaranteed to behave the same on another.

```python
# Placeholder client. The prompt lives in a file under version control.
SYSTEM = open("prompts/support_reply.v3.txt").read()

def draft_reply(ticket_text: str, policy_text: str) -> str:
    user = f"<policy>\n{policy_text}\n</policy>\n<ticket>\n{ticket_text}\n</ticket>\nWrite the reply."
    res = llm.generate(model=MODEL, system=SYSTEM, messages=[{"role": "user", "content": user}], max_output_tokens=400)
    return res.text
```
