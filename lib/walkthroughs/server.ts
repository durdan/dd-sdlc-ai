// Walkthrough requests, server side: who is asking, the prompts for the
// script and the system diagram, and the checks around them. The script and
// the diagram are separate model calls so the page can run them at once: the
// script streams while the diagram is drawn.
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod/v4"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { loadRequest, type WalkthroughRequest } from "./store"

export type { RequestStatus, WalkthroughRequest } from "./store"

export const SCRIPT_MODEL = "claude-sonnet-5-5"
export const DIAGRAM_MODEL = "claude-sonnet-5-5"
/** Drafts a user may start per day, and change requests per draft. */
export const DAILY_DRAFTS = 5
export const MAX_REVISIONS = 3

export const anthropic = () => new Anthropic()

/** The signed-in user (Supabase sign-in), or a 401 response. */
export async function currentUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return { error: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }) }
  return { user: data.user }
}

export function isAdmin(email: string | null | undefined) {
  const admins = [process.env.WALKTHROUGH_ADMIN_EMAILS, process.env.NEXT_PUBLIC_ADMIN_EMAIL].join(",").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return !!email && admins.includes(email.toLowerCase())
}

/** A request the user owns (admins may see any), or an error response. */
export async function ownedRequest(id: string) {
  const who = await currentUser()
  if (who.error) return { error: who.error }
  const request = await loadRequest(id)
  if (!request || (request.user_id !== who.user.id && !isAdmin(who.user.email))) {
    return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) }
  }
  return { user: who.user, request }
}

export const RequestInput = z.object({
  topic: z.string().trim().min(3).max(200),
  audience: z.string().trim().max(200).optional().default(""),
  context: z.string().trim().max(4000).optional().default(""),
  allowFeature: z.boolean().optional().default(false),
})

export const Feedback = z.object({ feedback: z.string().trim().max(2000).optional() })

function brief(r: Pick<WalkthroughRequest, "topic" | "audience" | "context">) {
  return [
    `<topic>${r.topic}</topic>`,
    r.audience ? `<audience>${r.audience}</audience>` : "",
    r.context ? `<context>\n${r.context}\n</context>` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

// The chapters follow the library's case-study template, so an approved script
// becomes a walkthrough without restructuring.
const SCRIPT_SYSTEM = `You write the narration script for a short, narrated architecture walkthrough: an animated system diagram with a voice explaining it, in the style of the sdlc.dev library.

Write the script in Markdown with these chapters as "## " headings, in this order:
1. The problem: what the system must do and why it is hard.
2. Requirements: functional needs and the numbers that shape the design (scale, latency, consistency).
3. The big picture: the main parts and how a request flows through them.
4. Deep dive: the one or two components where the design is decided.
5. Data: what is stored where, and why.
6. Failure and scale: what breaks first and how the design copes.
7. Trade-offs: what was given up, and the alternatives.
8. Recap: the design in three or four sentences.

Each chapter is two to four short paragraphs of spoken narration: plain sentences a listener can follow without seeing text, no bullet lists, no code. Refer to components by the names a system diagram would use. Where the user gave context, use it and do not invent facts about their organisation; where a number is an assumption, say so. Keep the whole script under 1,400 words.`

export function scriptRequest(r: WalkthroughRequest, previous?: string | null, feedback?: string): Anthropic.MessageStreamParams {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: brief(r) }]
  if (feedback && previous) {
    messages.push({ role: "assistant", content: previous })
    messages.push({ role: "user", content: `Revise the whole script with this feedback, keeping the same chapters:\n<feedback>${feedback}</feedback>` })
  }
  return {
    model: SCRIPT_MODEL,
    max_tokens: 4000,
    system: SCRIPT_SYSTEM,
    output_config: { effort: "low" },
    messages,
  }
}

// The diagram, as structured output in the library's C4 shape. Kept small on
// purpose: one picture the narration can walk around.
const Kind = z.enum(["person", "system", "container", "component", "external", "store"])
const Tone = z.enum(["core", "stream", "external", "data", "neutral"])
export const DiagramOutput = z.object({
  title: z.string(),
  direction: z.enum(["DOWN", "RIGHT"]),
  groups: z.array(z.object({ id: z.string(), label: z.string(), tone: Tone })),
  elements: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      sub: z.string(),
      kind: Kind,
      tone: Tone,
      group: z.string(),
      rank: z.number().int(),
    }),
  ),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string(),
      style: z.enum(["solid", "dashed", "dotted"]),
    }),
  ),
})
export type DiagramOutput = z.infer<typeof DiagramOutput>

export const DIAGRAM_SYSTEM = `You draw the system diagram for an architecture walkthrough, as a C4-style container diagram.

Rules:
- 6 to 12 elements. Ids are short kebab-case. Labels are 1 to 3 words; "sub" is a short technology or role ("Postgres", "Kafka topic", "iOS and web") or "".
- kind: person for users, external for third-party systems, store for databases, caches and object stores, container for services and apps.
- tone: core for the main request path, stream for queues and async processing, data for stores, external for third parties, neutral for everything else.
- 0 to 3 groups for boundaries such as "Edge", "Core services", "Data"; set an element's group to a group id, or "" for none.
- Edges point the way a request or data flows. Labels are 1 to 3 words ("places order", "publishes"). Use dashed for asynchronous flows, solid otherwise. At most 16 edges.
- rank is the element's row, top to bottom: 0 people and client apps; 1 edge (gateways, load balancers, CDNs); 2 core services; 3 queues, streams and async workers; 4 databases, caches and object stores. Third-party systems take the row of whatever calls them. Every arrow should point down or across a row where it can.
- direction: DOWN.`

export function diagramRequest(r: WalkthroughRequest, feedback?: string) {
  const content = [brief(r), feedback ? `<feedback>${feedback}</feedback>` : ""].filter(Boolean).join("\n")
  return { model: DIAGRAM_MODEL, max_tokens: 3000, system: DIAGRAM_SYSTEM, messages: [{ role: "user" as const, content }] }
}

/** Turn model output into a diagram the library can lay out: unique ids, edges between known boxes. */
export function toDiagram(o: DiagramOutput) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"
  const seen = new Set<string>()
  const elements = o.elements.slice(0, 14).flatMap((e) => {
    const id = slug(e.id)
    if (seen.has(id)) return []
    seen.add(id)
    return [{ ...e, id, sub: e.sub || undefined, group: e.group ? slug(e.group) : undefined, rank: Math.min(5, Math.max(0, e.rank)) }]
  })
  // Close gaps between rows so empty ones take no space.
  const rows = [...new Set(elements.map((e) => e.rank))].sort((a, b) => a - b)
  for (const e of elements) e.rank = rows.indexOf(e.rank)
  const groups = o.groups.map((g) => ({ ...g, id: slug(g.id) })).filter((g) => elements.some((e) => e.group === g.id))
  for (const e of elements) if (e.group && !groups.some((g) => g.id === e.group)) e.group = undefined
  const edges = o.edges
    .map((e, i) => ({ id: `e${i + 1}`, from: slug(e.from), to: slug(e.to), label: e.label || undefined, style: e.style }))
    .filter((e) => seen.has(e.from) && seen.has(e.to) && e.from !== e.to)
    .slice(0, 18)
  return { id: "system", kind: "c4" as const, title: o.title, direction: "DOWN" as const, groups, elements, edges }
}

/** Tell the owner a request was approved (Slack/Discord-style incoming webhook, optional). */
export async function notifyOwner(text: string) {
  const url = process.env.WALKTHROUGH_NOTIFY_WEBHOOK
  if (!url) return
  try {
    await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, content: text }) })
  } catch (e) {
    console.error("walkthrough notify failed", e)
  }
}
