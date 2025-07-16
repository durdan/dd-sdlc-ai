'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

interface StreamingResponseWindowProps {
  isStreaming: boolean
  content: string
  title?: string
  onCopy?: () => void
  className?: string
}

export function StreamingResponseWindow({
  isStreaming,
  content,
  title = "AI Response",
  onCopy,
  className = ""
}: StreamingResponseWindowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content changes and streaming
  useEffect(() => {
    if (isStreaming && shouldAutoScroll && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content, isStreaming, shouldAutoScroll])

  // Handle scroll to detect if user manually scrolled up
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setShouldAutoScroll(isAtBottom)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    onCopy?.()
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {isStreaming && (
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-700">{title}</span>
          {isStreaming && (
            <Badge variant="secondary" className="text-xs">
              Streaming...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {content && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={contentRef}
        className={`bg-gray-900 text-gray-100 font-mono text-sm overflow-auto transition-all duration-200 ${
          isExpanded ? 'max-h-96' : 'max-h-20'
        }`}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
        onScroll={handleScroll}
      >
        <div className="p-3">
          {content ? (
            <div className="whitespace-pre-wrap">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1 align-middle">
                  |
                </span>
              )}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              {isStreaming ? 'Waiting for response...' : 'No content'}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {!isExpanded && content && content.split('\n').length > 3 && (
        <div className="px-3 py-1 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {content.split('\n').length} lines • {isExpanded ? 'Expanded' : 'Collapsed'}
            </span>
            {!shouldAutoScroll && isStreaming && (
              <button
                onClick={() => {
                  setShouldAutoScroll(true)
                  if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Scroll to bottom
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamingResponseWindow 