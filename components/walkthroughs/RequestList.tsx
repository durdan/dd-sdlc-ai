"use client"
// The signed-in user's requests; admins can switch to the production queue.
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Shell } from "./RequestStudio"
import { button, card, STATUS_LABEL } from "./parts"

interface Row {
  id: string
  topic: string
  email: string | null
  status: string
  notes: string | null
  created_at: string
  approved_at: string | null
}

const day = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "")

export default function RequestList() {
  const { user, loading } = useAuth()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [admin, setAdmin] = useState(false)
  const [queue, setQueue] = useState(false)

  useEffect(() => {
    if (!user) return
    setRows(null)
    fetch(`/api/walkthroughs${queue ? "?all=1" : ""}`)
      .then((r) => r.json())
      .then((b) => {
        setRows(b.requests ?? [])
        setAdmin(!!b.admin)
      })
  }, [user, queue])

  if (loading) return <Shell />
  if (!user) {
    return (
      <Shell>
        <p className="text-center">
          <Link href="/signin?next=/requests" className={button}>
            Sign in to see your requests
          </Link>
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-bold">{queue ? "Production queue" : "My requests"}</h1>
          <div className="flex gap-2">
            {admin ? (
              <button className="text-sm font-semibold text-[#3d6b63] hover:underline" onClick={() => setQueue((q) => !q)}>
                {queue ? "My requests" : "Production queue"}
              </button>
            ) : null}
            <Link href="/request" className={button}>
              New request
            </Link>
          </div>
        </div>
        {!rows ? (
          <p className="text-[#6b7a76]">Loading…</p>
        ) : !rows.length ? (
          <div className={`${card} p-8 text-center text-[#4f5d5a]`}>Nothing yet.</div>
        ) : (
          <ul className={`${card} divide-y divide-[#e6ebe8]`}>
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.status === "draft" ? `/request?id=${r.id}` : `/requests/${r.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f7f9f8]"
                >
                  <span className="min-w-0">
                    <b className="block truncate">{r.topic}</b>
                    <small className="text-[#6b7a76]">
                      {queue ? `${r.email ?? ""} · approved ${day(r.approved_at)}` : `Started ${day(r.created_at)}`}
                      {queue && r.notes ? ` · “${r.notes}”` : ""}
                    </small>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "ready" ? "bg-[#3d6b63] text-white" : "bg-[#e6efec] text-[#3d6b63]"
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  )
}
