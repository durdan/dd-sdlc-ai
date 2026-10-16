"use client"
// A card on /learn/paths: a preview of the path's map, what it covers, and your progress.
import Link from "next/link"
import type { MapLayout, Path } from "@/lib/paths/types"
import MapThumb from "./MapThumb"
import { useProgress } from "./progress"

type Props = { path: Path; layout: MapLayout; topicIds: string[]; shared: Record<string, string[]> }

export default function PathCard({ path, layout, topicIds, shared }: Props) {
  const { done, total, stateOf } = useProgress(path.id, topicIds, shared)
  const started = topicIds.some((id) => stateOf(id) !== "todo")
  return (
    <Link
      href={`/learn/paths/${path.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d9dfdc] bg-white transition-[border-color,box-shadow] hover:border-[#3d6b63] hover:shadow-[0_8px_24px_-14px_rgba(31,42,40,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63]"
    >
      <div className="border-b border-[#e3e8e6] bg-[#eef3f1] px-4 py-3">
        <MapThumb layout={layout} className="h-24 w-full" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[16px] font-bold leading-snug text-[#1f2a28] group-hover:text-[#2f564f]">{path.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-[#4f5d5a]">{path.promise}</p>
        <p className="mt-3 text-xs font-semibold text-[#5d6b68]">
          {total} topics · {path.stages.length} {path.stages.length === 1 ? "stage" : "stages"}
          {path.level ? ` · ${path.level[0].toUpperCase()}${path.level.slice(1)}` : ""}
        </p>
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between text-xs text-[#4f5d5a]">
            <span>{started ? `${done} of ${total} done` : "Not started"}</span>
            <span className="font-semibold text-[#3d6b63] group-hover:underline">{started ? "Continue" : "Open"} →</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e6efec]" aria-hidden="true">
            <div className="h-full rounded-full bg-[#3d6b63] transition-[width] duration-500" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
          </div>
        </div>
      </div>
    </Link>
  )
}
