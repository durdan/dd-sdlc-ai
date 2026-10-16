// The map of paths on /learn/paths: which path leads to which (`next` in the front matter),
// laid out by elkjs on the server: left to right on wide screens, top to bottom on phones.
import Link from "next/link"
import { KIND_LABEL, type Path, type PathsMapLayout } from "@/lib/paths/types"

type Props = { wide: PathsMapLayout; narrow: PathsMapLayout; paths: Path[]; counts: Record<string, number> }

export default function PathsMapView({ wide, narrow, paths, counts }: Props) {
  if (!wide.nodes.length) return null
  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <Drawing layout={wide} paths={paths} counts={counts} />
      </div>
      <div className="sm:hidden">
        <Drawing layout={narrow} paths={paths} counts={counts} narrow />
      </div>
    </>
  )
}

function Drawing({ layout, paths, counts, narrow }: { layout: PathsMapLayout; paths: Path[]; counts: Record<string, number>; narrow?: boolean }) {
  const byId = new Map(paths.map((p) => [p.id, p]))
  return (
    <div className="relative mx-auto" style={{ width: layout.width, height: layout.height, maxWidth: "none" }}>
      <svg className="absolute inset-0 overflow-visible" width={layout.width} height={layout.height} aria-hidden="true">
        <defs>
          <marker id={`pp-arrow${narrow ? "-n" : ""}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1.5 8.5 5 1 8.5" fill="none" stroke="#8fc2b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {layout.edges.map((e) => (
          <path key={e.id} d={e.d} fill="none" stroke="#8fc2b6" strokeOpacity={0.7} strokeWidth={1.8} markerEnd={`url(#pp-arrow${narrow ? "-n" : ""})`} />
        ))}
      </svg>
      {layout.nodes.map((n) => {
        const p = byId.get(n.id)!
        const i = p.title.indexOf(": ")
        const name = i < 0 ? p.title : p.title.slice(0, i)
        return (
          <Link
            key={n.id}
            href={`/learn/paths/${p.id}`}
            style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
            className={`absolute flex flex-col justify-center rounded-2xl border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc2b6] ${
              p.kind === "system-design" ? "border-dashed border-[#8fc2b6]/60 bg-transparent hover:bg-white/[0.06]" : "border-white/15 bg-white/[0.07] hover:border-[#8fc2b6]/70 hover:bg-white/[0.1]"
            }`}
          >
            <span className="truncate text-[14px] font-bold text-white">{name}</span>
            <span className="truncate text-[12px] text-[#c9d6d2]">
              {KIND_LABEL[p.kind]} · {counts[p.id]} topics
            </span>
          </Link>
        )
      })}
    </div>
  )
}
