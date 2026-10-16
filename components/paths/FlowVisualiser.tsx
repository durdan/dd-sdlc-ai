"use client"
// The flow diagram visualiser: plays a topic's ```trace diagram``` blocks (parsed and laid out on
// the server by lib/paths/diagrams.ts) with design-player's own DiagramStage, so boxes, tones,
// arrows, focus dimming, draw-in and travelling dots are exactly those of the library's
// walkthroughs. Each step is a design-player shot; there is no audio, so a step lasts as long as
// the engine gives a shot without a clip (shotDurations: reading time from the caption).
// The full Player is not used: its phone "watch mode" takes over the whole screen, which suits a
// walkthrough page but not a lesson inside a topic page. Here the stage is a box in the page and
// the controls match the lanes lesson. Paused, a tap on a box shows what it is and the steps
// about it. With reduced motion, each step shows its end state at once.
// Where the whole diagram would be too small to read, and for every sequence diagram, the camera is
// this file's own (flowCamera.ts): DiagramStage gets a fixed view per moment, and a sequence
// diagram's participant row is an HTML header that stays on screen as the view moves down.
// A tapped box can also be explored (reach.ts): what it leads to, what leads to it, or the route to
// another box, drawn as a one-off shot. The view (diagram, step, box, exploration) is kept in the
// URL hash once the reader starts using the diagram, so a link opens the same view.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import "@/components/learn/setup"
import { shotDurations, type Shot } from "design-player/core"
import { DiagramStage } from "design-player/react"
import type { FlowDiagram } from "@/lib/paths/types"
import { explore, readLink, writeLink, type FlowLink, type Reach } from "@/lib/paths/reach"
import { BAND_GAP, LIB_FOLLOW, PAD, READ, bandPx, c4Keys, compactSequence, headerRow, layoutFor, sequenceKeys, vb, wholeScale, type Key, type Rect, type Stage } from "./flowCamera"
import { Ctl } from "./LanesVisualiser"

const SPEEDS = [0.5, 1, 2] as const

/** Width of an edge label (12-unit Inter, as renderSvg draws it), in diagram units. */
function labelMeasurer() {
  const ctx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d")
  if (ctx) ctx.font = `12px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`
  return (t: string) => (ctx ? ctx.measureText(t).width * 1.06 : t.length * 6.6)
}

/** Font size (px) for a header chip: as in the diagram, but small enough for its longest word, and at least 10 px. */
function chipFont(label: string, widthPx: number, s: number) {
  const ctx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d")
  let per = 0.62 * Math.max(...label.split(/\s+/).map((w) => w.length))
  if (ctx) {
    ctx.font = `600 100px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`
    per = (Math.max(...label.split(/\s+/).map((w) => ctx.measureText(w).width)) / 100) * 1.04
  }
  return Math.max(10, Math.min(15, 14.5 * s, (widthPx - 6) / per))
}

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)
const mix = (a: Rect, b: Rect, k: number): Rect => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k })

/** Plays camera keys from the moment they change (each shot entry); reduced motion jumps to the end. */
function useCamera(keys: Key[] | null, still: boolean): Rect | null {
  const [view, setView] = useState<Rect | null>(null)
  const cur = useRef<Rect | null>(null)
  useEffect(() => {
    if (!keys?.length) {
      cur.current = null
      setView(null)
      return
    }
    const put = (v: Rect) => {
      cur.current = v
      setView(v)
    }
    if (still) return put(keys[keys.length - 1].view)
    // The first time, start where the first move ends; after that, from wherever the camera is.
    const from = cur.current ?? keys[0].view
    const end = Math.max(...keys.map((k) => k.at + k.dur))
    const t0 = performance.now()
    let raf = 0
    const tick = () => {
      const t = (performance.now() - t0) / 1000
      let v = from
      for (const k of keys) {
        if (t >= k.at + k.dur) v = k.view
        else {
          if (t > k.at) v = mix(v, k.view, ease((t - k.at) / k.dur))
          break
        }
      }
      put(v)
      if (t < end) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [keys, still])
  return view
}

type StageProps = { flow: FlowDiagram; shots: Shot[]; at: number; epoch: number; ms: number; still: boolean; selected: string | null; onSelect: (id: string) => void }

/** DiagramStage plus, where it needs one, this visualiser's camera, sticky sequence header and position marks. */
function FlowStage({ flow, shots, at, epoch, ms, still, selected, onSelect }: StageProps) {
  const d = flow.diagram
  const shot = shots[at]
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage | null>(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width && r.height) setStage((s) => (s && Math.abs(s.w - r.width) < 2 && Math.abs(s.h - r.height) < 2 ? s : { w: r.width, h: r.height }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Who moves the camera: DiagramStage (a c4 diagram readable whole, its own focus zoom) or this file.
  const plan = useMemo(() => {
    if (!stage) return null
    if (d.kind === "sequence") {
      const fit = stage.w / (flow.layout.width + PAD * 2)
      if (fit >= 0.9) {
        const whole = wholeScale(flow.layout, stage)
        return { layout: flow.layout, s: whole >= 0.9 ? whole : Math.min(fit, 1.15) }
      }
      // Too narrow for the written columns: pack them into the stage at a readable scale.
      const measure = labelMeasurer()
      const longest = Math.max(0, ...d.messages.map((m) => (m.label ? measure(m.label) : 0)))
      const s = Math.max(0.8, Math.min(0.95, stage.w / (longest + 16)))
      return { layout: compactSequence(d, stage.w / s, measure), s }
    }
    const layout = layoutFor(flow.layout, flow.portrait, stage)
    return wholeScale(layout, stage) >= LIB_FOLLOW ? null : { layout, s: READ }
  }, [stage, d, flow.layout, flow.portrait])

  const keys = useMemo(() => {
    if (!plan || !stage) return null
    return d.kind === "sequence" ? sequenceKeys(plan.layout, shots, at, stage, plan.s, ms, still) : c4Keys(d, plan.layout, shot, stage, ms, still)
    // epoch: re-entering the same step replays its camera too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, stage, d, shots, at, shot, ms, still, epoch])
  const view = useCamera(keys, still)
  const shown = plan && (view ?? keys?.[0]?.view)
  const layout = plan?.layout ?? flow.layout
  const W = layout.width + PAD * 2
  const H = layout.height + PAD * 2

  // Sequence header: lit like the boxes it replaces (dimmed less, so names stay readable).
  const lit = useMemo(() => {
    const edges = d.kind === "c4" ? d.edges : d.messages
    return new Set([...shot.focus, ...edges.filter((e) => shot.trace.includes(e.id)).flatMap((e) => [e.from, e.to])])
  }, [d, shot])
  const s = shown && stage ? stage.w / shown.w : 1
  const row = headerRow(layout)
  const natural = shown ? (PAD + row.y - shown.y) * s : 0
  const sticky = natural < BAND_GAP
  // One size for every chip: the largest at which each chip's longest word fits.
  const chipPx = useMemo(
    () => (d.kind === "sequence" ? Math.min(...d.participants.map((p) => chipFont(p.label, (layout.nodes[p.id]?.w ?? 0) * s, s))) : 0),
    [d, layout, s],
  )

  return (
    <div ref={box} className={`relative h-full w-full ${d.kind === "sequence" ? "[&_.dg-node]:invisible" : ""}`}>
      <DiagramStage
        diagram={d}
        layout={plan ? plan.layout : flow.layout}
        portraitLayout={plan ? undefined : flow.portrait}
        epoch={epoch}
        shot={shot}
        shotMs={ms}
        offsetMs={still ? ms : 0}
        playing={!still}
        selected={selected}
        onSelect={onSelect}
        view={shown ? vb(shown) : undefined}
        stableSvg
      />
      {d.kind === "sequence" && shown ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 border-b border-[#d9dfdc] bg-[#f4f5f2]/95 transition-opacity duration-200 motion-reduce:transition-none ${sticky ? "opacity-100" : "opacity-0"}`}
            style={{ height: bandPx(layout, s) }}
          />
          {d.participants.map((p) => {
            const b = layout.nodes[p.id]
            if (!b) return null
            const dim = lit.size > 0 && !lit.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`pointer-events-auto absolute flex items-center justify-center overflow-hidden rounded-md border bg-[#fbfbf9] px-0.5 text-center font-semibold leading-[1.1] text-[#1d2826] transition-opacity duration-500 motion-reduce:transition-none ${
                  selected === p.id ? "border-2 border-[#8a6a2c]" : "border-[#c9d0cd]"
                }`}
                style={{
                  left: (PAD + b.x - shown.x) * s,
                  top: Math.max(BAND_GAP, natural),
                  width: b.w * s,
                  height: b.h * s,
                  fontSize: chipPx,
                  opacity: dim ? 0.45 : 1,
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      ) : null}
      {/* Where the view is in a diagram bigger than the stage. */}
      {shown && shown.h < H * 0.97 ? (
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-1.5 w-[3px] rounded-full bg-[#3d6b63]/15" style={{ top: sticky && d.kind === "sequence" ? bandPx(layout, s) + 6 : 12 }}>
          <span
            className="absolute inset-x-0 rounded-full bg-[#3d6b63]/55"
            style={{ top: `${(Math.max(0, shown.y) / H) * 100}%`, height: `${(Math.min(shown.h, H - Math.max(0, shown.y)) / H) * 100}%` }}
          />
        </span>
      ) : null}
      {shown && shown.w < W * 0.97 ? (
        <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-3 right-3 h-[3px] rounded-full bg-[#3d6b63]/15">
          <span
            className="absolute inset-y-0 rounded-full bg-[#3d6b63]/55"
            style={{ left: `${(Math.max(0, shown.x) / W) * 100}%`, width: `${(Math.min(shown.w, W - Math.max(0, shown.x)) / W) * 100}%` }}
          />
        </span>
      ) : null}
    </div>
  )
}

/** A focused group lights the boxes in it as well as its own outline. */
function withMembers(d: FlowDiagram["diagram"], focus: string[]) {
  if (d.kind !== "c4") return focus
  const members = d.elements.filter((e) => e.group && focus.includes(e.group)).map((e) => e.id)
  return members.length ? [...new Set([...focus, ...members])] : focus
}

const shotsOf = (d: FlowDiagram): Shot[] =>
  d.steps.map((s, i) => ({
    id: `${d.id}-${i + 1}`,
    chapter: "flow",
    diagram: d.id,
    focus: withMembers(d.diagram, s.focus),
    trace: s.trace,
    engineer: s.caption,
    executive: s.caption,
  }))

type Props = { diagrams: FlowDiagram[]; index: number; onSelect: (i: number) => void }

export default function FlowVisualiser({ diagrams, index, onSelect }: Props) {
  const flow = diagrams[index]
  const d = flow.diagram
  const shots = useMemo(() => shotsOf(flow), [flow])
  const durs = useMemo(() => shotDurations(shots, "engineer", {}), [shots])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [still, setStill] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [reach, setReach] = useState<Reach | null>(null)
  /** Bumps on every jump, so re-entering the same step replays it. */
  const [epoch, setEpoch] = useState(0)
  const [shown, setShown] = useState(index)
  if (shown !== index) {
    setShown(index)
    setStep(0)
    setPlaying(false)
    setSelected(null)
    setReach(null)
  }
  // Wide diagrams (sequence diagrams, left-to-right flows) take the full width on desktop.
  const wide = flow.layout.width > flow.layout.height * 1.15
  const last = shots.length - 1
  const at = Math.min(step, last)
  const nodes = d.kind === "c4" ? d.elements : d.participants
  const edges = d.kind === "c4" ? d.edges : d.messages
  // Exploring a box replaces the step's shot with one that lights what it reaches.
  const reached = useMemo(() => (selected && reach ? explore(edges, selected, reach) : null), [edges, selected, reach])
  const staged = useMemo(
    () => (reached ? shots.map((s, i) => (i === at ? { ...s, id: `${s.id}-reach`, focus: reached.nodes, trace: reached.edges } : s)) : shots),
    [shots, at, reached],
  )
  const shot = shots[at]
  const ms = reached ? 1200 + 1100 * Math.max(1, reached.edges.length) : durs[at] / speed

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    setStill(mq.matches)
    const on = () => setStill(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  // Playing: each step is held for its shot length, then the next one starts; the last one ends play.
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      if (at >= last) setPlaying(false)
      else setStep(at + 1)
    }, ms)
    return () => clearTimeout(t)
  }, [playing, at, last, ms, epoch])

  const jump = useCallback(
    (n: number) => {
      setPlaying(false)
      setSelected(null)
      setReach(null)
      touched.current = true
      setStep(Math.max(0, Math.min(last, n)))
      setEpoch((e) => e + 1)
    },
    [last],
  )
  const play = () => {
    setSelected(null)
    setReach(null)
    touched.current = true
    if (playing) return setPlaying(false)
    // Play replays the current step from its start and carries on; after the last step it starts again.
    if (at >= last) setStep(0)
    setEpoch((e) => e + 1)
    setPlaying(true)
  }

  // Paused: a box on the stage explains itself and lists the steps that light it.
  const picked = selected ? nodes.find((n) => n.id === selected) : undefined
  const pickedSub = d.kind === "c4" ? d.elements.find((e) => e.id === selected)?.sub : undefined
  const mentions = selected
    ? flow.steps
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.focus.includes(selected) || s.trace.some((id) => edges.some((e) => e.id === id && (e.from === selected || e.to === selected))))
    : []
  const select = (id: string) => {
    setPlaying(false)
    setReach(null)
    touched.current = true
    setSelected((s) => (s === id ? null : id))
  }
  const exploreAs = (r: Reach | null) => {
    setReach((cur) => (r && cur && cur.kind === r.kind && (r.kind !== "path" || (cur.kind === "path" && cur.to === r.to)) ? null : r))
    setEpoch((e) => e + 1)
  }
  const labelOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id

  // Share links. On arrival, a #flow=… hash picks the diagram, step, box and exploration.
  const touched = useRef(false)
  const pending = useRef<FlowLink | null>(null)
  const linked = useRef(false)
  // A link to this same page only changes the hash: read it again.
  const [arrived, setArrived] = useState(0)
  useEffect(() => {
    const on = () => {
      linked.current = false
      setArrived((n) => n + 1)
    }
    addEventListener("hashchange", on)
    return () => removeEventListener("hashchange", on)
  }, [])
  useEffect(() => {
    if (!linked.current) {
      linked.current = true
      const l = readLink(location.hash)
      const j = l ? diagrams.findIndex((f) => f.id === l.flow) : -1
      if (l && j >= 0) {
        pending.current = l
        document.getElementById("flow")?.scrollIntoView({ block: "start" })
        if (j !== index) return onSelect(j)
      }
    }
    const l = pending.current
    if (!l || diagrams[index].id !== l.flow) return
    pending.current = null
    touched.current = true
    const ids = new Set(nodes.map((n) => n.id))
    const box = l.box && ids.has(l.box) ? l.box : null
    setStep(Math.min(l.step - 1, last))
    setSelected(box)
    setReach(box && l.reach && (l.reach.kind !== "path" || ids.has(l.reach.to)) ? l.reach : null)
    setEpoch((e) => e + 1)
  }, [index, diagrams, onSelect, nodes, last, arrived])
  const link = writeLink({ flow: flow.id, step: at + 1, box: selected ?? undefined, reach: reach ?? undefined })
  // Once the reader has used the diagram, the address bar follows the paused view.
  useEffect(() => {
    if (touched.current && !playing) history.replaceState(history.state, "", `${location.pathname}${location.search}${link}`)
  }, [link, playing])
  const [copied, setCopied] = useState(false)
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${location.search}${link}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  // A tapped box's panel sits below the controls on phones: bring it into view.
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (selected && !matchMedia("(min-width: 1024px)").matches) panel.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" })
  }, [selected, still])

  // Keep the chosen tab visible in the scrolling tab row on phones.
  const tabs = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = tabs.current?.children[index] as HTMLElement | undefined
    const row = tabs.current
    if (el && row && (el.offsetLeft < row.scrollLeft || el.offsetLeft + el.offsetWidth > row.scrollLeft + row.clientWidth))
      row.scrollTo({ left: el.offsetLeft - 8, behavior: still ? "auto" : "smooth" })
  }, [index, still])

  return (
    <div>
      {diagrams.length > 1 ? (
        <div ref={tabs} role="tablist" aria-label="Choose a diagram" className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {diagrams.map((f, i) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                touched.current = true
                onSelect(i)
              }}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                i === index ? "border-[#3d6b63] bg-[#3d6b63] text-white" : "border-[#d9dfdc] bg-white text-[#1f2a28] hover:border-[#3d6b63]"
              }`}
            >
              <span className="block text-[13px] font-bold">
                {i + 1}. {f.title}
              </span>
              {f.subtitle ? <span className={`block text-xs ${i === index ? "text-[#d4e6e1]" : "text-[#5d6b68]"}`}>{f.subtitle}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className={`grid gap-3 lg:gap-4 ${wide ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_auto_1fr]"}`}>
        {/* The stage: landscape on desktop (a left-to-right diagram keeps its layout), portrait on phones (it swaps to top-to-bottom).
            A wide diagram gets the full width on desktop, with the controls below; a tall one sits beside them. */}
        <div className={`relative min-w-0 overflow-hidden rounded-2xl border border-[#d9dfdc] bg-[#f4f5f2] ${wide ? "lg:col-span-2" : "lg:col-start-2 lg:row-span-4 lg:row-start-1"}`}>
          <div className={`aspect-[4/5] max-h-[68vh] w-full ${wide ? "sm:aspect-[16/9] sm:max-h-[58vh]" : "sm:aspect-[4/3]"}`}>
            <FlowStage key={flow.id} flow={flow} shots={staged} at={at} epoch={epoch} ms={ms} still={still} selected={selected} onSelect={select} />
          </div>
          {!playing && !selected ? (
            <p className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#d9dfdc] bg-white/95 px-2.5 py-1 text-[11.5px] text-[#4f5d5a]">
              Paused · tap a box to explore it
            </p>
          ) : null}
        </div>


        {/* Caption and controls: pinned to the bottom of the screen on phones so the diagram stays in view while stepping. */}
        <div className={`sticky bottom-2 z-30 min-w-0 self-start rounded-2xl border border-[#d9dfdc] bg-white/95 p-3 shadow-[0_8px_28px_-14px_rgba(31,42,40,0.5)] backdrop-blur lg:static lg:shadow-none ${wide ? "lg:col-start-1 lg:row-start-2" : "lg:col-start-1 lg:row-start-1"}`}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">
              Step {at + 1} of {last + 1}
            </span>
            <span className="h-1 flex-1 self-center overflow-hidden rounded-full bg-[#e6efec]" aria-hidden="true">
              <span className="block h-full rounded-full bg-[#3d6b63] transition-[width] duration-300" style={{ width: `${((at + 1) / (last + 1)) * 100}%` }} />
            </span>
          </div>
          <p aria-live="polite" className="mt-1.5 min-h-[5.2em] text-[14px] leading-snug text-[#1f2a28] sm:min-h-[3.9em]">
            {shot.engineer}
          </p>
          {flow.steps[at].note ? <p className="mt-1 text-[12.5px] leading-snug text-[#4f5d5a]">{flow.steps[at].note}</p> : null}
          <div className="mt-2 flex items-center gap-1.5">
            <Ctl label="Restart" onClick={() => jump(0)} disabled={at === 0 && !playing}>
              <path d="M4 4v5h5M4.5 9A7 7 0 1 1 5 15" />
            </Ctl>
            <Ctl label="Step back" onClick={() => jump(at - 1)} disabled={at === 0}>
              <path d="M15 5l-7 7 7 7" />
            </Ctl>
            <button
              onClick={play}
              aria-label={playing ? "Pause" : at >= last ? "Play again" : "Play"}
              className="flex h-10 min-w-[92px] items-center justify-center gap-1.5 rounded-full bg-[#3d6b63] px-4 text-sm font-semibold text-white hover:bg-[#2f564f]"
            >
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <rect x="2" y="1.5" width="3.5" height="11" rx="1" fill="currentColor" />
                  <rect x="8.5" y="1.5" width="3.5" height="11" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5z" fill="currentColor" />
                </svg>
              )}
              {playing ? "Pause" : at >= last ? "Replay" : "Play"}
            </button>
            <Ctl label="Step forward" onClick={() => jump(at + 1)} disabled={at >= last}>
              <path d="M9 5l7 7-7 7" />
            </Ctl>
            <button
              onClick={share}
              title="Copy a link to this view"
              aria-label="Copy a link to this view"
              className="ml-auto flex h-10 min-w-10 shrink-0 items-center justify-center gap-1 rounded-full border border-[#d9dfdc] bg-white px-2.5 text-xs sm:px-3 font-semibold text-[#1f2a28] hover:border-[#3d6b63] hover:text-[#3d6b63]"
            >
              <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
              </svg>
              <span aria-live="polite" className={copied ? "" : "hidden sm:inline"}>{copied ? "Copied" : "Link"}</span>
            </button>
            <label className="flex items-center gap-1 text-xs font-semibold text-[#4f5d5a]">
              <span className="sr-only sm:not-sr-only">Speed</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEEDS)[number])}
                className="rounded-full border border-[#d9dfdc] bg-white px-2 py-1.5 text-xs font-semibold text-[#1f2a28]"
                aria-label="Playback speed"
              >
                {SPEEDS.map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* After the controls on phones, so the pinned controls card never covers it. */}
        {picked ? (
          <div ref={panel} className={`min-w-0 scroll-mb-3 ${wide ? "lg:col-start-2 lg:row-start-2" : "lg:col-start-1 lg:row-start-2"}`}>
            <aside className="rounded-2xl border border-[#8a6a2c]/40 bg-white p-3" aria-live="polite">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#1f2a28]">{picked.label}</p>
                  {pickedSub ? <p className="text-[13px] text-[#4f5d5a]">{pickedSub}</p> : null}
                </div>
                <button onClick={() => setSelected(null)} className="shrink-0 rounded-full px-2 text-lg leading-none text-[#4f5d5a] hover:text-[#1f2a28]" aria-label="Close">
                  ×
                </button>
              </div>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5d6b68]">Explore</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(
                  [
                    ["down", "What it leads to"],
                    ["up", "What leads to it"],
                  ] as const
                ).map(([k, text]) => (
                  <button
                    key={k}
                    onClick={() => exploreAs({ kind: k })}
                    aria-pressed={reach?.kind === k}
                    className={`rounded-full border px-2.5 py-1 text-[12.5px] font-semibold ${
                      reach?.kind === k ? "border-[#3d6b63] bg-[#3d6b63] text-white" : "border-[#d9dfdc] bg-white text-[#1f2a28] hover:border-[#3d6b63]"
                    }`}
                  >
                    {k === "down" ? "↓" : "↑"} {text}
                  </button>
                ))}
                <select
                  value={reach?.kind === "path" ? reach.to : ""}
                  onChange={(e) => exploreAs(e.target.value ? { kind: "path", to: e.target.value } : null)}
                  aria-label="Show the route to another box"
                  className={`rounded-full border px-2.5 py-1 text-[12.5px] font-semibold ${
                    reach?.kind === "path" ? "border-[#3d6b63] bg-[#3d6b63] text-white" : "border-[#d9dfdc] bg-white text-[#1f2a28]"
                  }`}
                >
                  <option value="">Route to…</option>
                  {nodes
                    .filter((n) => n.id !== selected)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                </select>
              </div>
              {reach ? (
                <p className="mt-1.5 text-[12.5px] leading-snug text-[#33413e]" aria-live="polite">
                  {!reached
                    ? `No arrows connect ${picked.label} and ${labelOf(reach.kind === "path" ? reach.to : "")}.`
                    : reach.kind === "path"
                      ? `${reached.nodes.map(labelOf).join(" → ")}${"directed" in reached && !reached.directed ? " (not all arrows point this way)" : ""}`
                      : reached.nodes.length < 2
                        ? reach.kind === "down"
                          ? "Nothing here: no arrow starts at this box."
                          : "Nothing here: no arrow ends at this box."
                        : `${reach.kind === "down" ? "Leads to" : "Reached from"} ${reached.nodes.length - 1} ${reached.nodes.length === 2 ? "box" : "boxes"}: ${reached.nodes.slice(1).map(labelOf).join(", ")}.`}
                </p>
              ) : null}
              {mentions.length ? (
                <>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5d6b68]">Explained in</p>
                  <ul className="mt-1 space-y-1">
                    {mentions.map(({ s, i }) => (
                      <li key={i}>
                        <button onClick={() => jump(i)} className="w-full rounded-lg bg-[#f4f5f2] px-2 py-1.5 text-left text-[12.5px] leading-snug text-[#33413e] hover:bg-[#e6efec]">
                          <b className="text-[#3d6b63]">Step {i + 1}</b> · {s.caption.length > 90 ? `${s.caption.slice(0, 88).trimEnd()}…` : s.caption}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-2 text-[12.5px] text-[#5d6b68]">No step is about this one.</p>
              )}
            </aside>
          </div>
        ) : null}

        <div className={`min-w-0 space-y-3 ${wide ? "lg:col-start-2 lg:row-start-3" : "lg:col-start-1 lg:row-start-3"}`}>
          {flow.note ? <p className="text-[13px] leading-relaxed text-[#4f5d5a]">{flow.note}</p> : null}
          {/* Every step at a glance (desktop, where the column has room): jump to any of them. */}
          <ol className="hidden space-y-0.5 lg:block" aria-label="Steps">
            {flow.steps.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => jump(i)}
                  aria-current={i === at ? "step" : undefined}
                  className={`flex w-full gap-2 rounded-lg px-2 py-1 text-left text-[12.5px] leading-snug ${
                    i === at ? "bg-[#e6efec] text-[#1f2a28]" : "text-[#4f5d5a] hover:bg-white hover:text-[#1f2a28]"
                  }`}
                >
                  <b className={`w-5 shrink-0 text-right tabular-nums ${i === at ? "text-[#3d6b63]" : "text-[#8a9a96]"}`}>{i + 1}</b>
                  <span className="truncate">{s.caption}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
