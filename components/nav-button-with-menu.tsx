'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown } from 'lucide-react'
import { techSpecSections } from '@/lib/tech-spec-sections'

interface NavButtonWithMenuProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  documentType: string
  onSelect: (type: string, sections?: string[]) => void
  isSelected?: boolean
  className?: string
}

// Business Analysis subsections
const businessSections = [
  { id: 'executive-summary', name: 'Executive Summary', description: 'High-level overview for stakeholders' },
  { id: 'requirements', name: 'Requirements Analysis', description: 'Detailed business requirements' },
  { id: 'stakeholder-analysis', name: 'Stakeholder Analysis', description: 'Stakeholder mapping and concerns' },
  { id: 'risk-assessment', name: 'Risk Assessment', description: 'Risk analysis and mitigation' },
  { id: 'roi-analysis', name: 'ROI Analysis', description: 'Return on investment calculations' },
  { id: 'timeline', name: 'Timeline & Milestones', description: 'Project timeline and key dates' }
]

// Functional Spec subsections
const functionalSections = [
  { id: 'user-stories', name: 'User Stories', description: 'User stories with acceptance criteria' },
  { id: 'use-cases', name: 'Use Cases', description: 'Detailed use case scenarios' },
  { id: 'data-requirements', name: 'Data Requirements', description: 'Data models and structures' },
  { id: 'workflow', name: 'Workflow Design', description: 'Business process workflows' },
  { id: 'validation', name: 'Validation Rules', description: 'Input validation and business rules' },
  { id: 'integration', name: 'Integration Points', description: 'System integration requirements' }
]

// UX Design subsections
const uxSections = [
  { id: 'user-personas', name: 'User Personas', description: 'Target user profiles' },
  { id: 'journey-maps', name: 'Journey Maps', description: 'User journey and touchpoints' },
  { id: 'wireframes', name: 'Wireframes', description: 'Low-fidelity mockups' },
  { id: 'design-system', name: 'Design System', description: 'Colors, typography, components' },
  { id: 'accessibility', name: 'Accessibility', description: 'WCAG compliance and a11y' },
  { id: 'responsive', name: 'Responsive Design', description: 'Mobile and tablet layouts' }
]

// Architecture Diagram subsections
const architectureSections = [
  { id: 'system-overview', name: 'System Overview', description: 'High-level system diagram' },
  { id: 'component-diagram', name: 'Component Diagram', description: 'Component relationships' },
  { id: 'sequence-diagram', name: 'Sequence Diagram', description: 'Process flow sequences' },
  { id: 'data-flow', name: 'Data Flow', description: 'Data movement and processing' },
  { id: 'deployment', name: 'Deployment Diagram', description: 'Infrastructure and deployment' },
  { id: 'er-diagram', name: 'ER Diagram', description: 'Entity relationship models' }
]

export function NavButtonWithMenu({
  icon: Icon,
  label,
  color,
  documentType,
  onSelect,
  isSelected = false,
  className = ''
}: NavButtonWithMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get sections based on document type
  const getSections = () => {
    switch (documentType) {
      case 'business':
        return businessSections
      case 'functional':
        return functionalSections
      case 'technical':
        return Object.values(techSpecSections)
      case 'ux':
        return uxSections
      case 'mermaid':
        return architectureSections
      default:
        return []
    }
  }

  const sections = getSections()
  const hasSubsections = sections.length > 0

  useEffect(() => {
    // Initialize with default selections
    if (hasSubsections && selectedSections.length === 0) {
      if (documentType === 'technical') {
        setSelectedSections(['system-architecture'])
      } else if (sections.length > 0) {
        // Select first 3 sections by default for other types
        setSelectedSections(sections.slice(0, 3).map(s => s.id))
      }
    }
  }, [documentType])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleButtonClick = () => {
    if (!hasSubsections) {
      onSelect(documentType)
    } else {
      setIsOpen(!isOpen)
    }
  }

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId))
    } else {
      setSelectedSections([...selectedSections, sectionId])
    }
  }

  const handleConfirm = () => {
    onSelect(documentType, selectedSections)
    setIsOpen(false)
  }

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'essential':
        setSelectedSections(sections.slice(0, 3).map(s => s.id))
        break
      case 'comprehensive':
        setSelectedSections(sections.slice(0, 4).map(s => s.id))
        break
      case 'all':
        setSelectedSections(sections.map(s => s.id))
        break
      case 'minimal':
        setSelectedSections([sections[0]?.id].filter(Boolean))
        break
    }
  }

  const getSectionCountLabel = () => {
    if (selectedSections.length === 0) return ''
    if (selectedSections.length === sections.length) return 'All'
    return selectedSections.length.toString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={handleButtonClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full border-gray-200 hover:border-gray-300
          ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'}
          ${className}
        `}
      >
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {hasSubsections && (
          <>
            {getSectionCountLabel() && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {getSectionCountLabel()}
              </span>
            )}
            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      {isOpen && hasSubsections && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">{label} Options</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select what to include</p>
          </div>

          {/* Quick Presets */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => applyPreset('minimal')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Minimal
              </button>
              <button
                onClick={() => applyPreset('essential')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Essential
              </button>
              <button
                onClick={() => applyPreset('comprehensive')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Comprehensive
              </button>
              <button
                onClick={() => applyPreset('all')}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                All
              </button>
            </div>
          </div>

          {/* Section List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-2 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  {selectedSections.includes(section.id) && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{section.name}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {selectedSections.length} of {sections.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={selectedSections.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}