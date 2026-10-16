"use client"
// A path page: a dark intro band with progress, then the map. On wide screens the map uses
// the positions elkjs computed on the server (stages as columns, arrows for prerequisites),
// scaled to fit; on phones the stages are stacked lists. Each node opens the topic panel.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import SiteHeader from "@/components/learn/SiteHeader"
import { KIND_LABEL, type MapLayout, type Path, type Topic } from "@/lib/paths/types"
import { useProgress, type TopicState } from "./progress"
import { StateDot, STATE_LABEL, Title, plain } from "./bits"
import TopicPanel from "./TopicPanel"

const NODE: Record<TopicState, string> = {
  todo: "border-[#d9dfdc] bg-white hover:border-[#9fb3ae]",
  progress: "border-[#e0b35f] bg-[#fffaf0] hover:border-[#b7791f]",
  done: "border-[#3d6b63]/50 bg-[#e6efec] hover:border-[#3d6b63]",
}

type Props = {
  path: Path
  topics: Topic[]
  layout: MapLayout
  shared: Record<string, string[]>
  nextPaths: { id: string; title: string; promise: string }[]
  /** The path's optional Markdown intro, rendered on the server. */
  children?: ReactNode
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

export default function PathMap({ path, topics, layout, shared, nextPaths, children }: Props) {
  const ids = topics.map((t) => t.id)
  const { stateOf, set, start, done, total } = useProgress(path.id, ids, shared)
  const [open, setOpen] = useState<string | null>(null)
  const lastOpened = useRef<string | null>(null)
  // Before the browser has read localStorage the map shows everything as not started; avoid a flash of that.
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  const openTopic = useCallback(
    (id: string) => {
      start(id)
      lastOpened.current = id
      setOpen(id)
    },
    [start],
  )
  const close = useCallback(() => {
    setOpen(null)
    const id = lastOpened.current
    // Each topic has a node on the wide map and one on the stacked map; focus the visible one.
    if (id) requestAnimationFrame(() => [...document.querySelectorAll<HTMLButtonElement>(`[data-node="${id}"]`)].find((b) => b.offsetParent !== null)?.focus())
  }, [])

  const byId = new Map(topics.map((t) => [t.id, t]))
  const index = open ? ids.indexOf(open) : -1
  const topic = index >= 0 ? topics[index] : null
  const stage = topic ? path.stages.find((s) => s.topics.includes(topic.id))! : null
  const next = index >= 0 ? topics[index + 1] : undefined
  const resume = topics.find((t) => stateOf(t.id) === "progress") ?? topics.find((t) => stateOf(t.id) === "todo")
  const [lead, rest] = splitTitle(path.title)

  const node = (t: Topic, n: number, fixed: boolean) => {
    const st = stateOf(t.id)
    const interactive = t.lesson.type === "lanes"
    return (
      <button
        data-node={t.id}
        onClick={() => openTopic(t.id)}
        aria-haspopup="dialog"
        aria-label={`${n}. ${plain(t.title)}, ${STATE_LABEL[st]}${interactive ? ", interactive lesson" : ""}`}
        className={`jsp-node group relative flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-[0_1px_0_rgba(31,42,40,0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:shadow-[0_6px_18px_-10px_rgba(31,42,40,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f5f2] motion-safe:hover:-translate-y-px ${fixed ? "h-full" : ""} ${NODE[st]} ${open === t.id ? "ring-2 ring-[#3d6b63]" : ""}`}
      >
        <StateDot state={st} n={n} />
        <span className="min-w-0 flex-1">
          <span className={`text-[15px] font-semibold leading-snug text-[#1f2a28] ${fixed ? "line-clamp-2" : "block"}`}>
            <Title text={t.title} />
          </span>
          <span className={`mt-0.5 text-[13px] leading-snug text-[#5d6b68] ${fixed ? "line-clamp-2" : "block"}`}>{t.summary}</span>
        </span>
        {interactive ? (
          <span className={`${fixed ? "absolute -top-2 right-3" : "shrink-0 self-start"} rounded-full bg-[#12201d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8fc2b6]`}>Interactive</span>
        ) : null}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#1f2a28]">
      <SiteHeader />
      <section className="bg-[#12201d] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-5 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fc2b6]">
            <Link href="/learn/paths" className="hover:text-white">
              Learning paths
            </Link>{" "}
            · {KIND_LABEL[path.kind]}
            {path.level ? ` · ${path.level[0].toUpperCase()}${path.level.slice(1)}` : ""}
          </p>
          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">
                {rest ? (
                  <>
                    {lead}: <span className="text-[#8fc2b6]">{rest}</span>
                  </>
                ) : (
                  lead
                )}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#c9d6d2] sm:text-base">{path.promise}</p>
            </div>
            <div className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-opacity lg:w-[320px] ${ready ? "opacity-100" : "opacity-0"}`}>
              <p className="text-sm text-[#c9d6d2]">
                <b className="text-2xl font-extrabold text-white">{done}</b> of {total} done
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label={`${done} of ${total} topics done`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
              >
                <div className="h-full rounded-full bg-[#8fc2b6] transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
              </div>
              {resume ? (
                <button
                  onClick={() => openTopic(resume.id)}
                  className="mt-3 w-full truncate rounded-full bg-[#8fc2b6] px-4 py-2 text-left text-sm font-semibold text-[#12201d] hover:bg-[#a6d1c7]"
                >
                  {done === 0 && stateOf(resume.id) === "todo" ? "Start" : "Continue"}: {plain(resume.title)} →
                </button>
              ) : (
                <p className="mt-3 text-sm font-semibold text-[#8fc2b6]">Path complete. Nicely done.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-5 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#1f2a28]">The map</h2>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#4f5d5a]" aria-label="Legend">
            {(["todo", "progress", "done"] as const).map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <StateDot state={s} size={18} />
                {STATE_LABEL[s]}
              </li>
            ))}
            <li className="hidden items-center gap-1.5 lg:flex">
              <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
                <path d="M1 5h19" stroke="#7f9690" strokeWidth="1.6" />
                <path d="M18 1.5 23 5l-5 3.5" fill="none" stroke="#7f9690" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              Builds on
            </li>
          </ul>
        </div>

        {/* Wide screens: the elkjs layout. */}
        <div className={`mt-5 hidden transition-opacity lg:block ${ready ? "opacity-100" : "opacity-0"}`}>
          <WideMap layout={layout} path={path} open={open}>
            {(n) => {
              if (n.kind === "bridge") {
                const b = path.bridges.find((x) => x.id === n.id)!
                return <BridgeLink b={b} fixed />
              }
              return node(byId.get(n.id)!, ids.indexOf(n.id) + 1, true)
            }}
          </WideMap>
        </div>

        {/* Phones and tablets: stacked stages. */}
        <ol className={`mt-5 grid gap-10 transition-opacity lg:hidden ${ready ? "opacity-100" : "opacity-0"}`}>
          {path.stages.map((s, si) => {
            const stageDone = s.topics.filter((t) => stateOf(t) === "done").length
            return (
              <li key={s.title} className="relative">
                {si < path.stages.length - 1 || path.bridges.length ? <DownArrow /> : null}
                <StageHeader n={si + 1} name={s.title} blurb={s.blurb} meta={`${stageDone}/${s.topics.length}`} />
                <ol className="relative mt-3 space-y-2.5 before:absolute before:bottom-6 before:left-[26px] before:top-6 before:w-0.5 before:rounded before:bg-[#cfd8d4] before:content-['']">
                  {s.topics.map((tid) => (
                    <li key={tid} className="relative">
                      {node(byId.get(tid)!, ids.indexOf(tid) + 1, false)}
                    </li>
                  ))}
                </ol>
              </li>
            )
          })}
          {path.bridges.length ? (
            <li className="relative">
              <StageHeader n={path.stages.length + 1} name="Next: system design" blurb="Same ideas, at service scale" dark />
              <ul className="mt-3 space-y-2.5">
                {path.bridges.map((b) => (
                  <li key={b.id}>
                    <BridgeLink b={b} />
                  </li>
                ))}
              </ul>
            </li>
          ) : null}
        </ol>

        {children ? <div className="mt-10 max-w-3xl">{children}</div> : null}

        {nextPaths.length ? (
          <section className="mt-12" aria-labelledby="next-paths">
            <h2 id="next-paths" className="text-lg font-bold text-[#1f2a28]">
              Where this path leads
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nextPaths.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/learn/paths/${p.id}`}
                    className="group block h-full rounded-2xl border border-[#d9dfdc] bg-white p-4 transition-colors hover:border-[#3d6b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63]"
                  >
                    <span className="block text-[15px] font-bold text-[#1f2a28] group-hover:text-[#3d6b63]">{p.title} →</span>
                    <span className="mt-1 block text-[13px] leading-snug text-[#5d6b68]">{p.promise}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      {topic && stage ? (
        <TopicPanel
          pathId={path.id}
          topic={topic}
          stageTitle={stage.title}
          number={index + 1}
          total={total}
          state={stateOf(topic.id)}
          requires={topic.requires.map((r) => byId.get(r)).filter((r): r is Topic => !!r)}
          next={next}
          onClose={close}
          onToggleDone={() => set(topic.id, stateOf(topic.id) === "done" ? "progress" : "done")}
          onNext={() => next && openTopic(next.id)}
          onOpen={openTopic}
        />
      ) : null}
    </div>
  )
}

function splitTitle(title: string): [string, string] {
  const i = title.indexOf(": ")
  return i < 0 ? [title, ""] : [title.slice(0, i), title.slice(i + 2)]
}

/** The ELK layout, drawn at its own size and scaled down to the width available. */
function WideMap({ layout, path, open, children }: { layout: MapLayout; path: Path; open: string | null; children: (n: MapLayout["nodes"][number]) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useIsoLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])
  const scale = width ? Math.min(1, width / layout.width) : 1
  const offset = width ? Math.max(0, (width - layout.width * scale) / 2) : 0
  const columns = layout.stages.length
  const hasBridges = path.bridges.length > 0

  return (
    <div ref={box} className="relative w-full" style={{ height: layout.height * scale }}>
      <div className="absolute top-0 origin-top-left" style={{ width: layout.width, height: layout.height, left: offset, transform: `scale(${scale})` }}>
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width={layout.width} height={layout.height} aria-hidden="true">
          <defs>
            <marker id="pm-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M1 1.5 8.5 5 1 8.5" fill="none" stroke="#9fb3ae" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="pm-arrow-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M1 1.5 8.5 5 1 8.5" fill="none" stroke="#3d6b63" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {layout.edges.map((e) => {
            const on = open !== null && (e.from === open || e.to === open)
            const flow = e.kind === "flow"
            return (
              <path
                key={e.id}
                d={e.d}
                fill="none"
                stroke={on ? "#3d6b63" : "#9fb3ae"}
                strokeWidth={on ? 2.2 : flow ? 2 : 1.6}
                strokeDasharray={flow ? "3 4" : undefined}
                strokeLinecap="round"
                markerEnd={`url(#${on ? "pm-arrow-on" : "pm-arrow"})`}
                opacity={open !== null && !on && !flow ? 0.45 : 1}
                className="transition-[stroke,opacity] duration-200"
              />
            )
          })}
        </svg>
        {layout.stages.map((s, i) => {
          const bridges = hasBridges && i === columns - 1
          const st = path.stages[i]
          return (
            <div key={i} className="absolute" style={{ left: s.x, top: s.y, width: s.w, height: s.h }}>
              {bridges ? (
                <StageHeader n={i + 1} name="Next: system design" blurb="Same ideas, at service scale" dark fill />
              ) : (
                <StageHeader n={i + 1} name={st.title} blurb={st.blurb} fill />
              )}
            </div>
          )
        })}
        {layout.nodes.map((n) => (
          <div key={n.id} className="absolute" style={{ left: n.x, top: n.y, width: n.w, height: n.h }}>
            {children(n)}
          </div>
        ))}
      </div>
    </div>
  )
}

function BridgeLink({ b, fixed }: { b: Path["bridges"][number]; fixed?: boolean }) {
  return (
    <Link
      href={b.href}
      className={`group block rounded-2xl border border-dashed border-[#9fb3ae] bg-[#f4f5f2] p-3 transition-colors hover:border-[#3d6b63] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] ${fixed ? "h-full overflow-hidden" : ""}`}
    >
      <span className="flex items-center justify-between gap-2 text-[15px] font-semibold text-[#1f2a28]">
        <span className="min-w-0 truncate">{b.title}</span>
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#3d6b63] group-hover:underline">Library ↗</span>
      </span>
      <span className={`mt-0.5 text-[13px] leading-snug text-[#5d6b68] ${fixed ? "line-clamp-3" : "block"}`}>{b.why}</span>
    </Link>
  )
}

function StageHeader({ n, name, blurb, meta, dark, fill }: { n: number; name: string; blurb: string; meta?: string; dark?: boolean; fill?: boolean }) {
  return (
    <div className={`relative z-[1] flex ${fill ? "h-full" : ""} items-center gap-3 rounded-2xl px-3 py-2.5 ${dark ? "bg-[#12201d] text-white" : "bg-[#e6efec] text-[#1f2a28]"}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${dark ? "bg-[#8fc2b6] text-[#12201d]" : "bg-[#3d6b63] text-white"}`}>
        {String(n).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-tight">{name}</span>
        <span className={`block truncate text-[12.5px] leading-snug ${dark ? "text-[#c9d6d2]" : "text-[#4f5d5a]"}`}>{blurb}</span>
      </span>
      {meta ? <span className="shrink-0 text-xs font-semibold text-[#3d6b63]">{meta}</span> : null}
    </div>
  )
}

/** On phones: the line down from one stage to the next. */
function DownArrow() {
  return (
    <svg className="absolute -bottom-10 left-[26px] h-10 w-4" viewBox="0 0 16 40" aria-hidden="true">
      <path d="M8 4v28" stroke="#9fb3ae" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
      <path d="M3.5 29 8 34.5 12.5 29" fill="none" stroke="#9fb3ae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
