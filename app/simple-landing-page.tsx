"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Code,
  FileText,
  Brain,
  Sparkles,
  Plus,
  Workflow,
  Settings2,
  Upload,
  Camera,
  Github,
  FolderOpen,
  GraduationCap,
  Coffee,
  ArrowUp,
  FileCode,
  Database,
  Palette,
  TestTube,
  GitBranch,
  Package,
  BookOpen,
  Building,
  LogIn,
  UserPlus,
  Lock,
  Check,
  X,
  FlaskConical,
  Users,
  Info,
  Search,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  MessageSquare,
  Globe,
  ExternalLink,
  Clock,
  Loader2,
  RotateCcw
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { SimpleDocumentGenerationModal } from '@/components/simple-document-generation-modal'
import { CustomAlert } from '@/components/ui/custom-alert'
import { anonymousProjectService } from '@/lib/anonymous-project-service'
import { CodeAssistantMenu } from '@/components/code-assistant-menu'
import { ViewDocsMenu } from '@/components/view-docs-menu'
import { ProgressIndicator, SpecViewer } from '@/components/analyzer'
import { AnalysisStep, GeneratedSpec, ERROR_MESSAGES } from '@/types/analyzer'
import { companies } from '@/data/tech-stacks'
import { TrendingUp, Building2 } from 'lucide-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type AnalysisStatus = 'idle' | 'analyzing' | 'complete' | 'error'

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-600/40 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-bl from-purple-600/40 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-pink-600/30 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-4s' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

// Reusable Glass Card Component
function GlassCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/[0.08]
        backdrop-blur-2xl backdrop-saturate-200
        border border-white/[0.15]
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        ${hover ? 'transition-all duration-500 hover:bg-white/[0.12] hover:border-white/[0.25]' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base
        ${
          active
            ? 'bg-white/20 text-white shadow-lg shadow-white/10 border border-white/20'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  )
}

export default function SimpleLandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [activeTab, setActiveTab] = useState<'describe' | 'analyze'>('describe')
  const [showDocumentMenu, setShowDocumentMenu] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showInputAlert, setShowInputAlert] = useState(false)
  const [previousDocuments, setPreviousDocuments] = useState<Record<string, string>>({})
  const [showViewDocsHint, setShowViewDocsHint] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number
    total: number
    resetAt: Date
  } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // GitHub Analyzer State
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [currentStep, setCurrentStep] = useState<AnalysisStep | null>(null)
  const [completedSteps, setCompletedSteps] = useState<AnalysisStep[]>([])
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [spec, setSpec] = useState<GeneratedSpec | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Format time remaining until reset
  const getTimeUntilReset = (resetAt: Date): string => {
    const now = new Date()
    const diff = resetAt.getTime() - now.getTime()

    if (diff <= 0) return 'Resetting...'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Check rate limit status
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
      }
    } catch (error) {
      console.error('Failed to check rate limit:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (!user) {
          await checkRateLimit()
        }

        const savedDocs = localStorage.getItem('sdlc_generated_docs')
        if (savedDocs) {
          try {
            const docs = JSON.parse(savedDocs)
            setPreviousDocuments(docs)
            if (Object.keys(docs).length > 0) {
              setShowViewDocsHint(true)
              setTimeout(() => setShowViewDocsHint(false), 5000)
            }
          } catch (e) {
            console.error('Error loading previous documents:', e)
          }
        }

        const lastInput = localStorage.getItem('sdlc_last_input')
        if (lastInput && !inputValue) {
          setInputValue(lastInput)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDocumentMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!user && rateLimitStatus) {
      const interval = setInterval(() => {
        setRateLimitStatus(prev => prev ? { ...prev } : null)
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [user, rateLimitStatus])

  const handleGetStarted = (docType?: string) => {
    if (!inputValue.trim()) {
      setShowInputAlert(true)
      return
    }

    localStorage.setItem('sdlc_last_input', inputValue)

    if (docType) {
      localStorage.setItem('selectedDocType', docType)
    }

    if (!user) {
      setShowDocumentModal(true)
      return
    }

    window.location.href = '/dashboard'
  }

  // Reset analysis state
  const resetAnalysis = useCallback(() => {
    setAnalysisStatus('idle')
    setCurrentStep(null)
    setCompletedSteps([])
    setAnalysisError(null)
    setSpec(null)
    setMarkdown('')
    setShareUrl(null)
    setIsStreaming(false)
  }, [])

  // Analyze GitHub repo
  const handleAnalyzeRepo = useCallback(async () => {
    if (!repoUrl.trim()) {
      setAnalysisError('Please enter a GitHub repository URL')
      return
    }

    resetAnalysis()
    setAnalysisStatus('analyzing')
    setIsStreaming(true)
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/analyze/repo/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error('Failed to start analysis')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              switch (data.type) {
                case 'step':
                  setCurrentStep(data.step)
                  break
                case 'step_complete':
                  setCompletedSteps((prev) => [...prev, data.step])
                  break
                case 'content':
                  setMarkdown((prev) => prev + data.content)
                  break
                case 'complete':
                  setSpec(data.spec)
                  setShareUrl(data.shareUrl)
                  setAnalysisStatus('complete')
                  setIsStreaming(false)
                  break
                case 'error':
                  throw new Error(data.message || 'Analysis failed')
              }
            } catch (parseError) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return
      setAnalysisError(error.message || 'An error occurred during analysis')
      setAnalysisStatus('error')
      setIsStreaming(false)
    }
  }, [repoUrl, resetAnalysis])

  const handleDocumentSelect = (doc: any) => {
    if (!inputValue.trim()) {
      setShowInputAlert(true)
      return
    }

    setShowDocumentMenu(false)
    localStorage.setItem('selectedDocType', doc.docType || 'business')
    setTimeout(() => handleGetStarted(), 100)
  }

  const features = [
    { icon: Brain, title: "Business Analysis", docType: "business", gradient: "from-blue-500 to-cyan-500" },
    { icon: FileCode, title: "Technical Specs", docType: "technical", gradient: "from-purple-500 to-pink-500" },
    { icon: Palette, title: "UX Design", docType: "ux", gradient: "from-green-500 to-emerald-500" },
    { icon: Database, title: "Architecture", docType: "mermaid", gradient: "from-orange-500 to-amber-500" },
    { icon: Sparkles, title: "AI Coding", docType: "coding", gradient: "from-indigo-500 to-violet-500" },
    { icon: FlaskConical, title: "Test Spec", docType: "test", gradient: "from-rose-500 to-red-500" },
    { icon: Users, title: "Meeting Notes", docType: "meeting", gradient: "from-teal-500 to-cyan-500" },
  ]

  const documentTypes = [
    { icon: FileText, title: "Business Analysis", description: "Create BRD & requirements", requiresAuth: false, docType: "business" },
    { icon: FileCode, title: "Functional Specification", description: "Detailed functional specs", requiresAuth: false, docType: "functional" },
    { icon: Code, title: "Technical Specification", description: "Technical design & architecture", requiresAuth: false, docType: "technical" },
    { icon: Palette, title: "UX Design Specification", description: "UI/UX design requirements", requiresAuth: false, docType: "ux" },
    { icon: Database, title: "Architecture Diagram", description: "System architecture visuals", requiresAuth: false, docType: "mermaid", isFree: true },
    { icon: Sparkles, title: "AI Coding Prompt", description: "AI-optimized implementation guide", requiresAuth: false, docType: "coding", isFree: true },
    { icon: FlaskConical, title: "Test Specification (TDD/BDD)", description: "Modern test specs", requiresAuth: false, docType: "test", isFree: true },
    { icon: Users, title: "Meeting Transcript", description: "Process meeting transcripts", requiresAuth: false, docType: "meeting", isFree: true },
    { icon: TestTube, title: "Test Plan", description: "QA and testing strategy", requiresAuth: true },
    { icon: GitBranch, title: "API Documentation", description: "API specs and docs", requiresAuth: true },
    { icon: BookOpen, title: "User Guide", description: "End-user documentation", requiresAuth: true },
    { icon: Building, title: "Project Setup", description: "GitHub, Jira, Confluence setup", requiresAuth: true }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  return (
    <>
      <AnimatedBackground />

      <div className="relative min-h-screen text-white flex flex-col">
        {/* Glass Header */}
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/[0.02] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 sm:h-16 items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-8 sm:h-10 w-auto" />
              </div>

              {/* Rate Limit Display */}
              {!user && rateLimitStatus && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border ${
                  rateLimitStatus.remaining <= 3
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : rateLimitStatus.remaining === 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                }`}>
                  <span className={`text-sm font-semibold ${
                    rateLimitStatus.remaining <= 3 ? 'text-orange-400' : rateLimitStatus.remaining === 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {Math.max(0, rateLimitStatus.remaining)}/10 docs
                  </span>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/50">{getTimeUntilReset(rateLimitStatus.resetAt)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-sm"
                    size="sm"
                  >
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10 text-sm"
                      onClick={() => window.location.href = '/signin'}
                    >
                      <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Sign in</span>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-sm"
                      onClick={() => window.location.href = '/signin'}
                    >
                      <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-12">
          <div className="max-w-3xl mx-auto w-full space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  {getGreeting()}
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-white/50 max-w-xl mx-auto">
                Transform ideas into specs, or analyze any GitHub repo instantly
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center justify-center gap-2">
              <TabButton
                active={activeTab === 'describe'}
                onClick={() => setActiveTab('describe')}
                icon={Brain}
                label="Describe Project"
              />
              <TabButton
                active={activeTab === 'analyze'}
                onClick={() => setActiveTab('analyze')}
                icon={Github}
                label="Analyze Repo"
              />
            </div>

            {/* Main Input Card */}
            <GlassCard className="p-4 sm:p-6" hover={false}>
              {activeTab === 'describe' ? (
                <>
                  {/* Describe Project Tab */}
                  <div className="relative">
                    <textarea
                      placeholder="Describe your project idea (e.g., 'Build an Uber for medicine delivery', 'Create a social media app for pet owners')"
                      className="w-full min-h-[100px] sm:min-h-[120px] text-base sm:text-lg text-white placeholder-white/30 resize-none focus:outline-none bg-transparent pr-8"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (inputValue.trim()) {
                            handleGetStarted()
                          }
                        }
                      }}
                    />
                    {inputValue && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-0 top-0 h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                        onClick={() => setInputValue('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Tools Bar */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 sm:gap-2 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 sm:h-9 px-2 sm:px-3 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={() => setShowDocumentMenu(!showDocumentMenu)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        <CodeAssistantMenu />

                        {/* Document Type Dropdown */}
                        {showDocumentMenu && (
                          <div
                            ref={menuRef}
                            className="absolute bottom-full left-0 mb-2 w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 z-50"
                          >
                            <div className="px-3 py-2 text-sm font-medium text-white/70 border-b border-white/10">
                              Choose document type
                            </div>
                            <div className="p-2 border-b border-white/10">
                              <div className="px-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                <p className="text-xs text-blue-300 font-medium flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  Try any document type - Free Preview!
                                </p>
                              </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {documentTypes.map((doc, index) => {
                                const isLocked = doc.requiresAuth
                                const isFree = doc.isFree

                                return (
                                  <button
                                    key={index}
                                    onClick={() => handleDocumentSelect(doc)}
                                    className={`w-full px-3 py-2 flex items-start gap-3 transition-colors ${
                                      isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'
                                    }`}
                                    disabled={isLocked}
                                  >
                                    <doc.icon className="h-5 w-5 mt-0.5 text-white/60" />
                                    <div className="text-left flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{doc.title}</span>
                                        {isFree && (
                                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Free</span>
                                        )}
                                        {isLocked && (
                                          <Lock className="h-3 w-3 text-white/40" />
                                        )}
                                      </div>
                                      <div className="text-xs text-white/40">{doc.description}</div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {Object.keys(previousDocuments).length > 0 && (
                          <ViewDocsMenu
                            documents={previousDocuments}
                            lastInput={inputValue || localStorage.getItem('sdlc_last_input') || ''}
                            className={showViewDocsHint ? 'animate-pulse' : ''}
                          />
                        )}
                        <Button
                          size="sm"
                          className="h-8 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                          onClick={() => handleGetStarted()}
                          disabled={!inputValue.trim()}
                        >
                          <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Generate</span>
                          <ArrowUp className="h-4 w-4 sm:hidden" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Analyze Repo Tab */}
                  {analysisStatus === 'idle' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Github className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">GitHub Repo Analyzer</h3>
                          <p className="text-sm text-white/50">Instant specs from any repository</p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Github className="w-4 h-4 text-white" />
                        </div>
                        <Input
                          type="text"
                          placeholder="github.com/owner/repo or owner/repo"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeRepo()}
                          className="h-12 sm:h-14 pl-16 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl text-base"
                        />
                      </div>

                      {analysisError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          {analysisError}
                        </div>
                      )}

                      <Button
                        onClick={handleAnalyzeRepo}
                        disabled={!repoUrl.trim()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 h-10 sm:h-12 text-base font-medium"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        Analyze Repository
                      </Button>

                      <p className="text-center text-white/40 text-xs sm:text-sm">
                        Generates: Tech Stack, Architecture, Directory Structure, Features
                      </p>
                    </div>
                  )}

                  {analysisStatus === 'analyzing' && (
                    <div className="py-8">
                      <ProgressIndicator
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        error={analysisError}
                      />
                    </div>
                  )}

                  {analysisStatus === 'error' && (
                    <div className="space-y-4 py-4">
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-red-400 font-medium mb-2">Analysis Failed</p>
                        <p className="text-red-300/70 text-sm">{analysisError}</p>
                      </div>
                      <Button
                        onClick={resetAnalysis}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  )}
                </>
              )}
            </GlassCard>

            {/* Analysis Complete - Show Spec Viewer */}
            {activeTab === 'analyze' && analysisStatus === 'complete' && markdown && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Generated Specification</h3>
                  <Button
                    onClick={resetAnalysis}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Analyze Another
                  </Button>
                </div>
                <SpecViewer
                  spec={spec}
                  markdown={markdown}
                  shareUrl={shareUrl || undefined}
                  isStreaming={isStreaming}
                />
              </div>
            )}

            {/* Quick Actions - Only show for describe tab */}
            {activeTab === 'describe' && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <TooltipProvider delayDuration={300}>
                  {features.map((feature, index) => {
                    const hasDocument = previousDocuments[feature.docType]
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleGetStarted(feature.docType)}
                            className={`
                              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
                              rounded-xl backdrop-blur-xl transition-all duration-300
                              ${hasDocument
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                              }
                              border
                            `}
                          >
                            <feature.icon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                            <span className="text-xs sm:text-sm font-medium">{feature.title}</span>
                            {hasDocument && <Check className="h-3 w-3 text-green-400" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white border-slate-700">
                          <p className="text-sm">Generate {feature.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </TooltipProvider>
              </div>
            )}

            {/* Footer Text - Hide when showing spec */}
            {!(activeTab === 'analyze' && analysisStatus === 'complete') && (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-white/40">
                  AI-powered SDLC automation • Transform ideas into production-ready specs
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Tech Stacks Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 mb-4">
              <TrendingUp className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Learn from the Best</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Real Architecture from{' '}
              </span>
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                World-Class Companies
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-sm">
              Explore how Netflix, Meta, Stripe, Cloudflare, Discord and {companies.length - 5}+ tech giants architect systems at massive scale.
            </p>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {companies.map((company) => {
              const primaryTech = Object.values(company.techStack)
                .flat()
                .filter((t) => t.isPrimary)
                .slice(0, 3);

              const categoryGradients: Record<string, string> = {
                'streaming': 'from-red-500 to-pink-500',
                'transportation': 'from-blue-500 to-cyan-500',
                'fintech': 'from-purple-500 to-indigo-500',
                'e-commerce': 'from-orange-500 to-amber-500',
                'communication': 'from-green-500 to-emerald-500',
                'social-media': 'from-pink-500 to-rose-500',
                'cloud': 'from-blue-600 to-blue-400',
              };

              const gradient = categoryGradients[company.category] || 'from-gray-500 to-gray-400';

              return (
                <Link key={company.slug} href={`/tech-stacks/${company.slug}`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] p-5 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2] hover:scale-[1.02] h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {company.name}
                        </h3>
                        <p className="text-white/40 text-xs capitalize">
                          {company.category.replace('-', ' ')}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                    </div>

                    <p className="text-white/50 text-xs mb-3 line-clamp-2">
                      {company.description}
                    </p>

                    {company.metrics.users && (
                      <p className="text-white/60 text-xs mb-3 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {company.metrics.users}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {primaryTech.map((tech) => (
                        <span
                          key={tech.name}
                          className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-[10px] border border-white/10"
                        >
                          {tech.name}
                        </span>
                      ))}
                      {company.architectureDiagrams && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] border border-blue-500/30">
                          Diagrams
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link href="/tech-stacks">
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 py-2 h-auto"
              >
                <Database className="mr-2 w-4 h-4" />
                View Detailed Architecture Diagrams
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Glass Footer */}
        <footer className="border-t border-white/[0.08] backdrop-blur-xl bg-white/[0.02] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-white/40">
              <div className="flex items-center gap-2">
                <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-6 w-auto opacity-60" />
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/durdan/dd-sdlc-ai" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
              <p>&copy; {new Date().getFullYear()} SDLC.dev</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Document Generation Modal */}
      <SimpleDocumentGenerationModal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false)
          const savedDocs = localStorage.getItem('sdlc_generated_docs')
          if (savedDocs) {
            try {
              setPreviousDocuments(JSON.parse(savedDocs))
            } catch (e) {
              console.error('Error loading documents:', e)
            }
          }
          if (!user) checkRateLimit()
        }}
        input={inputValue}
        onDocumentGenerated={(updatedDocs) => {
          setPreviousDocuments(updatedDocs)
          if (Object.keys(updatedDocs).length > 0) {
            setShowViewDocsHint(true)
            setTimeout(() => setShowViewDocsHint(false), 5000)
          }
          if (!user) checkRateLimit()
        }}
      />

      <CustomAlert
        isOpen={showInputAlert}
        onClose={() => setShowInputAlert(false)}
        title="Input Required"
        message="Please describe your project idea before generating documents"
        buttonText="OK"
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
