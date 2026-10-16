// Small shared pieces of the path pages: the state marks and colours, and titles with `code` in them.
import type { TopicState } from "./progress"

export const STATE_LABEL: Record<TopicState, string> = { todo: "Not started", progress: "In progress", done: "Done" }

/** The round mark on each node: an empty ring, a half-filled amber ring, or a teal tick. */
export function StateDot({ state, n, size = 28 }: { state: TopicState; n?: number; size?: number }) {
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      {state === "done" ? (
        <>
          <circle cx={r} cy={r} r={r - 1} fill="#3d6b63" />
          <path d={`M${r - 5.5} ${r + 0.5}l3.6 3.6 7-7.6`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : state === "progress" ? (
        <>
          <circle cx={r} cy={r} r={r - 1.5} fill="#fff" stroke="#b7791f" strokeWidth="2" />
          <path d={`M${r} 3.5A${r - 3.5} ${r - 3.5} 0 0 1 ${r} ${size - 3.5}Z`} fill="#e9b45c" />
          {n ? (
            <text x={r} y={r + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5c3d0a">
              {n}
            </text>
          ) : null}
        </>
      ) : (
        <>
          <circle cx={r} cy={r} r={r - 1.5} fill="#fff" stroke="#aab8b3" strokeWidth="1.5" />
          {n ? (
            <text x={r} y={r + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5d6b68">
              {n}
            </text>
          ) : null}
        </>
      )}
    </svg>
  )
}

export function StateChip({ state }: { state: TopicState }) {
  const cls =
    state === "done"
      ? "bg-[#3d6b63] text-white"
      : state === "progress"
        ? "bg-[#fbefd9] text-[#7a4f0e] ring-1 ring-[#e9b45c]"
        : "bg-white text-[#4f5d5a] ring-1 ring-[#d9dfdc]"
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{STATE_LABEL[state]}</span>
}

/** Renders `backticked` words in a title as inline code. */
export function Title({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? (
          <code key={i} className="rounded bg-black/[0.06] px-1 font-mono text-[0.92em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

export const plain = (text: string) => text.replace(/`/g, "")
