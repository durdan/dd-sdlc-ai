"use client"
// A topic page: intro band, the lesson (from the registry in lessons.tsx), the explanation
// (Markdown rendered on the server and passed in as `body`), the quiz, any notes after it, links
// and path navigation.
// Opening the page starts the topic; getting every quiz answer right, or the button at the end, finishes it.
import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import SiteHeader from "@/components/learn/SiteHeader"
import type { Topic } from "@/lib/paths/types"
import { StateChip, Title, plain } from "./bits"
import { lessonParts } from "./lessons"
import { useProgress } from "./progress"
import Quiz from "./Quiz"
import Section from "./Section"

type Props = {
  pathId: string
  pathTitle: string
  stageTitle: string
  number: number
  total: number
  topic: Topic
  next?: { id: string; title: string }
  shared: string[]
  body: ReactNode
  /** Lesson "lanes": the Markdown after the trace blocks, rendered on the server. */
  notes?: ReactNode
}

export default function TopicView({ pathId, pathTitle, stageTitle, number, total, topic, next, shared, body, notes }: Props) {
  const ids = [topic.id]
  const [sharedMap] = useState(() => ({ [topic.id]: shared }))
  const { stateOf, set, start } = useProgress(pathId, ids, sharedMap)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    start(topic.id)
    setReady(true)
  }, [start, topic.id])
  const finish = useCallback(() => set(topic.id, "done"), [set, topic.id])

  const parts = lessonParts(topic)
  const hasBody = topic.body.trim().length > 0
  let n = 1
  const readN = hasBody ? n++ : 0
  const lessonStart = n
  n += parts.count
  const quizN = topic.quiz.length ? n++ : 0
  const state = stateOf(topic.id)
  const short = pathTitle.split(":")[0]
  const count = topic.quiz.length

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#1f2a28]">
      <SiteHeader />
      <section className="bg-[#12201d] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-5 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fc2b6]">
            <Link href={`/learn/paths/${pathId}`} className="hover:text-white">
              {short} path
            </Link>{" "}
            · {stageTitle} · Topic {number} of {total}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-[42px]">
              <Title text={topic.title} />
            </h1>
            <span className={`transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}>
              <StateChip state={state} />
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[#c9d6d2] sm:text-base">
            <Title text={topic.lead} />
          </p>
          {topic.why ? (
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#c9d6d2]">
              <b className="font-semibold text-[#8fc2b6]">Why it matters:</b> {topic.why}
            </p>
          ) : null}
          {topic.points.length ? <Points points={topic.points} /> : null}
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] space-y-12 px-4 pb-16 pt-8 sm:px-5">
        {readN ? (
          <Section n={readN} id="read" title="How it works" sub="The explanation, with examples you can run.">
            <div className="max-w-3xl">{body}</div>
          </Section>
        ) : null}

        {parts.sections(lessonStart)}

        {quizN ? (
          <Section
            n={quizN}
            id="check"
            title="Check yourself"
            sub={count === 1 ? "One question. Get it right to finish this topic." : `${count} questions. Get them all right to finish this topic.`}
          >
            <Quiz questions={topic.quiz} onAllCorrect={finish} hint={topic.quizHint} />
          </Section>
        ) : null}

        {notes && topic.notes ? <section className="rounded-2xl border border-[#d9dfdc] bg-white p-5">{notes}</section> : null}

        {topic.links.length ? (
          <section aria-labelledby="links-h">
            <h2 id="links-h" className="text-base font-bold text-[#1f2a28]">
              Go deeper
            </h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topic.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col rounded-xl border border-[#d9dfdc] bg-white px-3.5 py-2.5 hover:border-[#3d6b63]"
                  >
                    <span className="text-sm font-semibold text-[#1f2a28] group-hover:text-[#3d6b63]">{l.title} ↗</span>
                    <span className="mt-0.5 truncate text-xs text-[#5d6b68]">{new URL(l.url).host}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d9dfdc] pt-6" aria-label="Path navigation">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/learn/paths/${pathId}`}
              className="rounded-full border border-[#d9dfdc] bg-white px-4 py-2 text-sm font-semibold text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
            >
              ← Back to the map
            </Link>
            <button
              onClick={() => set(topic.id, state === "done" ? "progress" : "done")}
              className={
                state === "done"
                  ? "rounded-full border border-[#d9dfdc] bg-white px-4 py-2 text-sm font-semibold text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
                  : "rounded-full bg-[#3d6b63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f564f]"
              }
            >
              {state === "done" ? "Mark not done" : "Mark as done"}
            </button>
          </div>
          {next ? (
            <Link href={`/learn/paths/${pathId}/${next.id}`} className="text-right text-sm text-[#4f5d5a] hover:text-[#3d6b63]">
              Next on the path: <b className="text-[#1f2a28]">{plain(next.title)}</b> →
            </Link>
          ) : (
            <Link href={`/learn/paths/${pathId}`} className="text-right text-sm text-[#4f5d5a] hover:text-[#3d6b63]">
              Last topic on this path. <b className="text-[#1f2a28]">See the whole map</b> →
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}

/** The front matter's `points`: up to four numbered key ideas in the dark intro band. */
function Points({ points }: { points: Topic["points"] }) {
  return (
    <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {points.map((p, i) => (
        <li key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
          <p className="text-sm font-bold text-white">
            <span className="mr-1.5 text-[#8fc2b6]">{i + 1}</span>
            {p.title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#c9d6d2]">{p.text}</p>
        </li>
      ))}
    </ol>
  )
}
