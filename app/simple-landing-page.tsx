"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
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
  X
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { SimpleDocumentGenerationModal } from '@/components/simple-document-generation-modal'
import { CustomAlert } from '@/components/ui/custom-alert'
import { anonymousProjectService } from '@/lib/anonymous-project-service'
import { Clock } from "lucide-react"
import { CodeAssistantMenu } from '@/components/code-assistant-menu'
import { ViewDocsMenu } from '@/components/view-docs-menu'

export default function SimpleLandingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
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
        
        // Check rate limit for non-logged in users
        if (!user) {
          await checkRateLimit()
        }
        
        // Check for previously generated documents
        const savedDocs = localStorage.getItem('sdlc_generated_docs')
        if (savedDocs) {
          try {
            const docs = JSON.parse(savedDocs)
            setPreviousDocuments(docs)
            // Show hint for 5 seconds if there are documents
            if (Object.keys(docs).length > 0) {
              setShowViewDocsHint(true)
              setTimeout(() => setShowViewDocsHint(false), 5000)
            }
          } catch (e) {
            console.error('Error loading previous documents:', e)
          }
        }
        
        // Load last input if available
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

  // Update rate limit timer every minute
  useEffect(() => {
    if (!user && rateLimitStatus) {
      const interval = setInterval(() => {
        // Force re-render to update the time display
        setRateLimitStatus(prev => prev ? { ...prev } : null)
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [user, rateLimitStatus])

  const handleGetStarted = (docType?: string) => {
    // Check if input is provided
    if (!inputValue.trim()) {
      setShowInputAlert(true)
      return
    }
    
    // Save the input for later
    localStorage.setItem('sdlc_last_input', inputValue)
    
    // Store the selected document type if provided
    if (docType) {
      localStorage.setItem('selectedDocType', docType)
      console.log('✅ Set selectedDocType in localStorage:', docType)
    }
    
    // For non-logged-in users, show the document generation modal
    if (!user) {
      setShowDocumentModal(true)
      return
    }
    
    // For logged-in users, go to dashboard
    window.location.href = '/dashboard'
  }

  const handleDocumentSelect = (doc: any) => {
    // Check if input is provided
    if (!inputValue.trim()) {
      alert('Please describe your project idea before selecting a document type')
      return
    }
    
    setShowDocumentMenu(false)
    
    // Store the selected document type for the modal
    localStorage.setItem('selectedDocType', doc.docType || 'business')
    
    // Always trigger handleGetStarted after selection
    setTimeout(() => handleGetStarted(), 100)
  }

  const features = [
    {
      icon: Brain,
      title: "Business Analysis",
      description: "Executive summaries & risk assessment",
      docType: "business"
    },
    {
      icon: FileCode,
      title: "Technical Specs", 
      description: "Architecture & API design",
      docType: "technical"
    },
    {
      icon: Palette,
      title: "UX Design",
      description: "User personas & wireframes",
      docType: "ux"
    },
    {
      icon: Database,
      title: "Architecture",
      description: "Interactive diagrams",
      docType: "mermaid"
    },
    {
      icon: Sparkles,
      title: "Coding Spec",
      description: "AI-optimized implementation guide",
      docType: "coding"
    }
  ]

  const documentTypes = [
    { icon: FileText, title: "Business Analysis", description: "Create BRD & requirements", requiresAuth: false, docType: "business" },
    { icon: FileCode, title: "Functional Specification", description: "Detailed functional specs", requiresAuth: false, docType: "functional" },
    { icon: Code, title: "Technical Specification", description: "Technical design & architecture", requiresAuth: false, docType: "technical" },
    { icon: Palette, title: "UX Design Specification", description: "UI/UX design requirements", requiresAuth: false, docType: "ux" },
    { icon: Database, title: "Architecture Diagram", description: "System architecture visuals", requiresAuth: false, docType: "mermaid", isFree: true },
    { icon: Sparkles, title: "Agentic Coding Spec", description: "AI-optimized implementation guide", requiresAuth: false, docType: "coding", isFree: true },
    { icon: TestTube, title: "Test Plan", description: "QA and testing strategy", requiresAuth: true },
    { icon: GitBranch, title: "API Documentation", description: "API specs and docs", requiresAuth: true },
    { icon: BookOpen, title: "User Guide", description: "End-user documentation", requiresAuth: true },
    { icon: Building, title: "Project Setup", description: "GitHub, Jira, Confluence setup", requiresAuth: true }
  ]

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Developer'
    
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Evening, ${name}`
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      {/* Header with Sign In/Sign Up buttons */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo for desktop only - mobile has it in greeting */}
            <img 
              src="/img/logo-sdlc-icon.png" 
              alt="SDLC.dev" 
              className="h-10 w-10 hidden md:block"
            />
          </div>
          
          {/* Rate Limit Display for Non-logged in users */}
          {!user && rateLimitStatus && (
            <div className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full transition-all ${
              rateLimitStatus.remaining <= 3 
                ? 'bg-orange-100 border border-orange-200' 
                : rateLimitStatus.remaining === 0
                ? 'bg-red-100 border border-red-200'
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-semibold ${
                  rateLimitStatus.remaining <= 3 
                    ? 'text-orange-700' 
                    : rateLimitStatus.remaining === 0
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}>
                  {Math.max(0, rateLimitStatus.remaining)}/10
                </span>
                <span className={`hidden sm:inline text-xs ${
                  rateLimitStatus.remaining <= 3 
                    ? 'text-orange-600' 
                    : rateLimitStatus.remaining === 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>docs left</span>
              </div>
              <div className="w-px h-4 bg-gray-300 opacity-50" />
              <div className="flex items-center gap-1">
                <Clock className={`h-3 w-3 ${
                  rateLimitStatus.remaining === 0 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`} />
                <span className={`text-xs font-medium ${
                  rateLimitStatus.remaining === 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {rateLimitStatus.remaining === 0 ? 'Resets in ' : ''}{getTimeUntilReset(rateLimitStatus.resetAt)}
                </span>
              </div>
            </div>
          )}
          
          {/* Sign In / Sign Up buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base"
                size="sm"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => window.location.href = '/signin'}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 text-sm sm:text-base"
                >
                  <LogIn className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign in</span>
                  <span className="sm:hidden">Sign in</span>
                </Button>
                <Button 
                  onClick={() => window.location.href = '/signin'}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base"
                >
                  <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span>Sign up</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-gray-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <img 
                src="/img/logo-sdlc-icon.png" 
                alt="SDLC.dev" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:hidden"
              />
              <span className="block sm:inline">{getGreeting()}</span>
            </h1>
          </div>

          {/* Large Chat Input Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Input Section */}
            <div className="p-6 relative">
              <textarea
                placeholder="Describe your project idea (e.g., 'Build an Uber for medicine delivery', 'Create a social media app for pet owners', 'Design an e-learning platform')"
                className="w-full min-h-[100px] sm:min-h-[120px] text-base sm:text-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none pr-8"
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
                  className="absolute right-4 top-4 h-8 w-8 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setInputValue('')
                    // Don't clear localStorage - preserve history
                  }}
                  title="Clear input"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Tools Bar */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setShowDocumentMenu(!showDocumentMenu)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <CodeAssistantMenu />
                  
                  {/* Document Type Dropdown Menu */}
                  {showDocumentMenu && (
                    <div 
                      ref={menuRef}
                      className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                        Choose document type to generate
                      </div>
                      <div className="p-2 border-b border-gray-100">
                        <div className="px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded-md">
                          <p className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Try any document type - Free Preview!
                          </p>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {documentTypes.map((doc, index) => {
                          const isLocked = doc.requiresAuth;
                          const isFree = doc.isFree;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => handleDocumentSelect(doc)}
                              className={`w-full px-3 py-2 flex items-start gap-3 transition-colors ${
                                isLocked 
                                  ? 'hover:bg-gray-50/50 opacity-75 cursor-not-allowed' 
                                  : 'hover:bg-gray-50'
                              }`}
                              disabled={isLocked}
                            >
                              <div className="relative">
                                <doc.icon className={`h-5 w-5 mt-0.5 ${
                                  isLocked ? 'text-gray-400' : 'text-gray-600'
                                }`} />
                                {isLocked && (
                                  <Lock className="h-3 w-3 text-gray-400 absolute -right-1 -bottom-1" />
                                )}
                              </div>
                              <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${
                                    isLocked ? 'text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {doc.title}
                                  </span>
                                  {isFree && (
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                                      Free
                                    </span>
                                  )}
                                  {isLocked && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                      Sign in
                                    </span>
                                  )}
                                </div>
                                <div className={`text-xs ${
                                  isLocked ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {doc.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={() => window.location.href = '/signin'}
                          className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1"
                        >
                          Sign in to unlock all document types →
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {Object.keys(previousDocuments).length > 0 && (
                    <>
                      <ViewDocsMenu 
                        documents={previousDocuments}
                        lastInput={inputValue || localStorage.getItem('sdlc_last_input') || ''}
                        className={showViewDocsHint ? 'animate-pulse-border' : ''}
                      />
                      {showViewDocsHint && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                          You have {Object.keys(previousDocuments).length} generated document{Object.keys(previousDocuments).length > 1 ? 's' : ''}! Click to view.
                        </div>
                      )}
                    </>
                  )}
                  <span className="text-sm text-gray-500">SDLC AI</span>
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                    onClick={() => handleGetStarted()}
                    disabled={!inputValue.trim()}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Actions - Responsive Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {features.map((feature, index) => {
              const hasDocument = previousDocuments[feature.docType]
              return (
                <button
                  key={index}
                  onClick={() => handleGetStarted(feature.docType)}
                  className={`relative flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-lg border transition-all ${
                    hasDocument 
                      ? 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <feature.icon className={`h-4 w-4 ${hasDocument ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${hasDocument ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {feature.title}
                  </span>
                  {hasDocument && (
                    <Check className="h-3.5 w-3.5 text-indigo-600 ml-1" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Info Message - Hide on mobile to reduce clutter */}
          <div className="hidden sm:block text-center space-y-2">
            <p className="text-sm text-gray-600">
              AI-powered SDLC automation platform that helps you write specs, generate code, and manage your development workflow
            </p>
            <p className="text-xs text-gray-500">
              Start typing or choose an action above to begin
            </p>
          </div>
        </div>
      </main>

      {/* Document Generation Modal */}
      <SimpleDocumentGenerationModal 
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false)
          // Reload documents from localStorage when modal closes
          const savedDocs = localStorage.getItem('sdlc_generated_docs')
          if (savedDocs) {
            try {
              const docs = JSON.parse(savedDocs)
              setPreviousDocuments(docs)
            } catch (e) {
              console.error('Error loading documents after modal close:', e)
            }
          }
          // Refresh rate limit status for non-logged in users
          if (!user) {
            checkRateLimit()
          }
        }}
        input={inputValue}
        onDocumentGenerated={(updatedDocs) => {
          // Update parent state when document is generated
          setPreviousDocuments(updatedDocs)
          // Show hint for newly generated documents
          if (Object.keys(updatedDocs).length > 0) {
            setShowViewDocsHint(true)
            setTimeout(() => setShowViewDocsHint(false), 5000)
          }
          // Refresh rate limit status for non-logged in users
          if (!user) {
            checkRateLimit()
          }
        }}
      />

      <CustomAlert
        isOpen={showInputAlert}
        onClose={() => setShowInputAlert(false)}
        title="Input Required"
        message="Please describe your project idea before generating documents"
        buttonText="OK"
      />
    </div>
  )
}