import type { Metadata } from "next"
import RequestTracker from "@/components/walkthroughs/RequestTracker"

export const metadata: Metadata = { title: "Your walkthrough", robots: { index: false } }

export default async function RequestTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  return <RequestTracker id={(await params).id} />
}
