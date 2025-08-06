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
  Check
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { SimpleDocumentGenerationModal } from '@/components/simple-document-generation-modal'
import { CustomAlert } from '@/components/ui/custom-alert'

export default function SimpleLandingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [showDocumentMenu, setShowDocumentMenu] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showInputAlert, setShowInputAlert] = useState(false)
  const [previousDocuments, setPreviousDocuments] = useState<Record<string, string>>({})
  const [showViewDocsHint, setShowViewDocsHint] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
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
    }
  ]

  const documentTypes = [
    { icon: FileText, title: "Business Analysis", description: "Create BRD & requirements", requiresAuth: false, docType: "business" },
    { icon: FileCode, title: "Functional Specification", description: "Detailed functional specs", requiresAuth: false, docType: "functional" },
    { icon: Code, title: "Technical Specification", description: "Technical design & architecture", requiresAuth: false, docType: "technical" },
    { icon: Palette, title: "UX Design Specification", description: "UI/UX design requirements", requiresAuth: false, docType: "ux" },
    { icon: Database, title: "Architecture Diagram", description: "System architecture visuals", requiresAuth: false, docType: "mermaid", isFree: true },
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
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo placeholder for mobile */}
            <img 
              src="/img/logo-sdlc-icon.png" 
              alt="SDLC.dev" 
              className="h-12 w-8 md:hidden"
            />
          </div>
          
          {/* Sign In / Sign Up buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
                <Button 
                  onClick={() => window.location.href = '/signin'}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl mx-auto w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-normal text-gray-900 flex items-center justify-center gap-3">
              <img 
                src="/img/logo-sdlc-icon.png" 
                alt="SDLC.dev" 
                className="h-12 w-12"
              />
              {getGreeting()}
            </h1>
          </div>

          {/* Large Chat Input Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Input Section */}
            <div className="p-6">
              <textarea
                placeholder="Describe your project idea (e.g., 'Build an Uber for medicine delivery', 'Create a social media app for pet owners', 'Design an e-learning platform')"
                className="w-full min-h-[120px] text-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none"
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
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Use the last input if available
                          const savedInput = localStorage.getItem('sdlc_last_input')
                          if (savedInput && !inputValue.trim()) {
                            setInputValue(savedInput)
                          }
                          setShowDocumentModal(true)
                        }}
                        className={`relative bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 text-sm ${showViewDocsHint ? 'animate-pulse-border' : ''}`}
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        View Docs
                        <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {Object.keys(previousDocuments).length}
                        </span>
                      </Button>
                      {showViewDocsHint && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                          You have {Object.keys(previousDocuments).length} generated document{Object.keys(previousDocuments).length > 1 ? 's' : ''}! Click to view.
                        </div>
                      )}
                    </div>
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

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-3">
            {features.map((feature, index) => {
              const hasDocument = previousDocuments[feature.docType]
              return (
                <button
                  key={index}
                  onClick={() => handleGetStarted(feature.docType)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border transition-all ${
                    hasDocument 
                      ? 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <feature.icon className={`h-5 w-5 ${hasDocument ? 'text-indigo-600' : 'text-gray-600'}`} />
                  <span className={`font-medium ${hasDocument ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {feature.title}
                  </span>
                  {hasDocument && (
                    <Check className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Info Message */}
          <div className="text-center space-y-2">
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