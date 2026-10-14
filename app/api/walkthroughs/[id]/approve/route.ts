// Approve the script and diagram: the request joins the production queue.
import { NextResponse } from "next/server"
import { z } from "zod/v4"
import { notifyOwner, ownedRequest } from "@/lib/walkthroughs/server"

const Body = z.object({ notes: z.string().trim().max(2000).optional() })

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  const { request: r, db } = found
  if (r.status !== "draft") return NextResponse.json({ ok: true, status: r.status })
  if (!r.script) return NextResponse.json({ error: "Wait for the script to finish." }, { status: 409 })
  const { notes } = Body.parse(await req.json().catch(() => ({})))

  const { error } = await db
    .from("walkthrough_requests")
    .update({ status: "queued", approved_at: new Date().toISOString(), notes: notes || null })
    .eq("id", r.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const origin = new URL(req.url).origin
  await notifyOwner(`New walkthrough request: “${r.topic}” from ${r.email ?? "a user"}. ${origin}/requests/${r.id}`)
  return NextResponse.json({ ok: true, status: "queued" })
}
