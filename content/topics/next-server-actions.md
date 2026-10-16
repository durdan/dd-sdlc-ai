---
id: next-server-actions
title: "Server Actions: mutations as public endpoints"
summary: A function call from the form, a POST on the wire
why: "Server Actions make a mutation look like calling a function, which makes it easy to forget that anyone can call it with any arguments. Every action needs the same checks as an API route."
requires: [next-revalidation, web-security]
lesson: diagram
points:
  - title: A function with a URL behind it
    text: "`\"use server\"` marks async functions the client may call. Next.js gives each an ID and the call travels as a POST request to the page's route."
  - title: Anyone can call it
    text: "The IDs are hard to guess and unused actions are dropped from the bundle, but any action your UI can call can be called directly. Check authentication, authorisation and input inside every action."
  - title: Mutate, invalidate, return
    text: "An action changes data, then calls `updateTag`, `revalidateTag` or `revalidatePath`. Its response carries the updated UI, so the page refreshes in one round trip."
  - title: One at a time
    text: "The client dispatches actions sequentially. They are for writes; reads belong in Server Components."
quiz:
  - q: "A `deletePost(id)` action is only rendered on the admin page, which Proxy restricts to admins. Is it safe without checks inside?"
    options: ["Yes: only admins can see the button", "No: the action is reachable by a direct POST, and a matcher change or refactor can drop the Proxy check; verify the user and their rights inside the action", "Yes: action IDs are encrypted"]
    answer: 1
    explain: "Hiding the button is not authorisation. The Next.js docs are explicit: treat Server Actions as reachable via direct POST requests and verify authentication and authorisation in each one."
  - q: "An inline action closes over a variable `publishVersion` from the component that defines it. Where does that value travel?"
    options: ["Nowhere: it stays on the server", "To the client and back, encrypted with a key generated per build", "Only into the server log"]
    answer: 1
    explain: "Closed-over values are sent to the browser with the form and returned with the call, so Next.js encrypts them. Don't rely on that alone for secrets; look the data up on the server instead."
  - q: "Where should you call `updateTag` so a user sees their own edit straight away?"
    options: ["In a Route Handler", "In the Server Action that made the change", "In a client component after the action resolves"]
    answer: 1
    explain: "`updateTag` works only in Server Actions. Calling it in the action means the response that comes back already contains the fresh data."
links:
  - { title: "Mutating Data (Next.js)", url: "https://nextjs.org/docs/app/getting-started/mutating-data" }
  - { title: "Data Security (Next.js)", url: "https://nextjs.org/docs/app/guides/data-security" }
  - { title: "'use server' (react.dev)", url: "https://react.dev/reference/rsc/use-server" }
  - { title: "Server Functions (react.dev)", url: "https://react.dev/reference/rsc/server-functions" }
---
A Server Action is a React Server Function used for a mutation, usually as the `action` of a form. You write an async function marked `"use server"`, import it into a component, and call it like any other function. Underneath, Next.js gives the function an ID, and calling it sends a `POST` request to the current route with the ID and the serialised arguments. The server runs the function, and its response carries both the return value and the re-rendered UI, so a form submission, the data change and the updated page fit in one round trip. The convenience hides one fact you must never forget: that `POST` can be sent by anyone.

## A safe action

```ts
// app/posts/actions.ts
"use server"
import { z } from "zod"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

const Input = z.object({ title: z.string().min(1).max(200), body: z.string().max(20_000) })

export async function createPost(formData: FormData) {
  const session = await getSession()                // 1. who is calling?
  if (!session) throw new Error("Unauthorized")

  const parsed = Input.safeParse(Object.fromEntries(formData))   // 2. never trust input
  if (!parsed.success) return { error: "Invalid post" }

  if (!session.user.canWrite) throw new Error("Forbidden")       // 3. may they do this?

  const post = await db.post.create({ data: { ...parsed.data, authorId: session.user.id } })
  updateTag("posts")                                // 4. invalidate what changed
  redirect(`/posts/${post.id}`)
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from "../actions"

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="body" />
      <button>Publish</button>
    </form>
  )
}
```

The form works before JavaScript has loaded (it is a normal form post); once hydrated, React submits it without a page reload. `useActionState` gives you a pending flag and the action's return value for errors.

## What Next.js protects, and what it doesn't

Next.js adds some defences: action IDs are encrypted, non-deterministic and change between builds; actions that no client code references are removed from the bundle; values an inline action closes over are encrypted before they travel to the browser and back; and the `Origin` header must match the host, which blocks cross-site form posts. None of that is authorisation. Every action that the UI can call has a valid ID in the page's JavaScript, and anyone can replay it with different arguments. Treat each action like an API route: authenticate, validate the arguments, check that this user may touch this record. A check in Proxy is a useful first filter, but a matcher change can silently drop it.

Two more properties shape how you use actions. The client sends them one at a time, so they are a poor fit for loading data; fetch in Server Components instead. And since an action is a public `POST`, a retry or a double click can call it twice, so make important writes idempotent.

```trace diagram
id: one-round-trip
title: One form submit, one round trip
subtitle: "<form action={createPost}> on /posts/new"
kind: sequence
elements:
  - { id: form, label: Browser }
  - { id: next, label: Next.js }
  - { id: action, label: createPost }
  - { id: db, label: Database }
  - { id: anyone, label: Anyone, role: client }
edges:
  - { id: post, from: form, to: next, label: "POST /posts/new: action ID + FormData" }
  - { id: origin, from: next, to: next, label: "Origin must match Host", flow: security }
  - { id: call, from: next, to: action, label: "createPost(formData)" }
  - { id: session, from: action, to: action, label: "1. getSession(): who is calling?", flow: security }
  - { id: validate, from: action, to: action, label: "2. zod parse  3. canWrite?", flow: security }
  - { id: write, from: action, to: db, label: post.create }
  - { id: row, from: db, to: action, label: the new post, style: dashed }
  - { id: invalidate, from: action, to: next, label: "4. updateTag(\"posts\"), redirect", style: dashed }
  - { id: response, from: next, to: form, label: "one response: RSC Payload of /posts/[id]", style: dashed }
  - { id: replay, from: anyone, to: next, label: "the same POST, other arguments" }
steps:
  - caption: "The form's action is a Server Action. Before JavaScript loads it is a normal form post; once hydrated, React submits it without a page reload."
    focus: [form]
  - caption: "Underneath, the call is a POST to the current route carrying the action's ID and the serialised arguments. IDs are encrypted, non-deterministic and change between builds."
    trace: [post]
  - caption: "Next.js checks that the Origin header matches the host, which blocks cross-site form posts, then decrypts the ID and runs the function."
    trace: [origin, call]
  - caption: "The first thing the action does is ask who is calling. Rendering the form only for signed-in users protects nothing, because the POST can be sent without the page."
    trace: [session]
  - caption: "Then it validates the input and checks that this user may write. Treat every action like an API route."
    trace: [validate]
  - caption: "Only now does it write the post."
    trace: [write, row]
  - caption: "updateTag expires the cached posts and redirect picks the destination. Place invalidation before redirect, since nothing after redirect runs."
    trace: [invalidate]
  - caption: "The response carries the return value and the re-rendered UI in one stream, so the submission, the change and the updated page take a single round trip."
    trace: [response]
  - caption: "Every action the UI can call has a valid ID in the page's JavaScript, so anyone can replay it with different arguments. That is why steps 1 to 3 live inside the action, not in Proxy."
    trace: [replay]
  - caption: "The client sends actions one at a time, so don't use them to load data. A retry or double click can send one twice, so make important writes idempotent."
    focus: [form, next]
```
