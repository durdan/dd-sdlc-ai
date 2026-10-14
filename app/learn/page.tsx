import type { Metadata } from "next"
import LearnLibrary from "@/components/learn/LearnLibrary"
import { getCatalog } from "@/lib/learn/content"

export const metadata: Metadata = {
  title: "Design walkthroughs",
  description: "Narrated, animated walkthroughs of design patterns and real company architectures, one diagram at a time.",
  alternates: { canonical: "https://sdlc.dev/learn" },
}

export default async function LearnPage() {
  return <LearnLibrary catalog={await getCatalog()} />
}
