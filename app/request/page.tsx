import type { Metadata } from "next"
import { Suspense } from "react"
import RequestStudio from "@/components/walkthroughs/RequestStudio"

export const metadata: Metadata = {
  title: "Request a walkthrough",
  description: "Turn your system into a narrated, animated architecture walkthrough.",
}

export default function RequestPage() {
  return (
    <Suspense>
      <RequestStudio />
    </Suspense>
  )
}
