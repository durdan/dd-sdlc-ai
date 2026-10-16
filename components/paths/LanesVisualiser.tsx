"use client"
// The lanes visualiser: plays any ```trace lanes``` block (parsed by lib/paths/traces.ts) step by
// step. Every step holds the full state of every lane; items keep their id as they move between
// lanes, and a FLIP animation glides them from the old spot to the new one. Lane headers sit above
// moving items, so a glide never covers a title. With reduced motion, steps just swap in place.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import type { Tone, Trace, TraceItem, TraceLane } from "@/lib/paths/types"
import Code from "./Code"

const SPEEDS = [0.5, 1, 2] as const
const STEP_MS = 1900
const MOVE_MS = 520

const TONE: Record<Tone, string> = {
  plain: "border-[#3d6b63] bg-white text-[#1f2a28]",
  muted: "border-[#8a9a96] bg-[#eef1f0] text-[#33413e]",
  amber: "border-[#d39a3c] bg-[#fdf3e1] text-[#5c3d0a]",
  teal: "border-[#3d6b63] bg-[#e6efec] text-[#1f3a35]",
  blue: "border-[#4a7aa8] bg-[#e8f0f8] text-[#1d3550]",
  rose: "border-[#b8607a] bg-[#f9e9ee] text-[#5a1f30]",
  violet: "border-[#7d68b0] bg-[#efebf8] text-[#2f2350]",
}
const DEFAULT_TONE: Record<TraceLane["kind"], Tone> = { stack: "plain", queue: "teal", plain: "muted", console: "plain" }
const isHalf = (l: TraceLane) => l.kind === "stack" || l.kind === "plain"

type Props = { traces: Trace[]; index: number; onSelect: (i: number) => void }

export default function LanesVisualiser({ traces, index, onSelect }: Props) {
  const trace = traces[index]
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [still, setStill] = useState(false)
  // A new snippet starts from step 0. Reset while rendering, so a longer snippet's step number
  // never indexes a shorter one's steps.
  const [shown, setShown] = useState(index)
  if (shown !== index) {
    setShown(index)
    setStep(0)
    setPlaying(false)
  }
  const last = trace.steps.length - 1
  const at = Math.min(step, last)
  const s = trace.steps[at]
  const consoleLane = trace.lanes.find((l) => l.kind === "console")
  const boxes = trace.lanes.filter((l) => l.kind !== "console")
  // Stack and plain lanes pair up side by side; an odd one out takes the full width.
  const halves = boxes.filter(isHalf)
  const lone = halves.length % 2 ? halves[halves.length - 1].id : null

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    setStill(mq.matches)
    const on = () => setStill(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((n) => Math.min(n + 1, last)), STEP_MS / speed)
    return () => clearTimeout(t)
  }, [playing, step, last, speed])

  const play = () => {
    if (step >= last) setStep(0)
    setPlaying((p) => !p || step >= last)
  }
  const go = useCallback(
    (d: number) => {
      setPlaying(false)
      setStep((n) => Math.max(0, Math.min(last, n + d)))
    },
    [last],
  )

  // FLIP: remember where each item was, then animate from there to its new place.
  const board = useRef<HTMLDivElement>(null)
  const before = useRef<{ key: string; rects: Map<string, { x: number; y: number; node: HTMLElement }> }>({ key: "", rects: new Map() })
  useLayoutEffect(() => {
    const root = board.current
    if (!root) return
    const key = trace.id
    const base = root.getBoundingClientRect()
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-flip]"))
    els.forEach((el) => el.getAnimations().forEach((a) => a.cancel()))
    root.querySelectorAll("[data-ghost]").forEach((g) => g.remove())
    const prev = before.current.key === key ? before.current.rects : null
    const now = new Map<string, { x: number; y: number; node: HTMLElement }>()
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      now.set(el.dataset.flip!, { x: r.left - base.left, y: r.top - base.top, node: el.cloneNode(true) as HTMLElement })
    })
    if (prev && !still) {
      els.forEach((el) => {
        const was = prev.get(el.dataset.flip!)
        const is = now.get(el.dataset.flip!)!
        if (!was) {
          el.animate([{ opacity: 0, transform: "scale(0.85)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "ease-out", delay: 120, fill: "backwards" })
          return
        }
        const dx = was.x - is.x
        const dy = was.y - is.y
        if (Math.abs(dx) + Math.abs(dy) < 1) return
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: MOVE_MS, easing: "cubic-bezier(.2,.75,.2,1)" })
      })
      // Items that left: fade a copy out where they were (still below the lane headers).
      prev.forEach((was, itemId) => {
        if (now.has(itemId)) return
        const ghost = was.node
        Object.assign(ghost.style, { position: "absolute", left: `${was.x}px`, top: `${was.y}px`, margin: "0", pointerEvents: "none" })
        ghost.removeAttribute("data-flip")
        ghost.setAttribute("data-ghost", "")
        ghost.setAttribute("aria-hidden", "true")
        root.appendChild(ghost)
        const a = ghost.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-6px) scale(0.96)" }], { duration: 260, easing: "ease-in", fill: "forwards" })
        a.onfinish = () => ghost.remove()
        a.oncancel = () => ghost.remove()
      })
    }
    before.current = { key, rects: now }
  }, [trace.id, step, still])

  // Keep the chosen tab visible in the scrolling tab row on phones.
  const tabs = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = tabs.current?.children[index] as HTMLElement | undefined
    const row = tabs.current
    if (el && row && (el.offsetLeft < row.scrollLeft || el.offsetLeft + el.offsetWidth > row.scrollLeft + row.clientWidth))
      row.scrollTo({ left: el.offsetLeft - 8, behavior: still ? "auto" : "smooth" })
  }, [index, still])

  const out = consoleLane ? s.state[consoleLane.id] : []
  const prevOut = consoleLane && at > 0 ? trace.steps[at - 1].state[consoleLane.id].length : 0

  return (
    <div>
      {traces.length > 1 ? (
        <div ref={tabs} role="tablist" aria-label="Choose a snippet" className="flex gap-2 overflow-x-auto pb-1">
          {traces.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => onSelect(i)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                i === index ? "border-[#3d6b63] bg-[#3d6b63] text-white" : "border-[#d9dfdc] bg-white text-[#1f2a28] hover:border-[#3d6b63]"
              }`}
            >
              <span className="block text-[13px] font-bold">
                {i + 1}. {t.title}
              </span>
              {t.subtitle ? <span className={`block text-xs ${i === index ? "text-[#d4e6e1]" : "text-[#5d6b68]"}`}>{t.subtitle}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_1fr]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Code code={trace.code} line={s.line} label={`Snippet ${index + 1}: ${trace.title}`} wrap />
        </div>
        <div ref={board} className="relative grid min-w-0 grid-flow-row-dense grid-cols-2 content-start gap-2.5 sm:gap-3 lg:col-start-2 lg:row-span-3 lg:row-start-1">
          {boxes.map((lane) => (
            <LaneBox key={lane.id} lane={lane} items={s.state[lane.id]} wide={!isHalf(lane) || lane.id === lone} />
          ))}
          {consoleLane ? (
            <section className="col-span-2 rounded-2xl bg-[#12201d] p-3 text-white">
              <h4 className="relative z-20 -m-3 mb-0 flex items-baseline justify-between rounded-t-2xl bg-[#12201d] p-3 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8fc2b6]">
                {consoleLane.title}
                <span className="font-semibold normal-case tracking-normal text-[#9fb3ae]">
                  {out.length} {out.length === 1 ? "line" : "lines"}
                </span>
              </h4>
              <ol className="min-h-[5.5rem] space-y-1 font-mono text-[13px] sm:min-h-[7.5rem]">
                {out.map((it, i) => (
                  <li
                    key={it.id}
                    data-flip={it.id}
                    className={`relative z-10 flex gap-2 break-all rounded px-1.5 py-0.5 transition-colors duration-700 ${i >= prevOut && step > 0 ? "bg-[#8fc2b6]/20" : ""}`}
                  >
                    <span className="text-[#5d7a73]">›</span>
                    {it.label}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
        {/* Caption and controls: pinned to the bottom of the screen on phones so the lanes stay in view while stepping. */}
        <div className="sticky bottom-2 z-30 min-w-0 self-start rounded-2xl border border-[#d9dfdc] bg-white/95 p-3 shadow-[0_8px_28px_-14px_rgba(31,42,40,0.5)] backdrop-blur lg:static lg:col-start-1 lg:row-start-2 lg:shadow-none">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">
              Step {step} of {last}
            </span>
            <span className="h-1 flex-1 self-center overflow-hidden rounded-full bg-[#e6efec]" aria-hidden="true">
              <span className="block h-full rounded-full bg-[#3d6b63] transition-[width] duration-300" style={{ width: `${last ? (step / last) * 100 : 100}%` }} />
            </span>
          </div>
          <p aria-live="polite" className="mt-1.5 min-h-[3.9em] text-[14px] leading-snug text-[#1f2a28] sm:min-h-[2.8em]">
            {s.caption}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <Ctl label="Restart" onClick={() => go(-last)} disabled={step === 0}>
              <path d="M4 4v5h5M4.5 9A7 7 0 1 1 5 15" />
            </Ctl>
            <Ctl label="Step back" onClick={() => go(-1)} disabled={step === 0}>
              <path d="M15 5l-7 7 7 7" />
            </Ctl>
            <button
              onClick={play}
              aria-label={playing ? "Pause" : step >= last ? "Play again" : "Play"}
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
              {playing ? "Pause" : step >= last ? "Replay" : "Play"}
            </button>
            <Ctl label="Step forward" onClick={() => go(1)} disabled={step >= last}>
              <path d="M9 5l7 7-7 7" />
            </Ctl>
            <label className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#4f5d5a]">
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
        {trace.note ? <p className="hidden text-[13px] leading-relaxed text-[#4f5d5a] lg:col-start-1 lg:row-start-3 lg:block">{trace.note}</p> : null}
      </div>
      {trace.note ? <p className="mt-3 text-[13px] leading-relaxed text-[#4f5d5a] lg:hidden">{trace.note}</p> : null}
    </div>
  )
}

function LaneBox({ lane, items, wide }: { lane: TraceLane; items: TraceItem[]; wide: boolean }) {
  const stack = lane.kind === "stack"
  const row = lane.kind === "queue"
  const tone = lane.tone ?? DEFAULT_TONE[lane.kind]
  return (
    <section className={`flex min-w-0 flex-col rounded-2xl border border-[#d9dfdc] bg-[#fbfbfa] p-2.5 sm:p-3 ${wide ? "col-span-2" : ""}`}>
      {/* Above the items (z-20 over z-10) with a solid background, so a gliding item passes under the title. */}
      <header className="relative z-20 -m-2.5 mb-0 rounded-t-2xl bg-[#fbfbfa] p-2.5 pb-2 sm:-m-3 sm:mb-0 sm:p-3 sm:pb-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">{lane.title}</h4>
        {lane.hint ? <p className="text-[11.5px] leading-tight text-[#5d6b68]">{lane.hint}</p> : null}
      </header>
      <div
        className={`flex flex-1 gap-1.5 ${
          stack ? "min-h-[5.5rem] flex-col-reverse justify-start sm:min-h-[8.5rem]" : row ? "min-h-[2.4rem] flex-row flex-wrap items-center" : "min-h-[5.5rem] flex-col sm:min-h-[8.5rem]"
        }`}
      >
        {items.length === 0 ? (
          <span className={`text-xs italic text-[#9aa8a4] ${row ? "" : "my-auto self-center"}`}>empty</span>
        ) : (
          items.map((it, i) => (
            <span
              key={it.id}
              data-flip={it.id}
              className={`relative z-10 block max-w-full truncate rounded-lg border px-2 py-1.5 font-mono text-[12px] leading-tight shadow-sm ${TONE[it.tone ?? tone]} ${
                stack && i === items.length - 1 ? "ring-2 ring-[#3d6b63]/25" : ""
              }`}
              title={it.label}
            >
              {it.label}
            </span>
          ))
        )}
        {row && items.length > 0 ? <span className="sr-only">Front of the queue is first.</span> : null}
      </div>
    </section>
  )
}

export function Ctl({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dfdc] bg-white text-[#1f2a28] hover:border-[#3d6b63] hover:text-[#3d6b63] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
