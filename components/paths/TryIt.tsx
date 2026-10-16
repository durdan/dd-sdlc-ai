"use client"
// "Try it": edit the code and run it for real, in a sandboxed iframe (see runner.ts).
// Output appears in the order the browser produced it; runs stop after 3 seconds.
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { buildDocument, RUN_LIMIT_MS, type OutLine } from "./runner"

type Status = "idle" | "running" | "done" | "timeout"

const LINE_CLS: Record<OutLine["kind"], string> = {
  log: "text-[#e8efed]",
  info: "text-[#bfe0d8]",
  warn: "text-[#f2cf8a]",
  error: "text-[#ffb4a8]",
  system: "text-[#9fb3ae] italic",
}

export default function TryIt({ initialCode, snippetName }: { initialCode: string; snippetName?: string }) {
  const fieldId = useId()
  const [code, setCode] = useState(initialCode)
  const [lines, setLines] = useState<OutLine[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [ms, setMs] = useState<number | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const run = useRef<{ id: string; frame: HTMLIFrameElement; timer: ReturnType<typeof setTimeout>; started: number } | null>(null)

  // Picking another snippet above refills the editor.
  useEffect(() => setCode(initialCode), [initialCode])

  const stop = useCallback((end: Status) => {
    const r = run.current
    if (!r) return
    clearTimeout(r.timer)
    r.frame.remove()
    run.current = null
    setMs(Math.round(performance.now() - r.started))
    setStatus(end)
    if (end === "timeout") setLines((l) => [...l, { kind: "system", text: `Stopped after ${RUN_LIMIT_MS / 1000} seconds. Something was still running or waiting (an interval, a long timer, or a loop).` }])
  }, [])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const r = run.current
      const data = e.data as { jsRun?: string; kind?: string; text?: string }
      if (!r || e.source !== r.frame.contentWindow || data?.jsRun !== r.id) return
      if (data.kind === "end") stop("done")
      else if (data.kind && typeof data.text === "string") {
        const kind = (["log", "info", "warn", "error"].includes(data.kind) ? data.kind : "log") as OutLine["kind"]
        setLines((l) => (l.length > 500 ? l : [...l, { kind, text: data.text!.slice(0, 2000) }]))
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      const r = run.current
      if (r) {
        clearTimeout(r.timer)
        r.frame.remove()
      }
    }
  }, [stop])

  const start = () => {
    if (run.current) stop("done")
    const id = Math.random().toString(36).slice(2)
    const frame = document.createElement("iframe")
    frame.setAttribute("sandbox", "allow-scripts")
    frame.setAttribute("aria-hidden", "true")
    frame.tabIndex = -1
    frame.title = "Code runner"
    frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden"
    frame.srcdoc = buildDocument(code, id)
    setLines([])
    setMs(null)
    setStatus("running")
    run.current = { id, frame, timer: setTimeout(() => stop("timeout"), RUN_LIMIT_MS), started: performance.now() }
    host.current?.appendChild(frame)
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={fieldId} className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">
            Your code
          </label>
          <button onClick={() => setCode(initialCode)} className="text-xs font-semibold text-[#4f5d5a] underline-offset-2 hover:text-[#3d6b63] hover:underline">
            {snippetName ? <>Reset to “{snippetName}”</> : "Reset"}
          </button>
        </div>
        <textarea
          id={fieldId}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              start()
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          rows={snippetName ? 12 : Math.min(14, Math.max(5, initialCode.split("\n").length + 1))}
          className="mt-1.5 block w-full resize-y rounded-xl border border-[#d9dfdc] bg-white p-3 font-mono text-[13px] leading-[1.6] text-[#1f2a28] focus:border-[#3d6b63] focus:outline-none focus:ring-2 focus:ring-[#3d6b63]/25"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            onClick={start}
            className="flex h-10 items-center gap-1.5 rounded-full bg-[#3d6b63] px-5 text-sm font-semibold text-white hover:bg-[#2f564f]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 1.8v10.4a.6.6 0 0 0 .9.5l8.4-5.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5z" fill="currentColor" />
            </svg>
            {status === "running" ? "Run again" : "Run"}
          </button>
          <span className="text-xs text-[#5d6b68]">
            <kbd className="rounded border border-[#d9dfdc] bg-white px-1 font-sans">⌘/Ctrl</kbd> + <kbd className="rounded border border-[#d9dfdc] bg-white px-1 font-sans">Enter</kbd>
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#3d6b63]">Output</span>
          <span className="text-xs text-[#5d6b68]" aria-live="polite">
            {status === "running"
              ? "Running…"
              : status === "done"
                ? `Finished${ms !== null ? ` in ${ms} ms` : ""}`
                : status === "timeout"
                  ? "Timed out"
                  : "Not run yet"}
          </span>
        </div>
        <div ref={host} className="relative mt-1.5 min-h-[8rem] flex-1 overflow-auto rounded-xl bg-[#12201d] p-3 font-mono text-[13px] leading-[1.6]">
          {lines.length === 0 ? (
            <p className="text-[#7f9690]">{status === "running" ? "…" : status === "done" ? "(nothing was logged)" : "Press Run to see what your code prints, in order."}</p>
          ) : (
            <ol className="space-y-0.5" aria-label="Console output">
              {lines.map((l, i) => (
                <li key={i} className={`flex gap-2 whitespace-pre-wrap break-words ${LINE_CLS[l.kind]}`}>
                  <span className="select-none text-[#5d7a73]">{l.kind === "error" ? "✕" : l.kind === "system" ? "■" : "›"}</span>
                  <span className="min-w-0">{l.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#5d6b68]">
          Runs in this browser, in an isolated frame with no access to this page. console.log, info, warn and error are shown; code runs as a classic script, so use an async function for await.
        </p>
      </div>
    </div>
  )
}
