// Renders a topic's Markdown body (server side). Fenced blocks marked ```js run become a
// Try it editor using the sandboxed runner; other code blocks are shown read-only.
import type { ReactElement, ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import Code from "./Code"
import TryIt from "./TryIt"

const RUN = /^```js run[^\n]*\n([\s\S]*?)\n```[ \t]*$/gm

const components: Components = {
  h2: ({ children }) => <h2 className="mt-9 text-lg font-extrabold tracking-tight text-[#1f2a28] first:mt-0 sm:text-xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-base font-bold text-[#1f2a28]">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-[15px] leading-relaxed text-[#33413e]">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#33413e]">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#33413e]">{children}</ol>,
  a: ({ href, children }) => (
    <a href={href} className="font-semibold text-[#2f564f] underline decoration-[#3d6b63]/40 underline-offset-2 hover:decoration-[#3d6b63]">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-bold text-[#1f2a28]">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-[#1f2a28]/[0.07] px-1 py-px font-mono text-[0.88em] text-[#1f2a28]">{children}</code>,
  pre: ({ children }) => {
    const el = children as ReactElement<{ children?: ReactNode }>
    const text = String(el?.props?.children ?? "").replace(/\n$/, "")
    return (
      <div className="mt-4">
        <Code code={text} label="Code example" />
      </div>
    )
  },
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-xl border border-[#d9dfdc] bg-white">
      <table className="w-full min-w-[520px] border-collapse text-left text-[13.5px] leading-snug text-[#33413e]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-[#d9dfdc] bg-[#e6efec] px-3 py-2 font-bold text-[#1f2a28]">{children}</th>,
  td: ({ children }) => <td className="border-b border-[#eef1f0] px-3 py-2 align-top">{children}</td>,
}

export default function Markdown({ source }: { source: string }) {
  const parts: ({ md: string } | { run: string })[] = []
  let last = 0
  for (const m of source.matchAll(RUN)) {
    parts.push({ md: source.slice(last, m.index) })
    parts.push({ run: m[1] })
    last = (m.index ?? 0) + m[0].length
  }
  parts.push({ md: source.slice(last) })
  return (
    <div className="min-w-0">
      {parts.map((p, i) =>
        "run" in p ? (
          <div key={i} className="mt-4 rounded-2xl border border-[#d9dfdc] bg-[#fafbf9] p-3 sm:p-4">
            <TryIt initialCode={p.run} />
          </div>
        ) : p.md.trim() ? (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={components}>
            {p.md}
          </ReactMarkdown>
        ) : null,
      )}
    </div>
  )
}
