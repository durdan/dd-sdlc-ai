---
id: next-revalidation
title: "Revalidation: by time, by tag, by path"
summary: Let entries age out, or invalidate them when data changes
why: "Caching is easy; knowing when cached content is wrong is the hard part. Next.js gives you a clock and three ways to say \"this changed\", and they differ in whether the next visitor waits."
requires: [next-cache-components]
lesson: none
points:
  - title: Time-based
    text: "`cacheLife` alone: entries are refreshed in the background once `revalidate` passes. Good when slightly old data is fine and changes have no event you can hook into."
  - title: Tag, then invalidate
    text: "`cacheTag(\"posts\")` labels entries. `revalidateTag(\"posts\", \"max\")` marks them stale everywhere; visitors get the old version while a new one is made."
  - title: Read your own writes
    text: "`updateTag` expires the tag immediately, so the user who just saved sees the change. It works only inside Server Actions."
  - title: Paths as a fallback
    text: "`revalidatePath(\"/blog\")` invalidates what a route uses when you don't know its tags. Tags are more precise and invalidate less."
quiz:
  - q: "A CMS webhook calls your Route Handler when an article is published. Which call fits?"
    options: ["`updateTag('articles')`", "`revalidateTag('articles', 'max')`", "`refresh()`"]
    answer: 1
    explain: "Route Handlers can call `revalidateTag` but not `updateTag` or `refresh`, which are Server Action only. With `max`, readers keep getting the cached page while the new one is generated, then see the update."
  - q: "A user edits their profile name in a form handled by a Server Action, and the redirected page must show the new name. Which call fits?"
    options: ["`revalidateTag('profile', 'max')`", "`updateTag('profile')`", "Nothing: Server Actions bypass caches"]
    answer: 1
    explain: "This is read-your-own-writes. `updateTag` expires the entries now, so the next render fetches fresh data instead of serving the stale copy first."
  - q: "What does calling `revalidateTag('posts', 'max')` do by itself, before anyone visits?"
    options: ["Regenerates every page that uses the tag", "Marks the tagged entries stale; each is regenerated when it is next requested", "Deletes the entries from the CDN"]
    answer: 1
    explain: "Revalidation is triggered by requests. Pages using the tag revalidate as they are visited, not all at once, which avoids a thundering herd on your data source."
links:
  - { title: "Revalidating (Next.js)", url: "https://nextjs.org/docs/app/getting-started/revalidating" }
  - { title: "revalidateTag (Next.js)", url: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag" }
  - { title: "updateTag (Next.js)", url: "https://nextjs.org/docs/app/api-reference/functions/updateTag" }
  - { title: "revalidatePath (Next.js)", url: "https://nextjs.org/docs/app/api-reference/functions/revalidatePath" }
---
Revalidation is how cached data gets replaced. Next.js offers two strategies, which you usually combine. **Time-based** revalidation comes from `cacheLife`: after `revalidate` seconds the next request triggers a background refresh. **On-demand** revalidation is something you call after a change: tag cached data with `cacheTag`, then invalidate the tag with `revalidateTag` or `updateTag`, or invalidate a whole route with `revalidatePath`. The choice between them is mostly about one question: may the next visitor briefly see the old version?

## Tagging and invalidating

```tsx
// lib/posts.ts
import { cacheLife, cacheTag } from "next/cache"

export async function getPosts() {
  "use cache"
  cacheLife("max")          // no reason to refresh on a clock
  cacheTag("posts")
  return db.post.findMany({ orderBy: { createdAt: "desc" } })
}
```

```ts
// app/api/cms-webhook/route.ts: called by the CMS when content changes
import { revalidateTag } from "next/cache"

export async function POST(request: Request) {
  if (request.headers.get("x-webhook-secret") !== process.env.CMS_SECRET) {
    return new Response("Forbidden", { status: 403 })
  }
  revalidateTag("posts", "max")
  return Response.json({ revalidated: true })
}
```

```ts
// app/posts/actions.ts
"use server"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function createPost(formData: FormData) {
  const user = await requireUser()                 // actions are public endpoints
  const post = await db.post.create({ data: { title: String(formData.get("title")), authorId: user.id } })
  updateTag("posts")
  redirect(`/posts/${post.id}`)
}
```

For content that changes on an event (a CMS publish, an admin edit), a long `cacheLife` plus a tag is better than a short clock: pages stay in the static shell and refresh only when something actually changed.

## Stale-while-revalidate or wait

| | `revalidateTag(tag, profile)` | `updateTag(tag)` | `revalidatePath(path)` |
|---|---|---|---|
| Called from | Server Actions, Route Handlers | Server Actions only | Server Actions, Route Handlers |
| Next request | served stale while refreshing (with `"max"`) | waits for fresh data | invalidates the route's cached data |
| Use for | background updates, webhooks | the user's own change | when you don't know the tags |

The second argument to `revalidateTag` is required in Next.js 16: it says how long stale content may still be served. `"max"` is the recommended choice; `{ expire: 0 }` means never serve stale. The old one-argument form is deprecated.

Two related tools: `refresh()` in a Server Action re-renders the current page for the client without touching any cache, and `revalidatePath` with a dynamic pattern (`"/blog/[slug]"`) needs a type, `"page"` or `"layout"`, to say how much of the tree to invalidate.

None of these purge a CDN that sits in front of your server under its own rules; that is part of how you deploy, covered later in this path.
