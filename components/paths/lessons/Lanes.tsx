"use client"
// The "lanes" lesson: the topic's ```trace lanes``` blocks as selectable snippets in one
// visualiser, then a Try it editor holding the chosen snippet (for code that runs in a browser).
import { useState } from "react"
import type { Trace } from "@/lib/paths/types"
import Code from "../Code"
import LanesVisualiser from "../LanesVisualiser"
import Section from "../Section"
import TryIt from "../TryIt"

/** How many numbered sections the lesson adds: "Watch it run", plus "Try it" if any snippet runs in a browser. */
export const lanesSectionCount = (traces: Trace[]) => (traces.some((t) => t.run !== "node") ? 2 : 1)

export function LanesSections({ traces, start }: { traces: Trace[]; start: number }) {
  const [i, setI] = useState(0)
  const trace = traces[i]
  const many = traces.length > 1
  return (
    <>
      <Section
        n={start}
        id="watch"
        title="Watch it run"
        sub={`${many ? "Pick a snippet, then play it" : "Play it"} or step through. Every step says what just happened.`}
      >
        <LanesVisualiser traces={traces} index={i} onSelect={setI} />
      </Section>
      {lanesSectionCount(traces) > 1 ? (
        <Section n={start + 1} id="try" title="Try it yourself" sub="Change the code, predict the order, then run it for real in your browser.">
          {trace.run !== "node" ? (
            <TryIt initialCode={trace.code} snippetName={trace.title} />
          ) : (
            <div className="space-y-3">
              <p className="text-[14px] leading-relaxed text-[#33413e]">
                This snippet uses Node-only APIs, so it can&apos;t run in the browser. Save it as <code className="font-mono">snippet.{trace.module === "esm" ? "mjs" : "cjs"}</code> and run{" "}
                <code className="font-mono">node snippet.{trace.module === "esm" ? "mjs" : "cjs"}</code>.
              </p>
              <Code code={trace.code} label={`${trace.title} (Node)`} wrap />
            </div>
          )}
        </Section>
      ) : null}
    </>
  )
}
