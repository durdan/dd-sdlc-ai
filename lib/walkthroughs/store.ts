// Walkthrough requests live in a private Vercel Blob store (Supabase is used
// for sign-in only). One folder per request:
//   requests/<id>/request.json   who asked, what, status (WalkthroughRequest)
//   requests/<id>/script.md      the narration script
//   requests/<id>/diagram.json   { diagram, svg }
//   requests/<id>/files/…        the finished walkthrough (scripts/deliver.ts in design-player)
//   users/<user id>/<id>         marker (holds the start time): a user's requests
// The script and the diagram are written by different requests running at the
// same time, so each has its own file and neither overwrites the other.
import { get, list, put } from "@vercel/blob"

export type RequestStatus = "draft" | "queued" | "in_production" | "ready" | "cancelled"

export interface WalkthroughRequest {
  id: string
  user_id: string
  email: string | null
  topic: string
  audience: string
  context: string
  revisions: number
  status: RequestStatus
  allow_feature: boolean
  notes: string | null
  created_at: string
  approved_at: string | null
  ready_at: string | null
}

export interface SavedDiagram {
  diagram: unknown
  svg: string
}

const dir = (id: string) => `requests/${id}`

async function read(path: string): Promise<Response | null> {
  const r = await get(path, { access: "private", useCache: false })
  return r?.statusCode === 200 ? new Response(r.stream, { headers: { "content-type": r.blob.contentType } }) : null
}

async function write(path: string, body: string, contentType: string) {
  await put(path, body, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true })
}

export async function loadRequest(id: string): Promise<WalkthroughRequest | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null
  return (await read(`${dir(id)}/request.json`))?.json() ?? null
}

export async function saveRequest(r: WalkthroughRequest) {
  await write(`${dir(r.id)}/request.json`, JSON.stringify(r), "application/json")
}

export async function createRequest(r: WalkthroughRequest) {
  await saveRequest(r)
  await write(`users/${r.user_id}/${r.id}`, r.created_at, "text/plain")
}

export const loadScript = async (id: string) => (await read(`${dir(id)}/script.md`))?.text() ?? null
export const saveScript = (id: string, text: string) => write(`${dir(id)}/script.md`, text, "text/markdown; charset=utf-8")
export const loadDiagram = async (id: string): Promise<SavedDiagram | null> => (await read(`${dir(id)}/diagram.json`))?.json() ?? null
export const saveDiagram = (id: string, d: SavedDiagram) => write(`${dir(id)}/diagram.json`, JSON.stringify(d), "application/json")

/** A user's requests, newest first; `since` counts only those started after it. */
export async function userRequestIds(userId: string, since?: Date) {
  const { blobs } = await list({ prefix: `users/${userId}/` })
  return blobs
    .filter((b) => !since || b.uploadedAt > since)
    .sort((a, b) => +b.uploadedAt - +a.uploadedAt)
    .map((b) => b.pathname.split("/").pop()!)
}

/** Every request (for the production queue). */
export async function allRequestIds() {
  const ids: string[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: "requests/", mode: "folded", cursor })
    ids.push(...page.folders.map((f) => f.replace(/^requests\//, "").replace(/\/$/, "")))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return ids
}

/** A finished walkthrough's file, answering Range requests so audio can seek (clips are small). */
export async function deliveredFile(id: string, path: string, range: string | null): Promise<Response | null> {
  const r = await get(`${dir(id)}/files/${path}`, { access: "private" })
  if (r?.statusCode !== 200) return null
  const headers = { "content-type": r.blob.contentType, "accept-ranges": "bytes", "cache-control": "private, max-age=3600" }
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!m) return new Response(r.stream, { headers: { ...headers, "content-length": String(r.blob.size) } })
  const all = new Uint8Array(await new Response(r.stream).arrayBuffer())
  const start = m[1] ? Number(m[1]) : Math.max(0, all.length - Number(m[2]))
  const end = m[1] && m[2] ? Math.min(Number(m[2]), all.length - 1) : all.length - 1
  if (start > end || start >= all.length) return new Response(null, { status: 416, headers: { "content-range": `bytes */${all.length}` } })
  return new Response(all.slice(start, end + 1), {
    status: 206,
    headers: { ...headers, "content-range": `bytes ${start}-${end}/${all.length}`, "content-length": String(end - start + 1) },
  })
}
