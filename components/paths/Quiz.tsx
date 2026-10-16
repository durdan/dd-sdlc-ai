"use client"
// "Check yourself": a topic's questions (from its front matter) with instant feedback.
// Getting all of them right (retries allowed) marks the topic as done on the path map.
import { useEffect, useState } from "react"
import type { QuizItem } from "@/lib/paths/types"
import Code from "./Code"

const words = ["", "one", "two", "three", "four", "five", "six"]

export default function Quiz({ questions, onAllCorrect, hint }: { questions: QuizItem[]; onAllCorrect: () => void; hint?: string }) {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const right = questions.filter((q, i) => picked[i] === q.answer).length
  const allRight = right === questions.length

  useEffect(() => {
    if (allRight) onAllCorrect()
  }, [allRight, onAllCorrect])

  return (
    <div>
      <ol className={`grid gap-4 ${questions.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        {questions.map((q, qi) => {
          const choice = picked[qi]
          const answered = choice !== undefined
          const ok = choice === q.answer
          return (
            <li key={qi} className="flex min-w-0 flex-col rounded-2xl border border-[#d9dfdc] bg-white p-4">
              <fieldset className="flex flex-1 flex-col">
                <legend className="text-[15px] font-bold text-[#1f2a28]">
                  <span className="mr-1.5 text-[#3d6b63]">{qi + 1}.</span>
                  {q.q}
                </legend>
                {q.code ? (
                  <div className="mt-3">
                    <Code code={q.code.trimEnd()} label={`Code for question ${qi + 1}`} wrap />
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const mine = choice === oi
                    const cls = !mine
                      ? "border-[#d9dfdc] bg-white hover:border-[#3d6b63]"
                      : ok
                        ? "border-[#3d6b63] bg-[#e6efec] text-[#1f3a35]"
                        : "border-[#c4553f] bg-[#fbeae6] text-[#6e2416]"
                    return (
                      <button
                        key={opt}
                        aria-pressed={mine}
                        onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-[13.5px] transition-colors ${q.code ? "font-mono text-[13px]" : ""} ${cls}`}
                      >
                        {opt}
                        {mine ? <span className="font-sans text-xs font-bold">{ok ? "✓ Right" : "✕ Not quite"}</span> : null}
                      </button>
                    )
                  })}
                </div>
                <div aria-live="polite" className="mt-3 min-h-[1px]">
                  {answered ? (
                    <p className={`rounded-xl p-3 text-[13.5px] leading-relaxed ${ok ? "bg-[#e6efec] text-[#1f3a35]" : "bg-[#fbeae6] text-[#6e2416]"}`}>
                      {ok ? <b>Correct. </b> : <b>Try again. </b>}
                      {ok ? q.explain : (hint ?? "Have another look at the explanation above, then pick again.")}
                    </p>
                  ) : null}
                </div>
              </fieldset>
            </li>
          )
        })}
      </ol>
      <p
        className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${allRight ? "bg-[#12201d] text-white" : "border border-dashed border-[#b9c7c2] text-[#4f5d5a]"}`}
        aria-live="polite"
      >
        {allRight ? (
          <>
            <span className="text-[#8fc2b6]">{questions.length === 1 ? "Right." : `All ${words[questions.length] ?? questions.length} right.`}</span> This topic is marked as done on
            your path.
          </>
        ) : (
          `${right} of ${questions.length} right so far. Get ${questions.length === 1 ? "it" : `all ${words[questions.length] ?? questions.length}`} to finish this topic.`
        )}
      </p>
    </div>
  )
}
