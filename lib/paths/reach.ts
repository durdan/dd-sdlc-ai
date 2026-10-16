// Exploring a flow diagram from one box (the idea comes from archify's "reach" views):
//   down: everything the box leads to, following the arrows
//   up:   everything that leads to the box
//   path: the shortest route from the box to another one (along the arrows if there is one,
//         otherwise ignoring their direction)
// Results are in breadth-first order, so the stage draws them outward from the box.
type Edge = { id: string; from: string; to: string }

export type Reach = { kind: "down" | "up" } | { kind: "path"; to: string }
export type Reached = { nodes: string[]; edges: string[] }

export function reachFrom(edges: Edge[], start: string, dir: "down" | "up"): Reached {
  const nodes = [start]
  const seen = new Set(nodes)
  const used: string[] = []
  for (let i = 0; i < nodes.length; i++) {
    for (const e of edges) {
      const [near, far] = dir === "down" ? [e.from, e.to] : [e.to, e.from]
      if (near !== nodes[i] || used.includes(e.id)) continue
      used.push(e.id)
      if (!seen.has(far)) {
        seen.add(far)
        nodes.push(far)
      }
    }
  }
  return { nodes, edges: used }
}

function route(edges: Edge[], a: string, b: string, directed: boolean): Reached | null {
  const back = new Map<string, Edge>([[a, { id: "", from: a, to: a }]])
  const queue = [a]
  for (let i = 0; i < queue.length && !back.has(b); i++) {
    const n = queue[i]
    for (const e of edges) {
      const next = e.from === n ? e.to : !directed && e.to === n ? e.from : null
      if (next && !back.has(next)) {
        back.set(next, e)
        queue.push(next)
      }
    }
  }
  if (!back.has(b)) return null
  const nodes = [b]
  const used: string[] = []
  for (let n = b; n !== a; ) {
    const e = back.get(n)!
    used.unshift(e.id)
    n = e.from === n ? e.to : e.from
    nodes.unshift(n)
  }
  return { nodes, edges: used }
}

export function pathBetween(edges: Edge[], a: string, b: string): (Reached & { directed: boolean }) | null {
  const along = route(edges, a, b, true)
  if (along) return { ...along, directed: true }
  const any = route(edges, a, b, false)
  return any ? { ...any, directed: false } : null
}

export function explore(edges: Edge[], box: string, r: Reach) {
  return r.kind === "path" ? pathBetween(edges, box, r.to) : reachFrom(edges, box, r.kind)
}

// ---- Share links: #flow=<diagram>&step=<n>&box=<id>&reach=down|up|path:<id> ----

export type FlowLink = { flow: string; step: number; box?: string; reach?: Reach }

export function readLink(hash: string): FlowLink | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""))
  const flow = p.get("flow")
  if (!flow) return null
  const step = Math.max(1, Number.parseInt(p.get("step") ?? "1", 10) || 1)
  const box = p.get("box") ?? undefined
  const r = p.get("reach") ?? ""
  const reach: Reach | undefined = r === "down" || r === "up" ? { kind: r } : r.startsWith("path:") ? { kind: "path", to: r.slice(5) } : undefined
  return { flow, step, box, reach: box ? reach : undefined }
}

export function writeLink(l: FlowLink) {
  const p = new URLSearchParams({ flow: l.flow, step: String(l.step) })
  if (l.box) p.set("box", l.box)
  if (l.box && l.reach) p.set("reach", l.reach.kind === "path" ? `path:${l.reach.to}` : l.reach.kind)
  return `#${p.toString()}`
}
