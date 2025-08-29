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
  Lock,
  FlaskConical,
  Users,
  MessageSquare
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MermaidViewerEnhanced } from "@/components/mermaid-viewer-enhanced"
import { anonymousProjectService } from "@/lib/anonymous-project-service"
import { parseMermaidDiagramsWithSections, extractAndFixMermaidDiagrams } from "@/lib/mermaid-parser-enhanced"
import { rateLimitService } from "@/lib/rate-limit-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DocumentTabButton } from "@/components/document-tab-button"
import { TechSpecTabButton } from "@/components/tech-spec-tab-button"
import { Settings } from "lucide-react"
import { SectionGenerationProgress } from "@/components/section-generation-progress"
import { ExpandableSectionViewer } from "@/components/expandable-section-viewer"
import { EnhancedDocumentRenderer } from "@/components/enhanced-document-renderer"
import { businessAnalysisSections } from "@/lib/business-analysis-sections"
import { techSpecSections } from "@/lib/tech-spec-sections"
import { uxDesignSections } from "@/lib/ux-design-sections"
import { architectureSections } from "@/lib/architecture-sections"
import { functionalSpecSections } from "@/lib/functional-spec-sections"
import { testSpecSections } from "@/lib/test-spec-sections"
import { codingPromptSections } from "@/lib/coding-prompt-sections"
import { meetingTranscriptSections } from "@/lib/meeting-transcript-sections"

interface SimpleDocumentGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  input: string
  onDocumentGenerated?: (documents: Record<string, string>) => void
  initialDocType?: string
  initialContent?: string
  showPreviousDocs?: boolean  // New prop to control whether to show previous docs
  initialSelectedSections?: string[]  // Pre-selected sections from parent
  autoGenerate?: boolean  // Auto-trigger generation when opened
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
  },
  { 
    id: "coding", 
    name: "AI Coding Prompt", 
    icon: Sparkles, 
    description: "AI-powered coding instructions and implementation guidelines",
    color: "text-indigo-600"
  },
  { 
    id: "test", 
    name: "Test Spec", 
    icon: FlaskConical, 
    description: "TDD/BDD test specifications and test cases",
    color: "text-emerald-600"
  },
  { 
    id: "meeting", 
    name: "Meeting Transcript", 
    icon: Users, 
    description: "Meeting summaries, action items, and decisions",
    color: "text-purple-600"
  }
]

export function SimpleDocumentGenerationModal({
  isOpen,
  onClose,
  input,
  onDocumentGenerated,
  initialDocType,
  initialContent,
  showPreviousDocs = false,
  initialSelectedSections = [],
  autoGenerate = false,
}: SimpleDocumentGenerationModalProps) {
  console.log('🎨 Modal mounted with initialDocType:', initialDocType)
  console.log('📝 Modal input:', input?.substring(0, 50))
  
  // Initialize with initialDocType prop, then stored type, then default to business
  const [selectedType, setSelectedType] = useState<string>(() => {
    if (initialDocType) {
      console.log('📋 Using initialDocType prop:', initialDocType)
      return initialDocType
    }
    // Always check localStorage for the selected type, not just when showPreviousDocs is true
    if (typeof window !== 'undefined') {
      const storedType = localStorage.getItem('selectedDocType')
      console.log('📋 Retrieved selectedDocType from localStorage:', storedType)
      if (storedType) {
        return storedType
      }
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
  
  // State for tracking section generation progress
  const [sectionProgress, setSectionProgress] = useState<{
    [sectionId: string]: {
      status: 'pending' | 'generating' | 'completed' | 'error'
      content?: string
      error?: string
    }
  }>({})
  const [currentGeneratingSection, setCurrentGeneratingSection] = useState<string | null>(null)
  
  const [selectedTechSpecSections, setSelectedTechSpecSections] = useState<string[]>(() => {
    // First check if initial sections are provided and selectedType is technical
    if (initialSelectedSections.length > 0 && initialDocType === 'technical') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const storedSections = localStorage.getItem('techSpecSections')
      if (storedSections) {
        try {
          return JSON.parse(storedSections)
        } catch (e) {
          console.error('Error parsing tech spec sections:', e)
        }
      }
    }
    return []
  })
  
  // State for other document type sections
  const [selectedBusinessSections, setSelectedBusinessSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'business') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('businessSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  const [selectedUXSections, setSelectedUXSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'ux') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('uxSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  const [selectedArchitectureSections, setSelectedArchitectureSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'mermaid') {
      console.log('🏗️ Initializing architecture sections from props:', initialSelectedSections)
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      // Check both possible keys for backwards compatibility
      const stored = localStorage.getItem('mermaidSections') || localStorage.getItem('architectureSections')
      console.log('🔍 Loading architecture sections from localStorage:', stored)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('📝 Parsed architecture sections:', parsed)
        return parsed
      }
      return []
    }
    return []
  })
  
  const [selectedFunctionalSections, setSelectedFunctionalSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'functional') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('functionalSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  const [selectedTestSections, setSelectedTestSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'test') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('testSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  const [selectedCodingSections, setSelectedCodingSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'coding') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('codingSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  const [selectedMeetingSections, setSelectedMeetingSections] = useState<string[]>(() => {
    if (initialSelectedSections.length > 0 && initialDocType === 'meeting') {
      return initialSelectedSections
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('meetingSections')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })
  
  // Map section details for progress display
  const sectionDetailsMap = {
    business: businessAnalysisSections,
    technical: techSpecSections,
    ux: uxDesignSections,
    mermaid: architectureSections,
    functional: functionalSpecSections,
    test: testSpecSections,
    coding: codingPromptSections,
    meeting: meetingTranscriptSections
  }
  
  // Get selected sections for current document type
  const getSelectedSections = () => {
    switch (selectedType) {
      case 'business':
        return selectedBusinessSections
      case 'technical':
        return selectedTechSpecSections
      case 'ux':
        return selectedUXSections
      case 'mermaid':
        return selectedArchitectureSections
      case 'functional':
        return selectedFunctionalSections
      case 'test':
        return selectedTestSections
      case 'coding':
        return selectedCodingSections
      case 'meeting':
        return selectedMeetingSections
      default:
        return []
    }
  }
  
  // Get current sections based on selected document type
  const currentSections = getSelectedSections()
  const currentSectionDetails = sectionDetailsMap[selectedType as keyof typeof sectionDetailsMap] || {}
  
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
      // Use initialDocType if provided, otherwise check localStorage
      if (initialDocType && initialDocType !== selectedType) {
        console.log('🔄 Setting selectedType from prop:', initialDocType)
        setSelectedType(initialDocType)
        
        // Also update the corresponding sections when document type changes
        if (initialSelectedSections.length > 0) {
          console.log('📝 Setting initial sections for', initialDocType, ':', initialSelectedSections)
          switch(initialDocType) {
            case 'business':
              setSelectedBusinessSections(initialSelectedSections)
              break
            case 'technical':
              setSelectedTechSpecSections(initialSelectedSections)
              break
            case 'functional':
              setSelectedFunctionalSections(initialSelectedSections)
              break
            case 'ux':
              setSelectedUXSections(initialSelectedSections)
              break
            case 'mermaid':
              setSelectedArchitectureSections(initialSelectedSections)
              break
            case 'test':
              setSelectedTestSections(initialSelectedSections)
              break
            case 'coding':
              setSelectedCodingSections(initialSelectedSections)
              break
            case 'meeting':
              setSelectedMeetingSections(initialSelectedSections)
              break
          }
        }
      } else if (!initialDocType && showPreviousDocs) {
        const storedType = localStorage.getItem('selectedDocType')
        if (storedType && storedType !== selectedType) {
          console.log('🔄 Updating selectedType from localStorage:', storedType)
          setSelectedType(storedType)
        }
      }
      
      // If initialContent is provided, display it immediately
      if (initialContent) {
        console.log('📄 Loading initial content for viewing')
        setGeneratedContent(initialContent)
        setHasGenerated(true)
        setViewingPreviousDoc(true)
        // Don't load other docs when viewing specific content
        return
      }
      
      // Only load previous documents if showPreviousDocs is true
      if (showPreviousDocs) {
        // Load from document history and filter by current input
        const historyKey = 'sdlc_document_history'
        const storedHistory = localStorage.getItem(historyKey)
        
        if (storedHistory) {
          try {
            const history = JSON.parse(storedHistory)
            // Filter documents by current input
            const relevantDocs: Record<string, any> = {}
            const relevantSections: Record<string, any> = {}
            const relevantSectionData: Record<string, any> = {}
            
            history.forEach((doc: any) => {
              // Only include documents that match the current input
              if (doc.input === input && doc.content) {
                // Only keep the most recent document for each type
                if (!relevantDocs[doc.type]) {
                  relevantDocs[doc.type] = doc.content
                  if (doc.sections) {
                    relevantSections[doc.type] = doc.sections
                  }
                  // Store individual section data if available
                  if (doc.sectionData) {
                    relevantSectionData[doc.type] = doc.sectionData
                  }
                }
              }
            })
            
            setPreviousDocuments(relevantDocs)
            console.log('📚 Loaded documents for input:', input, Object.keys(relevantDocs))
            
            // If we have a previous document for the selected type, show it
            if (relevantDocs[selectedType]) {
              setGeneratedContent(relevantDocs[selectedType])
              setHasGenerated(true)
              setViewingPreviousDoc(true)
              
              // Restore section progress - use stored section data if available, otherwise fallback to extraction
              if (relevantSectionData[selectedType]) {
                // Use directly stored section data (new format)
                const storedSectionData = relevantSectionData[selectedType]
                const restoredProgress: Record<string, any> = {}
                
                Object.keys(storedSectionData).forEach(sectionId => {
                  const sectionData = storedSectionData[sectionId]
                  restoredProgress[sectionId] = {
                    status: 'completed',
                    content: sectionData.content || ''
                  }
                })
                
                setSectionProgress(restoredProgress)
                console.log(`📚 Restored ${Object.keys(restoredProgress).length} sections for ${selectedType} using stored section data`)
              } else if (relevantSections[selectedType]) {
                // Fallback to content extraction for legacy documents
                const sections = relevantSections[selectedType]
                const restoredProgress: Record<string, any> = {}
                
                // Get section details to extract content properly
                const sectionDetails = sectionDetailsMap[selectedType as keyof typeof sectionDetailsMap] || {}
                
                sections.forEach((sectionId: string) => {
                  // Extract the section content from the full document
                  const sectionInfo = sectionDetails[sectionId]
                  const sectionName = sectionInfo?.name || sectionId
                  
                  console.log(`📦 Processing section: ${sectionId} with name: "${sectionName}" (legacy extraction)`)
                  
                  const sectionContent = extractSectionContent(
                    relevantDocs[selectedType], 
                    sectionName
                  )
                  
                  console.log(`✅ Extracted content length: ${sectionContent?.length || 0}`)
                  
                  restoredProgress[sectionId] = { 
                    status: 'completed', 
                    content: sectionContent || '' 
                  }
                })
                setSectionProgress(restoredProgress)
                console.log(`📚 Restored ${sections.length} sections for ${selectedType} using content extraction (legacy)`)
              }
            }
          } catch (e) {
            console.error('Error loading previous documents:', e)
          }
        }
      } else {
        // Clear any previous content when not showing previous docs
        setGeneratedContent("")
        setHasGenerated(false)
        setViewingPreviousDoc(false)
        setSectionProgress({})
        setPreviousDocuments({})
      }
      
      // Load section metadata if available
      // BUT only if we don't have fresh selections from initialSelectedSections
      // This ensures that section selections are preserved when viewing previously generated documents
      // but doesn't override new selections from the parent component
      const shouldLoadSavedMetadata = initialSelectedSections.length === 0 && showPreviousDocs
      
      if (shouldLoadSavedMetadata) {
        const savedSectionMetadata = localStorage.getItem('sdlc_section_metadata')
        if (savedSectionMetadata) {
          try {
            const metadata = JSON.parse(savedSectionMetadata)
            console.log('📦 Loading saved section metadata:', metadata)
            
            // Update state and localStorage for each document type
            if (metadata.business) {
              setSelectedBusinessSections(metadata.business)
              localStorage.setItem('businessSections', JSON.stringify(metadata.business))
            }
            if (metadata.functional) {
              setSelectedFunctionalSections(metadata.functional)
              localStorage.setItem('functionalSections', JSON.stringify(metadata.functional))
            }
            if (metadata.technical) {
              setSelectedTechSpecSections(metadata.technical)
              localStorage.setItem('techSpecSections', JSON.stringify(metadata.technical))
            }
            if (metadata.ux) {
              setSelectedUXSections(metadata.ux)
              localStorage.setItem('uxSections', JSON.stringify(metadata.ux))
            }
            if (metadata.mermaid) {
              setSelectedArchitectureSections(metadata.mermaid)
              localStorage.setItem('mermaidSections', JSON.stringify(metadata.mermaid))
              // Also save with the alternative key for backward compatibility
              localStorage.setItem('architectureSections', JSON.stringify(metadata.mermaid))
            }
            console.log('✅ Section metadata restored successfully')
          } catch (e) {
            console.error('Error loading section metadata:', e)
          }
        }
      } else if (initialSelectedSections.length > 0) {
        console.log('🚫 Skipping saved metadata load - using fresh selections:', initialSelectedSections)
      }
    } else {
      // Clean up after modal closes
      localStorage.removeItem('selectedDocType')
    }
  }, [isOpen, initialContent, initialDocType, showPreviousDocs, input, selectedType])
  
  // Ensure sections are properly set when modal opens with initialSelectedSections
  useEffect(() => {
    if (isOpen && initialSelectedSections.length > 0) {
      console.log('🔄 Modal opened with initial sections:', initialSelectedSections, 'for type:', selectedType)
      
      // Set sections based on the current selected type
      switch(selectedType) {
        case 'business':
          if (selectedBusinessSections.length === 0) {
            console.log('💼 Setting business sections:', initialSelectedSections)
            setSelectedBusinessSections(initialSelectedSections)
          }
          break
        case 'technical':
          if (selectedTechSpecSections.length === 0) {
            console.log('🔧 Setting technical sections:', initialSelectedSections)
            setSelectedTechSpecSections(initialSelectedSections)
          }
          break
        case 'functional':
          if (selectedFunctionalSections.length === 0) {
            console.log('📝 Setting functional sections:', initialSelectedSections)
            setSelectedFunctionalSections(initialSelectedSections)
          }
          break
        case 'ux':
          if (selectedUXSections.length === 0) {
            console.log('🎨 Setting UX sections:', initialSelectedSections)
            setSelectedUXSections(initialSelectedSections)
          }
          break
        case 'mermaid':
          if (selectedArchitectureSections.length === 0) {
            console.log('🏗️ Setting architecture/mermaid sections:', initialSelectedSections)
            setSelectedArchitectureSections(initialSelectedSections)
          }
          break
        case 'test':
          if (selectedTestSections.length === 0) {
            console.log('🧪 Setting test sections:', initialSelectedSections)
            setSelectedTestSections(initialSelectedSections)
          }
          break
        case 'coding':
          if (selectedCodingSections.length === 0) {
            console.log('💻 Setting coding sections:', initialSelectedSections)
            setSelectedCodingSections(initialSelectedSections)
          }
          break
        case 'meeting':
          if (selectedMeetingSections.length === 0) {
            console.log('👥 Setting meeting sections:', initialSelectedSections)
            setSelectedMeetingSections(initialSelectedSections)
          }
          break
      }
    }
  }, [isOpen, selectedType, initialSelectedSections])

  // Auto-generate when modal opens with pre-selected sections
  useEffect(() => {
    if (isOpen && autoGenerate && initialSelectedSections.length > 0 && !isGenerating && !hasGenerated) {
      // Only auto-generate if we have sections for the current document type
      // This prevents auto-generating with wrong sections from a different doc type
      const hasValidSections = 
        (selectedType === 'business' && initialSelectedSections.some(s => Object.keys(businessAnalysisSections).includes(s))) ||
        (selectedType === 'technical' && initialSelectedSections.some(s => Object.keys(techSpecSections).includes(s))) ||
        (selectedType === 'functional' && initialSelectedSections.some(s => Object.keys(functionalSpecSections).includes(s))) ||
        (selectedType === 'ux' && initialSelectedSections.some(s => Object.keys(uxDesignSections).includes(s))) ||
        (selectedType === 'mermaid' && initialSelectedSections.some(s => Object.keys(architectureSections).includes(s))) ||
        (selectedType === 'test' && initialSelectedSections.some(s => Object.keys(testSpecSections).includes(s))) ||
        (selectedType === 'coding' && initialSelectedSections.some(s => Object.keys(codingPromptSections).includes(s))) ||
        (selectedType === 'meeting' && initialSelectedSections.some(s => Object.keys(meetingTranscriptSections).includes(s)))
      
      if (!hasValidSections) {
        console.log('⚠️ Skipping auto-generate: sections do not match document type')
        console.log('   Document type:', selectedType)
        console.log('   Initial sections:', initialSelectedSections)
        return
      }
      
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        console.log('🚀 Auto-generating with pre-selected sections:', initialSelectedSections)
        handleGenerate()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoGenerate]) // Only trigger on modal open with autoGenerate flag
  
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
      // Get selected sections for the current document type
      let selectedSections: string[] = []
      let sectionKey = ''
      
      if (selectedType === 'technical' && selectedTechSpecSections.length > 0) {
        selectedSections = selectedTechSpecSections
        sectionKey = 'techSpecSections'
        console.log('🔧 Including tech spec sections:', selectedTechSpecSections)
      } else if (selectedType === 'business' && selectedBusinessSections.length > 0) {
        selectedSections = selectedBusinessSections
        sectionKey = 'businessSections'
        console.log('💼 Including business sections:', selectedBusinessSections)
      } else if (selectedType === 'ux' && selectedUXSections.length > 0) {
        selectedSections = selectedUXSections
        sectionKey = 'uxSections'
        console.log('🎨 Including UX sections:', selectedUXSections)
      } else if (selectedType === 'mermaid' && selectedArchitectureSections.length > 0) {
        selectedSections = selectedArchitectureSections
        sectionKey = 'architectureSections'
        console.log('🏗️ Including architecture sections:', selectedArchitectureSections)
        console.log('🔑 Using section key:', sectionKey)
        console.log('📦 Selected sections array:', selectedSections)
      } else if (selectedType === 'functional' && selectedFunctionalSections.length > 0) {
        selectedSections = selectedFunctionalSections
        sectionKey = 'functionalSections'
        console.log('📋 Including functional sections:', selectedFunctionalSections)
      } else if (selectedType === 'test' && selectedTestSections.length > 0) {
        selectedSections = selectedTestSections
        sectionKey = 'testSections'
        console.log('🧪 Including test sections:', selectedTestSections)
      } else if (selectedType === 'coding' && selectedCodingSections.length > 0) {
        selectedSections = selectedCodingSections
        sectionKey = 'codingSections'
        console.log('💻 Including coding sections:', selectedCodingSections)
      } else if (selectedType === 'meeting' && selectedMeetingSections.length > 0) {
        selectedSections = selectedMeetingSections
        sectionKey = 'meetingSections'
        console.log('👥 Including meeting sections:', selectedMeetingSections)
      }
      
      // If sections are selected, generate them one by one
      if (selectedSections.length > 0) {
        await generateSectionsSequentially(selectedSections, sectionKey)
      } else {
        // No sections selected - use default comprehensive prompt
        console.log('📝 No sections selected - using default comprehensive prompt')
        console.log('🎯 Building request with selectedType:', selectedType)
        const requestBody: any = {
          input,
          documentType: selectedType,
          userId: 'anonymous',
        }
        console.log('📤 Full request body:', JSON.stringify(requestBody, null, 2))
        console.log('📤 Document type being sent:', requestBody.documentType)
        
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
                  
                  // Also save to document history
                  const historyKey = 'sdlc_document_history'
                  const storedHistory = localStorage.getItem(historyKey)
                  const history = storedHistory ? JSON.parse(storedHistory) : []
                  
                  // Collect section data for storage
                  const sectionData: Record<string, { content: string; status: string }> = {}
                  Object.keys(sectionProgress).forEach(sectionId => {
                    const section = sectionProgress[sectionId]
                    if (section.content) {
                      sectionData[sectionId] = {
                        content: section.content,
                        status: section.status
                      }
                    }
                  })

                  const newHistoryEntry = {
                    type: selectedType,
                    content: data.fullContent,
                    input: input,
                    timestamp: Date.now(),
                    sectionData: Object.keys(sectionData).length > 0 ? sectionData : undefined
                  }
                  
                  history.unshift(newHistoryEntry)
                  const trimmedHistory = history.slice(0, 50)
                  localStorage.setItem(historyKey, JSON.stringify(trimmedHistory))
                  
                  console.log('📚 Saved to document history (streaming):', {
                    type: selectedType,
                    historyLength: trimmedHistory.length
                  })
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
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate document')
    } finally {
      setIsGenerating(false)
    }
  }

  // New function to generate sections sequentially
  const generateSectionsSequentially = async (sections: string[], sectionKey: string) => {
    console.log(`🔄 Starting sequential generation for ${sections.length} sections`)
    
    // Clear previous content when starting new generation
    setGeneratedContent('')
    setStreamedContent('')
    
    // Initialize progress tracking
    const initialProgress: typeof sectionProgress = {}
    sections.forEach(sectionId => {
      initialProgress[sectionId] = { status: 'pending' }
    })
    setSectionProgress(initialProgress)
    console.log('📊 Initial progress state:', initialProgress)
    
    let fullContent = ''
    const sectionContents: string[] = []
    
    // Generate each section one by one
    for (let i = 0; i < sections.length; i++) {
      const sectionId = sections[i]
      console.log(`📝 Generating section ${i + 1}/${sections.length}: ${sectionId}`)
      
      // Update progress
      setSectionProgress(prev => {
        const updated = {
          ...prev,
          [sectionId]: { ...prev[sectionId], status: 'generating' }
        }
        console.log(`🔄 Starting section ${sectionId}. Progress:`, updated)
        return updated
      })
      setCurrentGeneratingSection(sectionId)
      
      try {
        // Generate this section only
        const requestBody: any = {
          input,
          documentType: selectedType,
          userId: 'anonymous',
          [sectionKey]: [sectionId] // Send only one section at a time
        }
        
        console.log('📤 Sending request for section:', sectionId)
        console.log('📦 Request body:', requestBody)
        
        const response = await fetch('/api/generate-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`Failed to generate section ${sectionId}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        let buffer = ''
        let sectionContent = ''

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
              
              try {
                const data = JSON.parse(jsonStr)
                
                if (data.type === 'chunk') {
                  sectionContent += data.content
                  // Update streamed content to show current section being generated
                  setStreamedContent(sectionContent)
                  // Also update the section's content in progress
                  setSectionProgress(prev => ({
                    ...prev,
                    [sectionId]: { 
                      status: (prev[sectionId]?.status as 'pending' | 'generating' | 'completed' | 'error') || 'generating',
                      content: sectionContent,
                      error: prev[sectionId]?.error
                    }
                  }))
                } else if (data.type === 'complete') {
                  // Section generation complete
                  sectionContent = data.fullContent || sectionContent
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
        
        // Mark section as completed
        setSectionProgress(prev => {
          const updated = {
            ...prev,
            [sectionId]: { status: 'completed', content: sectionContent }
          }
          console.log(`✅ Section ${sectionId} completed with ${sectionContent.length} chars. Progress:`, updated)
          return updated
        })
        
        // Add section content to full document
        if (i > 0) {
          fullContent += '\n\n---\n\n' // Add separator between sections
        }
        
        // Add section header if not already present in the content
        const sectionInfo = sectionDetailsMap[selectedType as keyof typeof sectionDetailsMap]?.[sectionId]
        const sectionName = sectionInfo?.name || sectionId
        
        // Check if the section content already starts with the section name
        const contentStartsWithName = sectionContent.trim().toLowerCase().startsWith(sectionName.toLowerCase()) ||
                                     sectionContent.trim().startsWith('#') ||
                                     sectionContent.trim().startsWith('**')
        
        if (!contentStartsWithName) {
          // Add section header
          fullContent += `## ${i + 1}. ${sectionName}\n\n`
        }
        
        fullContent += sectionContent
        sectionContents.push(sectionContent)
        
        // Update the displayed content
        setStreamedContent('')  // Clear streamed content as section is complete
        setGeneratedContent(fullContent)
        
      } catch (err) {
        console.error(`Error generating section ${sectionId}:`, err)
        setSectionProgress(prev => ({
          ...prev,
          [sectionId]: { 
            status: 'error', 
            error: err instanceof Error ? err.message : 'Failed to generate section' 
          }
        }))
        // Continue with next section even if one fails
      }
    }
    
    setCurrentGeneratingSection(null)
    setIsGenerating(false)  // Ensure generation is marked as complete
    
    // Save the complete document
    if (fullContent) {
      // Final update to ensure content is set
      setGeneratedContent(fullContent)
      setHasGenerated(true)
      setViewingPreviousDoc(false)
      
      await saveAnonymousProject(fullContent)
      
      // Store in local storage along with section metadata
      const storedDocs = localStorage.getItem('sdlc_generated_docs')
      const docs = storedDocs ? JSON.parse(storedDocs) : {}
      docs[selectedType] = fullContent
      localStorage.setItem('sdlc_generated_docs', JSON.stringify(docs))
      
      // Also save to document history for persistence
      const historyKey = 'sdlc_document_history'
      const storedHistory = localStorage.getItem(historyKey)
      const history = storedHistory ? JSON.parse(storedHistory) : []
      
      // Add new document to history with individual section content
      // This approach stores each section separately, making retrieval much more reliable
      // than trying to extract sections from combined content
      const sectionData: Record<string, { content: string; status: 'pending' | 'generating' | 'completed' | 'error' }> = {}
      Object.keys(sectionProgress).forEach(sectionId => {
        const section = sectionProgress[sectionId]
        if (section.content) {
          sectionData[sectionId] = {
            content: section.content,
            status: section.status as 'pending' | 'generating' | 'completed' | 'error'
          }
        }
      })

      const newHistoryEntry = {
        type: selectedType,
        content: fullContent,
        input: input,
        timestamp: Date.now(),
        sections: currentSections.length > 0 ? currentSections : undefined,
        sectionCount: Object.keys(sectionProgress).length || undefined,
        sectionData: Object.keys(sectionData).length > 0 ? sectionData : undefined
      }
      
      // Add to beginning of history
      history.unshift(newHistoryEntry)
      
      // Keep only last 50 documents in history to avoid localStorage limits
      const trimmedHistory = history.slice(0, 50)
      localStorage.setItem(historyKey, JSON.stringify(trimmedHistory))
      
      console.log('📚 Saved to document history:', {
        type: selectedType,
        historyLength: trimmedHistory.length,
        sectionCount: newHistoryEntry.sectionCount
      })
      
      // Also store section metadata for this document
      const sectionMetadata = {
        business: selectedBusinessSections,
        functional: selectedFunctionalSections,
        technical: selectedTechSpecSections,
        ux: selectedUXSections,
        mermaid: selectedArchitectureSections
      }
      localStorage.setItem('sdlc_section_metadata', JSON.stringify(sectionMetadata))
      
      // Store sections for this specific document type so they persist when switching tabs
      if (currentSections.length > 0) {
        const typeSpecificKey = `sdlc_section_metadata_${selectedType}`
        localStorage.setItem(typeSpecificKey, JSON.stringify(currentSections))
        console.log(`💾 Saved ${currentSections.length} sections for ${selectedType}`)
      }
      
      // Update previous documents
      const updatedDocs = { ...previousDocuments, [selectedType]: fullContent }
      setPreviousDocuments(updatedDocs)
      
      // Notify parent component if callback provided
      if (onDocumentGenerated) {
        onDocumentGenerated(updatedDocs)
      }
      
      // Update rate limit status
      await checkRateLimit()
    }
  }

  // Helper function to extract section content from the full document
  const extractSectionContent = (fullContent: string, sectionName: string): string => {
    console.log(`🔍 extractSectionContent called for: "${sectionName}"`)
    console.log(`📄 Content length: ${fullContent?.length || 0}`)
    
    if (!fullContent) {
      console.log(`⚠️ No content provided for section: ${sectionName}`)
      return ''
    }
    
    // Show first 500 chars of content for debugging
    console.log(`📝 First 500 chars of content:\n${fullContent.substring(0, 500)}`)
    
    // Normalize section name for comparison (remove special chars, convert to lowercase)
    const normalizedSectionName = sectionName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    console.log(`🔍 Normalized section name: "${normalizedSectionName}"`)
    
    // Try to find the section by looking for markdown headers
    const patterns = [
      // Handle "Part X: Section Name" format (most common for our generated docs)
      new RegExp(`^#+\\s*Part\\s+\\d+:\\s*([^\\n]+)`, 'gmi'),
      // Handle standard section headers with numbers
      new RegExp(`^#+\\s*\\d+\\.\\s*([^\\n]+)`, 'gmi'),
      // Handle standard section headers without numbers
      new RegExp(`^#+\\s*([^\\n]+)`, 'gmi'),
      // Handle variations and flexible matching
      new RegExp(`^#+.*?([^\\n]+)`, 'gmi')
    ]
    
    let startIndex = -1
    let foundSectionName = ''
    
    for (const pattern of patterns) {
      const matches = fullContent.matchAll(pattern)
      for (const match of matches) {
        const headerText = match[1]?.trim() || ''
        const normalizedHeader = headerText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
        
        console.log(`🔍 Checking header: "${headerText}" -> normalized: "${normalizedHeader}"`)
        
        // Check if this header contains our section name
        if (normalizedHeader.includes(normalizedSectionName) || normalizedSectionName.includes(normalizedHeader)) {
          startIndex = match.index!
          foundSectionName = headerText
          console.log(`✅ Found section "${sectionName}" in header: "${foundSectionName}"`)
          break
        }
      }
      if (startIndex !== -1) break
    }
    
    if (startIndex === -1) {
      // Section not found, return empty string
      console.log(`⚠️ Section "${sectionName}" not found in content`)
      
      // Log what sections we can find for debugging
      const foundSections = fullContent.match(/^##.*$/gm) || []
      console.log(`📋 Found these section headers:`, foundSections)
      
      // Also look for the section name anywhere in headers
      const allHeaders = fullContent.match(/^#+.*$/gm) || []
      const matchingHeaders = allHeaders.filter(h => {
        const headerText = h.replace(/^#+\s*/, '').trim()
        const normalizedHeader = headerText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
        return normalizedHeader.includes(normalizedSectionName) || normalizedSectionName.includes(normalizedHeader)
      })
      if (matchingHeaders.length > 0) {
        console.log(`🔍 Headers containing "${sectionName}":`, matchingHeaders)
      }
      
      return ''
    }
    
    // Find the next section header (same or higher level)
    const remainingContent = fullContent.substring(startIndex)
    const headerMatch = remainingContent.match(/^(#+)\s*/m)
    const currentLevel = headerMatch ? headerMatch[1].length : 1
    
    // Look for next section of same or higher level
    const nextSectionPattern = new RegExp(`^#{1,${currentLevel}}\\s+`, 'gm')
    const matches = [...remainingContent.matchAll(nextSectionPattern)]
    
    // Skip the first match (current section header)
    const nextMatch = matches[1]
    const endIndex = nextMatch ? startIndex + nextMatch.index! : fullContent.length
    
    const extractedContent = fullContent.substring(startIndex, endIndex).trim()
    console.log(`📄 Extracted ${extractedContent.length} characters for section "${sectionName}"`)
    
    return extractedContent
  }
  
  // Helper function to escape special regex characters
  const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
      
      // Collect selected sections for all document types
      const selectedSectionsData: Record<string, string[]> = {}
      if (selectedBusinessSections.length > 0) {
        selectedSectionsData.business = selectedBusinessSections
      }
      if (selectedTechSpecSections.length > 0) {
        selectedSectionsData.technical = selectedTechSpecSections
      }
      if (selectedUXSections.length > 0) {
        selectedSectionsData.ux = selectedUXSections
      }
      if (selectedArchitectureSections.length > 0) {
        selectedSectionsData.mermaid = selectedArchitectureSections
      }
      if (selectedFunctionalSections.length > 0) {
        selectedSectionsData.functional = selectedFunctionalSections
      }
      
      // Create generation metadata
      const generationMetadata = {
        documentType: selectedType,
        generationType: Object.keys(sectionProgress).length > 0 ? 'sections' : 'full',
        sectionsGenerated: Object.keys(sectionProgress),
        timestamp: new Date().toISOString()
      }
      
      const projectId = await anonymousProjectService.saveAnonymousProject(
        input.substring(0, 100), // Use first 100 chars as title
        input,
        documents,
        undefined, // userAgent
        undefined, // ipAddress
        undefined, // referrer
        selectedSectionsData,
        generationMetadata
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

  // Helper function to check if sections were selected for a document type
  const hasSectionsSelected = (docType: string): boolean => {
    switch (docType) {
      case 'business':
        return selectedBusinessSections.length > 0
      case 'functional':
        return selectedFunctionalSections.length > 0
      case 'technical':
        return selectedTechSpecSections.length > 0
      case 'ux':
        return selectedUXSections.length > 0
      case 'mermaid':
        return selectedArchitectureSections.length > 0
      default:
        return false
    }
  }

  // Helper function to get section count for a document type
  const getSectionCount = (docType: string): number => {
    switch (docType) {
      case 'business':
        return selectedBusinessSections.length
      case 'functional':
        return selectedFunctionalSections.length
      case 'technical':
        return selectedTechSpecSections.length
      case 'ux':
        return selectedUXSections.length
      case 'mermaid':
        return selectedArchitectureSections.length
      default:
        return 0
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
    
    // For section generation, use the ExpandableSectionViewer component
    const sectionIds = Object.keys(sectionProgress)
    const hasSelectedSections = currentSections.length > 0
    
    // Show ExpandableSectionViewer for section-based generation (during and after generation)
    // Keep showing the expandable viewer even after generation completes if sections were generated
    // Also show it when viewing previous docs that have sections
    // But for mermaid documents, always use MermaidViewerEnhanced instead
    if (selectedType !== 'mermaid' && (sectionIds.length > 0 || (isGenerating && hasSelectedSections) || (hasGenerated && sectionIds.length > 0) || (viewingPreviousDoc && sectionIds.length > 0))) {
      // Transform section progress into the format expected by ExpandableSectionViewer
      const sections = sectionIds.map(sectionId => {
        const status = sectionProgress[sectionId]
        const sectionInfo = currentSectionDetails[sectionId]
        
        // For the currently generating section, use the streamed content
        // For completed sections, use their stored content from sectionProgress
        let sectionContent = status.content || undefined
        
        if (sectionId === currentGeneratingSection && streamedContent) {
          sectionContent = streamedContent
        }
        
        // If we still don't have content but generation is complete, try to extract it
        if (!sectionContent && !isGenerating && generatedContent) {
          sectionContent = extractSectionContent(generatedContent, sectionInfo?.name || sectionId)
        }
        
        return {
          id: sectionId,
          name: sectionInfo?.name || sectionId,
          icon: sectionInfo?.icon,
          description: sectionInfo?.description,
          content: sectionContent || '',
          status: (!isGenerating && status.status === 'completed') ? 'completed' as const : status.status,
          error: status.error
        }
      })
      
      return (
        <ExpandableSectionViewer
          sections={sections}
          documentType={selectedType}
          isGenerating={isGenerating}
          currentGeneratingSection={currentGeneratingSection}
          streamedContent={streamedContent}
        />
      )
    }

    // Handle Mermaid diagrams - both during generation and when viewing saved docs
    if (selectedType === 'mermaid') {
      // For section-based mermaid generation, combine all section content
      let combinedMermaidContent = generatedContent || ''
      
      // If we have section progress, combine all sections
      if (sectionIds.length > 0 && !isGenerating) {
        const sectionsContent = sectionIds
          .map(id => sectionProgress[id]?.content || '')
          .filter(c => c.trim())
          .join('\n\n')
        if (sectionsContent) {
          combinedMermaidContent = sectionsContent
        }
      }
      
      // For Mermaid diagrams, only render after generation is complete to avoid syntax errors
      if (isGenerating && !combinedMermaidContent && !viewingPreviousDoc) {
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
      
      // Parse and render when we have content (either generated or viewing saved)
      const mermaidContent = combinedMermaidContent || (viewingPreviousDoc && content) || content
      if (mermaidContent) {
        // Extract and fix diagrams properly with section awareness
        const { diagrams, fixedContent } = extractAndFixMermaidDiagrams(mermaidContent)
        return (
          <div className="space-y-4">
            {Object.keys(diagrams).length > 0 ? (
              <>
                <div className="mb-4 p-2 bg-green-50 text-green-800 rounded text-sm">
                  ✅ Found {Object.keys(diagrams).length} diagrams. Rendering...
                </div>
                {/* Check if any diagrams were fixed */}
                {fixedContent !== mermaidContent && (
                  <div className="mb-4 p-2 bg-blue-50 text-blue-800 rounded text-sm flex items-center gap-2">
                    <span>🔧</span>
                    <span>Fixed {Object.keys(diagrams).length} diagram{Object.keys(diagrams).length > 1 ? 's' : ''} with syntax issues</span>
                  </div>
                )}
                <MermaidViewerEnhanced 
                  diagrams={diagrams} 
                  title={selectedDoc?.name || "Architecture Diagrams"}
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
                    {mermaidContent}
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

    // Only check for Mermaid diagrams in non-mermaid document types if they have explicit mermaid blocks
    // This prevents false positives in regular text documents
    if (selectedType !== 'mermaid') {
      // Only render as Mermaid if there are explicit ```mermaid blocks
      if (content && content.includes('```mermaid')) {
        const mermaidDiagrams = parseMermaidDiagramsWithSections(content)
        if (Object.keys(mermaidDiagrams).length > 0) {
          return (
            <MermaidViewerEnhanced 
              diagrams={mermaidDiagrams}
              title={selectedDoc?.name || 'Document'}
            />
          )
        }
      }
    }

    return (
      <EnhancedDocumentRenderer
        content={content || (isGenerating ? "" : "Click generate to create your document")}
        title={selectedDoc?.name}
        documentType={selectedType}
        showActions={false}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />
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
            <DialogTitle className="text-sm font-medium">
              {viewingPreviousDoc && selectedDoc ? selectedDoc.name : 'SDLC Docs'}
            </DialogTitle>
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
              <DialogTitle className="text-lg">
                {viewingPreviousDoc && selectedDoc ? 
                  `${selectedDoc.name} - ${input ? input.substring(0, 50) + (input.length > 50 ? '...' : '') : 'SDLC Document'}` : 
                  'SDLC Documentation'
                }
              </DialogTitle>
              <DialogDescription className="text-sm">
                {viewingPreviousDoc ? 
                  'Viewing saved document' : 
                  'Choose a document type to generate. Non-logged-in users can generate up to 10 documents.'
                }
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
                console.log('🔄 Tab onValueChange called with:', value)
                console.log('📌 Current selectedType before change:', selectedType)
                setSelectedType(value)
                // Save the selected type to localStorage immediately when changed
                localStorage.setItem('selectedDocType', value)
                console.log('✅ selectedType set to:', value)
                console.log('💾 Saved to localStorage:', value)
                // Only reset section progress if we don't have sections stored for this type
                // Check if we have section metadata for this document type
                const sectionMetadataKey = `sdlc_section_metadata_${value}`
                const storedSectionData = localStorage.getItem(sectionMetadataKey)
                
                if (storedSectionData) {
                  // Restore section progress from stored data
                  try {
                    const sections = JSON.parse(storedSectionData)
                    const restoredProgress: Record<string, any> = {}
                    
                    // Check if sections is an array, if not, try to handle it appropriately
                    if (Array.isArray(sections)) {
                      sections.forEach((sectionId: string) => {
                        restoredProgress[sectionId] = { status: 'completed', content: '' }
                      })
                    } else if (typeof sections === 'object' && sections !== null) {
                      // If it's an object, use its keys
                      Object.keys(sections).forEach((sectionId: string) => {
                        restoredProgress[sectionId] = { status: 'completed', content: '' }
                      })
                    } else {
                      // If it's neither array nor object, reset progress
                      console.warn('Unexpected sections data format:', sections)
                      setSectionProgress({})
                    }
                    
                    if (Object.keys(restoredProgress).length > 0) {
                      setSectionProgress(restoredProgress)
                    }
                  } catch (error) {
                    console.error('Error parsing stored section data:', error)
                    setSectionProgress({})
                  }
                } else {
                  // Only reset if no sections stored
                  setSectionProgress({})
                }
                setCurrentGeneratingSection(null)
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
                {/* Filter document types - show only those with content when viewing, show all when generating */}
                {(showPreviousDocs && !isGenerating ? 
                  documentTypes.filter(doc => previousDocuments[doc.id]) : 
                  documentTypes
                ).map((doc) => {
                  // Get the appropriate sections for each document type
                  let sections: any = {}
                  let selectedSections: string[] = []
                  let onSectionsChange: (sections: string[]) => void = () => {}
                  
                  switch (doc.id) {
                    case 'business':
                      sections = businessAnalysisSections
                      selectedSections = selectedBusinessSections
                      onSectionsChange = setSelectedBusinessSections
                      break
                    case 'technical':
                      sections = techSpecSections
                      selectedSections = selectedTechSpecSections
                      onSectionsChange = setSelectedTechSpecSections
                      break
                    case 'ux':
                      sections = uxDesignSections
                      selectedSections = selectedUXSections
                      onSectionsChange = setSelectedUXSections
                      break
                    case 'mermaid':
                      sections = architectureSections
                      selectedSections = selectedArchitectureSections
                      onSectionsChange = setSelectedArchitectureSections
                      break
                    case 'functional':
                      sections = functionalSpecSections
                      selectedSections = selectedFunctionalSections
                      onSectionsChange = setSelectedFunctionalSections
                      break
                    case 'test':
                      sections = testSpecSections
                      selectedSections = selectedTestSections
                      onSectionsChange = setSelectedTestSections
                      break
                    case 'coding':
                      sections = codingPromptSections
                      selectedSections = selectedCodingSections
                      onSectionsChange = setSelectedCodingSections
                      break
                    case 'meeting':
                      sections = meetingTranscriptSections
                      selectedSections = selectedMeetingSections
                      onSectionsChange = setSelectedMeetingSections
                      break
                  }
                  
                  return (
                    <div key={doc.id} className="flex-shrink-0">
                      <DocumentTabButton
                        documentType={doc.id}
                        documentName={doc.name}
                        icon={doc.icon}
                        color={doc.color}
                        isSelected={selectedType === doc.id}
                        isDisabled={isGenerating}
                        onClick={() => {
                          // The TabsTrigger inside DocumentTabButton will handle the tab switching
                          // through the Tabs component's onValueChange, so we don't need to do anything here
                          console.log('🖱️ DocumentTabButton onClick for:', doc.id, '(handled by Tabs component)')
                        }}
                        selectedSections={selectedSections}
                        onSectionsChange={onSectionsChange}
                        hasPreviousDocument={!!previousDocuments[doc.id]}
                        sections={sections}
                      />
                    </div>
                  )
                })}
              </TabsList>
              {/* Desktop: Scrollable tabs */}
              <TabsList className="hidden sm:flex items-center justify-start gap-1 w-full h-auto p-1 bg-gray-100 rounded-lg overflow-x-auto tabs-scrollbar">
                {/* Filter document types - show only those with content when viewing, show all when generating */}
                {(showPreviousDocs && !isGenerating ? 
                  documentTypes.filter(doc => previousDocuments[doc.id]) : 
                  documentTypes
                ).map((doc) => {
                  // Get the appropriate sections for each document type
                  let sections: any = {}
                  let selectedSections: string[] = []
                  let onSectionsChange: (sections: string[]) => void = () => {}
                  
                  switch (doc.id) {
                    case 'business':
                      sections = businessAnalysisSections
                      selectedSections = selectedBusinessSections
                      onSectionsChange = setSelectedBusinessSections
                      break
                    case 'technical':
                      sections = techSpecSections
                      selectedSections = selectedTechSpecSections
                      onSectionsChange = setSelectedTechSpecSections
                      break
                    case 'ux':
                      sections = uxDesignSections
                      selectedSections = selectedUXSections
                      onSectionsChange = setSelectedUXSections
                      break
                    case 'mermaid':
                      sections = architectureSections
                      selectedSections = selectedArchitectureSections
                      onSectionsChange = setSelectedArchitectureSections
                      break
                    case 'functional':
                      sections = functionalSpecSections
                      selectedSections = selectedFunctionalSections
                      onSectionsChange = setSelectedFunctionalSections
                      break
                    case 'test':
                      sections = testSpecSections
                      selectedSections = selectedTestSections
                      onSectionsChange = setSelectedTestSections
                      break
                    case 'coding':
                      sections = codingPromptSections
                      selectedSections = selectedCodingSections
                      onSectionsChange = setSelectedCodingSections
                      break
                    case 'meeting':
                      sections = meetingTranscriptSections
                      selectedSections = selectedMeetingSections
                      onSectionsChange = setSelectedMeetingSections
                      break
                  }
                  
                  // Use DocumentTabButton for all document types with sections
                  return (
                    <div key={doc.id} className="flex-shrink-0">
                      <DocumentTabButton
                        documentType={doc.id}
                        documentName={doc.name}
                        icon={doc.icon}
                        color={doc.color}
                        isSelected={selectedType === doc.id}
                        isDisabled={isGenerating}
                        onClick={() => {
                          // The TabsTrigger inside DocumentTabButton will handle the tab switching
                          // through the Tabs component's onValueChange, so we don't need to do anything here
                          console.log('🖱️ DocumentTabButton onClick for:', doc.id, '(handled by Tabs component)')
                        }}
                        selectedSections={selectedSections}
                        onSectionsChange={onSectionsChange}
                        hasPreviousDocument={!!previousDocuments[doc.id]}
                        sections={sections}
                      />
                    </div>
                  )
                })}
              </TabsList>
            </Tabs>

          </div>

          {/* Progress Indicator for Section Generation */}
          {isGenerating && currentSections.length > 0 && (
            <div className="flex-shrink-0">
              <SectionGenerationProgress
                documentType={selectedType}
                sections={currentSections}
                sectionDetails={currentSectionDetails}
                isGenerating={isGenerating}
                currentSectionIndex={currentSections.findIndex(id => id === currentGeneratingSection)}
                sectionProgress={sectionProgress}
              />
            </div>
          )}

          {/* Terminal-like Streaming Preview - Only show when NOT generating sections */}
          {isGenerating && currentSections.length === 0 && (
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
                    <span className="text-white">Generating {selectedDoc?.name} (Full Document)...</span>
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
            {/* Document Header for viewing */}
            {viewingPreviousDoc && selectedDoc && !isGenerating && (
              <>
                {/* Document Type Header */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className={`h-5 w-5 ${selectedDoc.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedDoc.name}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{selectedDoc.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Save Status Bar */}
                <div className="mb-2 sm:mb-4 p-1.5 sm:p-3 bg-green-50 border border-green-200 rounded-md sm:rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-[10px] sm:text-sm text-green-800 font-medium">Saved</span>
                    {hasSectionsSelected(selectedType) && (
                      <Badge variant="secondary" className="ml-2 text-[10px] sm:text-xs">
                        {getSectionCount(selectedType)} sections
                      </Badge>
                    )}
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
              </>
            )}
            
            {/* Show default prompt info when no sections selected */}
            {currentSections.length === 0 && isGenerating && (
              <Card className="mb-4 p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Using Comprehensive Default Prompt</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Generating complete {selectedDoc?.name} with all standard sections included.
                    </p>
                  </div>
                </div>
              </Card>
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
                    
                    {/* Show selected sections if any */}
                    {(() => {
                      let currentSections: string[] = []
                      let sectionDetails: any = {}
                      
                      switch(selectedType) {
                        case 'business':
                          currentSections = selectedBusinessSections
                          sectionDetails = businessAnalysisSections
                          break
                        case 'technical':
                          currentSections = selectedTechSpecSections
                          sectionDetails = techSpecSections
                          break
                        case 'functional':
                          currentSections = selectedFunctionalSections
                          sectionDetails = functionalSpecSections
                          break
                        case 'ux':
                          currentSections = selectedUXSections
                          sectionDetails = uxDesignSections
                          break
                        case 'mermaid':
                          currentSections = selectedArchitectureSections
                          sectionDetails = architectureSections
                          break
                        case 'test':
                          currentSections = selectedTestSections
                          sectionDetails = testSpecSections
                          break
                        case 'coding':
                          currentSections = selectedCodingSections
                          sectionDetails = codingPromptSections
                          break
                        case 'meeting':
                          currentSections = selectedMeetingSections
                          sectionDetails = meetingTranscriptSections
                          break
                      }
                      
                      // Debug logging
                      console.log('🔍 Checking sections for display:', {
                        selectedType,
                        currentSections,
                        sectionDetails: Object.keys(sectionDetails),
                        hasContent: currentSections.length > 0
                      })
                      
                      if (currentSections.length > 0) {
                        return (
                          <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-left max-w-md mx-auto">
                            <p className="text-xs font-semibold text-indigo-900 mb-2">Selected sections ({currentSections.length}):</p>
                            <div className="space-y-1">
                              {currentSections.map((sectionId, index) => {
                                const section = sectionDetails[sectionId]
                                return section ? (
                                  <div key={sectionId} className="flex items-center gap-2 text-xs text-indigo-700">
                                    <span className="text-indigo-500">{section.icon || '•'}</span>
                                    <span>{section.name}</span>
                                  </div>
                                ) : null
                              })}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
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