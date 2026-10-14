// One request with its script and diagram, for its owner (or an admin).
import { NextResponse } from "next/server"
import { loadDiagram, loadScript } from "@/lib/walkthroughs/store"
import { ownedRequest } from "@/lib/walkthroughs/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  const [script, diagram] = await Promise.all([loadScript(found.request.id), loadDiagram(found.request.id)])
  return NextResponse.json({ request: { ...found.request, script, diagram } })
}
