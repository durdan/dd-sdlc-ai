// A small read-only code view with line numbers, light syntax colours and one highlighted line.
import { Fragment, type ReactNode } from "react"

const TOKEN =
  /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/.*)|\b(async|function|await|const|let|var|return|new|true|false|null|undefined)\b|\b(\d+)\b|\b(console|Promise|setTimeout|queueMicrotask)\b/g

function colour(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    const cls = m[1] ? "text-[#8a4b12]" : m[2] ? "text-[#7b8a86] italic" : m[3] ? "text-[#2f564f] font-semibold" : m[4] ? "text-[#9a3d6b]" : "text-[#285e8a]"
    out.push(
      <span key={i} className={cls}>
        {m[0]}
      </span>,
    )
    last = i + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

export default function Code({ code, line, label, wrap }: { code: string; line?: number | null; label: string; wrap?: boolean }) {
  const lines = code.split("\n")
  return (
    <pre
      aria-label={label}
      className="overflow-x-auto rounded-xl border border-[#d9dfdc] bg-white py-2 font-mono text-[12.5px] leading-[1.7] text-[#1f2a28] sm:text-[13px]"
    >
      <code className={`grid grid-cols-[auto_1fr] ${wrap ? "" : "min-w-max"}`}>
        {lines.map((text, i) => {
          const on = line === i + 1
          return (
            <Fragment key={i}>
              <span
                aria-hidden="true"
                className={`select-none border-l-[3px] pl-2 pr-3 text-right tabular-nums transition-colors duration-200 ${
                  on ? "border-[#3d6b63] bg-[#dcebe6] text-[#2f564f]" : "border-transparent text-[#a3b0ac]"
                }`}
              >
                {i + 1}
              </span>
              <span className={`pr-4 transition-colors duration-200 ${wrap ? "min-w-0 whitespace-pre-wrap break-words pl-[2ch] -indent-[2ch]" : ""} ${on ? "bg-[#dcebe6]" : ""}`} aria-current={on ? "step" : undefined}>
                {text ? colour(text) : " "}
              </span>
            </Fragment>
          )
        })}
      </code>
    </pre>
  )
}
