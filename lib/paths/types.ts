// Plain, serialisable shapes for learning paths. The server builds them from content/*.md
// and public/learn/catalog.json (see load.ts); client components only ever see these.

export type PathKind = "skill" | "role" | "system-design"
export const KIND_ORDER: PathKind[] = ["skill", "role", "system-design"]
export const KIND_LABEL: Record<PathKind, string> = { skill: "Skills", role: "Roles", "system-design": "System design" }

/** Categories on /learn/paths, set with `tags:` in a path's front matter (see content/README.md). */
export const PATH_TAGS = ["web", "languages", "frameworks", "mobile", "backend", "devops", "data", "testing", "security", "ai", "cs", "system-design"] as const
export type PathTag = (typeof PATH_TAGS)[number]
export const TAG_LABEL: Record<PathTag, string> = {
  web: "Web",
  languages: "Languages & runtimes",
  frameworks: "Frameworks",
  mobile: "Mobile",
  backend: "Backend",
  devops: "DevOps & cloud",
  data: "Data & databases",
  testing: "Testing & QA",
  security: "Security",
  ai: "AI",
  cs: "Computer science",
  "system-design": "System design",
}
/** Tags for paths that don't set `tags:` yet, by path id. */
const FALLBACK_TAGS: Record<string, PathTag[]> = {
  javascript: ["web", "languages"],
  node: ["backend", "languages"],
  java: ["languages", "backend"],
  "spring-boot": ["frameworks", "backend"],
  ios: ["mobile"],
  android: ["mobile"],
  "qa-automation": ["testing"],
  "ai-engineering": ["ai"],
}
export const defaultTags = (pathId: string, kind: PathKind): PathTag[] =>
  kind === "system-design" ? ["system-design"] : (FALLBACK_TAGS[pathId] ?? [])

/** "lanes": the topic's ```trace lanes``` blocks are the lesson (see traces.ts). */
export type Lesson = { type: "none" } | { type: "lanes" } | { type: "walkthrough"; id: string }

// ---- Lanes traces: written as ```trace lanes``` blocks in a topic body (parsed by traces.ts) ----

export const LANE_KINDS = ["stack", "queue", "console", "plain"] as const
export type LaneKind = (typeof LANE_KINDS)[number]
export const TONES = ["plain", "muted", "amber", "teal", "blue", "rose", "violet"] as const
export type Tone = (typeof TONES)[number]
export type TraceLane = { id: string; title: string; hint?: string; kind: LaneKind; tone?: Tone }
export type TraceItem = { id: string; label: string; tone?: Tone }
/** One step, with the full state of every lane (carried forward from earlier steps). */
export type TraceStep = { line: number | null; caption: string; state: Record<string, TraceItem[]> }
export type Trace = {
  id: string
  title: string
  subtitle?: string
  /** any: runs in Node and in a browser; node: Node only (no Try it); browser: browser only (the checker doesn't run it). */
  run: "any" | "node" | "browser"
  /** How the checker runs the code in Node: as a .cjs or a .mjs file. */
  module: "cjs" | "esm"
  code: string
  lanes: TraceLane[]
  steps: TraceStep[]
  note?: string
  /** The console lines the code prints, in order; checked against a real run and against the last step. */
  expect?: string[]
}

export type QuizItem = { q: string; code?: string; options: string[]; answer: number; explain: string }
export type LinkRef = { title: string; url: string }

export type Topic = {
  id: string
  title: string
  /** One line, shown on the map node. */
  summary: string
  why?: string
  requires: string[]
  lesson: Lesson
  /** Lesson "lanes": the traces, in the order they appear in the body. */
  traces: Trace[]
  /** Optional numbered key points shown in the page intro. */
  points: { title: string; text: string }[]
  /** Shown after a wrong quiz answer. */
  quizHint?: string
  quiz: QuizItem[]
  links: LinkRef[]
  /** The first paragraph of the Markdown body (inline Markdown only). */
  lead: string
  /** The rest of the body (for lesson "lanes": the part before the first trace block). */
  body: string
  /** Lesson "lanes": the body after the first trace block, shown after the quiz. */
  notes: string
  /** "content": a Markdown topic with its own page. "library": a walkthrough from the library. */
  source: "content" | "library"
  /** For library topics: the walkthrough page and its thumbnail. */
  href?: string
  thumb?: string
  /** For lesson "walkthrough:<id>" (and every library topic): the walkthrough it points to. */
  walkthrough?: WalkthroughRef
}

export type WalkthroughRef = { id: string; title: string; href: string; blurb: string; thumb?: string }

export type Stage = { title: string; blurb: string; topics: string[] }
export type Bridge = { id: string; title: string; href: string; why: string; thumb?: string }

export type Path = {
  id: string
  title: string
  promise: string
  kind: PathKind
  level?: string
  /** Categories on /learn/paths: from `tags:`, or defaultTags() when it is not set. */
  tags: PathTag[]
  stages: Stage[]
  bridges: Bridge[]
  next: string[]
  /** Optional Markdown shown under the map. */
  intro: string
  source: "content" | "catalog"
}

export type PathsData = {
  paths: Path[]
  topics: Record<string, Topic>
  /** Topic id → ids of every path that includes it (progress is shared through these). */
  pathsByTopic: Record<string, string[]>
}

// ---- Layout (computed with elkjs on the server, see layout.ts) ----

export type MapNode = { id: string; x: number; y: number; w: number; h: number; stage: number; kind: "topic" | "bridge" }
export type MapEdge = { id: string; from: string; to: string; kind: "requires" | "in-stage" | "flow"; d: string }
export type MapLayout = {
  width: number
  height: number
  nodes: MapNode[]
  /** One header box per stage (the bridges column, if any, is last). */
  stages: { x: number; y: number; w: number; h: number }[]
  edges: MapEdge[]
}

export type PathsMapLayout = {
  width: number
  height: number
  nodes: { id: string; x: number; y: number; w: number; h: number }[]
  edges: { id: string; from: string; to: string; d: string }[]
}

/** What a path page needs, minus the topic bodies. */
export type PathView = {
  path: Path
  topics: Topic[]
  layout: MapLayout
  /** Topic id → other path ids that include it. */
  shared: Record<string, string[]>
}

export const progressKey = (pathId: string) => `sdlc.path.${pathId}.v1`
export const topicHref = (pathId: string, t: Pick<Topic, "id" | "source" | "href">) =>
  t.source === "library" ? t.href! : `/learn/paths/${pathId}/${t.id}`
