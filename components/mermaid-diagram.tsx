"use client"

import { useEffect, useRef } from "react"

interface MermaidDiagramProps {
  chart: string
  id: string
}

export function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ref.current) {
      // In a real implementation, you would load and use Mermaid.js here
      // For now, we'll just display the raw Mermaid code
      ref.current.innerHTML = `<pre><code>${chart}</code></pre>`
    }
  }, [chart])

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div ref={ref} id={id} />
    </div>
  )
}
