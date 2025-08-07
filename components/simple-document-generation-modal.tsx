"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  FileCode,
  Code,
  Palette,
  Database,
  Sparkles,
  Copy,
  Check,
  Download,
  Loader2,
  Brain,
  TestTube,
  GitBranch,
  BookOpen,
  Building,
  Lock
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MermaidViewerEnhanced } from "@/components/mermaid-viewer-enhanced"
import { anonymousProjectService } from "@/lib/anonymous-project-service"
import { parseMermaidDiagrams, extractAndFixMermaidDiagrams } from "@/lib/mermaid-parser"
import { rateLimitService } from "@/lib/rate-limit-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface SimpleDocumentGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  input: string
  onDocumentGenerated?: (documents: Record<string, string>) => void
}

interface DocumentType {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

const documentTypes: DocumentType[] = [
  { 
    id: "business", 
    name: "Business Analysis", 
    icon: Brain, 
    description: "Executive summaries, stakeholder analysis, risk assessment",
    color: "text-blue-600"
  },
  { 
    id: "functional", 
    name: "Functional Spec", 
    icon: FileText, 
    description: "User stories, use cases, data requirements",
    color: "text-purple-600"
  },
  { 
    id: "technical", 
    name: "Technical Spec", 
    icon: Code, 
    description: "System architecture, API design, deployment strategy",
    color: "text-green-600"
  },
  { 
    id: "ux", 
    name: "UX Design", 
    icon: Palette, 
    description: "User personas, journey maps, wireframe descriptions",
    color: "text-pink-600"
  },
  { 
    id: "mermaid", 
    name: "Architecture Diagrams", 
    icon: Database, 
    description: "Visual system architecture and flow diagrams",
    color: "text-orange-600"
  }
]

export function SimpleDocumentGenerationModal({
  isOpen,
  onClose,
  input,
  onDocumentGenerated,
}: SimpleDocumentGenerationModalProps) {
  // Initialize with stored type or default to business
  const [selectedType, setSelectedType] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedType = localStorage.getItem('selectedDocType')
      console.log('📋 Retrieved selectedDocType from localStorage:', storedType)
      return storedType || "business"
    }
    return "business"
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const streamContainerRef = useRef<HTMLDivElement>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [previousDocuments, setPreviousDocuments] = useState<Record<string, string>>({})
  const [viewingPreviousDoc, setViewingPreviousDoc] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number
    total: number
    resetAt: Date
  } | null>(null)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  
  // Check rate limit when modal opens or after generation
  const checkRateLimit = async () => {
    try {
      const sessionId = anonymousProjectService.getSessionId()
      const response = await fetch('/api/rate-limit/check', {
        headers: {
          'x-session-id': sessionId
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.status) {
          setRateLimitStatus({
            remaining: data.status.remaining,
            total: data.status.total,
            resetAt: new Date(data.resetAt)
          })
        }
        
        if (!data.allowed) {
          setRateLimitError(data.reason || 'Rate limit exceeded')
        } else {
          setRateLimitError(null)
        }
      }
    } catch (error) {
      console.error('Failed to check rate limit:', error)
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      checkRateLimit()
    }
  }, [isOpen])

  // Update selectedType when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedType = localStorage.getItem('selectedDocType')
      if (storedType && storedType !== selectedType) {
        console.log('🔄 Updating selectedType from localStorage:', storedType)
        setSelectedType(storedType)
      }
      
      // Load any previously generated documents for this session
      const savedDocs = localStorage.getItem('sdlc_generated_docs')
      if (savedDocs) {
        try {
          const docs = JSON.parse(savedDocs)
          setPreviousDocuments(docs)
          // If we have a previous document for the selected type, show it
          if (docs[selectedType]) {
            setGeneratedContent(docs[selectedType])
            setHasGenerated(true)
            setViewingPreviousDoc(true)
          }
        } catch (e) {
          console.error('Error loading previous documents:', e)
        }
      }
    } else {
      // Clean up after modal closes
      localStorage.removeItem('selectedDocType')
    }
  }, [isOpen])

  // Auto-start generation when modal opens (only if no previous doc exists)
  useEffect(() => {
    // Only auto-generate if:
    // 1. Modal is open
    // 2. Not currently generating
    // 3. No content already generated/loaded
    // 4. Input exists
    // 5. Selected type is set
    // 6. No previous document for this type
    // 7. Not viewing a previous document
    if (isOpen && !isGenerating && !generatedContent && !viewingPreviousDoc && input.trim() && selectedType && !previousDocuments[selectedType]) {
      console.log('🚀 Auto-starting generation for type:', selectedType)
      // Check rate limit before auto-generating
      if (rateLimitStatus && rateLimitStatus.remaining > 0 && !rateLimitError) {
        const timer = setTimeout(() => {
          handleGenerate()
        }, 800) // Increased delay to ensure selectedType is set
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, input, selectedType, viewingPreviousDoc, rateLimitStatus])
  
  // Auto-scroll streaming content
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight
    }
  }, [streamedContent])

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter project details before generating")
      return
    }

    // Check rate limit before generating
    if (rateLimitStatus && rateLimitStatus.remaining === 0) {
      setRateLimitError("You've reached your daily limit. Sign in for unlimited access!")
      return
    }

    console.log('🎯 Generating document type:', selectedType)
    console.log('📝 Input:', input)
    console.log('📋 Current localStorage selectedDocType:', localStorage.getItem('selectedDocType'))

    setIsGenerating(true)
    setStreamedContent("")
    setGeneratedContent("")
    setError(null)

    try {
      console.log('📤 Sending request with documentType:', selectedType)
      const requestBody = {
        input,
        documentType: selectedType,
        userId: 'anonymous',
      }
      console.log('📤 Full request body:', requestBody)
      
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate document: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // Keep the last line in the buffer if it's incomplete
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim()
            
            // Skip empty data or [DONE] messages
            if (!jsonStr || jsonStr === '[DONE]') continue
            
            try {
              const data = JSON.parse(jsonStr)
              
              if (data.type === 'chunk') {
                setStreamedContent(prev => prev + data.content)
              } else if (data.type === 'complete') {
                setGeneratedContent(data.fullContent)
                setStreamedContent("")
                setHasGenerated(true)
                setViewingPreviousDoc(false)
                // Save to local storage for this session
                const updatedDocs = { ...previousDocuments, [selectedType]: data.fullContent }
                setPreviousDocuments(updatedDocs)
                localStorage.setItem('sdlc_generated_docs', JSON.stringify(updatedDocs))
                // Notify parent component if callback provided
                if (onDocumentGenerated) {
                  onDocumentGenerated(updatedDocs)
                }
                // Save anonymous project
                await saveAnonymousProject(data.fullContent)
                // Refresh rate limit status after generation
                await checkRateLimit()
              } else if (data.type === 'error') {
                throw new Error(data.error)
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Line:', jsonStr)
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveAnonymousProject = async (content: string) => {
    console.log('🚀 Starting to save anonymous project...')
    console.log('Document type:', selectedType)
    console.log('Input:', input.substring(0, 100))
    
    try {
      let contentToSave = content
      
      // If it's a mermaid document, save the fixed version
      if (selectedType === 'mermaid') {
        const { diagrams, fixedContent } = extractAndFixMermaidDiagrams(content)
        if (Object.keys(diagrams).length > 0 && fixedContent !== content) {
          contentToSave = fixedContent
          console.log('💾 Saving fixed Mermaid diagrams')
        }
      }
      
      const documents = {
        [selectedType]: contentToSave
      }
      
      const projectId = await anonymousProjectService.saveAnonymousProject(
        input.substring(0, 100), // Use first 100 chars as title
        input,
        documents
      )
      
      if (projectId) {
        console.log('✅ Anonymous project saved with ID:', projectId)
      } else {
        console.log('⚠️ No project ID returned from save function')
      }
    } catch (error) {
      console.error('❌ Error saving anonymous project:', error)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent || streamedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const content = generatedContent || streamedContent
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedType}-specification.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }



  const renderContent = () => {
    const content = generatedContent || streamedContent
    console.log('🎨 Rendering content for type:', selectedType)
    console.log('📄 Content length:', content?.length)
    console.log('✅ Has generated content:', !!generatedContent)
    console.log('📝 Has streamed content:', !!streamedContent)

    if (selectedType === 'mermaid') {
      // For Mermaid diagrams, only render after generation is complete to avoid syntax errors
      if (isGenerating) {
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Generating Architecture Diagrams...</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please wait while we create your Mermaid diagrams. They will be rendered once generation is complete.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Show streaming preview in a code block */}
            {streamedContent && (
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto max-h-96">
                <div className="text-xs text-gray-400 mb-2">Streaming preview:</div>
                <pre className="text-sm font-mono whitespace-pre-wrap">{streamedContent}</pre>
              </div>
            )}
          </div>
        )
      }
      
      // Only parse and render when we have the complete content
      if (generatedContent) {
        const diagrams = parseMermaidDiagrams(generatedContent)
        return (
          <div className="space-y-4">
            {Object.keys(diagrams).length > 0 ? (
              <>
                <div className="mb-4 p-2 bg-green-50 text-green-800 rounded text-sm">
                  ✅ Found {Object.keys(diagrams).length} diagrams. Rendering...
                </div>
                {/* Check if any diagrams were fixed */}
                {(() => {
                  const { diagrams: originalParsed, fixedContent: fixed } = extractAndFixMermaidDiagrams(generatedContent)
                  if (fixed !== generatedContent) {
                    const fixedCount = Object.keys(originalParsed).length
                    return (
                      <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded text-sm flex items-center gap-2">
                        <span>🔧</span>
                        <span>Fixed {fixedCount} diagram{fixedCount > 1 ? 's' : ''} with syntax issues</span>
                      </div>
                    )
                  }
                  return null
                })()}
                <MermaidViewerEnhanced 
                  diagrams={diagrams} 
                  title="Architecture Diagrams"
                />
              </>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No valid Mermaid diagrams found in the generated content. 
                    The content should contain code blocks with ```mermaid syntax.
                  </p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedContent}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )
      }
      
      // No content yet
      return (
        <div className="text-center text-gray-500 py-8">
          No diagrams generated yet
        </div>
      )
    }

    return (
      <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => <h1 className="text-lg sm:text-2xl font-bold mt-4 sm:mt-6 mb-2 sm:mb-4">{children}</h1>,
            h2: ({children}) => <h2 className="text-base sm:text-xl font-semibold mt-3 sm:mt-5 mb-2 sm:mb-3">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm sm:text-lg font-medium mt-2 sm:mt-4 mb-1 sm:mb-2">{children}</h3>,
            ul: ({children}) => <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-base">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-base">{children}</ol>,
            li: ({children}) => <li className="text-gray-700">{children}</li>,
            p: ({children}) => <p className="mb-2 sm:mb-3 leading-relaxed text-xs sm:text-base">{children}</p>,
            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
          }}
        >
          {content || (isGenerating ? "" : "Click generate to create your document")}
        </ReactMarkdown>
      </div>
    )
  }

  const selectedDoc = documentTypes.find(doc => doc.id === selectedType)
  const Icon = selectedDoc?.icon || FileText

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing if not generating
      if (!isGenerating && !open) {
        onClose()
      }
    }}>
      <DialogContent 
        className="w-full sm:max-w-5xl h-screen sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col rounded-none sm:rounded-lg m-0 sm:m-4"
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click during generation
          if (isGenerating) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on Escape during generation
          if (isGenerating) {
            e.preventDefault()
          }
        }}
      >
        {/* Minimal header on mobile, normal on desktop */}
        <DialogHeader className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-4 border-b sm:border-b">
          <div className="sm:hidden flex items-center justify-between">
            {/* Mobile: Just title and close in header */}
            <DialogTitle className="text-sm font-medium">SDLC Docs</DialogTitle>
            <div className="flex items-center gap-2">
              {rateLimitStatus && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  {Math.max(0, rateLimitStatus.remaining)} left
                </Badge>
              )}
            </div>
          </div>
          {/* Desktop: Full header */}
          <div className="hidden sm:flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">SDLC Documentation</DialogTitle>
              <DialogDescription className="text-sm">
                Choose a document type to generate. Non-logged-in users can generate up to 10 documents.
              </DialogDescription>
            </div>
            {rateLimitStatus && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  {Math.max(0, rateLimitStatus.remaining)}/{rateLimitStatus.total} documents remaining
                </div>
                <Progress 
                  value={Math.min(100, (rateLimitStatus.total - Math.max(0, rateLimitStatus.remaining)) / rateLimitStatus.total * 100)} 
                  className="w-32 h-2 mt-1"
                />
                {rateLimitStatus.remaining <= 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Resets {new Date(rateLimitStatus.resetAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-1 sm:space-y-4 px-3 sm:px-6 py-1 sm:py-4">
          {/* Show rate limit error */}
          {rateLimitError && (
            <Alert className="flex-shrink-0 border-red-200 bg-red-50">
              <Lock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-medium mb-1">{rateLimitError}</div>
                <div className="text-sm">
                  Sign in for unlimited document generation and to save your work.
                </div>
                <Button
                  size="sm"
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.location.href = '/signin'}
                >
                  Sign in to Continue
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Document Type Selection - Horizontal scroll on mobile */}
          <div className="flex-shrink-0">
            <Tabs value={selectedType} onValueChange={(value) => {
              if (!isGenerating) {
                console.log('Tab changed to:', value)
                setSelectedType(value)
                // Check if we have a previous document for this type
                if (previousDocuments[value]) {
                  console.log('Loading previous document for:', value)
                  setGeneratedContent(previousDocuments[value])
                  setHasGenerated(true)
                  setViewingPreviousDoc(true)
                } else {
                  console.log('No previous document for:', value)
                  setGeneratedContent('')
                  setHasGenerated(false)
                  setViewingPreviousDoc(false)
                  // Don't auto-generate, wait for user action
                }
              }
            }}>
              {/* Mobile: Horizontal scrollable tabs */}
              <TabsList className="sm:hidden flex w-full h-auto overflow-x-auto scrollbar-hide bg-gray-50 p-1 rounded-lg">
                {documentTypes.map((doc) => (
                  <TabsTrigger 
                    key={doc.id} 
                    value={doc.id}
                    disabled={isGenerating}
                    className={`flex-shrink-0 flex items-center gap-1 h-auto py-1.5 px-2.5 whitespace-nowrap relative ${
                      isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <doc.icon className={`h-3.5 w-3.5 ${doc.color}`} />
                    <span className="text-[11px] font-medium">{doc.name}</span>
                    {previousDocuments[doc.id] && (
                      <Check className="h-2.5 w-2.5 text-green-600 ml-0.5" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* Desktop: Grid tabs */}
              <TabsList className="hidden sm:grid grid-cols-5 w-full h-auto">
                {documentTypes.map((doc) => (
                  <TabsTrigger 
                    key={doc.id} 
                    value={doc.id}
                    disabled={isGenerating}
                    className={`flex flex-col items-center gap-1 h-auto py-2 px-2 relative ${
                      isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <doc.icon className={`h-4 w-4 ${doc.color}`} />
                    <span className="text-xs leading-tight text-center">{doc.name}</span>
                    {previousDocuments[doc.id] && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-green-500">
                        <Check className="h-3 w-3 text-white" />
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>


          </div>

          {/* Terminal-like Streaming Preview (if generating) - Smaller on mobile */}
          {isGenerating && (
            <div className="flex-shrink-0 bg-black border border-gray-700 rounded-lg p-2 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 font-mono">SDLC.dev AI Generation</span>
              </div>
              <div ref={streamContainerRef} className="h-20 sm:h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="text-xs font-mono">
                  <div>
                    <span className="text-gray-500">$ </span>
                    <span className="text-white">Analyzing requirements...</span>
                  </div>
                  <div>
                    <span className="text-gray-500">$ </span>
                    <span className="text-white">Generating {selectedDoc?.name}...</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">$ </span>
                    <span className="text-green-400">Streaming response:</span>
                  </div>
                  {streamedContent && (
                    <div className="mt-1 pl-4 text-green-400 whitespace-pre-wrap break-words">
                      {streamedContent}
                      <span className="animate-pulse">█</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Generated Content - Full screen on mobile */}
          <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3 sm:p-6">
            {viewingPreviousDoc && !isGenerating && (
              <div className="mb-2 sm:mb-4 p-1.5 sm:p-3 bg-green-50 border border-green-200 rounded-md sm:rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-[10px] sm:text-sm text-green-800 font-medium">Saved</span>
                </div>
                {rateLimitStatus && rateLimitStatus.remaining > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      setViewingPreviousDoc(false)
                      setGeneratedContent('')
                      setHasGenerated(false)
                      await checkRateLimit() // Update rate limit before regeneration
                      handleGenerate()
                    }}
                    disabled={isGenerating || rateLimitStatus?.remaining === 0}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                )}
              </div>
            )}
            {!generatedContent && !streamedContent && !isGenerating && !viewingPreviousDoc && (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] sm:min-h-[300px] text-center">
                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Ready to Generate {selectedDoc?.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Click the button below to create your document</p>
                    {rateLimitStatus && rateLimitStatus.remaining > 0 ? (
                      <Button
                        onClick={handleGenerate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isGenerating || !input.trim()}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate {selectedDoc?.name}
                      </Button>
                    ) : (
                      <div className="text-sm text-red-600">
                        {rateLimitError || 'Rate limit reached. Please sign in for unlimited access.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {(generatedContent || streamedContent || isGenerating) && renderContent()}
          </div>
        </div>

        {/* Footer Actions - Compact on mobile */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 sm:py-4 border-t">
          <div className="flex items-center gap-1 sm:gap-2">
            {(generatedContent || streamedContent) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isGenerating}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </>
            )}
            {/* Status indicator for what's happening - Hidden on mobile */}
            {viewingPreviousDoc && (
              <span className="hidden sm:inline text-sm text-green-600 font-medium">
                Viewing saved document
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isGenerating && (
              <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Generating {selectedDoc?.name}...</span>
                <span className="sm:hidden">Generating...</span>
              </span>
            )}
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isGenerating}
              size="sm"
              className="text-xs sm:text-sm px-3 sm:px-4"
            >
              {isGenerating ? 'Wait...' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}