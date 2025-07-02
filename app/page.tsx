"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  FileText,
  GitBranch,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Workflow,
  Info,
  Plug,
  Presentation,
  Database,
  RefreshCw,
  ChevronDown,
} from "lucide-react"
import { HowItWorksVisualization } from "@/components/how-it-works-visualization"
import { PromptEngineering } from "@/components/prompt-engineering"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { IntegrationHub } from "@/components/integration-hub"
import { VisualizationHub } from "@/components/visualization-hub"
import { SimpleWorkflowDiagram } from "@/components/simple-workflow-diagram"
import { MermaidViewer } from "@/components/mermaid-viewer"

interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "in_progress" | "completed" | "error"
  progress: number
  estimatedTime?: string
}

interface ProjectResult {
  id: string
  title: string
  status: string
  createdAt: string
  jiraEpic?: string
  confluencePage?: string
  documents: {
    businessAnalysis: string
    functionalSpec: string
    technicalSpec: string
    uxSpec: string
    architecture: string
  }
}

interface WorkflowVisualizationProps {
  currentStep: number
  processingSteps: ProcessingStep[]
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ currentStep, processingSteps }) => {
  return (
    <div>
      <p>Current Step: {currentStep}</p>
      <ul>
        {processingSteps.map((step) => (
          <li key={step.id}>
            {step.name} - Status: {step.status} - Progress: {step.progress}%
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SDLCAutomationPlatform() {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfig, setShowConfig] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [config, setConfig] = useState({
    openaiKey: "",
    aiModel: "gpt-4",
    jiraUrl: "",
    jiraProject: "",
    jiraEmail: "",
    jiraToken: "",
    jiraAutoCreate: true,
    confluenceUrl: "",
    confluenceSpace: "",
    confluenceEmail: "",
    confluenceToken: "",
    confluenceAutoCreate: true,
    template: "default",
    outputFormat: "markdown",
    emailNotifications: true,
    slackNotifications: false,
  })

  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPromptEngineering, setShowPromptEngineering] = useState(false)
  const [showCacheDialog, setShowCacheDialog] = useState(false)
  const [pendingCachedResults, setPendingCachedResults] = useState<any>(null)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const handleShowPromptEngineering = () => {
    setShowPromptEngineering(true)
  }
  
  // Initialize customPrompts with empty values
  const [customPrompts, setCustomPrompts] = useState({
    business: "",
    functional: "",
    technical: "",
    ux: "",
    mermaid: ""
  })
  
  // Handle prompt updates from PromptEngineering component
  const handlePromptUpdate = (promptType: string, promptContent: string) => {
    setCustomPrompts(prev => ({
      ...prev,
      [promptType]: promptContent
    }))
  }
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: "analysis", name: "Business Analysis", status: "pending", progress: 0 },
    { id: "functional", name: "Functional Specification", status: "pending", progress: 0 },
    { id: "technical", name: "Technical Specification", status: "pending", progress: 0 },
    { id: "ux", name: "UX Specification", status: "pending", progress: 0 },
    { id: "jira", name: "JIRA Epic Creation", status: "pending", progress: 0 },
    { id: "confluence", name: "Confluence Documentation", status: "pending", progress: 0 },
    { id: "linking", name: "Cross-platform Linking", status: "pending", progress: 0 },
  ])

  // Get all cached results from localStorage for Recent Projects display
  const getCachedProjects = (): ProjectResult[] => {
    const projects: ProjectResult[] = []
    // Only access localStorage on client-side
    if (typeof window === 'undefined') {
      return projects
    }
    
    try {
      // Iterate through localStorage to find cached SDLC results
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('sdlc-cache-')) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsedCache = JSON.parse(cached)
            // Only include recent cache (within 24 hours)
            if (Date.now() - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
              projects.push({
                id: key.replace('sdlc-cache-', ''),
                title: parsedCache.businessAnalysis?.substring(0, 50) + '...' || 'SDLC Project',
                status: 'completed',
                createdAt: new Date(parsedCache.timestamp).toLocaleDateString(),
                documents: {
                  businessAnalysis: parsedCache.businessAnalysis || '',
                  functionalSpec: parsedCache.functionalSpec || '',
                  technicalSpec: parsedCache.technicalSpec || '',
                  uxSpec: parsedCache.uxSpec || '',
                  architecture: parsedCache.mermaidDiagrams || '',
                }
              })
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error loading cached projects:', error)
    }
    return projects.slice(0, 5) // Limit to 5 most recent
  }

  const [recentProjects, setRecentProjects] = useState<ProjectResult[]>([])

  // Load cached projects on client-side only
  useEffect(() => {
    setRecentProjects(getCachedProjects())
  }, [])
  const [recentProjectsExpanded, setRecentProjectsExpanded] = useState(false) // Default: folded

  // Handle API key dialog confirmation
  const handleApiKeyConfirm = async () => {
    if (!tempApiKey.trim()) {
      setErrorMessage("Please enter your OpenAI API key")
      return
    }
    
    // Update config with the provided API key
    setConfig(prev => ({ ...prev, openaiKey: tempApiKey.trim() }))
    setShowApiKeyDialog(false)
    setTempApiKey('')
    setErrorMessage('')
    
    // Continue with generation now that we have the API key
    await generateFreshDocuments()
  }

  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null)

  // Parse Mermaid diagrams into separate sections
  const parseMermaidDiagrams = (mermaidContent: string) => {
    if (!mermaidContent) {
      return { architecture: "", database: "", userFlow: "", apiFlow: "" }
    }

    // Split by comments that indicate diagram sections
    const sections = mermaidContent.split(/%%\s*[A-Za-z\s]+\s*Diagram/i)
    
    let architecture = ""
    let database = ""
    let userFlow = ""
    let apiFlow = ""

    sections.forEach((section, index) => {
      const trimmedSection = section.trim()
      if (!trimmedSection) return

      // Check what type of diagram this section contains
      if (trimmedSection.includes('graph ') || trimmedSection.includes('flowchart ')) {
        if (trimmedSection.toLowerCase().includes('user') || trimmedSection.toLowerCase().includes('flow')) {
          userFlow = trimmedSection
        } else {
          architecture = trimmedSection
        }
      }
      else if (trimmedSection.includes('erDiagram')) {
        database = trimmedSection
      }
      else if (trimmedSection.includes('sequenceDiagram')) {
        apiFlow = trimmedSection
      }
      // Fallback: if first section and no specific type detected, assume architecture
      else if (index === 1 && !architecture) {
        architecture = trimmedSection
      }
    })

    // Log parsing results for debugging
    console.log('Parsed Mermaid diagrams:', {
      architecture: architecture ? 'Found' : 'Empty',
      database: database ? 'Found' : 'Empty', 
      userFlow: userFlow ? 'Found' : 'Empty',
      apiFlow: apiFlow ? 'Found' : 'Empty',
      originalLength: mermaidContent.length
    })

    return { architecture, database, userFlow, apiFlow }
  }

  // Cache management
  const getCachedResults = (input: string) => {
    try {
      const cached = localStorage.getItem(`sdlc-cache-${btoa(input).slice(0, 20)}`)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  const setCachedResults = (input: string, results: any) => {
    try {
      localStorage.setItem(`sdlc-cache-${btoa(input).slice(0, 20)}`, JSON.stringify({
        ...results,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to cache results:', error)
    }
  }

  const handleGenerate = async () => {
    if (!input.trim()) {
      setErrorMessage("Please enter your requirements")
      return
    }

    // Check for cached results first
    const cached = getCachedResults(input.trim())
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hour cache
      // Show dialog to let user choose between cached and fresh generation
      setPendingCachedResults(cached)
      setShowCacheDialog(true)
      return
    }

    // No cache found, proceed with fresh generation
    await generateFreshDocuments()
  }

  const loadCachedResults = (cached: any) => {
    console.log('Loading cached results:', cached)
    
    // Remove timestamp before setting documents
    const { timestamp, ...documentsData } = cached
    setGeneratedDocuments(documentsData)
    
    // Build complete steps array including mermaid if it exists
    const cachedSteps: ProcessingStep[] = [
      { id: "analysis", name: "Business Analysis", status: "completed" as const, progress: 100 },
      { id: "functional", name: "Functional Specification", status: "completed" as const, progress: 100 },
      { id: "technical", name: "Technical Specification", status: "completed" as const, progress: 100 },
      { id: "ux", name: "UX Specification", status: "completed" as const, progress: 100 },
    ]
    
    // Add mermaid step if mermaid diagrams exist in cache
    if (cached.mermaidDiagrams) {
      cachedSteps.push({ id: "mermaid", name: "Mermaid Diagrams", status: "completed" as const, progress: 100 })
    }
    
    setProcessingSteps(cachedSteps)
    console.log('✅ Loaded from cache with', cachedSteps.length, 'steps')
  }

  const generateFreshDocuments = async () => {

    // Check if OpenAI API key is missing - prompt just-in-time
    if (!config.openaiKey || config.openaiKey.trim() === '') {
      setTempApiKey('')
      setShowApiKeyDialog(true)
      return
    }

    setIsProcessing(true)
    setErrorMessage("")
    setGeneratedDocuments({})
    
    // Build initial steps array properly
    const initialSteps: ProcessingStep[] = [
      { id: "analysis", name: "Business Analysis", status: "pending" as const, progress: 0 },
      { id: "functional", name: "Functional Specification", status: "pending" as const, progress: 0 },
      { id: "technical", name: "Technical Specification", status: "pending" as const, progress: 0 },
      { id: "ux", name: "UX Specification", status: "pending" as const, progress: 0 },
      { id: "mermaid", name: "Mermaid Diagrams", status: "pending" as const, progress: 0 },
    ]

    // Add optional steps if integrations are enabled
    if (config.jiraAutoCreate && config.jiraUrl && config.jiraToken) {
      initialSteps.push({ id: "jira", name: "JIRA Epic Creation", status: "pending" as const, progress: 0 })
    }
    if (config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken) {
      initialSteps.push({ id: "confluence", name: "Confluence Documentation", status: "pending" as const, progress: 0 })
    }
    if (initialSteps.length > 4) {
      initialSteps.push({ id: "linking", name: "Cross-platform Linking", status: "pending" as const, progress: 0 })
    }

    setProcessingSteps(initialSteps)

    // Function to update step progress
    const updateStepProgress = (stepId: string, progress: number, status: "pending" | "in_progress" | "completed" | "error" = "in_progress") => {
      setProcessingSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === stepId ? { ...step, progress, status } : step
        )
      )
    }

    try {
      // Execute each step sequentially with real progress tracking
      const results: any = {}
      
      // Step 1: Business Analysis
      updateStepProgress("analysis", 0, "in_progress")
      const businessResponse = await fetch("/api/generate-business-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          customPrompt: customPrompts?.business,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!businessResponse.ok) {
        const errorData = await businessResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("analysis", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${businessResponse.status}`)
      }
      
      const businessResult = await businessResponse.json()
      results.businessAnalysis = businessResult.businessAnalysis
      updateStepProgress("analysis", 100, "completed")
      setGeneratedDocuments(prev => ({ ...prev, businessAnalysis: businessResult.businessAnalysis }))

      // Step 2: Functional Specification
      updateStepProgress("functional", 0, "in_progress")
      const functionalResponse = await fetch("/api/generate-functional-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          customPrompt: customPrompts?.functional,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!functionalResponse.ok) {
        const errorData = await functionalResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("functional", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${functionalResponse.status}`)
      }
      
      const functionalResult = await functionalResponse.json()
      results.functionalSpec = functionalResult.functionalSpec
      updateStepProgress("functional", 100, "completed")
      setGeneratedDocuments(prev => ({ ...prev, functionalSpec: functionalResult.functionalSpec }))

      // Step 3: Technical Specification
      updateStepProgress("technical", 0, "in_progress")
      const technicalResponse = await fetch("/api/generate-technical-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          functionalSpec: results.functionalSpec,
          customPrompt: customPrompts?.technical,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!technicalResponse.ok) {
        const errorData = await technicalResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("technical", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${technicalResponse.status}`)
      }
      
      const technicalResult = await technicalResponse.json()
      results.technicalSpec = technicalResult.technicalSpec
      updateStepProgress("technical", 100, "completed")
      setGeneratedDocuments(prev => ({ ...prev, technicalSpec: technicalResult.technicalSpec }))

      // Step 4: UX Specification
      updateStepProgress("ux", 0, "in_progress")
      const uxResponse = await fetch("/api/generate-ux-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          functionalSpec: results.functionalSpec,
          technicalSpec: results.technicalSpec,
          customPrompt: customPrompts?.ux,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!uxResponse.ok) {
        const errorData = await uxResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("ux", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${uxResponse.status}`)
      }
      
      const uxResult = await uxResponse.json()
      results.uxSpec = uxResult.uxSpec
      updateStepProgress("ux", 100, "completed")
      setGeneratedDocuments(prev => ({ ...prev, uxSpec: uxResult.uxSpec }))

      // Step 5: Mermaid Diagrams
      updateStepProgress("mermaid", 0, "in_progress")
      const mermaidResponse = await fetch("/api/generate-mermaid-diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          functionalSpec: results.functionalSpec,
          technicalSpec: results.technicalSpec,
          customPrompt: customPrompts?.mermaid,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!mermaidResponse.ok) {
        const errorData = await mermaidResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("mermaid", 0, "error")
        console.warn("Failed to generate Mermaid diagrams:", errorData?.error || `API request failed with status ${mermaidResponse.status}`)
        results.mermaidDiagrams = ""
      } else {
        const mermaidResult = await mermaidResponse.json()
        results.mermaidDiagrams = mermaidResult.mermaidDiagrams
        updateStepProgress("mermaid", 100, "completed")
        setGeneratedDocuments(prev => ({ ...prev, mermaidDiagrams: mermaidResult.mermaidDiagrams }))
      }

      // Cache the complete results
      setCachedResults(input.trim(), results)
      
      // Handle optional integrations (JIRA, Confluence) if enabled
      // ... (existing integration logic can be added here)

      // Ensure all steps are marked as completed
      setProcessingSteps(prevSteps => prevSteps.map(step => ({
        ...step,
        status: "completed" as const,
        progress: 100
      })))
      
    } catch (error) {
      console.error("Error generating SDLC documentation:", error)
      
      // Mark current step as error and stop processing
      setProcessingSteps(prevSteps => {
        const currentStepIndex = prevSteps.findIndex(step => step.status === "in_progress")
        if (currentStepIndex >= 0) {
          return prevSteps.map((step, index) => 
            index === currentStepIndex 
              ? { ...step, status: "error" as const, progress: 0 }
              : step
          )
        }
        return prevSteps
      })
      
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Failed to generate documentation. Please try again.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const handleSaveConfig = () => {
    console.log("Saving configuration:", config)
    // Here you would save to localStorage or send to API
    localStorage.setItem("sdlc-config", JSON.stringify(config))
    setShowConfig(false)
  }

  const handleTestConnections = () => {
    console.log("Testing connections...")
    // Here you would test JIRA and Confluence connections
    alert("Testing connections... (This would test your API credentials)")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDLC Automation Platform</h1>
            <p className="text-gray-600">Transform ideas into complete project documentation with AI</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowIntegrations(true)}>
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowVisualization(true)}>
              <Presentation className="h-4 w-4 mr-2" />
              Visualize
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowWorkflow(true)}>
              <Workflow className="h-4 w-4 mr-2" />
              View Workflow
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowHowItWorks(true)}>
              <Info className="h-4 w-4 mr-2" />
              How It Works
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowPromptEngineering(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Prompt Engineering
            </Button>
          </div>
        </div>

        {/* Main Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Business Case
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-input">Describe your bug, feature, or business case:</Label>
              <Textarea
                id="business-input"
                placeholder="Example: We need to implement a user authentication system that supports email/password login, social media login (Google, Facebook), password reset functionality, and role-based access control. The system should be secure, scalable, and integrate with our existing user database..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px] mt-2"
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>JIRA Project:</span>
                <Badge variant="outline">{config.jiraProject || "Not configured"}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Confluence Space:</span>
                <Badge variant="outline">{config.confluenceSpace || "Not configured"}</Badge>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                <p className="font-medium">Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <Button onClick={handleGenerate} disabled={!input.trim() || isProcessing} className="w-full" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? "Generating SDLC Documentation..." : "Generate SDLC Documentation"}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Status - Only show after generation is triggered */}
        {(isProcessing || (generatedDocuments && Object.keys(generatedDocuments).length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                Processing Your Request...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${step.status === "completed" ? "text-green-700" : step.status === "in_progress" ? "text-blue-700" : "text-gray-500"}`}
                        >
                          {step.name}
                        </span>
                        {step.status === "in_progress" && (
                          <span className="text-sm text-blue-600 font-medium">In progress...</span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Documents Display - Only show after generation is triggered */}
        {(isProcessing || (generatedDocuments && Object.keys(generatedDocuments).length > 0)) && (
          <div className="space-y-6">
            {/* Document Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={
                  generatedDocuments.businessAnalysis ? "business" :
                  generatedDocuments.functionalSpec ? "functional" :
                  generatedDocuments.technicalSpec ? "technical" :
                  generatedDocuments.uxSpec ? "ux" :
                  generatedDocuments.mermaidDiagrams ? "diagrams" :
                  "business"
                } className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger 
                      value="business" 
                      disabled={!generatedDocuments.businessAnalysis && !processingSteps.find(s => s.id === 'analysis')?.status.includes('completed')}
                    >
                      Business Analysis
                      {processingSteps.find(s => s.id === 'analysis')?.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="functional" 
                      disabled={!generatedDocuments.functionalSpec && !processingSteps.find(s => s.id === 'functional')?.status.includes('completed')}
                    >
                      Functional Spec
                      {processingSteps.find(s => s.id === 'functional')?.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="technical" 
                      disabled={!generatedDocuments.technicalSpec && !processingSteps.find(s => s.id === 'technical')?.status.includes('completed')}
                    >
                      Technical Spec
                      {processingSteps.find(s => s.id === 'technical')?.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="ux" 
                      disabled={!generatedDocuments.uxSpec && !processingSteps.find(s => s.id === 'ux')?.status.includes('completed')}
                    >
                      UX Specification
                      {processingSteps.find(s => s.id === 'ux')?.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="diagrams" 
                      disabled={!generatedDocuments.mermaidDiagrams && !processingSteps.find(s => s.id === 'mermaid')?.status.includes('completed')}
                    >
                      Architecture
                      {processingSteps.find(s => s.id === 'mermaid')?.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="business">
                    <MarkdownRenderer 
                      content={generatedDocuments.businessAnalysis}
                      title="Business Analysis"
                      type="business"
                    />
                  </TabsContent>

                  <TabsContent value="functional">
                    <MarkdownRenderer 
                      content={generatedDocuments.functionalSpec}
                      title="Functional Specification"
                      type="functional"
                    />
                  </TabsContent>

                  <TabsContent value="technical">
                    <MarkdownRenderer 
                      content={generatedDocuments.technicalSpec}
                      title="Technical Specification"
                      type="technical"
                    />
                  </TabsContent>

                  <TabsContent value="ux">
                    <MarkdownRenderer 
                      content={generatedDocuments.uxSpec}
                      title="UX Specification"
                      type="ux"
                    />
                  </TabsContent>

                  <TabsContent value="diagrams">
                    <MermaidViewer
                      diagrams={parseMermaidDiagrams(generatedDocuments.mermaidDiagrams || "")}
                    />
                  </TabsContent>
                </Tabs>

                {/* Integration Links */}
                {(generatedDocuments.jiraEpic || generatedDocuments.confluencePage) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Integration Links</h4>
                    <div className="flex gap-4">
                      {generatedDocuments.jiraEpic && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          JIRA Epic: {generatedDocuments.jiraEpic.key}
                        </Button>
                      )}
                      {generatedDocuments.confluencePage && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Confluence Page
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Projects - Only show if there are cached projects */}
        {recentProjects.length > 0 && (
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => setRecentProjectsExpanded(!recentProjectsExpanded)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Recent Projects
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {recentProjects.length}
                </Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                recentProjectsExpanded ? 'rotate-180' : ''
              }`} />
            </CardTitle>
          </CardHeader>
          {recentProjectsExpanded && (
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500">Created on {project.createdAt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          {project.status}
                        </Badge>
                        {project.jiraEpic && <Badge variant="outline">JIRA: {project.jiraEpic}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {project.jiraEpic && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          JIRA Epic
                        </Button>
                      )}
                      {project.confluencePage && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Confluence
                        </Button>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="business" className="mt-4">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="business">Business</TabsTrigger>
                      <TabsTrigger value="functional">Functional</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="ux">UX</TabsTrigger>
                      <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="business" className="mt-2">
                      <MarkdownRenderer 
                        content={project.documents.businessAnalysis}
                        title="Business Analysis"
                        type="business"
                      />
                    </TabsContent>
                    <TabsContent value="functional" className="mt-2">
                      <MarkdownRenderer 
                        content={project.documents.functionalSpec}
                        title="Functional Specification"
                        type="functional"
                      />
                    </TabsContent>
                    <TabsContent value="technical" className="mt-2">
                      <MarkdownRenderer 
                        content={project.documents.technicalSpec}
                        title="Technical Specification"
                        type="technical"
                      />
                    </TabsContent>
                    <TabsContent value="ux" className="mt-2">
                      <MarkdownRenderer 
                        content={project.documents.uxSpec}
                        title="UX Specification"
                        type="ux"
                      />
                    </TabsContent>
                    <TabsContent value="architecture" className="mt-2">
                      <MarkdownRenderer 
                        content={project.documents.architecture}
                        title="Architecture"
                        type="architecture"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </CardContent>
          )}
        </Card>
        )}

        {/* Configuration Dialog */}
        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Platform Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* AI Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <h3 className="font-semibold">AI Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={config.openaiKey}
                      onChange={(e) => setConfig((prev) => ({ ...prev, openaiKey: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Required for AI-powered document generation</p>
                  </div>
                  <div>
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select
                      value={config.aiModel}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, aiModel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* JIRA Configuration */}
              <div className="space-y-4 relative">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <h3 className="font-semibold">JIRA Integration</h3>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </div>
                <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[0.5px] rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-4">
                    <p className="text-gray-600 font-medium">JIRA Integration</p>
                    <p className="text-sm text-gray-500">Coming in the next update</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jira-url">JIRA URL</Label>
                    <Input
                      id="jira-url"
                      placeholder="https://company.atlassian.net"
                      value={config.jiraUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraUrl: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-project">Project Key</Label>
                    <Input
                      id="jira-project"
                      placeholder="PROJ"
                      value={config.jiraProject}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraProject: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-email">Email</Label>
                    <Input
                      id="jira-email"
                      type="email"
                      placeholder="user@company.com"
                      value={config.jiraEmail}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraEmail: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-token">API Token</Label>
                    <Input
                      id="jira-token"
                      type="password"
                      placeholder="Your JIRA API token"
                      value={config.jiraToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraToken: e.target.value }))}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jira-auto-create"
                    checked={config.jiraAutoCreate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, jiraAutoCreate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="jira-auto-create" className="text-sm">
                    Automatically create JIRA epics for new projects
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Confluence Configuration */}
              <div className="space-y-4 relative">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold">Confluence Integration</h3>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </div>
                <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[0.5px] rounded-lg flex items-center justify-center z-10">
                  <div className="text-center p-4">
                    <p className="text-gray-600 font-medium">Confluence Integration</p>
                    <p className="text-sm text-gray-500">Coming in the next update</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confluence-url">Confluence URL</Label>
                    <Input
                      id="confluence-url"
                      placeholder="https://company.atlassian.net/wiki"
                      value={config.confluenceUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceUrl: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-space">Space Key</Label>
                    <Input
                      id="confluence-space"
                      placeholder="DEV"
                      value={config.confluenceSpace}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceSpace: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-email">Email</Label>
                    <Input
                      id="confluence-email"
                      type="email"
                      placeholder="user@company.com"
                      value={config.confluenceEmail}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceEmail: e.target.value }))}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-token">API Token</Label>
                    <Input
                      id="confluence-token"
                      type="password"
                      placeholder="Your Confluence API token"
                      value={config.confluenceToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceToken: e.target.value }))}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confluence-auto-create"
                    checked={config.confluenceAutoCreate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, confluenceAutoCreate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="confluence-auto-create" className="text-sm">
                    Automatically create Confluence pages for documentation
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Template Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h3 className="font-semibold">Template Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template">Default Template</Label>
                    <Select
                      value={config.template}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, template: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default SDLC</SelectItem>
                        <SelectItem value="agile">Agile Development</SelectItem>
                        <SelectItem value="bug-fix">Bug Fix Template</SelectItem>
                        <SelectItem value="feature">Feature Development</SelectItem>
                        <SelectItem value="enterprise">Enterprise Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select
                      value={config.outputFormat}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, outputFormat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="confluence">Confluence Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <h3 className="font-semibold">Notification Settings</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={config.emailNotifications}
                      onChange={(e) => setConfig((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="email-notifications" className="text-sm">
                      Send email notifications when documents are ready
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="slack-notifications"
                      checked={config.slackNotifications}
                      onChange={(e) => setConfig((prev) => ({ ...prev, slackNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="slack-notifications" className="text-sm">
                      Send Slack notifications (requires Slack integration)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveConfig} className="flex-1">
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={handleTestConnections}>
                  Test Connections
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Other Dialogs */}
        <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>SDLC Documentation Workflow</DialogTitle>
            </DialogHeader>
            <SimpleWorkflowDiagram processingSteps={processingSteps} />
          </DialogContent>
        </Dialog>

        <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>How SDLC Automation Works</DialogTitle>
            </DialogHeader>
            <HowItWorksVisualization />
          </DialogContent>
        </Dialog>

        <Dialog open={showPromptEngineering} onOpenChange={setShowPromptEngineering}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prompt Engineering Interface</DialogTitle>
              <DialogDescription>
                Customize AI prompts for each step of the SDLC documentation generation process.
              </DialogDescription>
            </DialogHeader>
            <PromptEngineering onPromptUpdate={handlePromptUpdate} />
          </DialogContent>
        </Dialog>


        <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Integration Hub</DialogTitle>
            </DialogHeader>
            <IntegrationHub />
          </DialogContent>
        </Dialog>

        <Dialog open={showVisualization} onOpenChange={setShowVisualization}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Visualization & Presentation Hub</DialogTitle>
            </DialogHeader>
            <VisualizationHub />
          </DialogContent>
        </Dialog>

        {/* Cache Choice Dialog */}
        <Dialog open={showCacheDialog} onOpenChange={setShowCacheDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Cached Results Found
              </DialogTitle>
              <DialogDescription>
                We found previously generated documents for similar requirements. 
                What would you like to do?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Cached Results Available</p>
                  <p className="text-xs text-blue-600">
                    Generated {pendingCachedResults ? 
                      new Date(pendingCachedResults.timestamp).toLocaleString() : 'recently'
                    }
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => {
                    if (pendingCachedResults) {
                      loadCachedResults(pendingCachedResults)
                    }
                    setShowCacheDialog(false)
                    setPendingCachedResults(null)
                  }}
                  className="flex items-center gap-2 justify-start h-auto p-4"
                  variant="default"
                >
                  <Database className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Load Cached Results</div>
                    <div className="text-xs opacity-80">Instant loading • No API costs</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowCacheDialog(false)
                    setPendingCachedResults(null)
                    generateFreshDocuments()
                  }}
                  className="flex items-center gap-2 justify-start h-auto p-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Generate New Documents</div>
                    <div className="text-xs opacity-60">Fresh generation • Uses API credits</div>
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* API Key Dialog for Just-in-Time Prompting */}
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                OpenAI API Key Required
              </DialogTitle>
              <DialogDescription>
                Please provide your OpenAI API key to generate SDLC documentation.
                Your key will be used securely and is not stored permanently.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-input">OpenAI API Key</Label>
                <Input
                  id="api-key-input"
                  type="password"
                  placeholder="sk-..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleApiKeyConfirm()
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setShowApiKeyDialog(false)
                    setTempApiKey('')
                    setErrorMessage('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApiKeyConfirm}
                  disabled={!tempApiKey.trim()}
                  className="flex-1"
                >
                  Continue Generation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
