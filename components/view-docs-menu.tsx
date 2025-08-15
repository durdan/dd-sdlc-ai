"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  FileText,
  ChevronRight,
  Clock,
  Trash2,
  Download,
  Eye,
  Brain,
  Code,
  Palette,
  Database,
  FileCode,
  Sparkles,
  Search,
  X,
  FlaskConical
} from "lucide-react"
import { SimpleDocumentGenerationModal } from "@/components/simple-document-generation-modal"

interface DocumentRecord {
  type: string
  content: string
  input: string
  timestamp: number
}

interface ViewDocsMenuProps {
  documents: Record<string, string>
  lastInput?: string
  onDocumentSelect?: (docType: string, content: string) => void
  className?: string
}

const documentTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  business: { icon: Brain, label: "Business Analysis", color: "text-blue-600" },
  functional: { icon: FileText, label: "Functional Spec", color: "text-purple-600" },
  technical: { icon: Code, label: "Technical Spec", color: "text-green-600" },
  ux: { icon: Palette, label: "UX Design", color: "text-pink-600" },
  mermaid: { icon: Database, label: "Architecture", color: "text-orange-600" },
  coding: { icon: Sparkles, label: "AI Coding Prompt", color: "text-indigo-600" },
  test: { icon: FlaskConical, label: "Test Spec (TDD/BDD)", color: "text-emerald-600" }
}

export function ViewDocsMenu({ 
  documents, 
  lastInput = "",
  onDocumentSelect,
  className = ""
}: ViewDocsMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<{ type: string; content: string; input: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [documentHistory, setDocumentHistory] = useState<DocumentRecord[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  // Load document history from localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        // First try to load from detailed history
        const historyKey = 'sdlc_document_history'
        const storedHistory = localStorage.getItem(historyKey)
        
        if (storedHistory) {
          const history = JSON.parse(storedHistory)
          setDocumentHistory(history)
        } else {
          // Fallback to old format
          const storedDocs = localStorage.getItem('sdlc_generated_docs')
          const storedInput = localStorage.getItem('sdlc_last_generated_input') || 
                              localStorage.getItem('sdlc_last_input') || 
                              lastInput
          
          if (storedDocs) {
            const docs = JSON.parse(storedDocs)
            const history: DocumentRecord[] = []
            
            // Convert to history format
            Object.entries(docs).forEach(([type, content]) => {
              if (content) {
                history.push({
                  type,
                  content: content as string,
                  input: storedInput,
                  timestamp: Date.now() - Math.random() * 3600000 // Random time in last hour for demo
                })
              }
            })
            
            // Sort by timestamp (newest first)
            history.sort((a, b) => b.timestamp - a.timestamp)
            setDocumentHistory(history)
          }
        }
      } catch (error) {
        console.error('Error loading document history:', error)
      }
    }
    
    loadHistory()
  }, [documents, lastInput])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleDocumentClick = (doc: DocumentRecord) => {
    setSelectedDoc({
      type: doc.type,
      content: doc.content,
      input: doc.input
    })
    setShowModal(true)
    setShowMenu(false)
  }

  const handleDeleteDocument = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Remove from detailed history
    const historyKey = 'sdlc_document_history'
    const storedHistory = localStorage.getItem(historyKey)
    if (storedHistory) {
      const history = JSON.parse(storedHistory)
      const updatedHistory = history.filter((h: DocumentRecord) => 
        !(h.type === doc.type && h.input === doc.input && h.timestamp === doc.timestamp)
      )
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory))
    }
    
    // Also remove from simple format if it's the current one
    const storedDocs = localStorage.getItem('sdlc_generated_docs')
    const lastInput = localStorage.getItem('sdlc_last_generated_input')
    if (storedDocs && lastInput === doc.input) {
      const docs = JSON.parse(storedDocs)
      delete docs[doc.type]
      localStorage.setItem('sdlc_generated_docs', JSON.stringify(docs))
    }
    
    // Update history state
    setDocumentHistory(prev => prev.filter(d => 
      !(d.type === doc.type && d.input === doc.input && d.timestamp === doc.timestamp)
    ))
  }

  const handleExportDocument = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const config = documentTypeConfig[doc.type] || { label: doc.type }
    const filename = `${config.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`
    
    const blob = new Blob([doc.content], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredHistory = documentHistory.filter(doc => {
    if (!searchQuery) return true
    const config = documentTypeConfig[doc.type] || { label: doc.type }
    return (
      config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const documentCount = Object.keys(documents).length

  if (documentCount === 0) {
    return null
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
          className={`relative bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-2 sm:px-3 py-1.5 text-xs sm:text-sm ${className}`}
          title={`View ${documentCount} document${documentCount > 1 ? 's' : ''}`}
        >
          <FileText className="h-3.5 sm:h-4 w-3.5 sm:w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">View Docs</span>
          <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] sm:text-xs rounded-full h-4 sm:h-5 w-4 sm:w-5 flex items-center justify-center font-medium">
            {documentCount}
          </span>
          <ChevronRight className={`hidden sm:inline h-3 w-3 ml-1 transition-transform ${showMenu ? 'rotate-90' : ''}`} />
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-[90vw] sm:w-96 max-w-sm sm:max-w-none bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Generated Documents</h3>
                <span className="text-xs text-gray-500">{documentCount} document{documentCount > 1 ? 's' : ''}</span>
              </div>
              
              {/* Show common input if all documents have the same input */}
              {(() => {
                const uniqueInputs = new Set(documentHistory.map(doc => doc.input))
                if (uniqueInputs.size === 1 && documentHistory.length > 0) {
                  const commonInput = documentHistory[0].input
                  return (
                    <div className="mb-2 p-2 bg-white rounded-md border border-gray-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Input:</span> {truncateText(commonInput, 120)}
                      </p>
                    </div>
                  )
                }
                return null
              })()}
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Document List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((doc) => {
                  const config = documentTypeConfig[doc.type] || {
                    icon: FileText,
                    label: doc.type,
                    color: "text-gray-600"
                  }
                  const Icon = config.icon
                  
                  // Check if all documents have the same input
                  const uniqueInputs = new Set(documentHistory.map(d => d.input))
                  const hasSameInput = uniqueInputs.size === 1
                  
                  return (
                    <div
                      key={`${doc.type}-${doc.timestamp}`}
                      onClick={() => handleDocumentClick(doc)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex-1 min-w-0 mr-2">
                              {hasSameInput ? (
                                // When all docs have same input, show doc type as main title
                                <p className="text-sm font-medium text-gray-900">
                                  {config.label}
                                </p>
                              ) : (
                                // When inputs differ, show input as title and doc type as subtitle
                                <>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {truncateText(doc.input, 45)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {config.label}
                                  </p>
                                </>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(doc.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                            {truncateText(doc.content.replace(/[#*`]/g, '').trim(), 100)}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDocumentClick(doc)
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              onClick={(e) => handleExportDocument(doc, e)}
                              className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Export
                            </button>
                            <button
                              onClick={(e) => handleDeleteDocument(doc, e)}
                              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'No documents match your search' : 'No documents generated yet'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredHistory.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    // Clear all document storage
                    localStorage.removeItem('sdlc_generated_docs')
                    localStorage.removeItem('sdlc_document_history')
                    localStorage.removeItem('sdlc_last_generated_input')
                    setDocumentHistory([])
                    setShowMenu(false)
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All Documents
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Modal */}
      {selectedDoc && (
        <SimpleDocumentGenerationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedDoc(null)
          }}
          input={selectedDoc.input}
          initialDocType={selectedDoc.type}
          initialContent={selectedDoc.content}
        />
      )}
    </>
  )
}