import type { Metadata } from "next"
import { Suspense } from "react"
import RequestStudio from "@/components/walkthroughs/RequestStudio"

export const metadata: Metadata = {
  title: "Explain your system",
  description: "Turn your system into a narrated, animated architecture walkthrough: a script and system diagram in a minute, the finished walkthrough in about two days.",
}

export default function RequestPage() {
  return (
    <Suspense>
      <RequestStudio />
    </Suspense>
  )
}
