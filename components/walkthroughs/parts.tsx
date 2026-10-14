"use client"
// Shared pieces of the request pages: the streamed script and the system diagram.
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const card = "rounded-2xl border border-[#d9dfdc] bg-white"
export const button =
  "rounded-full bg-[#3d6b63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2f564f] disabled:cursor-not-allowed disabled:opacity-50"
export const ghost =
  "rounded-full border border-[#d9dfdc] bg-white px-5 py-2 text-sm font-semibold text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63] disabled:opacity-50"
export const field =
  "w-full rounded-xl border border-[#d9dfdc] bg-white px-3 py-2 text-[15px] text-[#1f2a28] outline-none focus:border-[#3d6b63] focus:ring-2 focus:ring-[#3d6b63]/15"

export function ScriptView({ text, streaming }: { text: string; streaming?: boolean }) {
  if (!text) {
    return <p className="animate-pulse text-sm text-[#6b7a76]">Writing the script…</p>
  }
  return (
    <div className="wr-script text-[15px] leading-relaxed text-[#1f2a28]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      {streaming ? <span className="wr-caret" aria-hidden="true" /> : null}
      <style>{`
        .wr-script h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 .75rem; }
        .wr-script h2 { font-size: 1.05rem; font-weight: 700; color: #3d6b63; margin: 1.4rem 0 .4rem; }
        .wr-script h2:first-child { margin-top: 0; }
        .wr-script p { margin: 0 0 .7rem; }
        .wr-script ul { list-style: disc; padding-left: 1.2rem; margin: 0 0 .7rem; }
        .wr-caret { display: inline-block; width: .5rem; height: 1rem; margin-left: 2px; background: #3d6b63; vertical-align: text-bottom; animation: wr-blink 1s steps(2) infinite; }
        @keyframes wr-blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}

/** The rendered SVG, drawn in: boxes fade up one by one, then the arrows trace. */
export function DiagramView({ svg, error, onRetry }: { svg?: string; error?: string; onRetry?: () => void }) {
  if (error) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-[#6b7a76]">
        <p>{error}</p>
        {onRetry ? (
          <button className={ghost} onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    )
  }
  if (!svg) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-[#6b7a76]">
        <svg viewBox="0 0 120 70" className="h-16 w-28 animate-pulse" aria-hidden="true">
          <rect x="4" y="4" width="40" height="22" rx="4" fill="#e6efec" />
          <rect x="76" y="4" width="40" height="22" rx="4" fill="#e6efec" />
          <rect x="40" y="44" width="40" height="22" rx="4" fill="#e6efec" />
          <path d="M44 15h32M24 26l26 18M96 26L70 44" stroke="#c5ccc9" strokeWidth="2" fill="none" />
        </svg>
        Drawing the system diagram…
      </div>
    )
  }
  return (
    <div className="wr-diagram">
      <div dangerouslySetInnerHTML={{ __html: stagger(svg) }} />
      <style>{`
        .wr-diagram svg { width: 100%; height: auto; max-height: 70vh; display: block; }
        .wr-diagram .dg-group { animation: wr-fade .5s ease-out both; }
        .wr-diagram .dg-node { animation: wr-rise .45s ease-out both; }
        .wr-diagram .dg-edge { animation: wr-fade .3s ease-out both; }
        .wr-diagram .dg-edge path:not([stroke-dasharray]) { stroke-dasharray: 1600; stroke-dashoffset: 1600; animation: wr-draw 1.4s ease-out forwards; animation-delay: inherit; }
        .wr-diagram .dg-edge-label { animation: wr-fade .4s ease-out 2s both; }
        @keyframes wr-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes wr-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wr-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) { .wr-diagram * { animation: none !important; stroke-dashoffset: 0 !important; } }
      `}</style>
    </div>
  )
}

/** Give each box and arrow its own start time so the diagram builds up in reading order. */
function stagger(svg: string) {
  let n = 0
  let e = 0
  return svg
    .replace(/<g class="dg-node"/g, () => `<g class="dg-node" style="animation-delay:${(0.07 * n++).toFixed(2)}s"`)
    .replace(/<g class="dg-edge"/g, () => `<g class="dg-edge" style="animation-delay:${(0.9 + 0.06 * e++).toFixed(2)}s"`)
}

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  queued: "Received",
  in_production: "In production",
  ready: "Ready",
  cancelled: "Cancelled",
}
