"use client"

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { dbService } from '@/lib/database-service';
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  ChevronLeft,
  ArrowRight,
  Download,
  MessageSquare,
  Share2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  BookOpen,
  Bookmark,
  Tag,
  Bell,
  Upload,
  Save,
  RotateCcw,
  Home,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Globe,
  Lock,
  Unlock,
  Key,
  Code,
  Terminal,
  Server,
  Cloud,
  Github,
  Rocket,
  Sparkles,
  Gift,
  Target,
  Building,
  Bot,
  Brain,
  Palette,
  Circle
} from "lucide-react"
import { HowItWorksVisualization } from "@/components/how-it-works-visualization"
import { PromptEngineering } from "@/components/prompt-engineering"
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { MermaidViewer } from '@/components/mermaid-viewer-fixed'
import { IntegrationHub } from '@/components/integration-hub'
import { VisualizationHub } from '@/components/visualization-hub'
import { GitDigestDashboard } from '@/components/gitdigest-dashboard'
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
import { SlackUICodeAssistant } from '@/components/slack-ui-code-assistant'
// Use require for the SDLC document parser instead of ES module import
const sdlcDocumentParser = require('@/lib/dist/sdlc-document-parser');
const { parseSDLCDocument, ensureDefaultSubsections } = sdlcDocumentParser;

import { GitHubProjectsCreator } from '@/components/github-projects-creator'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'
import BetaFeaturesIndicator from '@/components/beta-features-indicator'
import UsageIndicatorCompact from '@/components/usage-indicator-compact'
import EarlyAccessWaitingList from '@/components/early-access-waiting-list'
import ClaudeCodeDashboard from '@/components/claude-code-dashboard'
import { DocumentSelectionModal } from '@/components/document-selection-modal'
import { ProjectListViewer } from "@/components/project-list-viewer"
import { ProjectListViewerOptimized } from "@/components/project-list-viewer-optimized"
import { ProjectListSkeleton } from "@/components/project-list-skeleton"

// Type definitions for dashboard state
interface GeneratedDocuments {
  businessAnalysis?: string
  functionalSpec?: string
  technicalSpec?: string
  uxSpec?: string
  mermaidDiagrams?: string
  architecture?: string
  comprehensive?: string
  jiraEpic?: any
  confluencePage?: any
}

interface ConfigState {
  openaiKey: string
  aiModel?: string
  jiraUrl: string
  jiraProject?: string
  jiraEmail?: string
  jiraToken: string
  jiraAutoCreate: boolean
  confluenceUrl: string
  confluenceSpace?: string
  confluenceEmail?: string
  confluenceToken: string
  confluenceAutoCreate: boolean
  githubToken: string
  githubAutoCreate: boolean
  clickupToken: string
  clickupAutoCreate: boolean
  trelloToken: string
  trelloAutoCreate: boolean
  notionToken: string
  notionAutoCreate: boolean
  slackToken: string
  slackAutoCreate: boolean
  template?: string
  outputFormat?: string
  emailNotifications?: boolean
  slackNotifications?: boolean
}

interface RecentProject {
  id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at?: string | null
  createdAt?: string // For backward compatibility
  jira_project?: string | null
  confluence_space?: string | null
  jiraEpic?: string
  confluencePage?: string
  githubProject?: {
    id: string
    url: string
    number: number
    issueCount?: number
    repositoryName?: string
  }
  documents?: {
    businessAnalysis: string
    functionalSpec: string
    technicalSpec: string
    uxSpec: string
    architecture: string
    comprehensive?: string
    mermaidDiagrams?: string
  }
  hasComprehensiveContent?: boolean
  totalDocuments?: number
  jiraEpicUrl?: string
  jiraSummary?: any
  confluencePageUrl?: string
  projectType?: 'sdlc' | 'claude_code_assistant'
}

interface GitHubProjectConfig {
  projectName: string
  repositoryOwner: string
  repositoryName: string
  includeIssues: boolean
  includeCustomFields: boolean
  createPhaseBasedMilestones: boolean
  generateLabels: boolean
}

interface GitHubRepository {
  id: string
  full_name: string
  name: string
  owner: {
    login: string
  }
}

interface CustomPrompts {
  businessAnalysis?: string
  functionalSpec?: string
  technicalSpec?: string
  uxSpec?: string
  mermaidDiagrams?: string
}

// User Header Component with admin panel support
interface UserHeaderProps {
  user: any;
  userRole: string;
  onSignOut: () => void;
  onConfigureKeys?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, userRole, onSignOut, onConfigureKeys }) => {
  const { usage, loading: usageLoading } = useFreemiumUsage()
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getUsageBadgeColor = () => {
    if (!usage) return 'bg-gray-100 text-gray-600'
    
    if (usage.remainingProjects === 0) return 'bg-red-100 text-red-700 border-red-200'
    if (usage.remainingProjects === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getUsageText = () => {
    if (!usage) return 'Loading...'
    return `${usage.remainingProjects}/${usage.dailyLimit} Free`
  }

  return (
    <div className="bg-white border-b border-gray-200/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/img/SDLC.dev.logo.svg" 
                alt="SDLC.dev Logo" 
                className="h-12 w-auto filter drop-shadow-lg" 
              />
              <div className="flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-black tracking-tight">
                  <span className="hidden lg:inline text-2xl">SDLC AI Dashboard</span>
                  <span className="hidden sm:inline lg:hidden text-xl">SDLC Dashboard</span>
                  <span className="sm:hidden text-lg">SDLC</span>
                </div>
                <div className="text-xs text-gray-500 font-medium tracking-wide">
                  <span className="hidden sm:inline">Automate. Architect. Accelerate. With Code Yodha</span>
                  <span className="sm:hidden">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-600">Welcome back,</span>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            {/* Compact Usage Indicator */}
            <UsageIndicatorCompact 
              onViewDashboard={() => window.location.href = '/usage-dashboard'}
            />
            
            {/* Beta Features Indicator */}
            <BetaFeaturesIndicator 
              user={user}
              compact={true}
              showEnrollment={true}
            />
            
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
                    {/* Usage info in dropdown */}
                    {usage && (
                      <div className="flex items-center justify-between mt-2 pt-1 border-t">
                        <span className="text-xs text-muted-foreground">Today's usage:</span>
                        <span className={`text-xs font-medium ${usage.remainingProjects === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {usage.projectsToday}/{usage.dailyLimit}
                        </span>
                      </div>
                    )}
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
  githubProject?: {
    id: string
    url: string
    number: number
    issueCount?: number
    repositoryName?: string
  }
  documents: {
    businessAnalysis: string
    functionalSpec: string
    technicalSpec: string
    uxSpec: string
    architecture: string
    comprehensive?: string
    mermaidDiagrams?: string
  }
  hasComprehensiveContent: boolean
  totalDocuments: number
  projectType?: 'sdlc' | 'claude_code_assistant'
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


function SDLCAutomationPlatform({ user, userRole, onSignOut }: { user: any, userRole: string, onSignOut: () => void }) {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([])
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocuments>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showConfig, setShowConfig] = useState(false)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPromptEngineering, setShowPromptEngineering] = useState(false)
  const [showDatabaseTest, setShowDatabaseTest] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [showGitHubProjectDialog, setShowGitHubProjectDialog] = useState(false)
  const [showGitHubProjectDialogForExisting, setShowGitHubProjectDialogForExisting] = useState(false)
  const [showCacheDialog, setShowCacheDialog] = useState(false)
  const [showSlackUICodeAssistant, setShowSlackUICodeAssistant] = useState(false)
  const [selectedProjectForGitHub, setSelectedProjectForGitHub] = useState<ProjectResult | null>(null)
  const [isCreatingGitHubProject, setIsCreatingGitHubProject] = useState(false)
  const [isExportingToJira, setIsExportingToJira] = useState(false)
  const [isExportingToConfluence, setIsExportingToConfluence] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isLoadingGitHubRepos, setIsLoadingGitHubRepos] = useState(false)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [isLoadingRecentProjects, setIsLoadingRecentProjects] = useState(true)
  const [totalProjectCount, setTotalProjectCount] = useState<number>(0)

  const [toolkitExpanded, setToolkitExpanded] = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('sdlc')
  const [gitHubRepositories, setGitHubRepositories] = useState<GitHubRepository[]>([])
  const [gitHubProjectConfig, setGitHubProjectConfig] = useState<GitHubProjectConfig>({
    projectName: '',
    repositoryOwner: '',
    repositoryName: '',
    includeIssues: true,
    includeCustomFields: true,
    createPhaseBasedMilestones: true,
    generateLabels: true
  })
  const [customPrompts, setCustomPrompts] = useState<CustomPrompts>({})
  
  // Configuration state
  const [config, setConfig] = useState<ConfigState>({
    openaiKey: '',
    aiModel: 'gpt-4',
    jiraUrl: '',
    jiraProject: '',
    jiraEmail: '',
    jiraToken: '',
    jiraAutoCreate: false,
    confluenceUrl: '',
    confluenceSpace: '',
    confluenceEmail: '',
    confluenceToken: '',
    confluenceAutoCreate: false,
    githubToken: '',
    githubAutoCreate: false,
    clickupToken: '',
    clickupAutoCreate: false,
    trelloToken: '',
    trelloAutoCreate: false,
    notionToken: '',
    notionAutoCreate: false,
    slackToken: '',
    slackAutoCreate: false,
    template: 'comprehensive',
    outputFormat: 'markdown',
    emailNotifications: false,
    slackNotifications: false
  })
  
  // ✨ NEW: Enhanced UX state variables
  const [showRefreshWarning, setShowRefreshWarning] = useState(false)
  const [currentStreamingStep, setCurrentStreamingStep] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({})
  const [stepStreamingWindows, setStepStreamingWindows] = useState<Record<string, boolean>>({})
  
  // Add freemium usage hook
  const { usage, refetch: refetchUsage, incrementUsage } = useFreemiumUsage()
  
  // Cache management state
  const [pendingCachedResults, setPendingCachedResults] = useState<any>(null)
  const [showDocumentSelectionModal, setShowDocumentSelectionModal] = useState(false)

  // Add new state for generation summary
  const [showGenerationSummary, setShowGenerationSummary] = useState(false)
  const [generatedDocumentsSummary, setGeneratedDocumentsSummary] = useState<Record<string, boolean>>({})
  
  // Context optimization state
  const [contextOptimizationStatus, setContextOptimizationStatus] = useState<Record<string, {
    isOptimizing: boolean
    originalSize?: number
    optimizedSize?: number
  }>>({})

  // Add ref to track current project ID for immediate access
  const currentProjectIdRef = useRef<string | null>(null)

  // Reset project ID when starting new generation
  const resetProjectId = () => {
    currentProjectIdRef.current = null
    console.log('🔄 Reset project ID for new generation')
  }

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
    setCustomPrompts((prev: CustomPrompts) => ({
      ...prev,
      [promptType]: promptContent
    }))
  }

  // Handle document selection from DocumentSelectionModal
  const handleDocumentSelection = (selectedDocuments: string[]) => {
    setShowDocumentSelectionModal(false)
    generateFreshDocuments(selectedDocuments)
  }



  // Initialize processing steps - conditionally include Jira/Confluence based on automation settings
  const getInitialProcessingSteps = (): ProcessingStep[] => {
    const coreSteps: ProcessingStep[] = [
      { id: "analysis", name: "Business Analysis", status: "pending" as const, progress: 0 },
      { id: "functional", name: "Functional Specification", status: "pending" as const, progress: 0 },
      { id: "technical", name: "Technical Specification", status: "pending" as const, progress: 0 },
      { id: "ux", name: "UX Specification", status: "pending" as const, progress: 0 },
      { id: "mermaid", name: "Architecture", status: "pending" as const, progress: 0 },
    ]
    
    // Add integration steps only if automation is enabled
    if (config.jiraAutoCreate && config.jiraUrl && config.jiraToken) {
      coreSteps.push({ id: "jira", name: "JIRA Epic Creation", status: "pending" as const, progress: 0 })
    }
    if (config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken) {
      coreSteps.push({ id: "confluence", name: "Confluence Documentation", status: "pending" as const, progress: 0 })
    }
    if (coreSteps.length > 5) { // More than core 5 steps means integrations are enabled
      coreSteps.push({ id: "linking", name: "Cross-platform Linking", status: "pending" as const, progress: 0 })
    }
    
    return coreSteps
  }

  // Get optimized project summaries from database for Recent Projects display
  const getCachedProjectsOptimized = async (): Promise<{ projects: any[], totalCount: number }> => {
    const projectResults: any[] = []
    let totalProjectCount = 0
    
    // Get authenticated user projects
    if (user?.id) {
      try {
        console.log('🔍 Fetching project summaries for user:', user.id, user.email)
        
        // Get total project count
        totalProjectCount = await dbService.getProjectCount(user.id)
        console.log('📊 Total project count:', totalProjectCount)
        
        // Fetch SDLC project summaries (minimal data)
        const sdlcProjectSummaries = await dbService.getProjectSummariesByUser(user.id, 50, 0)
        console.log('🔍 SDLC project summaries:', sdlcProjectSummaries.length)
        
        // Fetch project generation summaries (minimal data)
        // TODO: Fix this - table might not exist in some databases
        let projectGenerationSummaries: any[] = []
        try {
          projectGenerationSummaries = await dbService.getProjectGenerationSummaries(user.id, 50, 0)
          console.log('🔍 Project generation summaries:', projectGenerationSummaries.length)
        } catch (error) {
          console.warn('Could not fetch project generation summaries, continuing without them')
        }
        
        // Convert to display format with minimal data
        for (const project of sdlcProjectSummaries) {
          projectResults.push({
            ...project,
            projectType: 'sdlc' as const
          })
        }
        
        // Add all project generations (Claude Code Assistant, etc.)
        for (const gen of projectGenerationSummaries) {
          // Determine project type and title based on generation_type
          let projectType: 'sdlc' | 'claude_code_assistant' = 'sdlc'
          let title = ''
          
          // Extract project type from generation_data if available
          const projectTypeFromData = gen.generation_data?.project_type || gen.generation_data?.projectType
          
          switch (gen.generation_type) {
            case 'claude_code_assistant':
              projectType = 'claude_code_assistant'
              title = gen.generation_data?.title || `Claude Code Assistant - ${new Date(gen.created_at).toLocaleDateString()}`
              break
            case 'sdlc_generation':
            case 'sdlc_documents':
              projectType = 'sdlc'
              title = gen.generation_data?.title || `SDLC Generation - ${new Date(gen.created_at).toLocaleDateString()}`
              break
            default:
              // Check if it's a Claude Code Assistant based on generation_data
              if (projectTypeFromData === 'claude_code_assistant') {
                projectType = 'claude_code_assistant'
                title = gen.generation_data?.title || `Claude Code Assistant - ${new Date(gen.created_at).toLocaleDateString()}`
              } else {
                // For any other generation types, use a generic title
                projectType = 'sdlc'
                title = gen.generation_data?.title || `${gen.generation_type} - ${new Date(gen.created_at).toLocaleDateString()}`
              }
          }
          
          projectResults.push({
            id: gen.id,
            title,
            status: 'completed',
            created_at: gen.created_at,
            projectType,
            generation_type: gen.generation_type
          })
        }
        
        // Sort by creation date
        projectResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        return { projects: projectResults, totalCount: totalProjectCount }
      } catch (error) {
        console.error('Error fetching project summaries:', error)
        return { projects: [], totalCount: 0 }
      }
    }
    
    return { projects: [], totalCount: 0 }
  }

  // Get all cached results from database for Recent Projects display (original method)
  const getCachedProjects = async (): Promise<ProjectResult[]> => {
    const projectResults: ProjectResult[] = []
    
    // Get authenticated user projects
    if (user?.id) {
    
    try {
      console.log('🔍 Fetching projects for user:', user.id, user.email)
      
      // Fetch SDLC projects from sdlc_projects table
      const sdlcProjects = await dbService.getProjectsByUser(user.id)
      console.log('🔍 Raw SDLC projects from database:', sdlcProjects.length, sdlcProjects)
      
      // Fetch project generations from project_generations table with explicit user filtering
      const projectGenerations = await dbService.getProjectGenerations(user.id, 100, 0)
      console.log('🔍 Raw project generations from database:', projectGenerations.length, projectGenerations)
      
      // Additional safety check: filter out any projects that don't belong to current user
      const filteredProjectGenerations = projectGenerations.filter(gen => {
        const belongsToUser = gen.user_id === user.id
        if (!belongsToUser) {
          console.warn('⚠️ Found project generation not belonging to current user:', {
            generationId: gen.id,
            generationUserId: gen.user_id,
            currentUserId: user.id,
            generationType: gen.generation_type
          })
        }
        return belongsToUser
      })
      
      console.log('🔍 Filtered project generations (user-specific):', filteredProjectGenerations.length)
      
      // Convert database projects to ProjectResult format
      
      // Process SDLC projects
      for (const project of sdlcProjects) {
        try {
          console.log('🔄 Processing SDLC project:', project.id, project.title)
          
          const documents = await dbService.getDocumentsByProject(project.id)
          const integrations = await dbService.getIntegrationsByProject(project.id)
          
          console.log('📄 Documents for project', project.id, ':', documents.length)
          console.log('🔗 Integrations for project', project.id, ':', integrations.length)
          
          // Find documents by their actual database types (snake_case)
          const comprehensiveDoc = documents.find(d => d.document_type === 'comprehensive_sdlc')
          const businessDoc = documents.find(d => d.document_type === 'business_analysis')
          const functionalDoc = documents.find(d => d.document_type === 'functional_spec')
          const technicalDoc = documents.find(d => d.document_type === 'technical_spec')
          const uxDoc = documents.find(d => d.document_type === 'ux_spec')
          const architectureDoc = documents.find(d => d.document_type === 'architecture')
          const mermaidDoc = documents.find(d => d.document_type === 'mermaid_diagrams')
          
          // Handle multiple comprehensive_sdlc documents (enhanced generation pattern)
          const comprehensiveDocs = documents.filter(d => d.document_type === 'comprehensive_sdlc')
          
          // Initialize content variables - use individual documents directly
          let businessContent = businessDoc?.content || ''
          let functionalContent = functionalDoc?.content || ''
          let technicalContent = technicalDoc?.content || ''
          let uxContent = uxDoc?.content || ''
          let mermaidContent = mermaidDoc?.content || ''
          
          // Only parse comprehensive documents if individual documents don't exist
          if (comprehensiveDoc?.content && !businessContent && !functionalContent && !technicalContent && !uxContent) {
            try {
              const parsedComprehensive = JSON.parse(comprehensiveDoc.content)
              console.log('🔍 Parsing comprehensive document for individual content extraction')
              
              if (typeof parsedComprehensive === 'object' && parsedComprehensive !== null) {
                // Extract individual documents from the comprehensive JSON only if individual docs don't exist
                businessContent = parsedComprehensive.businessAnalysis || businessContent
                functionalContent = parsedComprehensive.functionalSpec || functionalContent
                technicalContent = parsedComprehensive.technicalSpec || technicalContent
                uxContent = parsedComprehensive.uxSpec || uxContent
                mermaidContent = parsedComprehensive.mermaidDiagrams || mermaidContent
                
                console.log('📋 Extracted individual documents from comprehensive:', {
                  hasBusiness: !!parsedComprehensive.businessAnalysis,
                  hasFunctional: !!parsedComprehensive.functionalSpec,
                  hasTechnical: !!parsedComprehensive.technicalSpec,
                  hasUx: !!parsedComprehensive.uxSpec,
                  hasMermaid: !!parsedComprehensive.mermaidDiagrams
                })
              }
            } catch (error) {
              console.warn('Failed to parse comprehensive document as JSON:', error)
            }
          }
          
          // Parse JSON content if it's stored as JSON string - make it specific to document type
          const parseContent = (content: string, documentType?: string): string => {
            if (!content) return ''
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(content)
              console.log('🔍 Parsed JSON content for', documentType, ':', {
                isObject: typeof parsed === 'object',
                keys: typeof parsed === 'object' ? Object.keys(parsed) : [],
                hasBusinessAnalysis: typeof parsed === 'object' && parsed.businessAnalysis,
                hasFunctionalSpec: typeof parsed === 'object' && parsed.functionalSpec,
                hasTechnicalSpec: typeof parsed === 'object' && parsed.technicalSpec,
                hasUxSpec: typeof parsed === 'object' && parsed.uxSpec,
                hasMermaidDiagrams: typeof parsed === 'object' && parsed.mermaidDiagrams
              })
              
              // If it's an object with document properties, extract the specific content
              if (typeof parsed === 'object' && parsed !== null) {
                // If we know the document type, extract that specific content
                if (documentType && parsed[documentType]) {
                  console.log(`🔍 Extracting ${documentType} content from JSON`)
                  return parsed[documentType]
                }
                
                // Fallback: check for individual document types in order
                if (parsed.businessAnalysis) return parsed.businessAnalysis
                if (parsed.functionalSpec) return parsed.functionalSpec
                if (parsed.technicalSpec) return parsed.technicalSpec
                if (parsed.uxSpec) return parsed.uxSpec
                if (parsed.mermaidDiagrams) return parsed.mermaidDiagrams
                
                // If it's a comprehensive object, return the first available content
                const firstContent = Object.values(parsed).find(val => typeof val === 'string' && val.length > 0)
                if (firstContent) return firstContent as string
              }
              // If parsing succeeded but no content found, return original
              return content
            } catch (error) {
              // If it's not JSON, return as-is (plain markdown)
              console.log('🔍 Content is not JSON, treating as plain markdown')
              return content
            }
          }
          
          // Individual documents are now stored as plain markdown, no JSON parsing needed
          // businessContent, functionalContent, technicalContent, uxContent are already set from individual docs
          
          // If we have multiple comprehensive_sdlc documents, try to match content by keywords
          if (comprehensiveDocs.length > 1) {
            console.log(`📊 Found ${comprehensiveDocs.length} comprehensive documents, attempting smart content mapping`)
            
            comprehensiveDocs.forEach((doc, index) => {
              const content = parseContent(doc.content || '', 'comprehensive') || doc.content || ''
              const contentLower = content.toLowerCase()
              
              // Business Analysis keywords
              if (!businessContent && (
                contentLower.includes('business analysis') || 
                contentLower.includes('executive summary') ||
                contentLower.includes('stakeholder') ||
                contentLower.includes('business objective')
              )) {
                businessContent = content
                console.log(`📋 Mapped comprehensive doc ${index} to Business Analysis`)
              }
              // Functional Spec keywords
              else if (!functionalContent && (
                contentLower.includes('functional') ||
                contentLower.includes('system overview') ||
                contentLower.includes('api specification') ||
                contentLower.includes('data architecture')
              )) {
                functionalContent = content
                console.log(`📋 Mapped comprehensive doc ${index} to Functional Spec`)
              }
              // Technical Spec keywords
              else if (!technicalContent && (
                contentLower.includes('technical') ||
                contentLower.includes('system architecture') ||
                contentLower.includes('technology stack') ||
                contentLower.includes('deployment')
              )) {
                technicalContent = content
                console.log(`📋 Mapped comprehensive doc ${index} to Technical Spec`)
              }
              // UX Spec keywords
              else if (!uxContent && (
                contentLower.includes('ux ') ||
                contentLower.includes('user experience') ||
                contentLower.includes('personas') ||
                contentLower.includes('wireframe') ||
                contentLower.includes('design system')
              )) {
                uxContent = content
                console.log(`📋 Mapped comprehensive doc ${index} to UX Spec`)
              }
            })
          }
          
          // Create documents object with individual content, only use fallback if no individual content exists
          const hasIndividualContent = businessContent || functionalContent || technicalContent || uxContent
          const fallbackContent = !hasIndividualContent ? (
            parseContent(comprehensiveDoc?.content || '', 'comprehensive') || 
            (architectureDoc?.content ? `# Project Documentation\n\nThis project contains architecture documentation. Please check the **Architecture** tab for detailed diagrams and system design.\n\n${parseContent(architectureDoc.content, 'architecture')}` : '') ||
            (mermaidDoc?.content ? `# Project Documentation\n\nThis project contains Mermaid diagrams. Please check the **Architecture** tab for visual documentation.\n\n${parseContent(mermaidDoc.content, 'mermaidDiagrams')}` : '') ||
            '# Project Documentation\n\nThis project appears to be incomplete. Please regenerate the documentation to get full content.'
          ) : ''
          
          const documentsObj = {
            businessAnalysis: businessContent || (hasIndividualContent ? '' : fallbackContent),
            functionalSpec: functionalContent || (hasIndividualContent ? '' : fallbackContent),
            technicalSpec: technicalContent || (hasIndividualContent ? '' : fallbackContent),
            uxSpec: uxContent || (hasIndividualContent ? '' : fallbackContent),
            architecture: mermaidContent || architectureDoc?.content || mermaidDoc?.content || (hasIndividualContent ? '' : fallbackContent),
            comprehensive: comprehensiveDoc?.content || (hasIndividualContent ? '' : fallbackContent),
            mermaidDiagrams: mermaidContent || mermaidDoc?.content || architectureDoc?.content || ''
          }
          
          console.log('📋 Content summary for project', project.id, ':', {
            hasBusinessDoc: !!businessDoc?.content,
            hasFunctionalDoc: !!functionalDoc?.content,
            hasTechnicalDoc: !!technicalDoc?.content,
            hasUxDoc: !!uxDoc?.content,
            hasArchitectureDoc: !!architectureDoc?.content,
            hasComprehensiveDoc: !!comprehensiveDoc?.content,
            comprehensiveLength: comprehensiveDoc?.content?.length || 0,
            finalBusinessLength: documentsObj.businessAnalysis?.length || 0,
            finalFunctionalLength: documentsObj.functionalSpec?.length || 0
          })
          
          // Find Jira, Confluence, and GitHub integrations
          const jiraIntegration = integrations.find(i => i.integration_type === 'jira')
          const confluenceIntegration = integrations.find(i => i.integration_type === 'confluence')
          const githubIntegration = integrations.find(i => i.integration_type === 'github_projects')
          
          const projectResult = {
            id: project.id,
            title: project.title,
            status: project.status,
            createdAt: project.created_at,
            jiraEpic: jiraIntegration?.external_url || '',
            confluencePage: confluenceIntegration?.external_url || '',
            githubProject: githubIntegration ? {
              id: githubIntegration.external_id,
              url: githubIntegration.external_url,
              number: githubIntegration.metadata?.projectNumber || 0,
              issueCount: githubIntegration.metadata?.issueCount || 0,
              repositoryName: githubIntegration.metadata?.repositoryName || ''
            } : undefined,
            documents: documentsObj,
            hasComprehensiveContent: !!comprehensiveDoc?.content,
            totalDocuments: documents.length,
            projectType: 'sdlc' as const
          }
          
          projectResults.push(projectResult)
          console.log('✅ Successfully processed SDLC project:', project.id, 'with', documents.length, 'documents')
          
        } catch (projectError) {
          console.error('❌ Error processing individual SDLC project:', project.id, projectError)
          // Continue processing other projects even if one fails
        }
      }
      
      // Process project generations (Claude Code Assistant projects)
      for (const generation of projectGenerations) {
        try {
          console.log('🔄 Processing project generation:', generation.id, generation.project_type)
          
          // Create a project result for Claude Code Assistant generations
          const projectResult = {
            id: generation.id,
            title: `Claude Code Assistant - ${generation.project_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
            status: generation.success ? 'completed' : 'failed',
            createdAt: generation.created_at,
            jiraEpic: '',
            confluencePage: '',
            githubProject: undefined,
            documents: {
              businessAnalysis: '',
              functionalSpec: '',
              technicalSpec: '',
              uxSpec: '',
              architecture: '',
              comprehensive: '',
              mermaidDiagrams: ''
            },
            hasComprehensiveContent: true,
            totalDocuments: 1,
            projectType: 'claude_code_assistant' as const
          }
          
          projectResults.push(projectResult)
          console.log('✅ Successfully processed Claude Code Assistant project:', generation.id)
          
        } catch (generationError) {
          console.error('❌ Error processing individual project generation:', generation.id, generationError)
          // Continue processing other generations even if one fails
        }
      }
      
      // Sort all projects by creation date (newest first)
      projectResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      console.log('🎯 Final authenticated project results:', projectResults.length, 'total projects (', sdlcProjects.length, 'SDLC +', projectGenerations.length, 'Claude Code Assistant)')
    } catch (error) {
      console.error('Error fetching authenticated cached projects:', error)
    }
    }
    


    // Sort all projects by creation date (newest first)
    projectResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log('🎯 Final project results:', projectResults.length, 'total projects')
    console.log('🔍 Debug: Returning projects to dashboard:', projectResults.map(p => ({ id: p.id, title: p.title, type: p.projectType })))
    return projectResults
  }

  // Clear potentially corrupted cache on component mount
  useEffect(() => {
    const clearCorruptedCache = () => {
      try {
        // Check for and clear any corrupted localStorage entries
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && key.includes('sdlc-cache')) {
            try {
              const value = localStorage.getItem(key)
              if (value) {
                JSON.parse(value) // Test if parseable
              }
            } catch (parseError) {
              console.warn(`Removing corrupted cache entry: ${key}`)
              localStorage.removeItem(key)
            }
          }
        }
      } catch (error) {
        console.warn('Error during cache cleanup:', error)
      }
    }
    
    clearCorruptedCache()
  }, [])

  // Load user configuration and recent projects on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user configuration for authenticated users
        if (user?.id) {
          const supabase = createClient()
          
          try {
            const userConfig = await dbService.getEnhancedUserConfiguration(user.id)
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
          } catch (configError) {
            console.warn('Could not load user configuration (this is normal for new users):', configError)
            // Continue without user config - user can set it up later
          }
        }
        
        // Load recent projects (both authenticated and anonymous) - using optimized method
        try {
          setIsLoadingRecentProjects(true)
          const { projects, totalCount } = await getCachedProjectsOptimized()
          setRecentProjects(projects)
          setTotalProjectCount(totalCount)
        } catch (projectsError) {
          console.warn('Could not load recent projects:', projectsError)
          setRecentProjects([])
        } finally {
          setIsLoadingRecentProjects(false)
        }
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
    
    // Save the API key to database if user is authenticated
    if (user?.id) {
      try {
        await dbService.upsertUserConfiguration(user.id, {
          openai_api_key: tempApiKey.trim()
        })
        console.log("✅ Saved API key to user configuration")
      } catch (error) {
        console.warn("⚠️ Failed to save API key to database:", error)
        // Continue anyway - the key is in memory
      }
    }
    
    // Continue with generation now that we have the API key
    await generateFreshDocuments()
  }

  // GitHub Project Creation Functions
  const loadGitHubRepositories = async () => {
    setIsLoadingGitHubRepos(true)
    try {
      const response = await fetch('/api/integrations/github-projects?action=repositories', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setGitHubRepositories(data.repositories || [])
      } else {
        console.warn('Failed to load GitHub repositories')
        setGitHubRepositories([])
      }
    } catch (error) {
      console.error('Error loading GitHub repositories:', error)
      setGitHubRepositories([])
    } finally {
      setIsLoadingGitHubRepos(false)
    }
  }

  // Helper function to parse document sections into subsections
  const parseDocumentSections = (content: string): Record<string, string> => {
    if (!content || typeof content !== 'string') {
      return {};
    }

    const sections: Record<string, string> = {};
    
    // Try to split by markdown headers (## Section Title)
    const headerRegex = /^##\s+([^\n]+?)$/gm;
    let match;
    let lastIndex = 0;
    let lastTitle = '';
    
    // First pass - identify all section headers
    const headers: {title: string, index: number}[] = [];
    while ((match = headerRegex.exec(content)) !== null) {
      headers.push({
        title: match[1].trim(),
        index: match.index
      });
    }
    
    // Second pass - extract content between headers
    for (let i = 0; i < headers.length; i++) {
      const currentHeader = headers[i];
      const nextHeader = headers[i + 1];
      const sectionEnd = nextHeader ? nextHeader.index : content.length;
      
      // Get section content (excluding the header itself)
      const headerEndIndex = content.indexOf('\n', currentHeader.index);
      const sectionStart = headerEndIndex !== -1 ? headerEndIndex + 1 : currentHeader.index + currentHeader.title.length + 3;
      
      // Extract and clean up section content
      const sectionContent = content.substring(sectionStart, sectionEnd).trim();
      
      // Convert title to camelCase for the key
      const sectionKey = currentHeader.title
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '');
      
      sections[sectionKey] = sectionContent;
    }
    
    // If no sections were found, create a default section
    if (Object.keys(sections).length === 0) {
      sections['content'] = content;
    }
    
    return sections;
  };

  const handleCreateGitHubProject = async () => {
    if (!gitHubProjectConfig.projectName.trim()) {
      setErrorMessage("Please enter a project name")
      return
    }

    if (!gitHubProjectConfig.repositoryOwner || !gitHubProjectConfig.repositoryName) {
      setErrorMessage("Please select a repository")
      return
    }

    setIsCreatingGitHubProject(true)
    setErrorMessage("")

    try {
      // Parse the SDLC document into the required structure
      const parsedDocument = parseSDLCDocument({
        businessAnalysis: generatedDocuments.businessAnalysis,
        functionalSpec: generatedDocuments.functionalSpec,
        technicalSpec: generatedDocuments.technicalSpec,
        uxSpec: generatedDocuments.uxSpec,
        mermaidDiagrams: generatedDocuments.mermaidDiagrams
      })
      
      // Ensure we have default subsections if parsing didn't find any
      const sdlcDocument = ensureDefaultSubsections(parsedDocument)
      
      const response = await fetch('/api/integrations/github-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-sdlc-project',
          ownerId: gitHubProjectConfig.repositoryOwner, // GitHub user/org that owns the repository
          projectTitle: gitHubProjectConfig.projectName.trim(),
          sdlcDocument,
          repositoryOwner: gitHubProjectConfig.repositoryOwner,
          repositoryName: gitHubProjectConfig.repositoryName,
          includeIssues: gitHubProjectConfig.includeIssues,
          includeCustomFields: gitHubProjectConfig.includeCustomFields,
          options: {
            createPhaseBasedMilestones: gitHubProjectConfig.createPhaseBasedMilestones,
            generateLabels: gitHubProjectConfig.generateLabels
          }
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccessMessage(`🎉 GitHub project "${gitHubProjectConfig.projectName}" created successfully!`)
        setShowGitHubProjectDialog(false)
        
        // Optionally reload recent projects to show the new integration
        const { projects, totalCount } = await getCachedProjectsOptimized()
        setRecentProjects(projects)
        setTotalProjectCount(totalCount)
      } else {
        throw new Error(result.error || 'GitHub project creation failed')
      }
    } catch (error) {
      console.error('GitHub project creation error:', error)
      setErrorMessage(`Failed to create GitHub project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingGitHubProject(false)
    }
  }

  const openGitHubProjectDialog = () => {
    // Auto-populate project name from input
    const projectName = extractProjectName(input)
    setGitHubProjectConfig(prev => ({
      ...prev,
      projectName: projectName || `SDLC Project - ${new Date().toLocaleDateString()}`
    }))
    
    // Load repositories when opening dialog
    loadGitHubRepositories()
    setShowGitHubProjectDialog(true)
  }

  // GitHub Project Creation for Existing Projects
  // selectedProjectForGitHub is already declared above
  
  const openGitHubProjectDialogForProject = (project: any) => {
    setSelectedProjectForGitHub(project)
    setGitHubProjectConfig(prev => ({
      ...prev,
      projectName: project.title || `SDLC Project - ${new Date().toLocaleDateString()}`
    }))
    
    // Load repositories when opening dialog
    loadGitHubRepositories()
    setShowGitHubProjectDialog(true)
  }

  const handleCreateGitHubProjectForExisting = async () => {
    if (!selectedProjectForGitHub) {
      setErrorMessage("No project selected")
      return
    }

    if (!gitHubProjectConfig.projectName.trim()) {
      setErrorMessage("Please enter a project name")
      return
    }

    if (!gitHubProjectConfig.repositoryOwner || !gitHubProjectConfig.repositoryName) {
      setErrorMessage("Please select a repository")
      return
    }

    setIsCreatingGitHubProject(true)
    setErrorMessage("")

    try {
      // Parse the SDLC document into the required structure
      const parsedDocument = parseSDLCDocument({
        businessAnalysis: selectedProjectForGitHub.documents.businessAnalysis,
        functionalSpec: selectedProjectForGitHub.documents.functionalSpec,
        technicalSpec: selectedProjectForGitHub.documents.technicalSpec,
        uxSpec: selectedProjectForGitHub.documents.uxSpec,
        comprehensive: selectedProjectForGitHub.documents.comprehensive,
        mermaidDiagrams: selectedProjectForGitHub.documents.mermaidDiagrams,
        architecture: selectedProjectForGitHub.documents.architecture
      })
      
      // Ensure we have default subsections if parsing didn't find any
      const sdlcDocument = ensureDefaultSubsections(parsedDocument)
      
      // Log the document structure for debugging
      console.log('Parsed document structure:', 
        Object.keys(sdlcDocument).map(section => 
          `${section}: ${Object.keys(sdlcDocument[section] || {}).length} subsections`
        )
      )
      
      const response = await fetch('/api/integrations/github-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-sdlc-project',
          ownerId: gitHubProjectConfig.repositoryOwner, // GitHub user/org that owns the repository
          projectTitle: gitHubProjectConfig.projectName.trim(),
          sdlcDocument,
          repositoryOwner: gitHubProjectConfig.repositoryOwner,
          repositoryName: gitHubProjectConfig.repositoryName,
          includeIssues: gitHubProjectConfig.includeIssues,
          includeCustomFields: gitHubProjectConfig.includeCustomFields,
          options: {
            createPhaseBasedMilestones: gitHubProjectConfig.createPhaseBasedMilestones,
            generateLabels: gitHubProjectConfig.generateLabels
          }
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccessMessage(`🎉 GitHub project "${gitHubProjectConfig.projectName}" created successfully!`)
        setShowGitHubProjectDialog(false)
        setSelectedProjectForGitHub(null)
        
        // Optionally reload recent projects to show the new integration
        const { projects: updatedProjects, totalCount } = await getCachedProjectsOptimized()
        setRecentProjects(updatedProjects)
        setTotalProjectCount(totalCount)
      } else {
        throw new Error(result.error || 'GitHub project creation failed')
      }
    } catch (error) {
      console.error('GitHub project creation error:', error)
      setErrorMessage(`Failed to create GitHub project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingGitHubProject(false)
    }
  }

  // Helper function to check if content contains actual diagram content
  const hasDiagramContent = (content: string): boolean => {
    if (!content || content.trim() === '') return false
    
    // Check for Mermaid diagram syntax
    const mermaidKeywords = ['graph', 'flowchart', 'erDiagram', 'sequenceDiagram', 'journey', 'pie', 'gantt', 'classDiagram', 'stateDiagram']
    const hasMermaidSyntax = mermaidKeywords.some(keyword => content.toLowerCase().includes(keyword))
    
    // Check for code blocks that might contain diagrams
    const hasCodeBlocks = /```(?:mermaid)?[\s\S]*?```/g.test(content)
    
    return hasMermaidSyntax || hasCodeBlocks
  }

  // Helper function to parse Mermaid content into separate diagrams
  const parseMermaidDiagrams = (mermaidContent: string) => {
    if (!mermaidContent || mermaidContent.trim() === '') {
      return {}
    }

    // Only parse if content actually contains diagram syntax
    if (!hasDiagramContent(mermaidContent)) {
      return {}
    }

    // Clean the content first - remove any streaming artifacts
    let cleanedContent = mermaidContent
      .replace(/data:\s*\{[^}]*\}/g, '') // Remove data: {...} lines
      .replace(/data:\s*\[DONE\]/g, '') // Remove [DONE] markers
      .replace(/^\s*[\r\n]+/gm, '') // Remove empty lines
      .trim()
    
    if (!cleanedContent || cleanedContent.length < 10) {
      return {}
    }

    // Check for markdown headers and code blocks
    const hasMarkdownHeaders = /^\s*#+\s+.+$/m.test(cleanedContent)
    const hasMermaidCodeBlocks = /```(?:mermaid)?[\s\S]*?```/g.test(cleanedContent)

    // Fully generic approach - create an empty diagram object with no hardcoded keys
    const diagrams: Record<string, string> = {}

    // Try to split by both markdown headers and Mermaid section comments
    const sectionMarkers: {name: string, index: number}[] = []
    let foundSections = false
    
    // First, try to find markdown headers like "## System Architecture Diagram"
    const markdownHeaderRegex = /^##\s+([^\n]+?)\s*(?:Diagram)?\s*$/gmi
    let match
    while ((match = markdownHeaderRegex.exec(cleanedContent)) !== null) {
      foundSections = true
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '')
      sectionMarkers.push({
        name: sectionName,
        index: match.index + match[0].length
      })
    }
    
    // Also try Mermaid section comments like "%% System Architecture Diagram"
    const sectionCommentRegex = /%%\s*([A-Za-z\s]+)\s*Diagram/gi
    sectionCommentRegex.lastIndex = 0 // Reset regex state
    while ((match = sectionCommentRegex.exec(cleanedContent)) !== null) {
      foundSections = true
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '')
      sectionMarkers.push({
        name: sectionName,
        index: match.index + match[0].length
      })
    }
    
    // Sort section markers by index to process them in order
    sectionMarkers.sort((a, b) => a.index - b.index)
    
    // Now process the sections with known boundaries
    if (sectionMarkers.length > 0) {
      for (let i = 0; i < sectionMarkers.length; i++) {
        const currentMarker = sectionMarkers[i]
        const nextMarker = sectionMarkers[i + 1]
        const endIndex = nextMarker ? nextMarker.index : cleanedContent.length
        
        // Extract the diagram content
        const diagramContent = cleanedContent.substring(currentMarker.index, endIndex).trim()
        
        // Store each diagram with its own section name as the key
        // No hardcoded categories - fully generic
        diagrams[currentMarker.name] = diagramContent
      }
    }
    
    // If no sections found, try to identify diagram types directly
    if (!foundSections) {
      // Split by markdown headers or code blocks if present
      let diagramBlocks: string[] = []
      
      if (hasMermaidCodeBlocks) {
        const codeBlockRegex = /```(?:mermaid)?\s*([\s\S]*?)```/g
        let codeMatch
        while ((codeMatch = codeBlockRegex.exec(cleanedContent)) !== null) {
          if (codeMatch[1] && codeMatch[1].trim()) {
            diagramBlocks.push(codeMatch[1].trim())
          }
        }
      } else {
        // Try to split by common diagram type declarations
        const diagramTypeRegex = /(graph|flowchart|sequenceDiagram|erDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitGraph)/gi
        let lastTypeIndex = 0
        let typeMatch
        
        while ((typeMatch = diagramTypeRegex.exec(cleanedContent)) !== null) {
          if (typeMatch.index > lastTypeIndex) {
            const previousContent = cleanedContent.substring(lastTypeIndex, typeMatch.index).trim()
            if (previousContent && /^\w+\s/.test(previousContent)) {
              diagramBlocks.push(previousContent)
            }
          }
          lastTypeIndex = typeMatch.index
        }
        
        // Add the last block
        if (lastTypeIndex < cleanedContent.length) {
          const lastBlock = cleanedContent.substring(lastTypeIndex).trim()
          if (lastBlock) diagramBlocks.push(lastBlock)
        }
      }
      
      // Categorize each diagram block - using a fully generic approach
      diagramBlocks.forEach((block, index) => {
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
      })
    }

    return diagrams
  }

  // Helper function to check for meaningful content
  const hasMeaningfulContent = (content: string) => {
    if (!content || content.length < 200) return false
    
    // Check for placeholder or incomplete content
    const placeholderPatterns = [
      /this project appears to be incomplete/i,
      /please regenerate the documentation/i,
      /placeholder content/i,
      /incomplete documentation/i,
      /no content available/i,
      /content will be generated/i,
      /documentation is empty/i
    ]
    
    // If any placeholder pattern is found, consider it incomplete
    for (const pattern of placeholderPatterns) {
      if (pattern.test(content)) {
        return false
      }
    }
    
    // Check for minimum meaningful content (at least 3 sections or substantial text)
    const sections = content.split(/#{1,6}\s+/).length
    const hasSubstantialContent = content.length > 500 || sections > 3
    
    return hasSubstantialContent
  }

  const loadCachedResults = (cached: any) => {
    try {
    console.log('Loading cached results:', cached)
      
      if (!cached || typeof cached !== 'object') {
        console.warn('Invalid cached results format')
        return
      }
    
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
    
    // Show generation summary with improved content detection
    const summary = {
      business: hasMeaningfulContent(cached.businessAnalysis),
      functional: hasMeaningfulContent(cached.functionalSpec),
      technical: hasMeaningfulContent(cached.technicalSpec),
      ux: hasMeaningfulContent(cached.uxSpec),
      mermaid: hasMeaningfulContent(cached.mermaidDiagrams)
    }
    setGeneratedDocumentsSummary(summary)
    setShowGenerationSummary(true)
    
    console.log('✅ Loaded from cache with', cachedSteps.length, 'steps')
    } catch (error) {
      console.error('Error loading cached results:', error)
      setErrorMessage('Failed to load cached results. Please try generating fresh documents.')
    }
  }

  // Handle streaming response with real-time display updates
  const handleStreamingResponse = async (
    response: Response, 
    stepId: string, 
    updateDocuments: (content: string) => void
  ): Promise<string> => {
    let fullContent = ''
    let rawContent = '' // Track raw content for fallback
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    // ✨ NEW: Initialize streaming window for this step
    setCurrentStreamingStep(stepId)
    setStepStreamingWindows(prev => ({ ...prev, [stepId]: true }))
    setStreamingContent(prev => ({ ...prev, [stepId]: '' }))
    
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          rawContent += chunk // Accumulate raw content
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonString = line.substring(6).trim()
                if (!jsonString || jsonString === '') {
                  continue // Skip empty data lines
                }
                
                const jsonData = JSON.parse(jsonString)
                if (jsonData.type === 'chunk') {
                  // Accumulate chunks to build full content
                  const chunkContent = jsonData.content || ''
                  fullContent += chunkContent
                  
                  console.log(`🔍 ${stepId} - Chunk received: "${chunkContent}"`)
                  console.log(`🔍 ${stepId} - Full content length: ${fullContent.length}`)
                  
                  // Update progress based on content length (rough estimate)
                  const progress = Math.min(90, Math.floor(fullContent.length / 50))
                  updateStepProgress(stepId, progress, "in_progress")
                  
                  // ✨ ENHANCED: Update streaming content for real-time display
                  setStreamingContent(prev => ({ ...prev, [stepId]: fullContent }))
                  
                  // ✨ REAL-TIME DISPLAY: Update documents as content streams in
                  updateDocuments(fullContent)
                  
                } else if (jsonData.type === 'complete') {
                  fullContent = jsonData.fullContent
                  break
                } else if (jsonData.type === 'error') {
                  throw new Error(jsonData.error || 'Streaming failed')
                }
              } catch (parseError) {
                // Only log if it's not a common streaming artifact
                if (!line.includes('data: {"type":"chunk"')) {
                  console.warn('Skipping invalid JSON line:', line.substring(0, 100) + '...')
                }
                // Skip invalid JSON lines but continue processing
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }
    
    // ✨ NEW: Close streaming window for this step
    setStepStreamingWindows(prev => ({ ...prev, [stepId]: false }))
    setCurrentStreamingStep(null)
    
    // ✨ ENHANCED: Fallback handling for malformed streaming responses
    if (!fullContent) {
      console.warn(`No structured content received from ${stepId}, attempting to extract from raw response`)
      
      // Try to extract content from raw response if structured streaming failed
      if (rawContent) {
        // Look for content patterns in the raw response
        const contentPatterns = [
          /```[\s\S]*?```/g, // Code blocks
          /##[\s\S]*?(?=##|$)/g, // Markdown sections
          /graph[\s\S]*?(?=\n\n|\n#|$)/gi, // Mermaid diagrams
          /flowchart[\s\S]*?(?=\n\n|\n#|$)/gi, // Flowcharts
          /sequenceDiagram[\s\S]*?(?=\n\n|\n#|$)/gi, // Sequence diagrams
        ]
        
        for (const pattern of contentPatterns) {
          const matches = rawContent.match(pattern)
          if (matches && matches.length > 0) {
            fullContent = matches.join('\n\n')
            console.log(`Extracted content from ${stepId} using pattern:`, pattern.source)
            break
          }
        }
        
        // If still no content, try to extract any meaningful text
        if (!fullContent) {
          // Remove common streaming artifacts and extract meaningful content
          const cleanedContent = rawContent
            .replace(/data:\s*\{[^}]*\}/g, '') // Remove data: {...} lines
            .replace(/data:\s*\[DONE\]/g, '') // Remove [DONE] markers
            .replace(/^\s*[\r\n]+/gm, '') // Remove empty lines
            .trim()
          
          if (cleanedContent.length > 50) { // Only use if we have substantial content
            fullContent = cleanedContent
            console.log(`Extracted fallback content from ${stepId}:`, fullContent.substring(0, 200) + '...')
          }
        }
      }
    }
    
    if (!fullContent) {
      throw new Error(`No content received from ${stepId} - streaming response was malformed or empty`)
    }
    
    console.log(`🔍 ${stepId} - Final content length: ${fullContent.length}`)
    console.log(`🔍 ${stepId} - Final content preview: ${fullContent.substring(0, 200)}`)
    
    return fullContent
  }

  const generateFreshDocuments = async (selectedDocuments?: string[]) => {
    setIsProcessing(true)
    setErrorMessage("")
    setGeneratedDocuments({})
    setShowGenerationSummary(false)
    setContextOptimizationStatus({})  // Clear optimization status
    
    // Reset project ID for new generation
    resetProjectId()
    
    // ✨ NEW: Show refresh warning
    setShowRefreshWarning(true)
    
    // Build initial steps array based on selected documents
    const allSteps: ProcessingStep[] = [
      { id: "analysis", name: "Business Analysis", status: "pending" as const, progress: 0 },
      { id: "functional", name: "Functional Specification", status: "pending" as const, progress: 0 },
      { id: "technical", name: "Technical Specification", status: "pending" as const, progress: 0 },
      { id: "ux", name: "UX Specification", status: "pending" as const, progress: 0 },
      { id: "mermaid", name: "Architecture", status: "pending" as const, progress: 0 },
    ]

    // Filter steps based on selected documents
    const initialSteps = selectedDocuments 
      ? allSteps.filter(step => selectedDocuments.includes(step.id))
      : allSteps

    // Add optional steps if integrations are enabled
    if (config.jiraAutoCreate && config.jiraUrl && config.jiraToken) {
      initialSteps.push({ id: "jira", name: "JIRA Epic Creation", status: "pending" as const, progress: 0 })
    }
    if (config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken) {
      initialSteps.push({ id: "confluence", name: "Confluence Documentation", status: "pending" as const, progress: 0 })
    }
    if (initialSteps.length > 5) {
      initialSteps.push({ id: "linking", name: "Cross-platform Linking", status: "pending" as const, progress: 0 })
    }

    setProcessingSteps(initialSteps)

    try {
      // Execute each step sequentially with real progress tracking
      const results: any = {}
      
      // Step 1: Business Analysis - Let backend handle freemium limits
      if (!selectedDocuments || selectedDocuments.includes("analysis")) {
        updateStepProgress("analysis", 0, "in_progress")
        const businessResponse = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "business",
            input,
            userId: user?.id,
          }),
        })
        
        if (!businessResponse.ok) {
          const errorData = await businessResponse.json().catch(() => ({ error: "Unknown API error" }))
          updateStepProgress("analysis", 0, "error")
          
          // Check if this is a freemium limit error from the backend
          if (errorData?.error && (
            errorData.error.toLowerCase().includes("freemium limit") ||
            errorData.error.toLowerCase().includes("daily limit") ||
            errorData.error.toLowerCase().includes("usage limit") ||
            errorData.error.toLowerCase().includes("upgrade required") ||
            errorData.error.toLowerCase().includes("api key required")
          )) {
            console.log("🔑 Backend indicated freemium limit reached, prompting for API key")
            setIsProcessing(false) // Stop processing
            setShowApiKeyDialog(true)
            return // Exit early - user needs to provide API key
          }
          
          throw new Error(errorData?.error || `API request failed with status ${businessResponse.status}`)
        }
        
        // ✨ Handle streaming response with real-time display
        const businessAnalysisContent = await handleStreamingResponse(
          businessResponse,
          "analysis", 
          (content) => setGeneratedDocuments((prev: any) => ({ ...prev, businessAnalysis: content }))
        )
        
        console.log('🔍 Business Analysis Content Length:', businessAnalysisContent?.length || 0)
        console.log('🔍 Business Analysis Content Preview:', businessAnalysisContent?.substring(0, 200) || 'No content')
        console.log('🔍 Business Analysis Content Type:', typeof businessAnalysisContent)
        console.log('🔍 Business Analysis Content is Undefined:', businessAnalysisContent === undefined)
        
        results.businessAnalysis = businessAnalysisContent
        updateStepProgress("analysis", 100, "completed")
        
        // 💾 Save individual document to preserve progress
        await saveIndividualDocument(input, "business", businessAnalysisContent)
        
        // ✨ NEW: Smooth transition delay between steps
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Step 2: Functional Specification
      if (!selectedDocuments || selectedDocuments.includes("functional")) {
        updateStepProgress("functional", 0, "in_progress")
        
        // Show context optimization status
        setContextOptimizationStatus(prev => ({
          ...prev,
          functional: { isOptimizing: true, originalSize: results.businessAnalysis?.length || 0 }
        }))
        console.log('🔍 Passing business analysis to functional spec:', {
          length: results.businessAnalysis?.length || 0,
          preview: results.businessAnalysis?.substring(0, 100) || 'No content',
          isUndefined: results.businessAnalysis === undefined,
          isNull: results.businessAnalysis === null,
          type: typeof results.businessAnalysis
        })
        
        const functionalResponse = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "functional",
            input,
            businessAnalysis: results.businessAnalysis || "",
            userId: user?.id,
            useContextOptimization: true  // Enable context optimization
          }),
        })
        
        // Simulate optimization completion (in reality, this would come from the API)
        setTimeout(() => {
          setContextOptimizationStatus(prev => ({
            ...prev,
            functional: { 
              isOptimizing: false, 
              originalSize: results.businessAnalysis?.length || 0,
              optimizedSize: Math.min(3000, (results.businessAnalysis?.length || 0) * 0.3)  // Simulate 70% reduction
            }
          }))
        }, 1500)
        
        if (!functionalResponse.ok) {
          const errorData = await functionalResponse.json().catch(() => ({ error: "Unknown API error" }))
          updateStepProgress("functional", 0, "error")
          
          // Check for freemium limit error again
          if (errorData?.error && (
            errorData.error.toLowerCase().includes("freemium limit") ||
            errorData.error.toLowerCase().includes("daily limit") ||
            errorData.error.toLowerCase().includes("usage limit") ||
            errorData.error.toLowerCase().includes("upgrade required") ||
            errorData.error.toLowerCase().includes("api key required")
          )) {
            console.log("🔑 Backend indicated freemium limit reached during functional spec, prompting for API key")
            setIsProcessing(false)
            setShowApiKeyDialog(true)
            return
          }
          
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
        
        // 💾 Save individual document to preserve progress
        await saveIndividualDocument(input, "functional", functionalSpecContent)
        
        // ✨ NEW: Smooth transition delay between steps
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Step 3: Technical Specification
      if (!selectedDocuments || selectedDocuments.includes("technical")) {
        updateStepProgress("technical", 0, "in_progress")
        
        // Show context optimization status
        const totalContextSize = (results.businessAnalysis?.length || 0) + (results.functionalSpec?.length || 0)
        setContextOptimizationStatus(prev => ({
          ...prev,
          technical: { isOptimizing: true, originalSize: totalContextSize }
        }))
        const technicalResponse = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "technical",
            input,
            businessAnalysis: results.businessAnalysis || "",
            functionalSpec: results.functionalSpec || "",
            userId: user?.id,
            useContextOptimization: true
          }),
        })
        
        // Simulate optimization completion
        setTimeout(() => {
          const totalContextSize = (results.businessAnalysis?.length || 0) + (results.functionalSpec?.length || 0)
          setContextOptimizationStatus(prev => ({
            ...prev,
            technical: { 
              isOptimizing: false, 
              originalSize: totalContextSize,
              optimizedSize: Math.min(6000, totalContextSize * 0.3)
            }
          }))
        }, 1500)
        
        if (!technicalResponse.ok) {
          const errorData = await technicalResponse.json().catch(() => ({ error: "Unknown API error" }))
          updateStepProgress("technical", 0, "error")
          
          // Check for freemium limit error
          if (errorData?.error && (
            errorData.error.toLowerCase().includes("freemium limit") ||
            errorData.error.toLowerCase().includes("daily limit") ||
            errorData.error.toLowerCase().includes("usage limit") ||
            errorData.error.toLowerCase().includes("upgrade required") ||
            errorData.error.toLowerCase().includes("api key required")
          )) {
            console.log("🔑 Backend indicated freemium limit reached during technical spec, prompting for API key")
            setIsProcessing(false)
            setShowApiKeyDialog(true)
            return
          }
          
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
        
        // 💾 Save individual document to preserve progress
        await saveIndividualDocument(input, "technical", technicalSpecContent)
        
        // ✨ NEW: Smooth transition delay between steps
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Step 4: UX Specification
      if (!selectedDocuments || selectedDocuments.includes("ux")) {
        updateStepProgress("ux", 0, "in_progress")
        
        // Show context optimization status for UX (largest context)
        const totalContextSize = (results.businessAnalysis?.length || 0) + 
                               (results.functionalSpec?.length || 0) + 
                               (results.technicalSpec?.length || 0)
        setContextOptimizationStatus(prev => ({
          ...prev,
          ux: { isOptimizing: true, originalSize: totalContextSize }
        }))
        const uxResponse = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "ux",
            input,
            businessAnalysis: results.businessAnalysis || "",
            functionalSpec: results.functionalSpec || "",
            technicalSpec: results.technicalSpec || "",
            userId: user?.id,
            useContextOptimization: true  // Enable smart context optimization
          }),
        })
        
        // Simulate optimization completion with bigger reduction for UX
        setTimeout(() => {
          const totalContextSize = (results.businessAnalysis?.length || 0) + 
                                 (results.functionalSpec?.length || 0) + 
                                 (results.technicalSpec?.length || 0)
          setContextOptimizationStatus(prev => ({
            ...prev,
            ux: { 
              isOptimizing: false, 
              originalSize: totalContextSize,
              optimizedSize: Math.min(2500, totalContextSize * 0.25)  // 75% reduction for UX
            }
          }))
        }, 2000)  // Slightly longer for UX since it has more context
        
        if (!uxResponse.ok) {
          const errorData = await uxResponse.json().catch(() => ({ error: "Unknown API error" }))
          updateStepProgress("ux", 0, "error")
          
          // Check for freemium limit error
          if (errorData?.error && (
            errorData.error.toLowerCase().includes("freemium limit") ||
            errorData.error.toLowerCase().includes("daily limit") ||
            errorData.error.toLowerCase().includes("usage limit") ||
            errorData.error.toLowerCase().includes("upgrade required") ||
            errorData.error.toLowerCase().includes("api key required")
          )) {
            console.log("🔑 Backend indicated freemium limit reached during UX spec, prompting for API key")
            setIsProcessing(false)
            setShowApiKeyDialog(true)
            return
          }
          
          throw new Error(errorData?.error || `API request failed with status ${uxResponse.status}`)
        }
        
        // ✨ Handle streaming response with real-time display
        const uxContent = await handleStreamingResponse(
          uxResponse,
          "ux",
          (content) => setGeneratedDocuments((prev: any) => ({ ...prev, uxSpec: content }))
        )
        
        results.uxSpec = uxContent
        updateStepProgress("ux", 100, "completed")
        
        // 💾 Save individual document to preserve progress
        await saveIndividualDocument(input, "ux", uxContent)
        
        // ✨ NEW: Smooth transition delay between steps
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Step 5: Mermaid Diagrams
      if (!selectedDocuments || selectedDocuments.includes("mermaid")) {
        updateStepProgress("mermaid", 0, "in_progress")
        const mermaidResponse = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: "mermaid",
            input: "Generate architecture diagrams",
            functionalSpec: results.functionalSpec || "",
            technicalSpec: results.technicalSpec || "",
            businessAnalysis: results.businessAnalysis || "",
            userId: user?.id,
          }),
        })
        
        if (!mermaidResponse.ok) {
          const errorData = await mermaidResponse.json().catch(() => ({ error: "Unknown API error" }))
          updateStepProgress("mermaid", 0, "error")
          
          // Check for freemium limit error
          if (errorData?.error && (
            errorData.error.toLowerCase().includes("freemium limit") ||
            errorData.error.toLowerCase().includes("daily limit") ||
            errorData.error.toLowerCase().includes("usage limit") ||
            errorData.error.toLowerCase().includes("upgrade required") ||
            errorData.error.toLowerCase().includes("api key required")
          )) {
            console.log("🔑 Backend indicated freemium limit reached during Mermaid diagrams, prompting for API key")
            setIsProcessing(false)
            setShowApiKeyDialog(true)
            return
          }
          
          throw new Error(errorData?.error || `API request failed with status ${mermaidResponse.status}`)
        }
        
        // ✨ Handle streaming response with real-time display
        const mermaidContent = await handleStreamingResponse(
          mermaidResponse,
          "mermaid",
          (content) => setGeneratedDocuments((prev: any) => ({ ...prev, mermaidDiagrams: content }))
        )
        
        results.mermaidDiagrams = mermaidContent
        updateStepProgress("mermaid", 100, "completed")
        
        // 💾 Save individual document to preserve progress
        await saveIndividualDocument(input, "architecture", mermaidContent)
        
        // ✨ NEW: Smooth transition delay between steps
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Documents are already saved through individual API endpoints
      console.log('✅ Documents saved through individual API endpoints')

      // ✅ Save all results to database once at the end (prevents duplicate storage)
      await saveResultsToDatabase(input, results, true) // Use update flag since we may have saved earlier

      // Handle optional integrations (JIRA, Confluence) if enabled
      await handleIntegrations(results, input)

      // Ensure all steps are marked as completed
      setProcessingSteps(prevSteps => prevSteps.map(step => ({
        ...step,
        status: "completed" as const,
        progress: 100
      })))

      // Update usage count after successful generation
      incrementUsage()
      
      // After generation completes, show summary with improved content detection
      const summary = {
        business: hasMeaningfulContent(generatedDocuments.businessAnalysis || ''),
        functional: hasMeaningfulContent(generatedDocuments.functionalSpec || ''),
        technical: hasMeaningfulContent(generatedDocuments.technicalSpec || ''),
        ux: hasMeaningfulContent(generatedDocuments.uxSpec || ''),
        mermaid: hasMeaningfulContent(generatedDocuments.mermaidDiagrams || '')
      }
      setGeneratedDocumentsSummary(summary)
      setShowGenerationSummary(true)

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
          
          // Update the project with JIRA info in database instead of localStorage
          // The project data will be updated when we refresh from database
          console.log('✅ JIRA integration completed, project data will be refreshed from database')
          
          // Refresh the recent projects display
          const updatedProjects = await getCachedProjects()
          setRecentProjects(updatedProjects)
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
          const updatedProjects = await getCachedProjects()
          setRecentProjects(updatedProjects)
        }
      } else {
        console.error('❌ Enhanced JIRA integration failed:', jiraResult.error)
        alert(`JIRA integration failed: ${jiraResult.error}\n\nDetails: ${jiraResult.details || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Manual JIRA integration error:', error)
      alert(`Error creating JIRA artifacts: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        
        // Update the project with Confluence info in database instead of localStorage
        // The project data will be updated when we refresh from database
        console.log('✅ Confluence integration completed, project data will be refreshed from database')
        
        // Refresh the recent projects display
        const { projects: updatedProjects, totalCount } = await getCachedProjectsOptimized()
        setRecentProjects(updatedProjects)
        setTotalProjectCount(totalCount)
      } else {
        console.error('❌ Manual Confluence integration failed:', confluenceResult.error)
        alert(`Confluence integration failed: ${confluenceResult.error}`)
      }
    } catch (error) {
      console.error('❌ Manual Confluence integration error:', error)
      alert(`Error creating Confluence documentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    
    // For optimized projects, we need to fetch full details first
    if (!project.documents) {
      try {
        const { project: fullProject, documents } = await dbService.getProjectFullDetails(project.id, user?.id || '')
        if (!fullProject || documents.length === 0) {
          setErrorMessage('Could not load project details. Please try again.')
          return
        }
        // Build documents object from the documents array
        project.documents = {}
        documents.forEach(doc => {
          switch (doc.document_type) {
            case 'business_analysis':
              project.documents.businessAnalysis = doc.content
              break
            case 'functional_spec':
              project.documents.functionalSpec = doc.content
              break
            case 'technical_spec':
              project.documents.technicalSpec = doc.content
              break
            case 'ux_spec':
              project.documents.uxSpec = doc.content
              break
          }
        })
      } catch (error) {
        console.error('Error loading project details:', error)
        setErrorMessage('Error loading project details. Please try again.')
        return
      }
    }
    
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
    
    // For optimized projects, we need to fetch full details first
    if (!project.documents) {
      try {
        const { project: fullProject, documents } = await dbService.getProjectFullDetails(project.id, user?.id || '')
        if (!fullProject || documents.length === 0) {
          setErrorMessage('Could not load project details. Please try again.')
          return
        }
        // Build documents object from the documents array
        project.documents = {}
        documents.forEach(doc => {
          switch (doc.document_type) {
            case 'business_analysis':
              project.documents.businessAnalysis = doc.content
              break
            case 'functional_spec':
              project.documents.functionalSpec = doc.content
              break
            case 'technical_spec':
              project.documents.technicalSpec = doc.content
              break
            case 'ux_spec':
              project.documents.uxSpec = doc.content
              break
          }
        })
      } catch (error) {
        console.error('Error loading project details:', error)
        setErrorMessage('Error loading project details. Please try again.')
        return
      }
    }
    
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
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "mermaid",
          input: "Generate architecture diagrams",
          functionalSpec: documents.functionalSpec || {},
          technicalSpec: documents.technicalSpec || {},
          businessAnalysis: documents.businessAnalysis || {},
          userId: user?.id,
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

  // Save results to database with proper project ID tracking
  const saveResultsToDatabase = async (inputKey: string, data: any, isUpdate = false) => {
    try {
      const projectName = extractProjectName(inputKey)
      
      // Find the first available document content to use as initial project content
      const firstAvailableContent = Object.values(data).find(content => 
        content && typeof content === 'string' && content.trim()
      ) || `# ${projectName}\n\nProject created for: ${inputKey}\n\nGenerated on: ${new Date().toISOString()}`
      
      // Create project with initial content
      const projectRequestBody = {
        title: projectName,
        content: firstAvailableContent,
        userId: user?.id,
        metadata: {
          input: inputKey,
          generated_at: new Date().toISOString(),
          user_id: user?.id
        }
      }

      let projectResponse
      if (isUpdate && currentProjectIdRef.current) {
        // Update existing project
        console.log('🔄 UPDATE project:', currentProjectIdRef.current)
        projectResponse = await fetch(`/api/sdlc-documents`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...projectRequestBody,
            projectId: currentProjectIdRef.current
          })
        })
      } else {
        // Create new project
        console.log('🆕 CREATE new project')
        projectResponse = await fetch('/api/sdlc-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectRequestBody)
        })
      }
      
      if (!projectResponse.ok) {
        console.warn('Failed to create/update project:', await projectResponse.text())
        return
      }

      const projectResult = await projectResponse.json()
      
      if (projectResult.success && projectResult.document?.id) {
        currentProjectIdRef.current = projectResult.document.id
        console.log('✅ Project created/updated:', projectResult.document.id, projectResult.action)
        
        // Now save individual documents
        const documentTypeMapping = {
          businessAnalysis: 'business_analysis',
          functionalSpec: 'functional_spec', 
          technicalSpec: 'technical_spec',
          uxSpec: 'ux_spec',
          mermaidDiagrams: 'architecture'
        }
        
        for (const [key, content] of Object.entries(data)) {
          if (content && typeof content === 'string' && content.trim()) {
            const documentType = documentTypeMapping[key as keyof typeof documentTypeMapping] || key
            console.log(`💾 Saving individual document: ${documentType}`)
            
            const documentResponse = await fetch('/api/sdlc-documents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: currentProjectIdRef.current,
                documentType: documentType,
                title: `${projectName} - ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document`,
                content: content,
                userId: user?.id
              })
            })
            
            if (documentResponse.ok) {
              console.log(`✅ ${documentType} document saved`)
            } else {
              console.warn(`Failed to save ${documentType} document:`, await documentResponse.text())
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to save results to database:', error)
    }
  }

  // Save individual document step to database
  const saveIndividualDocument = async (inputKey: string, documentType: string, content: string) => {
    try {
      const projectName = extractProjectName(inputKey)
      
      // Map frontend document types to database types
      const documentTypeMapping = {
        business: 'business_analysis',
        functional: 'functional_spec',
        technical: 'technical_spec',
        ux: 'ux_spec',
        mermaid: 'architecture'
      }
      
      const dbDocumentType = documentTypeMapping[documentType as keyof typeof documentTypeMapping] || documentType
      
      console.log(`💾 Saving ${documentType} document (${dbDocumentType}) - Project ID:`, currentProjectIdRef.current || 'NEW')
      console.log(`📄 Content length:`, content?.length || 0)
      
      if (currentProjectIdRef.current) {
        // Update existing project with individual document
        const response = await fetch('/api/sdlc-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: currentProjectIdRef.current,
            documentType: dbDocumentType,
            title: `${projectName} - ${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document`,
            content: content,
            userId: user?.id
          })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to save ${documentType} document`)
        }
        
        console.log(`✅ ${documentType} document saved to existing project`)
      } else {
        // Create new project first, then save the document
        const projectRequestBody = {
          title: projectName,
          content: content, // Include the document content
          documentType: dbDocumentType, // Include the document type
          userId: user?.id,
          metadata: {
            input: inputKey,
            generated_at: new Date().toISOString(),
            user_id: user?.id
          }
        }
        
        console.log('🆕 CREATE new project for individual document')
        const projectResponse = await fetch('/api/sdlc-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectRequestBody)
        })
        
        if (!projectResponse.ok) {
          throw new Error('Failed to create project')
        }
        
        const projectResult = await projectResponse.json()
        
        if (projectResult.success && projectResult.document?.id) {
          currentProjectIdRef.current = projectResult.document.id
          console.log('✅ Project created with document:', projectResult.document.id)
        }
      }
    } catch (error) {
      console.warn(`Failed to save ${documentType} document:`, error)
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

  // Add state for project viewing
  const [selectedProject, setSelectedProject] = useState<ProjectResult | null>(null)
  const [showProjectViewer, setShowProjectViewer] = useState(false)



  // Handle project click - open appropriate viewer
  const handleProjectClick = (project: ProjectResult) => {
    if (project.projectType === 'claude_code_assistant') {
      // Navigate to Claude Code Assistant viewer
      window.location.href = '/claude-code'
    } else {
      // Open SDLC project in modal viewer
      setSelectedProject(project)
      setShowProjectViewer(true)
    }
  }

  // Add Generation Summary Component
  const GenerationSummary = () => {
    if (!showGenerationSummary) return null

    const documentTypes = [
      { id: 'business', name: 'Business Analysis', icon: Brain },
      { id: 'functional', name: 'Functional Spec', icon: FileText },
      { id: 'technical', name: 'Technical Spec', icon: Code },
      { id: 'ux', name: 'UX Specification', icon: Palette },
      { id: 'mermaid', name: 'Architecture', icon: GitBranch }
    ]

    const generatedCount = Object.values(generatedDocumentsSummary).filter(Boolean).length
    const totalCount = Object.keys(generatedDocumentsSummary).length

    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generation Complete!
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGenerationSummary(false)}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-green-700 mb-3">
          Successfully generated <strong>{generatedCount} of {totalCount}</strong> documents for your project.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {documentTypes.map((doc) => {
            const Icon = doc.icon
            const isGenerated = generatedDocumentsSummary[doc.id]
            
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-2 p-2 rounded border text-sm ${
                  isGenerated
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {isGenerated ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{doc.name}</span>
                <span className="sm:hidden">
                  {doc.id === 'business' ? 'Biz' :
                   doc.id === 'functional' ? 'Func' :
                   doc.id === 'technical' ? 'Tech' :
                   doc.id === 'mermaid' ? 'Arch' : doc.id}
                </span>
              </div>
            )
          })}
        </div>
        
        <div className="mt-3 text-xs text-green-600">
          💡 Tip: You can view your generated documents in the "Recent Projects" section below.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      {/* User Header */}
      <UserHeader user={user} userRole={userRole} onSignOut={onSignOut} onConfigureKeys={() => setShowConfig(true)} />
      
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Prompt to System Design</h1>
            <p className="text-sm sm:text-base text-gray-600">Transform ideas into Specs with AI</p>
          </div>
          
          {/* <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>JIRA Project: {config.jiraProject || 'Not configured'}</span>
            <span>Confluence Space: {config.confluenceSpace || 'Not configured'}</span>
          </div> */}
        </div>

        {/* Generation Summary */}
        <GenerationSummary />

        {/* Recent Projects */}
        {isLoadingRecentProjects ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Recent Projects
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm font-normal text-gray-500">Loading...</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ) : recentProjects.length > 0 ? (
          <ProjectListViewerOptimized
            projects={recentProjects}
            userId={user?.id || ''}
            totalProjectCount={totalProjectCount}
            onJiraExport={handleJiraExport}
            onConfluenceExport={handleConfluenceExport}
            onGitHubProjectCreate={openGitHubProjectDialogForProject}
            isExportingToJira={isExportingToJira}
            isExportingToConfluence={isExportingToConfluence}
            isCreatingGitHubProject={isCreatingGitHubProject}
            selectedProjectForGitHub={selectedProjectForGitHub}
            config={config}
          />
        ) : null}

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

        {/* Slack UI Code Assistant Dialog */}
        <Dialog open={showSlackUICodeAssistant} onOpenChange={setShowSlackUICodeAssistant}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>Slack UI Code Assistant</DialogTitle>
              <DialogDescription>
                Web-based interface for the same powerful Claude + GitHub integration available through Slack commands.
              </DialogDescription>
            </DialogHeader>
            <SlackUICodeAssistant />
          </DialogContent>
        </Dialog>

        {/* GitHub Project Creation Dialog */}
        <Dialog open={showGitHubProjectDialog} onOpenChange={(open) => {
          setShowGitHubProjectDialog(open)
          if (!open) {
            setSelectedProjectForGitHub(null)
          }
        }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create GitHub Project</DialogTitle>
              <DialogDescription>
                Transform your SDLC documentation into a structured GitHub project with issues and milestones
              </DialogDescription>
            </DialogHeader>
            
            <GitHubProjectsCreator
              documents={
                selectedProjectForGitHub 
                  ? {
                      businessAnalysis: selectedProjectForGitHub.documents.businessAnalysis,
                      functionalSpec: selectedProjectForGitHub.documents.functionalSpec,
                      technicalSpec: selectedProjectForGitHub.documents.technicalSpec,
                      uxSpec: selectedProjectForGitHub.documents.uxSpec,
                      comprehensive: selectedProjectForGitHub.documents.comprehensive,
                      mermaidDiagrams: selectedProjectForGitHub.documents.mermaidDiagrams,
                      architecture: selectedProjectForGitHub.documents.architecture
                    }
                  : {
                      businessAnalysis: generatedDocuments.businessAnalysis,
                      functionalSpec: generatedDocuments.functionalSpec,
                      technicalSpec: generatedDocuments.technicalSpec,
                      uxSpec: generatedDocuments.uxSpec,
                      mermaidDiagrams: generatedDocuments.mermaidDiagrams
                    }
              }
              projectTitle={
                selectedProjectForGitHub 
                  ? selectedProjectForGitHub.title
                  : extractProjectName(input)
              }
              onSuccess={async (result) => {
                setSuccessMessage(`🎉 GitHub project created successfully!`)
                setShowGitHubProjectDialog(false)
                
                // Store GitHub project information in the database if we have a project ID
                if (selectedProjectForGitHub?.id && result.project) {
                  try {
                    // Save GitHub integration to database
                    await dbService.saveIntegration(selectedProjectForGitHub.id, {
                      integration_type: 'github_projects',
                      external_id: result.project.id,
                      external_url: result.project.url,
                      metadata: {
                        projectNumber: result.project.number,
                        repositoryOwner: result.repositoryOwner,
                        repositoryName: result.repositoryName,
                        issueCount: result.steps?.issues?.message?.match(/\d+/)?.[0] || 0
                      },
                      status: 'active'
                    })
                    console.log('✅ Saved GitHub project integration to database')
                  } catch (error) {
                    console.error('❌ Failed to save GitHub integration:', error)
                  }
                }
                
                setSelectedProjectForGitHub(null)
                
                // Refresh recent projects to show the new GitHub integration
                const updatedProjects = await getCachedProjects()
                setRecentProjects(updatedProjects)
              }}
              onError={(error) => {
                setErrorMessage(`Failed to create GitHub project: ${error.message}`)
              }}
            />
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="scrollbar-hide overflow-x-auto">
            <TabsList className="flex min-w-max">
              <TabsTrigger value="sdlc" className="flex-shrink-0 min-w-[60px] px-2 sm:px-3">
                <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">SDLC</span>
              </TabsTrigger>
              <TabsTrigger value="codeyodha" className="flex-shrink-0 min-w-[60px] px-2 sm:px-3">
                <Sparkles className="w-4 h-4 mr-1 sm:mr-2 text-purple-500" />
                <span className="hidden sm:inline">CodeYodha</span>
              </TabsTrigger>
              <TabsTrigger value="gitdigest" className="flex-shrink-0 min-w-[60px] px-2 sm:px-3">
                <GitBranch className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">GitDigest</span>
              </TabsTrigger>
              <TabsTrigger value="early-access" className="flex-shrink-0 min-w-[60px] px-2 sm:px-3">
                <Rocket className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Early Access</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sdlc" className="space-y-6">
            {/* Main Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  New Business Case
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-case">Describe your bug, feature, or business case:</Label>
                  <Textarea
                    id="business-case"
                    placeholder="Example: We need to implement a user authentication system that supports email/password login, social media login (Google, Facebook), password reset functionality, and role-based access control. The system should be secure, scalable, and integrate with our existing user database..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Tools Section - Left Side */}
                  <div className="relative w-full sm:w-auto">
                    {/* Collapsed Tools Tab */}
                    {!toolsExpanded && (
                      <button
                        onClick={() => setToolsExpanded(true)}
                        className="bg-blue-100 hover:bg-blue-200 rounded-lg px-3 py-2 border border-blue-200 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <span className="text-xs text-blue-700 font-medium">Tools</span>
                        <ChevronLeft className="h-4 w-4 text-blue-600 rotate-180" />
                      </button>
                    )}

                    {/* Expanded Tools - Left-aligned Overlay */}
                    {toolsExpanded && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setToolsExpanded(false)}
                        />
                        <div className="absolute left-0 top-0 z-50 bg-white rounded-lg shadow-lg border p-3 min-w-[280px] sm:min-w-[320px] w-[calc(100vw-2rem)] max-w-[400px]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Tools</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToolsExpanded(false)}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            title="Collapse"
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {/* SDLC */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('sdlc')
                              setToolsExpanded(false)
                            }}
                            className="h-12 min-w-[80px] p-0 hover:bg-gray-50 flex flex-col items-center justify-center gap-1 border-gray-300"
                            title="SDLC Documentation"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="text-xs font-medium">SDLC</span>
                          </Button>
                          {/* CodeYodha */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('codeyodha')
                              setToolsExpanded(false)
                            }}
                            className="h-12 min-w-[80px] p-0 hover:bg-purple-50 flex flex-col items-center justify-center gap-1 border-purple-300"
                            title="CodeYodha"
                          >
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">CodeYodha</span>
                          </Button>
                          {/* GitDigest */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('gitdigest')
                              setToolsExpanded(false)
                            }}
                            className="h-12 min-w-[80px] p-0 hover:bg-gray-50 flex flex-col items-center justify-center gap-1 border-gray-300"
                            title="GitDigest"
                          >
                            <GitBranch className="h-4 w-4" />
                            <span className="text-xs font-medium">GitDigest</span>
                          </Button>
                          {/* Early Access */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('early-access')
                              setToolsExpanded(false)
                            }}
                            className="h-12 min-w-[80px] p-0 hover:bg-blue-50 flex flex-col items-center justify-center gap-1 border-blue-300"
                            title="Early Access"
                          >
                            <Rocket className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">Early Access</span>
                          </Button>
                        </div>
                      </div>
                      </>
                    )}
                  </div>

                  {/* Collapsible Horizontal Toolkit - Settings */}
                  <div className="relative w-full sm:w-auto">
                    {/* Collapsed Tab */}
                    {!toolkitExpanded && (
                      <button
                        onClick={() => setToolkitExpanded(true)}
                        className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 border transition-colors flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <span className="text-xs text-gray-600 font-medium">Settings</span>
                        <ChevronLeft className="h-4 w-4 text-gray-600 rotate-180" />
                      </button>
                    )}

                    {/* Expanded Toolkit - Right-aligned Overlay */}
                    {toolkitExpanded && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setToolkitExpanded(false)}
                        />
                        <div className="absolute right-0 top-0 z-50 bg-white rounded-lg shadow-lg border p-3 min-w-[280px] sm:min-w-[400px] w-[calc(100vw-2rem)] max-w-[400px]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Settings</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToolkitExpanded(false)}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            title="Collapse"
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {/* Settings */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowConfig(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="Configuration"
                          >
                            <Settings className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Config</span>
                          </Button>
                          {/* Integrations */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowIntegrations(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="Integrations"
                          >
                            <Plug className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Integration</span>
                          </Button>
                          {/* Workflow */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowWorkflow(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="View Workflow"
                          >
                            <Workflow className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Workflow</span>
                          </Button>
                          {/* Info */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowHowItWorks(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="How It Works"
                          >
                            <Info className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Info</span>
                          </Button>
                          {/* Prompt Engineering */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowPromptEngineering(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="Prompt Engineering"
                          >
                            <Settings className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Prompts</span>
                          </Button>
                          {/* Analytics */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = '/usage-dashboard'
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1"
                            title="Usage Dashboard"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Analytics</span>
                          </Button>
                          {/* Database Test */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowDatabaseTest(true)
                              setToolkitExpanded(false)
                            }}
                            className="h-10 min-w-[72px] max-w-[110px] p-0 hover:bg-gray-100 flex flex-col items-center justify-center gap-1 relative"
                            title="Test Database"
                          >
                            <Database className="h-4 w-4" />
                            <span className="text-xs truncate w-full">Database</span>
                            <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                              T
                            </Badge>
                          </Button>
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowDocumentSelectionModal(true)}
                  disabled={!input.trim() || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating SDLC Documentation...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate SDLC Documentation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

            {/* Processing Status and Generated Documentation - moved below help section */}
            {(isProcessing || (generatedDocuments && Object.keys(generatedDocuments).length > 0)) && (
              <>
                {/* ✨ ENHANCED: Processing Status with Streaming Windows */}
                <Card id="status-window" className={`mt-6 ${isProcessing ? 'border-blue-200 bg-blue-50/50' : ''}`}>
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
                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                <span className="text-blue-800">Generating Documentation</span>
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
                  <CardContent className="space-y-4">
                    {/* ✨ NEW: Refresh Warning */}
                    {showRefreshWarning && isProcessing && (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Please don't refresh the page</strong> while generation is in progress. 
                          This will interrupt the process and you'll need to start over.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* ✨ ENHANCED: Step-by-Step Progress with Streaming Windows */}
                    <div className="space-y-3">
                      {processingSteps.map((step, index) => (
                        <div key={step.id} className="space-y-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(step.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-medium ${step.status === "completed" ? "text-green-700" : step.status === "in_progress" ? "text-blue-700" : "text-gray-500"}`}
                                >
                                  {step.name}
                                  {/* Context Optimization Indicator */}
                                  {contextOptimizationStatus[step.id]?.isOptimizing && (
                                    <span className="ml-2 text-xs text-purple-600 animate-pulse">
                                      <Sparkles className="inline w-3 h-3 mr-1" />
                                      Optimizing context...
                                    </span>
                                  )}
                                </span>
                                {step.status === "in_progress" && (
                                  <span className="text-sm text-blue-600 font-medium">In progress...</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* ✨ NEW: Streaming Text Window for Current Step */}
                          {stepStreamingWindows[step.id] && streamingContent[step.id] && (
                            <div className="ml-8 bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm border border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Live Output:</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-green-400">Streaming</span>
                                </div>
                              </div>
                              <div className="h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                <div className="whitespace-pre-wrap">
                                  {streamingContent[step.id].split('\n').slice(-6).join('\n')}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Debug streaming window state */}
                          {step.status === "in_progress" && (
                            <div className="ml-8 text-xs text-gray-500">
                              Debug: stepStreamingWindows[{step.id}] = {stepStreamingWindows[step.id] ? 'true' : 'false'}, 
                              streamingContent[{step.id}] = {streamingContent[step.id] ? `"${streamingContent[step.id].substring(0, 50)}..."` : 'undefined'}
                            </div>
                          )}
                          
                          {/* ✨ NEW: Progress Bar */}
                          {step.status === "in_progress" && (
                            <div className="ml-8">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${step.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Context Optimization Details */}
                          {contextOptimizationStatus[step.id] && contextOptimizationStatus[step.id].originalSize && (
                            <div className="ml-8 mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 text-xs text-purple-700">
                                <Sparkles className="h-3 w-3" />
                                <span>
                                  Context optimized: {contextOptimizationStatus[step.id].originalSize?.toLocaleString()} → {contextOptimizationStatus[step.id].optimizedSize?.toLocaleString()} chars
                                  ({Math.round(((contextOptimizationStatus[step.id].originalSize! - contextOptimizationStatus[step.id].optimizedSize!) / contextOptimizationStatus[step.id].originalSize!) * 100)}% reduction)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* ✨ NEW: Current Step Indicator */}
                    {currentStreamingStep && (
                      <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          <span className="font-medium">
                            Currently generating: {processingSteps.find(s => s.id === currentStreamingStep)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Completion message */}
                    {(() => {
                      const allCompleted = processingSteps.every(step => step.status === 'completed')
                      return allCompleted && !isProcessing && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Generation Complete!</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1 mb-3">
                            Your SDLC documentation has been successfully generated. You can now create GitHub projects, export to Jira/Confluence, or view the documents below.
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button 
                              onClick={openGitHubProjectDialog}
                              size="sm"
                              className="bg-gray-900 hover:bg-gray-800 text-white"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Create GitHub Project
                            </Button>
                            
                            {config.jiraUrl && (
                              <Button 
                                onClick={() => handleJiraExport({ 
                                  documents: generatedDocuments, 
                                  input,
                                  title: extractProjectName(input)
                                })}
                                variant="outline"
                                size="sm"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Export to Jira
                              </Button>
                            )}
                            
                            {config.confluenceUrl && (
                              <Button 
                                onClick={() => handleConfluenceExport({ 
                                  documents: generatedDocuments, 
                                  input,
                                  title: extractProjectName(input)
                                })}
                                variant="outline"
                                size="sm"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Export to Confluence
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })()
                    }
                  </CardContent>
                </Card>
                {/* Generated Documents Display - Now appears below */}
                <div className="space-y-6 mt-6">
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
                            content={generatedDocuments.businessAnalysis || ''}
                            title="Business Analysis"
                            type="business"
                          />
                        </TabsContent>

                        <TabsContent value="functional">
                          <MarkdownRenderer 
                            content={generatedDocuments.functionalSpec || ''}
                            title="Functional Specification"
                            type="functional"
                          />
                        </TabsContent>

                        <TabsContent value="technical">
                          <MarkdownRenderer 
                            content={generatedDocuments.technicalSpec || ''}
                            title="Technical Specification"
                            type="technical"
                          />
                        </TabsContent>

                        <TabsContent value="ux">
                          <MarkdownRenderer 
                            content={generatedDocuments.uxSpec || ''}
                            title="UX Specification"
                            type="ux"
                          />
                        </TabsContent>

                        <TabsContent value="diagrams">
                          {(() => {
                            const mermaidContent = generatedDocuments.mermaidDiagrams || ""
                            const diagrams = parseMermaidDiagrams(mermaidContent)
                            const hasDiagrams = Object.keys(diagrams).length > 0
                            
                            if (hasDiagrams) {
                              return (
                                <MermaidViewer
                                  diagrams={diagrams}
                                />
                              )
                            } else {
                              return (
                                <div className="p-6 text-center">
                                  <div className="text-gray-500 mb-4">
                                    <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <h3 className="text-lg font-medium text-gray-700">No Architecture Diagrams</h3>
                                    <p className="text-sm text-gray-600">No architecture diagrams were generated for this project.</p>
                                  </div>
                                  {mermaidContent && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left border border-gray-200">
                                      <h4 className="font-medium mb-2 text-gray-800">Generated Content:</h4>
                                      <div className="text-sm text-gray-700 max-h-40 overflow-y-auto bg-white p-3 rounded border">
                                        <pre className="whitespace-pre-wrap font-mono text-xs text-gray-800">{mermaidContent}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            }
                          })()}
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
              </>
            )}
          </TabsContent>

          <TabsContent value="codeyodha" className="space-y-6">
            <ClaudeCodeDashboard />
          </TabsContent>

          <TabsContent value="gitdigest" className="mt-6">
            <GitDigestDashboard config={{
              openaiKey: config.openaiKey || '',
              jiraUrl: config.jiraUrl || '',
              jiraEmail: config.jiraEmail || '',
              jiraToken: config.jiraToken || '',
              confluenceUrl: config.confluenceUrl || '',
              confluenceEmail: config.confluenceEmail || '',
              confluenceToken: config.confluenceToken || ''
            }} />
          </TabsContent>

          <TabsContent value="early-access" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-blue-500" />
                    Early Access Program
                  </CardTitle>
                  <CardDescription>
                    Join our early access waiting list to get priority access to beta features and help shape the future of SDLC.dev
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="h-5 w-5 text-blue-500" />
                          Early Access Benefits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Priority access to beta features</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Direct feedback channel to development team</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Influence roadmap and feature prioritization</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Early access to advanced AI integrations</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Exclusive community access and networking</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>Get notified first when new features launch</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="h-5 w-5 text-green-500" />
                          Coming Soon Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                            <span>Advanced Claude Integration</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>Premium SDLC Templates</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span>Advanced Analytics Dashboard</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span>Custom API Integrations</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span>Bulk Project Processing</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-700 flex-shrink-0" />
                            <span>Team Collaboration Tools</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <EarlyAccessWaitingList 
                user={user}
                onSuccess={(position) => {
                  console.log(`User joined waitlist at position ${position}`)
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ✨ NEW: Document Selection Modal */}
      <DocumentSelectionModal
        isOpen={showDocumentSelectionModal}
        onClose={() => setShowDocumentSelectionModal(false)}
        onGenerate={handleDocumentSelection}
        input={input}
        isLoading={isProcessing}
      />
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
      <SDLCAutomationPlatform user={user} userRole={userRole} onSignOut={handleSignOut} />
    </div>
  );
}

export default AuthenticatedSDLCPlatform;

