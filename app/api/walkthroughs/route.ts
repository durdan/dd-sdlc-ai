// Start a walkthrough request (a draft), or list the signed-in user's requests.
import { NextResponse } from "next/server"
import { allRequestIds, createRequest, loadRequest, userRequestIds } from "@/lib/walkthroughs/store"
import { currentUser, DAILY_DRAFTS, isAdmin, RequestInput } from "@/lib/walkthroughs/server"

export async function GET(req: Request) {
  const who = await currentUser()
  if (who.error) return who.error
  const admin = isAdmin(who.user.email)
  // ?all=1 is the production queue, for admins: everything approved, oldest first.
  const all = new URL(req.url).searchParams.get("all") === "1" && admin
  const ids = all ? await allRequestIds() : await userRequestIds(who.user.id)
  const rows = (await Promise.all(ids.map(loadRequest))).filter((r) => r !== null)
  const requests = all
    ? rows.filter((r) => r.status !== "draft").sort((a, b) => (a.approved_at ?? "").localeCompare(b.approved_at ?? ""))
    : rows.filter((r) => r.status !== "cancelled").sort((a, b) => b.created_at.localeCompare(a.created_at))
  return NextResponse.json({ requests, admin })
}

export async function POST(req: Request) {
  const who = await currentUser()
  if (who.error) return who.error
  const input = RequestInput.safeParse(await req.json().catch(() => ({})))
  if (!input.success) return NextResponse.json({ error: "Describe the system in a few words (3 to 200 characters)." }, { status: 400 })

  const today = await userRequestIds(who.user.id, new Date(Date.now() - 24 * 3600_000))
  if (today.length >= DAILY_DRAFTS) {
    return NextResponse.json({ error: `You can start ${DAILY_DRAFTS} requests a day. Try again tomorrow.` }, { status: 429 })
  }

  const { topic, audience, context, allowFeature } = input.data
  const id = crypto.randomUUID()
  await createRequest({
    id,
    user_id: who.user.id,
    email: who.user.email ?? null,
    topic,
    audience,
    context,
    revisions: 0,
    status: "draft",
    allow_feature: allowFeature,
    notes: null,
    created_at: new Date().toISOString(),
    approved_at: null,
    ready_at: null,
  })
  return NextResponse.json({ id })
}
