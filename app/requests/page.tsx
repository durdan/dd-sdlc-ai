import type { Metadata } from "next"
import RequestList from "@/components/walkthroughs/RequestList"

export const metadata: Metadata = { title: "My walkthrough requests", robots: { index: false } }

export default function RequestsPage() {
  return <RequestList />
}
