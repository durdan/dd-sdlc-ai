"use client"
// The stage for a waterfall diagram: operations as bars on a time axis, so a reader sees what runs
// in parallel and what waits. Rows appear at the first step that focuses them (rows no step
// focuses are there from the start; a step with no focus shows every row), the step's rows are
// lit and the rest fade back. A tap on a row selects it, as a box does on the other stages.
import { useMemo } from "react"
import { ROLES, type Role } from "design-player/core"
import type { FlowDiagram } from "@/lib/paths/types"

/** Lane colours when a lane names no role: in order, so neighbouring lanes differ. */
const CYCLE: Role[] = ["service", "data", "queue", "client", "cache", "edge", "security"]

/** A round tick step giving about five ticks across `span`. */
function tickStep(span: number) {
  const raw = span / 5
  const p = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw
}

export function laneColours(flow: FlowDiagram) {
  const w = flow.waterfall!
  return new Map(w.lanes.map((l, i) => [l.id, ROLES[l.role ?? CYCLE[i % CYCLE.length]]]))
}

type Props = { flow: FlowDiagram; at: number; epoch: number; still: boolean; selected: string | null; onSelect: (id: string) => void }

export default function WaterfallStage({ flow, at, epoch, still, selected, onSelect }: Props) {
  const w = flow.waterfall!
  const colours = useMemo(() => laneColours(flow), [flow])
  const t0 = Math.min(...w.rows.map((r) => r.start))
  const t1 = Math.max(...w.rows.map((r) => r.end))
  const span = t1 - t0 || 1
  const step = tickStep(span)
  const ticks: number[] = []
  for (let t = Math.ceil(t0 / step) * step; t <= t1 + 1e-9; t += step) ticks.push(t)
  const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 })
  const pct = (t: number) => ((t - t0) / span) * 100

  const focus = flow.steps[at].focus
  const firstAt = (id: string) => {
    const i = flow.steps.findIndex((s) => s.focus.includes(id))
    return i < 0 ? 0 : i
  }
  const shown = (id: string) => !focus.length || firstAt(id) <= at
  const lit = (id: string) => !focus.length || focus.includes(id)
  const fallback = ROLES.service

  return (
    <div className="flex w-full flex-col overflow-x-auto px-3 pb-14 pt-4 font-mono text-[11.5px] text-[#1d2826] sm:px-5 sm:text-[12.5px]">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="rounded-full border border-[#b4652c]/50 bg-white px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#b4652c]">Illustrative timing</span>
        <span className="font-bold">
          Wall-clock {fmt(span)} {w.unit}
        </span>
        <span className="text-[#6b7875]">
          {fmt(t0)} → {fmt(t1)} {w.unit}
        </span>
      </div>
      <div className="grid grid-cols-[minmax(7.5rem,34%)_1fr] gap-x-3 pr-14 sm:grid-cols-[minmax(10rem,28%)_1fr] sm:pr-16">
        {/* Time axis */}
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#6b7875]">Operation</span>
        <div className="relative h-6 border-b border-[#c9d1ce]">
          {ticks.map((t) => (
            <span key={t} className="absolute bottom-1 -translate-x-1/2 whitespace-nowrap text-[10.5px] text-[#6b7875]" style={{ left: `${pct(t)}%` }}>
              {fmt(t)}
              {t === ticks[ticks.length - 1] ? ` ${w.unit}` : ""}
            </span>
          ))}
        </div>
        {w.rows.map((r) => {
          const c = (r.lane && colours.get(r.lane)) || fallback
          const on = shown(r.id)
          const dim = !lit(r.id)
          return (
            <div key={r.id} className="contents">
              <button
                onClick={() => onSelect(r.id)}
                className={`flex min-w-0 items-center gap-1.5 py-1.5 text-left transition-opacity duration-500 motion-reduce:transition-none ${on ? (dim ? "opacity-35" : "opacity-100") : "opacity-0"} ${
                  selected === r.id ? "font-bold text-[#8a6a2c]" : ""
                }`}
                style={{ paddingLeft: r.depth * 14 }}
                tabIndex={on ? 0 : -1}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.stroke }} />
                <span className="line-clamp-2 leading-tight">{r.label}</span>
              </button>
              <div className="relative py-1.5">
                {ticks.map((t) => (
                  <span key={t} aria-hidden="true" className="absolute inset-y-0 w-px bg-[#e1e6e3]" style={{ left: `${pct(t)}%` }} />
                ))}
                <button
                  // Re-keyed per step entry, so a bar that just appeared grows from its start.
                  key={on ? `${r.id}-${firstAt(r.id) === at ? epoch : "kept"}` : `${r.id}-off`}
                  onClick={() => onSelect(r.id)}
                  aria-label={`${r.label}: ${fmt(r.start)} to ${fmt(r.end)} ${w.unit}`}
                  className={`group relative flex h-5 items-center transition-opacity duration-500 motion-reduce:transition-none ${on ? (dim ? "opacity-30" : "opacity-100") : "opacity-0"}`}
                  style={{ marginLeft: `${pct(r.start)}%`, width: `${pct(r.end) - pct(r.start)}%` }}
                  tabIndex={-1}
                >
                  <span
                    className={`block h-full w-full origin-left rounded-[5px] border-[1.5px] ${on && !still ? "animate-[wf-grow_0.7s_ease-out]" : ""}`}
                    style={{ background: c.fill, borderColor: selected === r.id ? "#8a6a2c" : c.stroke, boxShadow: `inset 0 0 0 999px ${c.stroke}26` }}
                  />
                  <span className="absolute left-full ml-1.5 whitespace-nowrap text-[11px] text-[#4f5d5a]">
                    {fmt(r.end - r.start)} {w.unit}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes wf-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </div>
  )
}
