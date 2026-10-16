import type { Metadata } from "next"
import SiteHeader from "@/components/learn/SiteHeader"
import PathCard from "@/components/paths/PathCard"
import PathsMapView from "@/components/paths/PathsMapView"
import { layoutPath, layoutPathsMap } from "@/lib/paths/layout"
import { getPathsData } from "@/lib/paths/load"
import { KIND_LABEL, KIND_ORDER } from "@/lib/paths/types"

// A static "paths" segment, so /learn/paths/... wins over the dynamic /learn/[kind]/[id] route.
export const metadata: Metadata = {
  title: "Learning paths",
  description: "Learn in order: maps of topics from how JavaScript and Node.js run to how large systems stay up, each with explanations, runnable examples and quick checks.",
  alternates: { canonical: "https://sdlc.dev/learn/paths" },
}

const KIND_BLURB = {
  skill: "How a language or runtime really works, one topic at a time.",
  role: "What a role needs to know, in the order it needs it.",
  "system-design": "Short routes through the library's pattern walkthroughs.",
} as const

export default async function PathsIndexPage() {
  const data = await getPathsData()
  const [layouts, wide, narrow] = await Promise.all([
    Promise.all(data.paths.map((p) => layoutPath(p, data))),
    layoutPathsMap(data, "RIGHT"),
    layoutPathsMap(data, "DOWN"),
  ])
  const ids = (pid: string) => data.paths.find((p) => p.id === pid)!.stages.flatMap((s) => s.topics)
  const counts = Object.fromEntries(data.paths.map((p) => [p.id, ids(p.id).length]))
  const written = Object.values(data.topics).filter((t) => t.source === "content").length

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#1f2a28]">
      <SiteHeader />
      <section className="bg-[#12201d] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fc2b6]">Learning paths</p>
          <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-xl">
              <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[44px]">
                Learn it <span className="text-[#8fc2b6]">in order</span>
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#c9d6d2] sm:text-base">
                Each path is a map: topics grouped into stages, arrows for what builds on what. Open a topic to read it, run its examples and check yourself. Your
                progress stays in this browser.
              </p>
              <p className="mt-4 text-sm text-[#9fb3ae]">
                {data.paths.length} paths · {written} written topics · {Object.keys(data.topics).length - written} library walkthroughs
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8fc2b6]">Where each path leads</p>
              <PathsMapView wide={wide} narrow={narrow} paths={data.paths} counts={counts} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] space-y-12 px-4 pb-16 pt-8 sm:px-5 sm:pt-10">
        {KIND_ORDER.map((kind) => {
          const paths = data.paths.filter((p) => p.kind === kind)
          if (!paths.length) return null
          return (
            <section key={kind} aria-labelledby={`kind-${kind}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 id={`kind-${kind}`} className="text-xl font-extrabold tracking-tight text-[#1f2a28] sm:text-2xl">
                  {KIND_LABEL[kind]}
                </h2>
                <p className="text-sm text-[#4f5d5a]">{KIND_BLURB[kind]}</p>
              </div>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paths.map((p) => {
                  const topicIds = ids(p.id)
                  const shared = Object.fromEntries(topicIds.map((t) => [t, data.pathsByTopic[t].filter((x) => x !== p.id)]))
                  return (
                    <li key={p.id}>
                      <PathCard path={p} layout={layouts[data.paths.indexOf(p)]} topicIds={topicIds} shared={shared} />
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </main>
    </div>
  )
}
