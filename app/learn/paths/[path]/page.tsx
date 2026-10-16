import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Markdown from "@/components/paths/Markdown"
import PathMap from "@/components/paths/PathMap"
import { layoutPath } from "@/lib/paths/layout"
import { getPath, getPathsData } from "@/lib/paths/load"

type Params = { params: Promise<{ path: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  const data = await getPathsData()
  return data.paths.map((p) => ({ path: p.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getPath((await params).path)
  if (!found) return {}
  return {
    title: found.path.title,
    description: found.path.promise,
    alternates: { canonical: `https://sdlc.dev/learn/paths/${found.path.id}` },
  }
}

export default async function PathPage({ params }: Params) {
  const found = await getPath((await params).path)
  if (!found) notFound()
  const { data, path, topics, shared } = found
  const layout = await layoutPath(path, data)
  const nextPaths = path.next.map((id) => data.paths.find((p) => p.id === id)!).map((p) => ({ id: p.id, title: p.title, promise: p.promise }))
  return (
    <PathMap path={path} topics={topics} layout={layout} shared={shared} nextPaths={nextPaths}>
      {path.intro ? <Markdown source={path.intro} /> : null}
    </PathMap>
  )
}
