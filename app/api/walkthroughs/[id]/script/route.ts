// Stream the narration script as plain text, then save it. With feedback, the
// script is revised (at most MAX_REVISIONS times).
import { NextResponse } from "next/server"
import { loadScript, saveRequest, saveScript } from "@/lib/walkthroughs/store"
import { anthropic, Feedback, MAX_REVISIONS, ownedRequest, scriptRequest } from "@/lib/walkthroughs/server"

export const maxDuration = 300

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const found = await ownedRequest((await params).id)
  if (found.error) return found.error
  const r = found.request
  if (r.status !== "draft") return NextResponse.json({ error: "This request is already queued." }, { status: 409 })
  const { feedback } = Feedback.parse(await req.json().catch(() => ({})))
  if (feedback && r.revisions >= MAX_REVISIONS) {
    return NextResponse.json({ error: `Up to ${MAX_REVISIONS} rounds of changes; approve this one and add notes.` }, { status: 429 })
  }
  const previous = await loadScript(r.id)
  if (!feedback && previous) return new Response(previous, { headers: { "content-type": "text/plain; charset=utf-8" } })

  const stream = anthropic().messages.stream(scriptRequest(r, previous, feedback), { signal: req.signal })
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = ""
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            text += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        await saveScript(r.id, text)
        if (feedback) await saveRequest({ ...r, revisions: r.revisions + 1 })
        controller.close()
      } catch (e) {
        console.error("walkthrough script failed", e)
        controller.error(e)
      }
    },
    cancel() {
      stream.abort()
    },
  })
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } })
}
