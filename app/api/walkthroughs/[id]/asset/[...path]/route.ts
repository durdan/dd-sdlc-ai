// A finished walkthrough's files (walkthrough.json, layout.json, audio/…) live
// in the private "walkthroughs" bucket. The owner gets a short-lived signed URL.
import { NextResponse } from "next/server"
import { ownedRequest } from "@/lib/walkthroughs/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path } = await params
  const found = await ownedRequest(id)
  if (found.error) return found.error
  if (found.request.status !== "ready") return NextResponse.json({ error: "Not ready yet." }, { status: 404 })
  if (path.some((p) => p === ".." || p.includes("/"))) return NextResponse.json({ error: "Bad path." }, { status: 400 })

  const { data, error } = await found.db.storage.from("walkthroughs").createSignedUrl(`${id}/${path.join("/")}`, 3600)
  if (error || !data) return NextResponse.json({ error: "Not found." }, { status: 404 })
  return NextResponse.redirect(data.signedUrl, { status: 302, headers: { "cache-control": "private, max-age=600" } })
}
