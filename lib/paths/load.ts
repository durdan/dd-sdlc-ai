// Loads learning paths from content/topics/*.md and content/paths/*.md (YAML front matter +
// Markdown), adds the system design paths from public/learn/catalog.json, and checks the lot.
// Any problem fails loudly: pages throw PathsError (so `next dev` shows it and a build stops),
// and `npm run paths:check` prints the same list. Server only: it reads the file system.
import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { CORE_SCHEMA, load as loadYaml } from "js-yaml"
import { z } from "zod"
import { parseTraces } from "./traces"
import { type Bridge, type Lesson, type Path, type PathsData, type Stage, type Topic, type WalkthroughRef } from "./types"

// ---------- Front matter schemas ----------

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lowercase-words-with-dashes")
const line = z.string().trim().min(1)

const lessonString = z
  .string()
  .regex(/^(none|lanes|walkthrough:[a-z0-9-]+)$/, 'use "none", "lanes" or "walkthrough:<library id>"')

const quizItem = z
  .object({
    q: line,
    code: z.string().optional(),
    options: z.array(line).min(2, "a question needs at least two options"),
    answer: z.number().int(),
    explain: line,
  })
  .strict()

const topicSchema = z
  .object({
    id,
    title: line,
    summary: line,
    why: line.optional(),
    requires: z.array(id).default([]),
    lesson: lessonString.default("none"),
    points: z.array(z.object({ title: line, text: line }).strict()).max(4, "at most four points").default([]),
    quiz_hint: line.optional(),
    quiz: z.array(quizItem).default([]),
    links: z.array(z.object({ title: line, url: z.string().url() }).strict()).default([]),
  })
  .strict()

const pathSchema = z
  .object({
    id,
    title: line,
    promise: line,
    kind: z.enum(["skill", "role", "system-design"]),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    stages: z.array(z.object({ title: line, blurb: line, topics: z.array(id).min(1, "a stage needs at least one topic") }).strict()).min(1),
    bridges: z.array(z.union([id, z.object({ id, why: line }).strict()])).default([]),
    next: z.array(id).default([]),
  })
  .strict()

// ---------- Helpers ----------

type CatalogTopic = { id: string; title: string; subtitle?: string; meta?: { kind?: "pattern" | "company"; blurb?: string; uses?: string[]; level?: string } }
type Catalog = { topics: CatalogTopic[]; paths: { id: string; title: string; blurb: string; steps: string[] }[] }

export class PathsError extends Error {
  constructor(public problems: string[]) {
    super(`Learning paths have ${problems.length} problem(s):\n- ${problems.join("\n- ")}\nRun \`npm run paths:check\` for the full report.`)
    this.name = "PathsError"
  }
}

export type CheckResult = { data: PathsData | null; problems: string[]; warnings: string[] }

function splitFrontMatter(raw: string): { fm: string; body: string } | null {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  return m ? { fm: m[1], body: m[2] } : null
}

/** The first paragraph of a body becomes the lead (shown in the side panel and the page intro). */
function splitLead(body: string): { lead: string; rest: string } {
  const text = body.trim()
  const end = text.search(/\n\s*\n/)
  const first = end < 0 ? text : text.slice(0, end)
  if (!first || /^(#|```|[-*+] |>|\d+\.|\||<)/.test(first)) return { lead: "", rest: text }
  return { lead: first.replace(/\s*\n\s*/g, " "), rest: end < 0 ? "" : text.slice(end).trim() }
}

function parseLesson(s: string): Lesson {
  if (s === "none") return { type: "none" }
  if (s === "lanes") return { type: "lanes" }
  return { type: "walkthrough", id: s.split(":")[1] }
}

const KIND_PREFIX = { pattern: "p", company: "c" } as const

function issues(e: z.ZodError) {
  return e.issues.map((i) => `${i.path.length ? i.path.join(".") : "(front matter)"}: ${i.message}`).join("; ")
}

async function readMarkdownDir(dir: string): Promise<{ file: string; raw: string }[]> {
  if (!existsSync(dir)) return []
  const names = (await readdir(dir)).filter((n) => n.endsWith(".md")).sort()
  return Promise.all(names.map(async (n) => ({ file: join(dir, n), raw: await readFile(join(dir, n), "utf8") })))
}

// ---------- The check ----------

export async function checkContent(root = process.cwd()): Promise<CheckResult> {
  const problems: string[] = []
  const warnings: string[] = []
  const rel = (f: string) => relative(root, f)

  const catalog = JSON.parse(await readFile(join(root, "public", "learn", "catalog.json"), "utf8")) as Catalog
  const library = new Map(catalog.topics.map((t) => [t.id, t]))
  const thumb = (tid: string) => (existsSync(join(root, "public", "learn", "thumbs", `${tid}.svg`)) ? `/learn/thumbs/${tid}.svg` : undefined)
  const libraryHref = (t: CatalogTopic) => `/learn/${KIND_PREFIX[t.meta?.kind ?? "pattern"]}/${t.id}`
  const walkthroughRef = (wid: string): WalkthroughRef | undefined => {
    const t = library.get(wid)
    return t && { id: wid, title: t.title, href: libraryHref(t), blurb: t.meta?.blurb ?? t.subtitle ?? "", thumb: thumb(wid) }
  }

  // Topics
  const topics: Record<string, Topic> = {}
  for (const { file, raw } of await readMarkdownDir(join(root, "content", "topics"))) {
    const split = splitFrontMatter(raw)
    if (!split) {
      problems.push(`${rel(file)}: no YAML front matter (the file must start with ---)`)
      continue
    }
    let fm: unknown
    try {
      fm = loadYaml(split.fm, { schema: CORE_SCHEMA, filename: file })
    } catch (e) {
      problems.push(`${rel(file)}: YAML error: ${(e as Error).message.split("\n")[0]}`)
      continue
    }
    const parsed = topicSchema.safeParse(fm)
    if (!parsed.success) {
      problems.push(`${rel(file)}: ${issues(parsed.error)}`)
      continue
    }
    const t = parsed.data
    if (`${t.id}.md` !== file.split("/").pop()) problems.push(`${rel(file)}: id "${t.id}" must match the file name`)
    if (topics[t.id]) {
      problems.push(`${rel(file)}: duplicate topic id "${t.id}"`)
      continue
    }
    if (library.has(t.id)) problems.push(`${rel(file)}: topic id "${t.id}" is already a library topic id; pick another`)
    t.quiz.forEach((q, i) => {
      if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${rel(file)}: quiz ${i + 1}: answer ${q.answer} is out of range (0 to ${q.options.length - 1})`)
      if (new Set(q.options).size !== q.options.length) problems.push(`${rel(file)}: quiz ${i + 1}: options must be different`)
    })
    const lesson = parseLesson(t.lesson)
    if (lesson.type === "walkthrough" && !library.has(lesson.id)) problems.push(`${rel(file)}: lesson walkthrough "${lesson.id}" is not a library topic`)
    // ```trace lanes``` blocks: the lesson for "lanes", and nowhere else.
    const traced = parseTraces(split.body, rel(file), problems, warnings)
    if (traced.count && lesson.type !== "lanes") problems.push(`${rel(file)}: has \`trace lanes\` blocks but lesson is "${t.lesson}"; use lesson: lanes`)
    if (lesson.type === "lanes" && !traced.count) problems.push(`${rel(file)}: lesson "lanes" needs at least one \`trace lanes\` block in the body`)
    const { lead, rest } = splitLead(traced.before)
    if (!lead) warnings.push(`${rel(file)}: the body has no opening paragraph; the panel will show the summary instead`)
    if (lesson.type === "none" && !rest && t.quiz.length === 0) warnings.push(`${rel(file)}: lesson "none" with no explanation or quiz`)
    topics[t.id] = {
      id: t.id,
      title: t.title,
      summary: t.summary,
      why: t.why,
      requires: t.requires,
      lesson,
      traces: traced.traces,
      points: t.points,
      quizHint: t.quiz_hint,
      quiz: t.quiz,
      links: t.links,
      lead: lead || t.summary,
      body: rest,
      notes: traced.after.trim(),
      source: "content",
      walkthrough: lesson.type === "walkthrough" ? walkthroughRef(lesson.id) : undefined,
    }
  }

  // Prerequisites: known ids, no self-references, no cycles.
  for (const t of Object.values(topics)) {
    for (const r of t.requires) {
      if (r === t.id) problems.push(`topic "${t.id}" requires itself`)
      else if (!topics[r]) problems.push(`topic "${t.id}" requires unknown topic "${r}"`)
    }
  }
  const seen = new Map<string, "open" | "done">()
  const visit = (tid: string, trail: string[]) => {
    const s = seen.get(tid)
    if (s === "done") return
    if (s === "open") {
      problems.push(`prerequisite cycle: ${[...trail.slice(trail.indexOf(tid)), tid].join(" → ")}`)
      return
    }
    seen.set(tid, "open")
    for (const r of topics[tid]?.requires ?? []) if (topics[r] && r !== tid) visit(r, [...trail, tid])
    seen.set(tid, "done")
  }
  Object.keys(topics).forEach((tid) => visit(tid, []))

  // Library topics used by system design paths and bridges.
  const libraryTopic = (tid: string): Topic => {
    const t = library.get(tid)!
    return {
      id: t.id,
      title: t.title,
      summary: t.meta?.blurb ?? t.subtitle ?? "",
      requires: (t.meta?.uses ?? []).filter((u) => library.has(u) && u !== t.id),
      lesson: { type: "walkthrough", id: t.id },
      traces: [],
      points: [],
      quiz: [],
      links: [],
      lead: t.meta?.blurb ?? "",
      body: "",
      notes: "",
      source: "library",
      href: libraryHref(t),
      thumb: thumb(t.id),
      walkthrough: walkthroughRef(t.id),
    }
  }
  const bridge = (b: string | { id: string; why: string }, where: string): Bridge | null => {
    const bid = typeof b === "string" ? b : b.id
    const t = library.get(bid)
    if (!t) {
      problems.push(`${where}: bridge "${bid}" is not a library topic id`)
      return null
    }
    return { id: bid, title: t.title, href: libraryHref(t), why: typeof b === "string" ? (t.meta?.blurb ?? "") : b.why, thumb: thumb(bid) }
  }

  // Content paths
  const paths: Path[] = []
  for (const { file, raw } of await readMarkdownDir(join(root, "content", "paths"))) {
    const split = splitFrontMatter(raw)
    if (!split) {
      problems.push(`${rel(file)}: no YAML front matter (the file must start with ---)`)
      continue
    }
    let fm: unknown
    try {
      fm = loadYaml(split.fm, { schema: CORE_SCHEMA, filename: file })
    } catch (e) {
      problems.push(`${rel(file)}: YAML error: ${(e as Error).message.split("\n")[0]}`)
      continue
    }
    const parsed = pathSchema.safeParse(fm)
    if (!parsed.success) {
      problems.push(`${rel(file)}: ${issues(parsed.error)}`)
      continue
    }
    const p = parsed.data
    const where = rel(file)
    if (`${p.id}.md` !== file.split("/").pop()) problems.push(`${where}: id "${p.id}" must match the file name`)
    if (paths.some((q) => q.id === p.id)) {
      problems.push(`${where}: duplicate path id "${p.id}"`)
      continue
    }
    if (catalog.paths.some((q) => q.id === p.id)) problems.push(`${where}: path id "${p.id}" is already a system design path in catalog.json`)
    if (p.kind === "system-design") warnings.push(`${where}: system design paths normally come from catalog.json`)

    const stageOf = new Map<string, [stage: number, pos: number]>()
    p.stages.forEach((s, si) =>
      s.topics.forEach((tid, pos) => {
        if (!topics[tid]) problems.push(`${where}: stage "${s.title}" lists unknown topic "${tid}"`)
        if (stageOf.has(tid)) problems.push(`${where}: topic "${tid}" appears more than once`)
        else stageOf.set(tid, [si, pos])
      }),
    )
    for (const [tid, [si, pos]] of stageOf) {
      for (const r of topics[tid]?.requires ?? []) {
        const at = stageOf.get(r)
        if (!at) continue // a prerequisite from outside this path: shown as a link on the topic, not on the map
        if (at[0] > si || (at[0] === si && at[1] > pos))
          problems.push(`${where}: "${tid}" requires "${r}", which comes later in the path; move "${r}" earlier`)
      }
    }
    for (const n of p.next) if (n === p.id) problems.push(`${where}: next lists the path itself`)
    paths.push({
      id: p.id,
      title: p.title,
      promise: p.promise,
      kind: p.kind,
      level: p.level,
      stages: p.stages,
      bridges: p.bridges.map((b) => bridge(b, where)).filter((b): b is Bridge => b !== null),
      next: p.next,
      intro: split.body.trim(),
      source: "content",
    })
  }

  // System design paths from the catalogue: stages come from the `uses` links between their steps.
  for (const cp of catalog.paths) {
    const where = `catalog.json path "${cp.id}"`
    const steps = cp.steps.filter((s) => {
      if (library.has(s)) return true
      problems.push(`${where}: step "${s}" is not a library topic`)
      return false
    })
    for (const s of steps) if (!topics[s]) topics[s] = libraryTopic(s)
    const depth = new Map<string, number>()
    const depthOf = (s: string, guard: Set<string>): number => {
      if (depth.has(s)) return depth.get(s)!
      if (guard.has(s)) return 0
      guard.add(s)
      const pre = topics[s].requires.filter((u) => steps.includes(u))
      const d = pre.length ? 1 + Math.max(...pre.map((u) => depthOf(u, guard))) : 0
      depth.set(s, d)
      return d
    }
    steps.forEach((s) => depthOf(s, new Set()))
    const levels = Math.max(0, ...depth.values()) + 1
    const names = ["Start here", "Builds on that", "Then", "After that", "Last"]
    const stages: Stage[] = Array.from({ length: levels }, (_, d) => ({
      title: levels === 1 ? "The steps" : (names[d] ?? `Step ${d + 1}`),
      blurb: levels === 1 ? "Each one stands on its own" : d === 0 ? "Needs nothing else first" : `Uses ideas from stage ${d}`,
      topics: steps.filter((s) => depth.get(s) === d),
    }))
    paths.push({ id: cp.id, title: cp.title, promise: cp.blurb, kind: "system-design", stages, bridges: [], next: [], intro: "", source: "catalog" })
  }

  // Links between paths.
  const pathIds = new Set(paths.map((p) => p.id))
  for (const p of paths) for (const n of p.next) if (!pathIds.has(n)) problems.push(`path "${p.id}": next lists unknown path "${n}"`)

  const pathsByTopic: Record<string, string[]> = {}
  for (const p of paths) for (const s of p.stages) for (const tid of s.topics) (pathsByTopic[tid] ??= []).push(p.id)
  for (const t of Object.values(topics)) if (t.source === "content" && !pathsByTopic[t.id]) warnings.push(`topic "${t.id}" is not in any path`)

  return { data: problems.length ? null : { paths, topics, pathsByTopic }, problems, warnings }
}

// ---------- Cached access for pages ----------

let cached: Promise<PathsData> | null = null

/** All paths and topics. Throws PathsError if the content has problems. Re-read on every call in dev. */
export function getPathsData(): Promise<PathsData> {
  if (cached && process.env.NODE_ENV === "production") return cached
  cached = checkContent().then((r) => {
    if (!r.data) throw new PathsError(r.problems)
    return r.data
  })
  return cached
}

export async function getPath(pathId: string) {
  const data = await getPathsData()
  const path = data.paths.find((p) => p.id === pathId)
  if (!path) return null
  const topics = path.stages.flatMap((s) => s.topics.map((tid) => data.topics[tid]))
  const shared = Object.fromEntries(topics.map((t) => [t.id, data.pathsByTopic[t.id].filter((p) => p !== pathId)]))
  return { data, path, topics, shared }
}
