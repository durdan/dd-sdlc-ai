"use client"
import "./setup"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TopicPage, useWatchMode } from "design-player/react"
import SiteHeader from "./SiteHeader"
import type { Catalog, DiagramLayout, Manifest, Walkthrough } from "design-player/core"

const AUTOPLAY = "design-player.autoplay"

export default function LearnTopic(props: {
  catalog: Catalog
  walkthrough: Walkthrough
  layouts: Record<string, DiagramLayout>
  manifest: Manifest
}) {
  const router = useRouter()
  // On phones the player fills the screen, so the site header steps aside.
  const watch = useWatchMode()
  // The chapter comes from #ch=<id>, which only the browser can see.
  const [chapter, setChapter] = useState<string | undefined | null>(null)
  useEffect(() => setChapter(/(?:^|&)ch=([\w-]+)/.exec(location.hash.slice(1))?.[1]), [])
  if (chapter === null) return null
  return (
    <>
    {watch ? null : <SiteHeader />}
    <TopicPage
      {...props}
      chapter={chapter}
      open={(url) => {
        // Remember the tap so the next topic may start with sound.
        if (/\/(p|c)\/[\w-]+/.test(url)) sessionStorage.setItem(AUTOPLAY, "1")
        router.push(url)
      }}
      library={() => router.push("/learn")}
    />
    </>
  )
}
