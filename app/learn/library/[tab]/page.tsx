import { notFound } from "next/navigation"
import LearnLibrary from "@/components/learn/LearnLibrary"
import { getCatalog } from "@/lib/learn/content"

const TABS = ["patterns", "companies", "paths"]

export function generateStaticParams() {
  return TABS.map((tab) => ({ tab }))
}

export default async function LearnTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  if (!TABS.includes(tab)) notFound()
  return <LearnLibrary catalog={await getCatalog()} tab={tab} />
}
