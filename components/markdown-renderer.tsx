"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface MarkdownRendererProps {
  content: string
  title?: string
  type?: 'business' | 'functional' | 'technical' | 'ux' | 'general'
}

const typeStyles = {
  business: "bg-blue-50 border-blue-200",
  functional: "bg-green-50 border-green-200", 
  technical: "bg-purple-50 border-purple-200",
  ux: "bg-orange-50 border-orange-200",
  general: "bg-gray-50 border-gray-200"
}

const typeColors = {
  business: "bg-blue-500",
  functional: "bg-green-500",
  technical: "bg-purple-500", 
  ux: "bg-orange-500",
  general: "bg-gray-500"
}

export function MarkdownRenderer({ content, title, type = 'general' }: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title?.toLowerCase().replace(/\s+/g, '-') || 'document'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={`${typeStyles[type]} shadow-sm`}>
      {title && (
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-3 h-3 rounded-full ${typeColors[type]} flex-shrink-0`} />
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                {title}
              </CardTitle>
              <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                {type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2 text-xs sm:text-sm"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                <span className="sm:hidden">{copied ? '✓' : 'Copy'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 px-2 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="prose prose-gray max-w-none prose-sm sm:prose-base">
        <div className="overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 mt-6 border-b border-gray-200 pb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 mt-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 mt-4" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-base sm:text-lg font-medium text-gray-700 mb-2 mt-3" {...props} />,
              h5: ({node, ...props}) => <h5 className="text-sm sm:text-base font-medium text-gray-700 mb-1 mt-2" {...props} />,
              h6: ({node, ...props}) => <h6 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 mt-2" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-700 mb-3 leading-relaxed text-sm sm:text-base" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 text-sm sm:text-base" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 text-sm sm:text-base" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-700 mb-1 text-sm sm:text-base" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg mb-4 italic text-gray-700 text-sm sm:text-base" {...props} />,
              code: ({node, inline, ...props}) => 
                inline 
                  ? <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs sm:text-sm font-mono break-words" {...props} />
                  : <code className="block bg-gray-100 p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-mono mb-4 whitespace-pre overflow-x-auto" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg text-xs sm:text-sm min-w-0 overflow-x-auto mb-4" {...props} />,
              table: ({node, ...props}) => (
                <div className="overflow-x-auto mb-4 -mx-2 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
              tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
              tr: ({node, ...props}) => <tr {...props} />,
              th: ({node, ...props}) => <th className="px-2 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" {...props} />,
              td: ({node, ...props}) => <td className="px-2 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-900 break-words" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline break-words" target="_blank" rel="noopener noreferrer" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
              em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
              hr: ({node, ...props}) => <hr className="border-gray-200 my-6" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
