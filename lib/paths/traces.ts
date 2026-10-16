// Lanes traces: ```trace lanes``` fenced blocks (YAML inside) in a topic body. Each block is one
// snippet of a lanes lesson: some code, up to six lanes, and the steps that move items between
// them. A step only lists the lanes that changed; the others carry forward, so every parsed step
// holds the full state (stepping back is just showing the previous step). Pure: no file system,
// so pages and the checker share it. Running the code (to check `expect`) is the checker's job.
import { CORE_SCHEMA, load as loadYaml } from "js-yaml"
import { z } from "zod"
import { LANE_KINDS, TONES, type Trace, type TraceItem, type TraceStep } from "./types"

export const TRACE_BLOCK = /^```trace lanes[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase-words-with-dashes")
const line = z.string().trim().min(1)
/** YAML turns `log: 1` or `- true` into numbers and booleans; console text is always a string. */
const text = z.union([z.string(), z.number(), z.boolean()]).transform(String)

const item = z.union([
  text.pipe(z.string().min(1, "an item needs a label")),
  z.object({ id: z.string().trim().min(1).optional(), label: text.pipe(z.string().min(1)), tone: z.enum(TONES).optional() }).strict(),
])

const lane = z
  .object({ id, title: line, hint: line.optional(), kind: z.enum(LANE_KINDS).default("plain"), tone: z.enum(TONES).optional() })
  .strict()

const step = z
  .object({
    line: z.number().int().nullable().optional(),
    caption: line,
    state: z.record(z.string(), z.array(item).nullable()).optional(),
    log: z.union([text, z.array(text)]).optional(),
  })
  .strict()

const traceSchema = z
  .object({
    id,
    title: line,
    subtitle: line.optional(),
    run: z.enum(["any", "node", "browser"]).default("any"),
    module: z.enum(["cjs", "esm"]).default("cjs"),
    code: z.string().trim().min(1),
    lanes: z.array(lane).min(1).max(8),
    steps: z.array(step).min(1),
    note: line.optional(),
    expect: z.array(text).optional(),
  })
  .strict()

export type ParsedBody = {
  traces: Trace[]
  /** The body before the first trace block (the whole body if there are none). */
  before: string
  /** The body after the first trace block, with any further trace blocks taken out. */
  after: string
  count: number
}

/** Splits trace blocks out of a body and parses them. `where` prefixes every problem. */
export function parseTraces(body: string, where: string, problems: string[], warnings: string[]): ParsedBody {
  const blocks = [...body.matchAll(TRACE_BLOCK)]
  if (!blocks.length) return { traces: [], before: body, after: "", count: 0 }
  const first = blocks[0].index ?? 0
  const before = body.slice(0, first)
  const after = body.slice(first).replace(TRACE_BLOCK, "").replace(/\n{3,}/g, "\n\n")
  const traces: Trace[] = []
  blocks.forEach((m, i) => {
    const t = parseTrace(m[1], `${where}: trace ${i + 1}`, problems, warnings)
    if (!t) return
    if (traces.some((o) => o.id === t.id)) problems.push(`${where}: trace ${i + 1}: duplicate trace id "${t.id}"`)
    traces.push(t)
  })
  return { traces, before, after, count: blocks.length }
}

function parseTrace(yaml: string, where: string, problems: string[], warnings: string[]): Trace | null {
  let raw: unknown
  try {
    raw = loadYaml(yaml, { schema: CORE_SCHEMA })
  } catch (e) {
    problems.push(`${where}: YAML error: ${(e as Error).message.split("\n")[0]}`)
    return null
  }
  const parsed = traceSchema.safeParse(raw)
  if (!parsed.success) {
    problems.push(`${where}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(block)"}: ${i.message}`).join("; ")}`)
    return null
  }
  const t = parsed.data
  where = `${where} ("${t.id}")`
  const bad = (msg: string) => problems.push(`${where}: ${msg}`)
  const code = t.code.replace(/\s+$/, "")
  const codeLines = code.split("\n").length

  // Browser-only globals: such code can't be checked in Node, so it has to say so.
  const browserOnly = /\b(window|document|requestAnimationFrame|localStorage)\b/.exec(code.replace(/\/\/.*$/gm, ""))
  if (browserOnly && t.run !== "browser") bad(`the code uses ${browserOnly[1]}, which Node doesn't have; mark the trace run: browser`)

  const laneIds = t.lanes.map((l) => l.id)
  if (new Set(laneIds).size !== laneIds.length) bad("lane ids must be different")
  const consoles = t.lanes.filter((l) => l.kind === "console")
  if (consoles.length > 1) bad("only one lane can be kind: console")
  const consoleId = consoles[0]?.id
  if (t.lanes.length > 6) warnings.push(`${where}: ${t.lanes.length} lanes; more than 6 gets cramped on phones`)
  if (t.expect && !consoleId) bad("expect needs a lane with kind: console to compare against")

  // Where each bare-string id came from, and what each explicit id was called, to catch accidental clashes.
  const bareIds = new Set<string>()
  const explicitIds = new Set<string>()

  let state: Record<string, TraceItem[]> = Object.fromEntries(laneIds.map((l) => [l, []]))
  const steps: TraceStep[] = t.steps.map((s, si) => {
    const at = `step ${si + 1}`
    if (s.line != null && (s.line < 1 || s.line > codeLines)) bad(`${at}: line ${s.line} is outside the code (1 to ${codeLines})`)
    const next = { ...state }
    for (const [laneId, items] of Object.entries(s.state ?? {})) {
      if (!laneIds.includes(laneId)) {
        bad(`${at}: state lists unknown lane "${laneId}" (lanes: ${laneIds.join(", ")})`)
        continue
      }
      if (laneId === consoleId) {
        next[laneId] = (items ?? []).map((it, i) => {
          if (typeof it !== "string") bad(`${at}: console lines are plain strings, not { id, label }`)
          return { id: `${laneId}-${i}`, label: typeof it === "string" ? it : it.label }
        })
        continue
      }
      next[laneId] = (items ?? []).map((it) => {
        if (typeof it === "string") {
          bareIds.add(it)
          return { id: it, label: it }
        }
        const itemId = it.id ?? it.label
        if (it.id) explicitIds.add(it.id)
        return { id: itemId, label: it.label, tone: it.tone }
      })
    }
    if (s.log !== undefined) {
      if (!consoleId) bad(`${at}: log needs a lane with kind: console`)
      else {
        const lines = Array.isArray(s.log) ? s.log : [s.log]
        const prev = next[consoleId]
        next[consoleId] = [...prev, ...lines.map((label, i) => ({ id: `${consoleId}-${prev.length + i}`, label }))]
      }
    }
    // An item can only be in one place at a time.
    const seen = new Map<string, string>()
    for (const l of laneIds) {
      if (l === consoleId) continue
      for (const it of next[l]) {
        const other = seen.get(it.id)
        if (other) bad(`${at}: item id "${it.id}" is in ${other === l ? `lane "${l}" twice` : `lanes "${other}" and "${l}"`}; give one of them its own { id, label }`)
        else seen.set(it.id, l)
      }
    }
    state = next
    return { line: s.line ?? null, caption: s.caption, state: next }
  })
  for (const i of explicitIds) if (bareIds.has(i)) bad(`item id "${i}" is used both as an explicit id and as a plain-string item; rename one`)

  if (t.expect && consoleId) {
    const final = steps[steps.length - 1].state[consoleId].map((x) => x.label)
    if (JSON.stringify(final) !== JSON.stringify(t.expect))
      bad(`the last step's console (${JSON.stringify(final)}) differs from expect (${JSON.stringify(t.expect)})`)
  }
  if (!t.expect) warnings.push(`${where}: no expect, so its output is not checked`)

  return { ...t, code, steps }
}
