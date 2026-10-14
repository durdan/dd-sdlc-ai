// Server-side access to the learning library exported into public/learn by
// design-player's sync tool (catalogue, walkthroughs, layouts, manifests).
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { Catalog, DiagramLayout, Manifest, Walkthrough } from "design-player/core"

const ROOT = join(process.cwd(), "public", "learn")

async function json<T>(file: string, fallback?: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(ROOT, file), "utf8")) as T
  } catch (e) {
    if (fallback !== undefined) return fallback
    throw e
  }
}

export const getCatalog = () => json<Catalog>("catalog.json")

export async function getTopic(id: string) {
  const catalog = await getCatalog()
  const meta = catalog.topics.find((t) => t.id === id)
  if (!meta) return null
  const [walkthrough, layouts, manifest] = await Promise.all([
    json<Walkthrough>(`walkthroughs/${id}.json`),
    json<Record<string, DiagramLayout>>(`walkthroughs/${id}.layout.json`),
    json<Manifest>(`audio/${id}/manifest.json`, {}),
  ])
  return { catalog, meta, walkthrough, layouts, manifest }
}

export const KIND_PREFIX = { pattern: "p", company: "c" } as const
