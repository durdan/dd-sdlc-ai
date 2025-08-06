"use client"

import { useState, useEffect,useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MermaidViewerEnhanced } from "@/components/mermaid-viewer-enhanced"
import {
  CheckCircle,
  AlertCircle,
  Sparkles,
  Brain,
  Loader2,
  Eye,
  ArrowRight,
  User,
  Crown,
  Zap,
  Code,
  Palette,
  Github,
  Users,
  Workflow,
  X,
  FileText
} from "lucide-react"

interface AIDiagramModalProps {
  isOpen: boolean
  onClose: () => void
  input: string
}

interface StreamData {
  type: 'progress' | 'chunk' | 'complete' | 'error'
  content?: string
  fullContent?: string
  progress?: number
  message?: string
  error?: string
}

export function AIDiagramModal({ isOpen, onClose, input }: AIDiagramModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [streamedContent, setStreamedContent] = useState("")
  const [fullContent, setFullContent] = useState("")
  const [error, setError] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [generatedDiagrams, setGeneratedDiagrams] = useState<Record<string, string>>({})
  const streamContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (streamContainerRef.current) {
    streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
  }
}, [streamedContent]);
  // Helper function to parse Mermaid diagrams
  const parseMermaidDiagrams = (mermaidContent: string) => {
    if (!mermaidContent) return {}

    console.log('🔍 Parsing Mermaid content:', mermaidContent.substring(0, 200) + '...')
    
    const diagrams: Record<string, string> = {}
    
    // Step 1: Try to find sections with markdown headers
    const headerRegex = /^##\s+([^\n]+?)\s*(?:Diagram)?\s*$/gmi
    const sections: {name: string, content: string}[] = []
    
    let match
    const headerMatches: {title: string, index: number}[] = []
    
    while ((match = headerRegex.exec(mermaidContent)) !== null) {
      headerMatches.push({
        title: match[1].trim(),
        index: match.index
      })
    }
    
    // Extract content between headers
    for (let i = 0; i < headerMatches.length; i++) {
      const current = headerMatches[i]
      const next = headerMatches[i + 1]
      const endIndex = next ? next.index : mermaidContent.length
      
      const sectionContent = mermaidContent.substring(current.index, endIndex)
      
      // Extract code block from section
      const codeBlockMatch = sectionContent.match(/```(?:mermaid)?\s*([\s\S]*?)```/)
      if (codeBlockMatch && codeBlockMatch[1]) {
        const cleanedContent = codeBlockMatch[1].trim()
        if (cleanedContent) {
          // Normalize section name
          const sectionKey = current.title
            .toLowerCase()
            .replace(/\s+diagram\s*$/i, '')
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
          
          sections.push({
            name: sectionKey,
            content: cleanedContent
          })
          
          console.log(`✅ Found section: ${sectionKey} (${cleanedContent.substring(0, 50)}...)`)
        }
      }
    }
    
    // Step 2: If no sections found, try to extract all code blocks
    if (sections.length === 0) {
      console.log('⚠️ No sections found, extracting all code blocks...')
      
      const codeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/g
      let codeMatch
      let index = 1
      
      while ((codeMatch = codeBlockRegex.exec(mermaidContent)) !== null) {
        if (codeMatch[1] && codeMatch[1].trim()) {
          const content = codeMatch[1].trim()
          
          // Try to determine diagram type from content
          let diagramType = 'diagram'
          if (content.includes('graph ') || content.includes('flowchart ')) {
            diagramType = 'architecture'
          } else if (content.includes('erDiagram')) {
            diagramType = 'database'
          } else if (content.includes('journey')) {
            diagramType = 'userflow'
          } else if (content.includes('sequenceDiagram')) {
            diagramType = 'sequence'
          }
          
          sections.push({
            name: index === 1 ? diagramType : `${diagramType}${index}`,
            content: content
          })
          
          console.log(`✅ Found code block ${index}: ${diagramType} (${content.substring(0, 50)}...)`)
          index++
        }
      }
    }
    
    // Step 3: Map sections to expected diagram structure
    const diagramMapping: Record<string, string> = {
      'systemarchitecture': 'architecture',
      'architecture': 'architecture',
      'system': 'architecture',
      'dataflow': 'dataflow',
      'flow': 'dataflow',
      'userjourney': 'userflow',
      'journey': 'userflow',
      'user': 'userflow',
      'databaseschema': 'database',
      'database': 'database',
      'schema': 'database',
      'sequence': 'sequence',
      'api': 'sequence'
    }
    
    // Process each section
    sections.forEach((section, index) => {
      const mappedKey = diagramMapping[section.name] || section.name
      
      // If we already have this type, add a number
      let finalKey = mappedKey
      let counter = 1
      while (diagrams[finalKey]) {
        finalKey = `${mappedKey}${counter}`
        counter++
      }
      
      diagrams[finalKey] = section.content
      console.log(`📊 Added diagram: ${finalKey}`)
    })
    
    // Step 4: Ensure we have at least one diagram
    if (Object.keys(diagrams).length === 0) {
      console.log('⚠️ No diagrams found, creating fallback...')
      
      // Try to find any mermaid syntax in the content
      const mermaidKeywords = ['graph', 'flowchart', 'erDiagram', 'sequenceDiagram', 'journey', 'pie', 'gantt']
      const lines = mermaidContent.split('\n')
      
      for (const line of lines) {
        if (mermaidKeywords.some(keyword => line.includes(keyword))) {
          // Found mermaid syntax, create a fallback diagram
          diagrams['diagram1'] = mermaidContent.replace(/```(?:mermaid)?/g, '').trim()
          console.log('✅ Created fallback diagram from raw content')
          break
        }
      }
    }
    
    console.log('🎯 Final diagrams:', Object.keys(diagrams))
    return diagrams
  }

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter your requirements")
      return
    }

    setIsGenerating(true)
    setError("")
    setProgress(0)
    setMessage("Starting AI analysis...")
    setStreamedContent("")
    setFullContent("")
    setIsComplete(false)
    setGeneratedDiagrams({})

    try {
      const response = await fetch("/api/generate-preview-diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), stream: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate diagrams")
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
                const data: StreamData = JSON.parse(line.substring(6))
                
                if (data.type === 'progress') {
                  setProgress(data.progress || 0)
                  setMessage(data.message || "")
                } else if (data.type === 'chunk') {
                  setStreamedContent(data.fullContent || "")
                  setProgress(data.progress || 0)
                  setMessage(data.message || "")
                } else if (data.type === 'complete') {
                  setFullContent(data.fullContent || "")
                  setProgress(100)
                  setMessage(data.message || "Complete!")
                  setIsComplete(true)
                  
                  // Parse and set diagrams
                  const diagrams = parseMermaidDiagrams(data.fullContent || "")
                  setGeneratedDiagrams(diagrams)
                } else if (data.type === 'error') {
                  setError(data.error || "Failed to generate diagrams")
                  break
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }
    } catch (err) {
      setError("Failed to generate diagrams. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-start generation when modal opens
  useEffect(() => {
    if (isOpen && input.trim()) {
      handleGenerate()
    }
  }, [isOpen, input])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsGenerating(false)
      setProgress(0)
      setMessage("")
      setStreamedContent("")
      setFullContent("")
      setError("")
      setIsComplete(false)
      setGeneratedDiagrams({})
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={isGenerating ? undefined : onClose}>
      <DialogContent className="max-w-6xl w-[95vw] sm:w-full max-h-[90vh] overflow-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-xl text-white">AI Architecture Generator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Watch as AI analyzes your requirements and generates professional diagrams
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
              title={isGenerating ? "Please wait for generation to complete" : "Close"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-xl" />
            <Card className="relative bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    {isGenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    ) : isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : error ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    )}
                    {isComplete ? "Generation Complete!" : isGenerating ? "Generating..." : error ? "Error" : "Ready"}
                  </CardTitle>
                  <Badge variant="outline" className="text-blue-400 border-blue-400 bg-blue-500/10">
                    {progress}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{message}</span>
                    <span className="text-blue-400">{progress}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Streaming Content Preview */}
                {streamedContent && (
  <div
    className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 max-h-32 overflow-y-auto"
    ref={streamContainerRef}
  >
    <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
      {streamedContent}
      {isGenerating && <span className="animate-pulse text-blue-400">|</span>}
    </div>
  </div>
)}

                {/* Generation in Progress Notice */}
                {isGenerating && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
                    <Alert className="relative bg-blue-900/20 border-blue-800/30 text-blue-300 backdrop-blur-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Generation in progress... Please wait for completion. The window will remain open until finished.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 blur-xl" />
                    <Alert className="relative bg-red-900/20 border-red-800/30 text-red-300 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Diagrams */}
          {isComplete && Object.keys(generatedDiagrams).length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />
                <Card className="relative bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Eye className="h-5 w-5 text-green-400" />
                      Generated Architecture Diagrams
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Professional system architecture visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MermaidViewerEnhanced
                      diagrams={generatedDiagrams}
                      title="System Architecture Preview"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Signup Encouragement Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl" />
                <Card className="relative bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Crown className="h-5 w-5 text-yellow-400" />
                      Want the Complete SDLC Documentation?
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      This is just a preview! Sign up to get complete business analysis, functional specs, technical requirements, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Business Analysis</p>
                          <p className="text-xs text-gray-400">Complete stakeholder requirements</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <Code className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Technical Specs</p>
                          <p className="text-xs text-gray-400">Architecture & implementation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <Palette className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-white">UX Design</p>
                          <p className="text-xs text-gray-400">User experience guidelines</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <Github className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Project Management</p>
                          <p className="text-xs text-gray-400">JIRA & GitHub integration</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        onClick={() => window.location.href = '/signin?source=diagram-preview'}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign Up for Complete Documentation
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Upgrade Prompt */}
          {/* {isComplete && (
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-800/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Ready for the Complete SDLC Suite?
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  This is just a preview! Get comprehensive documentation with full AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">Business Analysis</span>
                      <p className="text-xs text-gray-400">AI-powered stakeholder analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Code className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">Technical Specs</span>
                      <p className="text-xs text-gray-400">Complete system architecture</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Palette className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">UX Guidelines</span>
                      <p className="text-xs text-gray-400">User experience blueprints</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Github className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">GitHub Integration</span>
                      <p className="text-xs text-gray-400">Automated project setup</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-green-400" />
                    <span className="text-lg font-bold text-white">Start Your Free Trial</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      No Credit Card Required
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => window.location.href = '/signin'}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
                      size="lg"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Building with AI
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/signin'}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      size="lg"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign Up Free
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  )
} 