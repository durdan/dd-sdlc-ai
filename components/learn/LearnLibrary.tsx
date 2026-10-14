"use client"
import "./setup"
import { useRouter } from "next/navigation"
import { LibraryPage } from "design-player/react"
import type { Catalog } from "design-player/core"
import SiteHeader from "./SiteHeader"

export default function LearnLibrary({ catalog, tab }: { catalog: Catalog; tab?: string }) {
  const router = useRouter()
  return (
    <>
      <SiteHeader />
      <LibraryPage catalog={catalog} initialTab={tab} open={(url) => router.push(url)} />
    </>
  )
}
