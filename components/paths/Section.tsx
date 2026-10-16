// A numbered section of a topic page: the teal number tile, a title and a one-line hint.
import type { ReactNode } from "react"

export default function Section({ n, id, title, sub, children }: { n: number; id: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3d6b63] text-sm font-extrabold text-white">{n}</span>
        <div className="min-w-0">
          <h2 id={`${id}-h`} className="text-xl font-extrabold tracking-tight text-[#1f2a28] sm:text-2xl">
            {title}
          </h2>
          {sub ? <p className="text-sm text-[#4f5d5a]">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}
