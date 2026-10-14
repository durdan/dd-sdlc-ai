// Admins move a request along the queue (ready is set by the deliver script, which uploads the files).
import { NextResponse } from "next/server"
import { z } from "zod/v4"
import { isAdmin, ownedRequest } from "@/lib/walkthroughs/server"

const Body = z.object({ status: z.enum(["queued", "in_production", "cancelled"]) })

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  if (!isAdmin(found.user.email)) return NextResponse.json({ error: "Not allowed." }, { status: 403 })
  const body = Body.safeParse(await req.json().catch(() => ({})))
  if (!body.success) return NextResponse.json({ error: "Bad status." }, { status: 400 })
  const { error } = await found.db.from("walkthrough_requests").update({ status: body.data.status }).eq("id", found.request.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
