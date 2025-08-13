'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Code,
  Palette,
  Database,
  TestTube,
  FileCode,
  BookOpen,
  Users,
  ChevronDown,
  Check,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react'
import { techSpecSections } from '@/lib/tech-spec-sections'

interface DocumentTypeSelectorProps {
  selectedType: string
  onTypeChange: (type: string) => void
  selectedTechSections?: string[]
  onTechSectionsChange?: (sections: string[]) => void
  isLoggedIn?: boolean
  className?: string
}

interface DocumentType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
  isFree?: boolean
  hasSubsections?: boolean
}

const documentTypes: DocumentType[] = [
  {
    id: 'business',
    name: 'Business Analysis',
    description: 'Create BRD & requirements',
    icon: FileText,
    isFree: true
  },
  {
    id: 'functional',
    name: 'Functional Specification',
    description: 'Detailed functional specs',
    icon: FileCode,
    isFree: true
  },
  {
    id: 'technical',
    name: 'Technical Specification',
    description: 'Technical design & architecture',
    icon: Code,
    isFree: true,
    hasSubsections: true
  },
  {
    id: 'ux',
    name: 'UX Design Specification',
    description: 'UI/UX design requirements',
    icon: Palette,
    isFree: true
  },
  {
    id: 'mermaid',
    name: 'Architecture Diagram',
    description: 'System architecture visuals',
    icon: Database,
    isFree: true
  },
  {
    id: 'test-plan',
    name: 'Test Plan',
    description: 'QA and testing strategy',
    icon: TestTube,
    requiresAuth: true
  },
  {
    id: 'api-docs',
    name: 'API Documentation',
    description: 'API specs and docs',
    icon: FileCode,
    requiresAuth: true
  },
  {
    id: 'user-guide',
    name: 'User Guide',
    description: 'End-user documentation',
    icon: BookOpen,
    requiresAuth: true
  }
]

export function DocumentTypeSelector({
  selectedType,
  onTypeChange,
  selectedTechSections = ['system-architecture'],
  onTechSectionsChange,
  isLoggedIn = false,
  className = ''
}: DocumentTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTechSections, setShowTechSections] = useState(false)

  const selectedDoc = documentTypes.find(d => d.id === selectedType)
  const allTechSections = Object.values(techSpecSections)

  const handleDocumentSelect = (docId: string) => {
    if (docId === 'technical') {
      setShowTechSections(true)
    } else {
      onTypeChange(docId)
      setIsOpen(false)
      setShowTechSections(false)
    }
  }

  const handleTechSectionToggle = (sectionId: string) => {
    if (!onTechSectionsChange) return
    
    if (selectedTechSections.includes(sectionId)) {
      onTechSectionsChange(selectedTechSections.filter(id => id !== sectionId))
    } else {
      onTechSectionsChange([...selectedTechSections, sectionId])
    }
  }

  const handleTechSpecConfirm = () => {
    onTypeChange('technical')
    setIsOpen(false)
    setShowTechSections(false)
  }

  const applyTechPreset = (preset: string) => {
    if (!onTechSectionsChange) return
    
    switch (preset) {
      case 'default':
        onTechSectionsChange(['system-architecture'])
        break
      case 'full-stack':
        onTechSectionsChange(['system-architecture', 'data-design', 'api-specifications', 'infrastructure-devops'])
        break
      case 'api-first':
        onTechSectionsChange(['api-specifications', 'data-design', 'security-architecture'])
        break
      case 'enterprise':
        onTechSectionsChange(['system-architecture', 'security-architecture', 'infrastructure-devops', 'performance-scale'])
        break
      case 'all':
        onTechSectionsChange(allTechSections.map(s => s.id))
        break
    }
  }

  const getTechSpecLabel = () => {
    if (selectedType !== 'technical') return ''
    if (selectedTechSections.length === 1 && selectedTechSections[0] === 'system-architecture') {
      return ''
    }
    if (selectedTechSections.length === allTechSections.length) {
      return 'All sections'
    }
    return `${selectedTechSections.length} sections`
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedDoc && <selectedDoc.icon className="h-4 w-4" />}
          <span>{selectedDoc?.name || 'Choose document type'}</span>
          {selectedType === 'technical' && getTechSpecLabel() && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {getTechSpecLabel()}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {!showTechSections ? (
            <>
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Choose document type to generate</h3>
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Try any document type - Free Preview!</span>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {documentTypes.map((doc) => {
                  const isLocked = doc.requiresAuth && !isLoggedIn
                  
                  return (
                    <button
                      key={doc.id}
                      onClick={() => !isLocked && handleDocumentSelect(doc.id)}
                      disabled={isLocked}
                      className={`
                        w-full px-3 py-3 rounded-md text-left transition-colors
                        ${isLocked 
                          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                          : 'hover:bg-gray-50 cursor-pointer'
                        }
                        ${selectedType === doc.id ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <doc.icon className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900">
                              {doc.name}
                            </span>
                            {doc.hasSubsections && (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                            {doc.isFree && !isLocked && (
                              <span className="text-xs text-blue-600 font-medium">Free</span>
                            )}
                            {isLocked && (
                              <span className="text-xs text-gray-500 font-medium">Sign in</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                        </div>
                        {selectedType === doc.id && !doc.hasSubsections && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {!isLoggedIn && (
                <div className="p-3 border-t border-gray-100">
                  <Button 
                    variant="link"
                    className="w-full text-blue-600 hover:text-blue-700"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign in to unlock all document types →
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Technical Spec Subsections */}
              <div className="p-4 border-b border-gray-100">
                <button
                  onClick={() => setShowTechSections(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 mb-3"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>Back to document types</span>
                </button>
                <h3 className="text-sm font-medium text-gray-900">Technical Specification Options</h3>
                <p className="text-xs text-gray-500 mt-1">Select the sections to include in your spec</p>
              </div>

              {/* Quick Presets */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => applyTechPreset('default')}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => applyTechPreset('full-stack')}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Full Stack
                  </button>
                  <button
                    onClick={() => applyTechPreset('api-first')}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    API First
                  </button>
                  <button
                    onClick={() => applyTechPreset('enterprise')}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Enterprise
                  </button>
                  <button
                    onClick={() => applyTechPreset('all')}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Section List */}
              <div className="max-h-64 overflow-y-auto p-2">
                {allTechSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleTechSectionToggle(section.id)}
                    className="w-full px-3 py-2 rounded-md hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 mt-0.5">
                        {selectedTechSections.includes(section.id) && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{section.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{section.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Confirm Button */}
              <div className="p-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {selectedTechSections.length} of {allTechSections.length} selected
                </div>
                <Button
                  size="sm"
                  onClick={handleTechSpecConfirm}
                  disabled={selectedTechSections.length === 0}
                >
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}