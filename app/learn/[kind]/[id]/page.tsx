import type { Metadata } from "next"
import { notFound } from "next/navigation"
import LearnTopic from "@/components/learn/LearnTopic"
import { getCatalog, getTopic, KIND_PREFIX } from "@/lib/learn/content"

type Params = { params: Promise<{ kind: string; id: string }> }

export async function generateStaticParams() {
  const catalog = await getCatalog()
  return catalog.topics.map((t) => ({ kind: KIND_PREFIX[t.meta?.kind ?? "pattern"], id: t.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const topic = await getTopic(id)
  if (!topic) return {}
  return {
    title: topic.walkthrough.title,
    description: topic.meta.meta?.blurb ?? topic.walkthrough.subtitle,
  }
}

export default async function LearnTopicPage({ params }: Params) {
  const { kind, id } = await params
  const topic = await getTopic(id)
  if (!topic || KIND_PREFIX[topic.meta.meta?.kind ?? "pattern"] !== kind) notFound()
  return <LearnTopic catalog={topic.catalog} walkthrough={topic.walkthrough} layouts={topic.layouts} manifest={topic.manifest} />
}
