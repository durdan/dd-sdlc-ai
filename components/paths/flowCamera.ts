// The flow visualiser's own camera, for stages where the whole diagram would be too small to read
// (phones, tablets, tall diagrams on desktop) and for every sequence diagram. DiagramStage then
// gets a fixed `view` per moment and only does the dimming, draw-in and dots; the views come from
// here, timed like DiagramStage's own timeline (an edge starts drawing at 0.5 s + i × step), so
// the camera arrives as each part of the path draws. Pure functions: no DOM, no React.
//
// c4: each view frames a run of traced edges (plus the step's focus boxes where they fit) at a
// scale where text stays readable (≥ ~11 px), nudged so no box is cut by the frame; an edge too
// long for one view is followed from its start box to its end box.
// sequence: the participant row is drawn by the host as a sticky header synced to the view, so the
// camera only moves down the messages; on a narrow stage the columns are packed closer (a compact
// layout built here) so every lifeline and both ends of every arrow stay on screen.
import type { Diagram, DiagramLayout, Shot } from "design-player/core"

/** Padding renderSvg puts around the layout (as in DiagramStage). */
export const PAD = 16
/** Screen px per diagram unit for the follow camera: 12-unit labels at ≥ 11 px. */
export const READ = 0.92
/** Never magnify more than this. */
const MAX = 1.15
/** DiagramStage follows the path below this scale; the flow visualiser takes over there. */
export const LIB_FOLLOW = 0.72
/** Room around framed parts, in diagram units. */
const MARGIN = 22

export type Rect = { x: number; y: number; w: number; h: number }
export type Stage = { w: number; h: number }
/** Move the camera to `view` from `at` (s, shot time) over `dur` (s). */
export type Key = { at: number; dur: number; view: Rect }

export const vb = (r: Rect) => `${r.x.toFixed(1)} ${r.y.toFixed(1)} ${r.w.toFixed(1)} ${r.h.toFixed(1)}`
const right = (r: Rect) => r.x + r.w
const bottom = (r: Rect) => r.y + r.h
const shift = (r: Rect, dx: number, dy: number): Rect => ({ ...r, x: r.x + dx, y: r.y + dy })
const padded = (r: Rect): Rect => shift(r, PAD, PAD)
function union(rs: Rect[]): Rect | null {
  if (!rs.length) return null
  const x = Math.min(...rs.map((r) => r.x))
  const y = Math.min(...rs.map((r) => r.y))
  return { x, y, w: Math.max(...rs.map(right)) - x, h: Math.max(...rs.map(bottom)) - y }
}
const contains = (o: Rect, i: Rect) => i.x >= o.x - 0.5 && i.y >= o.y - 0.5 && right(i) <= right(o) + 0.5 && bottom(i) <= bottom(o) + 0.5
const overlaps = (a: Rect, b: Rect) => a.x < right(b) && b.x < right(a) && a.y < bottom(b) && b.y < bottom(a)
const boxOf = (l: DiagramLayout, id: string): Rect | undefined => l.nodes[id] ?? l.groups[id]
const full = (l: DiagramLayout) => ({ W: l.width + PAD * 2, H: l.height + PAD * 2 })

/** The layout DiagramStage draws on this stage (its own rule: the portrait one on a tall stage). */
export const layoutFor = (wide: DiagramLayout, portrait: DiagramLayout | undefined, stage: Stage) => (portrait && stage.h > stage.w * 0.9 ? portrait : wide)

/** Scale at which the whole diagram fits the stage. */
export const wholeScale = (l: DiagramLayout, stage: Stage) => Math.min(stage.w / full(l).W, stage.h / full(l).H)

/** The whole diagram, centred, in the stage's aspect. */
export function wholeView(l: DiagramLayout, stage: Stage): Rect {
  const { W, H } = full(l)
  const s = wholeScale(l, stage)
  const w = stage.w / s
  const h = stage.h / s
  return { x: (W - w) / 2, y: (H - h) / 2, w, h }
}

/** Shot timing, as in DiagramStage: when each traced edge starts drawing and how long it takes (s). */
export function timing(traceCount: number, shotMs: number) {
  const step = traceCount ? Math.max(1.1, (shotMs / 1000 - 1.2) / traceCount) : 0
  return { at: (i: number) => 0.5 + i * step, draw: Math.min(0.9, step * 0.7), move: Math.min(0.7, step * 0.35) }
}

// ---------------------------------------------------------------- c4

/** Smallest scale an overview may use: below it, the whole diagram is a blur of boxes on a phone. */
const OVERVIEW_MIN = 0.42

/**
 * An establishing view for a step that lights nothing: the whole diagram if it fits at a usable
 * scale, else the full width from the top at that scale (the position bar shows there is more).
 */
export function overview(l: DiagramLayout, stage: Stage): Rect {
  const whole = wholeView(l, stage)
  if (wholeScale(l, stage) >= OVERVIEW_MIN) return whole
  const { W, H } = full(l)
  const s = Math.max(OVERVIEW_MIN, Math.min(stage.w / W, 1))
  const w = stage.w / s
  const h = stage.h / s
  return { x: (W - w) / 2, y: h >= H ? (H - h) / 2 : 0, w, h }
}

const ends = (d: Diagram, id: string) => {
  const e = (d.kind === "c4" ? d.edges : d.messages).find((x) => x.id === id)
  return e ? [e.from, e.to] : []
}

/** Region (svg coordinates) of these nodes and edges, labels included. */
function region(l: DiagramLayout, nodes: string[], edges: string[]): Rect | null {
  const rs: Rect[] = nodes.map((n) => boxOf(l, n)).filter((b): b is Rect => !!b)
  for (const e of edges) {
    const el = l.edges[e]
    if (!el) continue
    for (const p of el.points) rs.push({ x: p.x, y: p.y, w: 1, h: 1 })
    if (el.label) rs.push(el.label)
  }
  const u = union(rs)
  return u && padded(u)
}

/** The scale a view around `r` needs, clamped to MAX. */
const scaleFor = (r: Rect, stage: Stage) => Math.min(MAX, stage.w / (r.w + MARGIN * 2), stage.h / (r.h + MARGIN * 2))
/** Lit parts keep clear of the stage's bottom strip, where the "Paused" hint sits (units). */
const FOOT = 46
const foot = (r: Rect): Rect => ({ ...r, h: r.h + FOOT })
/** A region fits one view if it needs at most a little below READ (12-unit labels at ~10.6 px). */
const FIT = 0.88
const fits = (r: Rect, stage: Stage) => scaleFor(foot(r), stage) >= FIT

/** A view of scale `s` placed to hold `keep` and reach as far towards `toward` as it can, inside the diagram where possible. */
function place(keep: Rect, toward: { x: number; y: number }, s: number, l: DiagramLayout, stage: Stage): Rect {
  const { W, H } = full(l)
  const w = stage.w / s
  const h = stage.h / s
  const axis = (lo: number, hi: number, want: number, size: number, total: number) => {
    if (size >= total) return (total - size) / 2
    // Holding `keep` (with a margin) allows positions in [hi + m - size, lo - m]; prefer `want`, stay inside the diagram.
    const m = Math.min(MARGIN, Math.max(0, (size - (hi - lo)) / 2))
    const min = Math.max(0, hi + m - size)
    const max = Math.min(total - size, lo - m)
    return min <= max ? Math.min(Math.max(want, min), max) : (lo + hi - size) / 2
  }
  return { x: axis(keep.x, right(keep), toward.x - w / 2, w, W), y: axis(keep.y, bottom(keep), toward.y - h / 2, h, H), w, h }
}

const around = (r: Rect, l: DiagramLayout, stage: Stage, s = Math.max(Math.min(READ, scaleFor(r, stage)), FIT)) => place(r, { x: r.x + r.w / 2, y: r.y + r.h / 2 }, s, l, stage)

/** How far a box reaches into the view (0 when outside). */
const reach = (v: Rect, r: Rect) =>
  Math.min(Math.max(0, Math.min(right(v), right(r)) - Math.max(v.x, r.x)), Math.max(0, Math.min(bottom(v), bottom(r)) - Math.max(v.y, r.y)))
/** Boxes the view cuts through (slivers under 6 units do not count). */
function cut(v: Rect, l: DiagramLayout): { id: string; r: Rect }[] {
  return Object.entries(l.nodes)
    .map(([id, b]) => ({ id, r: padded(b) }))
    .filter(({ r }) => overlaps(v, r) && !contains(v, r) && reach(v, r) > 6)
}

/**
 * Nudge a view (same scale) so no box is cut by its edges, keeping every `keep` box inside. Where
 * some cut is unavoidable (a wide row on a phone), cut a faded box rather than a lit one.
 */
function uncut(view: Rect, l: DiagramLayout, keep: Rect[], lit: Set<string>): Rect {
  const { W, H } = full(l)
  const ok = (v: Rect) => keep.every((k) => contains(v, k))
  const inside = (v: Rect): Rect => ({
    ...v,
    x: v.w >= W ? v.x : Math.min(Math.max(-PAD / 2, v.x), W - v.w + PAD / 2),
    y: v.h >= H ? v.y : Math.min(Math.max(-PAD / 2, v.y), H - v.h + PAD / 2),
  })
  let best = view
  const harm = (v: Rect) => cut(v, l).reduce((n, c) => n + (lit.has(c.id) ? 1000 : 150), 0)
  let bestCuts = harm(view)
  for (let round = 0; round < 5 && bestCuts > 0; round++) {
    const cands: Rect[] = []
    for (const { r: b } of cut(best, l)) {
      if (b.x < best.x) cands.push(shift(best, b.x - best.x - 6, 0), shift(best, right(b) - best.x + 6, 0))
      if (right(b) > right(best)) cands.push(shift(best, right(b) - right(best) + 6, 0), shift(best, b.x - right(best) - 6, 0))
      if (b.y < best.y) cands.push(shift(best, 0, b.y - best.y - 6), shift(best, 0, bottom(b) - best.y + 6))
      if (bottom(b) > bottom(best)) cands.push(shift(best, 0, bottom(b) - bottom(best) + 6), shift(best, 0, b.y - bottom(best) - 6))
    }
    let moved = false
    const cost = (v: Rect, n: number) => n + Math.abs(v.x - view.x) + Math.abs(v.y - view.y)
    for (const c of cands.map(inside).filter(ok)) {
      const n = harm(c)
      if (cost(c, n) < cost(best, bestCuts)) {
        best = c
        bestCuts = n
        moved = true
      }
    }
    if (!moved) break
  }
  return best
}

const boxesOf = (l: DiagramLayout, ids: string[]) => ids.map((n) => boxOf(l, n)).filter((b): b is Rect => !!b).map(padded).map(foot)

/**
 * Camera keys for one c4 step: runs of traced edges that fit one readable view (focus boxes added
 * where they still fit), an edge too long for a view followed from its start box to its end box.
 * A step that lights nothing gets the overview. `still` (reduced motion): only the final view.
 */
export function c4Keys(d: Diagram, l: DiagramLayout, shot: Shot, stage: Stage, shotMs: number, still: boolean): Key[] {
  const { at, draw, move } = timing(shot.trace.length, shotMs)
  const lit = new Set([...shot.focus, ...shot.trace.flatMap((e) => ends(d, e))])
  const view = (nodes: string[], edges: string[]) => {
    const r = region(l, nodes, edges)
    if (!r) return null
    // A part too big for a readable view (a whole group) is framed whole, down to the overview scale.
    const s = fits(r, stage) ? undefined : Math.max(scaleFor(foot(r), stage), OVERVIEW_MIN)
    return uncut(around(foot(r), l, stage, s), l, boxesOf(l, nodes), lit)
  }
  if (!shot.trace.length && !shot.focus.length) return [{ at: 0, dur: 0.9, view: overview(l, stage) }]
  if (!shot.trace.length) {
    // Focus on many boxes or a group (an establishing step): all of them in one view, if the scale allows.
    const all = region(l, shot.focus, [])
    if (all && (shot.focus.length >= 3 || shot.focus.some((f) => l.groups[f])) && scaleFor(foot(all), stage) >= OVERVIEW_MIN) {
      const v = view(shot.focus, [])
      return v ? [{ at: 0, dur: still ? 0 : 0.9, view: v }] : []
    }
    // Else the focus boxes (in order) in groups that fit one view each, visited in turn over the step.
    const tour: string[][] = []
    for (const f of shot.focus) {
      const cur = tour[tour.length - 1]
      const r = cur && region(l, [...cur, f], [])
      if (r && fits(r, stage)) cur.push(f)
      else tour.push([f])
    }
    const span = Math.max(1.6, shotMs / 1000 / tour.length)
    const keys = tour.flatMap((g, k) => {
      const v = view(g, [])
      return v ? [{ at: k === 0 ? 0 : k * span - 0.4, dur: k === 0 ? 0.9 : 0.8, view: v }] : []
    })
    return still ? keys.slice(-1).map((k) => ({ ...k, at: 0, dur: 0 })) : keys
  }
  // Greedy runs of edges that fit together.
  const runs: { edges: string[]; first: number }[] = []
  shot.trace.forEach((e, i) => {
    const cur = runs[runs.length - 1]
    if (cur) {
      const ids = [...cur.edges, e]
      const r = region(l, ids.flatMap((x) => ends(d, x)), ids)
      if (r && fits(r, stage)) return void cur.edges.push(e)
    }
    runs.push({ edges: [e], first: i })
  })
  const nodesOf = (edges: string[]) => [...new Set(edges.flatMap((x) => ends(d, x)))]
  const keys: Key[] = []
  for (const [k, run] of runs.entries()) {
    const start = k === 0 ? 0 : at(run.first) - move
    const dur = k === 0 ? 0.9 : move
    const nodes = nodesOf(run.edges)
    for (const f of shot.focus) {
      const r = region(l, [...nodes, f], run.edges)
      if (r && fits(r, stage) && !nodes.includes(f)) nodes.push(f)
    }
    const r = region(l, nodes, run.edges)
    if (r && fits(r, stage)) {
      const v = view(nodes, run.edges)
      if (v) keys.push({ at: start, dur, view: v })
      continue
    }
    // One edge too long for a view: start on its first box, ride to its last one as it draws.
    const e = run.edges[0]
    const pts = l.edges[e]?.points ?? []
    const [from, to] = ends(d, e)
    const fb = boxesOf(l, [from])[0]
    const tb = boxesOf(l, [to])[0]
    if (!pts.length || !fb || !tb) continue
    const a = { x: pts[0].x + PAD, y: pts[0].y + PAD }
    const b = { x: pts[pts.length - 1].x + PAD, y: pts[pts.length - 1].y + PAD }
    // Each end with the focus boxes that fit beside it, reaching as far along the edge as it can.
    const endView = (end: string, toward: { x: number; y: number }) => {
      const with_ = [end]
      for (const f of shot.focus) {
        const r = region(l, [...with_, f], [])
        if (r && fits(r, stage) && !with_.includes(f)) with_.push(f)
      }
      const keep = boxesOf(l, with_)
      return uncut(place(union(keep)!, toward, FIT, l, stage), l, keep, lit)
    }
    keys.push({ at: start, dur, view: endView(from, b) })
    keys.push({ at: at(run.first), dur: draw + 0.2, view: endView(to, a) })
  }
  // Reduced motion: one view where the step ends (the step's whole path when it fits in one).
  return still ? [{ at: 0, dur: 0, view: keys.length === 1 ? keys[0].view : (keys[keys.length - 1]?.view ?? overview(l, stage)) }] : keys
}

// ---------------------------------------------------------------- sequence

/** Participant row of a sequence layout (all participants share it). */
export function headerRow(l: DiagramLayout) {
  const b = Object.values(l.nodes)[0]
  return { y: b?.y ?? 20, h: b?.h ?? 46 }
}

/** Gap between the sticky header band and the stage top, and below the chips, in px. */
export const BAND_GAP = 6
export const bandPx = (l: DiagramLayout, s: number) => BAND_GAP * 2 + headerRow(l).h * s

/**
 * A sequence layout packed into `width` units (columns closer, participant row lower), for a stage
 * too narrow for the written one; label boxes are kept inside the width. `labelW` measures a label.
 */
export function compactSequence(d: Diagram, width: number, labelW: (text: string) => number): DiagramLayout {
  if (d.kind !== "sequence") throw new Error("compactSequence: not a sequence diagram")
  const n = d.participants.length
  const inner = width - PAD * 2
  // Columns use the padding too (the header chips are the only thing drawn there).
  const m = 3 - PAD
  const col = (inner - m * 2) / n
  const nodes: DiagramLayout["nodes"] = {}
  d.participants.forEach((p, i) => (nodes[p.id] = { x: m + i * col + 2, y: 8, w: col - 4, h: 36 }))
  const cx = (id: string) => nodes[id].x + nodes[id].w / 2
  const edges: DiagramLayout["edges"] = {}
  const y0 = 8 + 36 + 44
  d.messages.forEach((msg, i) => {
    const y = y0 + i * 48
    const points =
      msg.from === msg.to
        ? [
            { x: cx(msg.from), y },
            { x: cx(msg.from) + 26, y },
            { x: cx(msg.from) + 26, y: y + 18 },
            { x: cx(msg.from) + 4, y: y + 18 },
          ]
        : [
            { x: cx(msg.from), y },
            { x: cx(msg.to), y },
          ]
    let label: DiagramLayout["edges"][string]["label"]
    if (msg.label) {
      const w = labelW(msg.label) + 6
      const mid = msg.from === msg.to ? cx(msg.from) + 13 : (cx(msg.from) + cx(msg.to)) / 2
      const x = Math.min(Math.max(mid - w / 2, -PAD + 3), inner + PAD - 3 - w)
      // renderSvg puts the baseline at y + h/2 + 4: 8 units above the arrow.
      label = { x, y: y - 20, w, h: 16 }
    }
    edges[msg.id] = { points, ...(label ? { label } : {}) }
  })
  return { width: inner, height: y0 + (d.messages.length - 1) * 48 + 18 + FOOT, nodes, groups: {}, edges }
}

/** Vertical extent (svg units) of these messages, labels and self-loops included. */
function rows(l: DiagramLayout, ids: string[]): { top: number; bot: number } | null {
  const ys = ids.flatMap((id) => (l.edges[id]?.points ?? []).map((p) => p.y))
  if (!ys.length) return null
  return { top: Math.min(...ys) + PAD - 26, bot: Math.max(...ys) + PAD + 14 }
}

/**
 * Camera keys for one sequence step at scale `s`: the full width (centred), and the step's messages
 * placed in the part of the stage below the sticky participant header, a little above the middle,
 * with the messages before them for context. Focus-only steps keep the place of the nearest earlier
 * step with messages (the top for the first).
 */
export function sequenceKeys(l: DiagramLayout, steps: Shot[], index: number, stage: Stage, s: number, shotMs: number, still: boolean): Key[] {
  const { W, H } = full(l)
  const w = stage.w / s
  const h = stage.h / s
  const x = (W - w) / 2
  if (h >= H) return [{ at: 0, dur: still ? 0 : 0.9, view: { x, y: (H - h) / 2, w, h } }]
  // A step that lights nothing: the whole diagram, unless that would be too small to read.
  if (!steps[index].trace.length && !steps[index].focus.length) {
    const whole = wholeView(l, stage)
    if (stage.w / whole.w >= 0.6) return [{ at: 0, dur: still ? 0 : 0.9, view: whole }]
  }
  const band = bandPx(l, s) / s
  const usable = h - band - FOOT * 0.7
  const yFor = (ids: string[]) => {
    const r = rows(l, ids)
    if (!r) return 0
    const slack = Math.max(0, usable - (r.bot - r.top))
    return Math.min(Math.max(0, r.top - band - slack * 0.4), H - h)
  }
  const at = (y: number, t: number, dur: number): Key => ({ at: t, dur, view: { x, y, w, h } })
  let i = index
  while (i > 0 && !steps[i].trace.length) i--
  const trace = steps[i].trace
  if (!trace.length) return [at(0, 0, still ? 0 : 0.9)]
  const r = rows(l, trace)!
  if (still || r.bot - r.top <= usable || i !== index) return [at(yFor(i === index ? trace : trace.slice(-1)), 0, still ? 0 : 0.9)]
  // Too many messages for one view: follow them as they draw.
  const tm = timing(trace.length, shotMs)
  return trace.map((id, k) => at(yFor([id]), k === 0 ? 0 : tm.at(k) - tm.move, k === 0 ? 0.9 : tm.move))
}
