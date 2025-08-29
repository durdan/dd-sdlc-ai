'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronRight, FileText, Sparkles, Settings } from 'lucide-react'
import { businessAnalysisSections } from '@/lib/business-analysis-sections'
import { techSpecSections } from '@/lib/tech-spec-sections'
import { uxDesignSections } from '@/lib/ux-design-sections'
import { architectureSections } from '@/lib/architecture-sections'
import { functionalSpecSections } from '@/lib/functional-spec-sections'
import { testSpecSections } from '@/lib/test-spec-sections'

interface DocumentButtonWithSectionsProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  documentType: string
  onSelect: (type: string, sections?: string[]) => void
  hasPreviousDocument?: boolean
  className?: string
}

export function DocumentButtonWithSections({
  icon: Icon,
  label,
  color,
  documentType,
  onSelect,
  hasPreviousDocument = false,
  className = ''
}: DocumentButtonWithSectionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get sections based on document type
  const getSections = () => {
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
      case 'test':
        return Object.values(testSpecSections)
      default:
        return []
    }
  }

  const sections = getSections()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load saved selections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${documentType}Sections`)
    if (saved) {
      try {
        setSelectedSections(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved sections:', e)
      }
    }
  }, [documentType])

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
  }

  const toggleSection = (sectionId: string) => {
    const newSelection = selectedSections.includes(sectionId)
      ? selectedSections.filter(id => id !== sectionId)
      : [...selectedSections, sectionId]
    
    setSelectedSections(newSelection)
    localStorage.setItem(`${documentType}Sections`, JSON.stringify(newSelection))
  }

  const handleGenerateComprehensive = () => {
    // Generate with no specific sections (comprehensive doc)
    onSelect(documentType, [])
    setIsOpen(false)
  }

  const handleGenerateSelected = () => {
    if (selectedSections.length > 0) {
      onSelect(documentType, selectedSections)
      setIsOpen(false)
    }
  }

  const selectAll = () => {
    const allIds = sections.map(s => s.id)
    setSelectedSections(allIds)
    localStorage.setItem(`${documentType}Sections`, JSON.stringify(allIds))
  }

  const selectNone = () => {
    setSelectedSections([])
    localStorage.setItem(`${documentType}Sections`, JSON.stringify([]))
  }

  const selectPreset = (preset: 'essential' | 'detailed') => {
    let selected: string[] = []
    if (preset === 'essential') {
      // Select first 3 most important sections
      selected = sections.slice(0, 3).map(s => s.id)
    } else {
      // Select first 4 sections
      selected = sections.slice(0, 4).map(s => s.id)
    }
    setSelectedSections(selected)
    localStorage.setItem(`${documentType}Sections`, JSON.stringify(selected))
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleButtonClick}
        className={`relative group hover:border-indigo-400 hover:bg-indigo-50 transition-all ${className}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-medium">{label}</span>
          {hasPreviousDocument && (
            <Check className="h-3 w-3 text-green-600" />
          )}
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} />
                <h3 className="text-base font-semibold text-gray-900">{label}</h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {sections.length} sections available
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Choose generation mode: comprehensive document or specific sections
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleGenerateComprehensive}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Full Document
              </Button>
              <Button
                onClick={handleGenerateSelected}
                disabled={selectedSections.length === 0}
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Selected ({selectedSections.length})
              </Button>
            </div>
            
            {/* Preset Buttons */}
            <div className="flex gap-2 mt-3">
              <span className="text-xs text-gray-500 self-center">Presets:</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => selectPreset('essential')}
                className="text-xs"
              >
                Essential (3)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => selectPreset('detailed')}
                className="text-xs"
              >
                Detailed (4)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={selectAll}
                className="text-xs"
              >
                All ({sections.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={selectNone}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Section Selection */}
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Select Sections to Generate
            </div>
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                  {selectedSections.includes(section.id) ? (
                    <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-indigo-400 transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {section.icon && <span className="text-sm">{section.icon}</span>}
                    <span className="text-sm font-medium text-gray-900">
                      {section.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {section.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedSections.length === 0 ? (
                  <span>No sections selected - will generate full document</span>
                ) : (
                  <span>{selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={selectedSections.length > 0 ? handleGenerateSelected : handleGenerateComprehensive}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}