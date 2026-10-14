// A finished walkthrough's files (walkthrough.json, layout.json, audio/…),
// streamed from the private Blob store to the request's owner.
import { NextResponse } from "next/server"
import { deliveredFile } from "@/lib/walkthroughs/store"
import { ownedRequest } from "@/lib/walkthroughs/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path } = await params
  const found = await ownedRequest(id)
  if (found.error) return found.error
  if (found.request.status !== "ready") return NextResponse.json({ error: "Not ready yet." }, { status: 404 })
  if (path.some((p) => p === ".." || p === "." || p.includes("/"))) return NextResponse.json({ error: "Bad path." }, { status: 400 })
  const res = await deliveredFile(id, path.join("/"), req.headers.get("range"))
  return res ?? NextResponse.json({ error: "Not found." }, { status: 404 })
}
