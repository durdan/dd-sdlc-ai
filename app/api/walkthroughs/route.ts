// Start a walkthrough request (a draft), or list the signed-in user's requests.
import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { currentUser, DAILY_DRAFTS, isAdmin, RequestInput } from "@/lib/walkthroughs/server"

export async function GET(req: Request) {
  const who = await currentUser()
  if (who.error) return who.error
  // ?all=1 is the production queue, for admins: everything approved, oldest first.
  const all = new URL(req.url).searchParams.get("all") === "1" && isAdmin(who.user.email)
  let q = createServiceClient().from("walkthrough_requests").select("id, topic, email, status, notes, created_at, approved_at, ready_at")
  q = all
    ? q.neq("status", "draft").order("approved_at", { ascending: true })
    : q.eq("user_id", who.user.id).neq("status", "cancelled").order("created_at", { ascending: false })
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ requests: data, admin: isAdmin(who.user.email) })
}

export async function POST(req: Request) {
  const who = await currentUser()
  if (who.error) return who.error
  const input = RequestInput.safeParse(await req.json().catch(() => ({})))
  if (!input.success) return NextResponse.json({ error: "Describe the system in a few words (3 to 200 characters)." }, { status: 400 })

  const db = createServiceClient()
  const since = new Date(Date.now() - 24 * 3600_000).toISOString()
  const { count } = await db
    .from("walkthrough_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", who.user.id)
    .gte("created_at", since)
  if ((count ?? 0) >= DAILY_DRAFTS) {
    return NextResponse.json({ error: `You can start ${DAILY_DRAFTS} requests a day. Try again tomorrow.` }, { status: 429 })
  }

  const { topic, audience, context, allowFeature } = input.data
  const { data, error } = await db
    .from("walkthrough_requests")
    .insert({ user_id: who.user.id, email: who.user.email, topic, audience, context, allow_feature: allowFeature })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
