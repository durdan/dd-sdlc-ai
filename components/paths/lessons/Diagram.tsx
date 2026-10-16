"use client"
// The "diagram" lesson: the topic's ```trace diagram``` blocks as selectable flow diagrams in one
// visualiser (written entirely in Markdown; see content/README.md).
import { useState } from "react"
import type { FlowDiagram } from "@/lib/paths/types"
import FlowVisualiser from "../FlowVisualiser"
import Section from "../Section"

export function DiagramSections({ diagrams, start }: { diagrams: FlowDiagram[]; start: number }) {
  const [i, setI] = useState(0)
  return (
    <Section
      n={start}
      id="flow"
      title="Follow the flow"
      sub={`${diagrams.length > 1 ? "Pick a diagram, then play it" : "Play it"} or step through. Pause and tap a box to see what it does.`}
    >
      <FlowVisualiser diagrams={diagrams} index={i} onSelect={setI} />
    </Section>
  )
}
