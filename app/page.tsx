import type { Metadata } from "next"
import LearnLibrary from "@/components/learn/LearnLibrary"
import { getCatalog } from "@/lib/learn/content"
import { SDLC_PRODUCT } from "@/lib/product"
import ProductHome from "./product-home"

// While the SDLC.dev product is off, the home page is the learning library.
export const metadata: Metadata = SDLC_PRODUCT
  ? {}
  : {
      title: { absolute: "Learn software design: patterns and real architectures | SDLC.dev" },
      description: "Learn how great software is designed: design patterns explained through the problems they solve, and how Uber, Netflix, WhatsApp, Stripe and others built their systems, step by step.",
    }

export default async function Home() {
  if (SDLC_PRODUCT) return <ProductHome />
  return <LearnLibrary catalog={await getCatalog()} />
}
