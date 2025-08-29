'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { 
  FileText, 
  Sparkles, 
  Settings,
  Zap,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react'
import { businessAnalysisSections } from '@/lib/business-analysis-sections'
import { techSpecSections } from '@/lib/tech-spec-sections'
import { uxDesignSections } from '@/lib/ux-design-sections'
import { architectureSections } from '@/lib/architecture-sections'
import { functionalSpecSections } from '@/lib/functional-spec-sections'

type GenerationMode = 'quick' | 'custom'

interface Section {
  id: string
  name: string
  description: string
  icon?: string
  detailLevel?: 'normal' | 'deep'
}

interface DocumentSelectionImprovedProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  documentType: string
  onSelect: (type: string, sections?: string[]) => void
  hasPreviousDocument?: boolean
  className?: string
}

export function DocumentSelectionImproved({
  icon: Icon,
  label,
  color,
  documentType,
  onSelect,
  hasPreviousDocument = false,
  className = ''
}: DocumentSelectionImprovedProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<GenerationMode>('quick')
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [showReview, setShowReview] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get sections based on document type
  const getSections = (): Section[] => {
    switch (documentType) {
      case 'business':
        return Object.values(businessAnalysisSections)
      case 'functional':
        return Object.values(functionalSpecSections)
      case 'technical':
        return Object.values(techSpecSections)
      case 'ux':
        return Object.values(uxDesignSections)
      case 'mermaid':
      case 'architecture':
        return Object.values(architectureSections)
      case 'wireframe':
        // Wireframe doesn't have sections, return empty
        return []
      default:
        return Object.values(businessAnalysisSections)
    }
  }
  
  const sections = getSections()
  const isWireframe = documentType === 'wireframe'

  // Load saved mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('sdlcGen.mode') as GenerationMode
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem('sdlcGen.mode', mode)
  }, [mode])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }



  const selectAll = () => setSelectedSections(sections.map(s => s.id))
  const clearAll = () => setSelectedSections([])

  const getEstimatedPages = () => {
    const count = selectedSections.length
    const min = count * 0.5
    const max = count * 1.5
    return count === 0 ? '0 pages' : `${min.toFixed(1)}–${max.toFixed(1)} pages`
  }

  const handleQuickGenerate = () => {
    onSelect(documentType, []) // Empty array means full document
    setIsOpen(false)
  }

  const handleCustomGenerate = () => {
    if (selectedSections.length === 0) return
    setShowReview(true)
  }

  const handleConfirmCustom = () => {
    onSelect(documentType, selectedSections)
    setShowReview(false)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group hover:border-indigo-400 hover:bg-indigo-50 transition-all ${className}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-medium">{label}</span>
          {hasPreviousDocument && (
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          )}
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in fade-in slide-in-from-bottom-2 max-h-[85vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`${label} generation options`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Icon className={`h-6 w-6 ${color}`} />
              <h2 className="text-xl font-semibold text-gray-900">{label}</h2>
            </div>

            {/* Mode Selector - Only show for non-wireframe documents */}
            {!isWireframe ? (
              <div className="space-y-3">
                <Label htmlFor="generation-mode" className="text-sm font-medium text-gray-700">
                  Mode
                </Label>
                <RadioGroup
                  id="generation-mode"
                  value={mode}
                  onValueChange={(value) => setMode(value as GenerationMode)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem value="quick" id="quick-mode" className="peer sr-only" />
                    <Label
                      htmlFor="quick-mode"
                      className="flex flex-col p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">Quick draft (High-level)</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        One-pass, concise document. ~1–2 pages.
                      </span>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="custom" id="custom-mode" className="peer sr-only" />
                    <Label
                      htmlFor="custom-mode"
                      className="flex flex-col p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Settings className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">Custom build (Detailed)</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        Pick sections for deeper output.
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Wireframes are generated as a single visual document.
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {(mode === 'quick' || isWireframe) ? (
              /* Quick Draft Mode */
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Fastest and lowest cost.</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>This mode generates a complete {label.toLowerCase()} document in a single pass.</p>
                  <p>Perfect for initial drafts, quick overviews, and proof-of-concepts.</p>
                </div>
              </div>
            ) : (
              /* Custom Build Mode */
              <div className="space-y-6">
                {/* Sections */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Sections ({selectedSections.length}/{sections.length})
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={selectAll}
                        className="text-xs"
                      >
                        Select all
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearAll}
                        className="text-xs"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={section.id}
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => toggleSection(section.id)}
                          className="mt-1"
                          aria-label={`Include ${section.name}`}
                        />
                        <Label
                          htmlFor={section.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {section.icon && <span className="text-sm">{section.icon}</span>}
                            <span className="font-medium text-sm">{section.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Panel (Desktop only) */}
                <Card className="p-4 bg-gray-50 hidden lg:block">
                  <h3 className="font-medium text-sm mb-3">Summary</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-600">Included sections:</span>
                      <span className="ml-2 font-medium">{selectedSections.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. length:</span>
                      <span className="ml-2 font-medium">{getEstimatedPages()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. calls:</span>
                      <span className="ml-2 font-medium">{selectedSections.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>

              {(mode === 'quick' || isWireframe) ? (
                <Button
                  onClick={handleQuickGenerate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate quick draft
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedSections.length === 0 && (
                    <span className="text-xs text-gray-500 mr-2">
                      Pick at least one section or switch to Quick draft.
                    </span>
                  )}
                  <Button
                    onClick={handleCustomGenerate}
                    disabled={selectedSections.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {selectedSections.length} sections
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review your selection</DialogTitle>
            <DialogDescription>
              You've selected {selectedSections.length} sections to generate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Included sections:</p>
              <ul className="space-y-1">
                {selectedSections.map(id => {
                  const section = sections.find(s => s.id === id)
                  return section ? (
                    <li key={id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{section.name}</span>
                    </li>
                  ) : null
                })}
              </ul>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Est. length: {getEstimatedPages()}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>
              Back
            </Button>
            <Button onClick={handleConfirmCustom} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Run now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}