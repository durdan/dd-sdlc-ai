import type { Metadata } from "next"
import LearnLibrary from "@/components/learn/LearnLibrary"
import { getCatalog } from "@/lib/learn/content"
import { SDLC_PRODUCT } from "@/lib/product"
import ProductHome from "./product-home"

// While the SDLC.dev product is off, the home page is the learning library.
export const metadata: Metadata = SDLC_PRODUCT
  ? {}
  : {
      title: { absolute: "Design walkthroughs | SDLC.dev" },
      description: "Narrated, animated walkthroughs of design patterns and real company architectures, one diagram at a time.",
    }

export default async function Home() {
  if (SDLC_PRODUCT) return <ProductHome />
  return <LearnLibrary catalog={await getCatalog()} />
}
