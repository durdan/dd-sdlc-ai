import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Markdown from "@/components/paths/Markdown"
import TopicView from "@/components/paths/TopicView"
import { getPath, getPathsData } from "@/lib/paths/load"

type Params = { params: Promise<{ path: string; topic: string }> }

export const dynamicParams = false

// Every written topic on every path that has written topics. Library steps of system design
// paths link straight to their walkthroughs, so they have no page here.
export async function generateStaticParams() {
  const data = await getPathsData()
  return data.paths.flatMap((p) =>
    p.stages.flatMap((s) => s.topics.filter((t) => data.topics[t].source === "content").map((t) => ({ path: p.id, topic: t }))),
  )
}

async function find(params: Params["params"]) {
  const { path: pathId, topic: topicId } = await params
  const found = await getPath(pathId)
  const index = found ? found.topics.findIndex((t) => t.id === topicId) : -1
  if (!found || index < 0 || found.topics[index].source !== "content") return null
  return { ...found, index, topic: found.topics[index] }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = await find(params)
  if (!f) return {}
  // A topic on several paths has one canonical URL: the first path that lists it.
  const home = f.data.pathsByTopic[f.topic.id][0]
  return {
    title: f.topic.title.replace(/`/g, ""),
    description: f.topic.lead || f.topic.summary,
    alternates: { canonical: `https://sdlc.dev/learn/paths/${home}/${f.topic.id}` },
  }
}

export default async function TopicPage({ params }: Params) {
  const f = await find(params)
  if (!f) notFound()
  const { path, topics, index, topic, shared } = f
  const stage = path.stages.find((s) => s.topics.includes(topic.id))!
  const next = topics.slice(index + 1).find((t) => t.source === "content")
  return (
    <TopicView
      pathId={path.id}
      pathTitle={path.title}
      stageTitle={stage.title}
      number={index + 1}
      total={topics.length}
      topic={topic}
      next={next ? { id: next.id, title: next.title } : undefined}
      shared={shared[topic.id] ?? []}
      body={<Markdown source={topic.body} />}
      notes={topic.notes ? <Markdown source={topic.notes} /> : undefined}
    />
  )
}
