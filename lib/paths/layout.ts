// Map layouts, computed with elkjs on the server. Nothing here is placed by hand:
// - a path map: ELK "layered", left to right, one partition (column) per stage and a last
//   column for the bridges. Prerequisites that cross stages are ELK edges, so ELK orders the
//   nodes and routes those arrows. Prerequisites inside a stage, and the stage-to-stage flow,
//   are drawn from the positions ELK produced.
// - the map of paths: ELK "layered" over the `next` links.
import ELK from "elkjs/lib/elk.bundled.js"
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api"
import type { MapEdge, MapLayout, MapNode, Path, PathsData, PathsMapLayout } from "./types"

export const NODE_W = 248
export const NODE_H = 96
export const BRIDGE_H = 104
export const HEADER_H = 60
const HEADER_GAP = 18
const COL_GAP = 60
const ROW_GAP = 22

const elk = new ELK()

type Pt = { x: number; y: number }

/** An orthogonal polyline with rounded corners. */
function rounded(points: Pt[], r = 10): string {
  if (points.length < 2) return ""
  let d = `M${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i - 1]
    const c = points[i]
    const n = points[i + 1]
    const inLen = Math.hypot(c.x - p.x, c.y - p.y)
    const outLen = Math.hypot(n.x - c.x, n.y - c.y)
    const k = Math.min(r, inLen / 2, outLen / 2)
    const a = { x: c.x - ((c.x - p.x) / (inLen || 1)) * k, y: c.y - ((c.y - p.y) / (inLen || 1)) * k }
    const b = { x: c.x + ((n.x - c.x) / (outLen || 1)) * k, y: c.y + ((n.y - c.y) / (outLen || 1)) * k }
    d += ` L${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`
  }
  const last = points[points.length - 1]
  return `${d} L${last.x} ${last.y}`
}

function sectionPoints(e: ElkExtendedEdge, dy: number): Pt[] {
  const s = e.sections?.[0]
  if (!s) return []
  return [s.startPoint, ...(s.bendPoints ?? []), s.endPoint].map((p) => ({ x: Math.round(p.x * 10) / 10, y: Math.round((p.y + dy) * 10) / 10 }))
}

const cache = new Map<string, Promise<MapLayout>>()

export function layoutPath(path: Path, data: PathsData): Promise<MapLayout> {
  const key = JSON.stringify([path.stages, path.bridges.map((b) => b.id), path.stages.flatMap((s) => s.topics.map((t) => data.topics[t]?.requires))])
  if (!cache.has(key)) cache.set(key, computePathLayout(path, data))
  return cache.get(key)!
}

async function computePathLayout(path: Path, data: PathsData): Promise<MapLayout> {
  const stageOf = new Map<string, number>()
  path.stages.forEach((s, i) => s.topics.forEach((t) => stageOf.set(t, i)))
  const bridgeStage = path.stages.length

  const children: ElkNode[] = [
    ...path.stages.flatMap((s, si) =>
      s.topics.map((tid) => ({ id: tid, width: NODE_W, height: NODE_H, layoutOptions: { "elk.partitioning.partition": String(si) } })),
    ),
    ...path.bridges.map((b) => ({ id: `bridge:${b.id}`, width: NODE_W, height: BRIDGE_H, layoutOptions: { "elk.partitioning.partition": String(bridgeStage) } })),
  ]
  const cross: ElkExtendedEdge[] = []
  const inStage: { from: string; to: string }[] = []
  for (const [tid, si] of stageOf) {
    for (const r of data.topics[tid].requires) {
      const rs = stageOf.get(r)
      if (rs === undefined) continue
      if (rs < si) cross.push({ id: `${r}>${tid}`, sources: [r], targets: [tid] })
      else if (rs === si) inStage.push({ from: r, to: tid })
    }
  }

  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.separateConnectedComponents": "false",
      "elk.partitioning.activate": "true",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
      "elk.layered.nodePlacement.strategy": "LINEAR_SEGMENTS",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": String(ROW_GAP),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(COL_GAP),
      "elk.spacing.edgeNode": "12",
      "elk.spacing.edgeEdge": "8",
      "elk.padding": "[top=0,left=0,bottom=0,right=0]",
    },
    children,
    edges: cross,
  }
  const out = await elk.layout(graph)
  const top = HEADER_H + HEADER_GAP
  const minY = Math.min(...(out.children ?? []).map((n) => n.y ?? 0))
  const dy = top - minY

  const nodes: MapNode[] = (out.children ?? []).map((n) => {
    const isBridge = n.id.startsWith("bridge:")
    return {
      id: isBridge ? n.id.slice(7) : n.id,
      x: Math.round(n.x ?? 0),
      y: Math.round((n.y ?? 0) + dy),
      w: n.width ?? NODE_W,
      h: n.height ?? NODE_H,
      stage: isBridge ? bridgeStage : stageOf.get(n.id)!,
      kind: isBridge ? "bridge" : "topic",
    }
  })
  const columns = bridgeStage + (path.bridges.length ? 1 : 0)
  const stages = Array.from({ length: columns }, (_, i) => {
    const xs = nodes.filter((n) => n.stage === i).map((n) => n.x)
    return { x: Math.min(...xs), y: 0, w: NODE_W, h: HEADER_H }
  })

  const edges: MapEdge[] = []
  for (const e of out.edges ?? []) {
    const [from, to] = e.id.split(">")
    edges.push({ id: e.id, from, to, kind: "requires", d: rounded(sectionPoints(e as ElkExtendedEdge, dy)) })
  }
  // Inside a stage: a short arrow between neighbours, or a curve along the left edge for a skip.
  const byId = new Map(nodes.map((n) => [n.id, n]))
  for (const { from, to } of inStage) {
    const a = byId.get(from)!
    const b = byId.get(to)!
    const column = nodes.filter((n) => n.stage === a.stage && n.kind === "topic").sort((m, n) => m.y - n.y)
    const adjacent = column.indexOf(b) - column.indexOf(a) === 1
    const d = adjacent
      ? `M${a.x + 44} ${a.y + a.h} L${b.x + 44} ${b.y}`
      : rounded(
          [
            { x: a.x, y: a.y + a.h - 22 },
            { x: a.x - 16, y: a.y + a.h - 22 },
            { x: b.x - 16, y: b.y + 22 },
            { x: b.x, y: b.y + 22 },
          ],
          8,
        )
    edges.push({ id: `${from}>${to}`, from, to, kind: "in-stage", d })
  }
  // Stage to stage.
  for (let i = 0; i + 1 < stages.length; i++) {
    const a = stages[i]
    const b = stages[i + 1]
    edges.push({ id: `flow:${i}`, from: `stage:${i}`, to: `stage:${i + 1}`, kind: "flow", d: `M${a.x + a.w + 6} ${HEADER_H / 2} L${b.x - 8} ${HEADER_H / 2}` })
  }

  const width = Math.ceil(Math.max(out.width ?? 0, ...nodes.map((n) => n.x + n.w)))
  const height = Math.ceil(Math.max(...nodes.map((n) => n.y + n.h), top))
  return { width, height, nodes, stages, edges }
}

export const PATHS_NODE_W = 230
export const PATHS_NODE_H = 64
const PATHS_NODE_W_NARROW = 160

/** The map of paths: every path that has a `next` link (either way), left to right (or top to bottom for phones). */
export async function layoutPathsMap(data: PathsData, direction: "RIGHT" | "DOWN" = "RIGHT"): Promise<PathsMapLayout> {
  const linked = new Set<string>()
  for (const p of data.paths) for (const n of p.next) linked.add(p.id).add(n)
  const ids = data.paths.map((p) => p.id).filter((pid) => linked.has(pid))
  if (!ids.length) return { width: 0, height: 0, nodes: [], edges: [] }
  const graph: ElkNode = {
    id: "paths",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": direction === "RIGHT" ? "18" : "14",
      "elk.layered.spacing.nodeNodeBetweenLayers": direction === "RIGHT" ? "56" : "36",
      "elk.padding": "[top=4,left=4,bottom=4,right=4]",
    },
    children: ids.map((pid) => ({ id: pid, width: direction === "RIGHT" ? PATHS_NODE_W : PATHS_NODE_W_NARROW, height: PATHS_NODE_H })),
    edges: data.paths.flatMap((p) => p.next.map((n) => ({ id: `${p.id}>${n}`, sources: [p.id], targets: [n] }))),
  }
  const out = await elk.layout(graph)
  return {
    width: Math.ceil(out.width ?? 0),
    height: Math.ceil(out.height ?? 0),
    nodes: (out.children ?? []).map((n) => ({ id: n.id, x: Math.round(n.x ?? 0), y: Math.round(n.y ?? 0), w: n.width ?? PATHS_NODE_W, h: n.height ?? PATHS_NODE_H })),
    edges: (out.edges ?? []).map((e) => {
      const [from, to] = e.id.split(">")
      return { id: e.id, from, to, d: rounded(sectionPoints(e as ElkExtendedEdge, 0)) }
    }),
  }
}
