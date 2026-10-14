"use client"
// Where a request stands: received, in production, ready. Once ready, the
// walkthrough plays here from the private bucket (through signed URLs).
import "@/components/learn/setup"
import { useEffect, useState } from "react"
import Link from "next/link"
import { configure, type DiagramLayout, type Manifest, type Walkthrough } from "design-player/core"
import { Player } from "design-player/react"
import { useAuth } from "@/contexts/AuthContext"
import { Shell } from "./RequestStudio"
import { button, card, DiagramView, ghost, ScriptView, STATUS_LABEL } from "./parts"

interface Request {
  id: string
  topic: string
  status: string
  script: string | null
  diagram: { svg: string } | null
  created_at: string
  approved_at: string | null
  ready_at: string | null
}

interface Loaded {
  walkthrough: Walkthrough
  layouts: Record<string, DiagramLayout>
  manifest: Manifest
}

const STEPS = ["queued", "in_production", "ready"] as const
const when = (s: string | null) =>
  s ? new Date(s).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""

export default function RequestTracker({ id }: { id: string }) {
  const { user, loading } = useAuth()
  const [r, setR] = useState<Request | null | undefined>(undefined)
  const [admin, setAdmin] = useState(false)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [showScript, setShowScript] = useState(false)

  // Load, then check again every minute until it is ready.
  useEffect(() => {
    if (!user) return
    let live = true
    const load = () =>
      fetch(`/api/walkthroughs/${id}`)
        .then((res) => (res.ok ? res.json() : { request: null }))
        .then((b) => live && setR(b.request))
    void load()
    fetch("/api/walkthroughs")
      .then((res) => res.json())
      .then((b) => live && setAdmin(!!b.admin))
    const t = setInterval(() => document.visibilityState === "visible" && load(), 60_000)
    return () => {
      live = false
      clearInterval(t)
    }
  }, [user, id])

  // A ready walkthrough's files come through the asset route; narration too.
  useEffect(() => {
    if (r?.status !== "ready") return
    const base = `/api/walkthroughs/${id}/asset`
    configure({ audio: `${base}/audio` })
    let live = true
    Promise.all([
      fetch(`${base}/walkthrough.json`).then((x) => x.json()),
      fetch(`${base}/layout.json`).then((x) => x.json()),
    ])
      .then(async ([walkthrough, layouts]: [Walkthrough, Record<string, DiagramLayout>]) => {
        const manifest = await fetch(`${base}/audio/${walkthrough.id}/manifest.json`).then((x) => (x.ok ? x.json() : {}), () => ({}))
        if (live) setLoaded({ walkthrough, layouts, manifest })
      })
      .catch(() => live && setLoaded(null))
    return () => {
      live = false
      configure({ audio: process.env.NEXT_PUBLIC_LEARN_AUDIO_BASE || "/learn/audio" })
    }
  }, [r?.status, id])

  const setStatus = async (status: string) => {
    await fetch(`/api/walkthroughs/${id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    const b = await fetch(`/api/walkthroughs/${id}`).then((x) => x.json())
    setR(b.request)
  }

  if (loading || (user && r === undefined)) return <Shell />
  if (!user) {
    return (
      <Shell>
        <p className="text-center">
          <Link href={`/signin?next=/requests/${id}`} className={button}>
            Sign in to see this request
          </Link>
        </p>
      </Shell>
    )
  }
  if (!r) {
    return (
      <Shell>
        <p className="text-center text-[#4f5d5a]">
          Not found. <Link href="/requests" className="font-semibold text-[#3d6b63]">Your requests</Link>
        </p>
      </Shell>
    )
  }

  const at = STEPS.indexOf(r.status as (typeof STEPS)[number])
  const times: Record<string, string> = { queued: when(r.approved_at), ready: when(r.ready_at) }

  return (
    <Shell>
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/requests" className="text-sm font-semibold text-[#3d6b63] hover:underline">
              ← My requests
            </Link>
            <h1 className="mt-1 text-[28px] font-bold leading-tight">{r.topic}</h1>
          </div>
          {admin && r.status !== "ready" ? (
            <div className="flex gap-2">
              {r.status === "queued" ? (
                <button className={ghost} onClick={() => setStatus("in_production")}>
                  Start production
                </button>
              ) : null}
              {r.status !== "cancelled" ? (
                <button className={ghost} onClick={() => setStatus("cancelled")}>
                  Cancel
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {r.status === "cancelled" ? (
          <div className={`${card} p-5 text-[#4f5d5a]`}>This request was cancelled.</div>
        ) : (
          <ol className={`${card} grid gap-4 p-5 sm:grid-cols-3`}>
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i <= at ? "bg-[#3d6b63] text-white" : "border border-[#d9dfdc] text-[#9aa6a3]"
                  }`}
                >
                  {i < at || (s === "ready" && at === 2) ? "✓" : i + 1}
                </span>
                <span>
                  <b className={i <= at ? "" : "text-[#9aa6a3]"}>{STATUS_LABEL[s]}</b>
                  <small className="block text-[#6b7a76]">
                    {times[s] ||
                      (s === "queued" ? "" : s === "in_production" ? (i <= at ? "We are recording it" : "Usually within a day") : "We email you the link")}
                  </small>
                </span>
              </li>
            ))}
          </ol>
        )}

        {r.status === "ready" ? (
          loaded ? (
            <div className="overflow-hidden rounded-2xl border border-[#d9dfdc]">
              <Player walkthrough={loaded.walkthrough} layouts={loaded.layouts} manifest={loaded.manifest} />
            </div>
          ) : (
            <div className={`${card} p-8 text-center text-[#6b7a76]`}>Loading your walkthrough…</div>
          )
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <section className={`${card} p-5`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7a76]">Approved script</h2>
                <button className="text-sm font-semibold text-[#3d6b63]" onClick={() => setShowScript((v) => !v)}>
                  {showScript ? "Hide" : "Show"}
                </button>
              </div>
              {showScript ? <ScriptView text={r.script ?? ""} /> : <p className="text-sm text-[#6b7a76]">{wordCount(r.script)} words, {(r.script?.match(/^## /gm) ?? []).length} chapters.</p>}
            </section>
            <section className={`${card} self-start p-4`}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#6b7a76]">System diagram</h2>
              {r.diagram?.svg ? <DiagramView svg={r.diagram.svg} /> : <p className="text-sm text-[#6b7a76]">No diagram.</p>}
            </section>
          </div>
        )}
      </div>
    </Shell>
  )
}

const wordCount = (s: string | null) => (s ? s.split(/\s+/).filter(Boolean).length.toLocaleString() : 0)
