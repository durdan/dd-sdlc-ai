"use client"
// The panel that opens from a node on the path map: a side drawer on wide screens,
// a bottom sheet on phones. Esc, the close button or the backdrop close it; focus stays inside while it's open.
import { useEffect, useRef } from "react"
import Link from "next/link"
import { topicHref, type Topic } from "@/lib/paths/types"
import type { TopicState } from "./progress"
import { StateChip, Title, plain } from "./bits"
import { panelBullets } from "./lessonPanel"
import WalkthroughCard from "./WalkthroughCard"

type Props = {
  pathId: string
  topic: Topic
  stageTitle: string
  number: number
  total: number
  state: TopicState
  /** Prerequisites that are on this path, so the panel can jump to them. */
  requires: Topic[]
  next?: Topic
  onClose: () => void
  onToggleDone: () => void
  onNext: () => void
  onOpen: (id: string) => void
}

export default function TopicPanel({ pathId, topic, stageTitle, number, total, state, requires, next, onClose, onToggleDone, onNext, onOpen }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeBtn.current?.focus()
  }, [topic.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== "Tab" || !panel.current) return
      // Keep Tab inside the panel.
      const items = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const isDone = state === "done"

  return (
    <div className="jsp-layer fixed inset-0 z-50">
      <div className="jsp-backdrop absolute inset-0 bg-[#12201d]/35" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jsp-panel-title"
        className="jsp-panel absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl border-t border-[#d9dfdc] bg-[#f4f5f2] shadow-2xl lg:inset-x-auto lg:bottom-0 lg:right-0 lg:top-0 lg:max-h-none lg:w-[440px] lg:rounded-none lg:border-l lg:border-t-0"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[#c5cfcb] lg:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 lg:pt-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3d6b63]">
              {stageTitle} · Topic {number} of {total}
            </p>
            <h2 id="jsp-panel-title" className="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-[#1f2a28]">
              <Title text={topic.title} />
            </h2>
            <div className="mt-2">
              <StateChip state={state} />
            </div>
          </div>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9dfdc] bg-white text-lg leading-none text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <p className="text-[15px] leading-relaxed text-[#33413e]">
            <Title text={topic.lead || topic.summary} />
          </p>
          {topic.why ? (
            <div className="mt-4 rounded-xl border border-[#d9dfdc] bg-white p-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#3d6b63]">Why it matters</p>
              <p className="mt-1 text-sm leading-relaxed text-[#33413e]">{topic.why}</p>
            </div>
          ) : null}
          {requires.length ? (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#3d6b63]">Builds on</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {requires.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => onOpen(r.id)}
                      className="rounded-full border border-[#d9dfdc] bg-white px-3 py-1 text-[13px] font-semibold text-[#33413e] hover:border-[#3d6b63] hover:text-[#3d6b63]"
                    >
                      <Title text={r.title} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {topic.source === "library" && topic.walkthrough ? (
            <div className="mt-4">
              <WalkthroughCard w={topic.walkthrough} compact />
              <p className="mt-2 text-[13px] leading-relaxed text-[#5d6b68]">Opening the walkthrough doesn&apos;t mark it as done; come back and mark it when you&apos;ve been through it.</p>
            </div>
          ) : (
            <LessonCard topic={topic} href={topicHref(pathId, topic)} />
          )}
        </div>

        <div className="flex gap-2 border-t border-[#d9dfdc] bg-white/70 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onToggleDone}
            className={`shrink-0 ${
              isDone
                ? "rounded-full border border-[#d9dfdc] bg-white px-4 py-2 text-sm font-semibold text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
                : "rounded-full bg-[#3d6b63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f564f]"
            }`}
          >
            {isDone ? "Mark not done" : "Mark as done"}
          </button>
          {next ? (
            <button
              onClick={onNext}
              className="min-w-0 max-w-full truncate rounded-full border border-[#d9dfdc] bg-white px-4 py-2 text-sm font-semibold text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
              title={`Skip to next: ${plain(next.title)}`}
            >
              Skip to {plain(next.title)} →
            </button>
          ) : null}
        </div>
      </div>
      <style>{`
        .jsp-backdrop { animation: jsp-fade .2s ease-out both; }
        .jsp-panel { animation: jsp-up .28s cubic-bezier(.2,.8,.2,1) both; }
        @media (min-width: 1024px) { .jsp-panel { animation-name: jsp-left; } }
        @keyframes jsp-fade { from { opacity: 0; } }
        @keyframes jsp-up { from { transform: translateY(40px); opacity: 0; } }
        @keyframes jsp-left { from { transform: translateX(40px); opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .jsp-backdrop, .jsp-panel { animation: none; } }
      `}</style>
    </div>
  )
}

function LessonCard({ topic, href }: { topic: Topic; href: string }) {
  const { label, bullets } = panelBullets(topic)
  return (
    <div className="mt-4 rounded-xl bg-[#12201d] p-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8fc2b6]">{label}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-[#c9d6d2]">
        {bullets.map(([b, text]) => (
          <li key={b}>
            <b className="text-white">{b}</b> {text}
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-4 inline-flex rounded-full bg-[#8fc2b6] px-5 py-2 text-sm font-semibold text-[#12201d] hover:bg-[#a6d1c7]">
        {topic.lesson.type === "lanes" ? "Open the lesson" : "Open the topic"} →
      </Link>
    </div>
  )
}
