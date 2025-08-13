'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NavButtonWithMenu } from '@/components/nav-button-with-menu'
import { SimpleDocumentGenerationModal } from '@/components/simple-document-generation-modal'
import {
  FileText,
  Code,
  Palette,
  Database,
  Plus,
  Settings2,
  Brain
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CleanLandingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<string>('')
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [previousDocuments, setPreviousDocuments] = useState<Record<string, string>>({})

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

  const handleDocumentSelect = (type: string, sections?: string[]) => {
    if (!inputValue.trim()) {
      // Focus on input if empty
      const inputElement = document.querySelector('textarea')
      inputElement?.focus()
      return
    }
    
    // Save the input
    localStorage.setItem('sdlc_last_input', inputValue)
    
    // Save selected document type and sections
    localStorage.setItem('selectedDocType', type)
    if (sections && type === 'technical') {
      localStorage.setItem('techSpecSections', JSON.stringify(sections))
    } else if (sections) {
      localStorage.setItem(`${type}Sections`, JSON.stringify(sections))
    }
    
    setSelectedDocType(type)
    setSelectedSections(sections || [])
    
    // Open the modal to generate
    setShowDocumentModal(true)
  }

  const handleViewDocs = () => {
    const savedInput = localStorage.getItem('sdlc_last_input')
    if (savedInput && !inputValue.trim()) {
      setInputValue(savedInput)
    }
    setShowDocumentModal(true)
  }

  const handleGenerateWithPlus = () => {
    if (!inputValue.trim()) {
      const inputElement = document.querySelector('textarea')
      inputElement?.focus()
      return
    }
    
    localStorage.setItem('sdlc_last_input', inputValue)
    setShowDocumentModal(true)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl space-y-8">
          {/* Greeting */}
          <h1 className="text-3xl font-light text-center text-gray-900">
            {getGreeting()}, Developer
          </h1>

          {/* Input Area */}
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your project or paste your requirements..."
              className="w-full min-h-[120px] p-4 pr-12 text-gray-900 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  e.preventDefault()
                  handleGenerateWithPlus()
                }
              }}
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateWithPlus}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <Settings2 className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* View Docs Button */}
            {Object.keys(previousDocuments).length > 0 && (
              <div className="absolute bottom-3 right-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDocs}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4" />
                  View Docs
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {Object.keys(previousDocuments).length}
                  </span>
                </Button>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateWithPlus}
              disabled={!inputValue.trim()}
              className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white"
              style={{ display: Object.keys(previousDocuments).length > 0 ? 'none' : 'flex' }}
            >
              SDLC AI
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <NavButtonWithMenu
              icon={Brain}
              label="Business Analysis"
              color="text-blue-600"
              documentType="business"
              onSelect={handleDocumentSelect}
            />
            
            <NavButtonWithMenu
              icon={Code}
              label="Technical Specs"
              color="text-purple-600"
              documentType="technical"
              onSelect={handleDocumentSelect}
            />
            
            <NavButtonWithMenu
              icon={Palette}
              label="UX Design"
              color="text-pink-600"
              documentType="ux"
              onSelect={handleDocumentSelect}
            />
            
            <NavButtonWithMenu
              icon={Database}
              label="Architecture"
              color="text-green-600"
              documentType="mermaid"
              onSelect={handleDocumentSelect}
            />
          </div>

          {/* Info Text */}
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
          setPreviousDocuments(updatedDocs)
        }}
      />
    </div>
  )
}