"use client"
// Progress through learning paths, kept in localStorage so it needs no account. Each path has
// its own key, sdlc.path.<id>.v1, holding { topicId: "progress" | "done" } (the JavaScript
// path's key and format are unchanged from the first version, so old progress survives).
// A topic that is on several paths shares its state: reading takes the furthest state found
// under any of those paths, and writing updates all of them. Every component using these
// hooks sees the same state, across tabs too.
import { useCallback, useMemo, useSyncExternalStore } from "react"
import { progressKey } from "@/lib/paths/types"

export type TopicState = "todo" | "progress" | "done"
type Saved = Record<string, "progress" | "done">

const RANK: Record<TopicState, number> = { todo: 0, progress: 1, done: 2 }
const listeners = new Set<() => void>()
const parsed = new Map<string, { raw: string | null; value: Saved }>()

function rawOf(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function readKey(key: string): Saved {
  const raw = rawOf(key)
  const hit = parsed.get(key)
  if (hit && hit.raw === raw) return hit.value
  let value: Saved = {}
  try {
    const v = raw ? JSON.parse(raw) : null
    if (v && typeof v === "object" && !Array.isArray(v)) value = v as Saved
  } catch {
    value = {}
  }
  parsed.set(key, { raw, value })
  return value
}

function writeKey(key: string, next: Saved) {
  try {
    localStorage.setItem(key, JSON.stringify(next))
  } catch {
    // Private mode or storage full: progress just isn't remembered.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => (e.key === null || e.key.startsWith("sdlc.path.")) && listener()
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

const notify = () => listeners.forEach((l) => l())

/** The state of one topic, looking at every path that includes it. */
function stateIn(pathIds: string[], topicId: string): TopicState {
  let best: TopicState = "todo"
  for (const p of pathIds) {
    const s = readKey(progressKey(p))[topicId]
    if (s && RANK[s] > RANK[best]) best = s
  }
  return best
}

/**
 * Progress for one path. `shared` maps a topic id to the other paths that include it.
 * The snapshot is the raw text of every key involved, so React re-renders only when one changes.
 */
const NO_SHARED: Record<string, string[]> = {}

export function useProgress(pathId: string, topicIds: string[], shared: Record<string, string[]> = NO_SHARED) {
  const keys = useMemo(() => {
    const all = new Set([pathId, ...Object.values(shared).flat()])
    return [...all].map(progressKey)
  }, [pathId, shared])
  // Prefixed so that it is never "", which stands for "server render / hydrating: nothing read yet".
  const snapshot = useCallback(() => "c" + keys.map((k) => rawOf(k) ?? "").join("\u0000"), [keys])
  const version = useSyncExternalStore(subscribe, snapshot, () => "")

  const pathsOf = useCallback((id: string) => [pathId, ...(shared[id] ?? [])], [pathId, shared])
  const stateOf = useCallback(
    (id: string): TopicState => (version === "" ? "todo" : stateIn(pathsOf(id), id)),
    [pathsOf, version],
  )
  const set = useCallback(
    (id: string, state: TopicState) => {
      for (const p of pathsOf(id)) {
        const key = progressKey(p)
        const next = { ...readKey(key) }
        if (state === "todo") delete next[id]
        else next[id] = state
        writeKey(key, next)
      }
      notify()
    },
    [pathsOf],
  )
  /** Opening a topic counts as starting it; it never undoes "done". */
  const start = useCallback(
    (id: string) => {
      if (stateIn(pathsOf(id), id) === "todo") set(id, "progress")
    },
    [pathsOf, set],
  )
  const done = topicIds.filter((id) => stateOf(id) === "done").length
  return { stateOf, set, start, done, total: topicIds.length }
}
