// One request, for its owner (or an admin).
import { NextResponse } from "next/server"
import { ownedRequest } from "@/lib/walkthroughs/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  return NextResponse.json({ request: found.request })
}
