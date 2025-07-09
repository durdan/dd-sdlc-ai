"use client"

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { dbService } from '@/lib/database-service';
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
  Plus,
  Loader2,
  X,
  User,
  LogOut,
  Shield,
  ChevronRight,
  ArrowRight,
  Download,
  Copy,
  Check,
  BarChart3,
  FileBarChart,
  Play,
  Code2,
} from "lucide-react"
import { HowItWorksVisualization } from "@/components/how-it-works-visualization"
import { PromptEngineering } from "@/components/prompt-engineering"
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { MermaidViewer } from '@/components/mermaid-viewer-fixed'
import { IntegrationHub } from '@/components/integration-hub'
import { VisualizationHub } from '@/components/visualization-hub'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { SimpleWorkflowDiagram } from "@/components/simple-workflow-diagram"
import { DetailedSDLCViewer } from '@/components/detailed-sdlc-viewer'
import { DatabaseTestInterface } from '@/components/database-test-interface'
import { AICodeAssistant } from '@/components/ai-code-assistant'

// User Header Component with admin panel support
interface UserHeaderProps {
  user: any;
  userRole: string;
  onSignOut: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, userRole, onSignOut }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img 
              src="/img/SDLC.dev.logo.svg" 
              alt="SDLC.dev Logo" 
              className="h-48 w-auto filter contrast-125 brightness-110" 
            />
            <div className="ml-3 font-bold text-gray-900">
              <span className="hidden lg:inline text-xl">SDLC AI Dashboard</span>
              <span className="hidden sm:inline lg:hidden text-lg">SDLC Dashboard</span>
              <span className="sm:hidden text-base">SDLC</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welcome back,</span>
              <span className="font-medium">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            {(userRole === 'admin' || userRole === 'manager') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/admin/prompts', '_blank')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name
                        ? getInitials(user.user_metadata.full_name)
                        : user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open('/prompts', '_blank')}>
                  <Database className="mr-2 h-4 w-4" />
                  <span>My Prompts</span>
                </DropdownMenuItem>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open('/admin/prompts', '_blank')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

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


function SDLCAutomationPlatform({ user }: { user: any }) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfig, setShowConfig] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [config, setConfig] = useState({
    openaiKey: "",
    aiModel: "gpt-4",
    jiraUrl: "",
    jiraToken: "",
    jiraProject: "",
    jiraEmail: "",
    confluenceUrl: "",
    confluenceToken: "",
    confluenceSpace: "",
    confluenceEmail: "",
    jiraAutoCreate: false,
    confluenceAutoCreate: false,
    template: "default",
    outputFormat: "markdown",
    emailNotifications: true,
    slackNotifications: false,
  })
  const [generatedDocuments, setGeneratedDocuments] = useState<any>({})
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(() => [])
  const [showPromptEngineering, setShowPromptEngineering] = useState(false)
  const [customPrompts, setCustomPrompts] = useState<any>({
    analysis: "",
    functional: "",
    technical: "",
    ux: "",
    mermaid: ""
  })
  const [showCacheDialog, setShowCacheDialog] = useState(false)
  const [pendingCachedResults, setPendingCachedResults] = useState<any>(null)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [projects, setProjects] = useState<ProjectResult[]>([])
  const [recentProjects, setRecentProjects] = useState<ProjectResult[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [showDatabaseTest, setShowDatabaseTest] = useState(false)
  const [showAICodeAssistant, setShowAICodeAssistant] = useState(false)

  // Function to update step progress - moved to component level for global access
  const updateStepProgress = (stepId: string, progress: number, status: "pending" | "in_progress" | "completed" | "error" = "in_progress") => {
    setProcessingSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, progress, status } : step
      )
    )
  }
  
  const handleShowPromptEngineering = () => {
    setShowPromptEngineering(true)
  }
  
  // Handle prompt updates from PromptEngineering component
  const handlePromptUpdate = (promptType: string, promptContent: string) => {
    setCustomPrompts(prev => ({
      ...prev,
      [promptType]: promptContent
    }))
  }
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  
  // Export state
  const [isExportingToJira, setIsExportingToJira] = useState(false)
  const [isExportingToConfluence, setIsExportingToConfluence] = useState(false)

  // Initialize processing steps - conditionally include Jira/Confluence based on automation settings
  const getInitialProcessingSteps = (): ProcessingStep[] => {
    const coreSteps: ProcessingStep[] = [
      { id: "analysis", name: "Business Analysis", status: "pending", progress: 0 },
      { id: "functional", name: "Functional Specification", status: "pending", progress: 0 },
      { id: "technical", name: "Technical Specification", status: "pending", progress: 0 },
      { id: "ux", name: "UX Specification", status: "pending", progress: 0 },
      { id: "mermaid", name: "Mermaid Diagrams", status: "pending", progress: 0 },
    ]
    
    // Add integration steps only if automation is enabled
    if (config.jiraAutoCreate && config.jiraUrl && config.jiraToken) {
      coreSteps.push({ id: "jira", name: "JIRA Epic Creation", status: "pending", progress: 0 })
    }
    if (config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken) {
      coreSteps.push({ id: "confluence", name: "Confluence Documentation", status: "pending", progress: 0 })
    }
    if (coreSteps.length > 5) { // More than core 5 steps means integrations are enabled
      coreSteps.push({ id: "linking", name: "Cross-platform Linking", status: "pending", progress: 0 })
    }
    
    return coreSteps
  }

  // Get all cached results from database for Recent Projects display
  const getCachedProjects = async (): Promise<ProjectResult[]> => {
    if (!user?.id) return []
    
    try {
      const projects = await dbService.getProjectsByUser(user.id)
      console.log('🔍 Raw projects from database:', projects.length, projects)
      
      // Convert database projects to ProjectResult format
      const projectResults: ProjectResult[] = []
      
      for (const project of projects) {
        try {
          console.log('🔄 Processing project:', project.id, project.title)
          
          const documents = await dbService.getDocumentsByProject(project.id)
          const integrations = await dbService.getIntegrationsByProject(project.id)
          
          console.log('📄 Documents for project', project.id, ':', documents.length)
          console.log('🔗 Integrations for project', project.id, ':', integrations.length)
          
          // Convert documents array to documents object
          const documentsObj = {
            businessAnalysis: documents.find(d => d.document_type === 'businessAnalysis')?.content || '',
            functionalSpec: documents.find(d => d.document_type === 'functionalSpec')?.content || '',
            technicalSpec: documents.find(d => d.document_type === 'technicalSpec')?.content || '',
            uxSpec: documents.find(d => d.document_type === 'uxSpec')?.content || '',
            architecture: documents.find(d => d.document_type === 'architecture')?.content || '',
          }
          
          // Find Jira and Confluence integrations
          const jiraIntegration = integrations.find(i => i.integration_type === 'jira')
          const confluenceIntegration = integrations.find(i => i.integration_type === 'confluence')
          
          const projectResult = {
            id: project.id,
            title: project.title,
            status: project.status,
            createdAt: project.created_at,
            jiraEpic: jiraIntegration?.external_url || '',
            confluencePage: confluenceIntegration?.external_url || '',
            documents: documentsObj
          }
          
          projectResults.push(projectResult)
          console.log('✅ Successfully processed project:', project.id)
          
        } catch (projectError) {
          console.error('❌ Error processing individual project:', project.id, projectError)
          // Continue processing other projects even if one fails
        }
      }
      
      console.log('🎯 Final project results:', projectResults.length, 'out of', projects.length, 'original projects')
      return projectResults
      
    } catch (error) {
      console.error('Error fetching cached projects:', error)
      return []
    }
  }

  const [recentProjectsExpanded, setRecentProjectsExpanded] = useState(false) // Default: folded

  // Load user configuration and recent projects on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return
      
      try {
        const supabase = createClient()
        
        // Load user configuration
        const userConfig = await dbService.getUserConfiguration(user.id)
        if (userConfig) {
          setConfig(prev => ({
            ...prev,
            openaiKey: userConfig.openai_api_key || '',
            jiraUrl: userConfig.jira_base_url || '',
            jiraEmail: userConfig.jira_email || '',
            jiraToken: userConfig.jira_api_token || '',
            confluenceUrl: userConfig.confluence_base_url || '',
            confluenceEmail: userConfig.confluence_email || '',
            confluenceToken: userConfig.confluence_api_token || '',
          }))
        }
        
        // Load recent projects
        const projects = await getCachedProjects()
        setRecentProjects(projects)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [user?.id])

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



  // Helper function to parse Mermaid content into separate diagrams
  const parseMermaidDiagrams = (mermaidContent: string) => {
    if (!mermaidContent) {
      console.log('No mermaid content to parse')
      return {}
    }

    // Log the raw content for debugging
    console.log('Raw mermaid content:', mermaidContent.substring(0, 200) + '...')
    console.log('Raw mermaid content length:', mermaidContent.length)
    
    // Check for markdown headers and code blocks
    const hasMarkdownHeaders = /^\s*#+\s+.+$/m.test(mermaidContent)
    const hasMermaidCodeBlocks = /```(?:mermaid)?[\s\S]*?```/g.test(mermaidContent)
    console.log('Content analysis:', { hasMarkdownHeaders, hasMermaidCodeBlocks })

    // Fully generic approach - create an empty diagram object with no hardcoded keys
    const diagrams: Record<string, string> = {}

    // Try to split by both markdown headers and Mermaid section comments
    const sectionMarkers: {name: string, index: number}[] = []
    let foundSections = false
    
    // First, try to find markdown headers like "## System Architecture Diagram"
    const markdownHeaderRegex = /^##\s+([^\n]+?)\s*(?:Diagram)?\s*$/gmi
    let match
    while ((match = markdownHeaderRegex.exec(mermaidContent)) !== null) {
      foundSections = true
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '')
      sectionMarkers.push({
        name: sectionName,
        index: match.index + match[0].length
      })
      console.log(`Found markdown header: ${sectionName} at index ${match.index}`)
    }
    
    // Also try Mermaid section comments like "%% System Architecture Diagram"
    const sectionCommentRegex = /%%\s*([A-Za-z\s]+)\s*Diagram/gi
    sectionCommentRegex.lastIndex = 0 // Reset regex state
    while ((match = sectionCommentRegex.exec(mermaidContent)) !== null) {
      foundSections = true
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '')
      sectionMarkers.push({
        name: sectionName,
        index: match.index + match[0].length
      })
      console.log(`Found section comment: ${sectionName} at index ${match.index}`)
    }
    
    // Sort section markers by index to process them in order
    sectionMarkers.sort((a, b) => a.index - b.index)
    
    // Now process the sections with known boundaries
    if (sectionMarkers.length > 0) {
      for (let i = 0; i < sectionMarkers.length; i++) {
        const currentMarker = sectionMarkers[i]
        const nextMarker = sectionMarkers[i + 1]
        const endIndex = nextMarker ? nextMarker.index : mermaidContent.length
        
        // Extract the diagram content
        const diagramContent = mermaidContent.substring(currentMarker.index, endIndex).trim()
        console.log(`Processing section: ${currentMarker.name}, content length: ${diagramContent.length}`)
        
        // Store each diagram with its own section name as the key
        // No hardcoded categories - fully generic
        diagrams[currentMarker.name] = diagramContent
      }
    }
    
    // If no sections found, try to identify diagram types directly
    if (!foundSections) {
      console.log('No section comments found, trying to identify diagram types directly')
      
      // Split by markdown headers or code blocks if present
      let diagramBlocks: string[] = []
      
      if (hasMermaidCodeBlocks) {
        const codeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/g
        let codeMatch
        while ((codeMatch = codeBlockRegex.exec(mermaidContent)) !== null) {
          if (codeMatch[1] && codeMatch[1].trim()) {
            diagramBlocks.push(codeMatch[1].trim())
          }
        }
        console.log(`Found ${diagramBlocks.length} code blocks`)
      } else {
        // Try to split by common diagram type declarations
        const diagramTypeRegex = /(graph|flowchart|sequenceDiagram|erDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitGraph)/gi
        let lastTypeIndex = 0
        let typeMatch
        
        while ((typeMatch = diagramTypeRegex.exec(mermaidContent)) !== null) {
          if (typeMatch.index > lastTypeIndex) {
            const previousContent = mermaidContent.substring(lastTypeIndex, typeMatch.index).trim()
            if (previousContent && /^\w+\s/.test(previousContent)) {
              diagramBlocks.push(previousContent)
            }
          }
          lastTypeIndex = typeMatch.index
        }
        
        // Add the last block
        if (lastTypeIndex < mermaidContent.length) {
          const lastBlock = mermaidContent.substring(lastTypeIndex).trim()
          if (lastBlock) diagramBlocks.push(lastBlock)
        }
        
        console.log(`Split content into ${diagramBlocks.length} diagram blocks`)
      }
      
      // Categorize each diagram block - using a fully generic approach
      diagramBlocks.forEach((block, index) => {
        console.log(`Analyzing block ${index + 1}, length: ${block.length}`)
        console.log(`Block ${index + 1} preview:`, block.substring(0, 50) + '...')
        
        // Determine diagram type from content for naming
        let diagramType = 'diagram'
        
        // Try to determine a more specific type based on content
        if (block.includes('graph ') || block.includes('flowchart ')) {
          diagramType = 'flowchart'
        }
        else if (block.includes('erDiagram')) {
          diagramType = 'entityrelationship'
        }
        else if (block.includes('sequenceDiagram')) {
          diagramType = 'sequence'
        }
        else if (block.includes('classDiagram')) {
          diagramType = 'class'
        }
        else if (block.includes('stateDiagram')) {
          diagramType = 'state'
        }
        
        // Create a unique key for this diagram
        const diagramKey = `${diagramType}${index + 1}`
        diagrams[diagramKey] = block
        console.log(`Created diagram category: ${diagramKey}`)
      })
    }

    // Log parsing results for debugging
    console.log('Parsed Mermaid diagrams:', {
      ...Object.fromEntries(
        Object.entries(diagrams).map(([key, value]) => 
          [key, value ? `Found (${value.length} chars)` : 'Empty']
        )
      ),
      originalLength: mermaidContent.length
    })
    
    // Also log the actual diagram keys and content previews
    Object.entries(diagrams).forEach(([key, content]) => {
      if (content) {
        console.log(`Diagram '${key}' preview:`, content.substring(0, 100) + '...')
      }
    })

    return diagrams
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

  const setCachedResults = async (input: string, results: any) => {
    if (!user?.id) return
    
    try {
      // Save to database using the database service
      const projectTitle = extractProjectName(input)
      const projectDescription = extractProjectDescription(input)
      
      const { project, success } = await dbService.saveCompleteSDLCResult(
        user.id,
        input,
        projectTitle,
        {
          businessAnalysis: results.businessAnalysis || '',
          functionalSpec: results.functionalSpec || '',
          technicalSpec: results.technicalSpec || '',
          uxSpec: results.uxSpec || '',
          architecture: results.mermaidDiagrams || ''
        }
      )
      
      if (success && project) {
        console.log('✅ Successfully saved SDLC project to database:', project.id)
        
        // Refresh the recent projects list
        const updatedProjects = await getCachedProjects()
        setRecentProjects(updatedProjects)
      } else {
        console.error('❌ Failed to save SDLC project to database')
        // Fallback to localStorage for backward compatibility
        localStorage.setItem(`sdlc-cache-${btoa(input).slice(0, 20)}`, JSON.stringify({
          ...results,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Error saving SDLC results:', error)
      // Fallback to localStorage
      try {
        localStorage.setItem(`sdlc-cache-${btoa(input).slice(0, 20)}`, JSON.stringify({
          ...results,
          timestamp: Date.now()
        }))
      } catch (localStorageError) {
        console.warn('Failed to cache results:', localStorageError)
      }
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

  // Handle streaming response with real-time display updates
  const handleStreamingResponse = async (
    response: Response, 
    stepId: string, 
    updateDocuments: (content: string) => void
  ): Promise<string> => {
    let fullContent = ''
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6))
                if (jsonData.type === 'chunk') {
                  fullContent = jsonData.fullContent
                  // Update progress based on content length (rough estimate)
                  const progress = Math.min(90, Math.floor(fullContent.length / 50))
                  updateStepProgress(stepId, progress, "in_progress")
                  
                  // ✨ REAL-TIME DISPLAY: Update documents as content streams in
                  updateDocuments(fullContent)
                  
                } else if (jsonData.type === 'complete') {
                  fullContent = jsonData.fullContent
                  break
                } else if (jsonData.type === 'error') {
                  throw new Error(jsonData.error || 'Streaming failed')
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }
    
    if (!fullContent) {
      throw new Error(`No content received from ${stepId}`)
    }
    
    return fullContent
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
          // Use database prompt hierarchy: User Default → System Default → Fallback
          openaiKey: config.openaiKey,
          userId: user?.id, // Enable user-specific prompts
        }),
      })
      
      if (!businessResponse.ok) {
        const errorData = await businessResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("analysis", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${businessResponse.status}`)
      }
      
      // ✨ Handle streaming response with real-time display
      const businessAnalysisContent = await handleStreamingResponse(
        businessResponse,
        "analysis", 
        (content) => setGeneratedDocuments((prev: any) => ({ ...prev, businessAnalysis: content }))
      )
      
      results.businessAnalysis = businessAnalysisContent
      updateStepProgress("analysis", 100, "completed")

      // Step 2: Functional Specification
      updateStepProgress("functional", 0, "in_progress")
      const functionalResponse = await fetch("/api/generate-functional-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          customPrompt: `You are an expert systems analyst. Create a detailed functional specification based on the SPECIFIC project requirements and business analysis provided.

IMPORTANT: Base your specification ONLY on the specific project described below. Do NOT use generic enterprise examples like CRM, SCM, HRM, or Financial Management unless they are specifically mentioned in the requirements.

Original Project Requirements:
"${input}"

Business Analysis Context:
Use the provided business analysis to inform your functional specification.

Create a functional specification that includes:

## System Overview
- **Purpose**: What this specific system does (based on the actual requirements)
- **Scope**: What's included/excluded for this specific project
- **Target Users**: Who will use this specific system (from business analysis)
- **Environment**: Where this specific system will operate

## Functional Requirements
- **Core Features**: Essential functionality for this specific system
- **User Actions**: What users can do in this specific system
- **System Responses**: How this system responds to user actions
- **Business Rules**: Specific rules and logic for this domain/use case
- **Workflow**: Step-by-step processes for this specific system

## Data Requirements
- **Data Entities**: What data this specific system manages
- **Data Relationships**: How data connects in this specific context
- **Data Validation**: Rules specific to this domain
- **Data Flow**: How data moves through this specific system

## Integration Requirements  
- **External Systems**: What systems this specific project needs to connect with
- **APIs**: Required interfaces for this specific use case
- **Data Exchange**: What data needs to be shared for this project
- **Third-party Services**: External services needed for this specific system

## Security & Compliance Requirements
- **Authentication**: How users log into this specific system
- **Authorization**: Access controls specific to this domain
- **Data Protection**: Security measures for this specific type of data
- **Compliance**: Any regulatory requirements mentioned in the project requirements

## Performance Requirements
- **Response Time**: Performance needs for this specific use case
- **Throughput**: Volume requirements for this specific system
- **Availability**: Uptime needs for this specific application
- **Scalability**: Growth expectations for this specific project

Focus on the SPECIFIC project requirements. Avoid generic enterprise features unless explicitly requested.`,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!functionalResponse.ok) {
        const errorData = await functionalResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("functional", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${functionalResponse.status}`)
      }
      
      // ✨ Handle streaming response with real-time display
      const functionalSpecContent = await handleStreamingResponse(
        functionalResponse,
        "functional",
        (content) => setGeneratedDocuments((prev: any) => ({ ...prev, functionalSpec: content }))
      )
      
      results.functionalSpec = functionalSpecContent
      updateStepProgress("functional", 100, "completed")

      // Step 3: Technical Specification
      updateStepProgress("technical", 0, "in_progress")
      const technicalResponse = await fetch("/api/generate-technical-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          businessAnalysis: results.businessAnalysis,
          functionalSpec: results.functionalSpec,
          customPrompt: `You are an expert technical architect. Create a detailed technical specification based on the SPECIFIC project requirements and previous analysis provided.

IMPORTANT: Base your specification ONLY on the specific project described below. Do NOT use generic enterprise architecture unless specifically mentioned in the requirements.

Original Project Requirements:
"${input}"

Business Analysis Context:
Use the provided business analysis to understand the domain and requirements.

Functional Specification Context:
Use the provided functional specification to understand the system features and requirements.

Create a technical specification that includes:

## System Architecture
- **Architecture Pattern**: Design pattern suitable for this specific system
- **Components**: System components needed for this specific project
- **Data Flow**: How data moves through this specific system
- **Technology Stack**: Languages, frameworks, databases appropriate for this use case

## Database Design
- **Data Model**: Entity relationships for this specific domain
- **Schema Design**: Table structures needed for this specific system
- **Indexing Strategy**: Performance optimization for this specific use case
- **Data Migration**: Upgrade procedures for this specific project

## API Design
- **REST Endpoints**: API specifications for this specific system
- **Request/Response**: Data formats for this specific use case
- **Authentication**: Security mechanisms appropriate for this domain
- **Rate Limiting**: Usage controls for this specific system

## Security Implementation
- **Authentication System**: Login mechanisms for this specific system
- **Authorization Controls**: Access permissions for this specific domain
- **Data Encryption**: Protection methods for this specific type of data
- **Compliance**: Any regulatory requirements mentioned in the original requirements

## Performance Specifications
- **Response Times**: Latency requirements for this specific use case
- **Throughput**: Transaction volumes for this specific system
- **Scalability Plan**: Growth handling for this specific project
- **Caching Strategy**: Performance optimization for this specific domain

## Deployment Strategy
- **Infrastructure**: Server requirements for this specific system
- **Environment Setup**: Dev/Test/Prod for this specific project
- **CI/CD Pipeline**: Automated deployment for this specific codebase
- **Monitoring**: Health checks and alerts for this specific system

Focus on the SPECIFIC project requirements and domain. Avoid generic enterprise architecture unless explicitly requested.`,
          openaiKey: config.openaiKey,
        }),
      })
      
      if (!technicalResponse.ok) {
        const errorData = await technicalResponse.json().catch(() => ({ error: "Unknown API error" }))
        updateStepProgress("technical", 0, "error")
        throw new Error(errorData?.error || `API request failed with status ${technicalResponse.status}`)
      }
      
      // ✨ Handle streaming response with real-time display  
      const technicalSpecContent = await handleStreamingResponse(
        technicalResponse,
        "technical",
        (content) => setGeneratedDocuments((prev: any) => ({ ...prev, technicalSpec: content }))
      )
      
      results.technicalSpec = technicalSpecContent
      updateStepProgress("technical", 100, "completed")

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
          // Use database prompt hierarchy: User Default → System Default → Fallback
          openaiKey: config.openaiKey,
          userId: user?.id, // Enable user-specific prompts
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
          // Use database prompt hierarchy: User Default → System Default → Fallback
          openaiKey: config.openaiKey,
          userId: user?.id, // Enable user-specific prompts
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
      await setCachedResults(input.trim(), results)
      
      // Handle optional integrations (JIRA, Confluence) if enabled
      await handleIntegrations(results, input)

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

  const handleIntegrations = async (documents: any, projectInput: string) => {
    console.log('🔗 Starting integrations...', { hasJiraConfig: !!config.jiraUrl, hasConfluenceConfig: !!config.confluenceUrl })
    
    const projectName = extractProjectName(projectInput)
    const projectDescription = extractProjectDescription(projectInput)
    
    // Handle Jira Integration
    if (config.jiraUrl && config.jiraProject && config.jiraEmail && config.jiraToken && config.jiraAutoCreate) {
      console.log('🎯 Processing Jira integration...')
      updateStepProgress("jira", 0, "in_progress")
      
      try {
        const jiraResponse = await fetch('/api/integrations/jira', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config,
            documents,
            projectName,
            description: projectDescription
          })
        })
        
        const jiraResult = await jiraResponse.json()
        
        if (jiraResult.success) {
          console.log('✅ Jira integration successful:', jiraResult)
          updateStepProgress("jira", 100, "completed")
        } else {
          console.error('❌ Jira integration failed:', jiraResult.error)
          updateStepProgress("jira", 0, "error")
        }
      } catch (error) {
        console.error('❌ Jira integration error:', error)
        updateStepProgress("jira", 0, "error")
      }
    } else {
      console.log('⏭️ Skipping Jira integration (not configured or auto-create disabled)')
      updateStepProgress("jira", 100, "completed")
    }
    
    // Handle Confluence Integration  
    if (config.confluenceUrl && config.confluenceSpace && config.confluenceEmail && config.confluenceToken) {
      console.log('📚 Processing Confluence integration...')
      updateStepProgress("confluence", 0, "in_progress")
      
      try {
        const confluenceResponse = await fetch('/api/integrations/confluence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config,
            documents,
            projectName,
            description: projectDescription
          })
        })
        
        const confluenceResult = await confluenceResponse.json()
        
        if (confluenceResult.success) {
          console.log('✅ Confluence integration successful:', confluenceResult)
          updateStepProgress("confluence", 100, "completed")
        } else {
          console.error('❌ Confluence integration failed:', confluenceResult.error)
          updateStepProgress("confluence", 0, "error")
        }
      } catch (error) {
        console.error('❌ Confluence integration error:', error)
        updateStepProgress("confluence", 0, "error")
      }
    } else {
      console.log('⏭️ Skipping Confluence integration (not configured)')
      updateStepProgress("confluence", 100, "completed")
    }
    
    // Handle Cross-platform Linking
    console.log('🔗 Processing cross-platform linking...')
    updateStepProgress("linking", 0, "in_progress")
    
    // Simulate cross-platform linking (this could link Jira issues to Confluence pages)
    setTimeout(() => {
      console.log('✅ Cross-platform linking completed')
      updateStepProgress("linking", 100, "completed")
    }, 1000)
  }
  
  const extractProjectName = (input: string): string => {
    // Extract project name from user input - look for common patterns
    const lines = input.split('\n')
    const firstLine = lines[0]?.trim()
    
    // Try to find a title or project name in the first few lines
    for (const line of lines.slice(0, 3)) {
      if (line.toLowerCase().includes('project') || line.toLowerCase().includes('app') || line.toLowerCase().includes('system')) {
        return line.replace(/^(project|app|system)\s*:?\s*/i, '').trim() || 'SDLC Project'
      }
    }
    
    return firstLine || 'SDLC Project'
  }
  
  const extractProjectDescription = (input: string): string => {
    const lines = input.split('\n').filter(line => line.trim())
    return lines.slice(0, 3).join(' ').slice(0, 200) + (input.length > 200 ? '...' : '')
  }

  // Manual trigger handlers for Recent Projects
  const handleManualJiraCreate = async (project: any) => {
    console.log('🎯 Enhanced JIRA creation triggered for project:', project.title)
    
    if (!config.jiraUrl || !config.jiraProject || !config.jiraEmail || !config.jiraToken) {
      alert('Please configure JIRA settings in the Configuration tab first.')
      return
    }
    
    if (!project.documents?.businessAnalysis || !project.documents?.technicalSpec || !project.documents?.uxSpec) {
      alert('Project must have Business Analysis, Technical Specification, and UX Specification to create JIRA issues.')
      return
    }
    
    try {
      console.log('🔄 Creating enhanced JIRA issues with content parsing for:', project.title)
      
      // Prepare Jira configuration
      const jiraConfig = {
        url: config.jiraUrl,
        email: config.jiraEmail,
        apiToken: config.jiraToken,
        projectKey: config.jiraProject,
        defaultIssueType: 'Task',
        autoCreate: true,
        createEpics: true,
        linkIssues: true
      }
      
      const jiraResponse = await fetch('/api/create-jira-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessAnalysis: project.documents.businessAnalysis,
          functionalSpec: project.documents.functionalSpec || '',
          technicalSpec: project.documents.technicalSpec,
          uxSpec: project.documents.uxSpec,
          jiraConfig,
          projectId: project.id
        })
      })
      
      const jiraResult = await jiraResponse.json()
      
      if (jiraResult.success) {
        console.log('✅ Enhanced JIRA integration successful:', jiraResult.data.summary)
        
        const summary = jiraResult.data.summary
        const epicUrl = jiraResult.data.epic.url
        
        alert(`🎉 Successfully created ${summary.totalIssues} JIRA issues!\n\n` +
              `📋 Epic: ${jiraResult.data.epic.title} (${jiraResult.data.epic.key})\n` +
              `📖 User Stories: ${summary.userStoriesCount}\n` +
              `⚙️ Development Tasks: ${summary.developmentTasksCount}\n` +
              `🎨 Design Tasks: ${summary.designTasksCount}\n\n` +
              `🔗 View Epic: ${epicUrl}`)
        
        // Update the cached project with JIRA info
        const cachedResults = JSON.parse(localStorage.getItem('sdlc-cached-results') || '{}')
        if (cachedResults[project.id]) {
          cachedResults[project.id].jiraEpic = jiraResult.data.epic.key
          cachedResults[project.id].jiraEpicUrl = epicUrl
          cachedResults[project.id].jiraSummary = summary
          localStorage.setItem('sdlc-cached-results', JSON.stringify(cachedResults))
          
          // Refresh the recent projects display
          const updatedProjects = getCachedResults()
          setRecentProjects(updatedProjects)
        }
      } else {
        console.error('❌ Enhanced JIRA integration failed:', jiraResult.error)
        alert(`JIRA integration failed: ${jiraResult.error}\n\nDetails: ${jiraResult.details || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Manual JIRA integration error:', error)
      alert(`Error creating JIRA artifacts: ${error.message}`)
    }
  }
  
  const handleManualConfluenceCreate = async (project: any) => {
    console.log('📚 Manual Confluence creation triggered for project:', project.title)
    
    if (!config.confluenceUrl || !config.confluenceSpace || !config.confluenceEmail || !config.confluenceToken) {
      alert('Please configure Confluence settings in the Configuration tab first.')
      return
    }
    
    try {
      console.log('🔄 Creating Confluence documentation for:', project.title)
      
      const confluenceResponse = await fetch('/api/integrations/confluence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          documents: project.documents,
          projectName: project.title,
          description: `Manual Confluence integration for ${project.title} project`
        })
      })
      
      const confluenceResult = await confluenceResponse.json()
      
      if (confluenceResult.success) {
        console.log('✅ Manual Confluence integration successful:', confluenceResult)
        alert(`Successfully created ${confluenceResult.pages?.length || 0} Confluence pages!\n\nSpace: ${confluenceResult.confluenceSpaceUrl}`)
        
        // Update the cached project with Confluence info
        const cachedResults = JSON.parse(localStorage.getItem('sdlc-cached-results') || '{}')
        if (cachedResults[project.id]) {
          cachedResults[project.id].confluencePage = confluenceResult.pages?.[0]?.id || 'Created'
          localStorage.setItem('sdlc-cached-results', JSON.stringify(cachedResults))
          
          // Refresh the recent projects display
          const updatedProjects = getCachedResults()
          setRecentProjects(updatedProjects)
        }
      } else {
        console.error('❌ Manual Confluence integration failed:', confluenceResult.error)
        alert(`Confluence integration failed: ${confluenceResult.error}`)
      }
    } catch (error) {
      console.error('❌ Manual Confluence integration error:', error)
      alert(`Error creating Confluence documentation: ${error.message}`)
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

  const handleSaveConfig = async () => {
    if (!user?.id) {
      setErrorMessage('User not authenticated')
      return
    }
    
    setIsSavingConfig(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      // Save configuration to database
      await dbService.upsertUserConfiguration(user.id, {
        openai_api_key: config.openaiKey,
        jira_base_url: config.jiraUrl,
        jira_email: config.jiraEmail,
        jira_api_token: config.jiraToken,
        confluence_base_url: config.confluenceUrl,
        confluence_email: config.confluenceEmail,
        confluence_api_token: config.confluenceToken,
      })
      
      setSuccessMessage('Configuration saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setErrorMessage('Failed to save configuration')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleTestConnections = () => {
    console.log("Testing connections...")
    // Here you would test JIRA and Confluence connections
    alert("Testing connections... (This would test your API credentials)")
  }

  const handleJiraExport = async (project: any) => {
    console.log('🔗 Starting Jira export for project:', project.id)
    
    // Check if we have SDLC content to export
    const hasContent = project.documents?.businessAnalysis || project.documents?.functionalSpec || project.documents?.technicalSpec || project.documents?.uxSpec
    
    if (!hasContent) {
      setErrorMessage('No SDLC content available to export. Please generate some documentation first.')
      return
    }

    // Check Jira configuration
    if (!config.jiraUrl || !config.jiraProject || !config.jiraEmail || !config.jiraToken) {
      setErrorMessage('Jira configuration is incomplete. Please configure Jira settings in the Integration Hub.')
      return
    }

    console.log('🔄 Setting Jira export loading state to true')
    setIsExportingToJira(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/integrations/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            jiraUrl: config.jiraUrl,
            jiraEmail: config.jiraEmail,
            jiraToken: config.jiraToken,
            jiraProject: config.jiraProject,
            jiraAutoCreate: config.jiraAutoCreate
          },
          documents: {
            businessAnalysis: project.documents.businessAnalysis,
            functionalSpec: project.documents.functionalSpec,
            technicalSpec: project.documents.technicalSpec,
            uxSpec: project.documents.uxSpec,
            mermaidDiagrams: project.documents.architecture
          },
          projectName: project.title || 'SDLC Project',
          description: project.documents.businessAnalysis?.substring(0, 200) + '...' || 'Generated SDLC documentation'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Jira export completed:', result.summary)
        setSuccessMessage(`Successfully exported to Jira: ${result.summary}`)
      } else {
        throw new Error(result.error || 'Jira export failed')
      }

    } catch (error) {
      console.error('❌ Jira export error:', error)
      setErrorMessage(`Jira export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('🔄 Setting Jira export loading state to false')
      setIsExportingToJira(false)
    }
  }

  const handleConfluenceExport = async (project: any) => {
    console.log('📄 Starting Confluence export for project:', project.id)
    
    // Check if we have SDLC content to export
    const hasContent = project.documents?.businessAnalysis || project.documents?.functionalSpec || project.documents?.technicalSpec || project.documents?.uxSpec
    
    if (!hasContent) {
      setErrorMessage('No SDLC content available to export. Please generate some documentation first.')
      return
    }

    // Check Confluence configuration
    if (!config.confluenceUrl || !config.confluenceSpace || !config.confluenceEmail || !config.confluenceToken) {
      setErrorMessage('Confluence configuration is incomplete. Please configure Confluence settings in the Integration Hub.')
      return
    }

    setIsExportingToConfluence(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/integrations/confluence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            confluenceUrl: config.confluenceUrl,
            confluenceEmail: config.confluenceEmail,
            confluenceToken: config.confluenceToken,
            confluenceSpace: config.confluenceSpace
          },
          documents: {
            businessAnalysis: project.documents.businessAnalysis,
            functionalSpec: project.documents.functionalSpec,
            technicalSpec: project.documents.technicalSpec,
            uxSpec: project.documents.uxSpec,
            mermaidDiagrams: project.documents.architecture
          },
          projectName: project.title || 'SDLC Project',
          description: project.documents.businessAnalysis?.substring(0, 200) + '...' || 'Generated SDLC documentation'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Confluence export completed:', result.summary)
        setSuccessMessage(`Successfully exported to Confluence: ${result.summary}`)
      } else {
        throw new Error(result.error || 'Confluence export failed')
      }

    } catch (error) {
      console.error('❌ Confluence export error:', error)
      setErrorMessage(`Confluence export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExportingToConfluence(false)
    }
  }

  // Generate Mermaid diagrams
  const generateMermaidDiagrams = async (documents: any) => {
    try {
      const response = await fetch("/api/generate-mermaid-diagrams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionalSpec: documents.functionalSpec || {},
          technicalSpec: documents.technicalSpec || {},
          businessAnalysis: documents.businessAnalysis || {},
          openaiKey: config.openaiKey,
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setGeneratedDocuments(prev => ({
          ...prev,
          mermaidDiagrams: result.mermaidDiagrams
        }))
        
        // Add mermaid step to processing steps
        setProcessingSteps(prev => [
          ...prev,
          { id: "mermaid", name: "Mermaid Diagrams", status: "completed", progress: 100 }
        ])
      }
    } catch (error) {
      console.warn('Error generating Mermaid diagrams:', error)
    }
  }

  // Cache results in localStorage
  const cacheResults = (inputKey: string, data: any) => {
    try {
      const cacheKey = `sdlc_cache_${btoa(inputKey)}`
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to cache results:', error)
    }
  }



  // Update processing status and enable tabs progressively
  const updateProcessingStatus = () => {
    const processingAny = isProcessing
    
    if (!processingAny && processingSteps.length > 0) {
      const allCompleted = processingSteps.every(step => step.status === 'completed')
      if (allCompleted) {
        setSuccessMessage("🎉 Documentation generated successfully!")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SDLC Automation Platform</h1>
            <p className="text-sm sm:text-base text-gray-600">Transform ideas into complete project documentation with AI</p>
          </div>
          <div className="w-full lg:w-auto overflow-x-auto whitespace-nowrap -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-2 sm:gap-2 w-max">
              <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="flex-shrink-0 min-w-[80px]">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Configuration</span>
                <span className="sm:hidden">Config</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowIntegrations(true)} className="flex-shrink-0 min-w-[80px]">
                <Plug className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Integrations</span>
                <span className="sm:hidden">Integrate</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowVisualization(true)} className="flex-shrink-0 min-w-[80px]">
                <Presentation className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Visualize</span>
                <span className="sm:hidden">Visual</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowWorkflow(true)} className="flex-shrink-0 min-w-[80px]">
                <Workflow className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">View Workflow</span>
                <span className="sm:hidden">Workflow</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowHowItWorks(true)} className="flex-shrink-0 min-w-[80px]">
                <Info className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">How It Works</span>
                <span className="sm:hidden">Help</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowPromptEngineering(true)} className="flex-shrink-0 min-w-[80px]">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Prompt Engineering</span>
                <span className="sm:hidden">Prompts</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowDatabaseTest(true)} className="flex-shrink-0 min-w-[80px]">
                <Database className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Test Database</span>
                <span className="sm:hidden">DB Test</span>
                <Badge variant="secondary" className="ml-1 text-xs">T1.2</Badge>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowAICodeAssistant(true)} className="flex-shrink-0 min-w-[80px]">
                <Code2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">AI Code Assistant</span>
                <span className="sm:hidden">AI Code</span>
                <Badge variant="secondary" className="ml-1 text-xs">T1.4</Badge>
              </Button>
            </div>
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

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Unified SDLC Documentation</h4>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div>
                      Generate comprehensive documentation including business analysis, functional specs, technical requirements, UX guidelines, and architecture diagrams. 
                      Customize the depth and detail through the prompt management system to suit your project needs.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status - Only show after generation is triggered */}
        {(isProcessing || (generatedDocuments && Object.keys(generatedDocuments).length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const allCompleted = processingSteps.every(step => step.status === 'completed')
                    const hasInProgress = processingSteps.some(step => step.status === 'in_progress')
                    
                    if (allCompleted && !isProcessing) {
                      return (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-700">All Done! 🎉</span>
                        </>
                      )
                    } else if (hasInProgress || isProcessing) {
                      return (
                        <>
                          <Clock className="h-5 w-5 animate-spin text-blue-500" />
                          <span>Processing Your Request...</span>
                        </>
                      )
                    } else {
                      return (
                        <>
                          <Clock className="h-5 w-5 text-gray-500" />
                          <span>Ready to Process</span>
                        </>
                      )
                    }
                  })()
                  }
                </div>
                
                {/* Close button when all steps are complete */}
                {(() => {
                  const allCompleted = processingSteps.every(step => step.status === 'completed')
                  return allCompleted && !isProcessing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        // Clear the processing state and move to Recent Projects
                        setIsProcessing(false)
                        setProcessingSteps([])
                        // Scroll to Recent Projects section
                        const recentProjectsElement = document.getElementById('recent-projects')
                        if (recentProjectsElement) {
                          recentProjectsElement.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  )
                })()
                }
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
                
                {/* Completion message */}
                {(() => {
                  const allCompleted = processingSteps.every(step => step.status === 'completed')
                  return allCompleted && !isProcessing && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Generation Complete!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Your SDLC documentation has been successfully generated. You can now export to Jira/Confluence or view the documents below.
                      </p>
                    </div>
                  )
                })()
                }
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
                  <div className="w-full overflow-x-auto whitespace-nowrap -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <TabsList className="inline-flex w-max">
                      <TabsTrigger 
                        value="business" 
                        disabled={!generatedDocuments.businessAnalysis && !processingSteps.find(s => s.id === 'analysis')?.status.includes('completed')}
                        className="text-xs sm:text-sm min-w-[120px]"
                      >
                        <span className="hidden sm:inline">Business Analysis</span>
                        <span className="sm:hidden">Business</span>
                        {processingSteps.find(s => s.id === 'analysis')?.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="functional" 
                        disabled={!generatedDocuments.functionalSpec && !processingSteps.find(s => s.id === 'functional')?.status.includes('completed')}
                        className="text-xs sm:text-sm min-w-[120px]"
                      >
                        <span className="hidden sm:inline">Functional Spec</span>
                        <span className="sm:hidden">Functional</span>
                        {processingSteps.find(s => s.id === 'functional')?.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="technical" 
                        disabled={!generatedDocuments.technicalSpec && !processingSteps.find(s => s.id === 'technical')?.status.includes('completed')}
                        className="text-xs sm:text-sm min-w-[120px]"
                      >
                        <span className="hidden sm:inline">Technical Spec</span>
                        <span className="sm:hidden">Technical</span>
                        {processingSteps.find(s => s.id === 'technical')?.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="ux" 
                        disabled={!generatedDocuments.uxSpec && !processingSteps.find(s => s.id === 'ux')?.status.includes('completed')}
                        className="text-xs sm:text-sm min-w-[120px]"
                      >
                        <span className="hidden sm:inline">UX Specification</span>
                        <span className="sm:hidden">UX</span>
                        {processingSteps.find(s => s.id === 'ux')?.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="diagrams" 
                        disabled={!generatedDocuments.mermaidDiagrams && !processingSteps.find(s => s.id === 'mermaid')?.status.includes('completed')}
                        className="text-xs sm:text-sm min-w-[120px]"
                      >
                        <span className="hidden sm:inline">Architecture</span>
                        <span className="sm:hidden">Arch</span>
                        {processingSteps.find(s => s.id === 'mermaid')?.status === 'completed' && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

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
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {/* JIRA Integration Buttons */}
                      {project.jiraEpic ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            const url = project.jiraEpicUrl || `${config.jiraUrl}/browse/${project.jiraEpic}`
                            window.open(url, '_blank')
                          }}
                          title={
                            project.jiraSummary ? 
                            `Epic: ${project.jiraEpic}\nTotal Issues: ${project.jiraSummary.totalIssues}\nUser Stories: ${project.jiraSummary.userStoriesCount}\nDev Tasks: ${project.jiraSummary.developmentTasksCount}\nDesign Tasks: ${project.jiraSummary.designTasksCount}` : 
                            `View JIRA Epic: ${project.jiraEpic}`
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View JIRA Epic ({project.jiraEpic})
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            console.log('🔵 Jira export button clicked, current loading state:', isExportingToJira)
                            handleJiraExport(project)
                          }}
                          disabled={isExportingToJira}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          title="Export SDLC content to Jira as Epics, Stories, and Tasks"
                        >
                          {isExportingToJira ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4 mr-1" />
                          )}
                          {isExportingToJira ? 'Exporting...' : 'Export to Jira'}
                        </Button>
                      )}
                      
                      {/* Confluence Integration Buttons */}
                      {project.confluencePage ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => {
                            if (project.confluencePageUrl) {
                              window.open(project.confluencePageUrl, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Confluence
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleConfluenceExport(project)}
                          disabled={isExportingToConfluence}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          title="Export SDLC documentation to Confluence as structured pages"
                        >
                          {isExportingToConfluence ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 mr-1" />
                          )}
                          {isExportingToConfluence ? 'Exporting...' : 'Export to Confluence'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="business" className="mt-4">
                    <div className="w-full overflow-x-auto whitespace-nowrap -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <TabsList className="inline-flex w-max">
                        <TabsTrigger value="business" className="text-xs sm:text-sm min-w-[120px]">
                          <span className="hidden sm:inline">Business</span>
                          <span className="sm:hidden">Biz</span>
                        </TabsTrigger>
                        <TabsTrigger value="functional" className="text-xs sm:text-sm min-w-[120px]">
                          <span className="hidden sm:inline">Functional</span>
                          <span className="sm:hidden">Func</span>
                        </TabsTrigger>
                        <TabsTrigger value="technical" className="text-xs sm:text-sm min-w-[120px]">
                          <span className="hidden sm:inline">Technical</span>
                          <span className="sm:hidden">Tech</span>
                        </TabsTrigger>
                        <TabsTrigger value="ux" className="text-xs sm:text-sm min-w-[120px]">UX</TabsTrigger>
                        <TabsTrigger value="architecture" className="text-xs sm:text-sm min-w-[120px]">
                          <span className="hidden sm:inline">Architecture</span>
                          <span className="sm:hidden">Arch</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
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
                      <MermaidViewer 
                        diagrams={parseMermaidDiagrams(project.documents.architecture || "")}
                        title="Architecture Diagrams"
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Platform Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6">
              {/* AI Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <h3 className="font-semibold">AI Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="relative">
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder={config.openaiKey ? "••••••••••••••••••••••••" : "sk-..."}
                        value={config.openaiKey}
                        onChange={(e) => setConfig((prev) => ({ ...prev, openaiKey: e.target.value }))}
                      />
                      {config.openaiKey && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {config.openaiKey ? (
                        <span className="text-green-600">✓ API key configured</span>
                      ) : (
                        "Required for AI-powered document generation"
                      )}
                    </p>
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
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <h3 className="font-semibold">JIRA Integration</h3>
                  <Badge variant="outline" className="ml-2 text-green-600 border-green-200">Ready</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Configure Jira to automatically create issues and epics from your SDLC documentation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="jira-url">JIRA URL</Label>
                    <Input
                      id="jira-url"
                      placeholder="https://company.atlassian.net"
                      value={config.jiraUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-project">Project Key</Label>
                    <Input
                      id="jira-project"
                      placeholder="PROJ"
                      value={config.jiraProject}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraProject: e.target.value }))}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-token">API Token</Label>
                    <div className="relative">
                      <Input
                        id="jira-token"
                        type="password"
                        placeholder={config.jiraToken ? "••••••••••••••••••••••••" : "Your JIRA API token"}
                        value={config.jiraToken}
                        onChange={(e) => setConfig((prev) => ({ ...prev, jiraToken: e.target.value }))}
                      />
                      {config.jiraToken && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
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
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold">Confluence Integration</h3>
                  <Badge variant="outline" className="ml-2 text-green-600 border-green-200">Ready</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Configure Confluence to automatically create documentation pages from your SDLC output.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="confluence-url">Confluence URL</Label>
                    <Input
                      id="confluence-url"
                      placeholder="https://company.atlassian.net/wiki"
                      value={config.confluenceUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-space">Space Key</Label>
                    <Input
                      id="confluence-space"
                      placeholder="DEV"
                      value={config.confluenceSpace}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceSpace: e.target.value }))}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-token">API Token</Label>
                    <div className="relative">
                      <Input
                        id="confluence-token"
                        type="password"
                        placeholder={config.confluenceToken ? "••••••••••••••••••••••••" : "Your Confluence API token"}
                        value={config.confluenceToken}
                        onChange={(e) => setConfig((prev) => ({ ...prev, confluenceToken: e.target.value }))}
                      />
                      {config.confluenceToken && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

              {/* Success and Error Messages */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded" role="alert">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <p className="font-medium">Success</p>
                  </div>
                  <p className="text-sm">{successMessage}</p>
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="font-medium">Error</p>
                  </div>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleSaveConfig} className="flex-1" disabled={isSavingConfig}>
                  {isSavingConfig ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
                <Button variant="outline" onClick={handleTestConnections} className="flex-1 sm:flex-none">
                  Test Connections
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Other Dialogs */}
        <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>SDLC Documentation Workflow</DialogTitle>
            </DialogHeader>
            <SimpleWorkflowDiagram processingSteps={processingSteps} />
          </DialogContent>
        </Dialog>

        <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>How SDLC Automation Works</DialogTitle>
            </DialogHeader>
            <HowItWorksVisualization />
          </DialogContent>
        </Dialog>

        <Dialog open={showPromptEngineering} onOpenChange={setShowPromptEngineering}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Integration Hub</DialogTitle>
            </DialogHeader>
            <IntegrationHub />
          </DialogContent>
        </Dialog>

        <Dialog open={showVisualization} onOpenChange={setShowVisualization}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Visualization & Presentation Hub</DialogTitle>
            </DialogHeader>
            <VisualizationHub />
          </DialogContent>
        </Dialog>

        <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Integration Hub</DialogTitle>
            </DialogHeader>
            <IntegrationHub />
          </DialogContent>
        </Dialog>

        <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>SDLC Documentation Workflow</DialogTitle>
            </DialogHeader>
            <SimpleWorkflowDiagram processingSteps={processingSteps} />
          </DialogContent>
        </Dialog>

        <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>How SDLC Automation Works</DialogTitle>
            </DialogHeader>
            <HowItWorksVisualization />
          </DialogContent>
        </Dialog>

        <Dialog open={showPromptEngineering} onOpenChange={setShowPromptEngineering}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Prompt Engineering Interface</DialogTitle>
              <DialogDescription>
                Customize AI prompts for each step of the SDLC documentation generation process.
              </DialogDescription>
            </DialogHeader>
            <PromptEngineering onPromptUpdate={handlePromptUpdate} />
          </DialogContent>
        </Dialog>

        {/* Cache Choice Dialog */}
        <Dialog open={showCacheDialog} onOpenChange={setShowCacheDialog}>
          <DialogContent className="max-w-md w-[95vw] sm:w-full">
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
          <DialogContent className="max-w-md w-[95vw] sm:w-full">
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
              
              <div className="flex flex-col sm:flex-row gap-3">
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

        {/* Database Test Dialog */}
        <Dialog open={showDatabaseTest} onOpenChange={setShowDatabaseTest}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>AI Integration Database Tests</span>
                <Badge variant="outline">Task T1.2</Badge>
              </DialogTitle>
              <DialogDescription>
                Verify that your AI integration database schema is properly set up and functioning
              </DialogDescription>
            </DialogHeader>
            <DatabaseTestInterface user={user} />
          </DialogContent>
        </Dialog>

        {/* AICodeAssistant Dialog */}
        <Dialog open={showAICodeAssistant} onOpenChange={setShowAICodeAssistant}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>AI Code Assistant</DialogTitle>
              <DialogDescription>
                Use this tool to generate code snippets based on your SDLC documentation.
              </DialogDescription>
            </DialogHeader>
            <AICodeAssistant user={user} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

// Auth wrapper component
function AuthenticatedSDLCPlatform() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          window.location.href = '/signin';
          return;
        }
        
        setUser(user);
        
        // Check user role from database
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()
          
          if (roleData?.role) {
            setUserRole(roleData.role)
          }
        } catch (error) {
          console.log('No specific role found, using default user role')
          setUserRole('user')
        }
        
      } catch (error) {
        window.location.href = '/signin';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={user} userRole={userRole} onSignOut={handleSignOut} />
      <SDLCAutomationPlatform user={user} />
    </div>
  );
}

export default AuthenticatedSDLCPlatform;
