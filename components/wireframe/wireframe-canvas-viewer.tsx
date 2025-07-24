'use client'

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'

interface WireframeComponent {
  id: string
  type: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  content: string | string[] | null
  properties?: {
    backgroundColor?: string
    textColor?: string
    borderColor?: string
    borderRadius?: number
  }
}

interface WireframeData {
  title: string
  description: string
  layout: {
    type: string
    dimensions: { width: number; height: number }
    grid?: { columns: number; gap: number; padding: number }
  }
  components: WireframeComponent[]
  annotations?: Array<{
    componentId: string
    note: string
    accessibility?: string
    interaction?: string
    contentRequirements?: string
  }>
  userFlow?: Array<{
    step: string
    action: string
    result: string
    alternativePaths?: string[]
  }>
}

interface WireframeCanvasViewerProps {
  wireframe: WireframeData
  scale?: number
}

export function WireframeCanvasViewer({ wireframe, scale = 0.6 }: WireframeCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const { width, height } = wireframe.layout.dimensions
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    
    canvas.width = scaledWidth
    canvas.height = scaledHeight

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, scaledWidth, scaledHeight)

    // Draw grid if specified
    if (wireframe.layout.grid) {
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      const { columns, gap } = wireframe.layout.grid
      const columnWidth = (scaledWidth - gap * (columns + 1)) / columns

      for (let i = 1; i < columns; i++) {
        const x = gap + (columnWidth + gap) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, scaledHeight)
        ctx.stroke()
      }
    }

    // Draw components
    wireframe.components.forEach((component) => {
      const x = component.position.x * scale
      const y = component.position.y * scale
      const width = component.size.width * scale
      const height = component.size.height * scale
      const props = component.properties || {}

      // Draw component background
      ctx.fillStyle = props.backgroundColor || '#ffffff'
      ctx.fillRect(x, y, width, height)

      // Draw component border
      ctx.strokeStyle = props.borderColor || '#333333'
      ctx.lineWidth = 1
      
      if (props.borderRadius) {
        // Rounded rectangle
        const radius = props.borderRadius * scale
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.stroke()
      } else {
        ctx.strokeRect(x, y, width, height)
      }

      // Draw content
      ctx.fillStyle = props.textColor || '#333333'
      ctx.font = `${14 * scale}px Arial`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      if (component.content) {
        if (Array.isArray(component.content)) {
          // Draw list items
          component.content.forEach((item, index) => {
            const textY = y + 10 * scale + (index * 25 * scale)
            ctx.fillText(item, x + 10 * scale, textY)
          })
        } else if (component.type === 'button') {
          // Center text for buttons
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.font = `bold ${14 * scale}px Arial`
          ctx.fillText(component.content, x + width / 2, y + height / 2)
        } else if (component.type === 'header') {
          // Larger text for headers
          ctx.font = `bold ${24 * scale}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(component.content, x + width / 2, y + height / 2)
        } else {
          // Regular text
          ctx.fillText(component.content, x + 10 * scale, y + 10 * scale)
        }
      }

      // Add component type label for clarity
      if (component.type !== 'button' && component.type !== 'header') {
        ctx.fillStyle = '#666666'
        ctx.font = `${10 * scale}px Arial`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText(`[${component.type}]`, x + width - 5 * scale, y + 5 * scale)
      }
    })

    // Draw component IDs on hover (optional enhancement)
    canvas.title = 'Wireframe Preview'

  }, [wireframe, scale])

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{wireframe.title}</h3>
            <p className="text-sm text-muted-foreground">{wireframe.description}</p>
          </div>
          
          <div 
            ref={containerRef}
            className="relative overflow-auto border border-gray-200 rounded-lg bg-gray-50 p-4"
            style={{ maxHeight: '600px' }}
          >
            <canvas
              ref={canvasRef}
              className="border border-gray-300 bg-white shadow-lg"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Layout: {wireframe.layout.type} ({wireframe.layout.dimensions.width}x{wireframe.layout.dimensions.height})</span>
            <span>Scale: {(scale * 100).toFixed(0)}%</span>
          </div>
        </div>
      </Card>

      {/* Annotations */}
      {wireframe.annotations && wireframe.annotations.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-3">Component Annotations</h4>
          <div className="space-y-3">
            {wireframe.annotations.map((annotation, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 space-y-1">
                <div className="font-medium text-sm">{annotation.componentId}</div>
                <div className="text-sm text-muted-foreground">{annotation.note}</div>
                {annotation.accessibility && (
                  <div className="text-xs text-blue-600">Accessibility: {annotation.accessibility}</div>
                )}
                {annotation.interaction && (
                  <div className="text-xs text-purple-600">Interaction: {annotation.interaction}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Flow */}
      {wireframe.userFlow && wireframe.userFlow.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-3">User Flow</h4>
          <div className="space-y-4">
            {wireframe.userFlow.map((flow, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {flow.step}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm">{flow.action}</div>
                  <div className="text-sm text-muted-foreground">→ {flow.result}</div>
                  {flow.alternativePaths && Array.isArray(flow.alternativePaths) && flow.alternativePaths.length > 0 && (
                    <div className="text-xs text-gray-500 italic">
                      Alternative: {flow.alternativePaths.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}