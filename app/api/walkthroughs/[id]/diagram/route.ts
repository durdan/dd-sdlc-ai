// Draw the system diagram while the script streams: structured output from
// the model, laid out with ELK and rendered to SVG by the design-player library.
import { NextResponse } from "next/server"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { renderSvg } from "design-player/core"
import { layoutDiagram } from "design-player/layout"
import { loadDiagram, saveDiagram } from "@/lib/walkthroughs/store"
import { anthropic, DiagramOutput, diagramRequest, Feedback, ownedRequest, toDiagram } from "@/lib/walkthroughs/server"

export const maxDuration = 120

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  const r = found.request
  if (r.status !== "draft") return NextResponse.json({ error: "This request is already queued." }, { status: 409 })
  const { feedback } = Feedback.parse(await req.json().catch(() => ({})))
  if (!feedback) {
    const saved = await loadDiagram(r.id)
    if (saved) return NextResponse.json(saved)
  }

  try {
    const message = await anthropic().messages.parse(
      { ...diagramRequest(r, feedback), output_config: { effort: "low", format: zodOutputFormat(DiagramOutput) } },
      { signal: req.signal },
    )
    if (!message.parsed_output) throw new Error(`no diagram (stop reason ${message.stop_reason})`)
    const diagram = toDiagram(message.parsed_output)
    const saved = { diagram, svg: renderSvg(diagram, await layoutDiagram(diagram)) }
    await saveDiagram(r.id, saved)
    return NextResponse.json(saved)
  } catch (e) {
    console.error("walkthrough diagram failed", e)
    return NextResponse.json({ error: "Could not draw the diagram this time." }, { status: 502 })
  }
}
