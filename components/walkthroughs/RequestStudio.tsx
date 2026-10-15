"use client"
// Your system, explained: describe the system, watch the script stream in while
// the system diagram is drawn beside it, ask for changes or approve. Approved
// requests join the queue and are produced by hand.
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import SiteHeader from "@/components/learn/SiteHeader"
import HowItWorks from "./HowItWorks"
import { button, card, DiagramView, field, ghost, ScriptView } from "./parts"

const MAX_REVISIONS = 3

type Diagram = { svg?: string; error?: string }

export default function RequestStudio() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [id, setId] = useState<string | null>(params.get("id"))
  const [form, setForm] = useState({ topic: "", audience: "", context: "", allowFeature: false })
  const [script, setScript] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [diagram, setDiagram] = useState<Diagram>({})
  const [drawing, setDrawing] = useState(false)
  const [revisions, setRevisions] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [changing, setChanging] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const abort = useRef<AbortController | null>(null)

  const streamScript = useCallback(async (rid: string, fb?: string) => {
    abort.current?.abort()
    const ctl = (abort.current = new AbortController())
    setStreaming(true)
    setScript("")
    try {
      const res = await fetch(`/api/walkthroughs/${rid}/script`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ feedback: fb }),
        signal: ctl.signal,
      })
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? "The script could not be written.")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setScript(text)
      }
      if (fb) setRevisions((n) => n + 1)
    } catch (e) {
      if (!ctl.signal.aborted) setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (abort.current === ctl) setStreaming(false)
    }
  }, [])

  const drawDiagram = useCallback(async (rid: string, fb?: string) => {
    setDrawing(true)
    setDiagram({})
    try {
      const res = await fetch(`/api/walkthroughs/${rid}/diagram`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ feedback: fb }),
      })
      const body = await res.json()
      setDiagram(res.ok ? { svg: body.svg } : { error: body.error ?? "Could not draw the diagram." })
    } catch {
      setDiagram({ error: "Could not draw the diagram." })
    } finally {
      setDrawing(false)
    }
  }, [])

  /** Both at once: the diagram is usually ready while the script is still streaming. */
  const generate = useCallback(
    (rid: string, fb?: string) => {
      setError("")
      void streamScript(rid, fb)
      void drawDiagram(rid, fb)
    },
    [streamScript, drawDiagram],
  )

  // Coming back to a draft (?id=…): show what was saved, or carry on generating.
  useEffect(() => {
    if (!user || !id || script || streaming) return
    let live = true
    fetch(`/api/walkthroughs/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ request: r }) => {
        if (!live) return
        if (r.status !== "draft") return router.replace(`/requests/${id}`)
        setForm({ topic: r.topic, audience: r.audience ?? "", context: r.context ?? "", allowFeature: r.allow_feature })
        setRevisions(r.revisions)
        if (r.script) setScript(r.script)
        else void streamScript(id)
        if (r.diagram?.svg) setDiagram({ svg: r.diagram.svg })
        else void drawDiagram(id)
      })
      .catch(() => live && setId(null))
    return () => {
      live = false
    }
    // Only when the user or the request changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  useEffect(() => () => abort.current?.abort(), [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/walkthroughs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      setId(body.id)
      setScript("")
      history.replaceState(null, "", `/request?id=${body.id}`)
      generate(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const requestChanges = () => {
    if (!id || !feedback.trim()) return
    generate(id, feedback.trim())
    setFeedback("")
    setChanging(false)
  }

  const approve = async () => {
    if (!id) return
    setBusy(true)
    try {
      const res = await fetch(`/api/walkthroughs/${id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      router.push(`/requests/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  if (loading) return <Shell />

  if (!user) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl space-y-6">
          <Intro />
          <HowItWorks />
          <Link href="/signin?next=/request" className={`${button} inline-block`}>
            Sign in to start
          </Link>
        </div>
      </Shell>
    )
  }

  if (!id) {
    return (
      <Shell>
        <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
          <Intro />
          <HowItWorks />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">What system?</span>
            <input
              className={field}
              required
              minLength={3}
              maxLength={200}
              placeholder="e.g. A food delivery app's order and dispatch system"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Who is it for?</span>
            <input
              className={field}
              maxLength={200}
              placeholder="e.g. New backend engineers on my team"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">
              Context <span className="font-normal text-[#6b7a76]">(optional)</span>
            </span>
            <textarea
              className={`${field} min-h-[140px]`}
              maxLength={4000}
              placeholder="Components, scale, constraints, what you want explained. Don't include secrets."
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-[#4f5d5a]">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.allowFeature}
              onChange={(e) => setForm({ ...form, allowFeature: e.target.checked })}
            />
            You may feature the finished walkthrough in the public library.
          </label>
          {error ? <p className="text-sm text-[#b4443a]">{error}</p> : null}
          <button className={button} disabled={busy || form.topic.trim().length < 3}>
            {busy ? "Starting…" : "Draft the script and diagram"}
          </button>
        </form>
      </Shell>
    )
  }

  const working = streaming || drawing
  return (
    <Shell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3d6b63]">Draft</span>
          <h1 className="text-2xl font-bold leading-tight">{form.topic || "Your walkthrough"}</h1>
        </div>
        <Link href="/requests" className="text-sm font-semibold text-[#3d6b63] hover:underline">
          My requests
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className={`${card} order-2 p-5 lg:order-1`}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6b7a76]">Script</h2>
          <ScriptView text={script} streaming={streaming} />
        </section>
        <section className={`${card} order-1 self-start p-4 lg:sticky lg:top-20 lg:order-2`}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#6b7a76]">System diagram</h2>
          <DiagramView svg={diagram.svg} error={diagram.error} onRetry={() => id && drawDiagram(id)} />
        </section>
      </div>

      {error ? <p className="mt-4 text-sm text-[#b4443a]">{error}</p> : null}

      <div className={`${card} mt-5 p-5`}>
        {changing ? (
          <div className="space-y-3">
            <textarea
              className={`${field} min-h-[100px]`}
              maxLength={2000}
              autoFocus
              placeholder="What should change? e.g. We use Kafka, not SQS; focus more on payments."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className={button} onClick={requestChanges} disabled={!feedback.trim()}>
                Redraft
              </button>
              <button className={ghost} onClick={() => setChanging(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className="mb-1 block text-sm font-semibold">
                Anything else to include <span className="font-normal text-[#6b7a76]">(optional)</span>
              </span>
              <input
                className={field}
                maxLength={2000}
                placeholder="e.g. Focus on the payment flow"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={ghost}
                onClick={() => setChanging(true)}
                disabled={working || revisions >= MAX_REVISIONS}
                title={revisions >= MAX_REVISIONS ? "No more rounds of changes; add notes instead." : undefined}
              >
                Request changes{revisions ? ` (${MAX_REVISIONS - revisions} left)` : ""}
              </button>
              <button className={button} onClick={approve} disabled={working || busy || !script}>
                Approve and queue
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

function Intro() {
  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight">Your system, explained</h1>
      <p className="mt-2 text-[#4f5d5a]">
        The library explains how Uber, Netflix and Stripe are built, and which design patterns they use. Get the same for a system you build or
        run: a step-by-step walkthrough of how it works and why it is designed that way, for your team, new joiners or stakeholders.
      </p>
    </div>
  )
}

export function Shell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#1f2a28]">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5">{children}</main>
    </div>
  )
}
