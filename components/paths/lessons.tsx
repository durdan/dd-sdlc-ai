// The lesson registry. A topic's front matter names its lesson; this file turns that into UI:
//   "lanes"            → the topic's ```trace lanes``` blocks, played in the lanes visualiser
//                        (written entirely in Markdown; see content/README.md)
//   "walkthrough:<id>" → a card linking to the library walkthrough /learn/p|c/<id>
//   "none"             → no extra lesson: the explanation, its Try it blocks and the quiz
import type { ReactNode } from "react"
import type { Topic } from "@/lib/paths/types"
import { LanesSections, lanesSectionCount } from "./lessons/Lanes"
import Section from "./Section"
import WalkthroughCard from "./WalkthroughCard"

export type LessonParts = {
  /** Sections shown after the explanation ("How it works") and before the quiz. */
  sections: (start: number) => ReactNode
  count: number
}

export function lessonParts(topic: Topic): LessonParts {
  const l = topic.lesson
  if (l.type === "lanes" && topic.traces.length) {
    return { sections: (start) => <LanesSections traces={topic.traces} start={start} />, count: lanesSectionCount(topic.traces) }
  }
  if (l.type === "walkthrough" && topic.walkthrough) {
    const w = topic.walkthrough
    return {
      sections: (start) => (
        <Section n={start} id="walkthrough" title="Watch the walkthrough" sub="The same idea at the scale of a whole system, step by step.">
          <WalkthroughCard w={w} />
        </Section>
      ),
      count: 1,
    }
  }
  return { sections: () => null, count: 0 }
}
