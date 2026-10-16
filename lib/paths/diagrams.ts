// Flow diagrams: ```trace diagram``` fenced blocks (YAML inside) in a topic body. Each block is one
// diagram of a "diagram" lesson: boxes (or sequence participants), arrows, and the steps that light
// them up one at a time. They become design-player diagrams and shots, so they look and animate
// exactly like the library's walkthroughs. Parsing is pure (pages and the checker share it);
// layoutFlows() runs ELK once on the server, so pages ship plain coordinates and no layout engine.
import { CORE_SCHEMA, load as loadYaml } from "js-yaml"
import { z } from "zod"
import type { C4Diagram, Diagram, DiagramEdge, SequenceDiagram } from "design-player/core"
import type { FlowDiagram } from "./types"

export const DIAGRAM_BLOCK = /^```trace diagram[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase-words-with-dashes")
const line = z.string().trim().min(1)
const tone = z.enum(["core", "stream", "external", "data", "neutral"])
/** What a box is (its colour and icon); worked out from tone, kind and words when left out. */
const role = z.enum(["client", "service", "data", "cache", "queue", "security", "edge", "external"])
/** What an arrow carries (its colour); solid reads as main, dashed as reply, dotted as async when left out. */
const flow = z.enum(["main", "reply", "async", "security", "data"])
const ids = z.union([id, z.array(id)]).transform((v) => (Array.isArray(v) ? v : [v]))

const element = z
  .object({
    id,
    label: line,
    sub: line.optional(),
    kind: z.enum(["person", "system", "container", "component", "external", "store"]).default("container"),
    tone: tone.optional(),
    role: role.optional(),
    group: id.optional(),
    /** Row from the top (0, 1, 2, ...): rows are laid out in order and groups wrap their members. */
    row: z.number().int().min(0).optional(),
  })
  .strict()

const edge = z
  .object({ id: id.optional(), from: id, to: id, label: line.optional(), style: z.enum(["solid", "dashed", "dotted"]).default("solid"), flow: flow.optional() })
  .strict()

const step = z
  .object({ caption: line, focus: ids.default([]), trace: ids.default([]), note: line.optional() })
  .strict()

const diagramSchema = z
  .object({
    id,
    title: line,
    subtitle: line.optional(),
    kind: z.enum(["c4", "sequence"]).default("c4"),
    direction: z.enum(["DOWN", "RIGHT"]).default("DOWN"),
    groups: z.array(z.object({ id, label: line, tone: tone.optional() }).strict()).default([]),
    elements: z.array(element).min(2, "a diagram needs at least two elements"),
    edges: z.array(edge).min(1, "a diagram needs at least one edge"),
    steps: z.array(step).min(2, "a diagram lesson needs at least two steps"),
    note: line.optional(),
  })
  .strict()

export type ParsedDiagrams = {
  /** Parsed and checked, without layouts yet (see layoutFlows). */
  diagrams: Omit<FlowDiagram, "layout" | "portrait">[]
  /** The body before the first diagram block (the whole body if there are none). */
  before: string
  /** The body after the first diagram block, with any further diagram blocks taken out. */
  after: string
  count: number
}

/** Splits diagram blocks out of a body and parses them. `where` prefixes every problem. */
export function parseDiagrams(body: string, where: string, problems: string[], warnings: string[]): ParsedDiagrams {
  const blocks = [...body.matchAll(DIAGRAM_BLOCK)]
  if (!blocks.length) return { diagrams: [], before: body, after: "", count: 0 }
  const first = blocks[0].index ?? 0
  const before = body.slice(0, first)
  const after = body.slice(first).replace(DIAGRAM_BLOCK, "").replace(/\n{3,}/g, "\n\n")
  const diagrams: ParsedDiagrams["diagrams"] = []
  blocks.forEach((m, i) => {
    const d = parseDiagram(m[1], `${where}: diagram ${i + 1}`, problems, warnings)
    if (!d) return
    if (diagrams.some((o) => o.id === d.id)) problems.push(`${where}: diagram ${i + 1}: duplicate diagram id "${d.id}"`)
    diagrams.push(d)
  })
  return { diagrams, before, after, count: blocks.length }
}

function parseDiagram(yaml: string, where: string, problems: string[], warnings: string[]): ParsedDiagrams["diagrams"][number] | null {
  let raw: unknown
  try {
    raw = loadYaml(yaml, { schema: CORE_SCHEMA })
  } catch (e) {
    problems.push(`${where}: YAML error: ${(e as Error).message.split("\n")[0]}`)
    return null
  }
  const parsed = diagramSchema.safeParse(raw)
  if (!parsed.success) {
    problems.push(`${where}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(block)"}: ${i.message}`).join("; ")}`)
    return null
  }
  const t = parsed.data
  where = `${where} ("${t.id}")`
  const before = problems.length
  const bad = (msg: string) => problems.push(`${where}: ${msg}`)
  const seq = t.kind === "sequence"

  const elementIds = t.elements.map((e) => e.id)
  const groupIds = t.groups.map((g) => g.id)
  const dupes = (list: string[]) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))]
  for (const d of dupes(elementIds)) bad(`element id "${d}" is used twice`)
  for (const d of dupes(groupIds)) bad(`group id "${d}" is used twice`)
  for (const g of groupIds) if (elementIds.includes(g)) bad(`"${g}" is both a group and an element id`)
  if (seq) {
    if (t.groups.length) bad("sequence diagrams have no groups")
    if (t.elements.some((e) => e.sub || e.group || e.tone || e.row !== undefined || e.kind !== "container"))
      bad("sequence participants take only id, label and role (no sub, kind, tone, group or row)")
  } else {
    for (const e of t.elements) if (e.group && !groupIds.includes(e.group)) bad(`element "${e.id}" is in unknown group "${e.group}" (groups: ${groupIds.join(", ") || "none"})`)
    for (const g of groupIds) if (!t.elements.some((e) => e.group === g)) bad(`group "${g}" has no elements`)
    const rows = t.elements.filter((e) => e.row !== undefined).length
    if (rows && rows !== t.elements.length) bad("give every element a row, or none")
  }
  if (t.elements.length > 16) warnings.push(`${where}: ${t.elements.length} elements; more than 16 gets hard to read on phones`)

  // Edges: automatic ids e1, e2, ... in order, unless given.
  const edges: DiagramEdge[] = t.edges.map((e, i) => ({ id: e.id ?? `e${i + 1}`, from: e.from, to: e.to, ...(e.label ? { label: e.label } : {}), ...(e.style !== "solid" ? { style: e.style } : {}), ...(e.flow ? { flow: e.flow } : {}) }))
  const edgeIds = edges.map((e) => e.id)
  for (const d of dupes(edgeIds)) bad(`edge id "${d}" is used twice${/^e\d+$/.test(d) ? " (edges without an id are numbered e1, e2, ...)" : ""}`)
  for (const e of edges) {
    if (elementIds.includes(e.id) || groupIds.includes(e.id)) bad(`edge id "${e.id}" is also an element or group id`)
    for (const end of [e.from, e.to]) if (!elementIds.includes(end)) bad(`edge "${e.id}" (${e.from} → ${e.to}) refers to unknown element "${end}"`)
    if (e.from === e.to && !seq) bad(`edge "${e.id}" goes from "${e.from}" to itself; only sequence diagrams allow that`)
  }

  const focusable = [...elementIds, ...groupIds]
  t.steps.forEach((s, i) => {
    const at = `step ${i + 1}`
    for (const f of s.focus) if (!focusable.includes(f)) bad(`${at}: focus "${f}" is not an element${seq ? "" : " or group"} id`)
    for (const r of s.trace) if (!edgeIds.includes(r)) bad(`${at}: trace "${r}" is not an edge id (edges: ${edgeIds.join(", ")})`)
    if (dupes(s.trace).length) bad(`${at}: trace lists an edge twice`)
  })
  const unused = [...new Set(elementIds)].filter((e) => !t.steps.some((s) => s.focus.includes(e) || s.trace.some((r) => edges.some((x) => x.id === r && (x.from === e || x.to === e)))))
  if (unused.length && t.steps.every((s) => s.focus.length || s.trace.length)) warnings.push(`${where}: no step lights ${unused.map((u) => `"${u}"`).join(", ")}`)

  // A diagram with broken references is not laid out (ELK would only repeat the same problem).
  if (problems.length > before) return null

  const diagram: Diagram = seq
    ? ({ id: t.id, kind: "sequence", title: t.title, participants: t.elements.map((e) => ({ id: e.id, label: e.label, ...(e.role ? { role: e.role } : {}) })), messages: edges } satisfies SequenceDiagram)
    : ({
        id: t.id,
        kind: "c4",
        title: t.title,
        direction: t.direction,
        groups: t.groups.map((g) => ({ id: g.id, label: g.label, ...(g.tone ? { tone: g.tone } : {}) })),
        elements: t.elements.map((e) => ({
          id: e.id,
          kind: e.kind,
          label: e.label,
          ...(e.sub ? { sub: e.sub } : {}),
          ...(e.tone ? { tone: e.tone } : {}),
          ...(e.role ? { role: e.role } : {}),
          ...(e.group ? { group: e.group } : {}),
          ...(e.row !== undefined ? { rank: e.row } : {}),
        })),
        edges,
      } satisfies C4Diagram)
  return { id: t.id, title: t.title, subtitle: t.subtitle, diagram, steps: t.steps, note: t.note }
}

/** Lays every diagram out with ELK (plus a top-to-bottom version of left-to-right ones) and checks the result. */
export async function layoutFlows(diagrams: ParsedDiagrams["diagrams"], where: string, problems: string[]): Promise<FlowDiagram[]> {
  const { layoutDiagram } = await import("design-player/layout")
  const out: FlowDiagram[] = []
  for (const d of diagrams) {
    const at = `${where}: diagram "${d.id}"`
    try {
      const layout = await layoutDiagram(d.diagram)
      const portrait = d.diagram.kind === "c4" && d.diagram.direction === "RIGHT" ? await layoutDiagram({ ...d.diagram, direction: "DOWN" }) : undefined
      const nodes = d.diagram.kind === "c4" ? d.diagram.elements.map((e) => e.id) : d.diagram.participants.map((p) => p.id)
      const edges = d.diagram.kind === "c4" ? d.diagram.edges : d.diagram.messages
      for (const l of [layout, portrait]) {
        if (!l) continue
        const missing = [...nodes.filter((n) => !l.nodes[n]), ...edges.filter((e) => (l.edges[e.id]?.points.length ?? 0) < 2).map((e) => e.id)]
        if (missing.length) problems.push(`${at}: the layout has no place for ${missing.join(", ")}`)
      }
      out.push({ ...d, layout, ...(portrait ? { portrait } : {}) })
    } catch (e) {
      problems.push(`${at}: layout failed: ${(e as Error).message.split("\n")[0]}`)
    }
  }
  return out
}

