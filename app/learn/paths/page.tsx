import type { Metadata } from "next"
import SiteHeader from "@/components/learn/SiteHeader"
import PathsIndex, { type IndexItem } from "@/components/paths/PathsIndex"
import PathsMapView from "@/components/paths/PathsMapView"
import { layoutPathsMap } from "@/lib/paths/layout"
import { getPathsData } from "@/lib/paths/load"

// A static "paths" segment, so /learn/paths/... wins over the dynamic /learn/[kind]/[id] route.
export const metadata: Metadata = {
  title: "Learning paths",
  description:
    "Learn in order: maps of topics for languages, runtimes, frameworks, mobile, testing, AI and system design, each with explanations, runnable examples and quick checks.",
  alternates: { canonical: "https://sdlc.dev/learn/paths" },
}

export default async function PathsIndexPage() {
  const data = await getPathsData()
  const [wide, narrow] = await Promise.all([layoutPathsMap(data, "RIGHT"), layoutPathsMap(data, "DOWN")])
  const ids = (pid: string) => data.paths.find((p) => p.id === pid)!.stages.flatMap((s) => s.topics)
  const counts = Object.fromEntries(data.paths.map((p) => [p.id, ids(p.id).length]))

  // Only what the list needs goes to the client (no topic bodies).
  const items: IndexItem[] = data.paths.map((p) => {
    const topicIds = ids(p.id)
    return {
      id: p.id,
      title: p.title,
      promise: p.promise,
      kind: p.kind,
      level: p.level,
      tags: p.tags,
      topicIds,
      shared: Object.fromEntries(topicIds.map((t) => [t, data.pathsByTopic[t].filter((x) => x !== p.id)])),
      haystack: [p.title, p.promise, ...topicIds.map((t) => data.topics[t].title)].join("\n").toLowerCase(),
    }
  })

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#1f2a28]">
      <SiteHeader />
      <PathsIndex items={items} />
      {wide.nodes.length > 0 && (
        <section aria-labelledby="paths-connect" className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-5">
          <div className="rounded-2xl bg-[#12201d] p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h2 id="paths-connect" className="text-[15px] font-bold text-white">
                How the paths connect
              </h2>
              <p className="text-[13px] text-[#c9d6d2]">Where each path leads when you finish it.</p>
            </div>
            {/* The map keeps its laid-out size; on narrow screens it scrolls sideways inside the panel. */}
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <PathsMapView wide={wide} narrow={narrow} paths={data.paths} counts={counts} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
