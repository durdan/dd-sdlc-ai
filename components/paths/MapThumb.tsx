// A small picture of a path's map, drawn from the same elkjs layout as the full map.
import type { MapLayout } from "@/lib/paths/types"

export default function MapThumb({ layout, className }: { layout: MapLayout; className?: string }) {
  const pad = 16
  const vb = `${-pad} ${-pad} ${layout.width + pad * 2} ${layout.height + pad * 2}`
  return (
    <svg viewBox={vb} className={className} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {layout.edges.map((e) => (
        <path key={e.id} d={e.d} fill="none" stroke={e.kind === "flow" ? "#9fb3ae" : "#b9c7c2"} strokeWidth={e.kind === "flow" ? 6 : 5} strokeDasharray={e.kind === "flow" ? "10 12" : undefined} />
      ))}
      {layout.stages.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={16} fill={i === layout.stages.length - 1 && layout.nodes.some((n) => n.kind === "bridge") ? "#12201d" : "#cfe0db"} />
      ))}
      {layout.nodes.map((n) => (
        <rect
          key={n.id}
          x={n.x}
          y={n.y}
          width={n.w}
          height={n.h}
          rx={16}
          fill={n.kind === "bridge" ? "none" : "#ffffff"}
          stroke={n.kind === "bridge" ? "#9fb3ae" : "#c9d3cf"}
          strokeWidth={4}
          strokeDasharray={n.kind === "bridge" ? "10 8" : undefined}
        />
      ))}
    </svg>
  )
}
