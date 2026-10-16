"use client"
// The list on /learn/paths: a search box, a category sidebar (a chip row on phones) and the
// paths grouped by kind as compact cards with progress and a bookmark. The category lives in
// the URL (?category=<tag> or ?category=saved), so it can be shared and the back button works;
// the search is local to the page.
import { Suspense, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PATH_TAGS, TAG_LABEL, type PathKind, type PathTag } from "@/lib/paths/types"
import { useProgress } from "./progress"
import { useSavedPaths } from "./saved"

export type IndexItem = {
  id: string
  title: string
  promise: string
  kind: PathKind
  level?: string
  tags: PathTag[]
  topicIds: string[]
  /** Topic id → other paths that include it (progress is shared through these). */
  shared: Record<string, string[]>
  /** Lower-case title, promise and topic titles, for the search box. */
  haystack: string
}

type Category = PathTag | "saved" | null

const GROUPS: { kind: PathKind; title: string; blurb: string }[] = [
  { kind: "role", title: "Role paths", blurb: "What a role needs to know, in the order it needs it." },
  { kind: "skill", title: "Skill paths", blurb: "How a language, runtime or tool really works, one topic at a time." },
  { kind: "system-design", title: "System design paths", blurb: "Short routes through the library's pattern walkthroughs." },
]

const BASE = "/learn/paths"
const hrefFor = (c: Category) => (c ? `${BASE}?category=${c}` : BASE)

function parseCategory(raw: string | null): Category {
  if (raw === "saved") return "saved"
  return raw && (PATH_TAGS as readonly string[]).includes(raw) ? (raw as PathTag) : null
}

export default function PathsIndex({ items }: { items: IndexItem[] }) {
  // useSearchParams needs a Suspense boundary; the fallback (static HTML) shows every path.
  return (
    <Suspense fallback={<View items={items} category={null} />}>
      <WithParams items={items} />
    </Suspense>
  )
}

function WithParams({ items }: { items: IndexItem[] }) {
  const category = parseCategory(useSearchParams().get("category"))
  return <View items={items} category={category} />
}

function View({ items, category }: { items: IndexItem[]; category: Category }) {
  const [query, setQuery] = useState("")
  const q = useDeferredValue(query)
  const { ids: savedIds, toggle } = useSavedPaths()
  const saved = useMemo(() => new Set(savedIds), [savedIds])
  const searchId = useId()
  const chips = useRef<HTMLUListElement>(null)
  // On phones the categories are a sideways-scrolling row: keep the selected one in view.
  useEffect(() => {
    const ul = chips.current
    const a = ul?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return
    const left = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2
    ul.scrollTo({ left: Math.max(0, left), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [category])

  const categories = useMemo(
    () => PATH_TAGS.map((t) => ({ tag: t, count: items.filter((p) => p.tags.includes(t)).length })).filter((c) => c.count > 0),
    [items],
  )
  const savedCount = items.filter((p) => saved.has(p.id)).length

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const shown = items.filter(
    (p) =>
      (category === null || (category === "saved" ? saved.has(p.id) : p.tags.includes(category))) && words.every((w) => p.haystack.includes(w)),
  )
  const groups = GROUPS.map((g) => ({ ...g, paths: shown.filter((p) => p.kind === g.kind) })).filter((g) => g.paths.length)
  const heading = category === null ? "All paths" : category === "saved" ? "Saved" : TAG_LABEL[category]

  return (
    <>
      <section className="bg-[#12201d] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 sm:px-5 sm:py-8 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-xl">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">Learning paths</h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#c9d6d2]">
              A path is a map of topics in the order they build on each other, with examples to run and quick checks. Progress stays in this browser.
            </p>
          </div>
          <div className="w-full md:w-[340px]">
            <label htmlFor={searchId} className="sr-only">
              Search paths
            </label>
            <div className="relative">
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9fb3ae]" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search paths and topics"
                autoComplete="off"
                className="h-11 w-full rounded-full border border-white/15 bg-white/[0.07] pl-9 pr-4 text-[15px] text-white placeholder:text-[#9fb3ae] focus:border-[#8fc2b6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc2b6]/60"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-4 sm:px-5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:pt-8">
        <nav aria-label="Path categories" className="-mx-4 mb-5 sm:-mx-5 lg:mx-0 lg:mb-0">
          <div className="lg:sticky lg:top-[72px]">
            <p className="mb-2 hidden px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5d6b68] lg:block">Browse</p>
            <ul ref={chips} className="relative flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-5 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              <NavItem href={hrefFor(null)} label="All paths" count={items.length} active={category === null} />
              <NavItem href={hrefFor("saved")} label="Saved" count={savedCount} active={category === "saved"} saved />
              <li aria-hidden="true" className="hidden lg:my-2 lg:block lg:border-t lg:border-[#d9dfdc]" />
              {categories.map((c) => (
                <NavItem key={c.tag} href={hrefFor(c.tag)} label={TAG_LABEL[c.tag]} count={c.count} active={category === c.tag} />
              ))}
            </ul>
          </div>
        </nav>

        <main className="min-w-0">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 className="sr-only">{heading}</h2>
            <p className="text-sm text-[#4f5d5a]" aria-live="polite">
              {shown.length} {shown.length === 1 ? "path" : "paths"}
              {category !== null && <> in {heading}</>}
              {words.length > 0 && <> matching “{q.trim()}”</>}
            </p>
          </div>

          {groups.length === 0 && (
            <Empty
              message={
                category === "saved" && !words.length
                  ? "Nothing saved yet. Use the bookmark on a path to keep it here."
                  : words.length
                    ? "No path matches that search."
                    : "No paths here yet."
              }
              onClear={words.length ? () => setQuery("") : undefined}
              showAll={category !== null}
            />
          )}

          <div className="space-y-9">
            {groups.map((g, i) => (
              <div key={g.kind} className="space-y-9">
                <section aria-labelledby={`group-${g.kind}`}>
                  <div className="mb-3 mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <h3 id={`group-${g.kind}`} className="text-lg font-extrabold tracking-tight text-[#1f2a28] sm:text-xl">
                      {g.title} <span className="ml-1 text-sm font-semibold text-[#5d6b68]">{g.paths.length}</span>
                    </h3>
                    <p className="text-[13px] text-[#4f5d5a]">{g.blurb}</p>
                  </div>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {g.paths.map((p) => (
                      <PathRow key={p.id} item={p} saved={saved.has(p.id)} onToggle={() => toggle(p.id)} />
                    ))}
                  </ul>
                </section>
                {i === 0 && <RequestBanner />}
              </div>
            ))}
            {groups.length === 0 && <RequestBanner />}
          </div>
        </main>
      </div>
    </>
  )
}

function NavItem({ href, label, count, active, saved }: { href: string; label: string; count: number; active: boolean; saved?: boolean }) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-between gap-2.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] focus-visible:ring-offset-1 focus-visible:ring-offset-[#f4f5f2] motion-safe:transition-colors lg:rounded-lg lg:border-transparent lg:px-3 lg:py-2 ${
          active
            ? "border-[#3d6b63] bg-[#3d6b63] text-white lg:border-[#3d6b63]"
            : "border-[#d9dfdc] bg-white text-[#2b3836] hover:border-[#3d6b63] hover:text-[#2f564f] lg:bg-transparent lg:hover:border-transparent lg:hover:bg-[#e6efec]"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {saved && <BookmarkIcon filled={active} className="h-3.5 w-3.5" />}
          {label}
        </span>
        <span className={`min-w-[1.5rem] rounded-full px-1.5 text-center text-xs font-bold tabular-nums ${active ? "bg-white/20 text-white" : "bg-[#e6efec] text-[#2f564f]"}`}>
          {count}
        </span>
      </Link>
    </li>
  )
}

function PathRow({ item, saved, onToggle }: { item: IndexItem; saved: boolean; onToggle: () => void }) {
  const { done, total } = useProgress(item.id, item.topicIds, item.shared)
  const level = item.level ? `${item.level[0].toUpperCase()}${item.level.slice(1)}` : null
  const i = item.title.indexOf(": ")
  const name = i < 0 ? item.title : item.title.slice(0, i)
  const rest = i < 0 ? "" : item.title.slice(i)
  return (
    // The link and the bookmark are siblings: no button inside the link.
    <li className="group relative">
      <Link
        href={`/learn/paths/${item.id}`}
        className="flex h-full items-center gap-3.5 rounded-xl border border-[#d9dfdc] bg-white py-3 pl-3.5 pr-14 hover:border-[#3d6b63] hover:shadow-[0_6px_18px_-12px_rgba(31,42,40,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f5f2] motion-safe:transition-[border-color,box-shadow]"
      >
        <ProgressRing done={done} total={total} />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-[15px] font-bold leading-snug text-[#1f2a28] group-hover:text-[#2f564f]">
            {name}
            {rest && <span className="font-semibold text-[#4f5d5a]">{rest}</span>}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-[#4f5d5a]" title={item.promise}>
            {item.promise}
          </span>
          <span className="mt-1 block text-xs font-semibold text-[#5d6b68]">
            {total} topics{level ? ` · ${level}` : ""}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={`Save ${name}`}
        title={saved ? "Saved" : "Save this path"}
        className={`absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] motion-safe:transition-colors ${
          saved ? "text-[#3d6b63] hover:bg-[#e6efec]" : "text-[#7c8a87] hover:bg-[#e6efec] hover:text-[#3d6b63]"
        }`}
      >
        <BookmarkIcon filled={saved} className="h-5 w-5" />
      </button>
    </li>
  )
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 17
  const c = 2 * Math.PI * r
  const frac = done / Math.max(1, total)
  const pct = Math.round(frac * 100)
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e6efec" strokeWidth="4" />
        {done > 0 && (
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke="#3d6b63"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${c * frac} ${c}`}
            className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-500"
          />
        )}
      </svg>
      <span aria-hidden="true" className="text-[10.5px] font-bold tabular-nums text-[#2f564f]">
        {pct}%
      </span>
      <span className="sr-only">{done ? `${done} of ${total} topics done` : "Not started"}</span>
    </span>
  )
}

function BookmarkIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M5.5 3.5h9a1 1 0 0 1 1 1v12.2l-5.5-3.6-5.5 3.6V4.5a1 1 0 0 1 1-1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RequestBanner() {
  return (
    <Link
      href="/request"
      className="group/banner flex flex-col gap-3 rounded-2xl bg-[#12201d] px-5 py-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f5f2] sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <span>
        <span className="block text-[17px] font-extrabold tracking-tight">Not seeing what you need?</span>
        <span className="mt-0.5 block text-[14px] text-[#c9d6d2]">Describe your own system and get a step-by-step walkthrough of how it works.</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#8fc2b6] px-4 py-2 text-[14px] font-bold text-[#12201d] group-hover/banner:bg-[#a6d1c7] sm:self-auto motion-safe:transition-colors">
        Get your own system explained
        <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover/banner:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  )
}

function Empty({ message, onClear, showAll }: { message: string; onClear?: () => void; showAll: boolean }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-[#c5cfcb] bg-white/60 px-5 py-8 text-center">
      <p className="text-[15px] text-[#2b3836]">{message}</p>
      <div className="mt-3 flex justify-center gap-3 text-sm font-semibold">
        {onClear && (
          <button type="button" onClick={onClear} className="rounded-full px-3 py-1.5 text-[#2f564f] hover:bg-[#e6efec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63]">
            Clear search
          </button>
        )}
        {showAll && (
          <Link href={BASE} scroll={false} className="rounded-full px-3 py-1.5 text-[#2f564f] hover:bg-[#e6efec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d6b63]">
            Show all paths
          </Link>
        )}
      </div>
    </div>
  )
}
