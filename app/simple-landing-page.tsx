"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
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
  RotateCcw,
  ChevronDown,
  Menu
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
import { detectInputType, normalizeGitHubUrl, type InputType } from '@/lib/url-detector'
import { TrendingUp, Building2 } from 'lucide-react'
import Link from 'next/link'

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


export default function SimpleLandingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [showDocumentMenu, setShowDocumentMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const plusButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-detect input type (GitHub URL or description)
  const inputType = useMemo(() => detectInputType(inputValue), [inputValue])

  // Track if mounted (for portal) and load selectedDocType from localStorage
  useEffect(() => {
    setMounted(true)
    const storedDocType = localStorage.getItem('selectedDocType')
    if (storedDocType) {
      setSelectedDocType(storedDocType)
    }
  }, [])

  // Map doc type to display label
  const docTypeLabels: Record<string, string> = {
    business: 'Business Analysis',
    functional: 'Functional Spec',
    technical: 'Technical Spec',
    ux: 'UX Design',
    mermaid: 'Architecture',
    coding: 'AI Coding',
    test: 'Test Spec',
    meeting: 'Meeting Notes'
  }

  // Calculate menu position when opening
  const updateMenuPosition = useCallback(() => {
    if (plusButtonRef.current) {
      const rect = plusButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.top - 8, // 8px gap above button
        left: rect.left
      })
    }
  }, [])

  // Handle opening the + menu
  const handleOpenMenu = useCallback(() => {
    if (!showDocumentMenu) {
      updateMenuPosition()
    }
    setShowDocumentMenu(!showDocumentMenu)
  }, [showDocumentMenu, updateMenuPosition])
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showInputAlert, setShowInputAlert] = useState(false)
  const [previousDocuments, setPreviousDocuments] = useState<Record<string, string>>({})
  const [showViewDocsHint, setShowViewDocsHint] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string>('business')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
      const target = event.target as Node
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        plusButtonRef.current && !plusButtonRef.current.contains(target)
      ) {
        setShowDocumentMenu(false)
      }
    }

    if (showDocumentMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', updateMenuPosition, true)
      window.addEventListener('resize', updateMenuPosition)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updateMenuPosition, true)
      window.removeEventListener('resize', updateMenuPosition)
    }
  }, [showDocumentMenu, updateMenuPosition])

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

  // EventSource ref for cleanup
  const eventSourceRef = useRef<EventSource | null>(null)

  // Analyze GitHub repo using EventSource for reliable SSE
  const handleAnalyzeRepo = useCallback(() => {
    if (!inputValue.trim()) {
      setAnalysisError('Please enter a GitHub repository URL')
      return
    }

    resetAnalysis()
    setAnalysisStatus('analyzing')
    setIsStreaming(true)

    // Immediately show first step
    setCurrentStep('fetching_metadata')

    let fullMarkdown = ''

    // Normalize and encode the URL
    const normalizedUrl = normalizeGitHubUrl(inputValue)
    const encodedUrl = encodeURIComponent(normalizedUrl)
    const eventSource = new EventSource(`/api/analyze/repo/sse?repo=${encodedUrl}`)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data)
        setCurrentStep(data.step)
        if (data.step !== 'complete') {
          const steps: AnalysisStep[] = ['fetching_metadata', 'analyzing_structure', 'reading_files', 'analyzing_architecture', 'generating_spec']
          const stepIndex = steps.indexOf(data.step)
          if (stepIndex > 0) {
            setCompletedSteps(steps.slice(0, stepIndex))
          }
        }
      } catch (err) {
        console.error('[SSE] Failed to parse progress:', err)
      }
    })

    eventSource.addEventListener('content', (e) => {
      try {
        const data = JSON.parse(e.data)
        fullMarkdown += data.text
        setMarkdown(fullMarkdown)
      } catch (err) {
        console.error('[SSE] Failed to parse content:', err)
      }
    })

    eventSource.addEventListener('complete', (e) => {
      try {
        const data = JSON.parse(e.data)
        setSpec({ markdown: data.markdown || fullMarkdown, metadata: data.metadata } as GeneratedSpec)
        setShareUrl(data.shareUrl)
        setAnalysisStatus('complete')
        setIsStreaming(false)
        setCompletedSteps(['fetching_metadata', 'analyzing_structure', 'reading_files', 'analyzing_architecture', 'generating_spec'])
        eventSource.close()
      } catch (err) {
        console.error('[SSE] Failed to parse complete:', err)
      }
    })

    eventSource.addEventListener('error', (e) => {
      const messageEvent = e as MessageEvent
      if (messageEvent.data) {
        try {
          const data = JSON.parse(messageEvent.data)
          setAnalysisError(data.error || 'Analysis failed')
        } catch {
          setAnalysisError('Analysis failed')
        }
      } else {
        setAnalysisError('Connection lost. Please try again.')
      }
      setAnalysisStatus('error')
      setIsStreaming(false)
      eventSource.close()
    })

  }, [inputValue, resetAnalysis])

  const handleDocumentSelect = (doc: any) => {
    const docType = doc.docType || 'business'
    setSelectedDocType(docType)
    localStorage.setItem('selectedDocType', docType)
    setShowDocumentMenu(false)

    if (!inputValue.trim()) {
      // Just update selection, don't generate yet
      return
    }

    setTimeout(() => handleGetStarted(docType), 100)
  }

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
        <header className="sticky top-0 z-50">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 sm:h-20 items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-12 sm:h-16 w-auto" />
                </Link>
              </div>

              {/* Center: Navigation Links - Hidden on mobile */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/tech-stacks"
                  className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-1.5"
                >
                  <Database className="w-4 h-4" />
                  Tech Stacks
                </Link>
                <Link
                  href="/learning-paths"
                  className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  Learning Paths
                </Link>
                <Link
                  href="/system-design"
                  className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  System Design
                </Link>
                <Link
                  href="/idea-to-spec"
                  className="px-3 py-2 rounded-lg text-orange-400/90 hover:text-orange-300 hover:bg-orange-500/10 text-sm font-medium transition-all flex items-center gap-1.5 border border-orange-500/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Idea to Spec
                </Link>
              </nav>

              {/* Right: Rate Limit + Auth */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Rate Limit Display - Compact */}
                {!user && rateLimitStatus && (
                  <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    rateLimitStatus.remaining <= 3
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : rateLimitStatus.remaining === 0
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{Math.max(0, rateLimitStatus.remaining)}/10</span>
                  </div>
                )}

                {/* Auth Buttons */}
                {user ? (
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-sm h-9"
                    size="sm"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <ArrowRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex text-white/70 hover:text-white hover:bg-white/10 text-sm h-9"
                      onClick={() => window.location.href = '/signin'}
                    >
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-sm h-9"
                      onClick={() => window.location.href = '/signin'}
                    >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Sign up</span>
                    </Button>
                  </>
                )}

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-white/70 hover:text-white hover:bg-white/10 h-9 w-9 p-0"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="md:hidden py-3 border-t border-white/10">
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/tech-stacks"
                    className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Database className="w-4 h-4" />
                    Tech Stacks
                  </Link>
                  <Link
                    href="/learning-paths"
                    className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Learning Paths
                  </Link>
                  <Link
                    href="/system-design"
                    className="px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-all flex items-center gap-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Layers className="w-4 h-4" />
                    System Design
                  </Link>
                  <Link
                    href="/idea-to-spec"
                    className="px-3 py-2.5 rounded-lg text-orange-400/90 hover:text-orange-300 hover:bg-orange-500/10 text-sm font-medium transition-all flex items-center gap-2 border border-orange-500/30"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Sparkles className="w-4 h-4" />
                    Idea to Spec
                  </Link>
                  {!user && rateLimitStatus && (
                    <div className={`mx-3 mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      rateLimitStatus.remaining <= 3
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.max(0, rateLimitStatus.remaining)}/10 free generations remaining</span>
                    </div>
                  )}
                </nav>
              </div>
            )}
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

            {/* Main Input Card - Unified Smart Input */}
            <GlassCard className="p-4 sm:p-6" hover={false}>
              {/* Show input when idle or when analyzing (show progress) */}
              {analysisStatus === 'idle' && (
                <>
                  {/* Smart Input */}
                  <div className="relative">
                    <textarea
                      placeholder="Describe your project or paste a GitHub repo URL..."
                      className="w-full min-h-[100px] sm:min-h-[120px] text-base sm:text-lg text-white placeholder-white/30 resize-none focus:outline-none bg-transparent pr-12"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (inputValue.trim()) {
                            if (inputType === 'github') {
                              handleAnalyzeRepo()
                            } else {
                              handleOpenMenu() // Open menu to select spec type
                            }
                          }
                        }
                      }}
                    />
                    {/* GitHub indicator when URL detected */}
                    {inputType === 'github' && (
                      <div className="absolute right-10 top-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                        <Github className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">GitHub</span>
                      </div>
                    )}
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
                          ref={plusButtonRef}
                          variant="ghost"
                          size="sm"
                          className="h-8 sm:h-9 px-2 sm:px-3 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={handleOpenMenu}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        {/* Unified + Dropdown Menu - via Portal */}
                        {showDocumentMenu && mounted && createPortal(
                          <div
                            ref={menuRef}
                            className="fixed w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 py-2 z-[9999]"
                            style={{
                              top: menuPosition.top,
                              left: menuPosition.left,
                              transform: 'translateY(-100%)'
                            }}
                          >
                            <div className="px-3 py-2 text-sm font-medium text-white/70 border-b border-white/10">
                              Spec Types
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {documentTypes.filter(d => !d.requiresAuth).map((doc, index) => {
                                const isFree = doc.isFree

                                return (
                                  <button
                                    key={index}
                                    onClick={() => handleDocumentSelect(doc)}
                                    className="w-full px-3 py-2 flex items-start gap-3 transition-colors hover:bg-white/5"
                                  >
                                    <doc.icon className="h-5 w-5 mt-0.5 text-white/60" />
                                    <div className="text-left flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">{doc.title}</span>
                                        {isFree && (
                                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Free</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-white/40">{doc.description}</div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                            <div className="border-t border-white/10 mt-1 pt-1">
                              <div className="px-3 py-2 text-xs font-medium text-white/50">AI Coding Rules</div>
                              <CodeAssistantMenu />
                            </div>
                          </div>,
                          document.body
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
                        {/* Dynamic Generate/Analyze Button */}
                        {inputType === 'github' ? (
                          <Button
                            size="sm"
                            className="h-8 sm:h-9 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0"
                            onClick={handleAnalyzeRepo}
                            disabled={!inputValue.trim()}
                          >
                            <Search className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Analyze</span>
                            <ArrowUp className="h-4 w-4 sm:hidden" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                            onClick={() => {
                              if (!inputValue.trim()) {
                                setShowInputAlert(true)
                                return
                              }
                              handleOpenMenu()
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Generate</span>
                            <ArrowUp className="h-4 w-4 sm:hidden" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error display */}
                  {analysisError && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {analysisError}
                    </div>
                  )}
                </>
              )}

              {/* Analysis in progress */}
              {analysisStatus === 'analyzing' && (
                <div className="py-8">
                  <ProgressIndicator
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    error={analysisError}
                  />
                </div>
              )}

              {/* Analysis error state */}
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
            </GlassCard>

            {/* Analysis Complete - Show Spec Viewer */}
            {analysisStatus === 'complete' && markdown && (
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

            {/* Feature Pills - 4 main actions */}
            {analysisStatus === 'idle' && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {/* Generate Specs */}
                <button
                  onClick={() => {
                    if (inputValue.trim() && inputType === 'description') {
                      handleOpenMenu() // Open menu to select spec type
                    } else if (!inputValue.trim()) {
                      setShowInputAlert(true)
                    } else {
                      handleOpenMenu()
                    }
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Generate Specs</span>
                </button>

                {/* Analyze Repo */}
                <button
                  onClick={() => {
                    if (inputValue.trim() && inputType === 'github') {
                      handleAnalyzeRepo()
                    } else {
                      setInputValue('github.com/')
                    }
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Github className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Analyze Repo</span>
                </button>

                {/* Tech Stacks - Link */}
                <Link
                  href="/tech-stacks"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Database className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Tech Stacks</span>
                </Link>

                {/* Learning Paths - Link */}
                <Link
                  href="/learning-paths"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl backdrop-blur-xl transition-all duration-300 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <GraduationCap className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Learning Paths</span>
                </Link>
              </div>
            )}

            {/* Footer Text - Hide when showing spec */}
            {analysisStatus !== 'complete' && (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-white/40">
                  AI-powered SDLC automation • Transform ideas into production-ready specs
                </p>
              </div>
            )}
          </div>
        </main>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-4">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <GlassCard className="p-5 text-center h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Describe or Analyze</h3>
                <p className="text-white/50 text-xs">
                  Enter your project idea or paste a GitHub repo URL
                </p>
              </GlassCard>
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <GlassCard className="p-5 text-center h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">AI Generates Specs</h3>
                <p className="text-white/50 text-xs">
                  Get technical specs, architecture diagrams, and docs
                </p>
              </GlassCard>
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            {/* Step 3 */}
            <div>
              <GlassCard className="p-5 text-center h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Build & Ship</h3>
                <p className="text-white/50 text-xs">
                  Export to JIRA, GitHub, or use specs to guide development
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

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

        {/* GenAI Learning Paths Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-blue-500/20 border border-white/10 p-8 sm:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                  <GraduationCap className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Interactive Guide</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    GenAI Learning Paths
                  </span>
                </h2>
                <p className="text-white/60 mb-6 max-w-lg">
                  Explore role-based learning paths for AI tools. From ChatGPT & Claude to Cursor & GitHub Copilot - discover the best tools for developers, designers, PMs, and more.
                </p>

                {/* Tool icons preview */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {['🤖 ChatGPT', '🧠 Claude', '⚡ Cursor', '🔧 Copilot', '✨ v0.dev'].map((tool) => (
                    <span key={tool} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">
                      {tool}
                    </span>
                  ))}
                </div>

                <Link href="/learning-paths">
                  <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0 px-6 py-2 h-auto">
                    <GraduationCap className="mr-2 w-4 h-4" />
                    Explore Learning Paths
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {/* Visual preview */}
              <div className="flex-shrink-0 w-full lg:w-80">
                <div className="relative bg-slate-900/80 rounded-2xl p-4 border border-white/10">
                  <div className="text-center mb-4">
                    <span className="text-4xl">👨‍💻</span>
                    <p className="text-sm font-semibold text-white mt-2">Software Developer</p>
                    <p className="text-xs text-white/50">Frontend | Backend | Full-Stack</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Thinking', color: 'bg-emerald-500', items: 'Claude, ChatGPT' },
                      { label: 'Assistants', color: 'bg-blue-500', items: 'Cursor, Copilot' },
                      { label: 'Execution', color: 'bg-pink-500', items: 'v0, Bolt' },
                    ].map((layer) => (
                      <div key={layer.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${layer.color}`} />
                        <span className="text-xs text-white/70 font-medium">{layer.label}</span>
                        <span className="text-xs text-white/40 ml-auto">{layer.items}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-2xl">🎯</span>
                    <p className="text-xs text-white/50">Ship Quality Code Faster</p>
                  </div>
                </div>
              </div>
            </div>
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
                <Link href="/tech-stacks" className="hover:text-white transition-colors">
                  Tech Stacks
                </Link>
                <Link href="/learning-paths" className="hover:text-white transition-colors flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  Learning Paths
                </Link>
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
