import type { Metadata } from "next"
import LearnLibrary from "@/components/learn/LearnLibrary"
import { getCatalog } from "@/lib/learn/content"

export const metadata: Metadata = {
  title: "The library: design patterns and company architectures",
  description: "Design patterns explained through the problems they solve, and how the biggest digital companies built their systems, step by step.",
  alternates: { canonical: "https://sdlc.dev/learn" },
}

export default async function LearnPage() {
  return <LearnLibrary catalog={await getCatalog()} />
}
