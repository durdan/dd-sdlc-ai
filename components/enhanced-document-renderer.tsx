"use client"

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Eye, Code, FileText, Check, AlertCircle } from "lucide-react"
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { parseMermaidDiagramsWithSections } from '@/lib/mermaid-parser-enhanced'
import { ErrorBoundary } from '@/components/error-boundary'

interface EnhancedDocumentRendererProps {
  content: string
  title?: string
  documentType?: string
  className?: string
  showActions?: boolean
  onCopy?: () => void
  onDownload?: () => void
}

export function EnhancedDocumentRenderer({
  content,
  title,
  documentType = 'general',
  className = '',
  showActions = true,
  onCopy,
  onDownload
}: EnhancedDocumentRendererProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [mermaidDiagrams, setMermaidDiagrams] = useState<Record<string, string>>({})
  const [hasMermaidContent, setHasMermaidContent] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Detect Mermaid diagrams in content
  useEffect(() => {
    if (content) {
      console.log('EnhancedDocumentRenderer: Analyzing content for diagrams...')
      console.log('Content length:', content.length)
      console.log('Content preview:', content.substring(0, 200))
      
      const diagrams = parseMermaidDiagramsWithSections(content)
      console.log('EnhancedDocumentRenderer: Found diagrams:', diagrams)
      console.log('Diagram keys:', Object.keys(diagrams))
      
      setMermaidDiagrams(diagrams)
      setHasMermaidContent(Object.keys(diagrams).length > 0)
    }
  }, [content])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'document'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onDownload?.()
  }

  // Enhanced markdown components with better styling
  const markdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b border-gray-200 pb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-6" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-5" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-lg font-medium text-gray-700 mb-2 mt-4" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-gray-700" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-gray-800" {...props}>
        {children}
      </em>
    ),
    code: ({ children, ...props }: any) => (
      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }: any) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4 bg-blue-50 py-2" {...props}>
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-300 rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-100" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props}>
        {children}
      </td>
    ),
    a: ({ href, children, ...props }: any) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline" 
        target="_blank" 
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
  }

  // Render content with inline Mermaid diagram detection
  const renderContentWithMermaid = (content: string) => {
    if (!content) return null

    const parts = content.split(/(```mermaid[\s\S]*?```)/g)

    return parts.map((part, index) => {
      if (part.startsWith('```mermaid')) {
        const mermaidContent = part.replace(/```mermaid\n?/, '').replace(/```$/, '')
        const diagramId = `mermaid-inline-${index}`

        return (
          <div key={index} className="my-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Diagram</span>
                  <Badge variant="secondary" className="text-xs">Mermaid</Badge>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <ErrorBoundary fallback={
                    <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Failed to render diagram</p>
                      <p className="text-xs text-gray-500 mt-1">The diagram may contain syntax errors</p>
                    </div>
                  }>
                    <MermaidViewerEnhanced
                      diagrams={{ [diagramId]: mermaidContent }}
                      title="Inline Diagram"
                      height="300px"
                    />
                  </ErrorBoundary>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {part}
        </ReactMarkdown>
      )
    })
  }

  const tabs = [
    {
      key: 'content',
      label: 'Content',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="prose max-w-none" ref={contentRef}>
          {renderContentWithMermaid(content)}
        </div>
      )
    }
  ]

  // Add diagrams tab if we have Mermaid content
  if (hasMermaidContent && Object.keys(mermaidDiagrams).length > 0) {
    tabs.push({
      key: 'diagrams',
      label: 'Diagrams',
      icon: <Code className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">Mermaid Diagrams</span>
            <Badge variant="secondary">{Object.keys(mermaidDiagrams).length} diagrams</Badge>
          </div>
          <ErrorBoundary fallback={
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Failed to render diagrams</p>
              <p className="text-xs text-gray-500 mt-1">Some diagrams may contain syntax errors</p>
            </div>
          }>
            <MermaidViewerEnhanced
              diagrams={mermaidDiagrams}
              title={title || 'Document Diagrams'}
              height="500px"
            />
          </ErrorBoundary>
        </div>
      )
    })
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {documentType}
            </Badge>
            {hasMermaidContent && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                {Object.keys(mermaidDiagrams).length} diagrams
              </Badge>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {tabs.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
