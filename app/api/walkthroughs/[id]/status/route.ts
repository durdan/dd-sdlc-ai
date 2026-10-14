// Admins move a request along the queue (ready is set by the deliver script, which uploads the files).
import { NextResponse } from "next/server"
import { z } from "zod/v4"
import { saveRequest } from "@/lib/walkthroughs/store"
import { isAdmin, ownedRequest } from "@/lib/walkthroughs/server"

const Body = z.object({ status: z.enum(["queued", "in_production", "cancelled"]) })

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  if (!isAdmin(found.user.email)) return NextResponse.json({ error: "Not allowed." }, { status: 403 })
  const body = Body.safeParse(await req.json().catch(() => ({})))
  if (!body.success) return NextResponse.json({ error: "Bad status." }, { status: 400 })
  await saveRequest({ ...found.request, status: body.data.status })
  return NextResponse.json({ ok: true })
}
