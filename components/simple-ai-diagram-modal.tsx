"use client"

import React, { useState, useRef, useEffect } from 'react'
import { X, Sparkles, Copy, Download, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MermaidViewerEnhanced } from './mermaid-viewer-enhanced'
import { parseMermaidDiagrams } from '@/lib/mermaid-parser'

interface SimpleAIDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  input: string
}

export function SimpleAIDiagramModal({ isOpen, onClose, input }: SimpleAIDiagramModalProps) {
  const [streamedContent, setStreamedContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedDiagrams, setGeneratedDiagrams] = useState<Record<string, string>>({})
  const streamContainerRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isOpen && input) {
      generateDiagram()
    }
  }, [isOpen, input])

  // Auto-scroll streaming content
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight
    }
  }, [streamedContent])

  const generateDiagram = async () => {
    setIsStreaming(true)
    setError(null)
    setStreamedContent('')
    setIsComplete(false)

    try {
      const response = await fetch('/api/generate-preview-diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          stream: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate diagram')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content') {
                  setStreamedContent(prev => prev + (data.content || ''))
                } else if (data.type === 'complete') {
                  setStreamedContent(data.fullContent || "")
                  setIsComplete(true)
                  setIsStreaming(false)
                  // Use centralized parser from mermaid-parser.ts
                  const diagrams = parseMermaidDiagrams(data.fullContent || "")
                  setGeneratedDiagrams(diagrams)
                  console.log('Parsed diagrams:', Object.keys(diagrams))
                } else if (data.type === 'error') {
                  setError(data.error || "Failed to generate diagram")
                  setIsStreaming(false)
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate diagram')
      setIsStreaming(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(streamedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([streamedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'architecture-diagrams.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Architecture Diagrams</h2>
              <p className="text-sm text-gray-600">Generating visual representations of your system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => {
                  setError(null)
                  generateDiagram()
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {/* Streaming Content */}
              {isStreaming && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Generating diagrams...</span>
                  </div>
                  <div 
                    ref={streamContainerRef}
                    className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-auto"
                  >
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {streamedContent}
                    </pre>
                  </div>
                </div>
              )}

              {/* Completed Diagrams */}
              {isComplete && Object.keys(generatedDiagrams).length > 0 && (
                <div className="p-6">
                  <MermaidViewerEnhanced 
                    diagrams={generatedDiagrams}
                    title="Generated Architecture Diagrams"
                    height="500px"
                  />
                </div>
              )}

              {/* Raw Content (hidden when diagrams are shown) */}
              {isComplete && Object.keys(generatedDiagrams).length === 0 && (
                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          No diagrams could be parsed from the generated content. 
                          The raw content is shown below.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {streamedContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Generation Complete
              </Badge>
              {Object.keys(generatedDiagrams).length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Object.keys(generatedDiagrams).length} diagram{Object.keys(generatedDiagrams).length !== 1 ? 's' : ''} generated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}