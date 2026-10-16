"use client"
// Saved (bookmarked) paths, kept in localStorage under sdlc.paths.saved.v1 as a JSON list of
// path ids. Like progress.ts it needs no account, and every component sees the same list,
// across tabs too.
import { useCallback, useSyncExternalStore } from "react"

export const SAVED_KEY = "sdlc.paths.saved.v1"
const listeners = new Set<() => void>()
let cache: { raw: string | null; ids: string[] } = { raw: null, ids: [] }
const EMPTY: string[] = []

function read(): string[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(SAVED_KEY)
  } catch {
    return EMPTY
  }
  if (raw === cache.raw) return cache.ids
  let ids: string[] = []
  try {
    const v = raw ? JSON.parse(raw) : []
    if (Array.isArray(v)) ids = v.filter((x): x is string => typeof x === "string")
  } catch {
    ids = []
  }
  cache = { raw, ids }
  return ids
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => (e.key === null || e.key === SAVED_KEY) && listener()
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** The saved path ids (empty while rendering on the server and hydrating) and a toggle. */
export function useSavedPaths() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY)
  const toggle = useCallback((pathId: string) => {
    const now = read()
    const next = now.includes(pathId) ? now.filter((x) => x !== pathId) : [...now, pathId]
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    } catch {
      // Private mode or storage full: the bookmark just isn't remembered.
    }
    listeners.forEach((l) => l())
  }, [])
  return { ids, toggle }
}
