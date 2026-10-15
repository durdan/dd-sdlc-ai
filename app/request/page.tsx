import type { Metadata } from "next"
import { Suspense } from "react"
import RequestStudio from "@/components/walkthroughs/RequestStudio"

export const metadata: Metadata = {
  title: "Your system, explained",
  description: "Get your own architecture explained the way sdlc.dev explains Uber or Netflix: a step-by-step walkthrough of your system for your team, new joiners or stakeholders.",
}

export default function RequestPage() {
  return (
    <Suspense>
      <RequestStudio />
    </Suspense>
  )
}
