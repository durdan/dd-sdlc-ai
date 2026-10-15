"use client"
import "./setup"
import { useRouter } from "next/navigation"
import { LibraryPage } from "design-player/react"
import type { Catalog } from "design-player/core"
import HeroBanner from "./HeroBanner"
import SiteHeader from "./SiteHeader"

export default function LearnLibrary({ catalog, tab }: { catalog: Catalog; tab?: string }) {
  const router = useRouter()
  return (
    <>
      <SiteHeader />
      {/* The film introduces the site on the home page; the tab pages go straight to the library. */}
      {tab ? null : <HeroBanner />}
      <div id="library">
        <LibraryPage catalog={catalog} initialTab={tab} open={(url) => router.push(url)} />
      </div>
    </>
  )
}
