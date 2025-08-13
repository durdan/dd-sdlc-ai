'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronLeft, Plus, Settings2 } from 'lucide-react'
import { techSpecSections, type TechSpecSection } from '@/lib/tech-spec-sections'

interface TechSpecDropdownProps {
  selectedSections: string[]
  onSelectionChange: (sections: string[]) => void
  className?: string
}

export function TechSpecDropdown({ 
  selectedSections, 
  onSelectionChange,
  className = ''
}: TechSpecDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const allSections = Object.values(techSpecSections)

  const presets = [
    {
      id: 'full-stack',
      name: 'Full Stack',
      description: 'Complete architecture for web apps',
      sections: ['system-architecture', 'data-design', 'api-specifications', 'infrastructure-devops']
    },
    {
      id: 'api-first',
      name: 'API First',
      description: 'API and data focused design',
      sections: ['api-specifications', 'data-design', 'security-architecture']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Enterprise-grade with security',
      sections: ['system-architecture', 'security-architecture', 'infrastructure-devops', 'performance-scale']
    },
    {
      id: 'startup-mvp',
      name: 'Startup MVP',
      description: 'Lean spec for rapid development',
      sections: ['system-architecture', 'api-specifications']
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowPresets(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSelectionChange(selectedSections.filter(id => id !== sectionId))
    } else {
      onSelectionChange([...selectedSections, sectionId])
    }
  }

  const applyPreset = (presetSections: string[]) => {
    onSelectionChange(presetSections)
    setShowPresets(false)
  }

  const getButtonLabel = () => {
    if (selectedSections.length === 0) {
      return 'Select focus areas'
    } else if (selectedSections.length === 1) {
      const section = allSections.find(s => s.id === selectedSections[0])
      return section?.name || 'Custom'
    } else if (selectedSections.length === allSections.length) {
      return 'All sections'
    } else {
      return `${selectedSections.length} sections`
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-normal h-9 px-3 hover:bg-gray-50 border-gray-200"
      >
        <Settings2 className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">{getButtonLabel()}</span>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {!showPresets ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Technical Focus Areas</span>
                  <button
                    onClick={() => setShowPresets(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Presets
                  </button>
                </div>
              </div>

              {/* Section List */}
              <div className="max-h-96 overflow-y-auto">
                {allSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                      {selectedSections.includes(section.id) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{section.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{section.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectionChange([])}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Clear all
                </button>
                <button
                  onClick={() => onSelectionChange(allSections.map(s => s.id))}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Select all
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Presets View */}
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => setShowPresets(false)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="font-medium">Quick Presets</span>
                </button>
              </div>

              <div className="p-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.sections)}
                    className="w-full px-3 py-3 rounded-md hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{preset.description}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preset.sections.map(sectionId => {
                        const section = allSections.find(s => s.id === sectionId)
                        return section ? (
                          <span key={sectionId} className="text-xs text-gray-600">
                            {section.icon}
                          </span>
                        ) : null
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}