// A card that links a topic to a walkthrough in the library, with its thumbnail if there is one.
import Link from "next/link"
import type { WalkthroughRef } from "@/lib/paths/types"

export default function WalkthroughCard({ w, compact }: { w: WalkthroughRef; compact?: boolean }) {
  return (
    <Link
      href={w.href}
      className="group flex items-stretch gap-4 overflow-hidden rounded-2xl border border-[#d9dfdc] bg-white p-3 transition-colors hover:border-[#3d6b63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63]"
    >
      {w.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- small static SVG thumbnails
        <img src={w.thumb} alt="" width={160} height={100} className={`shrink-0 rounded-xl border border-[#e3e8e6] bg-[#f4f5f2] object-cover ${compact ? "h-16 w-24" : "h-24 w-36 sm:h-28 sm:w-44"}`} />
      ) : null}
      <span className="flex min-w-0 flex-col justify-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">Walkthrough in the library</span>
        <span className="mt-0.5 text-[15px] font-bold leading-snug text-[#1f2a28] group-hover:text-[#3d6b63]">{w.title} →</span>
        {!compact && w.blurb ? <span className="mt-1 text-[13px] leading-snug text-[#5d6b68]">{w.blurb}</span> : null}
      </span>
    </Link>
  )
}
